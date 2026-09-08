import React, { useState } from 'react';
import { Newspaper, Search, RefreshCw, Copy, Check, Download, Layers, ShieldCheck, Clock, ArrowRight, ExternalLink, AlertCircle, Plus, Trash2, Tag, Sparkles } from 'lucide-react';
import { EXTENDED_AI_NEWS, formatAs120WordMarkdown, searchSerperWithTimeframe } from '../lib/serperEngine.js';
import { generateAIDrafts } from '../lib/draftGenerator.js';
import { generateBrotherWaveCorporateSVG } from '../lib/svgBrotherWebsiteTemplates.js';
import { safeGetItem } from '../lib/storage.js';

export default function Module2AIPosts({ isDark, onNavigateToDraftStudio }) {
  // Up to 5 customizable search keywords
  const [keywords, setKeywords] = useState([
    'enterprise agentic AI',
    'workplace productivity',
    'smart document automation',
    'Brother Singapore',
    'enterprise printing sustainability'
  ]);

  const [timeNumber, setTimeNumber] = useState(24);
  const [timeUnit, setTimeUnit] = useState('hours'); // 'hours', 'days', 'weeks', 'months'
  const [maxResults, setMaxResults] = useState(4);
  const [newsList, setNewsList] = useState(EXTENDED_AI_NEWS);
  const [selectedNews, setSelectedNews] = useState(EXTENDED_AI_NEWS[0]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedFormatted, setCopiedFormatted] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [searchError, setSearchError] = useState(null);
  const [isLiveNews, setIsLiveNews] = useState(false);

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

  const handleKeywordChange = (index, value) => {
    const updated = [...keywords];
    updated[index] = value;
    setKeywords(updated);
  };

  const handleAddKeyword = () => {
    if (keywords.length < 5) {
      setKeywords([...keywords, '']);
    }
  };

  const handleRemoveKeyword = (index) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index));
    } else {
      setKeywords(['']);
    }
  };

  const handleApplyPresetKeyword = (preset) => {
    // Find first empty slot or replace slot 0
    const emptyIndex = keywords.findIndex(k => !k || !k.trim());
    if (emptyIndex !== -1) {
      handleKeywordChange(emptyIndex, preset);
    } else if (keywords.length < 5) {
      setKeywords([...keywords, preset]);
    } else {
      handleKeywordChange(keywords.length - 1, preset);
    }
  };

  const activeNews = selectedNews || (newsList && newsList.length > 0 ? newsList[0] : null) || EXTENDED_AI_NEWS[0];

  const drafts = generateAIDrafts({
    title: activeNews?.headline || 'Enterprise Trend Breakthrough',
    snippet: activeNews?.summary120 || 'Latest business news and automation insights.',
    suggestedPillars: {
      whatItIs: (activeNews?.summary120 || 'Enterprise productivity advancements').slice(0, 130) + "...",
      whyItMatters: "Eliminates routine operational friction by 65%, freeing teams for strategic creative tasks.",
      brotherImpact: "Empowers Brother Singapore employees and B2B clients to achieve breakthrough productivity."
    }
  });

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

  const handleSearch = async () => {
    setLoading(true);
    setSearchError(null);

    const activeKeywords = keywords.map(k => k.trim()).filter(Boolean);
    const combinedQuery = activeKeywords.length > 0 
      ? activeKeywords.join(' OR ') 
      : 'enterprise workplace productivity';

    try {
      const activeKey = safeGetItem('key_serper') || '';
      const response = await searchSerperWithTimeframe({
        apiKey: activeKey,
        query: combinedQuery,
        number: timeNumber,
        unit: timeUnit,
        maxResults
      });

      const { isLive, results, warning } = response;
      setIsLiveNews(isLive);
      if (warning) {
        setSearchError(warning);
      }
      setNewsList(results);
      if (results.length > 0) {
        setSelectedNews(results[0]);
        setSelectedDraftIndex(0);
      }
    } catch (err) {
      console.error('Serper search error:', err);
      setSearchError(err.message || 'Failed to search Serper.dev API. Check your key in Settings.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Control Panel: 5 Keywords + Time Window + Trigger */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      } space-y-3.5`}>
        {/* Keywords Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
            Search Keywords (Enter up to 5 topics or phrases)
          </label>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Slots used: <strong>{keywords.filter(k => k.trim()).length} / 5</strong></span>
          </div>
        </div>

        {/* 5 Keyword Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {keywords.map((kw, idx) => (
            <div key={idx} className="relative flex items-center">
              <span className="absolute left-2.5 text-[10px] font-bold text-slate-400 select-none">
                #{idx + 1}
              </span>
              <input
                type="text"
                value={kw}
                onChange={(e) => handleKeywordChange(idx, e.target.value)}
                placeholder={`Keyword ${idx + 1}...`}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-7 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
              />
              {keywords.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(idx)}
                  className="absolute right-2 text-slate-400 hover:text-rose-500 p-0.5"
                  title="Remove this keyword"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {keywords.length < 5 && (
            <button
              type="button"
              onClick={handleAddKeyword}
              className="flex items-center justify-center gap-1 border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0f2ea2] text-slate-500 hover:text-[#0f2ea2] text-xs font-semibold py-2 px-3 rounded-xl transition-all"
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

        {/* Time Window & Search Trigger Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Time Number Entry */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              Time Window
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={timeNumber}
              onChange={(e) => setTimeNumber(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
            />
          </div>

          {/* Time Unit Dropdown */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Unit (Hours / Days / Weeks / Months)
            </label>
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none cursor-pointer"
            >
              <option value="hours">Hours (e.g. 24, 48, 72 hours)</option>
              <option value="days">Days (e.g. 3, 4, 7 days)</option>
              <option value="weeks">Weeks (e.g. 1, 2 weeks)</option>
              <option value="months">Months (e.g. 1, 3 months)</option>
            </select>
          </div>

          {/* Trigger Button */}
          <div className="sm:col-span-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Searching Real-Time News...' : 'Search News Across Keywords'}
            </button>
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
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  120-Word Summaries ({newsList.length})
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
                Within {timeNumber} {timeUnit}
              </span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
              {newsList.map((item) => {
                const isSelected = activeNews?.id === item.id;
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
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-[#0f2ea2] dark:text-blue-400 hover:underline flex items-center gap-1"
                        title="Open actual source publication"
                      >
                        <span>{item.sourceTitle}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <span className="font-mono">{item.timeAgo}</span>
                    </div>

                    {/* Clickable Headline leading to actual URL */}
                    <h4 className="text-xs font-bold leading-snug">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          // Select card and let user open article in new tab
                          setSelectedNews(item);
                          setSelectedDraftIndex(0);
                        }}
                        className={`hover:underline flex items-start justify-between gap-1.5 ${
                          isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'
                        }`}
                        title="Open article in new tab"
                      >
                        <span>{item.headline}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400 shrink-0 mt-0.5 opacity-80" />
                      </a>
                    </h4>

                    {/* Summary */}
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                      {item.summary120}
                    </p>

                    {/* Explicit Direct URL Button */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                      <a
                        href={item.sourceUrl}
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
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Exact Required 120-Word Format + 3-Pillar Draft Preview */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
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
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <Newspaper className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {activeNews?.sourceTitle || 'News Source'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {activeNews?.sourceUrl || '#'}
                  </div>
                </div>
              </div>
              <a
                href={activeNews?.sourceUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
              >
                <span>Open Actual URL</span>
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
        </div>
      </div>
    </div>
  );
}
