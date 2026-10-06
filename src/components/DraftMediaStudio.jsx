import React, { useState, useEffect, useMemo } from 'react';
import { 
  Edit3, Send, CheckCircle2, Copy, Check, Sparkles, AlertCircle, Database, 
  ExternalLink, BookOpen, Layers, Search, X, Filter, ArrowRight, ChevronDown,
  CalendarDays, Clock, Zap, ShieldCheck, Upload, Link2, RefreshCw
} from 'lucide-react';
import NotionIcon from './icons/NotionIcon.jsx';
import ImageTemplateStudio from './ImageTemplateStudio.jsx';
import { publishToLinkedInApi } from '../lib/linkedInApi.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';
import { generateAIDrafts, generateFestiveDrafts } from '../lib/draftGenerator.js';
import { BENCHMARK_TEMPLATES, extractTemplateFromInput } from '../lib/templateExtractor.js';
import { getSavedStyleGuides, saveStyleGuide } from '../lib/styleGuideLibrary.js';
import { logActivity } from '../lib/auditLogger.js';

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

  // Style Guide Library & Extraction state
  const [savedStyleGuides, setSavedStyleGuides] = useState(getSavedStyleGuides);
  const [selectedStyleGuideId, setSelectedStyleGuideId] = useState(() => {
    const list = getSavedStyleGuides();
    return list[0]?.id || 'sme-commercial-savings';
  });
  const [referenceMode, setReferenceMode] = useState('saved'); // 'saved' | 'reference'
  const [referenceText, setReferenceText] = useState('');
  const [generatingAiDrafts, setGeneratingAiDrafts] = useState(false);
  const [aiDraftError, setAiDraftError] = useState(null);

  // Buffer Scheduling Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [scheduleConflict, setScheduleConflict] = useState(null);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState(null);

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

  const handleSaveToNotionRepository = async (passedUrn = null, customStatus = 'Published') => {
    const token = safeGetItem('notion_token') || safeGetItem('token_notion');
    const explicitDb = safeGetItem('notion_database_id') || '3c701136de4881de9d29ca4ea415e856';

    setNotionSaving(true);
    setNotionError(null);

    const postPayload = {
      title: title || 'Brother Singapore Official Post',
      content: content,
      category: effectiveOccasion?.category || 'AI & Employer Branding',
      status: customStatus,
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
          message: customStatus === 'Working Draft' ? 'Saved as Working Draft in Notion!' : 'Saved to Notion Enterprise Repository'
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

  // Generate 3 AI Drafts using Style Guide and Occasion/Facts
  const handleGenerate3Drafts = async () => {
    setGeneratingAiDrafts(true);
    setAiDraftError(null);
    try {
      let activeGuide = savedStyleGuides.find(g => g.id === selectedStyleGuideId) || savedStyleGuides[0];

      // If user extracted from a reference post
      if (referenceMode === 'reference' && referenceText.trim()) {
        const extracted = extractTemplateFromInput({
          type: 'text',
          content: referenceText.trim(),
          title: `Extracted: ${title || 'Reference Post'}`
        });
        activeGuide = {
          id: extracted.id,
          name: extracted.name,
          client: 'Brother Singapore',
          platform: 'LinkedIn',
          audience: 'Singapore professionals & SMEs',
          tone: extracted.tone,
          rules: {
            hookStyle: 'Extracted benchmark hook format',
            narrativeStructure: 'Extracted benchmark structural flow',
            ctaStyle: 'Consultative community prompt'
          }
        };
        saveStyleGuide(activeGuide);
        setSavedStyleGuides(getSavedStyleGuides());
      }

      const res = await fetch('/api/ai/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'drafts',
          occasionName: effectiveOccasion?.name || title,
          occasionDetails: effectiveOccasion?.details || effectiveOccasion?.subtitle || content,
          styleGuide: activeGuide,
          audience: activeGuide?.audience
        })
      });

      let generated = [];
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.drafts) && data.drafts.length > 0) {
          generated = data.drafts;
        }
      }

      // Fallback to cultural or B2B templates if endpoint returns empty
      if (!generated || generated.length === 0) {
        if (effectiveOccasion) {
          generated = generateFestiveDrafts({
            name: effectiveOccasion.name,
            culturalContext: effectiveOccasion.details,
            suggestedHashtags: effectiveOccasion.suggestedHashtags
          });
        } else {
          generated = generateAIDrafts({
            title: title || 'Workplace Innovation',
            snippet: content,
            sourceTitle: 'Brother Singapore Intelligence'
          });
        }
      }

      setAvailableDrafts(generated);
      if (generated[0]) {
        const firstText = generated[0].postContent || generated[0].post || '';
        setContent(firstText);
        setActiveDraft(generated[0]);
        setSelectedTemplateId(generated[0].id || 'draft-0');
        setCurrentRationale(generated[0].whyThisWorks || generated[0].angle || '');
      }

      // Automatically persist all 3 candidate drafts to Notion as "Generated Candidate"
      const token = safeGetItem('notion_token') || safeGetItem('token_notion');
      if (token && generated.length > 0) {
        const postsToSync = generated.map((g, idx) => ({
          title: `${title || 'Post'} (Candidate 0${idx + 1} - ${g.name || g.angle || 'Draft'})`,
          content: g.postContent || g.post,
          status: 'Generated Candidate',
          category: effectiveOccasion?.category || 'AI Generated Drafts',
          author: 'Allan Cheng',
          date: new Date().toISOString().split('T')[0]
        }));
        fetch('/api/notion/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: token,
            posts: postsToSync
          })
        }).catch(err => console.warn('Notion candidate sync warning:', err));
      }

      logActivity({
        event: 'Generated 3 AI Drafts',
        category: 'Content Generation',
        details: `Generated 3 drafts with style guide "${activeGuide?.name}" for "${title}"`,
        status: 'Success'
      });
    } catch (err) {
      setAiDraftError(err.message || 'Error generating drafts with AI');
    } finally {
      setGeneratingAiDrafts(false);
    }
  };

  // Schedule Post via Buffer API with 1-Post-per-Day Collision Check
  const handleBufferSchedule = async () => {
    if (!scheduledDateTime) {
      setScheduleConflict('Please select a scheduled date and time.');
      return;
    }

    setSchedulingLoading(true);
    setScheduleConflict(null);

    // Collision check against brother_calendar_posts (Max 1 post per day)
    let existingDates = [];
    try {
      const stored = JSON.parse(safeGetItem('brother_calendar_posts') || '[]');
      existingDates = stored.map(p => p.scheduledDate).filter(Boolean);
    } catch (e) {}

    const targetDay = scheduledDateTime.slice(0, 10);
    const hasConflict = existingDates.some(d => String(d).slice(0, 10) === targetDay);
    if (hasConflict) {
      setScheduleConflict(`⚠️ A post is already scheduled for ${targetDay}. To maintain engagement cadence, only 1 post per day can be scheduled. Please choose another date or use "1-Click Publish Now" to post immediately.`);
      setSchedulingLoading(false);
      return;
    }

    try {
      const bufferKey = safeGetItem('key_buffer');
      const bufferChannel = safeGetItem('buffer_channel_id');
      const result = await publishToLinkedInApi({
        commentary: content,
        scheduledDate: scheduledDateTime,
        bufferApiKey: bufferKey,
        bufferChannelId: bufferChannel,
        existingScheduledDates: existingDates
      });

      if (result.success) {
        // Record in Notion as Scheduled
        const token = safeGetItem('notion_token');
        if (token) {
          fetch('/api/notion/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: token,
              post: {
                title,
                content,
                status: 'Scheduled',
                date: scheduledDateTime,
                scheduledDate: scheduledDateTime,
                urn: result.urn
              }
            })
          }).catch(() => {});
        }

        // Add to calendar posts cache
        const newPost = {
          id: `post-${Date.now()}`,
          title,
          content,
          status: 'Scheduled',
          scheduledDate: scheduledDateTime,
          urn: result.urn
        };
        const currentCal = JSON.parse(safeGetItem('brother_calendar_posts') || '[]');
        safeSetItem('brother_calendar_posts', JSON.stringify([...currentCal, newPost]));

        setScheduleSuccessMsg(`🎉 Successfully scheduled for ${targetDay} via Buffer API!`);
        setTimeout(() => {
          setShowScheduleModal(false);
          setScheduleSuccessMsg(null);
        }, 1800);
      } else {
        setScheduleConflict(result.error || 'Failed to schedule via Buffer API.');
      }
    } catch (e) {
      setScheduleConflict(e.message);
    } finally {
      setSchedulingLoading(false);
    }
  };

  const handlePublishToLinkedIn = async () => {
    setPublishing(true);
    setPublishError(null);
    const token = safeGetItem('key_linkedin');
    const orgId = safeGetItem('linkedin_org_id') || '808877';

    try {
      const bufferKey = safeGetItem('key_buffer');
      const result = await publishToLinkedInApi({ commentary: content, orgId, token: token || undefined });

      if (result && result.success) {
        setPublishing(false);
        setPublishError(null);
        setPublishedData({
          urn: result.urn,
          status: result.status || 'Live on LinkedIn',
          provider: result.provider || 'direct',
          channelId: result.channelId,
          isLive: true,
          publishedAt: result.publishedAt || new Date().toLocaleTimeString(),
          notionStatus: 'Synced to Notion Repository',
          postUrl: 'https://www.linkedin.com/company/brother-international-singapore-pte-ltd/posts/'
        });
        logActivity({
          event: 'Published Post to LinkedIn',
          category: 'Publishing',
          details: `Published "${title}" via ${result.provider || 'LinkedIn REST API'} (URN: ${result.urn})`,
          status: 'Success'
        });
        handleSaveToNotionRepository(result.urn);
        return;
      } else {
        setPublishing(false);
        const errMsg = result?.error || (bufferKey ? 'Buffer API error occurred.' : 'LinkedIn API returned an error. Ensure Buffer API Key or OAuth 2.0 token is configured.');
        setPublishError({
          message: errMsg,
          needsToken: !token && !bufferKey
        });
        logActivity({
          event: 'LinkedIn Publish Attempt Failed',
          category: 'Publishing',
          details: `Failed publishing "${title}": ${errMsg}`,
          status: 'Error'
        });
      }
    } catch (err) {
      const bufferKey = safeGetItem('key_buffer');
      setPublishing(false);
      setPublishError({
        message: err.message || 'Network error connecting to publishing API.',
        needsToken: !token && !bufferKey
      });
      logActivity({
        event: 'LinkedIn Publish Error',
        category: 'Publishing',
        details: `Exception publishing "${title}": ${err.message}`,
        status: 'Error'
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
      logActivity({
        event: 'Simulated LinkedIn Broadcast',
        category: 'Publishing',
        details: `Simulated post broadcast for "${title}" in Sandbox mode`,
        status: 'Success'
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
              onClick={() => handleSaveToNotionRepository(null, 'Working Draft')}
              disabled={notionSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              title="Save current post in Notion as Working Draft"
            >
              <NotionIcon className={`w-3.5 h-3.5 ${notionSaving ? 'animate-spin' : ''}`} />
              <span>{notionSaving ? 'Saving Draft...' : 'Save Draft (Notion)'}</span>
            </button>
            <button
              onClick={() => {
                setShowScheduleModal(true);
                setScheduleConflict(null);
                setScheduleSuccessMsg(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-[#0f2ea2] dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all shadow-sm cursor-pointer"
              title="Schedule post via Buffer API"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Schedule (Buffer)</span>
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
              {publishing ? 'Connecting to LinkedIn...' : publishedData ? 'Published on LinkedIn!' : '1-Click Publish'}
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

      {/* Style Guide Extraction & 3-Draft AI Engine */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      } space-y-3.5`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0f2ea2] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Style Guide & 3-Draft AI Engine
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#0f2ea2] dark:text-blue-300 font-bold">
                  LinkedUs In Specification
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Extract style rules from high-performing reference posts or select saved style guides, then generate 3 targeted LinkedIn drafts.
              </p>
            </div>
          </div>

          {/* Mode Switcher: Saved Style Guide vs Reference Post */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl self-start md:self-auto border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setReferenceMode('saved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                referenceMode === 'saved'
                  ? 'bg-white dark:bg-slate-800 text-[#0f2ea2] dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Saved Style Guide ({savedStyleGuides.length})
            </button>
            <button
              type="button"
              onClick={() => setReferenceMode('reference')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                referenceMode === 'reference'
                  ? 'bg-white dark:bg-slate-800 text-[#0f2ea2] dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Reference Social Post
            </button>
          </div>
        </div>

        {/* Style Guide Controls */}
        {referenceMode === 'saved' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-8">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Choose Reusable Style Guide:
              </label>
              <select
                value={selectedStyleGuideId}
                onChange={(e) => setSelectedStyleGuideId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] cursor-pointer"
              >
                {savedStyleGuides.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} • Audience: {g.audience} ({g.tone})
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4 flex items-end">
              <button
                type="button"
                onClick={handleGenerate3Drafts}
                disabled={generatingAiDrafts}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generatingAiDrafts ? 'animate-spin' : ''}`} />
                <span>{generatingAiDrafts ? 'Generating with Gemini...' : 'Generate 3 Drafts with AI'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Paste Reference Social Post (Caption or Transcript):
              </label>
              <span className="text-[10px] text-slate-400">
                Extracts hook techniques, rhythm & value proposition without duplicating text
              </span>
            </div>
            <textarea
              rows={3}
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              placeholder="Paste a viral or high-performing LinkedIn post here to deconstruct and adopt its communication style..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#0f2ea2]"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleGenerate3Drafts}
                disabled={generatingAiDrafts || !referenceText.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generatingAiDrafts ? 'animate-spin' : ''}`} />
                <span>{generatingAiDrafts ? 'Extracting & Generating...' : 'Extract Style & Generate 3 Drafts'}</span>
              </button>
            </div>
          </div>
        )}

        {/* AI Draft Error */}
        {aiDraftError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiDraftError}</span>
          </div>
        )}

        {/* 3 Generated Candidate Drafts Cards */}
        {availableDrafts && availableDrafts.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Generated Candidate Drafts (3 Options) • Auto-saved to Notion Candidates</span>
              </span>
              <span className="text-slate-400 hidden sm:inline">Select a draft below to edit</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {availableDrafts.slice(0, 3).map((draft, idx) => {
                const draftText = draft.postContent || draft.post || '';
                const isSelected = activeDraft?.id === draft.id || content === draftText;
                return (
                  <div
                    key={draft.id || idx}
                    onClick={() => {
                      setContent(draftText);
                      setActiveDraft(draft);
                      setSelectedTemplateId(draft.id || `draft-${idx}`);
                      setCurrentRationale(draft.whyThisWorks || draft.angle || draft.description || '');
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0f2ea2] bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-[#0f2ea2]/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        Draft 0{idx + 1}: {draft.name || draft.angle || `Option ${idx + 1}`}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#0f2ea2] text-white shrink-0">
                          Editing
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 hover:text-slate-600">
                          Select
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {draft.whyThisWorks || draft.angle || draftText.slice(0, 80) + '...'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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

      {/* Buffer Scheduling Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0f2ea2] text-white flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Schedule via Buffer API
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Singapore Cadence Guard: 1 scheduled post per day limit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Publishing Date & Time (Singapore Time SGT)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => {
                    setScheduledDateTime(e.target.value);
                    setScheduleConflict(null);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Buffer queues and publishes this post to Brother Singapore LinkedIn page at the specified time.
                </p>
              </div>

              {/* Conflict Alert / Warning */}
              {scheduleConflict && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{scheduleConflict}</p>
                  </div>
                  <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                      Need multiple posts today?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowScheduleModal(false);
                        handlePublishToLinkedIn();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>1-Click Publish Now</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {scheduleSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold">{scheduleSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBufferSchedule}
                disabled={schedulingLoading || !scheduledDateTime}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {schedulingLoading ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <CalendarDays className="w-4 h-4" />
                )}
                <span>{schedulingLoading ? 'Scheduling via Buffer...' : 'Confirm Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
