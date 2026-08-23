import React from 'react';
import { Sparkles, Calendar, Newspaper, Palette, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, pendingAlertsCount = 2 }) {
  const navItems = [
    { id: 'festive', label: 'Festive & MOM Engine', icon: Calendar, badge: pendingAlertsCount > 0 ? `${pendingAlertsCount} Due` : null },
    { id: 'ai-news', label: 'AI Intelligence & Employer Branding', icon: Newspaper, badge: 'Serper.dev' },
    { id: 'svg-studio', label: 'SVG Visual Studio', icon: Palette },
    { id: 'style-guide', label: 'Style Guide & Cultural Compass', icon: BookOpen },
    { id: 'simulator', label: 'LinkedIn Feed Preview', icon: CheckCircle },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-[#005BAC] text-white px-3 py-1 rounded-lg font-black tracking-wider text-lg shadow-lg shadow-[#005BAC]/20">
              brother
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-base">LinkedUsIn</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Brother Xplorer MVP
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Content & Intelligence Studio • Singapore</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                    isActive
                      ? 'bg-[#005BAC] text-white shadow-md shadow-[#005BAC]/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
