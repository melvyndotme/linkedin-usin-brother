import React from 'react';
import { Users, ShieldCheck, CheckCircle2, Clock, Mail, Award, UserCheck } from 'lucide-react';

export default function TeamView({ isDark }) {
  const teamMembers = [
    {
      id: "allan",
      name: "Allan Cheng",
      role: "Admin / POD Lead",
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
      badge: "User",
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      avatarBg: "bg-purple-600",
      responsibilities: "Brand voice vetting, employee spotlight validation, festive copy approval, employer branding alignment.",
      stats: { approved: 19, pending: 2 }
    },
    {
      id: "sean",
      name: "Sean",
      role: "POD Member / Workflow Explorer",
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] text-xs font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5" />
              POD 5 LinkedUsIn • Team & Access Governance
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Cross-Functional Team & Review Stakeholders
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Collaborative workspace connecting Brother X, HR Function, and Technical Advisory with role-based permissions.
            </p>
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
