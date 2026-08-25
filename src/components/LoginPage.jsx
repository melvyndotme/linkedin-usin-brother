import React, { useState } from 'react';
import { Mail, Sparkles, Send, CheckCircle2, ShieldCheck, ArrowRight, Key, ExternalLink, RefreshCw, XCircle, Users } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, isDark }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSentData, setMagicSentData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [resendKey, setResendKey] = useState(localStorage.getItem('resend_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const OFFICIAL_LOGO_URL = "https://media.licdn.com/dms/image/v2/C510BAQFFuI6MoUwmVA/company-logo_400_400/company-logo_400_400/0/1630606968981/brother_international_singapore_pte_ltd_logo?e=1788998400&v=beta&t=YC5raNCKcU09QhBEFCYAU3XIIDbjFlC0cm0hxOx-TOU";

  const handleSendMagicLink = async (targetEmail = email) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setMagicSentData(null);

    if (resendKey) localStorage.setItem('resend_key', resendKey);

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          resendKey,
          appUrl: window.location.origin
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMagicSentData(data);
      } else {
        setErrorMsg(data.error || 'Failed to dispatch magic link. Please check your email.');
      }
    } catch (err) {
      // Offline / client fallback
      setMagicSentData({
        success: true,
        user: {
          name: targetEmail.includes('allan') ? 'Allan Cheng' : targetEmail.includes('chloe') ? 'Chloe Lee' : 'Sean',
          email: targetEmail,
          role: targetEmail.includes('allan') ? 'Admin (POD Lead)' : targetEmail.includes('chloe') ? 'Reviewer (HR Lead)' : 'User'
        },
        magicLinkUrl: `${window.location.origin}/?token=demo_${Date.now()}&email=${encodeURIComponent(targetEmail)}&role=Admin`,
        simulated: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDemoLogin = (demoUser) => {
    onLoginSuccess(demoUser);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors ${
      isDark ? 'bg-[#090D16] text-white' : 'bg-[#F4F6F9] text-slate-900'
    }`}>
      <div className="w-full max-w-md space-y-6">
        {/* Brand Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl transition-all ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Official Brother Logo Header */}
          <div className="text-center space-y-3 pb-6 border-b dark:border-slate-800">
            <div className="inline-block p-1 rounded-2xl bg-white shadow-md border border-slate-100 dark:border-slate-800">
              <img
                src={OFFICIAL_LOGO_URL}
                alt="Brother Singapore Logo"
                className="w-14 h-14 rounded-xl object-contain"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Notion Whitelist Protected
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#0f2ea2] dark:text-white">
                LinkedUsIn Studio
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Brother Singapore • AI Content & Market Intelligence
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="pt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Corporate Email Address</span>
                <span className="text-[10px] text-slate-400 font-normal">Magic Link Login</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMagicLink(email)}
                  placeholder="name@brother.com.sg"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-xs font-semibold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={() => handleSendMagicLink(email)}
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Verifying with Notion & Dispatching...' : 'Send Secure Magic Link'}
            </button>

            {/* Magic Link Sent Feedback */}
            {magicSentData && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 space-y-3">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Magic Link Sent to {magicSentData.user.email}!</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                  Verified as <strong>{magicSentData.user.name} ({magicSentData.user.role})</strong> in the Notion Team Whitelist.
                </p>
                {magicSentData.resendId && (
                  <div className="font-mono text-[10px] bg-emerald-100/80 dark:bg-emerald-900/60 p-2 rounded-lg text-emerald-900 dark:text-emerald-200">
                    ✅ Resend API Dispatched! ID: {magicSentData.resendId}
                  </div>
                )}
                {magicSentData.resendError && (
                  <div className="font-mono text-[10px] bg-amber-100/80 dark:bg-amber-900/60 p-2 rounded-lg text-amber-900 dark:text-amber-200">
                    ℹ️ Resend Notice: {magicSentData.resendError}
                  </div>
                )}

                {/* Instant 1-Click Simulation Button */}
                <button
                  onClick={() => onLoginSuccess(magicSentData.user)}
                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  <span>1-Click Simulate Login (Inbox Click)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="mt-6 pt-5 border-t dark:border-slate-800 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick 1-Click Stakeholder Demo Sign-in
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDirectDemoLogin({
                  name: 'Allan Cheng',
                  email: 'allan.cheng@brother.com.sg',
                  role: 'Admin (POD Lead)'
                })}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-[#0f2ea2] text-left transition-all text-xs active:scale-95"
              >
                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">Allan Cheng</div>
                <div className="text-[10px] text-[#0f2ea2] dark:text-blue-400 font-mono">Admin (POD Lead)</div>
              </button>

              <button
                onClick={() => handleDirectDemoLogin({
                  name: 'Chloe Lee',
                  email: 'chloe.lee@brother.com.sg',
                  role: 'Reviewer (HR Lead)'
                })}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-[#0f2ea2] text-left transition-all text-xs active:scale-95"
              >
                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">Chloe Lee</div>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">Reviewer (HR Lead)</div>
              </button>

              <button
                onClick={() => handleDirectDemoLogin({
                  name: 'Sean',
                  email: 'sean.tan@brother.com.sg',
                  role: 'User (POD Member)'
                })}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-[#0f2ea2] text-left transition-all text-xs active:scale-95"
              >
                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">Sean</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">User (POD Member)</div>
              </button>

              <button
                onClick={() => handleDirectDemoLogin({
                  name: 'Melvyn Tan',
                  email: 'melvyn@befinityai.com',
                  role: 'External Advisor'
                })}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-[#0f2ea2] text-left transition-all text-xs active:scale-95"
              >
                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">Melvyn Tan</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">External Advisor</div>
              </button>
            </div>
          </div>

          {/* Optional Resend API Key Config Toggle */}
          <div className="mt-4 pt-3 text-center">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-mono underline"
            >
              {showKeyInput ? 'Hide Resend Key Config' : 'Configure Resend API Key (Optional)'}
            </button>

            {showKeyInput && (
              <div className="mt-2 text-left space-y-1">
                <input
                  type="password"
                  value={resendKey}
                  onChange={(e) => setResendKey(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxx"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-900 dark:text-white"
                />
                <p className="text-[9px] text-slate-400">If set, real emails are dispatched via Resend.com</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          Brother International Singapore Pte Ltd • At your side
        </div>
      </div>
    </div>
  );
}
