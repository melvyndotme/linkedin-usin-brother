import React, { useState } from 'react';
import { Sparkles, Search, RefreshCw, Copy, Check, Download, Layers, ShieldCheck, Newspaper, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { EXTENDED_AI_NEWS, formatAs120WordMarkdown, searchSerperWithTimeframe } from '../lib/serperEngine.js';
import { generateAIDrafts } from '../lib/draftGenerator.js';
import { generateBrotherWaveCorporateSVG } from '../lib/svgBrotherWebsiteTemplates.js';

export default function Module2AIPosts({ isDark, onNavigateToDraftStudio }) {
  const [query, setQuery] = useState('enterprise agentic AI productivity');
  const [timeNumber, setTimeNumber] = useState(24);
  const [timeUnit, setTimeUnit] = useState('hours'); // 'hours', 'days', 'weeks', 'months'
  const [maxResults, setMaxResults] = useState(4);
  const [newsList, setNewsList] = useState(EXTENDED_AI_NEWS);
  const [selectedNews, setSelectedNews] = useState(EXTENDED_AI_NEWS[0]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedFormatted, setCopiedFormatted] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);

  const drafts = generateAIDrafts({
    title: selectedNews.headline,
    snippet: selectedNews.summary120,
    suggestedPillars: {
      whatItIs: selectedNews.summary120.slice(0, 130) + "...",
      whyItMatters: "Eliminates routine operational friction by 65%, freeing teams for strategic creative tasks.",
      brotherImpact: "Empowers Brother Singapore employees and B2B clients to achieve breakthrough productivity."
    }
  });

  const currentDraft = drafts[selectedDraftIndex] || drafts[0];

  const waveSvg = generateBrotherWaveCorporateSVG({
    badgeText: "Brother Xplorer AI Intelligence",
    headline: selectedNews.headline.length > 38 ? selectedNews.headline.slice(0, 38) + "..." : selectedNews.headline,
    subtitle: "What it is • Why it matters • Brother SG Breakthrough Productivity",
    promoTag: "Breakthrough Productivity",
    theme: "ai-thought"
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await searchSerperWithTimeframe({
        query,
        number: timeNumber,
        unit: timeUnit,
        maxResults
      });
      setNewsList(results);
      if (results.length > 0) {
        setSelectedNews(results[0]);
        setSelectedDraftIndex(0);
      }
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
    a.download = `brother-sg-ai-employer-branding-${Date.now()}.svg`;
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Module 2: AI Intelligence & 120-Word Synthesis
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Flexible Timeframe AI News & Employer Branding Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Query recent AI breakthroughs across customized time windows (<strong className="text-[#0f2ea2] dark:text-blue-400">hours, days, weeks, months</strong>) and generate strict 120-word structured summaries.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigateToDraftStudio(currentDraft.postContent, selectedNews.headline)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>Edit in Draft Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Keywords + Number Input + Timeframe Dropdown */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-end">
          {/* Keywords */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
              AI Intelligence Keywords
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. enterprise agentic AI, workplace automation"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
            />
          </div>

          {/* Time Number Entry */}
          <div className="sm:col-span-2">
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
          <div className="sm:col-span-3">
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
          <div className="sm:col-span-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Scanning...' : 'Search News'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: 120-Word Summarized Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-3.5 sm:p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                120-Word Structured Summaries ({newsList.length})
              </h3>
              <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400">
                Within {timeNumber} {timeUnit}
              </span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
              {newsList.map((item) => {
                const isSelected = selectedNews.id === item.id;
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
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold text-[#0f2ea2] dark:text-blue-400">{item.sourceTitle}</span>
                      <span className="font-mono">{item.timeAgo}</span>
                    </div>
                    <h4 className={`text-xs font-bold leading-snug ${
                      isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.headline}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                      {item.summary120}
                    </p>
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
                onClick={() => handleCopy120Format(selectedNews)}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
              >
                {copiedFormatted ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFormatted ? 'Copied' : 'Copy 120-Word Format'}
              </button>
            </div>

            {/* Formatted Markdown Box */}
            <div className={`p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              {formatAs120WordMarkdown(selectedNews)}
            </div>

            {/* 3-Pillar Generated Post Copy */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                  Generated 3-Pillar Employer Branding Post
                </h4>

                <button
                  onClick={() => handleCopy(currentDraft.postContent)}
                  className="text-xs text-[#0f2ea2] dark:text-blue-400 hover:underline font-bold"
                >
                  {copied ? 'Copied Post!' : 'Copy Post Copy'}
                </button>
              </div>

              <div className={`p-4 rounded-xl text-xs whitespace-pre-wrap leading-relaxed border max-h-52 overflow-y-auto custom-scrollbar ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50/60 border-slate-200 text-slate-700'
              }`}>
                {currentDraft.postContent}
              </div>
            </div>

            {/* Corporate Wave Banner */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 block">Paired Corporate Graphic</span>
              <div className="w-full rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
                <div 
                  className="w-full aspect-[12/5] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: waveSvg }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
