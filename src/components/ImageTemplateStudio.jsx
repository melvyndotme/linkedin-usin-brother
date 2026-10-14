import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Layers, 
  Upload, 
  Check, 
  RefreshCw, 
  Sliders, 
  Palette, 
  Maximize2,
  FolderDown,
  Wand2,
  Copy,
  ExternalLink,
  Tag,
  Edit3,
  RotateCcw,
  X,
  AlertCircle,
  Coins,
  Info,
  Cloud,
  Database,
  FileText,
  Building2,
  Bookmark,
  ChevronDown,
  Search,
  Globe,
  Filter
} from 'lucide-react';
import { 
  OFFICIAL_BROTHER_ASSETS,
  CURATED_EVENT_PHOTOS, 
  getPhotoCategoryForOccasion, 
  generateCarouselSlideSeries, 
  renderSlideToCanvas,
  getEffectiveFooterText
} from '../lib/imageTemplateEngine.js';
import { generateCarouselPdf } from '../lib/pdfCarouselExport.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';
import { logActivity } from '../lib/auditLogger.js';
import { GEMINI_MODEL_REGISTRY, DEFAULT_IMAGE_MODEL } from '../lib/geminiModels.js';

export const GEMINI_STYLE_PROMPT_GUIDES = [
  {
    id: 'commercial-product',
    name: 'Product Mockups & Commercial Photography',
    description: 'Clean, professional product shots for ecommerce, advertising, or branding.',
    badge: 'Studio Lighting',
    getSamplePrompt: (name) => `A high-resolution, studio-lit commercial product photograph of a modern Brother Singapore office printer in matte black and titanium finish, presented on a polished concrete surface. The lighting is a three-point softbox setup designed to create soft, diffused highlights and eliminate harsh shadows. The camera angle is a slightly elevated 45-degree shot to showcase its clean lines. Ultra-realistic, with sharp focus. Clean composition, text-free.`
  },
  {
    id: 'cultural-festive',
    name: 'Authentic Cultural & Festive Celebration',
    description: 'Warm, authentic community celebration photography for Singapore festivals.',
    badge: 'Festive Editorial',
    getSamplePrompt: (name) => `Authentic, warm corporate editorial photograph celebrating ${name || 'Deepavali festive occasion'} in a contemporary Singapore workplace setting. Warm golden ambient evening illumination, traditional festive decorative accents, colleagues gathered in joyful conversation. Cinematic bokeh, natural realistic lighting, text-free.`
  },
  {
    id: 'modern-kaizen',
    name: 'Modern Office & Kaizen Craftsmanship',
    description: 'Minimalist Tokyo/Singapore corporate workspace with craft precision.',
    badge: 'Monozukuri Aesthetic',
    getSamplePrompt: (name) => `Minimalist modern Singapore executive office with Japanese architectural symmetry and natural daylight. Clean lines, warm cedarwood desk, subtle brushed steel accents, calm productivity atmosphere. Photorealistic corporate architecture, 8k resolution, text-free.`
  },
  {
    id: 'sustainable-green',
    name: 'Sustainability & Eco-Conscious Innovation',
    description: 'Biophilic Singapore architecture and environmental commitment.',
    badge: 'Brother Earth',
    getSamplePrompt: (name) => `Contemporary sustainability corporate photography in Singapore. Biophilic green atrium with lush indoor vertical foliage, soft morning sunlight streaming through glass louvers, clean eco-conscious recycling hub. Crisp focus, vibrant natural greens, text-free.`
  },
  {
    id: 'thought-leadership',
    name: 'Executive Tech & Thought Leadership',
    description: 'High-tech corporate editorial for enterprise innovation and automation.',
    badge: 'Executive Editorial',
    getSamplePrompt: (name) => `High-end business editorial photograph of an enterprise innovation hub. Sleek glass partitions, sophisticated blue and graphite ambient tones, executives reviewing digital documents on sleek tablets. Ultra-realistic corporate photography, text-free composition.`
  }
];

export default function ImageTemplateStudio({ 
  occasion, 
  activeDraft, 
  isDark = false 
}) {
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' (Square Carousel) or '1.91:1' (Landscape Banner)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeAssetTab, setActiveAssetTab] = useState('notion'); // 'notion' (Digital Asset Library) | 'official' | 'festive'
  const [visualSourceMode, setVisualSourceMode] = useState('library'); // 'library' | 'ai'
  const [slidePhotos, setSlidePhotos] = useState({}); // Per-slide background image mapping: { [slideIndex]: url }
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Gemini Style Presets & Prompt State
  const [selectedStyleGuideId, setSelectedStyleGuideId] = useState(() => {
    return occasion?.eventType === 'cultural' || occasion?.theme === 'amber' ? 'cultural-festive' : 'commercial-product';
  });
  const [imagePrompt, setImagePrompt] = useState(() => {
    const guide = GEMINI_STYLE_PROMPT_GUIDES.find(g => g.id === (occasion?.eventType === 'cultural' ? 'cultural-festive' : 'commercial-product')) || GEMINI_STYLE_PROMPT_GUIDES[0];
    return guide.getSamplePrompt(occasion?.name);
  });
  const [promptLanguage, setPromptLanguage] = useState('English');

  // AI model selector and token advisory alert
  const [availableImageModels, setAvailableImageModels] = useState(GEMINI_MODEL_REGISTRY.image);
  const [selectedAiModel, setSelectedAiModel] = useState(() => {
    const saved = safeGetItem('model_gemini_image');
    return saved || DEFAULT_IMAGE_MODEL;
  });
  const [cloudSaving, setCloudSaving] = useState(false);
  const [cloudSuccess, setCloudSuccess] = useState(null);
  const [cloudError, setCloudError] = useState(null);
  const [serverGeminiConfigured, setServerGeminiConfigured] = useState(false);

  // Notion Regional Digital Asset Library State
  const [notionAssets, setNotionAssets] = useState([]);
  const [loadingNotionAssets, setLoadingNotionAssets] = useState(false);
  const [isLiveNotionStream, setIsLiveNotionStream] = useState(false);
  const [notionCountryFilter, setNotionCountryFilter] = useState('all');
  const [notionCategoryFilter, setNotionCategoryFilter] = useState('all');
  const [notionSearchQuery, setNotionSearchQuery] = useState('');

  // Fetch live images from Notion Digital Asset Library database (3f101136de4881d69ba7ca159483a544)
  const loadNotionAssets = async (forceRefresh = false) => {
    setLoadingNotionAssets(true);
    try {
      const token = safeGetItem('notion_token') || safeGetItem('token_notion') || '';
      const url = forceRefresh ? '/api/notion/assets?refresh=true' : '/api/notion/assets';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token || undefined,
          databaseId: '3f101136de4881d69ba7ca159483a544'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.assets) && data.assets.length > 0) {
          setNotionAssets(data.assets);
          setIsLiveNotionStream(Boolean(data.liveNotion));
          return;
        }
      }

      // Fallback: try /api/notion/sync?action=get_digital_assets
      const fallbackRes = await fetch('/api/notion/sync?action=get_digital_assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token || undefined,
          databaseId: '3f101136de4881d69ba7ca159483a544'
        })
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success && Array.isArray(fallbackData.assets)) {
          setNotionAssets(fallbackData.assets);
          setIsLiveNotionStream(Boolean(fallbackData.liveNotion));
        }
      }
    } catch (e) {
      console.warn('Could not load Notion image assets:', e);
    } finally {
      setLoadingNotionAssets(false);
    }
  };

  useEffect(() => {
    loadNotionAssets();
  }, []);

  // Filtered Notion Assets by country, category, and search query
  const filteredNotionAssets = useMemo(() => {
    return notionAssets.filter(item => {
      if (notionCountryFilter !== 'all' && item.country?.toLowerCase() !== notionCountryFilter.toLowerCase()) {
        return false;
      }
      if (notionCategoryFilter !== 'all' && item.category?.toLowerCase() !== notionCategoryFilter.toLowerCase()) {
        return false;
      }
      if (notionSearchQuery.trim()) {
        const q = notionSearchQuery.toLowerCase();
        const combined = `${item.title || ''} ${item.name || ''} ${item.country || ''} ${item.category || ''}`.toLowerCase();
        if (!combined.includes(q)) return false;
      }
      return true;
    });
  }, [notionAssets, notionCountryFilter, notionCategoryFilter, notionSearchQuery]);

  // Dynamic country counts for filter chips
  const countryCounts = useMemo(() => {
    const counts = { all: notionAssets.length };
    notionAssets.forEach(a => {
      const c = (a.country || 'Other').toLowerCase();
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [notionAssets]);

  // Fetch live contextual image models (Nano Banana series)
  useEffect(() => {
    async function loadLiveImageModels() {
      try {
        const clientGeminiKey = safeGetItem('key_gemini') || '';
        const headers = {};
        if (clientGeminiKey) headers['x-gemini-key'] = clientGeminiKey;
        const res = await fetch('/api/gemini/models?context=image', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.models) && data.models.length > 0) {
            setAvailableImageModels(data.models);
          }
        }
      } catch (_) {}
    }
    loadLiveImageModels();
  }, []);

  // Check if server-side GEMINI_API_KEY is configured in Vercel environment
  useEffect(() => {
    fetch('/api/ai/media?check=status')
      .then((res) => res.json())
      .then((data) => {
        if (data?.configured) {
          setServerGeminiConfigured(true);
        }
      })
      .catch(() => {});
  }, []);

  // Custom text overlay editor state
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [customSlideText, setCustomSlideText] = useState({});

  // Determine photo theme category based on current occasion
  const photoCategory = useMemo(() => {
    return getPhotoCategoryForOccasion(occasion);
  }, [occasion]);

  const festivePresets = useMemo(() => {
    return CURATED_EVENT_PHOTOS[photoCategory] || CURATED_EVENT_PHOTOS['corporate'];
  }, [photoCategory]);

  // Generate base 5-slide series tailored to active draft/angle
  const baseSlides = useMemo(() => {
    return generateCarouselSlideSeries(occasion, activeDraft);
  }, [occasion, activeDraft]);

  // Synchronize curated distinct photos whenever baseSlides change
  useEffect(() => {
    const initialPhotos = {};
    baseSlides.forEach((slide, idx) => {
      initialPhotos[idx] = slide.defaultPhotoUrl || OFFICIAL_BROTHER_ASSETS[0]?.url;
    });
    setSlidePhotos(initialPhotos);
    setCustomPhotoUrl('');
  }, [baseSlides]);

  // Helper to get effective photo URL for any given slide index
  const getPhotoForSlide = (idx) => {
    if (slidePhotos[idx]) return slidePhotos[idx];
    if (baseSlides[idx]?.defaultPhotoUrl) return baseSlides[idx].defaultPhotoUrl;
    return OFFICIAL_BROTHER_ASSETS[0]?.url;
  };

  // Active photo URL for current slide
  const currentPhoto = getPhotoForSlide(activeSlideIndex);

  useEffect(() => {
    if (currentPhoto) {
      safeSetItem('brother_latest_visual_url', currentPhoto);
    }
  }, [currentPhoto]);

  // Assign photo to current active slide
  const handleSelectPhotoForSlide = (url) => {
    setSlidePhotos((prev) => ({
      ...prev,
      [activeSlideIndex]: url
    }));
    setCustomPhotoUrl('');
  };

  // Apply current active photo across all 5 slides
  const handleApplyToAllSlides = (url) => {
    const targetUrl = url || currentPhoto;
    const all = {};
    baseSlides.forEach((_, idx) => {
      all[idx] = targetUrl;
    });
    setSlidePhotos(all);
  };

  // Reset all slides to their curated default images
  const handleResetSlidePhotos = () => {
    const curated = {};
    baseSlides.forEach((s, idx) => {
      curated[idx] = s.defaultPhotoUrl || OFFICIAL_BROTHER_ASSETS[0]?.url;
    });
    setSlidePhotos(curated);
    setCustomPhotoUrl('');
  };

  // Slide data with user overrides
  const currentSlide = useMemo(() => {
    const base = baseSlides[activeSlideIndex] || baseSlides[0];
    const overrides = customSlideText[activeSlideIndex] || {};
    return {
      ...base,
      ...overrides
    };
  }, [baseSlides, activeSlideIndex, customSlideText]);

  // Update field on the active slide
  const updateSlideField = (field, val) => {
    setCustomSlideText((prev) => ({
      ...prev,
      [activeSlideIndex]: {
        ...(prev[activeSlideIndex] || {}),
        [field]: val
      }
    }));
  };

  // Reset custom text on current slide
  const handleResetSlideText = () => {
    setCustomSlideText((prev) => {
      const copy = { ...prev };
      delete copy[activeSlideIndex];
      return copy;
    });
  };

  // Handle slide navigation
  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : baseSlides.length - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev < baseSlides.length - 1 ? prev + 1 : 0));
  };

  // Handle file upload with robust FileReader and base64 encoding
  const handleUploadPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setSlidePhotos((prev) => ({
          ...prev,
          [activeSlideIndex]: dataUrl
        }));
        setCustomPhotoUrl(dataUrl);
      }
    };
    reader.onerror = (err) => {
      console.error('Error reading uploaded image:', err);
    };
    reader.readAsDataURL(file);

    // Reset input value so selecting the same file again triggers onChange
    e.target.value = '';
  };

  // Handle single slide PNG download
  const handleDownloadActiveSlide = async () => {
    setDownloading(true);
    try {
      const dataUrl = await renderSlideToCanvas({
        slide: currentSlide,
        photoUrl: currentPhoto,
        aspectRatio
      });

      if (dataUrl) {
        const a = document.createElement('a');
        a.href = dataUrl;
        const slideName = currentSlide.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const eventSlug = (occasion?.name || 'brother-sg').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        a.download = `${eventSlug}-slide-${currentSlide.slideIndex}-${slideName}.png`;
        a.click();
        logActivity({
          event: 'Exported Single Carousel Slide',
          category: 'Visual Studio',
          details: `Downloaded Slide ${currentSlide.slideIndex} (${currentSlide.roleTitle}) for "${occasion?.name || 'Brother Post'}"`,
          status: 'Success'
        });
      }
    } catch (err) {
      console.error('Error generating image export:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Handle full 5-slide batch download using each slide's tailored image
  const handleDownloadAllSlides = async () => {
    setDownloading(true);
    try {
      for (let i = 0; i < baseSlides.length; i++) {
        const base = baseSlides[i];
        const overrides = customSlideText[i] || {};
        const slide = { ...base, ...overrides };
        const slidePhoto = getPhotoForSlide(i);

        const dataUrl = await renderSlideToCanvas({
          slide,
          photoUrl: slidePhoto,
          aspectRatio
        });

        if (dataUrl) {
          const a = document.createElement('a');
          a.href = dataUrl;
          const slideName = slide.roleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const eventSlug = (occasion?.name || 'brother-sg').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          a.download = `${eventSlug}-slide-${slide.slideIndex}-${slideName}.png`;
          a.click();
          await new Promise((r) => setTimeout(r, 400));
        }
      }
      logActivity({
        event: 'Exported Full 5-Slide Carousel Pack',
        category: 'Visual Studio',
        details: `Downloaded all 5 slides (1080x1080) for "${occasion?.name || 'Brother Post'}" - ${activeDraft?.name || 'Curated Angle'}`,
        status: 'Success'
      });
    } catch (err) {
      console.error('Error batch exporting slides:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Compile full 5-slide carousel into PDF (for LinkedIn Document Carousel & Buffer API)
  const handleExportPdf = async () => {
    setDownloading(true);
    try {
      const { pdf, pdfBlob, pdfBase64, filename } = await generateCarouselPdf({
        slides: baseSlides,
        slidePhotos,
        customSlideText,
        aspectRatio
      });

      // 1. Trigger client download of the PDF
      pdf.save(filename);

      // 2. Upload to Vercel Blob so Buffer API can attach it to LinkedIn
      try {
        const blobRes = await fetch('/api/blob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename,
            fileBase64: pdfBase64,
            access: 'public'
          })
        });

        if (blobRes.ok) {
          const blobData = await blobRes.json();
          const publicUrl = blobData.publicUrl || blobData.url;
          if (publicUrl) {
            safeSetItem('brother_latest_carousel_pdf_url', publicUrl);
          }
        }
      } catch (uploadErr) {
        console.warn('PDF blob upload warning:', uploadErr);
      }

      setCloudSuccess({
        message: 'Carousel PDF compiled & saved! Ready for LinkedIn & Buffer broadcast.'
      });

      logActivity({
        event: 'Generated LinkedIn Carousel PDF',
        category: 'Visual Studio',
        details: `Exported 5-slide PDF carousel (${filename}) ready for Buffer document broadcast`,
        status: 'Success'
      });
    } catch (err) {
      console.error('Error exporting carousel PDF:', err);
      setCloudError(`Failed to compile Carousel PDF: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // Auto-generate contextual visual prompt directly from finalized post copy
  const handleGeneratePromptFromPost = () => {
    const postCopy = activeDraft?.postContent || activeDraft?.post || occasion?.details || '';
    if (!postCopy) {
      setImagePrompt(`A high-resolution, studio-lit commercial photograph of a modern Brother Singapore office printer in matte black and titanium finish on an executive wooden desk. Warm natural sunlight, clean minimalist Japanese aesthetic, ultra-sharp focus, text-free.`);
      return;
    }

    const lower = postCopy.toLowerCase();
    let visualScene = '';

    if (lower.includes('umbrella') || lower.includes('rain') || lower.includes('lc462')) {
      visualScene = `A refined, cinematic lifestyle photograph on a modern Singapore office desk by a rain-streaked window. A sleek Brother printer in matte black with a closed navy automatic umbrella resting neatly beside a warm ceramic coffee mug. Soft ambient natural morning daylight, subtle Japanese Monozukuri craft aesthetic, 8k resolution, text-free.`;
    } else if (lower.includes('printer') || lower.includes('cartridge') || lower.includes('toner') || lower.includes('ink') || lower.includes('mfc') || lower.includes('hardware')) {
      visualScene = `Clean, high-end commercial editorial photograph of a modern Brother printer on a polished minimalist Singapore SME office desk. Gentle morning window illumination, tidy workstation with architecture blueprints, crisp clean composition, ultra-realistic, text-free.`;
    } else if (lower.includes('kaizen') || lower.includes('monozukuri') || lower.includes('precision') || lower.includes('friction') || lower.includes('engineering')) {
      visualScene = `Macro close-up editorial photograph showcasing precision Japanese engineering mechanics and gear alignment inside a premium printer chassis. Soft studio rim-lighting, tactile textures, metallic craftsmanship, depth of field bokeh, text-free.`;
    } else if (lower.includes('celebrat') || lower.includes('festive') || lower.includes('wa') || lower.includes('harmony') || lower.includes('community') || lower.includes('blessing') || lower.includes('deepavali') || lower.includes('cny') || lower.includes('raya')) {
      visualScene = `Warm, authentic corporate editorial photograph celebrating community and cultural harmony in a contemporary Singapore workplace setting. Warm golden ambient illumination, subtle festive accents, smiling diverse colleagues gathered in respectful conversation, cinematic bokeh, natural lighting, text-free.`;
    } else if (lower.includes('sme') || lower.includes('productivity') || lower.includes('leader') || lower.includes('workplace') || lower.includes('digital')) {
      visualScene = `Sophisticated Singapore corporate office scene overlooking the Marina Bay skyline. Modern collaborative workstation with ergonomic setup, natural ambient light, calm disciplined focus, premium editorial composition, text-free.`;
    } else {
      visualScene = `High-resolution editorial commercial photograph reflecting Brother Singapore's 'At your side' philosophy. Sleek modern workspace, natural daylight, warm minimalist tones, clean text-free composition.`;
    }

    setImagePrompt(visualScene);
  };

  // AI Generate Visual using Gemini/Imagen
  const handleAiGenerate = async () => {
    setIsAiGenerating(true);
    setAiError(null);
    try {
      const clientKey = safeGetItem('key_gemini') || '';
      const res = await fetch('/api/ai/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt || undefined,
          occasionName: occasion?.name,
          theme: occasion?.theme,
          aspectRatio,
          model: selectedAiModel,
          apiKey: clientKey || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setCustomPhotoUrl(data.imageUrl);
        setSlidePhotos((prev) => ({
          ...prev,
          [activeSlideIndex]: data.imageUrl
        }));

        // Auto-archive clean text-free image layer to Vercel Blob and Notion
        try {
          const blobRes = await fetch('/api/blob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: `clean-visual-${Date.now()}.png`,
              imageBase64: data.imageUrl,
              access: 'private'
            })
          });
          if (blobRes.ok) {
            const blobData = await blobRes.json();
            const cleanUrl = blobData.publicUrl || blobData.url;
            const notionToken = safeGetItem('notion_token');
            if (notionToken && cleanUrl) {
              await fetch('/api/notion/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  apiKey: notionToken,
                  post: {
                    title: `${occasion?.name || 'Brother Singapore'} (Clean Image Layer)`,
                    status: 'Generated Candidate',
                    category: occasion?.category || 'AI Visual Generation',
                    cleanImageUrl: cleanUrl,
                    imageType: aspectRatio === '1:1' ? 'Carousel (1:1)' : 'Banner (1.91:1)',
                    slideCount: aspectRatio === '1:1' ? baseSlides.length : 1
                  }
                })
              });
            }
          }
        } catch (syncErr) {
          console.warn('Could not auto-archive clean image to Notion:', syncErr);
        }

        logActivity({
          event: 'Generated AI Visual',
          category: 'Visual Studio',
          details: `Generated AI visual using ${data.modelUsed || selectedAiModel} for "${occasion?.name || 'Brother Post'}" (${aspectRatio})`,
          status: 'Success'
        });
      } else {
        const errorDetails = data.error || 'Gemini image generation is currently unavailable.';
        setAiError({
          message: errorDetails,
          troubleshooting: data.troubleshooting || null,
          errorType: data.errorType || 'ERROR',
          modelUsed: data.modelUsed || selectedAiModel
        });
        logActivity({
          event: 'AI Visual Generation Failed',
          category: 'Visual Studio',
          details: `Generation failed (${selectedAiModel}): ${errorDetails}`,
          status: 'Error'
        });
      }
    } catch (err) {
      setAiError({
        message: err.message || 'Network error connecting to AI image generator.',
        troubleshooting: 'Check your internet connection and API key configuration in Settings.',
        errorType: 'NETWORK_ERROR',
        modelUsed: selectedAiModel
      });
      logActivity({
        event: 'AI Visual Generation Error',
        category: 'Visual Studio',
        details: `Connection error with ${selectedAiModel}: ${err.message}`,
        status: 'Error'
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Save current slide to Vercel Blob storage and Notion
  const handleSaveToCloud = async () => {
    setCloudSaving(true);
    setCloudError(null);
    setCloudSuccess(null);
    try {
      const dataUrl = await renderSlideToCanvas({
        slide: currentSlide,
        photoUrl: currentPhoto,
        aspectRatio
      });

      if (!dataUrl) {
        throw new Error('Could not render canvas to image data.');
      }

      const eventSlug = (occasion?.name || 'brother-sg').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const filename = `${eventSlug}-slide-${currentSlide.slideIndex}.png`;

      // 1. Upload to Vercel Blob
      const blobRes = await fetch('/api/blob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          imageBase64: dataUrl,
          access: 'private'
        })
      });

      const blobData = await blobRes.json();
      if (!blobRes.ok || !blobData.success) {
        throw new Error(blobData.error || 'Failed to upload to Vercel Blob storage.');
      }

      const visualUrl = blobData.publicUrl || blobData.url;

      // 2. Optionally archive to Notion if token is present
      const notionToken = safeGetItem('notion_token') || safeGetItem('token_notion');
      const notionDb = safeGetItem('notion_database_id') || '3c701136de4881de9d29ca4ea415e856';

      let notionUrl = null;
      if (notionToken) {
        try {
          const syncRes = await fetch('/api/notion/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: notionToken,
              databaseId: notionDb,
              post: {
                title: `${occasion?.name || 'Brother SG'} - Slide ${currentSlide.slideIndex} (${currentSlide.roleTitle})`,
                content: activeDraft?.post || currentSlide.headline,
                imageUrl: visualUrl,
                compositeImageUrl: visualUrl,
                imageType: aspectRatio === '1:1' ? 'Carousel (1:1)' : 'Banner (1.91:1)',
                slideCount: aspectRatio === '1:1' ? baseSlides.length : 1,
                category: occasion?.category || 'AI & Employer Branding',
                status: 'Working Draft',
                author: 'Allan Cheng',
                date: new Date().toISOString().split('T')[0]
              }
            })
          });
          const syncData = await syncRes.json();
          if (syncData.success && syncData.url) {
            notionUrl = syncData.url;
          }
        } catch (e) {
          console.warn('Notion sync warning:', e);
        }
      }

      setCloudSuccess({
        imageUrl: visualUrl,
        notionUrl,
        message: 'Saved to Notion!'
      });

      logActivity({
        event: 'Saved Visual Asset to Cloud & Notion',
        category: 'Visual Studio',
        details: `Saved Slide ${currentSlide.slideIndex} (${currentSlide.roleTitle}) visual asset to cloud and Notion repository`,
        status: 'Success'
      });
    } catch (err) {
      setCloudError(err.message || 'Error saving to Notion.');
    } finally {
      setCloudSaving(false);
    }
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Two Source Tabs: (1) Regional Asset Library & (2) Generate with Gemini */}
      <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-950 rounded-xl border border-slate-300/60 dark:border-slate-800 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setVisualSourceMode('library')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              visualSourceMode === 'library'
                ? 'bg-white dark:bg-slate-800 text-[#0f2ea2] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
            <span>(1) Regional Asset Library</span>
            {notionAssets.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#0f2ea2] dark:text-blue-300 font-mono">
                +{notionAssets.length} Notion
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setVisualSourceMode('ai')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              visualSourceMode === 'ai'
                ? 'bg-white dark:bg-slate-800 text-[#0f2ea2] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400 shrink-0" />
            <span>(2) Generate with Gemini</span>
          </button>
        </div>

        {/* Quick Photo Upload Button */}
        <label
          htmlFor="brother-photo-upload"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
          title="Upload an image from your device"
        >
          <Upload className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
          <span>Upload Photo</span>
          <input
            id="brother-photo-upload"
            type="file"
            accept="image/*"
            onChange={handleUploadPhoto}
            className="hidden"
          />
        </label>
      </div>

      {/* Tab 1 Content: Regional Digital Asset Library with Notion Thumbnails */}
      {visualSourceMode === 'library' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveAssetTab('notion')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAssetTab === 'notion'
                    ? 'bg-[#0f2ea2] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Notion Digital Assets ({notionAssets.length || 356})</span>
                {isLiveNotionStream && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" title="Live Notion Stream" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveAssetTab('official')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeAssetTab === 'official'
                    ? 'bg-[#0f2ea2] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Featured SG Hardware ({OFFICIAL_BROTHER_ASSETS.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveAssetTab('festive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeAssetTab === 'festive'
                    ? 'bg-[#0f2ea2] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Cultural & Events ({festivePresets.length})
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyToAllSlides()}
                className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0f2ea2] dark:hover:text-blue-400 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs"
                title="Apply current photo to all 5 slides"
              >
                Apply to All Slides
              </button>
              <button
                type="button"
                onClick={handleResetSlidePhotos}
                className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0f2ea2] dark:hover:text-blue-400 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs"
                title="Reset each slide to its curated default image"
              >
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Notion Digital Asset Toolbar & Country Filters */}
          {activeAssetTab === 'notion' && (
            <div className="space-y-2.5 pt-1 pb-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Search bar */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={notionSearchQuery}
                    onChange={(e) => setNotionSearchQuery(e.target.value)}
                    placeholder="Search 350+ Brother digital assets by model, keyword, or country..."
                    className="w-full pl-8.5 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0f2ea2]"
                  />
                  {notionSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setNotionSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Live stream status & refresh */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Notion Stream ({filteredNotionAssets.length} of {notionAssets.length || 356})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadNotionAssets(true)}
                    disabled={loadingNotionAssets}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                    title="Refresh & re-sync from Notion database"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingNotionAssets ? 'animate-spin text-[#0f2ea2]' : ''}`} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>

              {/* Country Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Region:
                </span>
                {[
                  { id: 'all', label: `All (${notionAssets.length || 356})` },
                  { id: 'Singapore', label: `🇸🇬 Singapore (${countryCounts['singapore'] || 67})` },
                  { id: 'Japan', label: `🇯🇵 Japan (${countryCounts['japan'] || 38})` },
                  { id: 'Philippines', label: `🇵🇭 Philippines (${countryCounts['philippines'] || 49})` },
                  { id: 'Malaysia', label: `🇲🇾 Malaysia (${countryCounts['malaysia'] || 48})` },
                  { id: 'Taiwan', label: `🇹🇼 Taiwan (${countryCounts['taiwan'] || 46})` },
                  { id: 'South Korea', label: `🇰🇷 Korea (${countryCounts['south korea'] || 62})` },
                  { id: 'Indonesia', label: `🇮🇩 Indonesia (${countryCounts['indonesia'] || 45})` }
                ].map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setNotionCountryFilter(chip.id)}
                    className={`px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                      notionCountryFilter.toLowerCase() === chip.id.toLowerCase()
                        ? 'bg-[#0f2ea2] text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Uploaded Photo Indicator Banner */}
          {customPhotoUrl && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border-2 border-[#0f2ea2] shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={customPhotoUrl}
                  alt="Custom Uploaded"
                  className="w-10 h-10 rounded-lg object-cover border border-[#0f2ea2]/40 shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Custom Uploaded Photo Active
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    Active on slide 0{activeSlideIndex + 1}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomPhotoUrl('');
                  handleSelectPhotoForSlide(baseSlides[activeSlideIndex]?.defaultPhotoUrl || OFFICIAL_BROTHER_ASSETS[0]?.url);
                }}
                className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* Thumbnail Grid for Selected Tab */}
          {activeAssetTab === 'notion' && loadingNotionAssets && notionAssets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0f2ea2]" />
              <span>Streaming digital asset library from Notion database (3f101136...)...</span>
            </div>
          ) : activeAssetTab === 'notion' && filteredNotionAssets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Database className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="font-bold">No assets found matching your filter.</p>
              <p className="text-[11px] opacity-80 mt-1">
                Try selecting "All" regions or clearing your search term.
              </p>
              <button
                type="button"
                onClick={() => { setNotionCountryFilter('all'); setNotionSearchQuery(''); }}
                className="mt-3 px-3 py-1 bg-[#0f2ea2] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-[520px] overflow-y-auto custom-scrollbar p-1">
              {(activeAssetTab === 'official' 
                ? OFFICIAL_BROTHER_ASSETS 
                : activeAssetTab === 'festive' 
                ? festivePresets 
                : filteredNotionAssets
              ).map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handleSelectPhotoForSlide(asset.url)}
                  className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-900 ${
                    currentPhoto === asset.url
                      ? 'border-[#0f2ea2] ring-2 ring-[#0f2ea2]/40 shadow-md scale-[1.02]'
                      : 'border-transparent hover:border-slate-400 opacity-85 hover:opacity-100'
                  }`}
                  title={`${asset.title || asset.name} - ${asset.country || ''}`}
                >
                  <img
                    src={asset.thumb || asset.url}
                    alt={asset.title || asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  {/* Country badge */}
                  {asset.country && (
                    <div className="absolute top-1.5 left-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-xs font-mono shadow-xs">
                        {asset.country}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-1.5 text-[10px] text-white font-medium truncate text-left">
                    {asset.title || asset.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: Gemini AI Generation Studio */}
      {visualSourceMode === 'ai' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#0f2ea2] dark:text-blue-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Commercial Image Synthesis (Gemini)
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Text-Free Base Layer
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  High-resolution studio photography calibrated to Google Gemini photographic standards.
                </p>
              </div>
            </div>

            {/* Frontier Model Selector */}
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Model:
              </label>
              <select
                value={selectedAiModel}
                onChange={(e) => {
                  setSelectedAiModel(e.target.value);
                  safeSetItem('model_gemini_image', e.target.value);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] cursor-pointer"
              >
                {availableImageModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.id} {m.badge ? `(${m.badge})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Style Presets */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Visual Style Preset:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {GEMINI_STYLE_PROMPT_GUIDES.map(guide => (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => {
                    setSelectedStyleGuideId(guide.id);
                    setImagePrompt(guide.getSamplePrompt(occasion?.name));
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedStyleGuideId === guide.id
                      ? 'border-[#0f2ea2] bg-blue-50/60 dark:bg-blue-950/40 text-[#0f2ea2] dark:text-blue-300 ring-1 ring-[#0f2ea2]'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold leading-tight truncate">{guide.name}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 shrink-0">
                      {guide.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {guide.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Instructional Image Prompt:
              </label>
              <button
                type="button"
                onClick={handleGeneratePromptFromPost}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-[#0f2ea2] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Automatically analyze the finalized post copy and suggest a tailored photography prompt"
              >
                <Sparkles className="w-3 h-3 text-[#0f2ea2] dark:text-blue-400" />
                <span>✨ Auto-Match to Post Copy</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="A high-resolution, studio-lit commercial photograph of..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2] leading-relaxed resize-none font-normal"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="text-[11px] text-slate-500">
              Targeting: <strong className="text-slate-800 dark:text-slate-200">Slide 0{activeSlideIndex + 1} ({aspectRatio === '1:1' ? '1:1 Square' : '1.91:1 Banner'})</strong>
            </div>

            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isAiGenerating}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#0f2ea2] to-blue-700 hover:from-[#0c2480] hover:to-blue-800 px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiGenerating ? 'Generating...' : 'Generate with Gemini AI'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION (1): [in red] (1) [in black] Image Size */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-mono font-bold text-[#0f2ea2] dark:text-blue-400">Step 01:</span>
          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Image Size
          </span>
          <span className="text-[11px] text-slate-400 font-normal ml-auto">
            Choose aspect ratio for LinkedIn post
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setAspectRatio('1.91:1')}
            className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
              aspectRatio === '1.91:1'
                ? 'border-[#0f2ea2] bg-blue-50/70 dark:bg-blue-950/40 text-[#0f2ea2] dark:text-blue-300 ring-2 ring-[#0f2ea2]/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-left">
              <span className="text-xs font-bold block">(a) Banner (1.91:1 Landscape)</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">1200 × 627 px • Standard feed banner</span>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              aspectRatio === '1.91:1' ? 'border-[#0f2ea2] bg-[#0f2ea2]' : 'border-slate-300'
            }`}>
              {aspectRatio === '1.91:1' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAspectRatio('1:1')}
            className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
              aspectRatio === '1:1'
                ? 'border-[#0f2ea2] bg-blue-50/70 dark:bg-blue-950/40 text-[#0f2ea2] dark:text-blue-300 ring-2 ring-[#0f2ea2]/20 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-left">
              <span className="text-xs font-bold block">(b) Carousel (1:1 Square Multi-Slide)</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">1080 × 1080 px • 5-slide PDF swipeable document</span>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              aspectRatio === '1:1' ? 'border-[#0f2ea2] bg-[#0f2ea2]' : 'border-slate-300'
            }`}>
              {aspectRatio === '1:1' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </button>
        </div>
      </div>


      {/* Cloud Feedback Banners */}
      {cloudSuccess && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{cloudSuccess.message}</span>
            {cloudSuccess.notionUrl && (
              <a
                href={cloudSuccess.notionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#0f2ea2] dark:text-blue-400 underline ml-1"
              >
                <span>Open in Notion</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCloudSuccess(null)}
            className="text-emerald-700 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {cloudError && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/60 text-xs text-rose-900 dark:text-rose-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{cloudError}</span>
          </div>
          <button
            type="button"
            onClick={() => setCloudError(null)}
            className="text-rose-700 hover:text-rose-950 dark:text-rose-300 dark:hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SECTION (2): [in red] (2) [in black] Edit Text */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono font-bold text-[#0f2ea2] dark:text-blue-400">Step 02:</span>
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Edit Text
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowTextEditor(!showTextEditor)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showTextEditor
                ? 'bg-blue-50 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
            <span>{showTextEditor ? 'Hide Text Editor' : 'Click to edit text'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showTextEditor ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Collapsible Edit Text Part: Unfolds Immediately Below */}
        {showTextEditor && (
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Overlay Text — Slide {activeSlideIndex + 1} ({currentSlide.roleTitle})
              </span>
              <button
                type="button"
                onClick={handleResetSlideText}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Badge Pill Text
                </label>
                <input
                  type="text"
                  value={currentSlide.badge || ''}
                  onChange={(e) => updateSlideField('badge', e.target.value)}
                  placeholder="e.g. MONOZUKURI PRECISION"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={currentSlide.headline || ''}
                  onChange={(e) => updateSlideField('headline', e.target.value)}
                  placeholder="e.g. Precision in Every Detail"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Sub-headline / Angle
              </label>
              <input
                type="text"
                value={currentSlide.subheadline || ''}
                onChange={(e) => updateSlideField('subheadline', e.target.value)}
                placeholder="e.g. Empowering Singapore businesses with seamless reliability"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Supporting Narrative / Details
              </label>
              <textarea
                rows={2}
                value={currentSlide.supportingText || ''}
                onChange={(e) => updateSlideField('supportingText', e.target.value)}
                placeholder="e.g. When technology works silently at your side, your teams achieve uninterrupted focus."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Footer Tagline / Watermark
              </label>
              <input
                type="text"
                value={currentSlide.footerText || ''}
                onChange={(e) => updateSlideField('footerText', e.target.value)}
                placeholder={aspectRatio === '1.91:1' ? 'Brother Singapore • At your side' : 'Swipe to explore our story ➔'}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2]"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION (3): [in red] (3) [in black] The Image (Banner or Carousel) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono font-bold text-[#0f2ea2] dark:text-blue-400">Step 03:</span>
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              {aspectRatio === '1:1' ? 'The Image / Carousel Canvas' : 'The Image / Banner Canvas'}
            </span>
          </div>

          {aspectRatio === '1:1' && (
            <span className="text-xs font-mono font-bold text-[#0f2ea2] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
              Slide {activeSlideIndex + 1} of {baseSlides.length}
            </span>
          )}
        </div>

        {/* 5-Slide Navigation Tabs (Only in Carousel mode) */}
        {aspectRatio === '1:1' && (
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {baseSlides.map((slide, idx) => {
                const slideImg = getPhotoForSlide(idx);
                const isActive = activeSlideIndex === idx;
                return (
                  <button
                    key={slide.slideNumber}
                    type="button"
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#0f2ea2] text-white border-[#0f2ea2] shadow-xs ring-1 ring-[#0f2ea2]'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                      0{idx + 1}
                    </span>
                    {slideImg && (
                      <img 
                        src={slideImg} 
                        alt="" 
                        className="w-4 h-4 rounded-sm object-cover border border-white/20"
                      />
                    )}
                    <span>{slide.roleTitle}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handlePrevSlide}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* The Live Composite Image / Carousel Canvas */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-300/80 dark:border-slate-800 bg-slate-950 group">
          <div 
            className={`w-full relative transition-all duration-300 ${
              aspectRatio === '1.91:1' ? 'aspect-[1.91/1]' : 'aspect-square'
            }`}
          >
            {/* Background Image */}
            <img
              key={currentPhoto}
              src={currentPhoto}
              alt={currentSlide.headline}
              className="absolute inset-0 w-full h-full object-cover select-none transition-all duration-500 group-hover:scale-105"
            />

            {/* Cinematic Scrim & Brother Gradient Overlay */}
            <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
              aspectRatio === '1.91:1'
                ? 'bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-slate-950/15'
                : 'bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/20'
            }`} />

            {/* Signature Brother Blue Accent Edge */}
            <div className={`absolute ${aspectRatio === '1.91:1' ? 'left-0 top-0 bottom-0 w-2.5' : 'top-0 left-0 right-0 h-2.5'} bg-[#0f2ea2] shadow-lg pointer-events-none`} />

            {/* Slide Content Overlay */}
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between text-white select-none">
              {/* Top Bar: Official Brother Logo & Slide Indicator */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src="/brother-logo.svg" 
                    alt="Brother • at your side" 
                    className="h-8 sm:h-10 w-auto object-contain drop-shadow-md"
                    onError={(e) => {
                      e.target.src = '/brother-logo.png';
                    }}
                  />
                </div>

                {aspectRatio === '1:1' && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0f2ea2] text-white text-[11px] font-mono font-bold shadow-md border border-white/20">
                    {currentSlide.slideNumber}
                  </div>
                )}
              </div>

              {/* Middle Section: Badges, Headline, and Narrative */}
              <div className={`space-y-2 sm:space-y-3 ${aspectRatio === '1.91:1' ? 'max-w-2xl my-auto' : 'my-auto'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#0f2ea2] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
                  {currentSlide.badge}
                </div>

                <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  {currentSlide.headline}
                </h3>

                <p className="text-sm sm:text-base md:text-lg text-slate-200 font-medium leading-snug drop-shadow-sm line-clamp-3">
                  {currentSlide.subheadline}
                </p>

                {currentSlide.supportingText && (
                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed pt-1 line-clamp-3">
                    {currentSlide.supportingText}
                  </p>
                )}
              </div>

              {/* Bottom Footer: Official Tagline */}
              <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>{getEffectiveFooterText(currentSlide, aspectRatio)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Directly Below Each Image: Individual "Generate with Gemini" Control Bar */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Generate this image background with Gemini AI
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                (Regenerate individual visual if not satisfied)
              </span>
            </div>

            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isAiGenerating}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0f2ea2] hover:bg-[#0c2480] px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiGenerating ? 'animate-spin' : ''}`} />
              <span>{isAiGenerating ? 'Synthesizing...' : `Generate Slide 0${activeSlideIndex + 1} Image`}</span>
            </button>
          </div>

          {/* Visual Style Preset Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {GEMINI_STYLE_PROMPT_GUIDES.map(guide => (
              <button
                key={guide.id}
                type="button"
                onClick={() => {
                  setSelectedStyleGuideId(guide.id);
                  setImagePrompt(guide.getSamplePrompt(occasion?.name));
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedStyleGuideId === guide.id
                    ? 'bg-[#0f2ea2] text-white border-[#0f2ea2]'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {guide.name.split('&')[0].trim()}
              </button>
            ))}
          </div>

          {/* Instructional Image Prompt Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Instructional prompt for this slide's visual layer..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0f2ea2]"
            />
          </div>
        </div>

        {/* Bottom Actions Toolbar: Download as PNG, Download as PDF, Save to Notion */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download as PNG */}
            <button
              type="button"
              onClick={handleDownloadActiveSlide}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0f2ea2] hover:bg-[#004b8f] px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Exporting...' : 'Download as PNG'}</span>
            </button>

            {/* Download as PDF (for Carousel) */}
            {aspectRatio === '1:1' && (
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Compile all 5 slides into a LinkedIn Carousel PDF for Buffer & LinkedIn"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{downloading ? 'Compiling PDF...' : 'Download as PDF (Carousel)'}</span>
              </button>
            )}

            {/* 5-Slide PNG Pack */}
            {aspectRatio === '1:1' && (
              <button
                type="button"
                onClick={handleDownloadAllSlides}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <FolderDown className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                <span>All 5 PNGs</span>
              </button>
            )}
          </div>

          {/* Save to Library */}
          <button
            type="button"
            onClick={handleSaveToCloud}
            disabled={cloudSaving}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f2ea2] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800/60 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Archive visual layer to library"
          >
            <Bookmark className={`w-3.5 h-3.5 ${cloudSaving ? 'animate-spin' : ''}`} />
            <span>{cloudSaving ? 'Saving...' : 'Save to Library'}</span>
          </button>
        </div>
      </div>

      {aiError && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200 space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-xs leading-snug">
                  {typeof aiError === 'string' ? aiError : aiError.message}
                </p>
                {aiError.troubleshooting && (
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed font-normal">
                    {aiError.troubleshooting}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAiError(null)}
              className="text-[11px] font-bold px-2 py-1 rounded text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/60 cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
