import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Newspaper, 
  Layers, 
  Edit3, 
  Database, 
  Users, 
  User,
  Sliders, 
  LogOut, 
  X,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isDark, 
  setIsDark, 
  currentUser, 
  onLogout, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  sidebarCollapsed = false,
  onToggleCollapse
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Close profile popup when clicking outside (using data-profile-menu attribute to prevent ref collision)
  useEffect(() => {
    function handleClickOutside(event) {
      if (event.target?.closest && event.target.closest('[data-profile-menu="true"]')) {
        return;
      }
      setProfileMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navGroups = [
    {
      title: 'WORKSPACE',
      items: [
        { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'module-1', label: 'Events', icon: Calendar },
        { id: 'module-2', label: 'News & Intel', icon: Newspaper }
      ]
    },
    {
      title: 'CONTENT & STUDIO',
      items: [
        { id: 'draft-studio', label: 'Draft & Image Studio', icon: Edit3 },
        { id: 'template-studio', label: 'Template Ingestion', icon: Layers },
        { id: 'notion-hub', label: 'Notion Database', icon: Database }
      ]
    },
    {
      title: 'TEAM',
      items: [
        { id: 'team', label: 'Team', icon: Users }
      ]
    },
    {
      title: 'GENERAL',
      items: [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'settings', label: 'Integrations', icon: Sliders }
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

  // 1. Collapsed Sidebar Content (Desktop Icon-only Mode)
  const renderCollapsedContent = () => (
    <div className="flex flex-col h-full justify-between select-none py-4 items-center">
      {/* Top: Compact Brand Logo & Expand Toggle */}
      <div className="flex flex-col items-center gap-3 shrink-0 pb-3 border-b border-white/10 w-full px-2">
        <div 
          className="w-10 h-10 flex items-center justify-center shrink-0 cursor-default"
          title="Brother • at your side"
        >
          <img
            src="/favicon.png"
            alt="Brother • at your side"
            className="w-9 h-9 rounded-xl object-contain drop-shadow-sm"
            onError={(e) => {
              e.target.src = '/favicon.ico';
            }}
          />
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition-colors cursor-pointer"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Icons Only */}
      <div className="py-4 space-y-3 overflow-y-auto custom-scrollbar flex-1 w-full flex flex-col items-center">
        {navGroups.map((group, idx) => (
          <div key={group.title} className="w-full flex flex-col items-center space-y-1">
            {idx > 0 && <div className="w-6 h-px bg-white/15 my-1" />}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  title={item.label}
                  aria-label={item.label}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0e2ea0] font-bold shadow-md scale-105'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0e2ea0]' : 'text-blue-200'}`} />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom: Compact Profile Button with Popover */}
      <div className="pt-3 border-t border-white/10 shrink-0 relative flex justify-center w-full px-2" data-profile-menu="true">
        {profileMenuOpen && (
          <div 
            data-profile-menu="true"
            className="absolute bottom-2 left-full ml-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 text-slate-900 animate-in fade-in slide-in-from-left-2 duration-150"
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleSelectTab('profile');
              }}
              className="flex items-center gap-2.5 p-2 pb-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              title="Edit Profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#0e2ea0] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {userEmail}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-1" />

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectTab('profile');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-[#0e2ea0]'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4 text-[#0e2ea0] shrink-0" />
                <span>Edit Profile</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setProfileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="w-10 h-10 rounded-xl bg-white text-[#0e2ea0] flex items-center justify-center font-bold text-xs shadow-sm hover:scale-105 transition-transform cursor-pointer border border-white/20"
          title={`${userName} • ${userRole}`}
          aria-label="User Profile"
        >
          {userInitials}
        </button>
      </div>
    </div>
  );

  // 2. Expanded Sidebar Content (Full Desktop and Mobile Drawer)
  const renderExpandedContent = (isMobile = false) => (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top: Brother Brand Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="https://www.brother.com.hk/-/media/ap2/global/menu/logo.svg?rev=74b6da90ccc34b339b35490b0046e6fc"
              alt="Brother • at your side"
              className="h-8 w-auto object-contain shrink-0"
              onError={(e) => {
                e.target.src = '/brother-logo.svg';
              }}
            />
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-lg bg-white/20 text-white border border-white/10">
              Studio
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse Button */}
            {!isMobile && onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer hidden lg:flex"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Close Button */}
            {isMobile && setMobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
                title="Close menu"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="p-3.5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200/70 px-3 pb-1">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#0e2ea0] font-bold shadow-md'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0e2ea0]' : 'text-blue-200'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Bottom Area: User Profile with Popover */}
      <div className="p-3 border-t border-white/10 shrink-0 relative" data-profile-menu="true">
        {profileMenuOpen && (
          <div 
            data-profile-menu="true"
            className="absolute bottom-full mb-2 left-3 right-3 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleSelectTab('profile');
              }}
              className="flex items-center gap-2.5 p-2 pb-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
              title="Edit Profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#0e2ea0] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {userEmail}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 my-1" />

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectTab('profile');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-[#0e2ea0]'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4 text-[#0e2ea0] shrink-0" />
                <span>Edit Profile</span>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setProfileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
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
              ? 'bg-white/20 border-white/30 text-white' 
              : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white text-[#0e2ea0] flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white leading-none truncate">
                {userName}
              </div>
              <div className="text-[10px] text-blue-200 leading-none mt-1 truncate">
                {userRole}
              </div>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-blue-200 shrink-0 ml-1.5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar - Smooth collapsible width */}
      <aside 
        className={`hidden lg:flex shrink-0 bg-[#0e2ea0] text-white border-r border-[#0a2278] flex-col justify-between select-none h-screen sticky top-0 shadow-xl transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarCollapsed ? renderCollapsedContent() : renderExpandedContent(false)}
      </aside>

      {/* Mobile Off-Canvas Drawer (< lg) with Smooth Slide-in Animation */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        {/* Dark Backdrop with Blur */}
        <div
          className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer Panel Sliding in from Left */}
        <div 
          className={`relative w-72 max-w-[85vw] h-full bg-[#0e2ea0] text-white border-r border-[#0a2278] shadow-2xl flex flex-col z-10 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {renderExpandedContent(true)}
        </div>
      </div>
    </>
  );
}
