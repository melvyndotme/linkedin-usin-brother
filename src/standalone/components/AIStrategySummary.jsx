import React from 'react';
import { Sparkles, Target, BarChart2, ShieldAlert, CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';

export default function AIStrategySummary({ analysis, advertiser, isDark }) {
  if (!analysis) return null;

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 mb-8 transition-all ${
      isDark
        ? 'bg-gradient-to-br from-[#121829] via-[#0F1424] to-[#0A0E1A] border-blue-900/40 shadow-xl'
        : 'bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 border-blue-100 shadow-md'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-200/50 dark:border-blue-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0A66C2] to-indigo-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              AI Competitor Intelligence Analysis
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Live Synthesis
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Extracted from {analysis.activeCampaignCount} active LinkedIn campaigns for {advertiser.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
            {analysis.activeCampaignCount} Live Creatives Tracked
          </span>
        </div>
      </div>

      {/* Grid of Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* 1. Core Positioning Angle */}
        <div className={`p-4 rounded-xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0A66C2] dark:text-blue-400 mb-2">
            <Target className="w-4 h-4" />
            <span>Primary Campaign Angle</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
            {analysis.primaryStrategy}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Messaging strongly emphasizes sustainability compliance, lower energy draw, and high-yield total-cost-of-ownership savings.
          </p>
        </div>

        {/* 2. Key Marketing Pillars */}
        <div className={`p-4 rounded-xl border md:col-span-2 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200/80 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
            <BarChart2 className="w-4 h-4" />
            <span>Key Value Propositions & Offers</span>
          </div>
          <ul className="space-y-1.5">
            {analysis.keyPillars.map((pillar, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>{pillar}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Counter-Positioning Recommendation Card */}
      <div className={`mt-4 p-4 rounded-xl border ${
        isDark 
          ? 'bg-gradient-to-r from-amber-950/20 to-slate-900/80 border-amber-900/30' 
          : 'bg-gradient-to-r from-amber-50/80 to-orange-50/40 border-amber-200'
      }`}>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
          <Lightbulb className="w-4 h-4" />
          <span>Recommended Counter-Strategy & Positioning</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {analysis.recommendedCounterPositioning.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                {idx + 1}
              </span>
              <span className="leading-snug">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
