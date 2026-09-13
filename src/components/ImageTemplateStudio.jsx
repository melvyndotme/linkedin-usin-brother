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
  Info
} from 'lucide-react';
import { 
  OFFICIAL_BROTHER_ASSETS,
  CURATED_EVENT_PHOTOS, 
  getPhotoCategoryForOccasion, 
  generateCarouselSlideSeries, 
  renderSlideToCanvas 
} from '../lib/imageTemplateEngine.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';

export default function ImageTemplateStudio({ 
  occasion, 
  activeDraft, 
  isDark = false 
}) {
  const [aspectRatio, setAspectRatio] = useState('1:1'); // '1:1' (Square Carousel) or '1.91:1' (Landscape Banner)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeAssetTab, setActiveAssetTab] = useState('official'); // 'official' | 'festive'
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // AI model selector and token advisory alert
  const [selectedAiModel, setSelectedAiModel] = useState(() => {
    const validModels = [
      'gemini-3.1-flash-image',
      'gemini-3-pro-image',
      'gemini-2.5-flash-image',
      'gemini-3.1-flash-lite-image'
    ];
    const saved = safeGetItem('model_gemini_image');
    if (!validModels.includes(saved)) {
      return 'gemini-3.1-flash-image';
    }
    return saved;
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  // Set default photo when occasion changes
  useEffect(() => {
    if (occasion?.eventType === 'promotion' || occasion?.theme === 'red') {
      setActiveAssetTab('official');
      setSelectedPhotoUrl(OFFICIAL_BROTHER_ASSETS[0]?.url || '');
    } else if (festivePresets && festivePresets.length > 0) {
      setActiveAssetTab('official');
      setSelectedPhotoUrl(OFFICIAL_BROTHER_ASSETS[0]?.url || festivePresets[0].url);
    }
  }, [occasion, festivePresets]);

  // Generate base 5-slide series
  const baseSlides = useMemo(() => {
    return generateCarouselSlideSeries(occasion, activeDraft);
  }, [occasion, activeDraft]);

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

  // Active photo URL
  const currentPhoto = customPhotoUrl || selectedPhotoUrl || OFFICIAL_BROTHER_ASSETS[0]?.url;

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
        setCustomPhotoUrl(dataUrl);
        setSelectedPhotoUrl(dataUrl);
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
      }
    } catch (err) {
      console.error('Error generating image export:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Handle full 5-slide batch download
  const handleDownloadAllSlides = async () => {
    setDownloading(true);
    try {
      for (let i = 0; i < baseSlides.length; i++) {
        const base = baseSlides[i];
        const overrides = customSlideText[i] || {};
        const slide = { ...base, ...overrides };

        const dataUrl = await renderSlideToCanvas({
          slide,
          photoUrl: currentPhoto,
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
    } catch (err) {
      console.error('Error batch exporting slides:', err);
    } finally {
      setDownloading(false);
    }
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
        setSelectedPhotoUrl(data.imageUrl);
      } else {
        setAiError({
          message: data.error || 'Gemini image generation is currently unavailable.',
          troubleshooting: data.troubleshooting || null,
          errorType: data.errorType || 'ERROR',
          modelUsed: data.modelUsed || selectedAiModel
        });
      }
    } catch (err) {
      setAiError({
        message: err.message || 'Network error connecting to AI image generator.',
        troubleshooting: 'Check your internet connection and API key configuration in Settings.',
        errorType: 'NETWORK_ERROR',
        modelUsed: selectedAiModel
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Studio Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <img 
            src="/brother-logo.svg" 
            alt="Brother • at your side" 
            className="h-8 w-auto object-contain bg-slate-950 px-2 py-1 rounded-lg border border-slate-800"
            onError={(e) => {
              e.target.src = '/brother-logo.png';
            }}
          />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Official LinkedIn Visual Studio
            </h4>
            <p className="text-[11px] text-slate-500">
              Official Brother SG brand assets & 5-slide editorial carousels
            </p>
          </div>
        </div>

        {/* Action Controls & Format Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Format Selector: 1:1 Square vs 1.91:1 Banner */}
          <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAspectRatio('1:1')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                aspectRatio === '1:1'
                  ? 'bg-white dark:bg-slate-900 text-[#0f2ea2] dark:text-blue-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              1:1 Carousel (1080×1080)
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('1.91:1')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                aspectRatio === '1.91:1'
                  ? 'bg-white dark:bg-slate-900 text-[#0f2ea2] dark:text-blue-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              1.91:1 Banner (1200×627)
            </button>
          </div>

          {/* Edit Text Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTextEditor(!showTextEditor)}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              showTextEditor
                ? 'bg-blue-50 dark:bg-blue-950 text-[#0f2ea2] dark:text-blue-400 border-blue-300 dark:border-blue-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
            <span>{showTextEditor ? 'Close Text Editor' : 'Edit Text'}</span>
          </button>

          {/* Export PNG Buttons */}
          <button
            type="button"
            onClick={handleDownloadActiveSlide}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0f2ea2] hover:bg-[#004b8f] px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Download PNG'}</span>
          </button>

          {aspectRatio === '1:1' && (
            <button
              type="button"
              onClick={handleDownloadAllSlides}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              title="Download all 5 slides in this series"
            >
              <FolderDown className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
              <span className="hidden md:inline">Download 5-Slide Pack</span>
              <span className="md:hidden">All 5</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Slide Carousel Navigation Tabs (Only in 1:1 Carousel Mode) */}
      {aspectRatio === '1:1' && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {baseSlides.map((slide, idx) => (
              <button
                key={slide.slideNumber}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  activeSlideIndex === idx
                    ? 'bg-[#0f2ea2] text-white border-[#0f2ea2] shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <span className={`text-[10px] font-mono ${activeSlideIndex === idx ? 'text-blue-200' : 'text-slate-400'}`}>
                  0{idx + 1}
                </span>
                <span>{slide.roleTitle}</span>
              </button>
            ))}
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

      {/* Main Visual Stage (Live Responsive Editorial Canvas Composite) */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-300/80 dark:border-slate-800 bg-slate-950 group">
        <div 
          className={`w-full relative transition-all duration-300 ${
            aspectRatio === '1.91:1' ? 'aspect-[1.91/1]' : 'aspect-square'
          }`}
        >
          {/* Background Image (Official Brother SG Asset or Festive Photo) */}
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
              <span>{currentSlide.footerText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Text Overlay Editor Drawer */}
      {showTextEditor && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-[#0f2ea2]/40 shadow-lg space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#0f2ea2] text-white flex items-center justify-center">
                <Edit3 className="w-3 h-3" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Edit Text Overlay — Slide {activeSlideIndex + 1} ({currentSlide.roleTitle})
                </h5>
                <p className="text-[10px] text-slate-500">
                  Live updates are reflected immediately on the image and in exported PNGs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetSlideText}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Revert back to default text"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTextEditor(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Close Editor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
                placeholder="e.g. FESTIVAL OF LIGHTS / SPECIAL HIGHLIGHT"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
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
                placeholder="e.g. Deepavali / Precision in Every Detail"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2] font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Subheadline / Angle
            </label>
            <input
              type="text"
              value={currentSlide.subheadline || ''}
              onChange={(e) => updateSlideField('subheadline', e.target.value)}
              placeholder="e.g. Warm Community Unity & Shared Harmony (Wa)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
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
              placeholder="e.g. May the divine light illuminate your path with joy, wisdom & prosperity..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2] resize-none"
            />
          </div>
        </div>
      )}

      {/* Visual Asset Customizer & Photo Chooser Bar */}
      <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {/* Asset Category Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveAssetTab('official')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeAssetTab === 'official'
                  ? 'bg-[#0f2ea2] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Official Brother SG Assets ({OFFICIAL_BROTHER_ASSETS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveAssetTab('festive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeAssetTab === 'festive'
                  ? 'bg-[#0f2ea2] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Cultural & Event Photography
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* AI Model Selector */}
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline">
                Model:
              </label>
              <select
                value={selectedAiModel}
                onChange={(e) => {
                  setSelectedAiModel(e.target.value);
                  safeSetItem('model_gemini_image', e.target.value);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2ea2] cursor-pointer"
                title="Select Google AI model for image synthesis"
              >
                <option value="gemini-3.1-flash-image">gemini-3.1-flash-image</option>
                <option value="gemini-3-pro-image">gemini-3-pro-image</option>
                <option value="gemini-2.5-flash-image">gemini-2.5-flash-image</option>
                <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image</option>
              </select>
            </div>

            {/* Native HTML File Upload Label (100% reliable across all browsers) */}
            <label
              htmlFor="brother-photo-upload"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
              title="Upload an image from your device"
            >
              <Upload className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
              <span>Upload Photo</span>
              <input
                id="brother-photo-upload"
                type="file"
                accept="image/*"
                onChange={handleUploadPhoto}
                className="sr-only"
              />
            </label>

            {/* Generate with Gemini AI Button (triggers confirmation modal) */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isAiGenerating}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#0f2ea2] to-blue-700 hover:from-[#0c2480] hover:to-blue-800 px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Generate tailored editorial photo using Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiGenerating ? 'Generating...' : 'Generate with Gemini AI'}</span>
            </button>
          </div>
        </div>

        {aiError && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-medium truncate">
                {typeof aiError === 'string' ? aiError : aiError.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAiError(null)}
              className="text-[11px] font-bold px-2 py-1 rounded text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/60 cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Custom Uploaded Photo Indicator Banner */}
        {customPhotoUrl && (
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border-2 border-[#0f2ea2] shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={customPhotoUrl}
                alt="Custom Uploaded"
                className="w-12 h-12 rounded-lg object-cover border border-[#0f2ea2]/40 shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Custom Uploaded Photo Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Now active on the slide canvas and will be exported in downloaded PNGs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label
                htmlFor="brother-photo-upload"
                className="px-2.5 py-1 text-xs font-bold text-[#0f2ea2] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg cursor-pointer transition-colors"
              >
                Replace
              </label>
              <button
                type="button"
                onClick={() => {
                  setCustomPhotoUrl('');
                  setSelectedPhotoUrl(OFFICIAL_BROTHER_ASSETS[0]?.url || '');
                }}
                className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                title="Remove custom photo and revert to official presets"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Thumbnail Gallery based on active tab */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {(activeAssetTab === 'official' ? OFFICIAL_BROTHER_ASSETS : festivePresets).map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => {
                setSelectedPhotoUrl(asset.url);
                setCustomPhotoUrl('');
              }}
              className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-slate-900 ${
                currentPhoto === asset.url
                  ? 'border-[#0f2ea2] ring-2 ring-[#0f2ea2]/30 shadow-md'
                  : 'border-transparent hover:border-slate-400 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={asset.thumb}
                alt={asset.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[9px] text-white font-medium truncate">
                {asset.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gemini AI Token Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#0f2ea2] dark:text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Generate Photo with Gemini AI
                  </h4>
                  <p className="text-[11px] text-slate-500">Google Gemini Visual Synthesis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Gemini Token Notice
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                By clicking <strong>Continue</strong>, you understand that generating this custom image will consume tokens from your linked Google Gemini API account.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Selected AI Model:
              </label>
              <select
                value={selectedAiModel}
                onChange={(e) => {
                  setSelectedAiModel(e.target.value);
                  safeSetItem('model_gemini_image', e.target.value);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2] cursor-pointer"
              >
                <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (Fast Creative Vision)</option>
                <option value="gemini-3-pro-image">gemini-3-pro-image (Advanced Creative Studio)</option>
                <option value="gemini-2.5-flash-image">gemini-2.5-flash-image (Fast Multimodal)</option>
                <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (Lite Efficiency)</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              If you prefer not to use tokens, you can cancel to select from Brother&apos;s photo library at zero token cost.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setActiveAssetTab('official');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                Cancel (Use Photo Library)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleAiGenerate();
                }}
                className="px-4 py-2 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2480] text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
