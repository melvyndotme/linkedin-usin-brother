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
  Tag
} from 'lucide-react';
import { 
  OFFICIAL_BROTHER_ASSETS,
  CURATED_EVENT_PHOTOS, 
  getPhotoCategoryForOccasion, 
  generateCarouselSlideSeries, 
  renderSlideToCanvas 
} from '../lib/imageTemplateEngine.js';
import { safeGetItem } from '../lib/storage.js';

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

  const fileInputRef = useRef(null);

  // Determine photo theme category based on current occasion
  const photoCategory = useMemo(() => {
    return getPhotoCategoryForOccasion(occasion);
  }, [occasion]);

  const festivePresets = useMemo(() => {
    return CURATED_EVENT_PHOTOS[photoCategory] || CURATED_EVENT_PHOTOS['corporate'];
  }, [photoCategory]);

  // Set default photo when occasion changes
  useEffect(() => {
    // If it's a promotion or custom hardware campaign, default to official Brother assets
    if (occasion?.eventType === 'promotion' || occasion?.theme === 'red') {
      setActiveAssetTab('official');
      setSelectedPhotoUrl(OFFICIAL_BROTHER_ASSETS[0]?.url || '');
    } else if (festivePresets && festivePresets.length > 0) {
      setActiveAssetTab('official');
      setSelectedPhotoUrl(OFFICIAL_BROTHER_ASSETS[0]?.url || festivePresets[0].url);
    }
  }, [occasion, festivePresets]);

  // Generate 5-slide series
  const slides = useMemo(() => {
    return generateCarouselSlideSeries(occasion, activeDraft);
  }, [occasion, activeDraft]);

  const currentSlide = slides[activeSlideIndex] || slides[0];

  // Active photo URL
  const currentPhoto = customPhotoUrl || selectedPhotoUrl || OFFICIAL_BROTHER_ASSETS[0]?.url;

  // Handle slide navigation
  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  // Handle file upload
  const handleUploadPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setCustomPhotoUrl(objectUrl);
    }
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
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
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
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occasionName: occasion?.name,
          theme: occasion?.theme,
          aspectRatio,
          apiKey: clientKey || undefined
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setCustomPhotoUrl(data.imageUrl);
      } else {
        setAiError(data.error || 'Gemini Imagen is currently unavailable. Using curated high-res photo.');
      }
    } catch (err) {
      setAiError(err.message || 'Network error connecting to AI image generator.');
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

        {/* Format Selector: 1:1 Square vs 1.91:1 Banner */}
        <div className="flex items-center gap-2 flex-wrap">
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
            {slides.map((slide, idx) => (
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
            src={currentPhoto}
            alt={currentSlide.headline}
            className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
            crossOrigin="anonymous"
          />

          {/* Cinematic Scrim & Brother Gradient Overlay */}
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            aspectRatio === '1.91:1'
              ? 'bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/30'
              : 'bg-gradient-to-b from-slate-950/65 via-slate-950/85 to-slate-950/95'
          }`} />

          {/* Signature Brother Blue Accent Edge */}
          <div className={`absolute ${aspectRatio === '1.91:1' ? 'left-0 top-0 bottom-0 w-2.5' : 'top-0 left-0 right-0 h-2.5'} bg-[#0f2ea2] shadow-lg`} />

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
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] font-mono font-bold text-sky-400">
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

            {/* Bottom Footer: Official Channel & Category Note */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>{currentSlide.footerText}</span>
              <span className="text-sky-400 hidden sm:inline font-semibold">brother.com.sg</span>
            </div>
          </div>
        </div>
      </div>

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

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadPhoto}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isAiGenerating}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 transition-all cursor-pointer disabled:opacity-50"
              title="Generate tailored editorial photo using Gemini Imagen 3"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{isAiGenerating ? 'AI Generating...' : 'AI Generate Photo'}</span>
            </button>
          </div>
        </div>

        {aiError && (
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            {aiError}
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
    </div>
  );
}
