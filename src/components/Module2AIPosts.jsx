import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Newspaper, Search, RefreshCw, Copy, Check, Download, Layers, ShieldCheck, Clock, ArrowRight, ExternalLink, AlertCircle, Plus, Trash2, Sparkles, Database, X, Radio, BookOpen, Tag } from 'lucide-react';
import { searchSerperWithTimeframe, getEffectiveSerperKey, getFeaturedImageForArticle, getSourceFaviconUrl } from '../lib/serperEngine.js';
import { generateAIDrafts } from '../lib/draftGenerator.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';
import { logActivity } from '../lib/auditLogger.js';

export default function Module2AIPosts({ isDark, onNavigateToDraftStudio, onNavigateToSettings }) {
  const searchInputRef = useRef(null);
  // Up to 5 customizable search keywords, each with its own independent timeframe
  const [keywords, setKeywords] = useState([
    { text: 'Work-Life Balance & Flexibility', timeNumber: 7, timeUnit: 'days' },
    { text: 'workplace productivity', timeNumber: 7, timeUnit: 'days' },
    { text: 'smart document automation', timeNumber: 7, timeUnit: 'days' },
    { text: 'Brother Singapore', timeNumber: 14, timeUnit: 'days' },
    { text: 'enterprise agentic AI', timeNumber: 7, timeUnit: 'days' }
  ]);

  const [combinedTimeframe, setCombinedTimeframe] = useState({
    timeNumber: 7,
    timeUnit: 'days'
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all' or 0, 1, 2, 3, 4
  const [maxResults, setMaxResults] = useState(5);

  // Cache results per keyword tab: { 'all': { isLive, results }, 0: { isLive, results }, ... }
  // Initialized completely empty so no fake mock articles are ever displayed!
  const [tabResults, setTabResults] = useState({});

  const [selectedNews, setSelectedNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTab, setLoadingTab] = useState('batch'); // 'all', 0..4, or 'batch'
  const [copied, setCopied] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [searchError, setSearchError] = useState(null);
  const [hasKey, setHasKey] = useState(() => Boolean(getEffectiveSerperKey()));

  useEffect(() => {
    const key = getEffectiveSerperKey();
    if (key) {
      setHasKey(true);
    }
    // Automatically trigger live news search across all tabs on mount!
    handleFetchAllTabs();
  }, []);

  const activeTimeNumber = activeTab === 'all'
    ? combinedTimeframe.timeNumber
    : (keywords[activeTab]?.timeNumber ?? 24);

  const activeTimeUnit = activeTab === 'all'
    ? combinedTimeframe.timeUnit
    : (keywords[activeTab]?.timeUnit ?? 'hours');

  const handleActiveTimeChange = (newNumber, newUnit, shouldFetch = true) => {
    const num = Math.max(1, parseInt(newNumber, 10) || 1);
    if (activeTab === 'all') {
      setCombinedTimeframe({ timeNumber: num, timeUnit: newUnit });
      setTabResults(prev => {
        const next = { ...prev };
        delete next['all'];
        return next;
      });
      if (shouldFetch) {
        fetchTabResults('all', { number: num, unit: newUnit });
      }
    } else {
      setKeywords(prev => {
        const updated = [...prev];
        if (updated[activeTab]) {
          updated[activeTab] = {
            ...updated[activeTab],
            timeNumber: num,
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
      if (shouldFetch) {
        fetchTabResults(activeTab, { number: num, unit: newUnit });
      }
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

      // Aggregate all live articles from active tabs so "All Topics" showcases all articles from every tab (up to 25 articles)
      const aggregatedFromTabs = [];
      const seenTitles = new Set();
      indivRes.forEach(item => {
        (item.results || []).forEach(r => {
          const key = r.link || r.headline;
          if (key && !seenTitles.has(key)) {
            seenTitles.add(key);
            aggregatedFromTabs.push(r);
          }
        });
      });

      const finalAllResults = aggregatedFromTabs;

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

  const currentTabResults = tabResults[activeTab] || {
    isLive: true,
    results: [],
    totalFound: 0
  };
  const newsList = currentTabResults.results || [];
  const isLiveNews = currentTabResults.isLive || false;
  const activeNews = selectedNews || (newsList.length > 0 ? newsList[0] : null);

  const baseDrafts = useMemo(() => {
    if (!activeNews) return [];
    return generateAIDrafts({
      title: activeNews?.headline || 'Enterprise Trend Breakthrough',
      snippet: activeNews?.summary120 || 'Latest business news and automation insights.',
      sourceTitle: activeNews?.sourceTitle || 'Industry Intelligence',
      sourceUrl: activeNews?.sourceUrl || activeNews?.link,
      suggestedPillars: {
        whatItIs: (activeNews?.summary120 || 'Enterprise productivity advancements').slice(0, 150) + "...",
        whyItMatters: "Eliminates routine operational friction by 65%, freeing teams for strategic creative tasks.",
        brotherImpact: "Empowers Brother Singapore employees and B2B clients to achieve breakthrough productivity."
      }
    });
  }, [activeNews]);

  const currentDraft = (baseDrafts && baseDrafts[selectedDraftIndex]) || baseDrafts?.[0] || {
    name: '3-Pillar Thought Leadership',
    postContent: 'Breakthrough enterprise update.'
  };

  const newsOccasion = useMemo(() => {
    if (!activeNews) return null;
    return {
      id: activeNews.id || 'news-active',
      name: activeNews.headline || 'Industry Intelligence',
      subtitle: activeNews.summary120 ? (activeNews.summary120.slice(0, 120) + '...') : 'Standing "At your side" across Singapore',
      category: 'News & Trends',
      eventType: 'corporate',
      theme: 'blue',
      badgeText: activeNews.sourceTitle || 'News & Trends',
      details: activeNews.summary120 || '',
      suggestedHashtags: ['#BrotherSingapore', '#NewsAndTrends', '#WorkplaceInnovation', '#AtYourSide']
    };
  }, [activeNews]);

  const formattedDraftForStudio = useMemo(() => {
    if (!currentDraft) return null;
    return {
      id: currentDraft.id || 'draft-1',
      name: currentDraft.name || currentDraft.templateName || 'Industry Trend Insight',
      post: currentDraft.postContent || currentDraft.post || '',
      postContent: currentDraft.postContent || currentDraft.post || '',
      whyThisWorks: currentDraft.whyThisWorks || ''
    };
  }, [currentDraft]);

  const handleCopyPost = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time Google News intelligence for Brother Singapore. Click &ldquo;Draft in Content Studio&rdquo; on any article below to generate targeted posts.
            </p>
          </div>
        </div>
      </div>

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
                    const val = (searchInputRef.current?.value || '').trim();
                    if (val) {
                      handleKeywordChange(0, val);
                      setActiveTab(0);
                      setTimeout(() => fetchTabResults(0), 50);
                    } else {
                      handleFetchAllTabs();
                    }
                  } else {
                    fetchTabResults(activeTab);
                  }
                }
              }}
              placeholder={
                activeTab === 'all'
                  ? "Type keyword (e.g. Work Life Balance) and press Enter to search live..."
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

          {/* Timeframe: Number Input + Pull Down Unit */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs shrink-0 transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <input
                type="number"
                min="1"
                max="365"
                value={activeTimeNumber || ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  const val = raw === '' ? '' : Math.max(1, parseInt(raw, 10) || 1);
                  handleActiveTimeChange(val, activeTimeUnit, false);
                }}
                onBlur={() => {
                  if (!activeTimeNumber || activeTimeNumber < 1) {
                    handleActiveTimeChange(7, activeTimeUnit, false);
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
                className={`w-12 px-1.5 py-1 rounded-lg text-center font-bold text-xs border transition-colors focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
                }`}
                placeholder="7"
                title="Enter number of time units"
              />
              <select
                value={activeTimeUnit}
                onChange={(e) => handleActiveTimeChange(activeTimeNumber, e.target.value, true)}
                className="bg-transparent font-bold text-xs focus:outline-none cursor-pointer pr-1 py-1"
                title="Select timeframe unit (hours, days, weeks, months)"
              >
                <option value="hours" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Hours</option>
                <option value="days" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Days</option>
                <option value="weeks" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Weeks</option>
                <option value="months" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Months</option>
              </select>
            </div>

            {/* Primary Search Button */}
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'all') {
                  const val = (searchInputRef.current?.value || '').trim();
                  if (val) {
                    handleKeywordChange(0, val);
                    setActiveTab(0);
                    setTimeout(() => fetchTabResults(0), 50);
                  } else {
                    handleFetchAllTabs();
                  }
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

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[11px] text-slate-400 font-semibold">Try keywords:</span>
          {[
            'Work Life Balance',
            'Flexible Work Arrangements',
            'Workplace Wellbeing',
            'Brother Singapore',
            'Smart Document AI',
            'Sustainability & ESG'
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const targetTab = activeTab === 'all' ? 0 : activeTab;
                handleKeywordChange(targetTab, tag);
                setActiveTab(targetTab);
                setTimeout(() => fetchTabResults(targetTab), 50);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-[#0f2ea2] dark:hover:text-blue-300 transition-all border border-slate-200/80 dark:border-slate-800 cursor-pointer"
            >
              + {tag}
            </button>
          ))}
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

      {/* Real-time News Results Section */}
      <div className={`p-4 sm:p-6 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      } space-y-4`}>
        {/* Header: Title + Topic Dropdown Selector + Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Top Verified Articles
            </h3>
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
              isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-[#0f2ea2]'
            }`}>
              {newsList.length} Found
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Topic Dropdown Selector */}
            <select
              value={activeTab}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                handleSelectTab(val);
              }}
              className={`text-xs font-bold pl-3 pr-7 py-2 rounded-xl border focus:outline-none cursor-pointer transition-colors max-w-[240px] truncate ${
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
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isDark
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Refresh results"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTab === activeTab ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading && (loadingTab === activeTab || loadingTab === 'batch') ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
            <RefreshCw className="w-6 h-6 text-[#0f2ea2] dark:text-blue-400 animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Searching Real-Time News...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Fetching latest verified headlines for <strong className="text-[#0f2ea2] dark:text-blue-300">"{activeTab === 'all' ? 'All Topics' : keywords[activeTab]?.text}"</strong>.
            </p>
          </div>
        ) : newsList.length === 0 ? (
          /* Honest Zero-Result State */
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-400 flex items-center justify-center mx-auto mb-1">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              0 Articles Found in the Past {activeTimeNumber} {activeTimeUnit}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No articles were published for <strong className="text-slate-700 dark:text-slate-300">"{activeTab === 'all' ? 'All Keywords' : keywords[activeTab]?.text}"</strong> within this strict timeframe.
            </p>

            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Expand Window:</span>
              <button
                type="button"
                onClick={() => {
                  handleActiveTimeChange(7, 'days');
                  fetchTabResults(activeTab, { number: 7, unit: 'days' });
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f2ea2] dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all shadow-xs cursor-pointer"
              >
                Past 7 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  handleActiveTimeChange(1, 'months');
                  fetchTabResults(activeTab, { number: 1, unit: 'months' });
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f2ea2] dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all shadow-xs cursor-pointer"
              >
                Past 1 Month
              </button>
              <button
                type="button"
                onClick={() => {
                  handleActiveTimeChange(3, 'months');
                  fetchTabResults(activeTab, { number: 3, unit: 'months' });
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0f2ea2] dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all shadow-xs cursor-pointer"
              >
                Past 3 Months
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {newsList.map((item) => {
              const articleUrl = item.link || item.sourceUrl || '';
              const featuredImg = getFeaturedImageForArticle(item, activeTab === 'all' ? 'Workplace Innovation' : keywords[activeTab]?.text);
              const faviconUrl = getSourceFaviconUrl(item.sourceTitle, articleUrl);

              const handleDraftInStudio = () => {
                logActivity({
                  event: 'Drafted News in Content Studio',
                  category: 'Content Generation',
                  details: `Selected news "${item.headline}" to draft in Content Studio`,
                  status: 'Success'
                });
                const drafts = generateAIDrafts({
                  title: item.headline || 'Enterprise Trend Breakthrough',
                  snippet: item.summary120 || 'Latest business news and automation insights.',
                  sourceTitle: item.sourceTitle || 'Industry Intelligence',
                  sourceUrl: articleUrl,
                  suggestedPillars: item.suggestedPillars || {
                    whatItIs: (item.summary120 || 'Enterprise productivity advancements').slice(0, 150) + '...',
                    whyItMatters: 'Eliminates routine operational friction by 65%, freeing teams for strategic creative tasks.',
                    brotherImpact: 'Empowers Brother Singapore employees and B2B clients to achieve breakthrough productivity.'
                  }
                });
                const occasion = {
                  id: item.id || `news-${Date.now()}`,
                  name: item.headline || 'Industry Intelligence',
                  subtitle: item.summary120 ? (item.summary120.slice(0, 120) + '...') : 'Standing "At your side" across Singapore',
                  category: 'News & Trends',
                  eventType: 'corporate',
                  theme: 'blue',
                  badgeText: item.sourceTitle || 'News & Trends',
                  details: item.summary120 || '',
                  imageUrl: featuredImg,
                  suggestedHashtags: ['#BrotherSingapore', '#NewsAndTrends', '#WorkplaceInnovation', '#AtYourSide']
                };
                onNavigateToDraftStudio({
                  content: drafts[0]?.postContent || drafts[0]?.post || item.summary120 || '',
                  title: item.headline || 'News & Trends',
                  occasion: occasion,
                  activeDraft: drafts[0],
                  availableDrafts: drafts
                });
              };

              return (
                <div
                  key={item.id}
                  onClick={handleDraftInStudio}
                  className={`rounded-2xl border transition-all duration-200 ease-out flex flex-col justify-between overflow-hidden group cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-600 hover:shadow-lg hover:-translate-y-1'
                      : 'bg-white border-slate-200/90 shadow-xs hover:bg-slate-100 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  {/* High-Resolution Featured Image Top Banner */}
                  <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
                    <img
                      src={featuredImg}
                      alt={item.headline}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=90';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Topic Badge Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-slate-900/80 text-white shadow-sm border border-white/20">
                        {item.topic || 'Industry Trend'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
                    <div className="space-y-2.5">
                      {/* Header: Source and Time */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                          {faviconUrl ? (
                            <img
                              src={faviconUrl}
                              alt=""
                              className="w-4 h-4 rounded-sm object-contain shrink-0"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Newspaper className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[150px] sm:max-w-[190px]">{item.sourceTitle || 'Verified Source'}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 shrink-0">{item.timeAgo || item.date || 'Recent'}</span>
                      </div>

                      {/* Headline */}
                      <h4 className={`text-sm sm:text-base font-bold leading-snug line-clamp-2 transition-colors duration-150 group-hover:text-[#0f2ea2] dark:group-hover:text-blue-400 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.headline}
                      </h4>

                      {/* Summary */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {item.summary120}
                      </p>

                      {/* Source Article Link */}
                      {articleUrl ? (
                        <div className="pt-0.5">
                          <a
                            href={articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f2ea2] dark:text-blue-400 hover:underline transition-colors"
                          >
                            <span>Read Full Article</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ) : null}
                    </div>

                    {/* Card Action Button */}
                    <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDraftInStudio();
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all duration-150 shadow-xs hover:shadow-sm cursor-pointer"
                      >
                        <span>Draft in Content Studio</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
