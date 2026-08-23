import React, { useState } from 'react';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  Calendar, 
  Globe2, 
  ShieldCheck,
  Tag,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdCard({ ad, advertiser, isDark, onBookmark, isBookmarked }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyAdCopy = () => {
    navigator.clipboard.writeText(`${ad.headline}\n\n${ad.primaryText}`);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const copyDirectLink = () => {
    navigator.clipboard.writeText(ad.ctaUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const isLongText = ad.primaryText.length > 220;
  const displayText = !isExpanded && isLongText 
    ? `${ad.primaryText.slice(0, 220)}...` 
    : ad.primaryText;

  return (
    <div className={`rounded-2xl border transition-all duration-200 hover:shadow-xl flex flex-col overflow-hidden ${
      isDark
        ? 'bg-[#111625] border-slate-800/80 hover:border-slate-700'
        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
    }`}>
      {/* 1. Header: Advertiser Info & Metadata */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-start justify-between gap-3">
          {/* Company Avatar & Name */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={advertiser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(advertiser.name)}&background=0A66C2&color=fff`}
              alt={advertiser.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 shadow-xs"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm sm:text-base font-bold truncate text-slate-900 dark:text-white">
                  {advertiser.name}
                </h4>
                {advertiser.verified && (
                  <ShieldCheck className="w-4 h-4 text-[#0A66C2] shrink-0" title="Verified Advertiser" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {advertiser.industry || 'Technology & Business'} • {advertiser.followers || 'Global'}
              </p>
            </div>
          </div>

          {/* Status Badge & Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {ad.status || 'Active'}
            </span>
            <button
              type="button"
              onClick={() => onBookmark && onBookmark(ad.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                  : isDark
                  ? 'border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Save Ad to Watchlist'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Ad Transparency Specs Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/40 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Started running <strong>{ad.startedDate}</strong></span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <div className="flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Targeting:</span>
            <div className="flex items-center gap-1">
              {(ad.targeting || ['SG']).map(code => (
                <span key={code} className="px-1.5 py-0.2 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                  {code}
                </span>
              ))}
            </div>
          </div>

          <span className="text-slate-300 dark:text-slate-700">•</span>

          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{ad.format}</span>
          </div>

          <span className="ml-auto font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-sm">
            ID: {ad.id}
          </span>
        </div>
      </div>

      {/* 2. Ad Copy Text */}
      <div className="p-4 sm:p-5 flex-1">
        <p className="text-sm leading-relaxed whitespace-pre-line text-slate-800 dark:text-slate-200">
          {displayText}
        </p>
        {isLongText && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-[#0A66C2] hover:underline mt-1.5 block cursor-pointer"
          >
            {isExpanded ? '... see less' : '... see more'}
          </button>
        )}

        {ad.campaignType && (
          <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0A66C2] dark:text-blue-300 text-[11px] font-medium border border-blue-100 dark:border-blue-900/50">
            <Sparkles className="w-3 h-3" />
            <span>Theme: {ad.campaignType}</span>
          </div>
        )}
      </div>

      {/* 3. Media Creative (Single Image / Carousel / Video) */}
      <div className="relative bg-slate-100 dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
        {ad.format === 'Carousel' && ad.carouselCards && (
          <div className="relative group">
            {/* Carousel Slide */}
            <div className="aspect-16/10 relative overflow-hidden">
              <img
                src={ad.carouselCards[activeSlide]?.image}
                alt={ad.carouselCards[activeSlide]?.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  Card {activeSlide + 1} of {ad.carouselCards.length}
                </span>
                <h5 className="font-bold text-sm sm:text-base leading-snug">
                  {ad.carouselCards[activeSlide]?.title}
                </h5>
                <p className="text-xs text-slate-200 mt-0.5">
                  {ad.carouselCards[activeSlide]?.subtitle}
                </p>
              </div>
            </div>

            {/* Navigation Chevrons */}
            {activeSlide > 0 && (
              <button
                type="button"
                onClick={() => setActiveSlide(activeSlide - 1)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center backdrop-blur-xs transition-colors shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {activeSlide < ad.carouselCards.length - 1 && (
              <button
                type="button"
                onClick={() => setActiveSlide(activeSlide + 1)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center backdrop-blur-xs transition-colors shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Slide Indicator Dots */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-full backdrop-blur-xs">
              {ad.carouselCards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    activeSlide === idx ? 'w-4 bg-blue-400' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {ad.format === 'Video' && (
          <div className="aspect-16/10 relative group overflow-hidden cursor-pointer">
            <img
              src={ad.mediaUrl}
              alt={ad.headline}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 flex items-center justify-center transition-colors">
              <div className="w-14 h-14 rounded-full bg-[#0A66C2]/90 text-white flex items-center justify-center shadow-2xl pl-1 group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-white" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/75 text-white text-[11px] font-mono font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
              {ad.videoDuration || '0:30'} • Video Ad
            </div>
          </div>
        )}

        {ad.format === 'Single Image' && (
          <div className="aspect-16/10 relative overflow-hidden group">
            <img
              src={ad.mediaUrl}
              alt={ad.headline}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* 4. CTA Destination Banner */}
      <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
      }`}>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {ad.description || 'sponsored destination'}
          </p>
          <h5 className="text-sm font-bold truncate mt-0.5 text-slate-900 dark:text-white" title={ad.headline}>
            {ad.headline}
          </h5>
        </div>

        <a
          href={ad.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs transition-all shadow-xs shrink-0 bg-[#0A66C2] hover:bg-[#004182] text-white cursor-pointer"
        >
          <span>{ad.ctaText || 'Learn more'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 5. Card Footer Utility Tools */}
      <div className={`p-3 px-4 flex items-center justify-between text-xs ${
        isDark ? 'bg-[#0E1320] text-slate-400' : 'bg-white text-slate-500'
      }`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={copyAdCopy}
            className="inline-flex items-center gap-1 hover:text-[#0A66C2] transition-colors cursor-pointer"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'Copied Ad Copy' : 'Copy Copy'}</span>
          </button>

          <button
            type="button"
            onClick={copyDirectLink}
            className="inline-flex items-center gap-1 hover:text-[#0A66C2] transition-colors cursor-pointer"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copied URL' : 'Share Link'}</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400">
          Est. reach: <strong>{ad.impressionsEstimate || '10k - 25k'}</strong>
        </span>
      </div>
    </div>
  );
}
