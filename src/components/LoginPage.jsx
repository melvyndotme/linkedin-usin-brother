import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, Send, CheckCircle2, ShieldCheck, RefreshCw, XCircle, Clock, Edit3 } from 'lucide-react';
import { safeGetItem } from '../lib/storage.js';
import brotherLogo from '../assets/brother-logo.png';

export default function LoginPage({ onLoginSuccess, isDark }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendNotice, setResendNotice] = useState(null);
  const [lastSentTime, setLastSentTime] = useState(null);
  const [resendCount, setResendCount] = useState(0);
  const [magicSentData, setMagicSentData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState(null);

  // Background polling for session verification if user taps magic link in email app
  useEffect(() => {
    if (!magicSentData?.token) return;
    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/session?token=${encodeURIComponent(magicSentData.token)}`);
        const data = await res.json();
        if (isMounted && data.success && data.verified && data.user) {
          clearInterval(pollInterval);
          onLoginSuccess(data.user);
        }
      } catch (err) {
        // silent polling
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [magicSentData?.token, onLoginSuccess]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerifyOtp = async (codeToVerify = otpInput) => {
    const cleanCode = String(codeToVerify).trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6) {
      setOtpError('Please enter a 6-digit verification code.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: magicSentData?.user?.email || email,
          otpCode: cleanCode,
          otpHash: magicSentData?.otpHash,
          name: magicSentData?.user?.name,
          role: magicSentData?.user?.role
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        setOtpError(data.error || 'Invalid 6-digit code. Please try again.');
      }
    } catch (err) {
      setOtpError('Verification connection error. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSendMagicLink = async (targetEmail = email, isResend = false) => {
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMsg('Please enter a valid corporate email address.');
      return;
    }

    if (isResend) {
      setResending(true);
    } else {
      setLoading(true);
      setMagicSentData(null);
    }
    setErrorMsg(null);
    setResendNotice(null);

    try {
      const resendKey = safeGetItem('key_resend') || '';
      const notionKey = safeGetItem('notion_token') || safeGetItem('token_notion') || '';
      const resendSender = safeGetItem('resend_sender') || 'LinkedUsIn Studio <linkusin@rs.bro-x.org>';

      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail.trim().toLowerCase(),
          appUrl: window.location.origin,
          resendKey: resendKey || undefined,
          notionKey: notionKey || undefined,
          fromEmail: resendSender
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMagicSentData(data);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSentTime(timeStr);
        setResendCooldown(25); // 25-second cooldown
        if (isResend) {
          setResendCount((c) => c + 1);
          setResendNotice(`A fresh email with a new magic link was dispatched to ${targetEmail} at ${timeStr}.`);
        }
      } else {
        setErrorMsg(data.error || 'Failed to dispatch magic link. Please check your email.');
      }
    } catch (err) {
      setErrorMsg('Connection error: unable to verify account against Notion database. Please try again.');
    } finally {
      setLoading(false);
      setResending(false);
    }
  };

  return (
    <div className={`min-h-full w-full flex flex-col justify-center items-center py-8 px-4 sm:py-12 sm:px-6 overflow-y-auto custom-scrollbar transition-colors ${
      isDark ? 'bg-[#090D16] text-white' : 'bg-[#F4F6F9] text-slate-900'
    }`}>
      <div className="w-full max-w-md my-auto space-y-6">
        {/* Brand Card */}
        <div className={`p-5 sm:p-8 rounded-3xl border shadow-xl transition-all ${
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
              /* Secure Magic Link Sent - User Must Click Link in Email or Enter Code */
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
                  {lastSentTime && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Last sent: {lastSentTime}</span>
                    </div>
                  )}
                </div>

                {/* 6-Digit Verification Code Entry for PWA */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-200 dark:border-blue-900 shadow-sm space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400" />
                      <span>Enter 6-Digit Code from Email</span>
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                      PWA In-App
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Enter the 6-digit verification code sent to your email to log in directly:
                  </p>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setOtpInput(val);
                        if (val.length === 6) {
                          handleVerifyOtp(val);
                        }
                      }}
                      placeholder="• • • • • •"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-3 text-center text-xl sm:text-2xl font-mono font-bold tracking-[8px] text-slate-900 dark:text-white focus:outline-none focus:border-[#0f2ea2] focus:ring-2 focus:ring-[#0f2ea2]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyOtp(otpInput)}
                      disabled={verifyingOtp || otpInput.length < 6}
                      className="w-full py-3 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {verifyingOtp ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{verifyingOtp ? 'Verifying Code...' : 'Verify Code'}</span>
                    </button>
                  </div>
                  {otpError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {otpError}
                    </p>
                  )}
                </div>

                {/* Resend Confirmation Banner */}
                {resendNotice && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/40 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 text-left">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resendNotice}</span>
                  </div>
                )}

                {/* Error Banner if resend failed */}
                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 text-left">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Delivery Warning if Resend reported any notice */}
                {magicSentData.resendError && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-500/40 rounded-xl text-amber-800 dark:text-amber-200 text-[11px] text-left">
                    <span className="font-bold">Notice:</span> {magicSentData.resendError}
                  </div>
                )}

                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed text-left space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Email delivery status:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    A secure magic link and 6-digit code were dispatched to your inbox. If Brother's corporate email filter (Microsoft 365 Defender) delays delivery, check your junk folder or request a new link below.
                  </p>
                </div>

                {/* Primary Resend Action: Request Another Link */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleSendMagicLink(magicSentData.user?.email || email, true)}
                    disabled={resending || resendCooldown > 0}
                    className="w-full flex items-center justify-center gap-2 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                  >
                    {resending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching Fresh Email...</span>
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Request another link ({resendCooldown}s)</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{resendCount > 0 ? 'Resend Another Magic Link' : 'Request Another Link (Resend Email)'}</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400">
                    Didn't receive the email? Check your junk/spam folder or click above to request another email.
                  </p>
                </div>

                {/* Secondary navigation options */}
                <div className="pt-2 text-[10px] text-slate-400 border-t border-blue-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => { setMagicSentData(null); setResendNotice(null); }}
                    className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#0f2ea2] dark:hover:text-blue-400 font-semibold cursor-pointer text-xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit email address</span>
                  </button>

                  <button
                    onClick={() => { setMagicSentData(null); setEmail(''); setResendNotice(null); setResendCount(0); }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
                  >
                    Different account
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
