import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, Upload, Link2, FileText, Image as ImageIcon, Sparkles, Copy, Check, 
  ArrowRight, BookOpen, Database, ExternalLink, Loader2, AlertCircle, CheckCircle2,
  Lightbulb, Compass, Target, MessageSquare, Quote, X, ChevronRight, Sliders
} from 'lucide-react';
import { FIVE_CORE_FRAMEWORKS, BENCHMARK_TEMPLATES, extractTemplateFromInput } from '../lib/templateExtractor.js';
import { safeGetItem } from '../lib/storage.js';
import { logActivity } from '../lib/auditLogger.js';

export default function TemplateIngestionStudio({ isDark, onSelectTemplateForDrafting }) {
  const getInitialTemplates = () => {
    try {
      const stored = localStorage.getItem('custom_ingested_templates');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Keep only user-deconstructed frameworks that are valid and NOT legacy benchmark items
          const validCustom = parsed.filter(t => {
            if (!t || !t.name) return false;
            const norm = t.name.trim().toLowerCase();
            // Discard legacy template names & old IDs
            if (t.id?.startsWith('tmpl-eb-') || t.id?.startsWith('tmpl-bench-')) return false;
            if (norm.includes('product launch announcement') || 
                norm.includes('live extracted linkedin') || 
                norm.includes('kaizen innovation & precision') ||
                norm.includes('workplace flexibility') ||
                norm.includes('quiet craft') ||
                norm.includes('humble craftsmanship')) {
              return false;
            }
            // Must have structureSteps or formula to be considered a genuine content framework
            return Array.isArray(t.structureSteps) && t.structureSteps.length > 0;
          });

          // Sync back cleaned custom list to localStorage
          localStorage.setItem('custom_ingested_templates', JSON.stringify(validCustom));

          // Combine with the 5 core strategic frameworks
          const combined = [...FIVE_CORE_FRAMEWORKS];
          for (const c of validCustom) {
            if (!combined.some(f => f.name?.trim().toLowerCase() === c.name?.trim().toLowerCase())) {
              combined.push(c);
            }
          }
          return combined;
        }
      }
    } catch (e) {
      console.warn('Could not read stored templates:', e);
    }
    return [...FIVE_CORE_FRAMEWORKS];
  };

  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'deconstruct'
  const [templates, setTemplates] = useState(getInitialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    const init = getInitialTemplates();
    return init[0] || FIVE_CORE_FRAMEWORKS[0];
  });

  const [copiedType, setCopiedType] = useState(null); // 'example' | 'blueprint' | 'steps'
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Ingestion inputs
  const [ingestType, setIngestType] = useState('screenshot'); // 'url', 'screenshot', 'pdf', 'text'
  const [urlInput, setUrlInput] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-lite');
  const [base64Image, setBase64Image] = useState('');
  const [extractError, setExtractError] = useState(null);

  // Newly Extracted Framework Review & Notion Save State
  const [justExtractedTemplate, setJustExtractedTemplate] = useState(null);
  const [savingToNotion, setSavingToNotion] = useState(false);
  const [notionSaveStatus, setNotionSaveStatus] = useState(null); // { status: 'success' | 'error', message, url }
  const [seedingBenchmarkToNotion, setSeedingBenchmarkToNotion] = useState(false);
  const [seedStatus, setSeedStatus] = useState(null);

  // Notion Sync Tracking
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

  const handleCopy = (text, type = 'example') => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
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

  const handleDeconstructPost = async () => {
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
      title: ingestType === 'url' ? 'Live Extracted LinkedIn Framework' : ingestType === 'screenshot' ? 'Visual Benchmark Deconstruction' : 'Document Archive Framework'
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
        logActivity({
          event: 'Deconstructed Content Framework',
          category: 'Content Generation',
          details: `Deconstructed framework "${data.template.name}" via ${selectedModel}`,
          status: 'Success'
        });
      } else {
        throw new Error(data.error || 'Failed to deconstruct post');
      }
    } catch (err) {
      console.warn('Deconstruction fallback to heuristic engine:', err.message);
      const fallbackFramework = extractTemplateFromInput(payload);
      setJustExtractedTemplate(fallbackFramework);
      logActivity({
        event: 'Deconstructed Framework (Heuristic Engine)',
        category: 'Content Generation',
        details: `Deconstructed framework "${fallbackFramework.name}" using heuristic engine`,
        status: 'Success'
      });
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
          message: `Saved "${tmplToSave.name}" to Notion Framework Library!`,
          url: data.notionUrl
        });
        logActivity({
          event: 'Saved Framework to Notion',
          category: 'Content Generation',
          details: `Saved framework "${tmplToSave.name}" to Notion repository`,
          status: 'Success'
        });

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

        if (!templates.some(t => t.id === tmplToSave.id)) {
          const updated = [tmplToSave, ...templates];
          setTemplates(updated);
          try {
            const customOnly = updated.filter(t => !BENCHMARK_TEMPLATES.some(b => b.id === t.id));
            localStorage.setItem('custom_ingested_templates', JSON.stringify(customOnly));
          } catch (_) {}
        }
        setSelectedTemplate(tmplToSave);
      } else {
        const errorMsg = data.error || 'Failed to save to Notion. Please check NOTION_API_KEY in Integrations.';
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

  const handleApplyJustExtracted = () => {
    if (justExtractedTemplate) {
      if (!templates.some(t => t.id === justExtractedTemplate.id)) {
        const updated = [justExtractedTemplate, ...templates];
        setTemplates(updated);
        try {
          const customOnly = updated.filter(t => !BENCHMARK_TEMPLATES.some(b => b.id === t.id));
          localStorage.setItem('custom_ingested_templates', JSON.stringify(customOnly));
        } catch (_) {}
      }
      setSelectedTemplate(justExtractedTemplate);
      setActiveTab('library');
    }
  };

  const filteredTemplates = templates.filter(tmpl => {
    const matchesSearch = (tmpl.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                          (tmpl.formula || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                          (tmpl.description || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
                          (tmpl.category || '').toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === 'all' || (tmpl.category || '').toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const selectedTemplateNotionInfo = getSavedNotionInfo(selectedTemplate?.name);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Top Header Banner */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              <Layers className="w-3.5 h-3.5" />
              Content Frameworks
            </div>
            <h2 className={`text-lg sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Brother Singapore Content Framework Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Strategic narrative architectures that guide AI prompt generation. Deconstruct high-performing posts into reusable communication formulas.
            </p>
          </div>

          {/* Main 2-Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white dark:bg-slate-900 text-[#0f2ea2] dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Framework Library ({templates.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('deconstruct')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'deconstruct'
                  ? 'bg-[#0f2ea2] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Deconstruct New Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: FRAMEWORK LIBRARY (5 Strategic Frameworks + Split View) */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Column: 5 Frameworks List */}
          <div className="lg:col-span-4 space-y-3">
            <div className={`p-3.5 sm:p-4 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Strategic Frameworks ({filteredTemplates.length})
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-300 font-bold">
                  AI Calibrated
                </span>
              </div>

              {/* Search & Filter */}
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search frameworks (e.g. H-C-V-P-P-A, Kaizen)..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] mb-3"
              />

              {/* Framework Cards */}
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredTemplates.map((tmpl) => {
                  const isSelected = selectedTemplate?.id === tmpl.id;
                  const formulaBadge = tmpl.formula || (tmpl.id?.includes('possibility') ? 'H-C-V-P-P-A' : 'FRAMEWORK');
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplate(tmpl)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 border-[#0f2ea2] dark:bg-blue-950/60 dark:border-blue-400 shadow-md ring-1 ring-[#0f2ea2]/20'
                          : isDark
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0f2ea2] text-white">
                          {formulaBadge}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                          {tmpl.category}
                        </span>
                      </div>
                      <h4 className={`text-xs font-bold leading-snug ${
                        isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {tmpl.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {tmpl.description || tmpl.philosophy}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Deep Explanation of Selected Framework */}
          <div className="lg:col-span-8 space-y-4">
            <div className={`p-5 sm:p-7 rounded-2xl border space-y-6 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-4 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#0f2ea2] text-white">
                      {selectedTemplate.formula || 'H-C-V-P-P-A Formula'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      {selectedTemplate.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Source: {selectedTemplate.source || 'Brother Benchmark'}
                    </span>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold pt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <strong>Tone DNA:</strong> {selectedTemplate.tone}
                  </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start">
                  <button
                    onClick={() => onSelectTemplateForDrafting(selectedTemplate)}
                    className="inline-flex items-center gap-2 bg-[#0f2ea2] hover:bg-[#0c2482] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Use Framework in Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {selectedTemplateNotionInfo ? (
                    <a
                      href={selectedTemplateNotionInfo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#0f2ea2] transition-colors"
                      title="Open in Notion"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleSaveToNotion(selectedTemplate)}
                      disabled={savingToNotion}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#0f2ea2] transition-colors disabled:opacity-50 cursor-pointer"
                      title="Save to Notion"
                    >
                      <Database className={`w-4 h-4 ${savingToNotion ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Section 1: The Narrative Architecture (Step by Step) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400" />
                    <span>1. Narrative Architecture & Cognitive Sequence</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedTemplate.structureSteps || [], null, 2), 'steps')}
                    className="text-[11px] font-semibold text-[#0f2ea2] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    {copiedType === 'steps' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === 'steps' ? 'Copied Steps' : 'Copy Prompt Steps'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedTemplate.structureSteps || [
                    { step: "HOOK", label: "Friendly Hook", purpose: "Earn attention before naming product", prompt: "Open with everyday relevance" },
                    { step: "CONTEXT", label: "Communal Context", purpose: "Why does this matter to the user?", prompt: "Anchor in an everyday workplace situation" },
                    { step: "VALUE", label: "Human Value", purpose: "Translate specs to user benefit", prompt: "Sell what they can create, not specs" },
                    { step: "PROOF", label: "Credible Proof", purpose: "State model and promo facts", prompt: "Clear details without spec dump" },
                    { step: "POSSIBILITY", label: "Future Projection", purpose: "Help customer picture the outcome", prompt: "Connect work benefit to life beyond desk" },
                    { step: "ACTION", label: "Single CTA", purpose: "Direct reader to next step", prompt: "One clear consultative call to action" }
                  ]).map((st, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-[#0f2ea2] dark:text-blue-400">
                          Step 0{sIdx + 1}: {st.step}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{st.label}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {st.purpose}
                      </p>
                      {st.prompt && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          "{st.prompt}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Why It Differs & Core Philosophy */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>2. Why This Framework Differs & Communication Philosophy</span>
                </h4>

                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200 space-y-2 leading-relaxed">
                  <p className="font-semibold">
                    {selectedTemplate.whyItDiffers || "Traditional posts sound like dry corporate press releases filled with model numbers and spec dumps. This framework sells what creators and businesses can achieve, converting features into emotional value."}
                  </p>
                  <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                    <Quote className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      <strong>Philosophy: </strong>
                      {selectedTemplate.philosophy || "Sell the possibility before the specification. Transform: Company Message → Audience Relevance → Audience Action."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: When To Use It */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span>3. When To Use It (Scenario & Triggers)</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  {selectedTemplate.whenToUse || "Product launches, customer value updates, promotional bundles, and milestone showcases across Singapore SMEs and professional audiences."}
                </p>
              </div>

              {/* Section 4: Real Brother Singapore Example Post */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400" />
                    <span>4. Applied Brother Singapore Post Example</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(selectedTemplate.examplePost, 'example')}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                  >
                    {copiedType === 'example' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'example' ? 'Copied Post' : 'Copy Example Post'}</span>
                  </button>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {selectedTemplate.examplePost || "Sample post demonstration available once extracted."}
                </div>
              </div>

              {/* Section 5: Writing Rules */}
              {selectedTemplate.rules && selectedTemplate.rules.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    5. Writing Rules & Algorithmic Guardrails
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    {selectedTemplate.rules.map((r, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI POST DECONSTRUCTOR (Upload URL, Screenshot, PDF or Copy) */}
      {activeTab === 'deconstruct' && (
        <div className="space-y-6">
          {/* Ingestion Input Card */}
          <div className={`p-5 sm:p-7 rounded-2xl border space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="border-b pb-4 dark:border-slate-800">
              <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400 font-bold uppercase tracking-wider">
                Autonomous Reverse-Engineering Engine
              </span>
              <h3 className={`text-lg sm:text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Deconstruct Competitor & Benchmark Posts with AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Provide a live post link, screenshot (like the Epson printer launch), or document. The engine analyzes structure, tone, philosophy, critiques weaknesses, and extracts an elevated <strong>Content Framework</strong> tailored for Brother Singapore.
              </p>
            </div>

            {/* Ingestion Mode Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border dark:border-slate-800">
              <button
                onClick={() => setIngestType('screenshot')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  ingestType === 'screenshot' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Screenshot (PNG/JPG)</span>
              </button>
              <button
                onClick={() => setIngestType('url')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  ingestType === 'url' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>Post URL</span>
              </button>
              <button
                onClick={() => setIngestType('pdf')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  ingestType === 'pdf' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>PDF / Document</span>
              </button>
              <button
                onClick={() => setIngestType('text')}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  ingestType === 'text' ? 'bg-[#0f2ea2] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Paste Copy</span>
              </button>
            </div>

            {/* Input Views */}
            {ingestType === 'screenshot' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Upload Post Screenshot (Epson, Competitor, or Award-Winning LinkedIn Post)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-[#0f2ea2] transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/40">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <ImageIcon className="w-8 h-8 text-[#0f2ea2] dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {uploadFileName ? `Selected: ${uploadFileName}` : 'Drag & drop image screenshot (PNG, WebP, JPG), or click to browse'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Extracts caption text, creative image alignment, and communication philosophy
                  </p>
                  {base64Image && (
                    <div className="mt-3 inline-block rounded-lg overflow-hidden border border-slate-200 max-h-36">
                      <img src={base64Image} alt="Uploaded Preview" className="h-28 w-auto object-contain mx-auto" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {ingestType === 'url' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  LinkedIn Post or Promotional Webpage Link
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.linkedin.com/posts/epsonamerica_surecolor-f370-..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
                />
              </div>
            )}

            {ingestType === 'pdf' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Upload Post Archive or Presentation (PDF / Word)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-[#0f2ea2] transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/40">
                  <input
                    type="file"
                    accept="application/pdf, text/plain"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {uploadFileName ? `Selected: ${uploadFileName}` : 'Drop PDF or document file here'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Multi-page campaign archives and editorial briefs</p>
                </div>
              </div>
            )}

            {ingestType === 'text' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Paste LinkedIn Post Copy or Video Transcript
                </label>
                <textarea
                  rows={5}
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="Paste the caption text or post transcript here..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0f2ea2]"
                />
              </div>
            )}

            {/* Model Engine Selector & Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Deconstruction Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0f2ea2] dark:text-blue-400"
                >
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Fast)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro-Preview (Deep Reasoning)</option>
                </select>
              </div>

              <button
                onClick={handleDeconstructPost}
                disabled={analyzing || (!urlInput && !base64Image && !uploadFileName && !pastedContent)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Deconstructing with AI...' : 'Deconstruct Post & Generate Framework'}</span>
              </button>
            </div>
          </div>

          {/* DECONSTRUCTION RESULT CARD */}
          {justExtractedTemplate && (
            <div className="p-5 sm:p-7 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-5 animate-in fade-in duration-200">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Strategic Deconstruction Complete
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {justExtractedTemplate.name} ({justExtractedTemplate.formula || 'H-C-V-A'})
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleApplyJustExtracted}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>View in Library</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectTemplateForDrafting(justExtractedTemplate)}
                    className="inline-flex items-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Use in Content Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleSaveToNotion(justExtractedTemplate)}
                    disabled={savingToNotion}
                    className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Database className={`w-3.5 h-3.5 text-[#0f2ea2] ${savingToNotion ? 'animate-spin' : ''}`} />
                    <span>Save to Notion</span>
                  </button>
                </div>
              </div>

              {/* Status Alert */}
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
                    <a href={notionSaveStatus.url} target="_blank" rel="noreferrer" className="underline font-bold text-[#0f2ea2] dark:text-blue-300">
                      Open in Notion ↗
                    </a>
                  )}
                </div>
              )}

              {/* Strategic Insights Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#0f2ea2] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Communication Philosophy
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {justExtractedTemplate.philosophy || "Sell the possibility before the specification. Human outcome over machine specs."}
                  </p>
                  {justExtractedTemplate.sourceDeconstruction?.whatItAvoids && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <strong>Avoids:</strong> {justExtractedTemplate.sourceDeconstruction.whatItAvoids}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Critique: Weaknesses & Gaps
                  </span>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    {(justExtractedTemplate.critique?.weaknesses || ["Generic announcement hook", "Customer friction not explicit", "No strong CTA"]).map((w, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold shrink-0">⚠️</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    Evolved Framework Formula
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    Formula: {justExtractedTemplate.formula || 'H-C-V-P-P-A'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {(justExtractedTemplate.structureSteps || []).map(s => s.step).join(' → ') || 'Hook → Context → Value → Action'}
                  </p>
                  {justExtractedTemplate.tone && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <strong>Tone:</strong> {justExtractedTemplate.tone}
                    </div>
                  )}
                </div>
              </div>

              {/* Narrative Architecture Sequence */}
              {justExtractedTemplate.structureSteps && justExtractedTemplate.structureSteps.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#0f2ea2]" />
                    Evolved Narrative Steps (Prompt Architecture):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {justExtractedTemplate.structureSteps.map((st, sIdx) => (
                      <div key={sIdx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-[#0f2ea2] dark:text-blue-400">
                            {st.step}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{st.label}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {st.purpose}
                        </p>
                        {st.prompt && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                            "{st.prompt}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applied Brother Example Post (Original, Differentiated Execution) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#0f2ea2]" />
                    Applied Brother Singapore Post Demonstration (Original Differentiated Copy):
                  </span>
                  <button
                    onClick={() => handleCopy(justExtractedTemplate.examplePost, 'example')}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedType === 'example' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'example' ? 'Copied' : 'Copy Post'}</span>
                  </button>
                </div>
                <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-sans text-xs whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 shadow-xs">
                  {justExtractedTemplate.examplePost}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
