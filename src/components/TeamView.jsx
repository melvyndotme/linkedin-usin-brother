import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, CheckCircle2, Clock, Mail, Award, UserCheck, RefreshCw, ExternalLink } from 'lucide-react';
import { safeGetItem } from '../lib/storage.js';

const DEFAULT_MEMBERS = [
  {
    id: "allan",
    name: "Allan Cheng",
    role: "Admin",
    department: "Brother X & HR Function",
    email: "allan.cheng@brother.com.sg",
    badge: "Admin",
    badgeColor: "bg-blue-500/10 text-[#0f2ea2] border-blue-500/20",
    avatarBg: "bg-[#0f2ea2]",
    responsibilities: "Strategic project oversight, final publishing approval, API governance, stakeholder alignment.",
    stats: { approved: 24, pending: 1 }
  },
  {
    id: "chloe",
    name: "Chloe Lee",
    role: "Primary Reviewer / HR Lead",
    department: "HR Function (Brother Singapore)",
    email: "chloe.lee@brother.com.sg",
    badge: "Reviewer",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    avatarBg: "bg-purple-600",
    responsibilities: "Brand voice vetting, employee spotlight validation, festive copy approval, employer branding alignment.",
    stats: { approved: 19, pending: 2 }
  },
  {
    id: "sean",
    name: "Sean",
    role: "Core Team Member",
    department: "Brother X Core Team",
    email: "sean.tan@brother.com.sg",
    badge: "User",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    avatarBg: "bg-emerald-600",
    responsibilities: "Prompt testing, prototype experimentation, workflow automation, KPI tracking.",
    stats: { approved: 14, pending: 0 }
  },
  {
    id: "melvyn",
    name: "Melvyn Tan",
    role: "AI Consultant & Technical Lead",
    department: "Befinity AI Advisory",
    email: "melvyn@befinityai.com",
    badge: "External Advisor",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    avatarBg: "bg-amber-600",
    responsibilities: "Agentic pipeline architecture, Serper intelligence integration, Gemini model orchestration, SVG studio engineering.",
    stats: { approved: 32, pending: 0 }
  }
];

export default function TeamView({ isDark }) {
  const [teamMembers, setTeamMembers] = useState(DEFAULT_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const fetchLiveTeam = async () => {
    setLoading(true);
    try {
      const notionKey = safeGetItem('token_notion') || '';
      const res = await fetch('/api/notion/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: notionKey || undefined,
          databaseId: '3c701136de4881869782cd894c6126c5'
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.members?.length > 0) {
        setTeamMembers(data.members);
        setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (e) {
      console.warn('Error fetching live team members from Notion:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTeam();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Users className="w-3.5 h-3.5" />
              Team
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Team Members
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-slate-500">
                Authorized team members and reviewers.
              </p>
              {lastSynced && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Synced {lastSynced}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <a
              href="https://app.notion.com/p/brotherap/3c701136de4881869782cd894c6126c5?v=3c701136de488153b10a000c52f0cb21"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
            >
              <span>Notion</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={fetchLiveTeam}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className={`p-6 rounded-2xl border transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl ${member.avatarBg} text-white font-black text-lg flex items-center justify-center shadow-md`}>
                  {member.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {member.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${member.badgeColor}`}>
                      {member.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{member.role}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-950/60' : 'bg-slate-50'} border border-slate-100 dark:border-slate-800`}>
                <div className="text-[11px] font-bold text-slate-500 mb-1">Affiliation & Department:</div>
                <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{member.department}</div>
                <div className="text-slate-400 font-mono text-[10px] mt-0.5">{member.email}</div>
              </div>

              <div>
                <span className="text-slate-400 font-bold text-[11px] block mb-1">Key Responsibilities:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  {member.responsibilities}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>{member.stats.approved}</strong> drafts approved
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <strong>{member.stats.pending}</strong> pending review
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
