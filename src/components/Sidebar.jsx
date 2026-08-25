import React from 'react';
import { Home, Calendar, Sparkles, Layers, Edit3, Database, Users, Settings, Sun, Moon, LogOut, ExternalLink, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isDark, setIsDark, onLogout, mobileMenuOpen, setMobileMenuOpen }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, subtitle: 'LinkedIn Stream & Telemetry' },
    { id: 'module-1', label: 'Event Posts', icon: Calendar, subtitle: 'Module 1 • Festive 2026', badge: 'MOM 2026' },
    { id: 'module-2', label: 'AI Intelligence', icon: Sparkles, subtitle: 'Module 2 • Serper 120-Word', badge: 'Custom Time' },
    { id: 'template-studio', label: 'Template Ingestion', icon: Layers, subtitle: 'Competitor & Brother Ingest', badge: 'Placeholders' },
    { id: 'draft-studio', label: 'Draft & Media Studio', icon: Edit3, subtitle: 'Editor, Carousel, Video, Publish', badge: '1-Click' },
    { id: 'notion-hub', label: 'Notion Database Hub', icon: Database, subtitle: 'Headless DB & Magic Link', badge: 'Notion Sync' },
    { id: 'team', label: 'Team', icon: Users, subtitle: 'Allan, Chloe, Sean & Melvyn' },
    { id: 'settings', label: 'Settings', icon: Settings, subtitle: 'API Keys & Gemini Models' },
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Navigation Links */}
      <div className="p-3.5 space-y-4 overflow-y-auto custom-scrollbar">
        {/* Mobile Close Button Header */}
        <div className="flex items-center justify-between lg:hidden pb-2.5 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-xs uppercase tracking-wider text-[#0f2ea2] dark:text-blue-400">
            LinkedUsIn Studio
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-3 ${
            isDark ? 'text-slate-400' : 'text-slate-400'
          }`}>
            Platform Modules
          </span>
          <nav className="mt-1.5 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 sm:py-2 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#0f2ea2] text-white shadow-md shadow-[#0f2ea2]/20'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#0f2ea2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="leading-none truncate">{item.label}</div>
                      <div className={`text-[9px] font-normal leading-none mt-1 truncate ${
                        isActive ? 'text-blue-100' : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : isDark
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-blue-50 text-[#0f2ea2] border border-blue-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live LinkedIn Link Card */}
        <div className={`p-3 rounded-xl border text-xs ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-[#0f2ea2] dark:text-blue-400 flex items-center gap-1">
              LinkedIn Company Stream
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-1">
            Brother International Singapore
          </p>
          <a
            href="https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline mt-1.5 inline-block"
          >
            Visit Live Page ↗
          </a>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className={`p-3 border-t space-y-1.5 shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        {/* Dark / Light Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            {isDark ? 'Light Theme' : 'Dark Theme'}
          </span>
          <span className="text-[9px] font-mono opacity-60">Toggle</span>
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors`}
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout / Switch Role
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className={`hidden lg:flex w-64 shrink-0 border-r flex-col justify-between transition-colors ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-slate-200' 
          : 'bg-white border-slate-200 text-slate-700'
      }`}>
        {navContent}
      </aside>

      {/* Mobile Off-Canvas Drawer Backdrop & Container */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className={`relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 transition-transform duration-200 ease-out ${
            isDark 
              ? 'bg-slate-900 text-slate-200 border-r border-slate-800' 
              : 'bg-white text-slate-700 border-r border-slate-200'
          }`}>
            {navContent}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Quick-Bar */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around px-1 py-1.5 backdrop-blur-lg shadow-lg ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800 text-slate-300' 
          : 'bg-white/95 border-slate-200 text-slate-700'
      }`}>
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg text-[9px] font-bold transition-all min-w-[50px] ${
                isActive
                  ? 'text-[#0f2ea2] dark:text-blue-400 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="mt-0.5 tracking-tight truncate max-w-[54px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
