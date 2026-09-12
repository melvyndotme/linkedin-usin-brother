import React, { useState } from 'react';
import { Mail, Sparkles, Send, CheckCircle2, ShieldCheck, RefreshCw, XCircle, ArrowRight } from 'lucide-react';
import { safeGetItem } from '../lib/storage.js';
import brotherLogo from '../assets/brother-logo.png';

export default function LoginPage({ onLoginSuccess, isDark }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSentData, setMagicSentData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSendMagicLink = async (targetEmail = email) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setMagicSentData(null);

    try {
      const resendKey = safeGetItem('key_resend') || '';
      const notionKey = safeGetItem('token_notion') || '';
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          appUrl: window.location.origin,
          resendKey: resendKey || undefined,
          notionKey: notionKey || undefined,
          fromEmail: 'LinkedUsIn Studio <linkusin@rs.bro-x.org>'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMagicSentData(data);
      } else {
        setErrorMsg(data.error || 'Failed to dispatch magic link. Please check your email.');
      }
    } catch (err) {
      setErrorMsg('Connection error: unable to verify account against Notion database. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <div className="inline-block p-1.5 rounded-2xl bg-white shadow-md border border-slate-100 dark:border-slate-800">
              <img
                src={brotherLogo}
                alt="Brother Logo"
                className="w-16 h-16 rounded-xl object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#0f2ea2] dark:text-white">
                LinkedUsIn Studio
              </h1>
            </div>
          </div>

          {/* Login Form */}
          <div className="pt-6 space-y-4">
            {!magicSentData ? (
              <>
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
                  className="w-full flex items-center justify-center gap-2 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? 'Verifying with Notion & Dispatching...' : 'Send Secure Magic Link'}
                </button>
              </>
            ) : (
              /* Secure Magic Link Sent - User Must Click Link in Email */
              <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-xs text-slate-800 dark:text-slate-200 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Check your email
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    We sent a secure magic sign-in link to:
                  </p>
                  <p className="font-bold text-[#0f2ea2] dark:text-blue-400 text-sm font-mono pt-0.5">
                    {magicSentData.user?.email || email}
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed text-left space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Next steps to sign in:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>Open your corporate inbox.</li>
                    <li>Click the <strong>"Sign in to LinkedUsIn Studio"</strong> button in the email.</li>
                    <li>Your session will be securely authenticated.</li>
                  </ol>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 border-t border-blue-100 dark:border-slate-800 space-y-2">
                  <p>
                    Didn't receive the email? Check your junk/spam folder or try again in a few moments.
                  </p>
                  <button
                    onClick={() => { setMagicSentData(null); setEmail(''); }}
                    className="text-[#0f2ea2] dark:text-blue-400 hover:underline font-semibold cursor-pointer text-xs"
                  >
                    ← Sign in with a different email
                  </button>
                </div>
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
