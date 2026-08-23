import React from 'react';
import { Users, TrendingUp, Eye, ThumbsUp, MessageSquare, Repeat2, ExternalLink, ShieldCheck, Sparkles, BarChart3 } from 'lucide-react';
import { BROTHER_LINKEDIN_ANALYTICS, RECENT_LINKEDIN_POSTS } from '../lib/linkedInApi.js';
import { generateBrotherWebsiteBannerSVG, generateBrotherWaveCorporateSVG, OFFICIAL_BROTHER_LOGO_URL } from '../lib/svgBrotherWebsiteTemplates.js';

export default function HomeFeedAnalytics({ isDark, onNavigateToModule }) {
  const sampleBannerSvg = generateBrotherWebsiteBannerSVG({
    badgeText: "Free NTUC Vouchers!*",
    headline: "Celebrate SG Promotion",
    subtitle: "Purchase selected products and get NTUC voucher for FREE!*",
    theme: "national-day"
  });

  const sampleWaveSvg = generateBrotherWaveCorporateSVG({
    badgeText: "Brother Official E-store Special",
    headline: "5% Off Toner Bundle Promotion",
    subtitle: "Purchase TN269C/M/Y/BK toners as a set & receive 5% off the bundle set*",
    promoTag: "Free Delivery"
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Welcome Hero / Brand Card */}
      <div className={`rounded-2xl p-4 sm:p-6 border transition-colors ${
        isDark 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={OFFICIAL_BROTHER_LOGO_URL}
              alt="Brother Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-contain border p-1 bg-white shadow-sm shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-base sm:text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Brother International Singapore
                </h1>
                <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-[#0f2ea2] dark:text-blue-400 font-bold border border-blue-500/20">
                  Verified Page
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Official LinkedIn Presence Stream & Intelligence Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto text-center flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              Open Live LinkedIn Page
            </a>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row (LinkedIN API Telemetry) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1 */}
        <div className={`p-3.5 sm:p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
            <span className="truncate">Total Followers</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {BROTHER_LINKEDIN_ANALYTICS.totalFollowers.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {BROTHER_LINKEDIN_ANALYTICS.followerGrowthMonth}
          </div>
        </div>

        {/* KPI 2 */}
        <div className={`p-3.5 sm:p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
            <span className="truncate">30d Impressions</span>
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 shrink-0" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {BROTHER_LINKEDIN_ANALYTICS.impressions30d}
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {BROTHER_LINKEDIN_ANALYTICS.impressionsGrowth}
          </div>
        </div>

        {/* KPI 3 */}
        <div className={`p-3.5 sm:p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
            <span className="truncate">Avg Engagement</span>
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
          </div>
          <div className={`text-xl sm:text-2xl font-black text-[#0f2ea2] dark:text-blue-400`}>
            {BROTHER_LINKEDIN_ANALYTICS.avgEngagementRate}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
            Bench: <strong>{BROTHER_LINKEDIN_ANALYTICS.benchmarkRate}</strong>
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`p-3.5 sm:p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
            <span className="truncate">Quarterly Posts</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {BROTHER_LINKEDIN_ANALYTICS.publishedPostsQuarter}
          </div>
          <div className="text-[10px] sm:text-xs text-blue-500 font-bold mt-1">
            100% cadence
          </div>
        </div>
      </div>

      {/* Content Strategy Breakdown Card */}
      <div className={`rounded-2xl p-4 sm:p-6 border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div>
            <h3 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Content Pillar Performance Breakdown
            </h3>
            <p className="text-[11px] text-slate-500">Engagement by post category</p>
          </div>
          <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
            Live Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BROTHER_LINKEDIN_ANALYTICS.breakdown.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>{item.type}</span>
                <span className="text-[#0f2ea2] dark:text-blue-400 font-mono">{item.share}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between mt-1">
                <span>Avg Engagement:</span>
                <strong className="text-emerald-500">{item.avgEngagement}</strong>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                Reaction: {item.topReaction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Stream of Brother LinkedIn Posts */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div>
            <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Recent Stream from Official LinkedIn
            </h3>
            <p className="text-[11px] text-slate-500">
              Live feed from Brother Singapore company page
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => onNavigateToModule('module-1')}
              className="text-[#0f2ea2] dark:text-blue-400 hover:underline"
            >
              Draft Festive Post (Mod 1) →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Post 1 */}
          <div className={`rounded-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-3.5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
              <img
                src={OFFICIAL_BROTHER_LOGO_URL}
                alt="Brother"
                className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border shrink-0"
              />
              <div>
                <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Brother International Singapore Pte Ltd
                </h4>
                <span className="text-[10px] text-slate-400">1 day ago • Singapore</span>
              </div>
            </div>
            <div className="p-3.5 text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {RECENT_LINKEDIN_POSTS[0].content}
            </div>
            {/* Visual Banner */}
            <div className="w-full bg-slate-950 flex items-center justify-center border-t border-b overflow-hidden">
              <div 
                className="w-full aspect-[12/5] flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: sampleBannerSvg }}
              />
            </div>
            <div className="p-3 flex items-center justify-between text-xs text-slate-500">
              <span>👍 {RECENT_LINKEDIN_POSTS[0].likes} • {RECENT_LINKEDIN_POSTS[0].comments} comments</span>
              <span className="text-[#0f2ea2] dark:text-blue-400 font-semibold text-[11px]">Live on LinkedIn</span>
            </div>
          </div>

          {/* Post 2 */}
          <div className={`rounded-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-3.5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
              <img
                src={OFFICIAL_BROTHER_LOGO_URL}
                alt="Brother"
                className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border shrink-0"
              />
              <div>
                <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Brother International Singapore Pte Ltd
                </h4>
                <span className="text-[10px] text-slate-400">4 days ago • Singapore</span>
              </div>
            </div>
            <div className="p-3.5 text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {RECENT_LINKEDIN_POSTS[1].content}
            </div>
            {/* Visual Banner */}
            <div className="w-full bg-slate-950 flex items-center justify-center border-t border-b overflow-hidden">
              <div 
                className="w-full aspect-[12/5] flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: sampleWaveSvg }}
              />
            </div>
            <div className="p-3 flex items-center justify-between text-xs text-slate-500">
              <span>💡 {RECENT_LINKEDIN_POSTS[1].likes} • {RECENT_LINKEDIN_POSTS[1].comments} comments</span>
              <span className="text-[#0f2ea2] dark:text-blue-400 font-semibold text-[11px]">Live on LinkedIn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
