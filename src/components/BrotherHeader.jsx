import React from 'react';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { OFFICIAL_BROTHER_LOGO_URL } from '../lib/svgBrotherWebsiteTemplates.js';

export default function BrotherHeader({ isDark, setIsDark, currentUser, onLogout, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <header className="w-full bg-[#0f2ea2] text-white shadow-sm select-none sticky top-0 z-50">
      <div className="max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Left: Mobile Menu Toggle + Official Brother Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 -ml-1 text-white hover:bg-white/10 rounded-lg lg:hidden transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <img
              src={OFFICIAL_BROTHER_LOGO_URL}
              alt="Brother Singapore Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain bg-white p-0.5 shadow-sm shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col">
                <span className="font-black text-xl sm:text-2xl tracking-tighter leading-none text-white">brother</span>
                <span className="text-[9px] sm:text-[11px] font-normal italic tracking-wide text-blue-100 leading-none mt-0.5">at your side</span>
              </div>
              <div className="h-5 sm:h-6 w-px bg-white/20 mx-0.5 sm:mx-1 hidden xs:block" />
              <div className="hidden xs:flex flex-col">
                <span className="text-[11px] sm:text-xs font-bold text-white tracking-tight leading-none">LinkedUsIn</span>
                <span className="text-[9px] sm:text-[10px] text-blue-200 leading-none mt-0.5">Brother Xplorer</span>
              </div>
            </div>
          </div>

          {/* Right: User Profile, Theme Toggle & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Dark / Light Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 sm:p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-100" />}
              <span className="hidden md:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* User Profile / Status */}
            <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-white/20">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white border border-white/30 shrink-0">
                {currentUser?.name?.slice(0, 1) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold leading-none truncate max-w-[100px]">{currentUser?.name || 'Allan Cheng'}</div>
                <div className="text-[10px] text-blue-200 leading-none mt-0.5">{currentUser?.role?.slice(0, 15) || 'Admin'}</div>
              </div>
            </div>

            {/* Logout / Switch User */}
            <button
              onClick={onLogout}
              className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
