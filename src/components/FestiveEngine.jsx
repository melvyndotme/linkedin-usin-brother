import React, { useState } from 'react';
import { Calendar, Bell, Sparkles, Copy, Check, ExternalLink, ArrowRight, Eye, Code, Flame } from 'lucide-react';
import { MOM_HOLIDAYS, getUpcomingHolidays } from '../lib/momCalendar.js';
import { generateFestiveDrafts } from '../lib/draftGenerator.js';
import { generateFestiveSVG } from '../lib/svgGenerator.js';

export default function FestiveEngine({ onSelectForPreview }) {
  // Use August 2026/2027 context date or current date for demo
  const [selectedHoliday, setSelectedHoliday] = useState(MOM_HOLIDAYS[7]); // Singapore National Day default
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSvgCode, setShowSvgCode] = useState(false);

  const holidaysWithCountdown = getUpcomingHolidays(new Date("2027-07-30")); // Set baseline near National Day 2027 for live pre-emption demo
  const drafts = generateFestiveDrafts(selectedHoliday);
  const currentDraft = drafts[selectedDraftIndex] || drafts[0];

  const svgMarkup = generateFestiveSVG({
    title: selectedHoliday.name,
    subtitle: `Warm wishes from all of us at Brother Singapore`,
    occasion: selectedHoliday.name,
    theme: selectedHoliday.themeKey === "national-pride" ? "national-red" :
           selectedHoliday.themeKey === "gratitude-forgiveness" ? "festive-green" :
           selectedHoliday.themeKey === "prosperity-renewal" ? "cny-red" :
           selectedHoliday.themeKey === "light-hope" ? "deepavali-gold" : "brother-blue",
    year: selectedHoliday.date.slice(0, 4)
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToSimulator = () => {
    onSelectForPreview({
      type: 'festive',
      title: selectedHoliday.name,
      content: currentDraft.postContent,
      svgMarkup: svgMarkup,
      meta: {
        category: 'MOM Festive Occasion',
        template: currentDraft.templateName,
        angle: currentDraft.angle,
        holidayDate: selectedHoliday.date
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explainer */}
      <div className="bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-950/40 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Bell className="w-3.5 h-3.5 animate-pulse" />
              Phase 4: MOM Holiday Scraper & 10-Day Pre-emption Daemon
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Singapore Festive & Awareness Occasions Engine
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Continuously crawls official Singapore MOM public holidays and triggers automatic draft generation 
              <span className="text-amber-300 font-semibold"> at least 10 days in advance</span>, complete with Hofstede-aligned draft angles and branded companion SVG cards.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Holiday Selector & Countdown Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                MOM Public Holidays Queue
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">2027 Calendar</span>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {holidaysWithCountdown.map((h) => {
                const isSelected = selectedHoliday.id === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => {
                      setSelectedHoliday(h);
                      setSelectedDraftIndex(0);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white tracking-tight">{h.name}</span>
                      {h.triggerAlert ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 fill-amber-400" /> T-10 Due
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">{h.daysRemaining}d away</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{new Date(h.date).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-slate-500 text-[10px]">{h.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 3-Draft Selection & SVG Preview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Draft Tabs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">Multi-Draft Generator (YAML Frontmatter Engine)</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedHoliday.name}</h3>
              </div>
              
              {/* Draft Selector Pills */}
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
                    Draft Option {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* "Why This Works" Rationale Banner */}
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-200">Angle: {currentDraft.angle}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Template: {currentDraft.templateName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    <strong className="text-white">Why this draft works: </strong>
                    {currentDraft.whyThisWorks}
                  </p>
                </div>
              </div>
            </div>

            {/* Generated Post Content */}
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

            {/* Paired SVG Visual Card Preview */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Companion Branded SVG Visual Asset (Phase 3 Engine)</span>
                </h4>
                <button
                  onClick={() => setShowSvgCode(!showSvgCode)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                >
                  <Code className="w-3.5 h-3.5" />
                  {showSvgCode ? 'Hide SVG Code' : 'View Parametric SVG'}
                </button>
              </div>

              {showSvgCode ? (
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-48 custom-scrollbar">
                  {svgMarkup}
                </pre>
              ) : (
                <div 
                  className="w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl max-h-[300px] flex items-center justify-center bg-slate-950"
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
