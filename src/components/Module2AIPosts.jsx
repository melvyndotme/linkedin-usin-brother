import React, { useState, useEffect, useRef } from 'react';
import { Newspaper, Search, RefreshCw, Copy, Check, Download, Layers, ShieldCheck, Clock, ArrowRight, ExternalLink, AlertCircle, Plus, Trash2, Sparkles, Database, X } from 'lucide-react';
import { EXTENDED_AI_NEWS, formatAs120WordMarkdown, searchSerperWithTimeframe, getEffectiveSerperKey, getGoogleNewsSearchUrl } from '../lib/serperEngine.js';
import { generateAIDrafts } from '../lib/draftGenerator.js';
import { generateBrotherWaveCorporateSVG } from '../lib/svgBrotherWebsiteTemplates.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';

export default function Module2AIPosts({ isDark, onNavigateToDraftStudio, onNavigateToSettings }) {
  const searchInputRef = useRef(null);
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
  const [hasKey, setHasKey] = useState(() => Boolean(getEffectiveSerperKey()));

  useEffect(() => {
    const key = getEffectiveSerperKey();
    if (key) {
      setHasKey(true);
      handleFetchAllTabs();
    }
  }, []);

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

  // Fetch top 5 results for a specific tab ('all' or index 0..4)
  const fetchTabResults = async (tabKey, overrideTimeframe = null) => {
    if (tabKey === 'all') {
      return handleFetchAllTabs();
    }

    setLoading(true);
    setLoadingTab(tabKey);
    setSearchError(null);

    const kwObj = keywords[tabKey];
    const query = (kwObj?.text || '').trim();
    if (!query) {
      setLoading(false);
      setLoadingTab(null);
      return;
    }
    const tNumber = overrideTimeframe?.number ?? kwObj?.timeNumber ?? 24;
    const tUnit = overrideTimeframe?.unit ?? kwObj?.timeUnit ?? 'hours';

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
      // Never flag a legitimate 0-result search as an API failure error
      setSearchError(null);

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
      const indivPromises = activeEntries.map(item =>
        searchSerperWithTimeframe({
          apiKey: activeKey,
          query: item.text,
          number: item.timeNumber,
          unit: item.timeUnit,
          maxResults: 5
        }).then(res => ({ tabKey: item.idx, ...res }))
      );

      const indivRes = await Promise.all(indivPromises);

      // Aggregate top live articles from active tabs so "All Combined" showcases live articles from every tab
      const aggregatedFromTabs = [];
      const seenTitles = new Set();
      indivRes.forEach(item => {
        (item.results || []).forEach(r => {
          if (r.headline && !seenTitles.has(r.headline)) {
            seenTitles.add(r.headline);
            aggregatedFromTabs.push(r);
          }
        });
      });

      const finalAllResults = aggregatedFromTabs.slice(0, 5);

      const newTabResults = {
        'all': {
          isLive: indivRes.some(r => r.isLive),
          results: finalAllResults,
          warning: null,
          totalFound: finalAllResults.length
        }
      };

      indivRes.forEach(item => {
        newTabResults[item.tabKey] = {
          isLive: item.isLive,
          results: item.results,
          warning: item.warning,
          totalFound: item.totalFound ?? item.results?.length ?? 0
        };
      });

      setTabResults(newTabResults);

      const activeRes = newTabResults[activeTab]?.results || finalAllResults;
      if (activeRes && activeRes.length > 0) {
        setSelectedNews(activeRes[0]);
        setSelectedDraftIndex(0);
      } else {
        setSelectedNews(null);
      }
    } catch (err) {
      console.error('Serper batch fetch error:', err);
      setSearchError(err.message || 'Failed to search Serper.dev API.');
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

  const baseDrafts = activeNews ? generateAIDrafts({
    title: activeNews?.headline || 'Enterprise Trend Breakthrough',
    snippet: activeNews?.summary120 || 'Latest business news and automation insights.',
    suggestedPillars: {
      whatItIs: (activeNews?.summary120 || 'Enterprise productivity advancements').slice(0, 130) + "...",
      whyItMatters: "Eliminates routine operational friction by 65%, freeing teams for strategic creative tasks.",
      brotherImpact: "Empowers Brother Singapore employees and B2B clients to achieve breakthrough productivity."
    }
  }) : [];

  const drafts = baseDrafts;

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
              News & Trend Intelligence
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              News & Trend Search Engine
            </h2>
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

      {/* Offline baseline notice pointing to Settings */}
      {!hasKey && (
        <div className={`p-3.5 sm:p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Real-Time Search Inactive — Currently displaying curated baseline. Connect Google Search in <strong>Integrations</strong> to enable live Google News tracking.
            </span>
          </div>
          {onNavigateToSettings && (
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white font-bold text-xs shrink-0 transition-all active:scale-95 shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <span>Open Integrations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Sleek Search & Intelligence Console */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      } space-y-3.5`}>
        
        {/* Top Search Bar with Integrated Timeframe & Search Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={activeTab === 'all' ? '' : (keywords[activeTab]?.text || '')}
              onChange={(e) => {
                if (activeTab === 'all') {
                  const emptyIdx = keywords.findIndex(k => !k.text || !k.text.trim());
                  const target = emptyIdx !== -1 ? emptyIdx : 0;
                  handleKeywordChange(target, e.target.value);
                  setActiveTab(target);
                } else {
                  handleKeywordChange(activeTab, e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (activeTab === 'all') {
                    handleFetchAllTabs();
                  } else {
                    fetchTabResults(activeTab);
                  }
                }
              }}
              placeholder={
                activeTab === 'all'
                  ? "Select a topic below to edit, or type to create and search..."
                  : `Search news for Topic #${activeTab + 1}...`
              }
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-[#0f2ea2]'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#0f2ea2]'
              } focus:outline-none focus:ring-1 focus:ring-[#0f2ea2]`}
            />
            {activeTab !== 'all' && keywords[activeTab]?.text && (
              <button
                type="button"
                onClick={() => handleKeywordChange(activeTab, '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition-colors"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Inline Timeframe Dropdown */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs shrink-0 ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <select
                value={`${activeTimeNumber}-${activeTimeUnit}`}
                onChange={(e) => {
                  const [num, unit] = e.target.value.split('-');
                  handleActiveTimeChange(Number(num), unit);
                }}
                className="bg-transparent font-bold text-xs focus:outline-none cursor-pointer pr-1"
                title="Filter news by timeframe"
              >
                <option value="24-hours" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Past 24 Hours</option>
                <option value="48-hours" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Past 48 Hours</option>
                <option value="7-days" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Past 7 Days</option>
                <option value="14-days" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Past 14 Days</option>
                <option value="1-months" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Past 1 Month</option>
                <option value="3-months" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Past 3 Months</option>
              </select>
            </div>

            {/* Primary Search Button */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'all') {
                  handleFetchAllTabs();
                } else {
                  fetchTabResults(activeTab);
                }
              }}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Searching...' : activeTab === 'all' ? 'Search All' : 'Search News'}</span>
            </button>
          </div>
        </div>

        {/* Active Topics Chips Bar */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
            Topics ({keywords.filter(k => k.text?.trim()).length}/5):
          </span>

          {/* All Topics Pill */}
          <button
            type="button"
            onClick={() => handleSelectTab('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0f2ea2] text-white shadow-sm ring-2 ring-[#0f2ea2]/30'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <span>All Topics</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'all' ? 'bg-white/20 text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
            }`}>
              {tabResults['all']?.results?.length || 0}
            </span>
          </button>

          {/* Individual Topic Chips */}
          {keywords.map((kw, idx) => {
            const isThisTabActive = activeTab === idx;
            const tabRes = tabResults[idx];
            const unitAbbr = kw.timeUnit === 'hours' ? 'h' : kw.timeUnit === 'days' ? 'd' : kw.timeUnit === 'weeks' ? 'w' : 'm';
            const textLabel = kw.text?.trim() || `Topic #${idx + 1}`;

            return (
              <div
                key={idx}
                onClick={() => {
                  handleSelectTab(idx);
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }}
                className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isThisTabActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0f2ea2] dark:text-blue-300 border-2 border-[#0f2ea2] shadow-sm'
                    : isDark
                    ? 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span className={`text-[10px] font-bold ${isThisTabActive ? 'text-[#0f2ea2] dark:text-blue-400' : 'text-slate-400'}`}>
                  #{idx + 1}
                </span>
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{textLabel}</span>
                <span className={`text-[9px] font-mono px-1 py-0.2 rounded ${
                  isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  {kw.timeNumber}{unitAbbr}
                </span>
                {tabRes?.results?.length > 0 && (
                  <span className="text-[9px] font-mono font-bold text-slate-400">
                    ({tabRes.results.length})
                  </span>
                )}
                {keywords.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveKeyword(idx);
                    }}
                    className="text-slate-400 hover:text-rose-500 ml-0.5 p-0.5 transition-colors rounded hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    title="Remove topic"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Topic button if < 5 */}
          {keywords.length < 5 && (
            <button
              type="button"
              onClick={() => {
                handleAddKeyword();
                setActiveTab(keywords.length);
                setTimeout(() => {
                  if (searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }, 50);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#0f2ea2] dark:hover:text-blue-300 border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0f2ea2] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          )}

          {/* Batch fetch all topics shortcut */}
          <button
            type="button"
            onClick={handleFetchAllTabs}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50 py-1"
            title="Search all topics at once"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Fetch All Topics</span>
          </button>
        </div>
      </div>

      {/* Real-time Status Alert - Displayed only for genuine API/network failures */}
      {searchError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/50 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{searchError}</span>
          </div>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-mono shrink-0">
            API Connection Error
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
            {/* Header: Title + Topic Dropdown Selector + Refresh */}
            <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Top Results
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {newsList.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Topic Dropdown Selector (Replaces horizontal scrollbar) */}
                <select
                  value={activeTab}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    handleSelectTab(val);
                  }}
                  className={`text-xs font-bold pl-3 pr-7 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-colors max-w-[210px] truncate ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:border-[#0f2ea2]'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0f2ea2]'
                  }`}
                  title="Select topic to view"
                >
                  <option value="all">
                    All Topics ({tabResults['all']?.results?.length || 0})
                  </option>
                  {keywords.map((kw, idx) => {
                    const trimmed = kw.text ? kw.text.trim() : '';
                    if (!trimmed) return null;
                    const count = tabResults[idx]?.results?.length ?? 0;
                    return (
                      <option key={idx} value={idx}>
                        #{idx + 1} {trimmed} ({count})
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  onClick={() => fetchTabResults(activeTab)}
                  disabled={loading}
                  className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isDark
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                  }`}
                  title="Refresh results"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTab === activeTab ? 'animate-spin' : ''}`} />
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
                  const articleUrl = item.sourceUrl || item.link || getGoogleNewsSearchUrl(item.headline);
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
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.sourceTitle}
                        </span>
                        <span className="font-mono">{item.timeAgo}</span>
                      </div>

                      {/* Headline (plain text, card click selects for drafting) */}
                      <h4 className={`text-xs font-bold leading-snug ${
                        isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.headline}
                      </h4>

                      {/* Summary */}
                      <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                        {item.summary120}
                      </p>

                      {/* Explicit Direct URL Button leading directly to article */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                        <a
                          href={articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline"
                        >
                          <span>Read Full Article</span>
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
                          Direct Article
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                        {activeNews?.sourceUrl || activeNews?.link || '#'}
                      </div>
                    </div>
                  </div>
                  <a
                    href={activeNews?.sourceUrl || activeNews?.link || getGoogleNewsSearchUrl(activeNews?.headline)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
                  >
                    <span>Read Full Article</span>
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
