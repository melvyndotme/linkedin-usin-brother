import React, { useState, useEffect, useMemo } from 'react';
import { 
  Edit3, Send, CheckCircle2, Copy, Check, Sparkles, AlertCircle, Database, 
  ExternalLink, BookOpen, Layers, Search, X, Filter, ArrowRight, ChevronDown,
  CalendarDays, Clock, Zap, ShieldCheck, Upload, Link2, RefreshCw,
  Compass, Lightbulb, Target, MessageSquare, Quote, Eye, Smartphone, Monitor,
  ThumbsUp, Share2, Trash2, Image as ImageIcon
} from 'lucide-react';
import NotionIcon from './icons/NotionIcon.jsx';
import ImageTemplateStudio from './ImageTemplateStudio.jsx';
import { publishToLinkedInApi } from '../lib/linkedInApi.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';
import { generateAIDrafts, generateFestiveDrafts } from '../lib/draftGenerator.js';
import { FIVE_CORE_FRAMEWORKS, extractTemplateFromInput } from '../lib/templateExtractor.js';
import { logActivity } from '../lib/auditLogger.js';
import { GEMINI_MODEL_REGISTRY, DEFAULT_TEXT_MODEL } from '../lib/geminiModels.js';

// Clear, short capability descriptions for frontier text models
const MODEL_CAPABILITY_DESCRIPTIONS = {
  'gemini-2.5-pro': 'Reasoning & Strategic Polish (Deepest analysis, nuanced tone)',
  'gemini-2.5-flash': 'Fast & Versatile (Balanced speed and high quality)',
  'gemini-2.5-flash-lite': 'Ultra-Fast & Lightweight (Rapid iterative drafting)',
  'gemini-1.5-pro': 'Long Context Specialist (Complex historical cross-reference)',
  'gemini-1.5-flash': 'High Throughput Standard (Fast generation)'
};

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

  // Promotional Photo Upload State for multimodal AI inspection
  const [uploadedPromoPhoto, setUploadedPromoPhoto] = useState(null);
  const [uploadedPromoFileName, setUploadedPromoFileName] = useState('');
  const [uploadedPromoFileSize, setUploadedPromoFileSize] = useState('');

  // LinkedIn Mockup Preview Modal State
  const [showLinkedInPreviewModal, setShowLinkedInPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' | 'desktop'
  const [previewExpandedSeeMore, setPreviewExpandedSeeMore] = useState(false);

  const [copied, setCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedData, setPublishedData] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [notionSaving, setNotionSaving] = useState(false);
  const [notionSavedData, setNotionSavedData] = useState(null);
  const [notionError, setNotionError] = useState(null);

  // Helper to retrieve all saved & core frameworks
  const getCombinedSavedFrameworks = () => {
    try {
      const stored = localStorage.getItem('custom_ingested_templates');
      const validCustom = [];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(t => {
            if (!t || !t.name) return;
            const norm = t.name.trim().toLowerCase();
            if (t.id?.startsWith('tmpl-eb-') || t.id?.startsWith('tmpl-bench-')) return;
            if (norm.includes('product launch announcement') || 
                norm.includes('live extracted linkedin') || 
                norm.includes('kaizen innovation & precision') ||
                norm.includes('workplace flexibility') ||
                norm.includes('quiet craft') ||
                norm.includes('humble craftsmanship')) {
              return;
            }
            if (Array.isArray(t.structureSteps) && t.structureSteps.length > 0) {
              validCustom.push(t);
            }
          });
        }
      }
      const combined = [...FIVE_CORE_FRAMEWORKS];
      for (const c of validCustom) {
        if (!combined.some(f => f.name?.trim().toLowerCase() === c.name?.trim().toLowerCase())) {
          combined.push(c);
        }
      }
      return combined;
    } catch (e) {
      return [...FIVE_CORE_FRAMEWORKS];
    }
  };

  const [savedFrameworks, setSavedFrameworks] = useState(getCombinedSavedFrameworks);

  // Per-draft framework selection: Draft 1, Draft 2, Draft 3
  const [draftFrameworks, setDraftFrameworks] = useState(() => {
    const fwList = getCombinedSavedFrameworks();
    return [
      fwList[0]?.id || FIVE_CORE_FRAMEWORKS[0].id,
      fwList[1]?.id || fwList[0]?.id || FIVE_CORE_FRAMEWORKS[1].id,
      fwList[2]?.id || fwList[0]?.id || FIVE_CORE_FRAMEWORKS[2].id
    ];
  });

  const [userConceptIdea, setUserConceptIdea] = useState('');
  const [generatingAiDrafts, setGeneratingAiDrafts] = useState(false);
  const [aiDraftError, setAiDraftError] = useState(null);

  // Curated 5 Frontier Text Models ONLY
  const [availableTextModels, setAvailableTextModels] = useState(GEMINI_MODEL_REGISTRY.text);
  const [selectedDraftModel, setSelectedDraftModel] = useState(() => {
    return safeGetItem('model_gemini') || DEFAULT_TEXT_MODEL;
  });

  useEffect(() => {
    fetch('/api/gemini/models?context=text')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.models) && data.models.length > 0) {
          // Strictly keep only text models, guard against image models
          const textOnly = data.models.filter(m => !m.id?.includes('image') && !m.id?.includes('banana'));
          if (textOnly.length > 0) {
            setAvailableTextModels(textOnly);
          }
        }
      })
      .catch(() => {
        // Fallback already pre-loaded from GEMINI_MODEL_REGISTRY.text
      });
  }, []);

  // Buffer Scheduling Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [scheduleConflict, setScheduleConflict] = useState(null);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState(null);

  // Sync state when props update
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
        if (Array.isArray(parsed)) {
          return parsed.filter(t => {
            if (!t || !t.name) return false;
            const norm = t.name.trim().toLowerCase();
            if (t.id?.startsWith('tmpl-eb-') || t.id?.startsWith('tmpl-bench-')) return false;
            if (norm.includes('product launch announcement') || 
                norm.includes('live extracted linkedin') || 
                norm.includes('kaizen innovation & precision') ||
                norm.includes('workplace flexibility') ||
                norm.includes('quiet craft') ||
                norm.includes('humble craftsmanship')) {
              return false;
            }
            return Array.isArray(t.structureSteps) && t.structureSteps.length > 0;
          });
        }
      }
    } catch (e) {
      console.warn('Could not read custom templates:', e);
    }
    return [];
  };

  const [modalSelectedFrameworkId, setModalSelectedFrameworkId] = useState(() => FIVE_CORE_FRAMEWORKS[0].id);

  // Derive contextual drafts for quick switching
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
    return generateAIDrafts({
      title: title || 'Workplace Innovation Breakthrough',
      snippet: content || 'Recent breakthroughs in workplace technology are transforming daily operations.',
      sourceTitle: 'Brother Singapore Intelligence'
    });
  }, [availableDrafts, occasion, title, content]);

  useEffect(() => {
    if (!selectedTemplateId && FIVE_CORE_FRAMEWORKS.length > 0) {
      const first = FIVE_CORE_FRAMEWORKS[0];
      setSelectedTemplateId(first.id);
      if (!currentRationale) {
        setCurrentRationale(first.description || first.whyThisWorks);
      }
    }
  }, [selectedTemplateId, currentRationale]);

  // Full comprehensive template catalog for the library modal
  const allLibraryTemplates = useMemo(() => {
    const custom = getCustomIngestedTemplates();
    const combined = [];

    // 1. Core Frameworks
    FIVE_CORE_FRAMEWORKS.forEach((f) => {
      combined.push({
        ...f,
        isFramework: true,
        post: f.examplePost || f.placeholderTemplate,
        postContent: f.examplePost || f.placeholderTemplate
      });
    });

    // 2. Custom Deconstructed Frameworks
    custom.forEach((c) => {
      if (!combined.some(item => item.name?.trim().toLowerCase() === c.name?.trim().toLowerCase())) {
        combined.push({
          ...c,
          isFramework: true,
          post: c.examplePost || c.placeholderTemplate,
          postContent: c.examplePost || c.placeholderTemplate
        });
      }
    });

    // 3. Contextual drafts
    contextualDrafts.forEach((d, idx) => {
      if (!combined.some(item => item.name?.trim().toLowerCase() === (d.name || d.templateName || '').trim().toLowerCase())) {
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
        tmpl.formula?.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        tmpl.whyThisWorks?.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        tmpl.description?.toLowerCase().includes(templateSearchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (templateCategoryFilter === 'all') return true;
      if (templateCategoryFilter === 'thought-leadership') {
        return tmpl.category?.toLowerCase().includes('thought leadership') || tmpl.category?.toLowerCase().includes('strategy') || tmpl.category?.toLowerCase().includes('executive');
      }
      if (templateCategoryFilter === 'employer-branding') {
        return tmpl.category?.toLowerCase().includes('employer') || tmpl.category?.toLowerCase().includes('culture') || tmpl.category?.toLowerCase().includes('talent') || tmpl.category?.toLowerCase().includes('harmony') || tmpl.category?.toLowerCase().includes('wa');
      }
      if (templateCategoryFilter === 'b2b-solutions') {
        return tmpl.category?.toLowerCase().includes('b2b') || tmpl.category?.toLowerCase().includes('engineering') || tmpl.category?.toLowerCase().includes('operations') || tmpl.category?.toLowerCase().includes('kaizen') || tmpl.category?.toLowerCase().includes('monozukuri');
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

  // Persist draft to localStorage
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

  // Upload promotional photo handler
  const handlePromoPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAiDraftError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedPromoPhoto(reader.result);
      setUploadedPromoFileName(file.name);
      setUploadedPromoFileSize((file.size / 1024).toFixed(1) + ' KB');
      setAiDraftError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePromoPhoto = () => {
    setUploadedPromoPhoto(null);
    setUploadedPromoFileName('');
    setUploadedPromoFileSize('');
  };

  // Save to Notion Repository (guaranteed Notion record across all actions)
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
          message: customStatus === 'Working Draft' ? 'Saved as Working Draft in Notion!' : `Saved as ${customStatus} to Notion!`
        });
        logActivity({
          event: 'Saved Post to Notion Repository',
          category: 'Review Gate',
          details: `Saved "${title || 'Post'}" as ${customStatus} to Notion database`,
          status: 'Success'
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

  // Generate 3 AI Drafts using per-draft selected frameworks and optional multimodal promotional image
  const handleGenerate3Drafts = async () => {
    const canGenerate = Boolean(userConceptIdea?.trim() || title?.trim() || uploadedPromoPhoto);
    if (!canGenerate) {
      setAiDraftError('Please enter ideas as text or upload a promotional image to generate drafts.');
      return;
    }

    setGeneratingAiDrafts(true);
    setAiDraftError(null);
    try {
      const selectedFwList = draftFrameworks.map(id => {
        return savedFrameworks.find(f => f.id === id) || savedFrameworks[0] || FIVE_CORE_FRAMEWORKS[0];
      });

      const effectiveTitle = title?.trim() || effectiveOccasion?.name || 'Brother Singapore Strategic Innovation';
      const effectiveDetails = userConceptIdea?.trim() || effectiveOccasion?.details || effectiveOccasion?.subtitle || content;

      const clientKey = safeGetItem('key_gemini') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (clientKey) headers['x-gemini-key'] = clientKey;

      const res = await fetch('/api/ai/media', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'drafts',
          modelName: selectedDraftModel,
          occasionName: effectiveTitle,
          occasionDetails: effectiveDetails,
          frameworks: selectedFwList,
          inputImage: uploadedPromoPhoto || undefined, // Multimodal vision support!
          apiKey: clientKey || undefined
        })
      });

      let generated = [];
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.drafts) && data.drafts.length > 0) {
          generated = data.drafts.map((d, i) => ({
            ...d,
            frameworkId: selectedFwList[i]?.id,
            frameworkName: selectedFwList[i]?.name,
            formula: selectedFwList[i]?.formula
          }));
        }
      }

      // Fallback if endpoint returns empty
      if (!generated || generated.length === 0) {
        if (effectiveOccasion && effectiveOccasion.eventType !== 'corporate') {
          generated = generateFestiveDrafts({
            name: effectiveOccasion.name,
            culturalContext: effectiveOccasion.details,
            suggestedHashtags: effectiveOccasion.suggestedHashtags
          });
        } else {
          generated = generateAIDrafts({
            title: effectiveTitle,
            snippet: effectiveDetails,
            sourceTitle: 'Brother Singapore Intelligence'
          });
        }
      }

      setAvailableDrafts(generated);
      if (generated[0]) {
        const firstText = generated[0].postContent || generated[0].post || '';
        setContent(firstText);
        setActiveDraft(generated[0]);
        setSelectedTemplateId(generated[0].frameworkId || generated[0].id || 'draft-0');
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
        details: `Generated 3 drafts with frameworks: ${selectedFwList.map(f => f?.name).filter(Boolean).join(', ')} for "${title}"`,
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
      setScheduleConflict(`⚠️ A post is already scheduled for ${targetDay}. To maintain engagement cadence, only 1 post per day can be scheduled. Please choose another date or publish immediately.`);
      setSchedulingLoading(false);
      return;
    }

    try {
      const bufferKey = safeGetItem('key_buffer');
      const bufferChannel = safeGetItem('buffer_channel_id');
      const carouselPdfUrl = safeGetItem('brother_latest_carousel_pdf_url') || '';
      const activeVisualUrl = carouselPdfUrl || safeGetItem('brother_latest_visual_url') || '';
      const result = await publishToLinkedInApi({
        commentary: content,
        scheduledDate: scheduledDateTime,
        bufferApiKey: bufferKey,
        bufferChannelId: bufferChannel,
        imageUrl: activeVisualUrl || undefined,
        existingScheduledDates: existingDates
      });

      if (result.success) {
        // Record in Notion as Scheduled (always saved to Notion)
        handleSaveToNotionRepository(result.urn, 'Scheduled');

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

        setScheduleSuccessMsg(`🎉 Successfully scheduled for ${targetDay} via Buffer API & saved to Notion!`);
        logActivity({
          event: 'Scheduled Post to Calendar',
          category: 'Publishing',
          details: `Scheduled "${title}" for ${targetDay} (${scheduledDateTime}) via Buffer API`,
          status: 'Success'
        });
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
      const carouselPdfUrl = safeGetItem('brother_latest_carousel_pdf_url') || '';
      const activeVisualUrl = carouselPdfUrl || safeGetItem('brother_latest_visual_url') || '';
      const result = await publishToLinkedInApi({ 
        commentary: content, 
        orgId, 
        token: token || undefined,
        imageUrl: activeVisualUrl || undefined 
      });

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
        // Always save to Notion as Published!
        handleSaveToNotionRepository(result.urn, 'Published');
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
      handleSaveToNotionRepository(mockUrn, 'Published');
    }, 800);
  };

  // LinkedIn mobile fold character threshold (~140 chars)
  const foldCharLimit = 140;
  const isOverFold = content.length > foldCharLimit;
  const preFoldText = content.slice(0, foldCharLimit);
  const postFoldText = content.slice(foldCharLimit);

  // Active visual image for the LinkedIn mockup
  const activeVisualPreviewUrl = safeGetItem('brother_latest_visual_url') || uploadedPromoPhoto || '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner & Fast Actions */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider mb-1 sm:mb-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Content Editor
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Campaign Drafting & Content Editor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generate strategic drafts using proven frameworks, design accompanying carousel visuals, and preview before publishing.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Preview on LinkedIn Button */}
            <button
              type="button"
              onClick={() => {
                setShowLinkedInPreviewModal(true);
                setPreviewExpandedSeeMore(false);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#0f2ea2] bg-blue-50 dark:bg-blue-950/60 text-[#0f2ea2] dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-all shadow-sm cursor-pointer"
              title="Preview how this post looks on LinkedIn (Mobile & Desktop)"
            >
              <Eye className="w-4 h-4" />
              <span>Preview on LinkedIn</span>
            </button>

            {/* Save as Draft (Notion) */}
            <button
              onClick={() => handleSaveToNotionRepository(null, 'Working Draft')}
              disabled={notionSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              title="Save current post in Notion as Working Draft"
            >
              <NotionIcon className={`w-3.5 h-3.5 ${notionSaving ? 'animate-spin' : ''}`} />
              <span>{notionSaving ? 'Saving...' : 'Save Draft (Notion)'}</span>
            </button>

            {/* Schedule (Buffer) */}
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
              <span>Schedule</span>
            </button>

            {/* 1-Click Publish */}
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
              {publishing ? 'Publishing...' : publishedData ? 'Published!' : 'Post Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Publish Error Notice Banner */}
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
              <span className="font-bold">{notionSavedData.message}</span>
              <span className="text-[11px] opacity-80 ml-2">Synced to Notion database for tracking.</span>
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

      {/* ========================================================================= */}
      {/* CARD 1: Full-Width Unified Card (1) Campaign topic, (2) Select Framework, */}
      {/*         (3) AI Models + Generate, (4) Draft Post Editor                   */}
      {/* ========================================================================= */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      } space-y-6`}>

        {/* ------------------------------------------------------------- */}
        {/* (1) [in red] Campaign topic [in black]                         */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-red-600 dark:text-red-500 font-mono">(1)</span>
              <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Campaign topic
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Enter ideas as text OR upload a promotional photo (at least one input required)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            {/* Idea Text Input */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <textarea
                rows={3}
                value={userConceptIdea || title}
                onChange={(e) => {
                  setUserConceptIdea(e.target.value);
                  setTitle(e.target.value);
                }}
                placeholder="e.g. Brother MFC-L8390CDW compact color laser printer launch for Singapore SMEs. Highlight Monozukuri craftsmanship, high-yield toners, and cost-effective productivity..."
                className="w-full h-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] leading-relaxed custom-scrollbar"
              />
            </div>

            {/* Promotional Photo Upload Dropzone */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              {uploadedPromoPhoto ? (
                <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between gap-3 h-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={uploadedPromoPhoto}
                      alt="Promotional Attachment"
                      className="w-14 h-14 object-cover rounded-lg border border-blue-200 dark:border-blue-800 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white font-mono">
                          Multimodal Active
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate mt-1" title={uploadedPromoFileName}>
                        {uploadedPromoFileName || 'promo-image.png'}
                      </p>
                      <p className="text-[10px] text-slate-400">{uploadedPromoFileSize}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromoPhoto}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer shrink-0"
                    title="Remove promotional photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-[#0f2ea2] dark:hover:border-blue-400 rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/30 transition-all h-full group">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#0f2ea2] transition-colors mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload Promotional Photo
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Gemini AI will inspect product specs & visual cues
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePromoPhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* (2) [in red] Select Framework [these has up to 3 drafts]       */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-red-600 dark:text-red-500 font-mono">(2)</span>
              <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Select Framework
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Customize the framework for each of the 3 drafts below
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[0, 1, 2].map((idx) => {
              const draft = availableDrafts[idx];
              const draftText = draft ? (draft.postContent || draft.post || '') : '';
              const isSelected = activeDraft && (activeDraft.id === draft?.id || (draftText && content === draftText));
              const currentFrameworkId = draftFrameworks[idx];
              const selectedFw = savedFrameworks.find(f => f.id === currentFrameworkId) || savedFrameworks[0];

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-[#0f2ea2] bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-[#0f2ea2]/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Draft 0{idx + 1}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0f2ea2] text-white">
                          Currently In Editor
                        </span>
                      )}
                    </div>

                    {/* Framework Dropdown for this draft */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Framework:
                      </label>
                      <select
                        value={currentFrameworkId}
                        onChange={(e) => {
                          const newId = e.target.value;
                          setDraftFrameworks((prev) => {
                            const updated = [...prev];
                            updated[idx] = newId;
                            return updated;
                          });
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] cursor-pointer"
                      >
                        {savedFrameworks.map((fw) => (
                          <option key={fw.id} value={fw.id}>
                            {fw.name} ({fw.formula || 'Framework'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Draft Snippet */}
                    <div className="pt-1">
                      {draft ? (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-sans">
                          {draftText || draft.whyThisWorks || 'Generated candidate draft.'}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic py-2">
                          Ready to generate with {selectedFw?.name || 'selected framework'}.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pick Draft Button */}
                  <div className="pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                      {draft?.angle || selectedFw?.formula || 'Strategic sequence'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (draft) {
                          setContent(draftText);
                          setActiveDraft(draft);
                          setSelectedTemplateId(draft.frameworkId || draft.id || `draft-${idx}`);
                          setCurrentRationale(draft.whyThisWorks || draft.angle || selectedFw?.whyThisWorks || '');
                        } else {
                          const exampleText = selectedFw?.examplePost || selectedFw?.placeholderTemplate || '';
                          if (exampleText) setContent(exampleText);
                          setSelectedTemplateId(selectedFw?.id || `draft-${idx}`);
                          setCurrentRationale(selectedFw?.whyThisWorks || selectedFw?.description || '');
                        }
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0f2ea2] text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? 'Currently Selected' : 'Select to Edit'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* (3) [in red] AI Models [drop down with short descriptions]     */}
        {/*     + Generate Button next to it                                */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-red-600 dark:text-red-500 font-mono">(3)</span>
              <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                AI Models
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Select frontier text model with key capability description
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <select
                value={selectedDraftModel}
                onChange={(e) => {
                  setSelectedDraftModel(e.target.value);
                  safeSetItem('model_gemini', e.target.value);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0f2ea2] dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] cursor-pointer"
              >
                {availableTextModels.map((m) => {
                  const desc = MODEL_CAPABILITY_DESCRIPTIONS[m.id] || m.badge || 'Frontier text generation';
                  return (
                    <option key={m.id} value={m.id}>
                      {m.name || m.id} — {desc}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="button"
              onClick={handleGenerate3Drafts}
              disabled={generatingAiDrafts || (!userConceptIdea.trim() && !title.trim() && !uploadedPromoPhoto)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer shrink-0 h-[42px]"
            >
              <Sparkles className={`w-4 h-4 ${generatingAiDrafts ? 'animate-spin' : ''}`} />
              <span>{generatingAiDrafts ? 'Generating 3 Drafts...' : 'Generate 3 Drafts'}</span>
            </button>
          </div>

          {aiDraftError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiDraftError}</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* (4) [in red] Draft Post [in black]                             */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-red-600 dark:text-red-500 font-mono">(4)</span>
              <h3 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Draft Post
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0f2ea2] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs font-bold transition-all cursor-pointer border border-blue-200 dark:border-blue-800/60"
                title="Browse All Content Frameworks"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Browse Frameworks ({allLibraryTemplates.length})</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold text-xs cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Strategic Rationale Banner (if available from active draft) */}
          {currentRationale && (
            <div className="bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-[#0f2ea2] dark:text-blue-300">Strategic Angle: </strong>
                  {currentRationale}
                </p>
              </div>
            </div>
          )}

          {/* Post Copy (Markdown & Formatting) Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Editorial Post Copy
              </label>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-slate-400">{content.length} characters</span>
                <span className="text-[#0f2ea2] dark:text-blue-400 font-bold">• {content.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>

            <textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write or refine your LinkedIn post copy here..."
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

      {/* ========================================================================= */}
      {/* CARD 2: Full-Width Visual Studio (ImageTemplateStudio)                    */}
      {/* ========================================================================= */}
      <div className={`p-4 sm:p-6 rounded-2xl border ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <ImageTemplateStudio
          occasion={effectiveOccasion}
          activeDraft={effectiveDraft}
          isDark={isDark}
        />
      </div>

      {/* ========================================================================= */}
      {/* LinkedIn Mockup Preview Modal with Device Switch & Notion Actions          */}
      {/* ========================================================================= */}
      {showLinkedInPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0f2ea2] text-white flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    LinkedIn Post Preview
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Authentic feed rendering with fold line & visual creative
                  </p>
                </div>
              </div>

              {/* Mobile vs Desktop Toggle & Close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-slate-700 text-[#0f2ea2] dark:text-blue-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-slate-700 text-[#0f2ea2] dark:text-blue-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLinkedInPreviewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* LinkedIn Card Body */}
            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-slate-100/70 dark:bg-slate-950/60 flex justify-center">
              <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all ${
                previewDevice === 'mobile' ? 'w-full max-w-[390px]' : 'w-full max-w-[560px]'
              }`}>
                {/* Profile Header */}
                <div className="p-3.5 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#0f2ea2] flex items-center justify-center text-white font-black text-sm shrink-0 border border-slate-200 dark:border-slate-700">
                      B
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white hover:underline cursor-pointer">
                          Brother International Singapore Pte Ltd
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        At your side • 24,500 followers
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <span>Just now</span>
                        <span>•</span>
                        <span>🌐</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 text-sm font-bold">•••</button>
                </div>

                {/* Post Commentary Text */}
                <div className="px-3.5 pb-3 text-xs text-slate-800 dark:text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                  {(() => {
                    if (previewExpandedSeeMore || !isOverFold) {
                      return (
                        <>
                          {content}
                          {isOverFold && (
                            <button
                              type="button"
                              onClick={() => setPreviewExpandedSeeMore(false)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold ml-1 cursor-pointer"
                            >
                              see less
                            </button>
                          )}
                        </>
                      );
                    }
                    return (
                      <>
                        {preFoldText}
                        <button
                          type="button"
                          onClick={() => setPreviewExpandedSeeMore(true)}
                          className="text-[#0f2ea2] dark:text-blue-400 font-bold hover:underline ml-1 cursor-pointer"
                        >
                          ...see more
                        </button>
                      </>
                    );
                  })()}
                </div>

                {/* Post Visual Creative */}
                {activeVisualPreviewUrl ? (
                  <div className="border-t border-b border-slate-100 dark:border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={activeVisualPreviewUrl}
                      alt="LinkedIn Visual Creative"
                      className="w-full object-cover max-h-[380px]"
                    />
                  </div>
                ) : (
                  <div className="border-t border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-8 text-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Visual Creative Attached</p>
                    <p className="text-[10px] opacity-75 mt-0.5">Carousel / Banner generated in Visual Studio below</p>
                  </div>
                )}

                {/* LinkedIn Social Counters */}
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px]">👍</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px]">👏</span>
                    <span className="ml-1 font-semibold">42</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>8 comments</span>
                    <span>•</span>
                    <span>3 reposts</span>
                  </div>
                </div>

                {/* LinkedIn Interaction Buttons */}
                <div className="px-2 py-1.5 grid grid-cols-4 gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Repost</span>
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Action Footer: Save as Draft, Schedule, or Post Now (All save to Notion!) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                <span>All actions automatically archive record to Notion Repository.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                {/* 1. Save as Draft */}
                <button
                  type="button"
                  onClick={() => {
                    handleSaveToNotionRepository(null, 'Working Draft');
                  }}
                  disabled={notionSaving}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <NotionIcon className={`w-3.5 h-3.5 inline mr-1.5 ${notionSaving ? 'animate-spin' : ''}`} />
                  <span>Save as Draft</span>
                </button>

                {/* 2. Schedule */}
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleModal(true);
                  }}
                  className="px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-[#0f2ea2] dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900 transition-all shadow-xs cursor-pointer"
                >
                  <CalendarDays className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>Schedule</span>
                </button>

                {/* 3. Post Now */}
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkedInPreviewModal(false);
                    handlePublishToLinkedIn();
                  }}
                  disabled={publishing}
                  className="px-5 py-2 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>Post Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Template Library Modal                                                    */}
      {/* ========================================================================= */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0f2ea2] text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Choose Content Frameworks
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select from Brother Singapore proven narrative frameworks & strategic cognitive sequences ({filteredTemplates.length} available)
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

            {(() => {
              const activeTmpl = filteredTemplates.find(t => t.id === modalSelectedFrameworkId) || filteredTemplates[0] || FIVE_CORE_FRAMEWORKS[0];
              const isCurrentlyActive = selectedTemplateId === activeTmpl?.id || (activeDraft?.name === activeTmpl?.name);

              return (
                <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                  <div className="md:col-span-5 p-3.5 overflow-y-auto space-y-2.5 max-h-[60vh] custom-scrollbar bg-slate-50/50 dark:bg-slate-950/30">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                      Strategic Content Frameworks ({filteredTemplates.length})
                    </div>
                    {filteredTemplates.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        <BookOpen className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                        <p className="text-xs font-semibold">No frameworks match your filter.</p>
                      </div>
                    ) : (
                      filteredTemplates.map((tmpl) => {
                        const isSelectedInModal = activeTmpl?.id === tmpl.id;
                        const isCurrentlyApplied = selectedTemplateId === tmpl.id || (activeDraft?.name === tmpl.name);
                        const formulaBadge = tmpl.formula || (tmpl.id?.includes('possibility') ? 'H-C-V-P-P-A' : 'FRAMEWORK');

                        return (
                          <div
                            key={tmpl.id}
                            onClick={() => setModalSelectedFrameworkId(tmpl.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelectedInModal
                                ? 'bg-blue-50/90 border-[#0f2ea2] dark:bg-blue-950/60 dark:border-blue-400 shadow-sm ring-1 ring-[#0f2ea2]/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0f2ea2] text-white">
                                {formulaBadge}
                              </span>
                              <div className="flex items-center gap-1">
                                {isCurrentlyApplied && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    In Use
                                  </span>
                                )}
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[110px]">
                                  {tmpl.category}
                                </span>
                              </div>
                            </div>
                            <h4 className={`text-xs font-bold leading-snug ${
                              isSelectedInModal ? 'text-[#0f2ea2] dark:text-blue-300' : 'text-slate-900 dark:text-white'
                            }`}>
                              {tmpl.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                              {tmpl.description || tmpl.whyThisWorks || tmpl.philosophy}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="md:col-span-7 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[60vh] custom-scrollbar bg-white dark:bg-slate-900">
                    {activeTmpl && (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#0f2ea2] text-white">
                                {activeTmpl.formula || 'H-C-V-P-P-A Formula'}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                {activeTmpl.category}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
                              {activeTmpl.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <strong>Tone:</strong> {activeTmpl.tone}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectTemplate(activeTmpl, 0)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                              isCurrentlyActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#0f2ea2] hover:bg-[#0c2482] text-white'
                            }`}
                          >
                            {isCurrentlyActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Currently Active</span>
                              </>
                            ) : (
                              <>
                                <span>Apply to Studio</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                            <span>1. Narrative Architecture & Cognitive Sequence</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(activeTmpl.structureSteps || [
                              { step: "HOOK", label: "Attention Hook", purpose: "Earn attention with curiosity" },
                              { step: "CONTEXT", label: "Communal Context", purpose: "Why this matters in daily work" },
                              { step: "VALUE", label: "Human Value", purpose: "Convert specs into tangible possibility" },
                              { step: "PROOF", label: "Credible Proof", purpose: "Model, promo details & facts" },
                              { step: "POSSIBILITY", label: "Future Projection", purpose: "Help customer picture the experience" },
                              { step: "ACTION", label: "Single CTA", purpose: "Clear invitation to take next step" }
                            ]).map((st, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-[11px]"
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400 font-bold mb-0.5">
                                  <span>Step 0{sIdx + 1}: {st.step}</span>
                                  <span className="text-slate-400 font-normal">{st.label}</span>
                                </div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug text-[11px]">
                                  {st.purpose}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>2. Why It Differs & Philosophy</span>
                          </h4>
                          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-950 dark:text-amber-200 space-y-1.5 leading-relaxed">
                            <p className="font-medium">
                              {activeTmpl.whyItDiffers || activeTmpl.whyThisWorks || "Replaces dry specification dumps and product model numbers with emotional resonance, human outcomes, and Brother's 'At your side' positioning."}
                            </p>
                            {activeTmpl.philosophy && (
                              <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-800/40 flex items-start gap-1.5 text-[10px] text-amber-900 dark:text-amber-300">
                                <Quote className="w-3 h-3 shrink-0 mt-0.5 text-amber-600" />
                                <span><strong>Philosophy: </strong>{activeTmpl.philosophy}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-emerald-500" />
                            <span>3. When To Use It</span>
                          </h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                            {activeTmpl.whenToUse || "Product launches, customer value updates, promotional bundles, and milestone showcases across Singapore SMEs and professional audiences."}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                              <span>4. Applied Brother Singapore Post Example</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                const postText = activeTmpl.examplePost || activeTmpl.placeholderTemplate || activeTmpl.post || '';
                                navigator.clipboard.writeText(postText);
                              }}
                              className="text-[10px] font-semibold text-[#0f2ea2] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Example</span>
                            </button>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                            {activeTmpl.examplePost || activeTmpl.placeholderTemplate || activeTmpl.post || "Post example available once selected."}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40">
              <span>Selecting a framework applies its proven narrative architecture and example copy into the editor.</span>
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

      {/* ========================================================================= */}
      {/* Buffer Scheduling Modal with 1-Post-per-Day Collision Check               */}
      {/* ========================================================================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
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

              {scheduleConflict && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{scheduleConflict}</p>
                  </div>
                  <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                      Need to publish right now instead?
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
                      <span>Post Now</span>
                    </button>
                  </div>
                </div>
              )}

              {scheduleSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-bold">{scheduleSuccessMsg}</span>
                </div>
              )}
            </div>

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
                <span>{schedulingLoading ? 'Scheduling...' : 'Confirm Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
