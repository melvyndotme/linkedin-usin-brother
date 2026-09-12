import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Newspaper, 
  Layers, 
  Edit3, 
  Database, 
  Users, 
  Sliders, 
  Sun, 
  Moon, 
  LogOut, 
  ExternalLink, 
  X, 
  ChevronsUpDown, 
  Sparkles, 
  Building2 
} from 'lucide-react';
import { OFFICIAL_BROTHER_LOGO_URL } from '../lib/svgBrotherWebsiteTemplates.js';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isDark, 
  setIsDark, 
  currentUser, 
  onLogout, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navGroups = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'module-1', label: 'Festive & Calendar', icon: Calendar, badge: 'MOM Live' },
        { id: 'module-2', label: 'News & Intel', icon: Newspaper, badge: 'Serper' }
      ]
    },
    {
      title: 'CONTENT & STUDIO',
      items: [
        { id: 'draft-studio', label: 'Draft & Image Studio', icon: Edit3, badge: 'Studio' },
        { id: 'template-studio', label: 'Template Ingestion', icon: Layers, badge: null },
        { id: 'notion-hub', label: 'Notion Database', icon: Database, badge: 'DB Only' }
      ]
    },
    {
      title: 'TEAM & COLLABORATION',
      items: [
        { id: 'team', label: 'Team Members', icon: Users, badge: '4' }
      ]
    },
    {
      title: 'GENERAL',
      items: [
        { id: 'settings', label: 'Integrations', icon: Sliders, badge: null }
      ]
    }
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    setProfileMenuOpen(false);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const userName = currentUser?.name || 'Melvyn Tan';
  const userEmail = currentUser?.email || 'melvyn@befinityai.com';
  const userRole = currentUser?.role || 'External Advisor';
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'MT';

  const navContent = (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top: Brother Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={OFFICIAL_BROTHER_LOGO_URL}
              alt="Brother Singapore"
              className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-sm shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tighter leading-none text-white">brother</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded bg-[#0f2ea2] text-white">
                  Studio
                </span>
              </div>
              <span className="text-[10px] font-normal italic tracking-wide text-blue-200/80 leading-none mt-1">
                at your side
              </span>
            </div>
          </div>

          {/* Mobile Close */}
          {setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="p-3.5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
              {group.title}
            </div>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#1e2433] text-white border border-slate-700 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3b82f6]' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                        isActive
                          ? 'bg-[#0f2ea2] text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Live Brother LinkedIn stream card */}
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-blue-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#0f2ea2]" />
              Brother SG Stream
            </span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </div>
          <p className="text-[10px] text-slate-400 line-clamp-1">
            Brother International Singapore
          </p>
          <a
            href="https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-bold text-blue-400 hover:underline mt-1.5 inline-block"
          >
            Visit Live Page ↗
          </a>
        </div>
      </div>

      {/* Bottom Area: Quota Widget & User Profile with Popover */}
      <div className="p-3 border-t border-slate-800/80 space-y-2.5 shrink-0 relative" ref={profileMenuRef}>
        
        {/* Sendpilot-Style Status / Engine Card */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#0f2ea2]/25 to-blue-900/15 border border-[#0f2ea2]/40 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Brother AI Hub
            </span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">
              Active
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium">
            MOM Holiday Scraper & Gemini 3.8
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#0f2ea2] h-full w-[85%] rounded-full" />
          </div>
        </div>

        {/* Floating Popover Menu (Sendpilot Screenshot 2) */}
        {profileMenuOpen && (
          <div className="absolute bottom-full mb-2 left-3 right-3 bg-white dark:bg-[#181b24] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Header: User Info */}
            <div className="flex items-center gap-2.5 p-2.5 pb-2">
              <div className="w-8 h-8 rounded-full bg-[#0f2ea2] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {userEmail}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

            {/* Menu Items */}
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-[#0f2ea2] dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
                <span>Integrations</span>
              </button>

              <button
                onClick={() => setIsDark(!isDark)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                  <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                </div>
                <span className="text-[9px] font-mono opacity-50">Toggle</span>
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}

        {/* User Profile Pill Button */}
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left cursor-pointer ${
            profileMenuOpen 
              ? 'bg-[#1e2433] border-slate-700 text-white' 
              : 'bg-slate-950/60 hover:bg-[#1e2433] border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#0f2ea2] text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white leading-none truncate">
                {userName}
              </div>
              <div className="text-[10px] text-slate-400 leading-none mt-1 truncate">
                {userRole}
              </div>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
        </button>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar - Dark Charcoal/Navy #111319 */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-[#111319] text-slate-200 border-r border-slate-800/80 flex-col justify-between select-none h-screen sticky top-0">
        {navContent}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-[#111319] text-slate-200 border-r border-slate-800 shadow-2xl flex flex-col z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
