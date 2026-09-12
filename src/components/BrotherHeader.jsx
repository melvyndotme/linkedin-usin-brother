import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  X, 
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
  Share2,
  CheckCircle2,
  Sparkles,
  PanelLeft,
  User
} from 'lucide-react';

const TAB_CONFIG = {
  'home': { label: 'Overview', icon: LayoutDashboard },
  'module-1': { label: 'Events', icon: Calendar },
  'module-2': { label: 'News & Intel', icon: Newspaper },
  'draft-studio': { label: 'Draft & Image Studio', icon: Edit3 },
  'template-studio': { label: 'Template Ingestion', icon: Layers },
  'notion-hub': { label: 'Notion Database Hub', icon: Database },
  'team': { label: 'Team', icon: Users },
  'profile': { label: 'My Profile', icon: User },
  'settings': { label: 'Integrations', icon: Sliders }
};

export default function BrotherHeader({ 
  isDark, 
  setIsDark, 
  activeTab = 'home',
  setActiveTab,
  currentUser, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  sidebarCollapsed,
  onToggleCollapse
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const notificationRef = useRef(null);

  // Close notifications on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          
          {/* Left: Mobile Toggle, Desktop Collapse Toggle & Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1.5 -ml-1 rounded-lg lg:hidden transition-colors cursor-pointer flex items-center justify-center ${
                mobileMenuOpen
                  ? 'bg-blue-50 text-[#0f2ea2] dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 -ml-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer items-center justify-center"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <PanelLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180 text-[#0f2ea2] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`} />
              </button>
            )}

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

            {/* Notification Bell with Dropdown Popover */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-xl border transition-colors relative cursor-pointer ${
                  notificationsOpen
                    ? 'bg-blue-50 border-[#0f2ea2]/40 text-[#0f2ea2]'
                    : isDark 
                      ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                      <span>Notifications</span>
                      {unread && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0.2 rounded-full font-semibold">
                          3 new
                        </span>
                      )}
                    </div>
                    {unread && (
                      <button
                        onClick={() => setUnread(false)}
                        className="text-[11px] font-semibold text-[#0f2ea2] dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar">
                    {/* Item 1: MOM Calendar */}
                    <div
                      onClick={() => {
                        setNotificationsOpen(false);
                        if (setActiveTab) setActiveTab('module-1');
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 flex items-start gap-2.5 text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0f2ea2] dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Singapore Public Holidays & Events Ready
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Official Singapore public holidays and custom event calendar loaded. Automated countdowns active.
                        </p>
                        <span className="text-[10px] text-[#0f2ea2] dark:text-blue-400 font-semibold mt-1 inline-block">
                          View Events →
                        </span>
                      </div>
                    </div>

                    {/* Item 2: Notion Team Whitelist */}
                    <div
                      onClick={() => {
                        setNotificationsOpen(false);
                        if (setActiveTab) setActiveTab('team');
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 flex items-start gap-2.5 text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Notion Whitelist Synced
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Live team whitelist connected directly to Notion database.
                        </p>
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1 inline-block">
                          View Team →
                        </span>
                      </div>
                    </div>

                    {/* Item 3: Google News & Serper */}
                    <div
                      onClick={() => {
                        setNotificationsOpen(false);
                        if (setActiveTab) setActiveTab('module-2');
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 flex items-start gap-2.5 text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Newspaper className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          News Intelligence Stream
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Google News search active for Singapore industry topics & workplace AI.
                        </p>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold mt-1 inline-block">
                          Browse Intel →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
