import React, { useState } from 'react';
import { Database, ShieldCheck, Mail, Send, CheckCircle2, Key, RefreshCw, Table, Sparkles, ExternalLink, Code } from 'lucide-react';

export default function NotionDatabaseHub({ isDark }) {
  const [activeDb, setActiveDb] = useState('posts'); // 'posts', 'templates', 'research', 'team'
  const [magicEmail, setMagicEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [showApiPayload, setShowApiPayload] = useState(false);

  const postsData = [
    { title: "Singapore National Day 2026", status: "Published", category: "Festive", author: "Allan Cheng", date: "2026-08-09", urn: "urn:li:share:984729103" },
    { title: "Enterprise Multi-Agent Breakthrough", status: "Approved", category: "AI Thought", author: "Chloe Lee", date: "2026-08-14", urn: "Pending" },
    { title: "Mid-Autumn Mooncake Gathering", status: "Draft", category: "Culture", author: "Sean", date: "2026-09-25", urn: "-" },
    { title: "Green Office Sustainability Case", status: "Under Review", category: "B2B Solutions", author: "Allan Cheng", date: "2026-10-05", urn: "-" }
  ];

  const templatesData = [
    { name: "Kaizen Innovation & Precision", category: "Productivity", tone: "Inspiring, Kaizen", hook: "Pain-to-Superpower", status: "Active" },
    { name: "Cost & Waste Reduction Case", category: "B2B Sustainability", tone: "Data-driven, Eco", hook: "Surprising Data Metric", status: "Active" },
    { name: "Multicultural Community Spotlight", category: "Culture", tone: "Warm, Celebratory", hook: "Festive Multiracial", status: "Active" },
    { name: "3-Pillar Tech Transformation", category: "AI & Innovation", tone: "Authoritative", hook: "Breakthrough Insight", status: "Active" }
  ];

  const researchData = [
    { headline: "Autonomous Agents in Enterprise", topic: "Enterprise AI", source: "MIT Tech Review", freshness: "24 Hours", wordCount: "120 words" },
    { headline: "Hybrid Reasoning Cuts Hallucinations", topic: "Precision AI", source: "VentureBeat AI", freshness: "48 Hours", wordCount: "120 words" },
    { headline: "Singapore National AI Skills Push", topic: "Workforce", source: "Straits Times", freshness: "4 Days", wordCount: "120 words" },
    { headline: "Multimodal Document Intelligence", topic: "Document AI", source: "TechCrunch", freshness: "7 Days", wordCount: "120 words" }
  ];

  const teamData = [
    { name: "Allan Cheng", email: "allan.cheng@brother.com.sg", role: "Admin (POD Lead)", active: "✅ Active" },
    { name: "Chloe Lee", email: "chloe.lee@brother.com.sg", role: "Reviewer (HR Lead)", active: "✅ Active" },
    { name: "Sean", email: "sean@brother.com.sg", role: "User (POD Member)", active: "✅ Active" },
    { name: "Melvyn Tan", email: "melvyn@advisor.ai", role: "External Advisor", active: "✅ Active" }
  ];

  const handleSendMagicLink = () => {
    if (!magicEmail) return;
    setMagicLoading(true);
    setTimeout(() => {
      setMagicLoading(false);
      setMagicLinkSent(true);
    }, 1200);
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
              Headless Notion Database & Magic Link Hub
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Notion-Backed Database Architecture
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              LinkedUsIn acts as the front-end studio while Notion serves as the headless database for 
              <strong className="text-[#0f2ea2] dark:text-blue-400"> Posts, Templates, Research, and Team Whitelist Authentication</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiPayload(!showApiPayload)}
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Code className="w-4 h-4" />
              {showApiPayload ? 'Hide REST Schema' : 'View Notion API Schema'}
            </button>
          </div>
        </div>
      </div>

      {showApiPayload && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 font-mono text-xs text-emerald-300 space-y-2 overflow-x-auto custom-scrollbar">
          <div className="text-slate-400">// Sample Notion REST API Query to Team Whitelist Database:</div>
          <pre>{`POST /v1/databases/f3400bfcdcf34365ad79525c3daad3d3/query
Headers: {
  "Authorization": "Bearer ntn_xxxxxxxxxxxxxxxxxxxx",
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json"
}
Body: {
  "filter": {
    "property": "Email",
    "email": { "equals": "${magicEmail || 'allan.cheng@brother.com.sg'}" }
  }
}`}</pre>
        </div>
      )}

      {/* Magic Link Login Simulator Card */}
      <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2 border-b pb-3 dark:border-slate-800">
          <Mail className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400" />
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Magic Link Email Authentication Simulator
          </h3>
          <span className="text-[9px] font-mono text-[#0f2ea2] bg-blue-50 px-2 py-0.5 rounded ml-auto">
            Notion Whitelist Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8">
            <input
              type="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              placeholder="e.g. allan.cheng@brother.com.sg or chloe.lee@brother.com.sg"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
            />
          </div>
          <div className="md:col-span-4">
            <button
              onClick={handleSendMagicLink}
              disabled={magicLoading || !magicEmail}
              className="w-full flex items-center justify-center gap-2 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95"
            >
              {magicLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {magicLoading ? 'Verifying with Notion...' : 'Send Magic Link to Email'}
            </button>
          </div>
        </div>

        {magicLinkSent && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Email verified against Notion Team Whitelist! Magic login link sent to <strong>{magicEmail}</strong>.</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
              Valid 15 Mins
            </span>
          </div>
        )}
      </div>

      {/* Notion Synchronized Databases Tabs & Table View */}
      <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 dark:border-slate-800">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Live Synchronized Notion Databases
          </h3>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-800 text-xs font-bold overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveDb('posts')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeDb === 'posts' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500'}`}
            >
              1. Posts & Drafts DB
            </button>
            <button
              onClick={() => setActiveDb('templates')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeDb === 'templates' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500'}`}
            >
              2. Templates DB
            </button>
            <button
              onClick={() => setActiveDb('research')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeDb === 'research' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500'}`}
            >
              3. Research DB
            </button>
            <button
              onClick={() => setActiveDb('team')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeDb === 'team' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500'}`}
            >
              4. Team Whitelist DB
            </button>
          </div>
        </div>

        {/* Database Table View */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 custom-scrollbar">
          {activeDb === 'posts' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Scheduled Date</th>
                  <th className="p-3">LinkedIn URN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {postsData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{row.title}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === 'Published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' :
                        row.status === 'Approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{row.category}</td>
                    <td className="p-3 text-slate-500">{row.author}</td>
                    <td className="p-3 font-mono text-slate-500">{row.date}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">{row.urn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeDb === 'templates' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">Template Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Tone Attribute</th>
                  <th className="p-3">Hook Archetype</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {templatesData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="p-3 text-slate-500">{row.category}</td>
                    <td className="p-3 text-slate-500">{row.tone}</td>
                    <td className="p-3 font-mono text-[11px] text-[#0f2ea2] dark:text-blue-400">{row.hook}</td>
                    <td className="p-3 text-emerald-500 font-bold">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeDb === 'research' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-bold border-b dark:border-slate-800">
                <tr>
                  <th className="p-3">Headline</th>
                  <th className="p-3">Topic</th>
                  <th className="p-3">Source Publication</th>
                  <th className="p-3">Freshness</th>
                  <th className="p-3">Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {researchData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{row.headline}</td>
                    <td className="p-3 text-[#0f2ea2] dark:text-blue-400 font-semibold">{row.topic}</td>
                    <td className="p-3 text-slate-500">{row.source}</td>
                    <td className="p-3 font-mono text-slate-500">{row.freshness}</td>
                    <td className="p-3 text-emerald-500 font-bold">{row.wordCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        </div>
      </div>
    </div>
  );
}
