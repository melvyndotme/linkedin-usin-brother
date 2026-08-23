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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Hero / Brand Card */}
      <div className={`rounded-2xl p-6 border transition-colors ${
        isDark 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={OFFICIAL_BROTHER_LOGO_URL}
              alt="Brother Logo"
              className="w-14 h-14 rounded-xl object-contain border p-1 bg-white shadow-sm"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Brother International Singapore Pte Ltd
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-[#0f2ea2] font-bold border border-blue-500/20">
                  Verified Page
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official LinkedIn Presence Stream & Content Intelligence Command Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-[#0f2ea2] hover:bg-[#004b8f] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Open Live LinkedIn Page
            </a>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row (LinkedIN API Telemetry) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Total Followers</span>
            <Users className="w-4 h-4 text-[#0f2ea2]" />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {BROTHER_LINKEDIN_ANALYTICS.totalFollowers.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {BROTHER_LINKEDIN_ANALYTICS.followerGrowthMonth} this month
          </div>
        </div>

        {/* KPI 2 */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>30-Day Impressions</span>
            <Eye className="w-4 h-4 text-cyan-500" />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {BROTHER_LINKEDIN_ANALYTICS.impressions30d}
          </div>
          <div className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {BROTHER_LINKEDIN_ANALYTICS.impressionsGrowth} vs baseline
          </div>
        </div>

        {/* KPI 3 */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Avg Engagement Rate</span>
            <BarChart3 className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-black text-[#0f2ea2]`}>
            {BROTHER_LINKEDIN_ANALYTICS.avgEngagementRate}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Industry Benchmark: <strong className="text-slate-700">{BROTHER_LINKEDIN_ANALYTICS.benchmarkRate}</strong>
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Quarterly Posts</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {BROTHER_LINKEDIN_ANALYTICS.publishedPostsQuarter}
          </div>
          <div className="text-xs text-blue-500 font-bold mt-1">
            100% on-cadence schedule
          </div>
        </div>
      </div>

      {/* Content Strategy Breakdown Card */}
      <div className={`rounded-2xl p-6 border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Content Pillar Performance Breakdown
            </h3>
            <p className="text-xs text-slate-500">Live LinkedIn engagement by post category</p>
          </div>
          <span className="text-[11px] font-mono text-[#0f2ea2] bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
            LinkedIn API Live
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BROTHER_LINKEDIN_ANALYTICS.breakdown.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>{item.type}</span>
                <span className="text-[#0f2ea2] font-mono">{item.share}</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between mt-2">
                <span>Engagement:</span>
                <strong className="text-emerald-500">{item.avgEngagement}</strong>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Top Reaction: {item.topReaction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Stream of Brother LinkedIn Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Recent Stream from Official LinkedIn Page
            </h3>
            <p className="text-xs text-slate-500">
              Direct feed from https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToModule('module-1')}
              className="text-xs font-bold text-[#0f2ea2] hover:underline"
            >
              Draft Event Post (Module 1) →
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onNavigateToModule('module-2')}
              className="text-xs font-bold text-[#0f2ea2] hover:underline"
            >
              Draft AI Post (Module 2) →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Post 1 */}
          <div className={`rounded-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
              <img
                src={OFFICIAL_BROTHER_LOGO_URL}
                alt="Brother"
                className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 border"
              />
              <div>
                <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Brother International Singapore Pte Ltd
                </h4>
                <span className="text-[10px] text-slate-400">1 day ago • Singapore</span>
              </div>
            </div>
            <div className="p-4 text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {RECENT_LINKEDIN_POSTS[0].content}
            </div>
            {/* Visual Banner */}
            <div 
              className="w-full bg-slate-950 flex items-center justify-center max-h-56 overflow-hidden border-t border-b"
              dangerouslySetInnerHTML={{ __html: sampleBannerSvg }}
            />
            <div className="p-3 flex items-center justify-between text-xs text-slate-500">
              <span>👍 {RECENT_LINKEDIN_POSTS[0].likes} likes • {RECENT_LINKEDIN_POSTS[0].comments} comments</span>
              <span className="text-[#0f2ea2] font-semibold">Live on LinkedIn</span>
            </div>
          </div>

          {/* Post 2 */}
          <div className={`rounded-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
              <img
                src={OFFICIAL_BROTHER_LOGO_URL}
                alt="Brother"
                className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 border"
              />
              <div>
                <h4 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Brother International Singapore Pte Ltd
                </h4>
                <span className="text-[10px] text-slate-400">4 days ago • Singapore</span>
              </div>
            </div>
            <div className="p-4 text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
              {RECENT_LINKEDIN_POSTS[1].content}
            </div>
            {/* Visual Banner */}
            <div 
              className="w-full bg-slate-950 flex items-center justify-center max-h-56 overflow-hidden border-t border-b"
              dangerouslySetInnerHTML={{ __html: sampleWaveSvg }}
            />
            <div className="p-3 flex items-center justify-between text-xs text-slate-500">
              <span>💡 {RECENT_LINKEDIN_POSTS[1].likes} reactions • {RECENT_LINKEDIN_POSTS[1].comments} comments</span>
              <span className="text-[#0f2ea2] font-semibold">Live on LinkedIn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
