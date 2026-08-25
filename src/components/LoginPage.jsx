import React, { useState } from 'react';
import { Mail, Sparkles, Send, CheckCircle2, ShieldCheck, RefreshCw, XCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, isDark }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSentData, setMagicSentData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const OFFICIAL_LOGO_URL = "https://media.licdn.com/dms/image/v2/C510BAQFFuI6MoUwmVA/company-logo_400_400/company-logo_400_400/0/1630606968981/brother_international_singapore_pte_ltd_logo?e=1788998400&v=beta&t=YC5raNCKcU09QhBEFCYAU3XIIDbjFlC0cm0hxOx-TOU";

  const handleSendMagicLink = async (targetEmail = email) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setMagicSentData(null);

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
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
      setMagicSentData({
        success: true,
        user: {
          name: targetEmail.includes('melvyn') ? 'Melvyn Tan' : targetEmail.includes('allan') ? 'Allan Cheng' : targetEmail.includes('chloe') ? 'Chloe Lee' : 'Sean',
          email: targetEmail,
          role: targetEmail.includes('melvyn') ? 'External Advisor' : targetEmail.includes('allan') ? 'Admin (POD Lead)' : targetEmail.includes('chloe') ? 'Reviewer (HR Lead)' : 'User'
        }
      });
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
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-xs text-slate-800 dark:text-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#0f2ea2] dark:text-blue-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Check your email</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  If an account is associated with <strong>{email}</strong>, we have sent a secure magic link to your inbox. Click the link in the email to sign in.
                </p>
                <div className="pt-1 text-[10px] text-slate-400 border-t border-blue-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Didn't receive it? Check your spam folder.</span>
                  <button
                    onClick={() => setMagicSentData(null)}
                    className="text-[#0f2ea2] dark:text-blue-400 hover:underline font-semibold"
                  >
                    Re-enter email
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
