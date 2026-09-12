import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, Copy, Check, Download, ArrowRight, Flame, Layers, ExternalLink, RefreshCw, AlertCircle, Database, CheckCircle2, Globe } from 'lucide-react';
import { generateBrotherWebsiteBannerSVG } from '../lib/svgBrotherWebsiteTemplates.js';
import { safeGetItem } from '../lib/storage.js';

export default function Module1EventPosts({ isDark, onNavigateToDraftStudio }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [momSource, setMomSource] = useState('loading');
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // SVG Customization
  const [customBadge, setCustomBadge] = useState('Celebrate SG Special');
  const [customHeadline, setCustomHeadline] = useState('Singapore National Day');
  const [customSubtitle, setCustomSubtitle] = useState('Honoring unity, resilience & innovation');

  // Notion Database Storage State
  const [notionSyncing, setNotionSyncing] = useState(false);
  const [notionStatus, setNotionStatus] = useState('');
  const [notionPageUrl, setNotionPageUrl] = useState(null);

  const fetchHolidays = async (year = selectedYear, refresh = false) => {
    setLoadingHolidays(true);
    try {
      const res = await fetch(`/api/mom/holidays?year=${year}${refresh ? '&refresh=true' : ''}`);
      const data = await res.json();
      if (data.success && data.holidays?.length > 0) {
        setHolidays(data.holidays);
        setMomSource(data.source);
        const first = data.holidays[0];
        setSelectedOccasion(first);
        setCustomBadge(first.badgeText);
        setCustomHeadline(first.name);
        setCustomSubtitle(first.subtitle);
      }
    } catch (err) {
      console.warn('Failed to fetch MOM holidays:', err);
      setMomSource('offline_fallback');
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    fetchHolidays(selectedYear);
  }, [selectedYear]);

  const handleSelectOccasion = (h) => {
    setSelectedOccasion(h);
    setSelectedDraftIndex(0);
    setCustomBadge(h.badgeText);
    setCustomHeadline(h.name);
    setCustomSubtitle(h.subtitle);
  };

  const handleSaveToNotionDatabase = async () => {
    const token = (safeGetItem('notion_token') || '').trim();
    const explicitDb = (safeGetItem('notion_database_id') || '').trim();
    const dbId = explicitDb || '3c701136de4881de9d29ca4ea415e856';

    if (!token) {
      alert('Please configure your Notion Integration Token in Settings or Notion Hub first.');
      return;
    }

    if (!selectedOccasion) return;

    setNotionSyncing(true);
    setNotionStatus('Persisting post draft into Notion Posts Database...');
    setNotionPageUrl(null);

    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          databaseId: dbId,
          post: {
            title: `${selectedOccasion.name} ${selectedOccasion.year || 2026}`,
            date: selectedOccasion.date,
            category: 'Festive & Cultural',
            status: 'Draft',
            author: 'Allan Cheng',
            draft1: drafts[0].post,
            draft2: drafts[1].post,
            rationale: drafts[0].whyThisWorks,
            sourceContext: `MOM Singapore Public Holiday: ${selectedOccasion.name}\nOfficial Date: ${selectedOccasion.date}\nCultural Significance: ${selectedOccasion.culturalContext}\nHashtags: ${(selectedOccasion.suggestedHashtags || []).join(' ')}\nSource: ${selectedOccasion.source || 'Ministry of Manpower'}`
          }
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save to Notion database');
      }

      setNotionPageUrl(data.url);
      setNotionStatus('✅ Saved as Draft in Notion Database! Notion will serve as the database record.');
    } catch (err) {
      setNotionStatus(`❌ Error: ${err.message}`);
    } finally {
      setNotionSyncing(false);
    }
  };

  const drafts = selectedOccasion ? [
    {
      id: "opt-1",
      name: "Warm Community Unity & Shared Pride (Wa Harmony)",
      whyThisWorks: "Employs high Hofstede Harmony (*Wa*) and multiracial Singaporean pride. Opens with an energetic greeting, connects cultural resilience with Brother's 'At your side' ethos, and ends with an authentic communal question.",
      post: `Happy ${selectedOccasion.name}! 🇸🇬✨\n\nAs we celebrate this milestone across Singapore, we reflect on what makes our community extraordinary — unity, resilience, and the relentless drive to innovate for the future.\n\nAt Brother Singapore, our commitment to standing 'At your side' is inspired by the vibrant spirit of our island nation. From local SMEs to multinational enterprises, we are honored to walk alongside Singapore's growth journey every single day.\n\nWishing all our partners, clients, and colleagues a wonderful ${selectedOccasion.name} with your loved ones! 🎉\n\nTo everyone celebrating, what is your team's favorite tradition today? Share with us below! 👇\n\n${(selectedOccasion.suggestedHashtags || []).join(' ')}`
    },
    {
      id: "opt-2",
      name: "Craftsmanship, Kaizen & Long-Term Purpose",
      whyThisWorks: "Bridges Japanese craftsmanship (*Kaizen* / precision) with Singapore's Long-Term Orientation (LTO). Connects cultural values of dedication and excellence with sustainable enterprise growth.",
      post: `Beyond the celebrations, ${selectedOccasion.name} reminds us of the enduring power of strong foundations and shared purpose. 🌿\n\nIn both nation-building and business, true progress is achieved when precision meets human-centered care.\n\nAt Brother Singapore, we channel this philosophy into everything we build — delivering reliable technologies that empower workplaces while staying deeply rooted in sustainable community trust.\n\nMay this season inspire fresh breakthroughs, enduring partnerships, and renewed strength for the road ahead. 🤝\n\nWishing you a joyful and meaningful ${selectedOccasion.name}.\n\n${(selectedOccasion.suggestedHashtags || []).join(' ')} #Kaizen #WorkplaceExcellence #SustainabilityInAction`
    },
    {
      id: "opt-3",
      name: "Internal Team Culture & Festive Behind-the-Scenes",
      whyThisWorks: "Employer branding focus. Highlights the multicultural harmony and inclusive workplace culture within the Brother Singapore family, engaging both prospective candidates and current staff.",
      post: `The festive energy is in full swing across our Brother Singapore office for ${selectedOccasion.name}! 🎉🇸🇬\n\nFrom sharing festive treats to reflecting on team achievements, moments like these showcase the incredible diverse talent that drives our business forward.\n\nWhen our people are supported, empowered, and celebrated, extraordinary things happen. A big thank you to our entire Brother family for bringing energy, warmth, and dedication to work every day!\n\nHow is your workplace celebrating ${selectedOccasion.name} this week? Let us know in the comments! 💬\n\n${(selectedOccasion.suggestedHashtags || []).join(' ')} #LifeAtBrother #PeopleFirst #TeamBrotherSG`
    }
  ] : [];

  const currentDraft = drafts[selectedDraftIndex] || drafts[0];

  const bannerSvg = selectedOccasion ? generateBrotherWebsiteBannerSVG({
    badgeText: customBadge,
    headline: customHeadline,
    subtitle: customSubtitle,
    theme: selectedOccasion.theme || 'national-day'
  }) : '';

  const handleCopy = () => {
    if (currentDraft?.post) {
      navigator.clipboard.writeText(currentDraft.post);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSvg = () => {
    if (!bannerSvg) return;
    const blob = new Blob([bannerSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brother-sg-${selectedOccasion?.id || 'event'}-banner.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5 sm:mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Festive & Event Content Generator
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                momSource === 'live_mom_gov_sg'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
              }`}>
                <Globe className="w-3 h-3" />
                <span>MOM Live API ({momSource === 'live_mom_gov_sg' ? 'Live mom.gov.sg' : 'Official Cache'})</span>
              </div>
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Ministry of Manpower Singapore Public Holidays
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Parsed directly via <code className="text-[11px] font-mono text-[#0f2ea2] dark:text-blue-400">/api/mom/holidays</code> from official MOM records. Generates 3 strategic Brother SG copy angles and high-res vector banners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => fetchHolidays(selectedYear, true)}
              disabled={loadingHolidays}
              title="Scrape latest updates directly from Ministry of Manpower website"
              className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHolidays ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh MOM</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Post'}
            </button>
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              SVG Banner
            </button>
          </div>
        </div>

        {/* Year Filter Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Calendar Year:</span>
          {['2025', '2026', '2027', 'all'].map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedYear === y
                  ? 'bg-[#0f2ea2] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {y === 'all' ? 'All Years' : y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: MOM Occasions List */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-3.5 sm:p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                MOM Holidays ({holidays.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">T-10 Alerts Active</span>
            </div>

            {loadingHolidays ? (
              <div className="p-8 text-center space-y-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0f2ea2]" />
                <p className="text-xs">Querying Ministry of Manpower API...</p>
              </div>
            ) : (
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-none lg:max-h-[520px] pb-2 lg:pb-0 pr-1 custom-scrollbar">
                {holidays.map((h) => {
                  const isSelected = selectedOccasion?.id === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() => handleSelectOccasion(h)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all shrink-0 lg:shrink w-64 lg:w-full ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#0f2ea2] dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                          : isDark
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold line-clamp-1 ${isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'}`}>
                          {h.name}
                        </span>
                        {h.isUrgent ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1 shrink-0">
                            <Flame className="w-2.5 h-2.5" /> Due (T-10)
                          </span>
                        ) : h.daysRemaining >= 0 ? (
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{h.daysRemaining}d</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">Passed</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>{new Date(h.date).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[110px]">{h.day}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Drafts & Brother SG Website Banner Preview */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {selectedOccasion && (
            <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 sm:space-y-5 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              {/* Notion Database Save & Bridge Bar */}
              <div className="p-3.5 rounded-xl border bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0f2ea2] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Notion Relational Database</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300 font-bold">
                        Database Only
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      {notionStatus || "Save this generated post draft directly into your Notion Posts Database."}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {notionPageUrl && (
                    <a
                      href={notionPageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                      <span>View in Notion</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={handleSaveToNotionDatabase}
                    disabled={notionSyncing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f2ea2] hover:bg-[#004b8f] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${notionSyncing ? 'animate-spin' : ''}`} />
                    <span>{notionSyncing ? 'Saving to Notion...' : 'Save Draft to Notion DB'}</span>
                  </button>
                  {onNavigateToDraftStudio && currentDraft && (
                    <button
                      onClick={() => onNavigateToDraftStudio(currentDraft.post, `${selectedOccasion.name} ${selectedOccasion.year || 2026}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <span>Open in Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Draft Angle Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3.5 dark:border-slate-800">
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-[#0f2ea2] dark:text-blue-400 font-bold uppercase tracking-wider block">
                    Post Angle {selectedDraftIndex + 1} of 3 • {selectedOccasion.name}
                  </span>
                  <h3 className={`text-sm sm:text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {currentDraft?.name}
                  </h3>
                </div>

                {/* Draft Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-800 self-start sm:self-auto">
                  {drafts.map((d, idx) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDraftIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedDraftIndex === idx
                          ? 'bg-[#0f2ea2] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Angle {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Why This Works */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-xl p-3 sm:p-3.5">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-[#0f2ea2] dark:text-blue-300">Strategic Rationale: </strong>
                    {currentDraft?.whyThisWorks}
                  </p>
                </div>
              </div>

              {/* Generated Post Content */}
              <div className="relative">
                <div className={`p-3.5 sm:p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border custom-scrollbar ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {currentDraft?.post}
                </div>
              </div>

              {/* Live Rendered Brother Website Hero Banner Graphic */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0f2ea2] dark:text-blue-400" />
                    Official Brother SG Hero Banner Graphic (SVG)
                  </h4>
                  <span className="text-[10px] font-mono text-[#0f2ea2] dark:text-blue-400">1200 × 500 Responsive</span>
                </div>

                <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
                  <div 
                    className="w-full aspect-[12/5] flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: bannerSvg }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
