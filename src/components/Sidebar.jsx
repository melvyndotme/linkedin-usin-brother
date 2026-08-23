import React from 'react';
import { Home, Calendar, Sparkles, Users, Settings, Sun, Moon, LogOut, ExternalLink, X } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isDark, setIsDark, onLogout, mobileMenuOpen, setMobileMenuOpen }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, subtitle: 'LinkedIn Stream & Analytics' },
    { id: 'module-1', label: 'Event Posts', icon: Calendar, subtitle: 'Module 1 • Festive 2026', badge: 'MOM 2026' },
    { id: 'module-2', label: 'AI Posts', icon: Sparkles, subtitle: 'Module 2 • Employer Branding', badge: 'Serper.dev' },
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
      <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar">
        {/* Mobile Close Button Header */}
        <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-xs uppercase tracking-wider text-[#0f2ea2] dark:text-blue-400">
            LinkedUsIn Menu
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
            Core Modules
          </span>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 sm:py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#0f2ea2] text-white shadow-md shadow-[#0f2ea2]/20'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#0f2ea2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="leading-none">{item.label}</div>
                      <div className={`text-[10px] font-normal leading-none mt-1 ${
                        isActive ? 'text-blue-100' : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
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
        <div className={`p-3.5 rounded-xl border text-xs ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-[11px] text-[#0f2ea2] flex items-center gap-1">
              LinkedIn Company Page
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
            Brother International Singapore Pte Ltd
          </p>
          <a
            href="https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-bold text-[#0f2ea2] hover:underline mt-2 inline-block"
          >
            Visit Official LinkedIn ↗
          </a>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className={`p-4 border-t space-y-2 shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        {/* Dark / Light Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
            isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <span className="flex items-center gap-2">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            {isDark ? 'Light Theme' : 'Dark Theme'}
          </span>
          <span className="text-[10px] font-mono opacity-60">Toggle</span>
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors`}
        >
          <LogOut className="w-4 h-4" />
          Logout
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
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Drawer Panel */}
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
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around px-2 py-1.5 backdrop-blur-lg shadow-lg ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800 text-slate-300' 
          : 'bg-white/95 border-slate-200 text-slate-700'
      }`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold transition-all min-w-[56px] ${
                isActive
                  ? 'text-[#0f2ea2] dark:text-blue-400 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-blue-950/60' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span className="mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
