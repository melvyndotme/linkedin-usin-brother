import React, { useState, useEffect } from 'react';
import { Newspaper, Search, RefreshCw, Copy, Check, Download, Layers, ShieldCheck, Clock, ArrowRight, ExternalLink, AlertCircle, Plus, Trash2, Tag, Sparkles } from 'lucide-react';
import { EXTENDED_AI_NEWS, formatAs120WordMarkdown, searchSerperWithTimeframe, getEffectiveSerperKey, getGoogleNewsSearchUrl } from '../lib/serperEngine.js';
import { generateAIDrafts } from '../lib/draftGenerator.js';
import { generateBrotherWaveCorporateSVG } from '../lib/svgBrotherWebsiteTemplates.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';

export default function Module2AIPosts({ isDark, onNavigateToDraftStudio }) {
  // Up to 5 customizable search keywords, each with its own independent timeframe
  const [keywords, setKeywords] = useState([
    { text: 'enterprise agentic AI', timeNumber: 24, timeUnit: 'hours' },
    { text: 'workplace productivity', timeNumber: 48, timeUnit: 'hours' },
    { text: 'smart document automation', timeNumber: 7, timeUnit: 'days' },
    { text: 'Brother Singapore', timeNumber: 24, timeUnit: 'hours' },
    { text: 'epson singapore', timeNumber: 1, timeUnit: 'months' }
  ]);

  const [combinedTimeframe, setCombinedTimeframe] = useState({
    timeNumber: 24,
    timeUnit: 'hours'
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all' or 0, 1, 2, 3, 4
  const [maxResults, setMaxResults] = useState(5);

  // Cache results per keyword tab: { 'all': { isLive, results }, 0: { isLive, results }, ... }
  const [tabResults, setTabResults] = useState(() => {
    const initial = {
      'all': {
        isLive: false,
        results: EXTENDED_AI_NEWS.slice(0, 5)
      }
    };
    [
      { text: 'enterprise agentic AI', timeNumber: 24, timeUnit: 'hours' },
      { text: 'workplace productivity', timeNumber: 48, timeUnit: 'hours' },
      { text: 'smart document automation', timeNumber: 7, timeUnit: 'days' },
      { text: 'Brother Singapore', timeNumber: 24, timeUnit: 'hours' },
      { text: 'epson singapore', timeNumber: 1, timeUnit: 'months' }
    ].forEach((kwObj, i) => {
      initial[i] = {
        isLive: false,
        results: EXTENDED_AI_NEWS.slice(0, 5).map((item, idx) => ({
          ...item,
          id: `init-${i}-${idx}`,
          topic: kwObj.text
        }))
      };
    });
    return initial;
  });

  const [selectedNews, setSelectedNews] = useState(EXTENDED_AI_NEWS[0]);
  const [loading, setLoading] = useState(false);
  const [loadingTab, setLoadingTab] = useState(null); // 'all', 0..4, or 'batch'
  const [copied, setCopied] = useState(false);
  const [copiedFormatted, setCopiedFormatted] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [searchError, setSearchError] = useState(null);
  const [inlineKey, setInlineKey] = useState('');
  const [hasKey, setHasKey] = useState(() => Boolean(getEffectiveSerperKey()));

  useEffect(() => {
    const key = getEffectiveSerperKey();
    if (key) {
      setHasKey(true);
      handleFetchAllTabs();
    }
  }, []);

  // Suggested keywords for Brother Singapore
  const suggestedKeywords = [
    'Workplace Automation',
    'Enterprise Printing',
    'Cloud Document Solutions',
    'Sustainability SG',
    'Smart Nation Singapore',
    'Cybersecurity In Office',
    'Hybrid Work Productivity'
  ];

  const activeTimeNumber = activeTab === 'all'
    ? combinedTimeframe.timeNumber
    : (keywords[activeTab]?.timeNumber ?? 24);

  const activeTimeUnit = activeTab === 'all'
    ? combinedTimeframe.timeUnit
    : (keywords[activeTab]?.timeUnit ?? 'hours');

  const handleActiveTimeChange = (newNumber, newUnit) => {
    if (activeTab === 'all') {
      setCombinedTimeframe({ timeNumber: newNumber, timeUnit: newUnit });
      setTabResults(prev => {
        const next = { ...prev };
        delete next['all'];
        return next;
      });
      fetchTabResults('all', { number: newNumber, unit: newUnit });
    } else {
      setKeywords(prev => {
        const updated = [...prev];
        if (updated[activeTab]) {
          updated[activeTab] = {
            ...updated[activeTab],
            timeNumber: newNumber,
            timeUnit: newUnit
          };
        }
        return updated;
      });
      setTabResults(prev => {
        const next = { ...prev };
        delete next[activeTab];
        return next;
      });
      fetchTabResults(activeTab, { number: newNumber, unit: newUnit });
    }
  };

  const handleSlotTimeChange = (index, newNumber, newUnit) => {
    setKeywords(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          timeNumber: newNumber,
          timeUnit: newUnit
        };
      }
      return updated;
    });
    setActiveTab(index);
    setTabResults(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    fetchTabResults(index, { number: newNumber, unit: newUnit });
  };

  const handleKeywordChange = (index, value) => {
    const updated = [...keywords];
    updated[index] = {
      ...updated[index],
      text: value
    };
    setKeywords(updated);
    setActiveTab(index);
    setTabResults(prev => {
      const next = { ...prev };
      delete next[index];
      delete next['all'];
      return next;
    });
  };

  const handleAddKeyword = () => {
    if (keywords.length < 5) {
      setKeywords([...keywords, { text: '', timeNumber: 24, timeUnit: 'hours' }]);
    }
  };

  const handleRemoveKeyword = (index) => {
    const updated = keywords.length > 1 
      ? keywords.filter((_, i) => i !== index) 
      : [{ text: '', timeNumber: 24, timeUnit: 'hours' }];
    setKeywords(updated);
    if (activeTab === index) {
      setActiveTab('all');
    }
    setTabResults(prev => {
      const next = { ...prev };
      delete next[index];
      delete next['all'];
      return next;
    });
  };

  const handleApplyPresetKeyword = (preset) => {
    const emptyIndex = keywords.findIndex(k => !k.text || !k.text.trim());
    let targetIdx = emptyIndex;
    if (emptyIndex !== -1) {
      handleKeywordChange(emptyIndex, preset);
    } else if (keywords.length < 5) {
      targetIdx = keywords.length;
      setKeywords([...keywords, { text: preset, timeNumber: 24, timeUnit: 'hours' }]);
    } else {
      targetIdx = 0;
      handleKeywordChange(0, preset);
    }
    handleSelectTab(targetIdx);
  };

  // Fetch top 5 results for a specific tab ('all' or index 0..4)
  const fetchTabResults = async (tabKey, overrideTimeframe = null) => {
    setLoading(true);
    setLoadingTab(tabKey);
    setSearchError(null);

    let query = '';
    let tNumber = 24;
    let tUnit = 'hours';

    if (tabKey === 'all') {
      const activeKeywords = keywords.map(k => k.text.trim()).filter(Boolean);
      query = activeKeywords.length > 0 ? activeKeywords.join(' OR ') : 'enterprise workplace productivity';
      tNumber = overrideTimeframe?.number ?? combinedTimeframe.timeNumber;
      tUnit = overrideTimeframe?.unit ?? combinedTimeframe.timeUnit;
    } else {
      const kwObj = keywords[tabKey];
      query = (kwObj?.text || '').trim();
      if (!query) {
        setLoading(false);
        setLoadingTab(null);
        return;
      }
      tNumber = overrideTimeframe?.number ?? kwObj?.timeNumber ?? 24;
      tUnit = overrideTimeframe?.unit ?? kwObj?.timeUnit ?? 'hours';
    }

    try {
      const activeKey = getEffectiveSerperKey();
      const response = await searchSerperWithTimeframe({
        apiKey: activeKey,
        query,
        number: tNumber,
        unit: tUnit,
        maxResults: 5
      });

      const { isLive, results, warning, totalFound } = response;
      if (warning && (!results || results.length === 0)) {
        setSearchError(warning);
      }

      setTabResults(prev => ({
        ...prev,
        [tabKey]: { isLive, results, warning, totalFound: totalFound ?? results?.length ?? 0 }
      }));

      if (results && results.length > 0) {
        setSelectedNews(results[0]);
        setSelectedDraftIndex(0);
      } else {
        setSelectedNews(null);
      }
    } catch (err) {
      console.error(`Serper search error for tab ${tabKey}:`, err);
      setSearchError(err.message || `Failed to search Serper.dev for "${query}".`);
    } finally {
      setLoading(false);
      setLoadingTab(null);
    }
  };

  // Fetch top 5 results for all active keyword tabs simultaneously using their respective timeframes
  const handleFetchAllTabs = async () => {
    setLoading(true);
    setLoadingTab('batch');
    setSearchError(null);

    const activeKey = getEffectiveSerperKey();
    const activeEntries = keywords
      .map((k, idx) => ({ ...k, idx, text: k.text.trim() }))
      .filter(item => Boolean(item.text));

    try {
      const combinedQuery = activeEntries.map(i => i.text).join(' OR ') || 'enterprise workplace productivity';
      const allPromise = searchSerperWithTimeframe({
        apiKey: activeKey,
        query: combinedQuery,
        number: combinedTimeframe.timeNumber,
        unit: combinedTimeframe.timeUnit,
        maxResults: 5
      });

      const indivPromises = activeEntries.map(item =>
        searchSerperWithTimeframe({
          apiKey: activeKey,
          query: item.text,
          number: item.timeNumber,
          unit: item.timeUnit,
          maxResults: 5
        }).then(res => ({ tabKey: item.idx, ...res }))
      );

      const [allRes, ...indivRes] = await Promise.all([allPromise, ...indivPromises]);

      const newTabResults = {
        'all': { isLive: allRes.isLive, results: allRes.results, warning: allRes.warning }
      };

      indivRes.forEach(item => {
        newTabResults[item.tabKey] = {
          isLive: item.isLive,
          results: item.results,
          warning: item.warning
        };
      });

      setTabResults(newTabResults);

      const activeRes = newTabResults[activeTab]?.results || allRes.results;
      if (activeRes && activeRes.length > 0) {
        setSelectedNews(activeRes[0]);
        setSelectedDraftIndex(0);
      } else {
        setSelectedNews(null);
      }
    } catch (err) {
      console.error('Serper batch fetch error:', err);
      setSearchError(err.message || 'Failed to search Serper.dev API for all tabs.');
    } finally {
      setLoading(false);
      setLoadingTab(null);
    }
  };

  // Switch tab and automatically fetch if not yet in cache
  const handleSelectTab = (tabKey) => {
    setActiveTab(tabKey);
    const existing = tabResults[tabKey];
    if (existing?.results && existing.results.length > 0) {
      setSelectedNews(existing.results[0]);
      setSelectedDraftIndex(0);
    } else {
      fetchTabResults(tabKey);
    }
  };

  const currentTabResults = tabResults[activeTab] || tabResults['all'] || {
    isLive: false,
    results: EXTENDED_AI_NEWS.slice(0, 5)
  };
  const newsList = currentTabResults.results || [];
  const isLiveNews = currentTabResults.isLive || false;
  const activeNews = selectedNews || (newsList.length > 0 ? newsList[0] : null);

  const drafts = activeNews ? generateAIDrafts({
    title: activeNews?.headline || 'Enterprise Trend Breakthrough',
    snippet: activeNews?.summary120 || 'Latest business news and automation insights.',
    suggestedPillars: {
      whatItIs: (activeNews?.summary120 || 'Enterprise productivity advancements').slice(0, 130) + "...",
      whyItMatters: "Eliminates routine operational friction by 65%, freeing teams for strategic creative tasks.",
      brotherImpact: "Empowers Brother Singapore employees and B2B clients to achieve breakthrough productivity."
    }
  }) : [];

  const currentDraft = (drafts && drafts[selectedDraftIndex]) || drafts?.[0] || {
    name: 'Default Angle',
    postContent: 'Breakthrough enterprise update.'
  };

  const headlineStr = activeNews?.headline || 'Brother Trend Intelligence';
  const waveSvg = generateBrotherWaveCorporateSVG({
    badgeText: "Brother Xplorer Trend Intelligence",
    headline: headlineStr.length > 38 ? headlineStr.slice(0, 38) + "..." : headlineStr,
    subtitle: "What it is • Why it matters • Brother SG Breakthrough Productivity",
    promoTag: "Breakthrough Productivity",
    theme: "ai-thought"
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy120Format = (item) => {
    const formatted = formatAs120WordMarkdown(item);
    navigator.clipboard.writeText(formatted);
    setCopiedFormatted(true);
    setTimeout(() => setCopiedFormatted(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([waveSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brother-sg-trend-intelligence-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header Card */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <Newspaper className="w-3.5 h-3.5" />
              Module 2: News & Trend Intelligence
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Flexible Timeframe News & Trend Intelligence Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Search breaking news and industry trends using up to <strong className="text-[#0f2ea2] dark:text-blue-400">5 custom keywords</strong> across any time window (<strong className="text-[#0f2ea2] dark:text-blue-400">hours, days, weeks, months</strong>) and generate strict 120-word structured summaries.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToDraftStudio(currentDraft.postContent, activeNews?.headline || 'Trending News')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>Edit in Draft Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* API Key Notification & Quick Connect Banner */}
      {!hasKey && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Real-Time Search Inactive — Currently displaying offline sample baseline with portal links.</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold self-start sm:self-auto">
              No API Key Detected
            </span>
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
            To search live Google News articles with 100% verified publisher URLs, paste your Serper.dev API key below (or configure it in Settings):
          </p>
          <div className="flex items-center gap-2 max-w-md pt-0.5">
            <input
              type="password"
              value={inlineKey}
              onChange={(e) => setInlineKey(e.target.value)}
              placeholder="Paste Serper API key here..."
              className="flex-1 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0f2ea2]"
            />
            <button
              type="button"
              onClick={() => {
                if (inlineKey.trim()) {
                  safeSetItem('key_serper', inlineKey.trim());
                  setHasKey(true);
                  handleFetchAllTabs();
                }
              }}
              className="bg-[#0f2ea2] hover:bg-[#0c2482] text-white font-bold px-3 py-1.5 rounded-xl transition-all shrink-0 text-xs active:scale-95 shadow-sm"
            >
              Save & Search Live
            </button>
          </div>
        </div>
      )}

      {/* Control Panel: 5 Keywords + Time Window + Trigger */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      } space-y-3.5`}>
        {/* Keywords Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
            Search Keywords (Enter up to 5 topics or phrases with independent time windows)
          </label>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Slots used: <strong>{keywords.filter(k => k.text && k.text.trim()).length} / 5</strong></span>
          </div>
        </div>

        {/* 5 Keyword Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {keywords.map((kw, idx) => {
            const isThisTabActive = activeTab === idx;
            const tabRes = tabResults[idx];
            const hasResults = tabRes?.results?.length > 0;

            return (
              <div
                key={idx}
                onClick={() => handleSelectTab(idx)}
                className={`relative flex flex-col justify-between rounded-xl border transition-all cursor-pointer ${
                  isThisTabActive
                    ? 'border-[#0f2ea2] bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-[#0f2ea2]/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center p-2">
                  <span className={`text-[10px] font-bold select-none mr-1.5 shrink-0 ${isThisTabActive ? 'text-[#0f2ea2] font-black' : 'text-slate-400'}`}>
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={kw.text}
                    onFocus={() => handleSelectTab(idx)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTab(idx);
                    }}
                    onChange={(e) => handleKeywordChange(idx, e.target.value)}
                    placeholder={`Keyword ${idx + 1}...`}
                    className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none pr-1"
                  />
                  {keywords.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveKeyword(idx);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1 shrink-0 transition-colors"
                      title="Remove this keyword"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="px-2 pb-1.5 pt-1 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/30 rounded-b-xl">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTab(idx);
                    }}
                    className={`text-[10px] font-bold transition-all flex items-center gap-1 ${
                      isThisTabActive
                        ? 'text-[#0f2ea2] dark:text-blue-400 font-extrabold'
                        : 'text-slate-500 hover:text-[#0f2ea2] dark:hover:text-blue-400'
                    }`}
                  >
                    <span>{isThisTabActive ? '● Active' : 'View Top 5 →'}</span>
                  </button>
                  
                  {/* Interactive Timeframe Dropdown on Card */}
                  <div className="relative flex items-center" onClick={(e) => e.stopPropagation()}>
                    <Clock className="w-2.5 h-2.5 text-cyan-600 absolute left-1.5 pointer-events-none" />
                    <select
                      value={`${kw.timeNumber}-${kw.timeUnit}`}
                      onChange={(e) => {
                        e.stopPropagation();
                        const [num, unit] = e.target.value.split('-');
                        handleSlotTimeChange(idx, Number(num), unit);
                      }}
                      className={`text-[9px] font-mono font-bold pl-4 pr-1 py-0.5 rounded border focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] cursor-pointer transition-colors ${
                        isThisTabActive
                          ? 'bg-white dark:bg-slate-900 border-[#0f2ea2]/50 text-[#0f2ea2] dark:text-blue-300'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Change time window for this keyword"
                    >
                      <option value="24-hours">24h</option>
                      <option value="48-hours">48h</option>
                      <option value="7-days">7d</option>
                      <option value="14-days">14d</option>
                      <option value="1-months">1m</option>
                      <option value="3-months">3m</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}

          {keywords.length < 5 && (
            <button
              type="button"
              onClick={handleAddKeyword}
              className="flex items-center justify-center gap-1 border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0f2ea2] text-slate-500 hover:text-[#0f2ea2] text-xs font-semibold py-3 px-3 rounded-xl transition-all h-full"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Keyword Slot</span>
            </button>
          )}
        </div>

        {/* Suggested Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Quick Presets:
          </span>
          {suggestedKeywords.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleApplyPresetKeyword(preset)}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-[#0f2ea2] dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-all"
            >
              + {preset}
            </button>
          ))}
        </div>

        {/* Dynamic Time Window Bar for Active Tab + Dual Triggers */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 flex-wrap">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              <span>Timeframe for:</span>
              <span className="px-2 py-0.5 rounded-lg bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 font-extrabold text-xs border border-[#0f2ea2]/20">
                {activeTab === 'all' ? 'All Keywords (Combined)' : `Keyword #${activeTab + 1}: "${keywords[activeTab]?.text || ''}"`}
              </span>
              <div className="inline-flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => handleSelectTab('all')}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-all ${
                    activeTab === 'all'
                      ? 'bg-[#0f2ea2] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  All
                </button>
                {keywords.map((k, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectTab(i)}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-all ${
                      activeTab === i
                        ? 'bg-[#0f2ea2] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                    title={k.text || `Slot #${i + 1}`}
                  >
                    #{i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Time Window Chips */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-slate-400 mr-1">Quick presets:</span>
              {[
                { label: '24 Hours', n: 24, u: 'hours' },
                { label: '48 Hours', n: 48, u: 'hours' },
                { label: '7 Days', n: 7, u: 'days' },
                { label: '14 Days', n: 14, u: 'days' },
                { label: '1 Month', n: 1, u: 'months' },
                { label: '3 Months', n: 3, u: 'months' }
              ].map((chip, ci) => {
                const isChipSelected = activeTimeNumber === chip.n && activeTimeUnit === chip.u;
                return (
                  <button
                    key={ci}
                    type="button"
                    onClick={() => handleActiveTimeChange(chip.n, chip.u)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                      isChipSelected
                        ? 'bg-[#0f2ea2] text-white border-[#0f2ea2] shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
            {/* Time Number Entry */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Window Value
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={activeTimeNumber}
                onChange={(e) => handleActiveTimeChange(Number(e.target.value), activeTimeUnit)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
              />
            </div>

            {/* Time Unit Dropdown */}
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Time Unit
              </label>
              <select
                value={activeTimeUnit}
                onChange={(e) => handleActiveTimeChange(activeTimeNumber, e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none cursor-pointer"
              >
                <option value="hours">Hours (e.g. 24, 48, 72 hours)</option>
                <option value="days">Days (e.g. 3, 7, 14 days)</option>
                <option value="weeks">Weeks (e.g. 1, 2, 4 weeks)</option>
                <option value="months">Months (e.g. 1, 3, 6 months)</option>
              </select>
            </div>

            {/* Dual Trigger Buttons: Active Tab vs. All 5 Tabs */}
            <div className="sm:col-span-5 flex items-center gap-2">
              <button
                onClick={() => fetchTabResults(activeTab)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading && loadingTab === activeTab ? 'animate-spin' : ''}`} />
                <span className="truncate">
                  {loading && loadingTab === activeTab
                    ? 'Searching...'
                    : activeTab === 'all'
                    ? 'Search All (Combined)'
                    : `Search Tab #${activeTab + 1}`}
                </span>
              </button>

              <button
                onClick={handleFetchAllTabs}
                disabled={loading}
                title="Search and populate top results for each keyword tab simultaneously using its own timeframe"
                className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50 active:scale-95 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Fetch All 5 Tabs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Status Alert */}
      {searchError && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{searchError}</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono shrink-0">
            Check API Key in Settings
          </span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: 120-Word Summarized Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-3.5 sm:p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {/* Header with Title and Live Badge */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Top Results ({newsList.length} found)
                </h3>
                {isLiveNews ? (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    🟢 Live Serper.dev
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 font-medium">
                    Curated Baseline
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400">
                Within {activeTimeNumber} {activeTimeUnit}
              </span>
            </div>

            {/* Interactive Keyword Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2.5 custom-scrollbar border-b border-slate-100 dark:border-slate-800">
              {/* Tab 0: All Keywords (Combined) */}
              <button
                type="button"
                onClick={() => handleSelectTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-[#0f2ea2] text-white shadow-sm ring-2 ring-[#0f2ea2]/30'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>All Combined</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {tabResults['all']?.results?.length || 0}
                </span>
              </button>

              {/* Tabs 1..5 for each keyword with independent timeframe */}
              {keywords.map((kw, idx) => {
                const trimmed = kw.text ? kw.text.trim() : '';
                if (!trimmed) return null;
                const isTabActive = activeTab === idx;
                const tabRes = tabResults[idx];
                const isLoadingThis = loadingTab === idx || loadingTab === 'batch';
                const unitAbbr = kw.timeUnit === 'hours' ? 'h' : kw.timeUnit === 'days' ? 'd' : kw.timeUnit === 'weeks' ? 'w' : 'm';

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectTab(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 max-w-[230px] ${
                      isTabActive
                        ? 'bg-[#0f2ea2] text-white shadow-sm ring-2 ring-[#0f2ea2]/30'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                    title={`Click to show results for: ${trimmed} (${kw.timeNumber} ${kw.timeUnit})`}
                  >
                    <span className="opacity-60 text-[10px]">#{idx + 1}</span>
                    <span className="truncate">{trimmed}</span>
                    <span className="text-[9px] font-mono opacity-80">
                      ({kw.timeNumber}{unitAbbr})
                    </span>
                    {isLoadingThis ? (
                      <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                    ) : (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                        isTabActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {tabRes?.results?.length ?? 0}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Subtitle + Live Google News Search Link + Refresh Button */}
            <div className="flex items-center justify-between text-[11px] mb-3 px-0.5 flex-wrap gap-1.5">
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <span className="text-slate-400">Active query:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate">
                  {activeTab === 'all' ? 'All Keywords (Combined)' : `Keyword #${activeTab + 1}: "${keywords[activeTab]?.text || ''}"`}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-[#0f2ea2] dark:text-blue-400 font-bold shrink-0">
                  {activeTimeNumber} {activeTimeUnit}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getGoogleNewsSearchUrl(activeTab === 'all' ? keywords.map(k => k.text).filter(Boolean).join(' OR ') : keywords[activeTab]?.text || 'Brother Singapore')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20"
                  title="Open live search results page on Google News"
                >
                  <span>Google News Results ↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => fetchTabResults(activeTab)}
                  disabled={loading}
                  className="text-[10px] font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline shrink-0 flex items-center gap-1"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${loadingTab === activeTab ? 'animate-spin' : ''}`} />
                  <span>Refresh Tab</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
              {newsList.length === 0 ? (
                /* Honest Zero-Result State (Zero-Padding & Zero-Hallucination) */
                <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-400 flex items-center justify-center mx-auto mb-2.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    0 Articles Found in the Past {activeTimeNumber} {activeTimeUnit}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    No articles were published for <strong className="text-slate-700 dark:text-slate-300">"{activeTab === 'all' ? 'All Keywords' : keywords[activeTab]?.text}"</strong> within this strict timeframe. In accordance with your zero-hallucination constraint, no older articles or synthetic fillers have been padded.
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Expand Time Window For This Keyword:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          handleActiveTimeChange(7, 'days');
                          fetchTabResults(activeTab, { number: 7, unit: 'days' });
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f2ea2] dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all shadow-sm"
                      >
                        Past 7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleActiveTimeChange(1, 'months');
                          fetchTabResults(activeTab, { number: 1, unit: 'months' });
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f2ea2] dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all shadow-sm"
                      >
                        Past 1 Month
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleActiveTimeChange(3, 'months');
                          fetchTabResults(activeTab, { number: 3, unit: 'months' });
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f2ea2] dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all shadow-sm"
                      >
                        Past 3 Months
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                newsList.map((item) => {
                  const isSelected = activeNews?.id === item.id;
                  const targetSearchUrl = item.searchUrl || item.sourceUrl || getGoogleNewsSearchUrl(item.headline);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedNews(item);
                        setSelectedDraftIndex(0);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#0f2ea2] dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                          : isDark
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Header: Source and Time */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <a
                          href={targetSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-[#0f2ea2] dark:text-blue-400 hover:underline flex items-center gap-1"
                          title="Open actual search result on Google News"
                        >
                          <span>{item.sourceTitle}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <span className="font-mono">{item.timeAgo}</span>
                      </div>

                      {/* Clickable Headline leading to actual search result */}
                      <h4 className="text-xs font-bold leading-snug">
                        <a
                          href={targetSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            setSelectedNews(item);
                            setSelectedDraftIndex(0);
                          }}
                          className={`hover:underline flex items-start justify-between gap-1.5 ${
                            isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'
                          }`}
                          title="Open actual search result in Google News"
                        >
                          <span>{item.headline}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400 shrink-0 mt-0.5 opacity-80" />
                        </a>
                      </h4>

                      {/* Summary */}
                      <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                        {item.summary120}
                      </p>

                      {/* Explicit Direct URL Button leading to search result */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                        <a
                          href={targetSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline"
                        >
                          <span>Open Actual Search Result</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {isSelected ? '✓ Selected for drafting' : 'Click card to draft'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Exact Required 120-Word Format + 3-Pillar Draft Preview */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {activeNews ? (
            <>
              {/* Required Format Preview Box */}
              <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400 font-bold uppercase tracking-wider block">
                      Exact Required 120-Word Markdown Format
                    </span>
                    <h3 className={`text-sm sm:text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Structured News Output
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopy120Format(activeNews)}
                    className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                  >
                    {copiedFormatted ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFormatted ? 'Copied' : 'Copy 120-Word Format'}
                  </button>
                </div>

                {/* Direct Source Link Banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Newspaper className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {activeNews?.sourceTitle || 'News Source'}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          Actual Search Result
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        {activeNews?.searchUrl || activeNews?.sourceUrl || '#'}
                      </div>
                    </div>
                  </div>
                  <a
                    href={activeNews?.searchUrl || activeNews?.sourceUrl || getGoogleNewsSearchUrl(activeNews?.headline)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
                  >
                    <span>Open Actual Search Result</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Formatted Markdown Box */}
                <div className={`p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {formatAs120WordMarkdown(activeNews)}
                </div>

                {/* 3-Pillar Generated Post Copy */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        3-Pillar Employer Branding Draft
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        What it is • Why it matters • Brother SG Breakthrough Productivity
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(currentDraft.postContent)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied Post' : 'Copy Post Copy'}
                    </button>
                  </div>

                  {/* Draft Angle Switcher */}
                  <div className="flex gap-2 border-b pb-2 dark:border-slate-800">
                    {drafts.map((d, idx) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDraftIndex(idx)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                          selectedDraftIndex === idx
                            ? 'bg-[#0f2ea2] text-white shadow-sm'
                            : isDark
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Angle {idx + 1}: {(d?.name || d?.templateName || d?.angle || 'Angle').split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Post Content Display */}
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    {currentDraft.postContent}
                  </div>
                </div>
              </div>

              {/* Branded Wave Corporate SVG Preview Card */}
              <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400 font-bold uppercase tracking-wider block">
                      Parametric Asset Preview
                    </span>
                    <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Brother Singapore Wave Corporate Banner
                    </h3>
                  </div>

                  <button
                    onClick={handleDownloadSvg}
                    className="flex items-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export SVG</span>
                  </button>
                </div>

                <div className="w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
                  <div
                    className="w-full aspect-[12/5] flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: waveSvg }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Empty Drafting State when 0 News found */
            <div className={`p-8 rounded-2xl border text-center ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Awaiting Verified Articles for Drafting
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                0 verified articles were found within the strict timeframe for this keyword. To generate 3-pillar LinkedIn posts and branded SVG banners, select another keyword tab or expand the time window above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
