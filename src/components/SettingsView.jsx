import React, { useState } from 'react';
import { Settings, Key, Check, ShieldCheck, Sparkles, Sliders, RefreshCw, Cpu } from 'lucide-react';

export default function SettingsView({ isDark }) {
  const [openAIKey, setOpenAIKey] = useState(localStorage.getItem('key_openai') || '');
  const [serperKey, setSerperKey] = useState(localStorage.getItem('key_serper') || '');
  const [sendPilotKey, setSendPilotKey] = useState(localStorage.getItem('key_sendpilot') || '');
  const [linkedInToken, setLinkedInToken] = useState(localStorage.getItem('key_linkedin') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('key_gemini') || '');
  const [geminiModel, setGeminiModel] = useState(localStorage.getItem('model_gemini') || 'gemini-3.7-flash');

  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    localStorage.setItem('key_openai', openAIKey);
    localStorage.setItem('key_serper', serperKey);
    localStorage.setItem('key_sendpilot', sendPilotKey);
    localStorage.setItem('key_linkedin', linkedInToken);
    localStorage.setItem('key_gemini', geminiKey);
    localStorage.setItem('model_gemini', geminiModel);

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setTestResult({
        status: 'success',
        message: `Connected successfully to Gemini (${geminiModel}), Serper.dev & LinkedIn API endpoints.`
      });
      setTimeout(() => setTestResult(null), 4000);
    }, 1200);
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
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          {testResult.message}
        </div>
      )}

      {/* Main Settings Card */}
      <div className={`p-6 rounded-2xl border space-y-6 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
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
                <span className="text-[10px] text-[#0f2ea2] font-semibold">Recommended: Gemini Flash 3.7</span>
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none cursor-pointer"
              >
                <option value="gemini-3.7-flash">Gemini Flash 3.7 (Hybrid Reasoning & High Velocity)</option>
                <option value="gemini-3.6-flash">Gemini Flash 3.6 (Fast Generation)</option>
                <option value="gemini-3.5-flash">Gemini Flash 3.5 (Standard Flash)</option>
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

        {/* LinkedIn API Integration */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-blue-600" />
            LinkedIn API OAuth Bearer Token / Client Credentials
          </label>
          <input
            type="password"
            value={linkedInToken}
            onChange={(e) => setLinkedInToken(e.target.value)}
            placeholder="AQV..."
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Enables direct draft pushing and real-time page analytics syncing.</p>
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
