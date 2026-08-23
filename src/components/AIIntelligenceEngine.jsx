import React, { useState, useEffect } from 'react';
import { Newspaper, Search, Key, Sparkles, Copy, Check, Eye, ArrowRight, RefreshCw, Sliders, CheckCircle2, Shield } from 'lucide-react';
import { SAMPLE_AI_NEWS, fetchSerperAINews } from '../lib/serperEngine.js';
import { generateAIDrafts } from '../lib/draftGenerator.js';
import { generateInnovationInfographicSVG } from '../lib/svgGenerator.js';

export default function AIIntelligenceEngine({ onSelectForPreview }) {
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('enterprise agentic AI productivity');
  const [newsList, setNewsList] = useState(SAMPLE_AI_NEWS);
  const [selectedNews, setSelectedNews] = useState(SAMPLE_AI_NEWS[0]);
  const [loading, setLoading] = useState(false);
  const [frequencyCap, setFrequencyCap] = useState(5); // up to 7 a week
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const drafts = generateAIDrafts(selectedNews);
  const currentDraft = drafts[selectedDraftIndex] || drafts[0];

  const infographicSvg = generateInnovationInfographicSVG({
    topic: selectedNews.title.length > 45 ? selectedNews.title.slice(0, 45) + "..." : selectedNews.title,
    pillar1: "Frontier Capability",
    pillar1Desc: selectedNews.suggestedPillars.whatItIs,
    pillar2: "Industry Shift",
    pillar2Desc: selectedNews.suggestedPillars.whyItMatters,
    pillar3: "Brother SG Breakthrough",
    pillar3Desc: selectedNews.suggestedPillars.brotherImpact,
    source: `${selectedNews.source} • Serper 24h`
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await fetchSerperAINews(apiKey, query, 4);
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

  const handleSendToSimulator = () => {
    onSelectForPreview({
      type: 'ai-employer-branding',
      title: selectedNews.title,
      content: currentDraft.postContent,
      svgMarkup: infographicSvg,
      meta: {
        category: 'AI Employer Branding & Thought Leadership',
        template: currentDraft.templateName,
        angle: currentDraft.angle,
        source: selectedNews.source
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 5: Serper.dev 24h Intelligence Engine
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              AI Employer Branding & 3-Pillar Thought Leadership
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Monitors 24-hour real-time AI news via <code className="text-cyan-300">serper.dev</code>, synthesizing breakthroughs into:
              <strong className="text-white"> What it is $\rightarrow$ Why it matters $\rightarrow$ How it enables Brother Singapore employees</strong>.
            </p>
          </div>
          <button
            onClick={handleSendToSimulator}
            className="flex items-center gap-2 bg-[#005BAC] hover:bg-[#004b8f] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <Eye className="w-4 h-4" />
            Preview in LinkedIn Feed
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Panel: Serper.dev Config & Keyword Filter */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Keyword Search */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              AI Intelligence Keywords
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. enterprise agentic AI, workplace productivity"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Serper API Key (Optional with fallback) */}
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Serper.dev API Key <span className="text-[10px] text-slate-500 font-normal">(Optional — mock fallback included)</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste Serper API key or use live demo dataset"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>

          {/* Frequency Cap Slider (up to 7/week) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Weekly Alert Cap</span>
              <span className="text-cyan-400 font-mono">{frequencyCap} / week</span>
            </label>
            <input
              type="range"
              min="1"
              max="7"
              value={frequencyCap}
              onChange={(e) => setFrequencyCap(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />
          </div>

          {/* Trigger Scan Button */}
          <div className="md:col-span-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Scanning...' : 'Scan 24h News'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* News Feed List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-cyan-400" />
                Latest 24h AI Intelligence
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Feed
              </span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {newsList.map((item) => {
                const isSelected = selectedNews.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedNews(item);
                      setSelectedDraftIndex(0);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="font-semibold text-cyan-300">{item.source}</span>
                      <span className="font-mono text-[10px]">{item.date}</span>
                    </div>
                    <h4 className="font-bold text-xs text-white leading-snug mb-2">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.snippet}</p>
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      {item.keywords.map((k, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          #{k}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Draft Options & 3-Pillar Visual Infographic Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            {/* Header & Angle Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                  Employer Branding Multi-Draft Generator
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 line-clamp-1">{selectedNews.title}</h3>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {drafts.map((d, index) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDraftIndex(index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDraftIndex === index
                        ? 'bg-[#005BAC] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Draft {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Why This Works Banner */}
            <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-200">Angle: {currentDraft.angle}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {currentDraft.templateName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    <strong className="text-white">Strategic Rationale: </strong>
                    {currentDraft.whyThisWorks}
                  </p>
                </div>
              </div>
            </div>

            {/* Post Draft Content */}
            <div className="relative">
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto custom-scrollbar">
                {currentDraft.postContent}
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => handleCopy(currentDraft.postContent)}
                  className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 backdrop-blur-sm transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Post'}
                </button>
              </div>
            </div>

            {/* Auto-Generated 3-Stage SVG Infographic */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Companion 3-Stage Innovation Infographic (Auto-Rendered)</span>
                </h4>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  Brother Blue #005BAC Palette
                </span>
              </div>

              <div 
                className="w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl max-h-[320px] flex items-center justify-center bg-slate-950"
                dangerouslySetInnerHTML={{ __html: infographicSvg }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
