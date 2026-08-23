import React, { useState } from 'react';
import { Sparkles, Search, RefreshCw, Copy, Check, Download, Layers, ShieldCheck, Newspaper } from 'lucide-react';
import { SAMPLE_AI_NEWS, fetchSerperAINews } from '../lib/serperEngine.js';
import { generateAIDrafts } from '../lib/draftGenerator.js';
import { generateBrotherWaveCorporateSVG } from '../lib/svgBrotherWebsiteTemplates.js';

export default function Module2AIPosts({ isDark }) {
  const [newsList, setNewsList] = useState(SAMPLE_AI_NEWS);
  const [selectedNews, setSelectedNews] = useState(SAMPLE_AI_NEWS[0]);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const drafts = generateAIDrafts(selectedNews);
  const currentDraft = drafts[selectedDraftIndex] || drafts[0];

  const waveSvg = generateBrotherWaveCorporateSVG({
    badgeText: "Brother Xplorer AI Intelligence",
    headline: selectedNews.title.length > 38 ? selectedNews.title.slice(0, 38) + "..." : selectedNews.title,
    subtitle: selectedNews.suggestedPillars.brotherImpact,
    promoTag: "Breakthrough Productivity",
    theme: "ai-thought"
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDraft.postContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              Module 2: Employer Branding & AI Intelligence
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              AI Innovation & Productivity Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Translates 24h AI breakthroughs into our 3-pillar employer branding narrative:
              <strong className="text-[#0f2ea2] dark:text-blue-400"> What it is → Why it matters → Productivity for Brother employees</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Post'}
            </button>
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download SVG
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: 24h AI News Feed (Scrollable) */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-3.5 sm:p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                24h AI News (Serper.dev)
              </h3>
              <span className="text-[9px] font-mono text-[#0f2ea2] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Live
              </span>
            </div>

            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-none lg:max-h-[520px] pb-2 lg:pb-0 pr-1 custom-scrollbar">
              {newsList.map((item) => {
                const isSelected = selectedNews.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedNews(item);
                      setSelectedDraftIndex(0);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all shrink-0 lg:shrink w-64 lg:w-full ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#0f2ea2] dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                        : isDark
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-semibold text-[#0f2ea2] dark:text-blue-400">{item.source}</span>
                      <span>{item.date}</span>
                    </div>
                    <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${
                      isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.title}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 3 Drafts with Strategic Breakdown & Paired Graphic */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 sm:space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {/* Header & Angle Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3.5 dark:border-slate-800">
              <div>
                <span className="text-[10px] sm:text-[11px] font-mono text-[#0f2ea2] dark:text-blue-400 font-bold uppercase tracking-wider block">
                  Employer Branding Multi-Draft
                </span>
                <h3 className={`text-sm sm:text-base font-bold mt-0.5 line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentDraft.angle}
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-800 self-start sm:self-auto">
                {drafts.map((d, idx) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDraftIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDraftIndex === idx
                        ? 'bg-[#0f2ea2] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Draft {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Why This Works Rationale */}
            <div className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 rounded-xl p-3 sm:p-3.5">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-cyan-700 dark:text-cyan-300">Strategic Rationale: </strong>
                  {currentDraft.whyThisWorks}
                </p>
              </div>
            </div>

            {/* Post Draft Content */}
            <div className="relative">
              <div className={`p-3.5 sm:p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border custom-scrollbar ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {currentDraft.postContent}
              </div>
            </div>

            {/* Rendered Brother Corporate Graphic */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                  Brother Corporate Wave Graphic
                </h4>
                <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400">1200 × 500 Responsive</span>
              </div>

              <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
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
