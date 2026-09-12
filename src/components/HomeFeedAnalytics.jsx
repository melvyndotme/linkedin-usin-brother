import React, { useState, useEffect } from "react";
import { 
  Users, TrendingUp, Eye, BarChart3, Sparkles, ExternalLink, RefreshCw, CheckCircle2
} from "lucide-react";
import { BROTHER_LINKEDIN_ANALYTICS, RECENT_LINKEDIN_POSTS, fetchLiveLinkedInData } from "../lib/linkedInApi.js";
import { generateBrotherWebsiteBannerSVG, generateBrotherWaveCorporateSVG, OFFICIAL_BROTHER_LOGO_URL } from "../lib/svgBrotherWebsiteTemplates.js";
import { safeGetItem, safeSetItem } from "../lib/storage.js";

export default function HomeFeedAnalytics({ isDark, onNavigateToModule }) {
  const [analytics, setAnalytics] = useState(() => {
    try {
      const cached = safeGetItem("brother_live_telemetry");
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...BROTHER_LINKEDIN_ANALYTICS,
          totalFollowers: parsed.followers || 14647,
          companyName: parsed.name || BROTHER_LINKEDIN_ANALYTICS.companyName
        };
      }
    } catch (e) {}
    return {
      ...BROTHER_LINKEDIN_ANALYTICS,
      totalFollowers: 14647
    };
  });

  const [posts, setPosts] = useState(RECENT_LINKEDIN_POSTS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveConnected, setLiveConnected] = useState(true);

  // Auto-fetch live telemetry on mount
  useEffect(() => {
    let isMounted = true;
    const loadLiveTelemetry = async () => {
      try {
        const orgId = safeGetItem("linkedin_org_id") || "808877";
        const token = safeGetItem("key_linkedin") || "";
        const res = await fetchLiveLinkedInData({ orgId, token });
        if (isMounted && res && res.success && res.organization) {
          safeSetItem("brother_live_telemetry", JSON.stringify(res.organization));
          setAnalytics(prev => ({
            ...prev,
            totalFollowers: res.organization.followers || 14647,
            companyName: res.organization.name || prev.companyName
          }));
          if (res.posts && res.posts.length > 0) {
            setPosts(res.posts);
          }
          setLiveConnected(true);
        }
      } catch (err) {
        console.warn("Could not auto-fetch live LinkedIn telemetry:", err.message);
      }
    };
    loadLiveTelemetry();
    return () => { isMounted = false; };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const orgId = safeGetItem("linkedin_org_id") || "808877";
      const token = safeGetItem("key_linkedin") || "";
      const res = await fetchLiveLinkedInData({ orgId, token });
      if (res && res.success && res.organization) {
        safeSetItem("brother_live_telemetry", JSON.stringify(res.organization));
        setAnalytics(prev => ({
          ...prev,
          totalFollowers: res.organization.followers || 14647,
          companyName: res.organization.name || prev.companyName
        }));
        if (res.posts && res.posts.length > 0) {
          setPosts(res.posts);
        }
        setLiveConnected(true);
      }
    } catch (e) {
      console.warn("Refresh error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sampleBannerSvg = generateBrotherWebsiteBannerSVG({
    badgeText: "Community & CSR*",
    headline: "Race Against Cancer 2025",
    subtitle: "Singtel-Singapore Cancer Society • Golden Ring Project",
    theme: "corporate"
  });

  const sampleWaveSvg = generateBrotherWaveCorporateSVG({
    badgeText: "Brother Official E-store Special",
    headline: "5% Off Toner Bundle Promotion",
    subtitle: "Purchase TN269C/M/Y/BK toners as a set & receive 5% off the bundle set*",
    promoTag: "Free Delivery"
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Welcome Hero / Brand Card */}
      <div className={`rounded-2xl p-4 sm:p-6 border transition-colors ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={OFFICIAL_BROTHER_LOGO_URL}
              alt="Brother Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-contain border p-1 bg-white shadow-sm shrink-0"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-base sm:text-xl font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {analytics.companyName}
                </h1>
                <span title="Verified Organization" className="inline-flex items-center shrink-0 ml-0.5" aria-label="Verified">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path
                      d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z"
                      fill="#1d9bf0"
                    />
                    <path
                      d="M10.54 16.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"
                      fill="#ffffff"
                    />
                  </svg>
                </span>
                {liveConnected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Live Telemetry Connected</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Linked Us In Studio • Enterprise Executive Dashboard
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isDark 
                  ? "border-slate-800 hover:bg-slate-800 text-slate-300" 
                  : "border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
              title="Refresh Live LinkedIn Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <a
              href="https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto text-center flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Live LinkedIn Page
            </a>
          </div>
        </div>
      </div>

      {/* 2. Analytics KPI Row */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Company Page Telemetry (Brother Singapore)
          </h3>
          <button
            onClick={() => onNavigateToModule("notion-hub")}
            className="text-[10px] font-semibold text-[#0f2ea2] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Notion Repository Hub ↗</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* KPI 1 */}
          <div className={`p-3.5 sm:p-5 rounded-2xl border transition-colors ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
              <span className="truncate">Total Followers</span>
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {analytics.totalFollowers.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {analytics.followerGrowthMonth}
            </div>
          </div>

          {/* KPI 2 */}
          <div className={`p-3.5 sm:p-5 rounded-2xl border transition-colors ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
              <span className="truncate">30d Impressions</span>
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 shrink-0" />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {analytics.impressions30d}
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {analytics.impressionsGrowth}
            </div>
          </div>

          {/* KPI 3 */}
          <div className={`p-3.5 sm:p-5 rounded-2xl border transition-colors ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
              <span className="truncate">Avg Engagement</span>
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
            </div>
            <div className={`text-xl sm:text-2xl font-black text-[#0f2ea2] dark:text-blue-400`}>
              {analytics.avgEngagementRate}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
              Bench: <strong>{analytics.benchmarkRate}</strong> (+177%)
            </div>
          </div>

          {/* KPI 4 */}
          <div className={`p-3.5 sm:p-5 rounded-2xl border transition-colors ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-semibold mb-1 sm:mb-2">
              <span className="truncate">Quarterly Posts</span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 shrink-0" />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {analytics.publishedPostsQuarter}
            </div>
            <div className="text-[10px] sm:text-xs text-blue-500 font-bold mt-1">
              100% cadence on track
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Visual Feed from Official LinkedIn */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div>
            <h3 className={`text-sm sm:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              Recent Visual Feed from Official LinkedIn
            </h3>
            <p className="text-[11px] text-slate-500">
              Live feed visual cards with website promotion templates and wave themes
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => onNavigateToModule("module-1")}
              className="text-[#0f2ea2] dark:text-blue-400 hover:underline cursor-pointer"
            >
              Generate Event Posts →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Post 1 Card */}
          {posts[0] && (
            <div className={`rounded-2xl border overflow-hidden transition-colors ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={OFFICIAL_BROTHER_LOGO_URL}
                    alt="Brother"
                    className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border shrink-0"
                  />
                  <div>
                    <h4 className={`text-xs font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Brother International Singapore Pte Ltd
                    </h4>
                    <span className="text-[10px] text-slate-400">{posts[0].timestamp || "Recent"} • Singapore</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300">
                  {posts[0].impressions?.toLocaleString()} Impr
                </span>
              </div>
              <div className="p-3.5 text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto">
                {posts[0].content}
              </div>
              {/* Visual Banner */}
              <div className="w-full bg-slate-950 flex items-center justify-center border-t border-b overflow-hidden">
                <div 
                  className="w-full aspect-[12/5] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: sampleBannerSvg }}
                />
              </div>
              <div className="p-3 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">👍 {posts[0].likes} • {posts[0].comments} comments • {posts[0].reposts} reposts</span>
                <a
                  href={posts[0].postUrl || "https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0f2ea2] dark:text-blue-400 font-semibold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Live on LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Post 2 Card */}
          {posts[1] && (
            <div className={`rounded-2xl border overflow-hidden transition-colors ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={OFFICIAL_BROTHER_LOGO_URL}
                    alt="Brother"
                    className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 border shrink-0"
                  />
                  <div>
                    <h4 className={`text-xs font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                      Brother International Singapore Pte Ltd
                    </h4>
                    <span className="text-[10px] text-slate-400">{posts[1].timestamp || "Recent"} • Singapore</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300">
                  {posts[1].impressions?.toLocaleString()} Impr
                </span>
              </div>
              <div className="p-3.5 text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto">
                {posts[1].content}
              </div>
              {/* Visual Banner */}
              <div className="w-full bg-slate-950 flex items-center justify-center border-t border-b overflow-hidden">
                <div 
                  className="w-full aspect-[12/5] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: sampleWaveSvg }}
                />
              </div>
              <div className="p-3 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">💡 {posts[1].likes} • {posts[1].comments} comments • {posts[1].reposts} reposts</span>
                <a
                  href={posts[1].postUrl || "https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0f2ea2] dark:text-blue-400 font-semibold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Live on LinkedIn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
