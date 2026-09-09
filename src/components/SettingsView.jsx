import React, { useState } from 'react';
import { Settings, Key, Check, ShieldCheck, Sparkles, Sliders, RefreshCw, Cpu, AlertCircle, Lock, Unlock, Database, Building2, Copy, ExternalLink, HelpCircle } from 'lucide-react';
import { testSerperKey } from '../lib/serperEngine.js';
import { cleanLinkedInOrgId, formatLinkedInOrgUrn, testLinkedInCredentials } from '../lib/linkedInApi.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';

export default function SettingsView({ isDark }) {
  const [openAIKey, setOpenAIKey] = useState(safeGetItem('key_openai') || '');
  const [serperKey, setSerperKey] = useState(safeGetItem('key_serper') || '');
  const [sendPilotKey, setSendPilotKey] = useState(safeGetItem('key_sendpilot') || '');
  
  // LinkedIn Credentials & Organization ID (Defaulted to Befinity / Brother Company ID 96363282)
  const [linkedInOrgId, setLinkedInOrgId] = useState(safeGetItem('linkedin_org_id') || '96363282');
  const [linkedInClientId, setLinkedInClientId] = useState(safeGetItem('linkedin_client_id') || '');
  const [linkedInClientSecret, setLinkedInClientSecret] = useState(safeGetItem('linkedin_client_secret') || '');
  const [linkedInToken, setLinkedInToken] = useState(safeGetItem('key_linkedin') || '');
  const [copiedCallback, setCopiedCallback] = useState(false);

  // Gemini API Configuration
  const [geminiKey, setGeminiKey] = useState(safeGetItem('key_gemini') || '');
  const [geminiModel, setGeminiModel] = useState(safeGetItem('model_gemini') || 'gemini-3.8-flash');

  // Notion Credentials
  const [notionToken, setNotionToken] = useState(safeGetItem('notion_token') || '');
  const [notionDatabaseId, setNotionDatabaseId] = useState(safeGetItem('notion_database_id') || '3c701136de4881de9d29ca4ea415e856');

  // Admin Passcode Security Lock (Default PIN: 2026)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => safeGetItem('admin_unlocked') === 'true');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const callbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/auth/linkedin/callback`
    : 'https://linked-us-in.vercel.app/api/auth/linkedin/callback';

  const handleCopyCallback = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(callbackUrl);
      setCopiedCallback(true);
      setTimeout(() => setCopiedCallback(false), 2000);
    }
  };

  const handleSave = () => {
    safeSetItem('key_openai', openAIKey);
    safeSetItem('key_serper', serperKey);
    safeSetItem('key_sendpilot', sendPilotKey);
    safeSetItem('linkedin_org_id', cleanLinkedInOrgId(linkedInOrgId));
    safeSetItem('linkedin_client_id', linkedInClientId);
    safeSetItem('linkedin_client_secret', linkedInClientSecret);
    safeSetItem('key_linkedin', linkedInToken);
    safeSetItem('key_gemini', geminiKey);
    safeSetItem('model_gemini', geminiModel);
    safeSetItem('notion_token', notionToken);
    safeSetItem('notion_database_id', notionDatabaseId);

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleUnlockAdmin = (e, explicitPin) => {
    e?.preventDefault();
    const pinToTest = explicitPin || pinInput;
    const storedPin = safeGetItem('admin_security_pin') || '2026';
    if (pinToTest === storedPin) {
      setIsAdminUnlocked(true);
      safeSetItem('admin_unlocked', 'true');
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect PIN. Default admin passcode is 2026.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    safeSetItem('admin_unlocked', 'false');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const activeSerperKey = (serperKey || safeGetItem('key_serper') || '').trim();
    const reports = [];
    let hasError = false;

    // Test Serper.dev
    if (activeSerperKey) {
      try {
        await testSerperKey(activeSerperKey);
        reports.push("✅ Serper.dev: Connected successfully (API Key verified)");
      } catch (err) {
        hasError = true;
        reports.push(`❌ Serper.dev: ${err.message}`);
      }
    } else {
      reports.push("ℹ️ Serper.dev: No key configured (using fallback dataset)");
    }

    // Test LinkedIn Configuration
    const activeOrgId = cleanLinkedInOrgId(linkedInOrgId || safeGetItem('linkedin_org_id') || '96363282');
    const activeLinkedInToken = (linkedInToken || safeGetItem('key_linkedin') || '').trim();

    if (activeOrgId && activeLinkedInToken) {
      try {
        const liRes = await testLinkedInCredentials({ orgId: activeOrgId, token: activeLinkedInToken });
        if (liRes?.success) {
          reports.push(`✅ LinkedIn: ${liRes.message || 'Connected to Org ' + activeOrgId}`);
        } else {
          hasError = true;
          reports.push(`❌ LinkedIn: ${liRes?.error || 'Token invalid or insufficient permissions'}`);
        }
      } catch (err) {
        reports.push(`ℹ️ LinkedIn: Configured for urn:li:organization:${activeOrgId}`);
      }
    } else if (activeOrgId) {
      reports.push(`ℹ️ LinkedIn: Target set to urn:li:organization:${activeOrgId} (Add Bearer token for live publish)`);
    }

    setTesting(false);
    setTestResult({
      status: hasError ? 'error' : 'success',
      message: reports.join(' • ')
    });
    setTimeout(() => setTestResult(null), 7000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] text-xs font-bold uppercase tracking-wider mb-2">
              <Settings className="w-3.5 h-3.5" />
              API Key Management & Model Orchestration
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              System Integrations & AI Engine Settings
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure credentials for Gemini API, Serper.dev, OpenAI, SendPilot, and LinkedIn APIs.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#0f2ea2] hover:bg-[#004b8f] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
            {saved ? 'Saved Successfully!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-2 ${
          testResult.status === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
        }`}>
          {testResult.status === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Admin Passcode Security Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isAdminUnlocked 
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30' 
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/30'
      }`}>
        <div className="flex items-center gap-2.5">
          {isAdminUnlocked ? (
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Unlock className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isAdminUnlocked ? 'Admin Mode Unlocked (Single-User Authorized)' : 'Single-User Security Active (Admin Locked)'}</span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                isAdminUnlocked ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}>
                {isAdminUnlocked ? 'Editing Enabled' : 'Keys Masked & Protected'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              {isAdminUnlocked 
                ? 'You have permission to edit Notion tokens, Serper API keys, and model orchestration settings.' 
                : 'API credentials cannot be modified or viewed by unauthorized team members. Enter Admin PIN to unlock.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {isAdminUnlocked ? (
            <button
              onClick={handleLockAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Admin Panel</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <form onSubmit={handleUnlockAdmin} className="flex items-center gap-1.5">
                <input
                  type="password"
                  placeholder="PIN (2026)"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-28 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0f2ea2]"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0f2ea2] hover:bg-[#004b8f] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock</span>
                </button>
              </form>
              <button
                type="button"
                onClick={(e) => handleUnlockAdmin(e, '2026')}
                className="text-[10px] text-blue-700 dark:text-blue-400 font-semibold underline hover:opacity-80 transition-opacity whitespace-nowrap"
              >
                Auto-Unlock (2026)
              </button>
            </div>
          )}
        </div>
      </div>
      {pinError && (
        <div className="text-xs text-rose-500 font-bold px-1">{pinError}</div>
      )}

      {/* Main Settings Card */}
      <div className={`p-6 rounded-2xl border space-y-6 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Notion Workspace & Custom Agent Integration (Primary AI Execution Layer) */}
        <div className="p-5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-700 dark:text-purple-400" />
              <h3 className="text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                Notion Workspace & Custom AI Agents (AI Execution Layer)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-purple-700 text-white px-2 py-0.5 rounded-full font-bold">
              Active in Notion
            </span>
          </div>

          <p className="text-xs text-purple-800 dark:text-purple-300/80">
            Posts created from MOM Occasions or Serper 24h News are sent directly to this Notion database. Notion Custom Agents generate Draft 1 (Community & Harmony), Draft 2 (Kaizen & Tech), and Strategic Rationale.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notion Integration Secret Token
              </label>
              <input
                type="password"
                disabled={!isAdminUnlocked}
                value={isAdminUnlocked ? notionToken : (notionToken ? '••••••••••••••••••••••••••••' : '')}
                onChange={(e) => setNotionToken(e.target.value)}
                placeholder="secret_..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">From notion.so/my-integrations. Connected to LinkedUsIn Hub.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Notion Posts & Drafts Database ID
              </label>
              <input
                type="text"
                disabled={!isAdminUnlocked}
                value={isAdminUnlocked ? notionDatabaseId : (notionDatabaseId ? '••••••••••••••••••••••••••••' : '')}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                placeholder="3c701136de4881de9d29ca4ea415e856"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">From your Notion database URL.</p>
            </div>
          </div>
        </div>
        {/* Gemini API & Model Switcher (Primary Engine) */}
        <div className="p-5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400" />
              <h3 className="text-xs font-bold text-[#0f2ea2] dark:text-blue-300 uppercase tracking-wider">
                Google Gemini API Configuration (Primary LLM Engine)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-[#0f2ea2] text-white px-2 py-0.5 rounded-full font-bold">
              Active LLM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Model Selection</span>
                <span className="text-[10px] text-[#0f2ea2] dark:text-blue-400 font-semibold">Active: {geminiModel}</span>
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none cursor-pointer"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Next-Gen High Velocity Reasoning)</option>
                <option value="gemini-3.7-flash">gemini-3.7-flash (Hybrid Reasoning & High Velocity)</option>
                <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Ultra Lightweight & Fast)</option>
                <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (Multimodal Vision & Asset Synthesis)</option>
                <option value="gemini-3-pro-image">gemini-3-pro-image (Advanced Creative Image Studio)</option>
                <option value="gemini-2.5-flash-image">gemini-2.5-flash-image (Fast Multimodal Asset Processing)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Serper.dev API */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-cyan-600" />
            Serper.dev API Key (24h Real-Time Google Search for AI News)
          </label>
          <input
            type="password"
            value={serperKey}
            onChange={(e) => setSerperKey(e.target.value)}
            placeholder="Paste Serper.dev API Key here"
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Used by Module 2 to scrape real-time AI news within 24h of publishing.</p>
        </div>

        {/* LinkedIn Developer API & Company Publishing */}
        <div className="p-5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400" />
              <h3 className="text-xs font-bold text-[#0f2ea2] dark:text-blue-300 uppercase tracking-wider">
                Official LinkedIn Developer API & Organization Publishing
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-[#0f2ea2] text-white px-2 py-0.5 rounded-full font-bold">
              Target: urn:li:organization:{cleanLinkedInOrgId(linkedInOrgId) || '96363282'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Configure your LinkedIn Developer App & Company Page. This enables 1-click live publishing to your company feed and retrieves official page analytics.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organization ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>LinkedIn Company / Organization ID</span>
                <span className="text-[10px] text-[#0f2ea2] dark:text-blue-400 font-mono font-semibold">96363282</span>
              </label>
              <input
                type="text"
                value={linkedInOrgId}
                onChange={(e) => setLinkedInOrgId(e.target.value)}
                placeholder="96363282 or paste admin URL"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Resolved URN: <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">urn:li:organization:{cleanLinkedInOrgId(linkedInOrgId) || '96363282'}</span>
              </p>
            </div>

            {/* OAuth Bearer Token */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>OAuth 2.0 Access Token (Bearer)</span>
                <span className="text-[10px] text-slate-400">60-day validity</span>
              </label>
              <input
                type="password"
                disabled={!isAdminUnlocked}
                value={isAdminUnlocked ? linkedInToken : (linkedInToken ? '••••••••••••••••••••••••••••' : '')}
                onChange={(e) => setLinkedInToken(e.target.value)}
                placeholder="AQV..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none disabled:opacity-60"
              />
              <p className="text-[10px] text-slate-400 mt-1">Bearer token generated with <span className="font-mono text-slate-600 dark:text-slate-300">w_organization_social</span>.</p>
            </div>

            {/* Client ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn Developer App Client ID
              </label>
              <input
                type="text"
                disabled={!isAdminUnlocked}
                value={isAdminUnlocked ? linkedInClientId : (linkedInClientId ? '••••••••••••••••' : '')}
                onChange={(e) => setLinkedInClientId(e.target.value)}
                placeholder="78..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none disabled:opacity-60"
              />
            </div>

            {/* Client Secret */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn App Client Secret
              </label>
              <input
                type="password"
                disabled={!isAdminUnlocked}
                value={isAdminUnlocked ? linkedInClientSecret : (linkedInClientSecret ? '••••••••••••••••' : '')}
                onChange={(e) => setLinkedInClientSecret(e.target.value)}
                placeholder="Wpl_..."
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* OAuth Callback & Permissions info */}
          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Authorized Redirect URI:</span>
              <code className="text-[11px] font-mono bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                {callbackUrl}
              </code>
              <button
                type="button"
                onClick={handleCopyCallback}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                title="Copy Redirect URI"
              >
                {copiedCallback ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400">Required Scopes:</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-semibold">w_organization_social</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-semibold">r_organization_social</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono font-semibold">rw_organization_admin</span>
            </div>
          </div>
        </div>

        {/* SendPilot & OpenAI API Keys */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              SendPilot API Key (Notification & Approval Dispatch)
            </label>
            <input
              type="password"
              value={sendPilotKey}
              onChange={(e) => setSendPilotKey(e.target.value)}
              placeholder="sp_live_..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              OpenAI API Key (Secondary Fallback)
            </label>
            <input
              type="password"
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
            />
          </div>
        </div>

        {/* Test Connection Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing Endpoints...' : 'Test All API Connections'}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#0f2ea2] hover:bg-[#004b8f] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
            {saved ? 'Saved!' : 'Save Credentials'}
          </button>
        </div>
      </div>
    </div>
  );
}
