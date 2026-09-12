import React from 'react';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Bell, 
  ExternalLink, 
  ChevronDown, 
  LayoutDashboard, 
  Calendar, 
  Newspaper, 
  Edit3, 
  Layers, 
  Database, 
  Users, 
  Sliders,
  Share2
} from 'lucide-react';

const TAB_CONFIG = {
  'home': { label: 'Overview', icon: LayoutDashboard },
  'module-1': { label: 'Festive & Calendar', icon: Calendar },
  'module-2': { label: 'News & Intel', icon: Newspaper },
  'draft-studio': { label: 'Draft & Image Studio', icon: Edit3 },
  'template-studio': { label: 'Template Ingestion', icon: Layers },
  'notion-hub': { label: 'Notion Database Hub', icon: Database },
  'team': { label: 'Team Members', icon: Users },
  'settings': { label: 'Integrations', icon: Sliders }
};

export default function BrotherHeader({ 
  isDark, 
  setIsDark, 
  activeTab = 'home',
  currentUser, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}) {
  const currentTabInfo = TAB_CONFIG[activeTab] || { label: 'Dashboard', icon: LayoutDashboard };
  const TabIcon = currentTabInfo.icon;

  return (
    <header className={`w-full border-b select-none sticky top-0 z-30 transition-colors ${
      isDark 
        ? 'bg-[#111319] border-slate-800 text-slate-100' 
        : 'bg-white border-slate-200/90 text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Left: Mobile Toggle & Sendpilot-Style Breadcrumbs */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg lg:hidden transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="hidden sm:flex items-center gap-1.5 text-slate-400 dark:text-slate-400">
                <span>Dashboard</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
                <TabIcon className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
                <span>{currentTabInfo.label}</span>
              </span>
            </div>
          </div>

          {/* Right: Workspace Selector, Notification & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Share / Live Stream Link Button */}
            <a
              href="https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/"
              target="_blank"
              rel="noreferrer"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
              <span>Live Page</span>
            </a>

            {/* Sendpilot-Style Workspace Dropdown Pill */}
            <div className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' 
                : 'bg-slate-50 border-slate-200/90 hover:bg-slate-100/80'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-[#0f2ea2] text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm">
                BS
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Brother Singapore
                </span>
                <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                  Enterprise Workspace
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className={`p-2 rounded-xl border transition-colors relative cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              title="System Notifications (MOM & LinkedIn Stream)"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-amber-300' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
