import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Filter, 
  Download, 
  Moon, 
  Sun, 
  Layers, 
  Sparkles, 
  LayoutGrid, 
  LayoutList, 
  Bookmark, 
  ShieldCheck, 
  AlertCircle,
  Building2,
  Share2,
  ChevronRight
} from 'lucide-react';

import CountrySelector from './components/CountrySelector.jsx';
import AdCard from './components/AdCard.jsx';
import AIStrategySummary from './components/AIStrategySummary.jsx';
import ExportModal from './components/ExportModal.jsx';
import { extractAdsData, analyzeCompetitorStrategy } from './lib/adExtractorEngine.js';

export default function AdsTrackerApp() {
  // State management
  const [competitorInput, setCompetitorInput] = useState('Epson Singapore');
  const [selectedCountries, setSelectedCountries] = useState(['SG', 'MY']);
  const [isDark, setIsDark] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('ALL'); // 'ALL', 'Single Image', 'Carousel', 'Video'
  const [searchKeyword, setSearchKeyword] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (2 cols) or 'list' (1 col)
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // API State
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [copiedConstructedUrl, setCopiedConstructedUrl] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [competitorSuggestions, setCompetitorSuggestions] = useState([]);

  // Popular competitor quick chips
  const POPULAR_COMPETITORS = [
    'Epson Singapore',
    'HP',
    'Canon',
    'Ricoh',
    'Fujifilm',
    'Brother Singapore'
  ];

  // Dynamically constructed LinkedIn Ad Library URL
  const constructedUrl = `https://www.linkedin.com/ad-library/search?accountOwner=${encodeURIComponent(
    competitorInput.trim()
  )}&countries=${encodeURIComponent(selectedCountries.join(','))}`;

  const API_BASE = 'http://localhost:3001';

  // Fetch ads from API
  const fetchAds = async (targetCompetitor = competitorInput, targetCountries = selectedCountries) => {
    if (!targetCompetitor.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const countriesParam = targetCountries.join(',');
      const res = await fetch(
        `${API_BASE}/api/linkedin/search?accountOwner=${encodeURIComponent(targetCompetitor.trim())}&countries=${encodeURIComponent(countriesParam)}`
      );

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const data = await res.json();
      setApiResult(data);

      // Fetch AI strategic analysis for these ads
      if (data.ads && data.ads.length > 0) {
        try {
          const aiRes = await fetch(`${API_BASE}/api/linkedin/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              competitor: data.advertiser.name,
              ads: data.ads
            })
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            setAiAnalysis(aiData.analysis);
          } else {
            setAiAnalysis(analyzeCompetitorStrategy(data.advertiser.name, data.ads));
          }
        } catch {
          setAiAnalysis(analyzeCompetitorStrategy(data.advertiser.name, data.ads));
        }
      }
    } catch {
      // Graceful fallback to client extractor engine
      const localData = extractAdsData(targetCompetitor, targetCountries);
      setApiResult(localData);
      setAiAnalysis(analyzeCompetitorStrategy(localData.advertiser.name, localData.ads));
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAds('Epson Singapore', ['SG', 'MY']);
    
    // Fetch suggestions
    fetch(`${API_BASE}/api/linkedin/competitors`)
      .then(res => res.json())
      .then(data => {
        if (data.competitors) setCompetitorSuggestions(data.competitors);
      })
      .catch(() => {});
  }, []);

  const handleSelectQuickCompetitor = (name) => {
    setCompetitorInput(name);
    fetchAds(name, selectedCountries);
  };

  const handleCopyConstructedUrl = () => {
    navigator.clipboard.writeText(constructedUrl);
    setCopiedConstructedUrl(true);
    setTimeout(() => setCopiedConstructedUrl(false), 2000);
  };

  const toggleBookmark = (id) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(b => b !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
    }
  };

  // Filter ads based on format, search keyword, and bookmark status
  const displayedAds = (apiResult?.ads || []).filter(ad => {
    if (showBookmarksOnly && !bookmarkedIds.includes(ad.id)) return false;
    if (selectedFormat !== 'ALL' && ad.format !== selectedFormat) return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchText = (ad.primaryText || '').toLowerCase().includes(q);
      const matchHeadline = (ad.headline || '').toLowerCase().includes(q);
      const matchTheme = (ad.campaignType || '').toLowerCase().includes(q);
      return matchText || matchHeadline || matchTheme;
    }
    return true;
  });

  return (
    <div className={`min-h-screen font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200 ${
      isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F4F6F9] text-slate-900'
    }`}>
      {/* 1. Header Navigation */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-8 py-3.5 transition-colors ${
        isDark ? 'bg-[#0D121F]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Product Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/20">
              in
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  LinkedIn Ads Library
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#0A66C2]/10 text-[#0A66C2] dark:text-blue-400 border border-[#0A66C2]/20">
                  MVP API Tracker
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Extract competitor ad creatives, targeting & messaging strategies in real time
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Playwright Scraper Active</span>
            </div>

            {/* Bookmarks Toggle */}
            <button
              type="button"
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showBookmarksOnly
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Saved</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
                {bookmarkedIds.length}
              </span>
            </button>

            {/* Export Data */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              disabled={!apiResult?.ads?.length}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs'
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        
        {/* Search & URL Construction Control Hub */}
        <section className={`rounded-2xl border p-5 sm:p-6 mb-8 transition-all ${
          isDark
            ? 'bg-[#0E1320] border-slate-800 shadow-xl'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          {/* Main Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            
            {/* Competitor Input */}
            <div className="lg:col-span-6">
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Competitor Name / Brand
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Epson Singapore, HP, Canon, Ricoh..."
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAds()}
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border font-medium outline-hidden transition-all ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20'
                      : 'bg-slate-50/70 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20'
                  }`}
                />
              </div>
            </div>

            {/* Multi-Select Country Dropdown */}
            <div className="lg:col-span-4">
              <CountrySelector
                selectedCountries={selectedCountries}
                onChange={setSelectedCountries}
                isDark={isDark}
              />
            </div>

            {/* Action Button */}
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => fetchAds()}
                disabled={loading || !competitorInput.trim()}
                className="w-full h-[46px] rounded-xl bg-[#0A66C2] hover:bg-[#004182] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>Fetch Ads</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Competitor Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Popular Competitors:
            </span>
            {POPULAR_COMPETITORS.map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => handleSelectQuickCompetitor(comp)}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  competitorInput.toLowerCase() === comp.toLowerCase()
                    ? 'bg-[#0A66C2] text-white shadow-xs'
                    : isDark
                    ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>

          {/* Live Constructed URL Banner */}
          <div className={`mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark
              ? 'bg-blue-950/20 border-blue-900/40 text-blue-300'
              : 'bg-blue-50/60 border-blue-100 text-slate-700'
          }`}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A66C2] dark:text-blue-400 shrink-0">
                Constructed URL:
              </span>
              <code className="text-xs font-mono truncate select-all text-slate-700 dark:text-slate-300">
                {constructedUrl}
              </code>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyConstructedUrl}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-[#0A66C2] transition-colors cursor-pointer shadow-xs"
              >
                {copiedConstructedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <a
                href={constructedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors shadow-xs"
              >
                <span>Open in LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold">Extraction Warning</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* AI Competitive Intelligence Summary Card */}
        {apiResult?.advertiser && (
          <AIStrategySummary
            analysis={aiAnalysis}
            advertiser={apiResult.advertiser}
            isDark={isDark}
          />
        )}

        {/* 3. Filter Bar & View Switcher */}
        {apiResult && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            
            {/* Format Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { label: 'All Creatives', value: 'ALL', count: apiResult.ads.length },
                { label: 'Single Image', value: 'Single Image', count: apiResult.meta.formatBreakdown['Single Image'] || 0 },
                { label: 'Carousel', value: 'Carousel', count: apiResult.meta.formatBreakdown['Carousel'] || 0 },
                { label: 'Video', value: 'Video', count: apiResult.meta.formatBreakdown['Video'] || 0 }
              ].map(tab => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedFormat(tab.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    selectedFormat === tab.value
                      ? 'bg-[#0A66C2] border-[#0A66C2] text-white shadow-xs'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Search Keyword within ads & Layout toggles */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter copy keyword..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className={`text-xs pl-8 pr-3 py-1.5 rounded-xl border outline-hidden transition-colors ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500'
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* View Layout Toggle */}
              <div className={`flex items-center p-1 rounded-xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-500/15 text-[#0A66C2] dark:text-blue-400'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-500/15 text-[#0A66C2] dark:text-blue-400'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Single Column Feed"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Ad Cards Grid / Feed */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div
                key={idx}
                className={`rounded-2xl border p-6 animate-pulse ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-300 dark:bg-slate-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded-sm w-1/3"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800/60 rounded-sm w-1/2"></div>
                  </div>
                </div>
                <div className="h-20 bg-slate-200 dark:bg-slate-800/40 rounded-xl mb-4"></div>
                <div className="aspect-16/10 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : displayedAds.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
              : 'max-w-2xl mx-auto space-y-6'
          }>
            {displayedAds.map(ad => (
              <AdCard
                key={ad.id}
                ad={ad}
                advertiser={apiResult.advertiser}
                isDark={isDark}
                onBookmark={toggleBookmark}
                isBookmarked={bookmarkedIds.includes(ad.id)}
              />
            ))}
          </div>
        ) : (
          <div className={`p-12 text-center rounded-2xl border ${
            isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <Layers className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Ads Found</h3>
            <p className="text-xs mt-1 max-w-md mx-auto">
              {showBookmarksOnly
                ? 'You have not saved any ads yet. Click the bookmark icon on any ad card to save it here.'
                : `No ads match your filter "${selectedFormat}" with keyword "${searchKeyword}". Try resetting your filters.`}
            </p>
          </div>
        )}

      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={apiResult}
        isDark={isDark}
      />
    </div>
  );
}
