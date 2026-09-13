import React, { useState, useEffect, useMemo } from 'react';
import { 
  Edit3, Send, CheckCircle2, Copy, Check, Sparkles, AlertCircle, Database, 
  ExternalLink, BookOpen, Layers, Search, X, Filter, ArrowRight, ChevronDown 
} from 'lucide-react';
import NotionIcon from './icons/NotionIcon.jsx';
import ImageTemplateStudio from './ImageTemplateStudio.jsx';
import { publishToLinkedInApi } from '../lib/linkedInApi.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';
import { generateAIDrafts, generateFestiveDrafts } from '../lib/draftGenerator.js';
import { BENCHMARK_TEMPLATES } from '../lib/templateExtractor.js';

export default function DraftMediaStudio({ 
  isDark, 
  initialContent, 
  initialTitle, 
  initialOccasion, 
  initialDraft, 
  initialAvailableDrafts,
  onNavigateToSettings 
}) {
  const [title, setTitle] = useState(initialTitle || 'Singapore National Day 2026 Celebration');
  const [content, setContent] = useState(initialContent || `Happy 61st Singapore National Day! 🇸🇬✨

From humble beginnings to a global powerhouse of smart-nation innovation, we stand 'At your side' empowering businesses and communities across Singapore.

At Brother Singapore, our commitment goes beyond hardware — it is about honoring the resilient, multicultural fabric that makes our island nation vibrant and forward-looking.

Thank you to our dedicated team, partners, and clients who inspire us every single day. Majulah Singapura! 🎉

To everyone celebrating, how is your team marking this special day? Share your favorite traditions below! 👇

#BrotherSingapore #NDP2026 #NationalDay2026 #MajulahSingapura #AtYourSide #WorkplaceInnovation`);

  const [occasion, setOccasion] = useState(initialOccasion || null);
  const [activeDraft, setActiveDraft] = useState(initialDraft || null);
  const [availableDrafts, setAvailableDrafts] = useState(initialAvailableDrafts || []);

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialDraft?.id || initialDraft?.templateId || null
  );
  const [currentRationale, setCurrentRationale] = useState(
    initialDraft?.whyThisWorks || ''
  );

  // Template Library Modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');

  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [notionSaving, setNotionSaving] = useState(false);
  const [notionSavedData, setNotionSavedData] = useState(null);
  const [notionError, setNotionError] = useState(null);

  // Sync state when props update (e.g., navigating from Events or News & Trends)
  useEffect(() => {
    if (initialTitle !== undefined && initialTitle !== null) {
      setTitle(initialTitle);
    }
  }, [initialTitle]);

  useEffect(() => {
    if (initialContent !== undefined && initialContent !== null) {
      setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    if (initialOccasion !== undefined) {
      setOccasion(initialOccasion);
    }
  }, [initialOccasion]);

  useEffect(() => {
    if (initialDraft !== undefined && initialDraft !== null) {
      setActiveDraft(initialDraft);
      setSelectedTemplateId(initialDraft.id || initialDraft.templateId || null);
      if (initialDraft.whyThisWorks) {
        setCurrentRationale(initialDraft.whyThisWorks);
      }
    }
  }, [initialDraft]);

  useEffect(() => {
    if (initialAvailableDrafts && Array.isArray(initialAvailableDrafts) && initialAvailableDrafts.length > 0) {
      setAvailableDrafts(initialAvailableDrafts);
    }
  }, [initialAvailableDrafts]);

  // Read custom ingested templates from local storage
  const getCustomIngestedTemplates = () => {
    try {
      const stored = localStorage.getItem('custom_ingested_templates');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read custom templates:', e);
    }
    return [];
  };

  // Derive contextual drafts for quick pill switching
  const contextualDrafts = useMemo(() => {
    if (availableDrafts && availableDrafts.length > 0) {
      return availableDrafts;
    }
    if (occasion && occasion.eventType !== 'corporate' && occasion.name) {
      return generateFestiveDrafts({
        name: occasion.name,
        culturalContext: occasion.details,
        suggestedHashtags: occasion.suggestedHashtags
      });
    }
    // Default AI strategy angles
    return generateAIDrafts({
      title: title || 'Workplace Innovation Breakthrough',
      snippet: content || 'Recent breakthroughs in workplace technology are transforming daily operations.',
      sourceTitle: 'Brother Singapore Intelligence'
    });
  }, [availableDrafts, occasion, title, content]);

  // Set default active template if not set
  useEffect(() => {
    if (!selectedTemplateId && contextualDrafts.length > 0) {
      const first = contextualDrafts[0];
      setSelectedTemplateId(first.id || first.templateId || 'draft-0');
      if (!currentRationale && (first.whyThisWorks || first.description)) {
        setCurrentRationale(first.whyThisWorks || first.description);
      }
    }
  }, [contextualDrafts, selectedTemplateId, currentRationale]);

  // Full comprehensive template catalog for the library modal
  const allLibraryTemplates = useMemo(() => {
    const custom = getCustomIngestedTemplates();
    const benchmark = BENCHMARK_TEMPLATES || [];
    const combined = [];

    // Add contextual drafts first
    contextualDrafts.forEach((d, idx) => {
      combined.push({
        id: d.id || `context-draft-${idx}`,
        name: d.name || d.templateName || `Strategy Angle #${idx + 1}`,
        category: d.category || (occasion ? 'Festive & Cultural' : 'Thought Leadership & Strategy'),
        tone: d.tone || 'Strategic & Authoritative',
        whyThisWorks: d.whyThisWorks || d.description || d.angle || 'Tailored to drive engagement and executive clarity.',
        post: d.postContent || d.post || '',
        postContent: d.postContent || d.post || '',
        isContextual: true
      });
    });

    // Add benchmark templates
    benchmark.forEach((b) => {
      if (!combined.some(c => c.name?.trim().toLowerCase() === b.name?.trim().toLowerCase())) {
        combined.push({
          id: b.id,
          name: b.name,
          category: b.category,
          tone: b.tone,
          whyThisWorks: b.description,
          post: b.examplePost || b.placeholderTemplate,
          postContent: b.examplePost || b.placeholderTemplate,
          isContextual: false
        });
      }
    });

    // Add custom ingested templates
    custom.forEach((c) => {
      if (!combined.some(item => item.name?.trim().toLowerCase() === c.name?.trim().toLowerCase())) {
        combined.push({
          id: c.id,
          name: c.name,
          category: c.category || 'Custom Ingested',
          tone: c.tone || 'Culturally Calibrated',
          whyThisWorks: c.description || 'Custom corporate benchmark template.',
          post: c.examplePost || c.placeholderTemplate,
          postContent: c.examplePost || c.placeholderTemplate,
          isContextual: false
        });
      }
    });

    return combined;
  }, [contextualDrafts, occasion]);

  // Filtered templates for modal
  const filteredTemplates = useMemo(() => {
    return allLibraryTemplates.filter(tmpl => {
      const matchesSearch = 
        !templateSearchQuery ||
        tmpl.name?.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        tmpl.category?.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        tmpl.whyThisWorks?.toLowerCase().includes(templateSearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (templateCategoryFilter === 'all') return true;
      if (templateCategoryFilter === 'thought-leadership') {
        return tmpl.category?.toLowerCase().includes('thought leadership') || tmpl.category?.toLowerCase().includes('strategy') || tmpl.category?.toLowerCase().includes('executive');
      }
      if (templateCategoryFilter === 'employer-branding') {
        return tmpl.category?.toLowerCase().includes('employer') || tmpl.category?.toLowerCase().includes('culture') || tmpl.category?.toLowerCase().includes('talent') || tmpl.category?.toLowerCase().includes('intern');
      }
      if (templateCategoryFilter === 'b2b-solutions') {
        return tmpl.category?.toLowerCase().includes('b2b') || tmpl.category?.toLowerCase().includes('engineering') || tmpl.category?.toLowerCase().includes('operations');
      }
      if (templateCategoryFilter === 'sustainability') {
        return tmpl.category?.toLowerCase().includes('sustainability') || tmpl.category?.toLowerCase().includes('esg') || tmpl.category?.toLowerCase().includes('green');
      }
      if (templateCategoryFilter === 'festive') {
        return tmpl.category?.toLowerCase().includes('festive') || tmpl.category?.toLowerCase().includes('cultural') || tmpl.category?.toLowerCase().includes('community');
      }
      return true;
    });
  }, [allLibraryTemplates, templateSearchQuery, templateCategoryFilter]);

  // Handle template selection
  const handleSelectTemplate = (template, idx) => {
    const text = template.postContent || template.post || template.examplePost || template.placeholderTemplate || '';
    if (text) {
      setContent(text);
    }
    const templateName = template.name || template.templateName || `Template #${idx + 1}`;
    const id = template.id || `tmpl-${idx}`;
    setSelectedTemplateId(id);
    setCurrentRationale(template.whyThisWorks || template.description || template.angle || '');

    setActiveDraft({
      id,
      name: templateName,
      post: text,
      postContent: text,
      whyThisWorks: template.whyThisWorks || template.description || template.angle || ''
    });

    setShowTemplateModal(false);
  };

  // Compute live effective occasion for ImageTemplateStudio
  const effectiveOccasion = useMemo(() => {
    if (occasion) {
      return {
        ...occasion,
        name: title || occasion.name,
      };
    }
    return {
      id: 'custom-content',
      name: title || 'Singapore National Day 2026 Celebration',
      subtitle: 'Workplace innovation & community connection',
      category: 'Corporate Celebration',
      eventType: 'corporate',
      theme: 'blue',
      badgeText: 'Spotlight',
      details: 'Official Brother Singapore announcement and thought leadership.',
      suggestedHashtags: ['#BrotherSingapore', '#AtYourSide', '#Innovation', '#Singapore']
    };
  }, [occasion, title]);

  // Compute live effective draft for ImageTemplateStudio
  const effectiveDraft = useMemo(() => {
    return {
      id: activeDraft?.id || 'active-draft',
      name: activeDraft?.name || title || 'Community & Innovation',
      post: content,
      postContent: content,
      whyThisWorks: currentRationale || activeDraft?.whyThisWorks || 'Crafted to drive professional engagement, corporate culture visibility, and workplace innovation.'
    };
  }, [activeDraft, title, content, currentRationale]);

  // Persist draft to localStorage so edits survive page reloads and tab switches
  useEffect(() => {
    safeSetItem('brother_active_draft_payload', JSON.stringify({
      title,
      content,
      occasion: effectiveOccasion,
      activeDraft: effectiveDraft,
      availableDrafts: contextualDrafts
    }));
  }, [title, content, effectiveOccasion, effectiveDraft, contextualDrafts]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotionRepository = async (passedUrn = null) => {
    const token = safeGetItem('notion_token') || safeGetItem('token_notion');
    const explicitDb = safeGetItem('notion_database_id') || '3c701136de4881de9d29ca4ea415e856';

    setNotionSaving(true);
    setNotionError(null);

    const postPayload = {
      title: title || 'Brother Singapore Official Post',
      content: content,
      category: effectiveOccasion?.category || 'AI & Employer Branding',
      status: 'Published',
      author: 'Allan Cheng',
      date: new Date().toISOString().split('T')[0],
      urn: passedUrn || publishedData?.urn || `urn:li:share:${Math.floor(100000000 + Math.random() * 900000000)}`,
      impressions: 0,
      likes: 0,
      comments: 0,
      reposts: 0,
      engagementRate: '0.0%'
    };

    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          databaseId: explicitDb,
          post: postPayload
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotionSavedData({
          url: data.url,
          message: 'Saved to Notion Enterprise Repository'
        });
      } else {
        setNotionError(data.error || 'Failed to archive in Notion');
      }
    } catch (e) {
      setNotionError(e.message);
    } finally {
      setNotionSaving(false);
    }
  };

  const handlePublishToLinkedIn = async () => {
    setPublishing(true);
    setPublishError(null);
    const token = safeGetItem('key_linkedin');
    const orgId = safeGetItem('linkedin_org_id') || '96363282';

    try {
      const result = await publishToLinkedInApi({ commentary: content, orgId, token: token || undefined });

      if (result && result.success) {
        setPublishing(false);
        setPublishError(null);
        setPublishedData({
          urn: result.urn,
          status: 'Live on LinkedIn',
          isLive: true,
          publishedAt: result.publishedAt || new Date().toLocaleTimeString(),
          notionStatus: 'Synced to Notion Repository',
          postUrl: result.urn ? `https://www.linkedin.com/feed/update/${result.urn}` : null
        });
        handleSaveToNotionRepository(result.urn);
        return;
      } else {
        setPublishing(false);
        setPublishError({
          message: result?.error || 'LinkedIn API returned an error. Ensure your OAuth 2.0 token with w_organization_social scope is configured.',
          needsToken: !token
        });
      }
    } catch (err) {
      setPublishing(false);
      setPublishError({
        message: err.message || 'Network error connecting to LinkedIn publishing API.',
        needsToken: !token
      });
    }
  };

  const handleSimulatePublish = () => {
    setPublishing(true);
    setPublishError(null);
    setTimeout(() => {
      const mockUrn = `urn:li:share:${Math.floor(100000000 + Math.random() * 900000000)}`;
      setPublishing(false);
      setPublishedData({
        urn: mockUrn,
        status: 'Simulated Broadcast (Sandbox)',
        isLive: false,
        publishedAt: new Date().toLocaleTimeString(),
        notionStatus: 'Synced to Notion Repository'
      });
      handleSaveToNotionRepository(mockUrn);
    }, 800);
  };

  // LinkedIn mobile fold character threshold (~140 chars)
  const foldCharLimit = 140;
  const isOverFold = content.length > foldCharLimit;
  const preFoldText = content.slice(0, foldCharLimit);
  const postFoldText = content.slice(foldCharLimit);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1 sm:mb-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Content Studio
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Post Copy & Visual Studio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose from high-converting narrative templates and craft multi-slide carousel visuals in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleSaveToNotionRepository()}
              disabled={notionSaving || Boolean(notionSavedData)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <NotionIcon className={`w-3.5 h-3.5 ${notionSaving ? 'animate-spin' : ''}`} />
              <span>{notionSaving ? 'Archiving...' : notionSavedData ? 'In Notion Repo' : 'Archive to Notion'}</span>
            </button>
            <button
              onClick={handlePublishToLinkedIn}
              disabled={publishing || (publishedData && publishedData.status === 'Live on LinkedIn')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                publishedData
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0f2ea2] hover:bg-[#0c2482] text-white'
              }`}
            >
              {publishing ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : publishedData ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {publishing ? 'Connecting to LinkedIn...' : publishedData ? 'Published on LinkedIn!' : '1-Click Publish to LinkedIn'}
            </button>
          </div>
        </div>
      </div>

      {/* Publish Error / Missing Credentials Notice Banner */}
      {publishError && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">LinkedIn Live Publish Required Credentials</span>
              <p className="mt-0.5 opacity-90 leading-relaxed">{publishError.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="px-3.5 py-1.5 rounded-lg bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Configure in Integrations ↗
              </button>
            )}
            <button
              type="button"
              onClick={handleSimulatePublish}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100/50 transition-all cursor-pointer"
            >
              Simulate Test Broadcast
            </button>
          </div>
        </div>
      )}

      {/* Notion Saved Feedback Banner */}
      {notionSavedData && (
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
            <div>
              <span className="font-bold">Archived to Notion Enterprise Repository!</span>
              <span className="text-[11px] opacity-80 ml-2">Permanent database record saved for analytics telemetry.</span>
            </div>
          </div>
          {notionSavedData.url && (
            <a
              href={notionSavedData.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline shrink-0"
            >
              <span>View in Notion</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Published Data Banner */}
      {publishedData && (
        <div className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          publishedData.isLive
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
            : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${publishedData.isLive ? 'text-emerald-500' : 'text-blue-500'}`} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold">
                  {publishedData.isLive
                    ? 'Post is Live on Brother Singapore Company Page!'
                    : 'Simulated Broadcast (Sandbox Test Mode)'}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  publishedData.isLive
                    ? 'bg-emerald-200/60 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100'
                    : 'bg-blue-200/60 dark:bg-blue-900/80 text-blue-900 dark:text-blue-100'
                }`}>
                  {publishedData.isLive ? 'Live API Verified' : 'Test Sandbox'}
                </span>
              </div>
              <div className="font-mono text-[11px] opacity-80 mt-0.5">Post URN: {publishedData.urn} • {publishedData.notionStatus}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {publishedData.postUrl && (
              <a
                href={publishedData.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 hover:underline text-xs"
              >
                <span>View on LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
              publishedData.isLive
                ? 'bg-emerald-100 dark:bg-emerald-900/60'
                : 'bg-blue-100 dark:bg-blue-900/60'
            }`}>
              Published at {publishedData.publishedAt}
            </span>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Layout: Post Copy Editor (Left) + Visual Template Studio (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        {/* Left: Text Editor & LinkedIn Fold Preview */}
        <div className="xl:col-span-5 space-y-4">
          <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Editorial Post Copy
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0f2ea2] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold transition-all cursor-pointer border border-blue-200 dark:border-blue-800/60"
                  title="Browse All Templates"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Templates ({allLibraryTemplates.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold text-xs cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
            </div>

            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Post Subject / Campaign Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Campaign or Occasion Title..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none"
              />
            </div>

            {/* Template Selector Section */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                  <span>Choose Post Template / Angle:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="text-[11px] font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3 h-3" />
                  <span>Browse All ({allLibraryTemplates.length})</span>
                </button>
              </div>

              {/* Template Dropdown Selector */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedTemplateId || (contextualDrafts[0] ? (contextualDrafts[0].id || contextualDrafts[0].templateId) : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__browse_all__') {
                        setShowTemplateModal(true);
                        return;
                      }
                      const found = allLibraryTemplates.find(t => (t.id || t.templateId) === val) ||
                                    contextualDrafts.find(t => (t.id || t.templateId) === val);
                      if (found) {
                        handleSelectTemplate(found, 0);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:ring-1 focus:ring-[#0f2ea2] focus:outline-none appearance-none cursor-pointer pr-10 shadow-xs"
                  >
                    <optgroup label="Campaign Angles & Frameworks">
                      {contextualDrafts.map((d, idx) => (
                        <option key={d.id || idx} value={d.id || d.templateId}>
                          #{idx + 1} {d.name || d.templateName}
                        </option>
                      ))}
                    </optgroup>
                    {allLibraryTemplates.some(t => !t.isContextual) && (
                      <optgroup label="Brother Benchmark Templates">
                        {allLibraryTemplates.filter(t => !t.isContextual).map((b, idx) => (
                          <option key={b.id || `bench-${idx}`} value={b.id}>
                            {b.name} ({b.category})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-[#0f2ea2] dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  title="Browse Full Template Library"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Library</span>
                </button>
              </div>

              {/* Strategic Rationale Banner */}
              {currentRationale && (
                <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-[#0f2ea2] dark:text-blue-300">Strategic Rationale: </strong>
                      {currentRationale}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Post Copy (Markdown & Formatting) Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Post Copy (Markdown & Formatting)
                </label>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-slate-400">{content.length} characters</span>
                  <span className="text-[#0f2ea2] dark:text-blue-400 font-bold">• {content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              <textarea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your LinkedIn post copy here..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 font-mono text-xs leading-relaxed text-slate-900 dark:text-white focus:border-[#0f2ea2] focus:outline-none custom-scrollbar"
              />
            </div>

            {/* LinkedIn Mobile Fold Line Visualizer */}
            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#0f2ea2] dark:text-blue-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  LinkedIn Mobile "...see more" Fold Line (First 140 Chars)
                </span>
                <span className="font-mono text-slate-500">
                  {Math.min(content.length, 140)} / 140
                </span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-snug font-sans">
                <span className="bg-blue-200/60 dark:bg-blue-900/60 font-semibold px-0.5 rounded">
                  {preFoldText}
                </span>
                {isOverFold && (
                  <span className="text-slate-400 italic">
                    {" "}[...see more fold line]{" "}
                    <span className="opacity-60">{postFoldText.slice(0, 40)}...</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Visual Studio with Multi-Slide Carousels, Official Assets & AI */}
        <div className="xl:col-span-7 space-y-4">
          <div className={`p-4 sm:p-6 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <ImageTemplateStudio
              occasion={effectiveOccasion}
              activeDraft={effectiveDraft}
              isDark={isDark}
            />
          </div>
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0f2ea2] text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Choose Post Template
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select from Brother Singapore proven editorial structures and strategic frameworks ({filteredTemplates.length} available)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  placeholder="Search templates by name, tone, or strategic topic..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
                />
                {templateSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTemplateSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
                {[
                  { id: 'all', label: 'All Templates' },
                  { id: 'thought-leadership', label: 'Strategy & AI' },
                  { id: 'employer-branding', label: 'Employer Branding' },
                  { id: 'b2b-solutions', label: 'B2B & Solutions' },
                  { id: 'sustainability', label: 'Sustainability & ESG' },
                  { id: 'festive', label: 'Festive & Cultural' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setTemplateCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-xl whitespace-nowrap font-semibold transition-all cursor-pointer ${
                      templateCategoryFilter === cat.id
                        ? 'bg-[#0f2ea2] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template List Cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredTemplates.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-semibold">No templates found matching your criteria.</p>
                  <p className="text-[11px] opacity-75 mt-1">Try clearing your search query or selecting "All Templates".</p>
                </div>
              ) : (
                filteredTemplates.map((tmpl, idx) => {
                  const isCurrentlyActive = selectedTemplateId === tmpl.id || (activeDraft?.name === tmpl.name);
                  return (
                    <div
                      key={tmpl.id || idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrentlyActive
                          ? 'border-[#0f2ea2] bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-[#0f2ea2]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {tmpl.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#0f2ea2] dark:text-blue-300">
                              {tmpl.category}
                            </span>
                            {tmpl.tone && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                • {tmpl.tone}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectTemplate(tmpl, idx)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            isCurrentlyActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#0f2ea2] hover:bg-[#0c2482] text-white shadow-sm active:scale-95'
                          }`}
                        >
                          {isCurrentlyActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Active Template</span>
                            </>
                          ) : (
                            <>
                              <span>Apply Template</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>

                      {tmpl.whyThisWorks && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                          <strong className="text-slate-800 dark:text-slate-200">Angle: </strong>
                          {tmpl.whyThisWorks}
                        </p>
                      )}

                      {/* Post Snippet Preview */}
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 font-mono text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed border border-slate-200/60 dark:border-slate-800">
                        {tmpl.post || tmpl.postContent || tmpl.examplePost || tmpl.placeholderTemplate}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
              <span>Selecting a template updates post copy and synchronizes with the Visual Studio.</span>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
