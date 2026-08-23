import React from 'react';
import { Home, Calendar, Sparkles, Users, Settings, Sun, Moon, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isDark, setIsDark, onLogout }) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, subtitle: 'LinkedIn Stream & Analytics' },
    { id: 'module-1', label: 'Event Posts', icon: Calendar, subtitle: 'Module 1 • Festive 2026', badge: 'MOM 2026' },
    { id: 'module-2', label: 'AI Posts', icon: Sparkles, subtitle: 'Module 2 • Employer Branding', badge: 'Serper.dev' },
    { id: 'team', label: 'Team', icon: Users, subtitle: 'Allan, Chloe, Sean & Melvyn' },
    { id: 'settings', label: 'Settings', icon: Settings, subtitle: 'API Keys & Gemini Models' },
  ];

  return (
    <aside className={`w-64 shrink-0 border-r flex flex-col justify-between transition-colors ${
      isDark 
        ? 'bg-slate-900 border-slate-800 text-slate-200' 
        : 'bg-white border-slate-200 text-slate-700'
    }`}>
      {/* Navigation Links */}
      <div className="p-4 space-y-6">
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
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#0f2ea2] text-white shadow-md shadow-[#0f2ea2]/20'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-[#0f2ea2]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
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
      <div className={`p-4 border-t space-y-2 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
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
    </aside>
  );
}
