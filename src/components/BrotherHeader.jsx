import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { OFFICIAL_BROTHER_LOGO_URL } from '../lib/svgBrotherWebsiteTemplates.js';

export default function BrotherHeader({ isDark, setIsDark, currentUser, onLogout }) {
  return (
    <header className="w-full bg-[#0f2ea2] text-white shadow-sm select-none sticky top-0 z-50">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Official Brother Logo & LinkedUsIn Studio Label */}
          <div className="flex items-center gap-4">
            <img
              src={OFFICIAL_BROTHER_LOGO_URL}
              alt="Brother Singapore Logo"
              className="w-10 h-10 rounded-lg object-contain bg-white p-0.5 shadow-sm"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter leading-none text-white">brother</span>
                <span className="text-[11px] font-normal italic tracking-wide text-blue-100 leading-none mt-0.5">at your side</span>
              </div>
              <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block" />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-white tracking-tight">LinkedUsIn</span>
                <span className="text-[10px] text-blue-200">Brother Xplorer Content Studio</span>
              </div>
            </div>
          </div>

          {/* Right: User Profile, Theme Toggle & Logout */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-100" />}
              <span className="hidden md:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* User Profile / Status */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/20">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white border border-white/30">
                {currentUser?.name?.slice(0, 1) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold leading-none">{currentUser?.name || 'Allan Cheng'}</div>
                <div className="text-[10px] text-blue-200 leading-none mt-0.5">{currentUser?.role || 'Admin (POD Lead)'}</div>
              </div>
            </div>

            {/* Logout / Switch User */}
            <button
              onClick={onLogout}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1"
              title="Switch User / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
