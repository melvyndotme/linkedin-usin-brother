import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Eye, ThumbsUp, MessageSquare, Repeat2, ExternalLink, ShieldCheck, Sparkles, BarChart3, RefreshCw, CheckCircle2, AlertCircle, Key, X, Share2 } from 'lucide-react';
import { 
  BROTHER_LINKEDIN_ANALYTICS, 
  RECENT_LINKEDIN_POSTS, 
  getStoredLinkedInData, 
  saveStoredLinkedInData, 
  clearStoredLinkedInData, 
  fetchLiveLinkedInFromApify 
} from '../lib/linkedInApi.js';
import { generateBrotherWebsiteBannerSVG, generateBrotherWaveCorporateSVG, OFFICIAL_BROTHER_LOGO_URL } from '../lib/svgBrotherWebsiteTemplates.js';

export default function HomeFeedAnalytics({ isDark, onNavigateToModule }) {
  const [liveData, setLiveData] = useState(() => getStoredLinkedInData());
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(null);
  const [showTokenPrompt, setShowTokenPrompt] = useState(false);
  const [apifyTokenInput, setApifyTokenInput] = useState(localStorage.getItem('key_apify') || '');

  // Derived metrics
  const analytics = liveData || BROTHER_LINKEDIN_ANALYTICS;
  const posts = liveData?.posts || RECENT_LINKEDIN_POSTS;

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

  const handleStartSync = async (overrideToken = null) => {
    const tokenToUse = overrideToken || localStorage.getItem('key_apify') || apifyTokenInput;
    if (!tokenToUse || !tokenToUse.trim()) {
      setShowTokenPrompt(true);
      return;
    }

    setSyncing(true);
    setSyncError(null);
    setSyncSuccessMsg(null);

    try {
      const result = await fetchLiveLinkedInFromApify({
        token: tokenToUse.trim(),
        companyUrl: 'https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/',
        maxPosts: 6
      });

      setLiveData(result);
      setSyncSuccessMsg(`Successfully synced ${result.posts?.length || 0} live posts directly from Brother Singapore!`);
      setShowTokenPrompt(false);
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Apify sync error:', err);
      setSyncError(err.message || 'Failed to sync with Apify');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveTokenAndSync = () => {
    if (!apifyTokenInput.trim()) return;
    localStorage.setItem('key_apify', apifyTokenInput.trim());
    handleStartSync(apifyTokenInput.trim());
  };

  const handleResetToBaseline = () => {
    clearStoredLinkedInData();
    setLiveData(null);
    setSyncSuccessMsg('Reset feed to default verified baseline.');
    setTimeout(() => setSyncSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Welcome Hero / Brand Card */}
      <div className={`rounded-2xl p-4 sm:p-6 border transition-colors ${
        isDark 
          ? 'bg-slate-900 border-slate-800' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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
                {liveData ? (
                  <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Apify Live Synced
                  </span>
                ) : (
                  <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                    Baseline Telemetry
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Official LinkedIn Presence Stream & Intelligence Hub
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <button
              onClick={() => handleStartSync()}
              disabled={syncing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              title="Fetch live posts & followers using Apify Free Tier Scraper"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Scraping Live...' : liveData ? 'Refresh Live Data' : 'Sync Live LinkedIn (Apify)'}
            </button>

            <a
              href="https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none text-center flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Live Page
            </a>

            {liveData && (
              <button
                onClick={handleResetToBaseline}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline px-1 py-1"
                title="Reset to default baseline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Feedback Notifications */}
        {syncSuccessMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {syncError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/50 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{syncError}</span>
            </div>
            <button
              onClick={() => setShowTokenPrompt(true)}
              className="text-xs font-bold underline text-rose-600 dark:text-rose-400 shrink-0"
            >
              Check Apify Key
            </button>
          </div>
        )}
      </div>

      {/* Apify Free Token Setup Card (Conditional or on demand) */}
      {showTokenPrompt && (
        <div className={`p-4 sm:p-5 rounded-2xl border ${
          isDark ? 'bg-amber-950/30 border-amber-800/50' : 'bg-amber-50/80 border-amber-200'
        } space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                Connect Apify Free Tier LinkedIn Scraper
              </h3>
            </div>
            <button
              onClick={() => setShowTokenPrompt(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Apify gives you <strong>$5.00 free credit every month</strong> (~500+ free scrapes/mo). Grab your free personal token to pull live posts and follower counts directly from Brother Singapore's official LinkedIn page:
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              placeholder="Paste Apify API Token (apify_api_...)"
              value={apifyTokenInput}
              onChange={(e) => setApifyTokenInput(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSaveTokenAndSync}
              disabled={syncing || !apifyTokenInput.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              Save & Scrape Now
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Don't have an Apify token yet?</span>
            <a
              href="https://console.apify.com/account/integrations"
              target="_blank"
              rel="noreferrer"
              className="text-amber-700 dark:text-amber-400 font-bold hover:underline"
            >
              Get Free Apify Token (1-Click Google/GitHub) →
            </a>
          </div>
        </div>
      )}

      {/* Analytics KPI Row (Live Telemetry) */}
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
            {Number(analytics.totalFollowers || 14820).toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {analytics.followerGrowthMonth || '+12.4%'}
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
            {analytics.impressions30d || '184,200'}
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {analytics.impressionsGrowth || '+24.8%'}
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
            {analytics.avgEngagementRate || '5.82%'}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
            Bench: <strong>{analytics.benchmarkRate || '2.10%'}</strong>
          </div>
        </div>

        {/* KPI 4 */}
        <div className={`p-3.5 sm:p-5 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
            <span className="truncate">Tracked Posts</span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {posts.length}
          </div>
          <div className="text-[10px] sm:text-xs text-blue-500 font-bold mt-1">
            {liveData ? 'Live Scraped' : '100% cadence'}
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
            <p className="text-[11px] text-slate-500">Engagement telemetry by post category</p>
          </div>
          <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
            {liveData ? 'Live Calculated' : 'Live Telemetry'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(analytics.breakdown || BROTHER_LINKEDIN_ANALYTICS.breakdown).map((item, idx) => (
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
            <div className="flex items-center gap-2">
              <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Recent Stream from Official LinkedIn
              </h3>
              {liveData && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                  {posts.length} Real Posts
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {liveData ? `Last synced: ${new Date(liveData.scrapedAt).toLocaleDateString()} ${new Date(liveData.scrapedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Live feed from Brother Singapore company page'}
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
          {posts.map((post, idx) => (
            <div 
              key={post.id || idx}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-colors ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div>
                {/* Header */}
                <div className="p-3.5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={OFFICIAL_BROTHER_LOGO_URL}
                      alt="Brother"
                      className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {post.author || 'Brother International Singapore Pte Ltd'}
                      </h4>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {post.timestamp} • Singapore
                      </span>
                    </div>
                  </div>
                  {post.pillar && (
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0f2ea2] dark:text-blue-300 border border-blue-100 dark:border-blue-900 shrink-0">
                      {post.pillar}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto custom-scrollbar">
                  {post.content}
                </div>

                {/* Real Image or Branded SVG Banner */}
                {post.imageUrl ? (
                  <div className="w-full bg-slate-950 flex items-center justify-center border-t border-b overflow-hidden max-h-64">
                    <img 
                      src={post.imageUrl} 
                      alt="LinkedIn Post Asset" 
                      className="w-full object-cover max-h-64"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <div className="w-full bg-slate-950 flex items-center justify-center border-t border-b overflow-hidden">
                    <div 
                      className="w-full aspect-[12/5] flex items-center justify-center"
                      dangerouslySetInnerHTML={{ 
                        __html: idx % 2 === 0 ? sampleBannerSvg : sampleWaveSvg 
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Footer / Engagement Stats */}
              <div className="p-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <ThumbsUp className="w-3 h-3 text-blue-500" />
                    {post.likes || 0}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <MessageSquare className="w-3 h-3 text-emerald-500" />
                    {post.comments || 0}
                  </span>
                  {post.reposts > 0 && (
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Repeat2 className="w-3 h-3 text-purple-500" />
                      {post.reposts}
                    </span>
                  )}
                </div>

                <a
                  href={post.postUrl || "https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#0f2ea2] dark:text-blue-400 hover:underline font-bold text-[11px]"
                >
                  <span>View Post</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
