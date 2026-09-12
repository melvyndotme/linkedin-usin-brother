import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Sparkles, 
  Link as LinkIcon, 
  ExternalLink, 
  FileText, 
  Sliders,
  Check
} from 'lucide-react';
import { safeSetItem } from '../lib/storage.js';

export default function ProfileView({ isDark, currentUser, onUpdateProfile }) {
  const [name, setName] = useState(currentUser?.name || 'Melvyn Tan');
  const [email, setEmail] = useState(currentUser?.email || 'melvyn@befinityai.com');
  const [role, setRole] = useState(currentUser?.role || 'External Advisor');
  const [department, setDepartment] = useState(currentUser?.department || 'Marketing & Strategic Communications');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser?.linkedinUrl || 'https://www.linkedin.com/in/melvyntan/');
  const [bio, setBio] = useState(currentUser?.bio || 'External Advisor driving brand thought leadership, digital innovation, and AI capabilities for Brother Singapore.');
  const [signoff, setSignoff] = useState(currentUser?.signoff || '— Melvyn Tan, External Advisor');
  const [tonePreference, setTonePreference] = useState(currentUser?.tonePreference || 'Strategic & Authoritative');
  const [avatarColor, setAvatarColor] = useState(currentUser?.avatarColor || '#0e2ea0');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initials = name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MT';

  const handleSave = (e) => {
    e?.preventDefault();
    setSaving(true);

    const updated = {
      ...currentUser,
      name,
      email,
      role,
      department,
      linkedinUrl,
      bio,
      signoff,
      tonePreference,
      avatarColor
    };

    if (onUpdateProfile) {
      onUpdateProfile(updated);
    } else {
      safeSetItem('linkedusin_user', JSON.stringify(updated));
    }

    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 400);
  };

  const AVATAR_COLOR_OPTIONS = [
    { label: 'Brother Blue', value: '#0e2ea0' },
    { label: 'Deep Indigo', value: '#3730A3' },
    { label: 'Emerald Green', value: '#059669' },
    { label: 'Royal Purple', value: '#7C3AED' },
    { label: 'Slate Charcoal', value: '#334155' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* User Avatar */}
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg border-2 border-white/20 shrink-0 transition-transform hover:scale-105"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Notion Whitelisted
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {role} • {department}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e2ea0] hover:bg-[#0b247d] active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>

        {saved && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile successfully updated! Changes are reflected immediately across LinkedUsIn Studio.</span>
          </div>
        )}
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Identity & Role */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal & Work Details */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-5 transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
          }`}>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <User className="w-4 h-4 text-[#0e2ea0] dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Personal & Job Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Display Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2ea0] focus:bg-white dark:focus:bg-slate-800"
                  placeholder="e.g. Melvyn Tan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Work Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2ea0] focus:bg-white dark:focus:bg-slate-800 font-mono"
                    placeholder="e.g. melvyn@befinityai.com"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Job Title / Workspace Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2ea0] focus:bg-white dark:focus:bg-slate-800"
                    placeholder="e.g. External Advisor or Head of Marketing"
                  />
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department / Business Unit
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2ea0] focus:bg-white dark:focus:bg-slate-800"
                    placeholder="e.g. Marketing & Strategic Communications"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Avatar Accent Theme Color
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {AVATAR_COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAvatarColor(opt.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      avatarColor === opt.value
                        ? 'border-[#0e2ea0] bg-blue-50/70 dark:bg-blue-950/40 text-slate-900 dark:text-white ring-2 ring-[#0e2ea0]/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" 
                      style={{ backgroundColor: opt.value }} 
                    />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LinkedIn Profile & Thought Leadership Persona */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-5 transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
          }`}>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <LinkIcon className="w-4 h-4 text-[#0e2ea0] dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                LinkedIn Profile & Post Signature
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Personal LinkedIn Profile URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full pl-9 pr-20 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2ea0] focus:bg-white dark:focus:bg-slate-800"
                    placeholder="https://www.linkedin.com/in/yourname"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-2.5 top-2 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-1"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Professional Bio / Strategic Focus
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2ea0] focus:bg-white dark:focus:bg-slate-800"
                  placeholder="Provide context on your expertise so generated posts match your professional persona..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Default Post Sign-Off / Author Credit
                </label>
                <input
                  type="text"
                  value={signoff}
                  onChange={(e) => setSignoff(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0e2ea0] focus:bg-white dark:focus:bg-slate-800 font-mono"
                  placeholder="e.g. — Melvyn Tan, External Advisor"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Preferences & Security Status */}
        <div className="space-y-6">
          
          {/* AI Drafting Voice Preference */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
          }`}>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sparkles className="w-4 h-4 text-[#0e2ea0] dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                AI Voice & Tone
              </h2>
            </div>

            <div className="space-y-2">
              {[
                { id: 'Strategic & Authoritative', desc: 'Leadership, industry insights & Kaizen reliability' },
                { id: 'SME-Focused & Practical', desc: 'Actionable productivity, cost-saving & office ROI' },
                { id: 'Inspirational & Community', desc: 'Partnership, sustainability & team culture' }
              ].map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setTonePreference(tone.id)}
                  className={`w-full p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    tonePreference === tone.id
                      ? 'border-[#0e2ea0] bg-blue-50/80 dark:bg-blue-950/40 text-slate-900 dark:text-white ring-2 ring-[#0e2ea0]/25 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {tone.id}
                    </span>
                    {tonePreference === tone.id && (
                      <Check className="w-3.5 h-3.5 text-[#0e2ea0] dark:text-blue-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {tone.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Access & Verification Card */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
          }`}>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Governance & Access
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Team Whitelist</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Notion DB ID</span>
                <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                  3c701136...
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Organization</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  Brother SG
                </span>
              </div>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
