import React, { useState } from 'react';
import { 
  Database, ShieldCheck, Mail, Send, CheckCircle2, Key, RefreshCw, 
  Table, Sparkles, ExternalLink, Code, Check, AlertCircle, Users, XCircle,
  Eye, ThumbsUp, MessageSquare, Repeat2, BarChart3
} from 'lucide-react';
import { safeGetItem, safeSetItem } from '../lib/storage.js';
import { RECENT_LINKEDIN_POSTS } from '../lib/linkedInApi.js';
import { BENCHMARK_TEMPLATES } from '../lib/templateExtractor.js';

export default function NotionDatabaseHub({ isDark }) {
  const [activeDb, setActiveDb] = useState('posts');
  const [magicEmail, setMagicEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [showApiPayload, setShowApiPayload] = useState(false);

  // Live Notion Provisioning / Seeding State
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);
  const [showManualInputs, setShowManualInputs] = useState(false);
  const [inputToken, setInputToken] = useState(safeGetItem('notion_token') || '');
  const [inputPageId, setInputPageId] = useState(safeGetItem('notion_page_id') || '3c701136-de48-8101-b258-000b3c706126');

  // Syncing telemetry state
  const [syncingAnalytics, setSyncingAnalytics] = useState(false);
  const [analyticsSyncResult, setAnalyticsSyncResult] = useState(null);

  // Template Seeding State
  const [seedingTemplates, setSeedingTemplates] = useState(false);
  const [templateSeedResult, setTemplateSeedResult] = useState(null);

  const teamData = [
    { name: "Allan Cheng", email: "allan.cheng@brother.com.sg", role: "Admin (POD Lead)", active: "✅ Active" },
    { name: "Chloe Lee", email: "chloe.lee@brother.com.sg", role: "Reviewer (HR Lead)", active: "✅ Active" },
    { name: "Sean", email: "sean.tan@brother.com.sg", role: "User (POD Member)", active: "✅ Active" },
    { name: "Melvyn Tan", email: "melvyn@befinityai.com", role: "External Advisor", active: "✅ Active" }
  ];

  const [postsData, setPostsData] = useState(RECENT_LINKEDIN_POSTS);

  const templatesData = BENCHMARK_TEMPLATES.map(t => ({
    name: t.name,
    category: t.category,
    tone: t.tone,
    source: t.source,
    status: "Active"
  }));

  const researchData = [
    { headline: "Autonomous Agents in Enterprise", topic: "Enterprise AI", source: "MIT Tech Review", freshness: "24 Hours", wordCount: "120 words" },
    { headline: "Hybrid Reasoning Cuts Hallucinations", topic: "Precision AI", source: "VentureBeat AI", freshness: "48 Hours", wordCount: "120 words" },
    { headline: "Singapore National AI Skills Push", topic: "Workforce", source: "Straits Times", freshness: "4 Days", wordCount: "120 words" },
    { headline: "Multimodal Document Intelligence", topic: "Document AI", source: "TechCrunch", freshness: "7 Days", wordCount: "120 words" }
  ];

  const handleSendMagicLink = () => {
    if (!magicEmail) return;
    setMagicLoading(true);
    setTimeout(() => {
      setMagicLoading(false);
      setMagicLinkSent(true);
    }, 1000);
  };

  const handleSeedAllNotionDatabases = async () => {
    setSeeding(true);
    setSeedResult(null);

    if (inputToken) safeSetItem('notion_token', inputToken);
    if (inputPageId) safeSetItem('notion_page_id', inputPageId);

    try {
      const res = await fetch('/api/notion/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: inputToken,
          pageId: inputPageId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSeedResult({
          status: 'success',
          message: data.message || 'All 4 Team Members have been inserted into your Notion Team Whitelist!'
        });
      } else {
        setSeedResult({
          status: 'error',
          message: data.error || 'Failed connecting to Notion API. Please verify NOTION_API_KEY in Vercel.'
        });
      }
    } catch (err) {
      setSeedResult({
        status: 'error',
        message: err.message || 'Network error connecting to /api/notion/seed'
      });
    } finally {
      setSeeding(false);
    }
  };

  // Pull & sync post analytics into Notion repository
  const handleSyncAnalyticsToRepository = async () => {
    setSyncingAnalytics(true);
    setAnalyticsSyncResult(null);

    const token = inputToken || safeGetItem('notion_token');
    const dbId = safeGetItem('notion_database_id') || '3c701136de4881de9d29ca4ea415e856';

    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          databaseId: dbId,
          posts: postsData.map(p => ({
            title: p.title,
            content: p.content,
            category: p.category,
            status: 'Published',
            author: p.author,
            date: p.date,
            urn: p.urn,
            impressions: p.impressions,
            likes: p.likes,
            comments: p.comments,
            reposts: p.reposts,
            engagementRate: p.engagementRate,
            postUrl: p.postUrl
          }))
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAnalyticsSyncResult({
          type: 'success',
          message: data.message || `Successfully synced ${postsData.length} post analytics into Notion repository!`,
          url: data.url
        });
      } else {
        setAnalyticsSyncResult({
          type: 'error',
          message: data.error || 'Failed to sync analytics to Notion'
        });
      }
    } catch (e) {
      setAnalyticsSyncResult({
        type: 'error',
        message: e.message
      });
    } finally {
      setSyncingAnalytics(false);
    }
  };

  const handleSeedTemplatesToNotion = async () => {
    setSeedingTemplates(true);
    setTemplateSeedResult(null);

    const token = inputToken || safeGetItem('notion_token');
    const pageId = inputPageId || safeGetItem('notion_page_id') || '3c701136-de48-8101-b258-000b3c706126';

    try {
      const res = await fetch('/api/notion/save-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          pageId: pageId,
          templates: BENCHMARK_TEMPLATES
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTemplateSeedResult({
          status: 'success',
          message: `Successfully seeded all ${data.savedCount} Brother benchmark templates into Notion Template Library!`,
          url: data.notionUrl
        });
      } else {
        const errorMsg = data.error || (data.results && data.results.find(r => !r.success)?.error) || 'Failed to seed templates to Notion. Please check your NOTION_API_KEY.';
        setTemplateSeedResult({
          status: 'error',
          message: errorMsg
        });
      }
    } catch (e) {
      setTemplateSeedResult({
        status: 'error',
        message: e.message
      });
    } finally {
      setSeedingTemplates(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <Database className="w-3.5 h-3.5" />
              Enterprise Repository & Archive
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Enterprise Post & Telemetry Repository
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Notion serves as the <strong className="text-[#0f2ea2] dark:text-blue-400">enterprise repository & archive</strong> for final published posts, verified analytics telemetry, and team whitelist records. Drafting and multi-agent generation happen natively inside LinkedUsIn Studio.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowManualInputs(!showManualInputs)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {showManualInputs ? 'Hide Token Input' : 'Token Override'}
            </button>
            <button
              onClick={handleSeedAllNotionDatabases}
              disabled={seeding}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <Users className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'Syncing Rows into Notion...' : '⚡ Populate Team Whitelist in Notion'}
            </button>
          </div>
        </div>

        {/* Manual Token & Page ID Inputs */}
        {showManualInputs && (
          <div className="mt-4 pt-4 border-t dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notion Integration Secret (Overrides Vercel env)
              </label>
              <input
                type="password"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="ntn_... or secret_..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notion Page ID
              </label>
              <input
                type="text"
                value={inputPageId}
                onChange={(e) => setInputPageId(e.target.value)}
                placeholder="e.g. 3c701136de488101b258000b3c706126"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>
        )}

        {/* Seed Result Alert */}
        {seedResult && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            seedResult.status === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {seedResult.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{seedResult.message}</span>
            </div>
            <button onClick={() => setSeedResult(null)} className="opacity-60 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Analytics Sync Result Alert */}
        {analyticsSyncResult && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            analyticsSyncResult.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {analyticsSyncResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{analyticsSyncResult.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {analyticsSyncResult.url && (
                <a
                  href={analyticsSyncResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline hover:opacity-80 flex items-center gap-1"
                >
                  <span>Open Notion</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button onClick={() => setAnalyticsSyncResult(null)} className="opacity-60 hover:opacity-100">
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Database Navigation & Repository View */}
      <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 dark:border-slate-800">
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Enterprise Database Schemas
            </h3>
            <p className="text-xs text-slate-500">
              Select a repository view to inspect database records and verified telemetry.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-800 text-xs font-bold overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveDb('posts')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeDb === 'posts' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500'}`}
            >
              1. Posts & Telemetry Repo ({postsData.length})
            </button>
            <button
              onClick={() => setActiveDb('team')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeDb === 'team' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500'}`}
            >
              2. Team Whitelist DB ({teamData.length})
            </button>
            <button
              onClick={() => setActiveDb('templates')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeDb === 'templates' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500'}`}
            >
              3. Templates DB
            </button>
            <button
              onClick={() => setActiveDb('research')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer ${activeDb === 'research' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500'}`}
            >
              4. Research DB
            </button>
          </div>
        </div>

        {/* Database Table View */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 custom-scrollbar">
          {activeDb === 'posts' && (
            <div>
              {/* Repository Toolbar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Archived Final Posts & Performance Records
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    Repository Mode
                  </span>
                </div>
                <button
                  onClick={handleSyncAnalyticsToRepository}
                  disabled={syncingAnalytics}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingAnalytics ? 'animate-spin' : ''}`} />
                  <span>{syncingAnalytics ? 'Syncing...' : '⚡ Pull Latest Post Analytics into Notion'}</span>
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-950 text-slate-500 font-bold border-b dark:border-slate-800 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Post Title</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Impressions</th>
                    <th className="p-3 text-right">Reactions</th>
                    <th className="p-3 text-right">Comments</th>
                    <th className="p-3 text-right">Reposts</th>
                    <th className="p-3 text-center">Engagement %</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">LinkedIn URN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {postsData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white max-w-[200px] truncate">{row.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                          {row.status || 'Published'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{row.category}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">{row.impressions?.toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">👍 {row.likes}</td>
                      <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">💬 {row.comments}</td>
                      <td className="p-3 text-right font-semibold text-slate-700 dark:text-slate-300">🔁 {row.reposts}</td>
                      <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{row.engagementRate}</td>
                      <td className="p-3 text-slate-500">{row.author}</td>
                      <td className="p-3 font-mono text-slate-500">{row.date}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">{row.urn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeDb === 'team' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Whitelist Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {teamData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="p-3 font-mono text-slate-500">{row.email}</td>
                    <td className="p-3 text-slate-500">{row.role}</td>
                    <td className="p-3 font-semibold text-emerald-500">{row.active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeDb === 'templates' && (
            <div>
              {/* Template Seed Result Banner */}
              {templateSeedResult && (
                <div className={`p-3 m-3 rounded-xl text-xs flex items-center justify-between border ${
                  templateSeedResult.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {templateSeedResult.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                    <span>{templateSeedResult.message}</span>
                  </div>
                  {templateSeedResult.url && (
                    <a
                      href={templateSeedResult.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline font-bold ml-2 shrink-0 text-[#0f2ea2] dark:text-blue-300"
                    >
                      Open in Notion <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              <div className="p-3 bg-slate-100/60 dark:bg-slate-900/60 border-b dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Brother Singapore Curated Benchmark Templates ({templatesData.length})
                </span>
                <button
                  onClick={handleSeedTemplatesToNotion}
                  disabled={seedingTemplates}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Database className={`w-3.5 h-3.5 ${seedingTemplates ? 'animate-spin' : ''}`} />
                  <span>{seedingTemplates ? 'Syncing...' : '📚 Push Core Templates to Notion'}</span>
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b dark:border-slate-800">
                  <tr>
                    <th className="p-3">Template Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Tone Attribute</th>
                    <th className="p-3">Source Benchmark</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {templatesData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{row.name}</td>
                      <td className="p-3 text-slate-500">{row.category}</td>
                      <td className="p-3 text-slate-500">{row.tone}</td>
                      <td className="p-3 text-slate-500">{row.source}</td>
                      <td className="p-3 font-semibold text-emerald-500">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeDb === 'research' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">Headline</th>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Freshness</th>
                  <th className="p-3">Word Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {researchData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{row.headline}</td>
                    <td className="p-3 text-slate-500">{row.topic}</td>
                    <td className="p-3 text-slate-500">{row.source}</td>
                    <td className="p-3 font-mono text-slate-500">{row.freshness}</td>
                    <td className="p-3 font-mono text-slate-500">{row.wordCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
