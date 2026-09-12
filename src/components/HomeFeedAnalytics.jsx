import React, { useState, useMemo } from 'react';
import { 
  Users, TrendingUp, Eye, ThumbsUp, MessageSquare, Repeat2, ExternalLink, 
  Sparkles, BarChart3, Database, Search, RefreshCw, CheckCircle2, ArrowUpDown, 
  ChevronRight, X, Layers, AlertCircle, Share2, Award, Calendar
} from 'lucide-react';
import { BROTHER_LINKEDIN_ANALYTICS, RECENT_LINKEDIN_POSTS } from '../lib/linkedInApi.js';
import { generateBrotherWebsiteBannerSVG, generateBrotherWaveCorporateSVG, OFFICIAL_BROTHER_LOGO_URL } from '../lib/svgBrotherWebsiteTemplates.js';
import { safeGetItem } from '../lib/storage.js';

export default function HomeFeedAnalytics({ isDark, onNavigateToModule }) {
  const analytics = BROTHER_LINKEDIN_ANALYTICS;
  const [posts, setPosts] = useState(RECENT_LINKEDIN_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('impressions'); // 'impressions', 'engagement', 'date', 'reactions'
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);

  // Syncing to Notion state
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingSingleId, setSyncingSingleId] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

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

  // Calculate dynamic telemetry aggregate summaries
  const telemetrySummary = useMemo(() => {
    const totalImpressions = posts.reduce((acc, p) => acc + (p.impressions || 0), 0);
    const totalReactions = posts.reduce((acc, p) => acc + (p.likes || 0), 0);
    const totalComments = posts.reduce((acc, p) => acc + (p.comments || 0), 0);
    const totalReposts = posts.reduce((acc, p) => acc + (p.reposts || 0), 0);
    const syncedCount = posts.filter(p => p.notionStatus && p.notionStatus.includes('Synced')).length;

    return {
      totalImpressions,
      totalReactions,
      totalComments,
      totalReposts,
      syncedCount,
      totalPosts: posts.length
    };
  }, [posts]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(posts.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [posts]);

  // Filtered & Sorted posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch = !searchQuery || 
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'impressions') return (b.impressions || 0) - (a.impressions || 0);
        if (sortBy === 'engagement') {
          const rateA = parseFloat(a.engagementRate) || 0;
          const rateB = parseFloat(b.engagementRate) || 0;
          return rateB - rateA;
        }
        if (sortBy === 'reactions') return (b.likes || 0) - (a.likes || 0);
        if (sortBy === 'date') return new Date(b.date || '2026-01-01') - new Date(a.date || '2026-01-01');
        return 0;
      });
  }, [posts, selectedCategory, searchQuery, sortBy]);

  // Batch Sync all post telemetry to Notion repository
  const handleSyncAllToNotion = async () => {
    const token = safeGetItem('notion_token');
    const explicitDb = safeGetItem('notion_database_id') || '3c701136de4881de9d29ca4ea415e856';

    setSyncingAll(true);
    setSyncResult(null);

    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          databaseId: explicitDb,
          posts: posts.map(p => ({
            title: p.title || p.content.slice(0, 40) + '...',
            content: p.content,
            category: p.category || 'AI & Employer Branding',
            status: 'Published',
            author: p.author || 'Allan Cheng',
            date: p.date,
            urn: p.urn,
            impressions: p.impressions || 0,
            likes: p.likes || 0,
            comments: p.comments || 0,
            reposts: p.reposts || 0,
            engagementRate: p.engagementRate || '0.0%',
            postUrl: p.postUrl
          }))
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSyncResult({
          type: 'success',
          message: data.message || `Synchronized ${posts.length} posts & analytics to Notion Repository!`,
          url: data.url
        });
        // Mark all as synced
        setPosts(prev => prev.map(p => ({ ...p, notionStatus: 'Synced to Notion Repository' })));
      } else {
        setSyncResult({
          type: 'error',
          message: data.error || 'Failed to sync to Notion database. Check your token in Settings.'
        });
      }
    } catch (e) {
      setSyncResult({
        type: 'error',
        message: e.message || 'Network error syncing post analytics to Notion'
      });
    } finally {
      setSyncingAll(false);
    }
  };

  // Sync a single post to Notion repository
  const handleSyncSinglePost = async (post) => {
    const token = safeGetItem('notion_token');
    const explicitDb = safeGetItem('notion_database_id') || '3c701136de4881de9d29ca4ea415e856';

    setSyncingSingleId(post.id);

    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          databaseId: explicitDb,
          post: {
            title: post.title || post.content.slice(0, 40) + '...',
            content: post.content,
            category: post.category || 'AI & Employer Branding',
            status: 'Published',
            author: post.author || 'Allan Cheng',
            date: post.date,
            urn: post.urn,
            impressions: post.impressions || 0,
            likes: post.likes || 0,
            comments: post.comments || 0,
            reposts: post.reposts || 0,
            engagementRate: post.engagementRate || '0.0%',
            postUrl: post.postUrl
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, notionStatus: 'Synced to Notion Repository' } : p));
        setSyncResult({
          type: 'success',
          message: `"${post.title}" analytics successfully updated in Notion Repository!`,
          url: data.url
        });
      } else {
        setSyncResult({
          type: 'error',
          message: data.error || 'Failed to sync post'
        });
      }
    } catch (e) {
      setSyncResult({
        type: 'error',
        message: e.message
      });
    } finally {
      setSyncingSingleId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Welcome Hero / Brand Card */}
      <div className={`rounded-2xl p-4 sm:p-6 border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
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
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Linked Us In Studio • Enterprise Executive Dashboard
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
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

      {/* Analytics KPI Row */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Company Page Telemetry (Brother Singapore)
          </h3>
          <button
            onClick={() => onNavigateToModule('notion-hub')}
            className="text-[10px] font-semibold text-[#0f2ea2] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Notion Repository Hub ↗</span>
          </button>
        </div>

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
              {analytics.totalFollowers.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {analytics.followerGrowthMonth}
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
              {analytics.impressions30d}
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {analytics.impressionsGrowth}
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
              {analytics.avgEngagementRate}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
              Bench: <strong>{analytics.benchmarkRate}</strong> (+177%)
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
              {analytics.publishedPostsQuarter}
            </div>
            <div className="text-[10px] sm:text-xs text-blue-500 font-bold mt-1">
              100% cadence on track
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Granular Post Analytics & Notion Repository Explorer */}
      <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Section Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold mb-1">
              <Database className="w-3 h-3" />
              Notion Enterprise Repository & Telemetry
            </div>
            <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Per-Post Telemetry & Analytics Explorer
            </h3>
            <p className="text-xs text-slate-500">
              Inspect granular post metrics. Pull and synchronize telemetry records directly into the Notion Posts Database repository.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncAllToNotion}
              disabled={syncingAll}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
              <span>{syncingAll ? 'Syncing All to Notion...' : '⚡ Pull & Sync Analytics to Notion'}</span>
            </button>
          </div>
        </div>

        {/* Sync Notification Banner */}
        {syncResult && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 ${
            syncResult.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {syncResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span className="font-semibold">{syncResult.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {syncResult.url && (
                <a
                  href={syncResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 text-[11px]"
                >
                  <span>Open Notion Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={() => setSyncResult(null)}
                className="opacity-60 hover:opacity-100 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Mini Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tracked Posts</div>
            <div className={`text-lg font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {telemetrySummary.totalPosts}
            </div>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Post Reach</div>
            <div className="text-lg font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
              {telemetrySummary.totalImpressions.toLocaleString()}
            </div>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Interactions</div>
            <div className="text-lg font-black text-[#0f2ea2] dark:text-blue-400 mt-0.5">
              {(telemetrySummary.totalReactions + telemetrySummary.totalComments + telemetrySummary.totalReposts).toLocaleString()}
            </div>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Notion Repository Status</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1.5">
              <span>{telemetrySummary.syncedCount}/{telemetrySummary.totalPosts} Synced</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, keywords or category..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
              } focus:outline-none focus:ring-1 focus:ring-[#0f2ea2]`}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0f2ea2] text-white shadow-sm'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Topics' : cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`text-xs font-semibold py-2 px-2.5 rounded-xl border cursor-pointer ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <option value="impressions">Sort: Impressions (High to Low)</option>
              <option value="engagement">Sort: Highest Engagement %</option>
              <option value="reactions">Sort: Most Reactions</option>
              <option value="date">Sort: Most Recent Date</option>
            </select>
          </div>
        </div>

        {/* Post Telemetry Table */}
        <div className="border rounded-xl overflow-hidden dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] uppercase tracking-wider font-bold ${
                  isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  <th className="py-3 px-3.5 min-w-[220px]">Post Title & Topic</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">Reactions</th>
                  <th className="py-3 px-3 text-right">Comments</th>
                  <th className="py-3 px-3 text-right">Reposts</th>
                  <th className="py-3 px-3 text-center">Engagement</th>
                  <th className="py-3 px-3.5 text-center min-w-[140px]">Notion Repository</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filteredPosts.map((post) => {
                  const isSynced = post.notionStatus && post.notionStatus.includes('Synced');
                  const isSyncing = syncingSingleId === post.id;
                  const engagementNum = parseFloat(post.engagementRate) || 0;

                  return (
                    <tr 
                      key={post.id}
                      className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40`}
                    >
                      {/* Post Title & Category */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                          {post.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">
                            {post.category}
                          </span>
                          <span>•</span>
                          <span>{post.date}</span>
                          <span>•</span>
                          <span>{post.author}</span>
                        </div>
                      </td>

                      {/* Impressions */}
                      <td className="py-3 px-3 text-right font-black font-mono text-slate-800 dark:text-slate-200">
                        {post.impressions?.toLocaleString()}
                      </td>

                      {/* Reactions */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-blue-500" />
                          <span>{post.likes}</span>
                        </span>
                      </td>

                      {/* Comments */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-emerald-500" />
                          <span>{post.comments}</span>
                        </span>
                      </td>

                      {/* Reposts */}
                      <td className="py-3 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Repeat2 className="w-3 h-3 text-purple-500" />
                          <span>{post.reposts}</span>
                        </span>
                      </td>

                      {/* Engagement Rate */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          engagementNum >= 5.0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {post.engagementRate}
                        </span>
                      </td>

                      {/* Notion Status */}
                      <td className="py-3 px-3.5 text-center">
                        {isSynced ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>In Repository</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSyncSinglePost(post)}
                            disabled={isSyncing}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0f2ea2] hover:text-white dark:bg-slate-800 dark:hover:bg-[#0f2ea2] text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-all cursor-pointer"
                          >
                            <Database className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>{isSyncing ? 'Syncing...' : 'Sync to Notion'}</span>
                          </button>
                        )}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedPostDetail(post)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0f2ea2] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: Live Visual Stream of Brother LinkedIn Posts */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
          <div>
            <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Recent Visual Feed from Official LinkedIn
            </h3>
            <p className="text-[11px] text-slate-500">
              Live feed visual cards with website promotion templates and wave themes
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => onNavigateToModule('module-1')}
              className="text-[#0f2ea2] dark:text-blue-400 hover:underline cursor-pointer"
            >
              Generate Event Posts →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Post 1 Card */}
          <div className={`rounded-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300">
                18,450 Impr
              </span>
            </div>
            <div className="p-3.5 text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
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

          {/* Post 2 Card */}
          <div className={`rounded-2xl border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-3.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300">
                14,200 Impr
              </span>
            </div>
            <div className="p-3.5 text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
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
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedPostDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-xl rounded-2xl border p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-start justify-between gap-3 border-b pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0f2ea2] dark:text-blue-400 font-bold">
                  Post Performance Telemetry
                </span>
                <h3 className="text-base font-bold mt-0.5 leading-snug">
                  {selectedPostDetail.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>{selectedPostDetail.date}</span>
                  <span>•</span>
                  <span>{selectedPostDetail.category}</span>
                  <span>•</span>
                  <span>Author: {selectedPostDetail.author}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <Eye className="w-4 h-4 mx-auto text-cyan-500 mb-1" />
                <div className="text-[10px] text-slate-400 uppercase font-bold">Impressions</div>
                <div className="text-base font-black font-mono mt-0.5">{selectedPostDetail.impressions?.toLocaleString()}</div>
              </div>
              <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <ThumbsUp className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                <div className="text-[10px] text-slate-400 uppercase font-bold">Reactions</div>
                <div className="text-base font-black font-mono mt-0.5">{selectedPostDetail.likes}</div>
              </div>
              <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <MessageSquare className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                <div className="text-[10px] text-slate-400 uppercase font-bold">Comments</div>
                <div className="text-base font-black font-mono mt-0.5">{selectedPostDetail.comments}</div>
              </div>
              <div className={`p-3 rounded-xl border text-center ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <BarChart3 className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                <div className="text-[10px] text-slate-400 uppercase font-bold">Engagement</div>
                <div className="text-base font-black font-mono text-emerald-500 mt-0.5">{selectedPostDetail.engagementRate}</div>
              </div>
            </div>

            {/* Benchmark Comparative Bar */}
            <div className={`p-3 rounded-xl border space-y-2 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Engagement vs Tech Industry Benchmark</span>
                <span className="text-emerald-500">{selectedPostDetail.engagementRate} vs 2.10%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#0f2ea2] h-full" 
                  style={{ width: `${Math.min(100, (parseFloat(selectedPostDetail.engagementRate) / 8.0) * 100)}%` }} 
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>0%</span>
                <span>Industry Average: 2.10%</span>
                <span>Top Decile: 7.0%+</span>
              </div>
            </div>

            {/* Post Content Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Published Content
              </label>
              <div className={`p-3.5 rounded-xl border font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                {selectedPostDetail.content}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t dark:border-slate-800">
              <a
                href={selectedPostDetail.postUrl || "https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline"
              >
                <span>View Live on LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    handleSyncSinglePost(selectedPostDetail);
                  }}
                  disabled={syncingSingleId === selectedPostDetail.id}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Database className={`w-3.5 h-3.5 ${syncingSingleId === selectedPostDetail.id ? 'animate-spin' : ''}`} />
                  <span>{syncingSingleId === selectedPostDetail.id ? 'Syncing...' : 'Sync to Notion Repository'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
