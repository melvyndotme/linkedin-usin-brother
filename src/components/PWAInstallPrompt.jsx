import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { safeGetItem, safeSetItem } from '../lib/storage.js';

export default function PWAInstallPrompt({ isDark }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Check if already installed & running in standalone mode
    const standaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;
    
    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Detect iOS devices
    const userAgent = window.navigator.userAgent || '';
    const isIosDevice = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // 3. Listen for Chromium/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      const dismissed = safeGetItem('brother_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, if not dismissed, show friendly banner after a short delay
    if (isIosDevice) {
      const dismissed = safeGetItem('brother_pwa_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowBanner(true), 1500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native Chrome/Android install dialog
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else {
      // Show iOS step-by-step visual instruction modal
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    safeSetItem('brother_pwa_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Install Banner (Mobile-optimized) */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 ${
            isDark 
              ? 'bg-[#161B26]/95 border-slate-700/80 text-white' 
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-blue-900/10'
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src="/icons/icon-192.png" 
                alt="LinkedUs App" 
                className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-slate-200 dark:border-slate-700 shrink-0 shadow-xs" 
              />
              <div className="min-w-0">
                <div className="text-xs font-bold truncate flex items-center gap-1.5">
                  <span>Install Brother LinkedUs</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-blue-100 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-300">
                    App
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Add to Home Screen for fast, full-screen access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={handleDismissBanner}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Dismiss"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS & Step-by-Step Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl p-5 sm:p-6 border shadow-2xl relative space-y-4 animate-in slide-in-from-bottom-6 duration-200 ${
              isDark ? 'bg-[#111319] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with App Icon */}
            <div className="flex items-center gap-3">
              <img 
                src="/icons/icon-192.png" 
                alt="LinkedUs" 
                className="w-12 h-12 rounded-2xl p-1 bg-white border border-slate-200 dark:border-slate-700 shadow-sm"
              />
              <div>
                <h3 className="text-sm sm:text-base font-bold">Install on Home Screen</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Brother LinkedUs Studio</p>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <div className={`p-3.5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-[#0f2ea2] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Tap the Safari Share button
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        Look for <Share2 className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400 inline" /> in Safari's bottom toolbar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-[#0f2ea2] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Select "Add to Home Screen"
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        Scroll down and tap <PlusSquare className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400 inline" /> <strong>Add to Home Screen</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Tap "Add" in the top right
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        LinkedUs will appear as an app icon on your home screen.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-xs space-y-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#0f2ea2]" />
                    <span>Install via Browser Menu:</span>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tap your browser's menu (three dots <strong>⋮</strong> in top right) and select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setShowBanner(false);
                safeSetItem('brother_pwa_dismissed', 'true');
              }}
              className="w-full py-2.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
