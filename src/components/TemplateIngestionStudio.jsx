import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Upload, Link2, FileText, Image as ImageIcon, Sparkles, Copy, Check, 
  ArrowRight, BookOpen, Eye, Database, ExternalLink, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { BENCHMARK_TEMPLATES, extractTemplateFromInput } from '../lib/templateExtractor.js';
import { safeGetItem } from '../lib/storage.js';

export default function TemplateIngestionStudio({ isDark, onSelectTemplateForDrafting }) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'ingest'
  const [templates, setTemplates] = useState(BENCHMARK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(BENCHMARK_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);
  const blueprintRef = useRef(null);

  // Ingestion inputs
  const [ingestType, setIngestType] = useState('url'); // 'url', 'screenshot', 'pdf'
  const [urlInput, setUrlInput] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');
  const [base64Image, setBase64Image] = useState('');
  const [extractError, setExtractError] = useState(null);

  // Newly Extracted Template Review & Notion Save State
  const [justExtractedTemplate, setJustExtractedTemplate] = useState(null);
  const [savingToNotion, setSavingToNotion] = useState(false);
  const [notionSaveStatus, setNotionSaveStatus] = useState(null); // { status: 'success' | 'error', message, url }
  const [seedingBenchmarkToNotion, setSeedingBenchmarkToNotion] = useState(false);
  const [seedStatus, setSeedStatus] = useState(null);

  // Notion Sync Status & Deduplication Tracking
  const [notionTemplates, setNotionTemplates] = useState([]);
  const [loadingNotionTemplates, setLoadingNotionTemplates] = useState(false);

  const fetchNotionTemplates = async () => {
    setLoadingNotionTemplates(true);
    const token = safeGetItem('notion_token');
    const pageId = safeGetItem('notion_page_id') || '3c701136-de48-8101-b258-000b3c706126';
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('action', 'list');
      if (token) queryParams.set('apiKey', token);
      if (pageId) queryParams.set('pageId', pageId);

      const res = await fetch(`/api/notion/save-template?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.templates)) {
          setNotionTemplates(data.templates);
        }
      }
    } catch (e) {
      console.warn('Could not fetch Notion templates list:', e);
    } finally {
      setLoadingNotionTemplates(false);
    }
  };

  useEffect(() => {
    fetchNotionTemplates();
  }, []);

  const getSavedNotionInfo = (tmplName) => {
    if (!tmplName) return null;
    const norm = tmplName.trim().toLowerCase();
    return notionTemplates.find(nt => nt.name?.trim().toLowerCase() === norm) || null;
  };

  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
    if (blueprintRef.current) {
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(blueprintRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        console.warn('Selection error:', e);
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateExtraction = async () => {
    setAnalyzing(true);
    setExtractError(null);
    setNotionSaveStatus(null);

    const clientGeminiKey = safeGetItem('key_gemini') || '';

    const payload = {
      type: ingestType,
      content: urlInput || pastedContent || `Uploaded asset: ${uploadFileName}`,
      base64Image: base64Image,
      modelName: selectedModel,
      apiKey: clientGeminiKey,
      title: ingestType === 'url' ? 'Live Extracted LinkedIn Blueprint' : ingestType === 'screenshot' ? 'Visual Deconstruction Blueprint' : 'PDF Document Archive Blueprint'
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (clientGeminiKey) {
        headers['x-gemini-key'] = clientGeminiKey;
      }

      const res = await fetch('/api/templates/ingest', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.template) {
        setJustExtractedTemplate(data.template);
      } else {
        throw new Error(data.error || 'Failed to extract template');
      }
    } catch (err) {
      console.warn('Extraction fallback to local engine:', err.message);
      const fallbackTmpl = extractTemplateFromInput(payload);
      setJustExtractedTemplate(fallbackTmpl);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToNotion = async (tmplToSave) => {
    if (!tmplToSave) return;
    setSavingToNotion(true);
    setNotionSaveStatus(null);

    const token = safeGetItem('notion_token');
    const pageId = safeGetItem('notion_page_id') || '3c701136-de48-8101-b258-000b3c706126';

    try {
      const res = await fetch('/api/notion/save-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          pageId: pageId,
          template: tmplToSave
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotionSaveStatus({
          status: 'success',
          message: `Saved "${tmplToSave.name}" to Notion Template Library!`,
          url: data.notionUrl
        });

        // Update notionTemplates state immediately
        const newEntry = {
          name: tmplToSave.name,
          url: data.notionUrl,
          id: data.results?.[0]?.id || Date.now().toString()
        };
        setNotionTemplates(prev => {
          const norm = tmplToSave.name.trim().toLowerCase();
          const filtered = prev.filter(t => t.name?.trim().toLowerCase() !== norm);
          return [...filtered, newEntry];
        });

        // Add to local state if not already present
        if (!templates.some(t => t.id === tmplToSave.id)) {
          setTemplates([tmplToSave, ...templates]);
        }
        setSelectedTemplate(tmplToSave);
      } else {
        const errorMsg = data.error || (data.results && data.results.find(r => !r.success)?.error) || 'Failed to save to Notion. Please check your NOTION_API_KEY in Settings.';
        setNotionSaveStatus({
          status: 'error',
          message: errorMsg
        });
      }
    } catch (err) {
      setNotionSaveStatus({
        status: 'error',
        message: err.message || 'Network error connecting to Notion API'
      });
    } finally {
      setSavingToNotion(false);
    }
  };

  const handleSeedAllToNotion = async () => {
    setSeedingBenchmarkToNotion(true);
    setSeedStatus(null);

    const token = safeGetItem('notion_token');
    const pageId = safeGetItem('notion_page_id') || '3c701136-de48-8101-b258-000b3c706126';

    try {
      const res = await fetch('/api/notion/save-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          pageId: pageId,
          templates: BENCHMARK_TEMPLATES
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSeedStatus({
          status: 'success',
          message: `Successfully seeded all ${data.savedCount} Brother benchmark templates into Notion!`,
          url: data.notionUrl
        });
        // Re-fetch Notion templates to update all status pills
        fetchNotionTemplates();
      } else {
        const errorMsg = data.error || (data.results && data.results.find(r => !r.success)?.error) || 'Failed to seed templates to Notion. Please verify NOTION_API_KEY in Settings.';
        setSeedStatus({
          status: 'error',
          message: errorMsg
        });
      }
    } catch (err) {
      setSeedStatus({
        status: 'error',
        message: err.message || 'Network error connecting to Notion API'
      });
    } finally {
      setSeedingBenchmarkToNotion(false);
    }
  };

  const handleDismissExtraction = () => {
    if (justExtractedTemplate) {
      // Also allow user to add it to working session without Notion if desired
      if (!templates.some(t => t.id === justExtractedTemplate.id)) {
        setTemplates([justExtractedTemplate, ...templates]);
      }
      setSelectedTemplate(justExtractedTemplate);
    }
    setJustExtractedTemplate(null);
    setActiveTab('library');
    setUrlInput('');
    setPastedContent('');
    setUploadFileName('');
    setBase64Image('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFileName(file.name);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setBase64Image(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const selectedTemplateNotionInfo = getSavedNotionInfo(selectedTemplate?.name);

  const cleanDescription = (desc) => {
    if (!desc) return '';
    return desc.replace(
      /\s*\(Awaiting GEMINI_API_KEY for live autonomous inference\)\.?/gi,
      ' aligned with Brother Singapore editorial and cultural guidelines.'
    );
  };

  const renderSourceWithLink = (sourceText, isHeader = false) => {
    if (!sourceText) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const parts = sourceText.split(urlRegex);

    if (parts.length === 1) {
      return isHeader ? (
        <span className="text-[10px] sm:text-[11px] font-mono text-[#0f2ea2] dark:text-blue-400 font-bold uppercase tracking-wider block">
          Source: {sourceText}
        </span>
      ) : (
        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{sourceText}</p>
      );
    }

    if (isHeader) {
      return (
        <div className="flex items-center gap-1.5 flex-wrap text-[10px] sm:text-[11px] font-mono font-bold tracking-wider text-[#0f2ea2] dark:text-blue-400 mb-0.5">
          <span className="uppercase shrink-0">Source:</span>
          {parts.map((part, idx) => {
            if (part.match(urlRegex)) {
              return (
                <a
                  key={idx}
                  href={part}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="normal-case tracking-normal underline hover:text-[#0c2482] dark:hover:text-blue-300 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                  title="Open original LinkedIn post in new tab"
                >
                  <span className="truncate max-w-[280px] sm:max-w-md">{part}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              );
            }
            return part ? <span key={idx} className="uppercase">{part}</span> : null;
          })}
        </div>
      );
    }

    return (
      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1">
        {parts.map((part, idx) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={idx}
                href={part}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="underline text-[#0f2ea2] dark:text-blue-400 hover:text-[#0c2482] dark:hover:text-blue-300 inline-flex items-center gap-0.5 cursor-pointer truncate"
                title="Open original link in new tab"
              >
                <span>{part}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <Layers className="w-3.5 h-3.5" />
              Template Ingestion
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Brother Singapore LinkedIn Post Templates Library
            </h2>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab(activeTab === 'library' ? 'ingest' : 'library')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {activeTab === 'library' ? <Upload className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              {activeTab === 'library' ? '+ Ingest New Post / PDF' : 'View Template Library'}
            </button>
          </div>
        </div>

        {/* Global Seed Status Notification */}
        {seedStatus && (
          <div className={`mt-3 p-3 rounded-xl text-xs flex items-center justify-between border ${
            seedStatus.status === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {seedStatus.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
              <span>{seedStatus.message}</span>
            </div>
            {seedStatus.url && (
              <a
                href={seedStatus.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline font-bold ml-2 shrink-0 text-[#0f2ea2] dark:text-blue-300"
              >
                Open in Notion <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {activeTab === 'ingest' ? (
        /* Ingestion Studio Panel */
        <div className={`p-5 sm:p-6 rounded-2xl border space-y-5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Review Card if just extracted */}
          {justExtractedTemplate && (
            <div className="p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
                      Extraction Complete — Ready for Review
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {justExtractedTemplate.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveToNotion(justExtractedTemplate)}
                    disabled={savingToNotion}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {savingToNotion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                    <span>{savingToNotion ? 'Saving to Notion...' : 'Save to Notion Library'}</span>
                  </button>

                  <button
                    onClick={handleDismissExtraction}
                    className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium px-3 py-2 rounded-xl transition-all"
                  >
                    View in Studio
                  </button>
                </div>
              </div>

              {/* Notion Save Status Banner */}
              {notionSaveStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                  notionSaveStatus.status === 'success'
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-100 dark:bg-rose-900/40 border-rose-400 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {notionSaveStatus.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{notionSaveStatus.message}</span>
                  </div>
                  {notionSaveStatus.url && (
                    <a
                      href={notionSaveStatus.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline font-bold ml-2 shrink-0 text-[#0f2ea2] dark:text-blue-300"
                    >
                      Open in Notion <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Extracted Blueprint Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Extracted Blueprint (Check placeholders before saving):
                </span>
                <div className="p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {justExtractedTemplate.placeholderTemplate}
                </div>
              </div>
            </div>
          )}
          <div className="border-b pb-3 dark:border-slate-800">
            <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Ingest Post, Screenshot, or PDF to Train Templates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The multimodal engine analyzes structure, hook formula, tone, and formatting to extract reusable instructional placeholders.
            </p>
          </div>

          {/* Ingestion Mode Switcher */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border dark:border-slate-800">
            <button
              onClick={() => setIngestType('url')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                ingestType === 'url' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Social Post URL</span>
            </button>
            <button
              onClick={() => setIngestType('screenshot')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                ingestType === 'screenshot' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Screenshot (PNG/JPG)</span>
            </button>
            <button
              onClick={() => setIngestType('pdf')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                ingestType === 'pdf' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDF Archive</span>
            </button>
          </div>

          {/* Form Inputs based on Ingestion Type */}
          {ingestType === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                LinkedIn Post Link (Brother Global or Competitor)
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.linkedin.com/posts/brother-global_kaizen-innovation-..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
              />
            </div>
          )}

          {ingestType === 'screenshot' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload Post Screenshot (PNG/JPG)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-[#0f2ea2] transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/40">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {uploadFileName ? `Selected: ${uploadFileName}` : 'Drag & drop post screenshot, or click to browse'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Supports screenshots of LinkedIn mobile or desktop posts</p>
              </div>
            </div>
          )}

          {ingestType === 'pdf' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Upload Printed Post Archive or Guidelines (PDF)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-[#0f2ea2] transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/40">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {uploadFileName ? `Selected: ${uploadFileName}` : 'Drop PDF archive of competitor/Brother posts'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Extracts structural patterns across multi-page post collections</p>
              </div>
            </div>
          )}

          {/* Model Engine Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-950/50 dark:border-slate-800 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">AI Ingestion Engine</span>
              <span className="text-[11px] text-slate-500">Autonomous multimodal extraction & Hofstede calibration</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-[#0f2ea2] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Gemini 3.1 Flash-Lite
              </button>
              <button
                type="button"
                onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-[#0f2ea2] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Gemini 3.1 Pro-Preview
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSimulateExtraction}
            disabled={analyzing}
            className="w-full flex items-center justify-center gap-2 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? `Analyzing with ${selectedModel}...` : 'Extract Instructional Template'}
          </button>
        </div>
      ) : (
        /* Template Library & Instructional Placeholder Explorer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left: Template List */}
          <div className="lg:col-span-4 space-y-4">
            <div className={`p-3.5 sm:p-4 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Template Library ({templates.length})
                </h3>
                <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400">Ready for AI</span>
              </div>

              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1 custom-scrollbar">
                {templates.map((tmpl) => {
                  const isSelected = selectedTemplate?.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#0f2ea2] dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                          : isDark
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold line-clamp-1 ${
                          isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {tmpl.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                          {tmpl.category}
                        </span>
                      </div>
                      {renderSourceWithLink(tmpl.source, false)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Template Details & Instructional Placeholders */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div className={`p-4 sm:p-6 rounded-2xl border space-y-5 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 dark:border-slate-800">
                <div>
                  {renderSourceWithLink(selectedTemplate.source, true)}
                  <h3 className={`text-base sm:text-lg font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                    {cleanDescription(selectedTemplate.description)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedTemplateNotionInfo ? (
                    <a
                      href={selectedTemplateNotionInfo.url}
                      target="_blank"
                      rel="noreferrer"
                      title="Open this template in Notion"
                      className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                      <span>Open in Notion</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleSaveToNotion(selectedTemplate)}
                      disabled={savingToNotion}
                      title="Save this template to your Notion Template Library"
                      className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {savingToNotion ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0f2ea2]" /> : <Database className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />}
                      <span>{savingToNotion ? 'Saving...' : 'Save to Notion'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectTemplateForDrafting(selectedTemplate)}
                    className="whitespace-nowrap inline-flex items-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status Alert for Library Save */}
              {notionSaveStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                  notionSaveStatus.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {notionSaveStatus.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                    <span>{notionSaveStatus.message}</span>
                  </div>
                  {notionSaveStatus.url && (
                    <a
                      href={notionSaveStatus.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline font-bold ml-2 shrink-0 text-[#0f2ea2] dark:text-blue-300"
                    >
                      Open in Notion <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Clean Template Blueprint Only */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Post Template Blueprint
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Use this structure to guide your post draft
                  </span>
                </div>

                <div className="relative group">
                  {/* Floating Copy Icon on Post Area */}
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedTemplate.placeholderTemplate)}
                    aria-label="Copy blueprint"
                    title={copied ? 'Copied & Highlighted!' : 'Copy blueprint to clipboard'}
                    className={`absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
                      copied
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20 shadow-md scale-105'
                        : 'bg-white/95 dark:bg-slate-800/95 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#0f2ea2] hover:text-[#0f2ea2] dark:hover:border-blue-400 dark:hover:text-blue-400 backdrop-blur-xs'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium opacity-80 group-hover:opacity-100">Copy</span>
                      </>
                    )}
                  </button>

                  <div
                    ref={blueprintRef}
                    className={`blueprint-box p-5 pr-20 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed border min-h-[320px] max-h-[500px] overflow-y-auto custom-scrollbar transition-colors ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    } selection:bg-[#0f2ea2] selection:text-white dark:selection:bg-blue-600 dark:selection:text-white`}
                  >
                    {selectedTemplate.placeholderTemplate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
