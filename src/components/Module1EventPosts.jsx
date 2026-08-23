import React, { useState } from 'react';
import { Calendar, Sparkles, Copy, Check, Download, Eye, ArrowRight, ShieldCheck, Flame, Layers } from 'lucide-react';
import { HOLIDAYS_2026_ONWARDS, get2026HolidaysWithDays } from '../lib/momCalendar2026.js';
import { generateBrotherWebsiteBannerSVG } from '../lib/svgBrotherWebsiteTemplates.js';

export default function Module1EventPosts({ isDark }) {
  const holidays = get2026HolidaysWithDays(new Date("2026-08-23"));
  const [selectedOccasion, setSelectedOccasion] = useState(holidays[0]); // National Day default
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [customBadge, setCustomBadge] = useState("Celebrate SG Special");
  const [customHeadline, setCustomHeadline] = useState("Singapore National Day");
  const [customSubtitle, setCustomSubtitle] = useState("Honoring 61 years of unity, resilience & innovation");

  // When occasion changes, update defaults
  const handleSelectOccasion = (h) => {
    setSelectedOccasion(h);
    setSelectedDraftIndex(0);
    setCustomBadge(h.badgeText);
    setCustomHeadline(h.name);
    setCustomSubtitle(h.subtitle);
  };

  // Drafts for 2026 occasion
  const drafts = [
    {
      id: "opt-1",
      name: "Warm Community Unity & Shared Pride",
      whyThisWorks: "Employs high Hofstede Harmony (*Wa*) and multiracial Singaporean pride. Opens with an energetic greeting, connects cultural resilience with Brother's 'At your side' ethos, and ends with an authentic communal question.",
      post: `Happy ${selectedOccasion.name}! 🇸🇬✨

As we celebrate this milestone across Singapore, we reflect on what makes our community extraordinary — unity, resilience, and the relentless drive to innovate for the future.

At Brother Singapore, our commitment to standing 'At your side' is inspired by the vibrant spirit of our island nation. From local SMEs to multinational enterprises, we are honored to walk alongside Singapore's growth journey every single day.

Wishing all our partners, clients, and colleagues a wonderful ${selectedOccasion.name} with your loved ones! 🎉

To everyone celebrating, what is your team's favorite tradition today? Share with us below! 👇

${selectedOccasion.suggestedHashtags.join(' ')}`
    },
    {
      id: "opt-2",
      name: "Craftsmanship, Kaizen & Long-Term Vision",
      whyThisWorks: "Bridges Japanese craftsmanship (*Kaizen* / precision) with Singapore's Long-Term Orientation (LTO). Connects cultural values of dedication and excellence with sustainable enterprise growth.",
      post: `Beyond the celebrations, ${selectedOccasion.name} reminds us of the enduring power of strong foundations and shared purpose. 🌿

In both nation-building and business, true progress is achieved when precision meets human-centered care. 

At Brother Singapore, we channel this philosophy into everything we build — delivering reliable technologies that empower workplaces while staying deeply rooted in sustainable community trust.

May this season inspire fresh breakthroughs, enduring partnerships, and renewed strength for the road ahead. 🤝

Wishing you a joyful and meaningful ${selectedOccasion.name}.

${selectedOccasion.suggestedHashtags.join(' ')} #Kaizen #WorkplaceExcellence #SustainabilityInAction`
    },
    {
      id: "opt-3",
      name: "Internal Team Culture & Festive Behind-the-Scenes",
      whyThisWorks: "Employer branding focus. Highlights the multicultural harmony and inclusive workplace culture within the Brother Singapore family, engaging both prospective candidates and current staff.",
      post: `The festive energy is in full swing across our Brother Singapore office for ${selectedOccasion.name}! 🎉🇸🇬

From sharing festive treats to reflecting on team achievements, moments like these showcase the incredible diverse talent that drives our business forward.

When our people are supported, empowered, and celebrated, extraordinary things happen. A big thank you to our entire Brother family for bringing energy, warmth, and dedication to work every day!

How is your workplace celebrating ${selectedOccasion.name} this week? Let us know in the comments! 💬

${selectedOccasion.suggestedHashtags.join(' ')} #LifeAtBrother #PeopleFirst #TeamBrotherSG`
    }
  ];

  const currentDraft = drafts[selectedDraftIndex] || drafts[0];

  const bannerSvg = generateBrotherWebsiteBannerSVG({
    badgeText: customBadge,
    headline: customHeadline,
    subtitle: customSubtitle,
    theme: selectedOccasion.theme
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDraft.post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([bannerSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brother-sg-${selectedOccasion.id}-banner.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0f2ea2]/10 text-[#0f2ea2] text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              Module 1: Festive & Event Posts (2026 Onwards)
            </div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Singapore Public Holidays & Festive Occasions Engine
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active schedule for 2026 (National Day onwards). Automatically generates 3 tailored drafts + Brother website-style promotion banners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-[#0f2ea2] hover:bg-[#004b8f] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Post' : 'Copy Post Text'}
            </button>
            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Banner SVG
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 2026 Occasion List */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              2026 Occasions (National Day Onwards)
            </h3>
            <div className="space-y-2">
              {holidays.map((h) => {
                const isSelected = selectedOccasion.id === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => handleSelectOccasion(h)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#0f2ea2] dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                        : isDark
                          ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'}`}>
                        {h.name}
                      </span>
                      {h.isUrgent ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" /> T-10 Due
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">{h.daysRemaining}d</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{new Date(h.date).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-[10px] text-slate-400">{h.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Drafts & Brother SG Website Banner Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`p-6 rounded-2xl border space-y-5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {/* Draft Angle Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-[#0f2ea2] font-bold uppercase tracking-wider">
                  AI Multi-Draft Engine • {selectedOccasion.name}
                </span>
                <h3 className={`text-base font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentDraft.name}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border dark:border-slate-800">
                {drafts.map((d, idx) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDraftIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDraftIndex === idx
                        ? 'bg-[#0f2ea2] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Draft {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Why This Works Banner */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-500/30 rounded-xl p-3.5">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#0f2ea2] dark:text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-[#0f2ea2] dark:text-blue-300">Why this draft works: </strong>
                  {currentDraft.whyThisWorks}
                </p>
              </div>
            </div>

            {/* Generated Post Content */}
            <div className="relative">
              <div className={`p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto border ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                {currentDraft.post}
              </div>
            </div>

            {/* Live Rendered Brother Website Hero Banner Graphic */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#0f2ea2]" />
                  Paired Brother SG Website Banner Template (From Screenshot Reference)
                </h4>
                <span className="text-[10px] font-mono text-[#0f2ea2]">1200 × 500 Responsive Vector</span>
              </div>

              <div 
                className="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 max-h-[300px] flex items-center justify-center bg-slate-950"
                dangerouslySetInnerHTML={{ __html: bannerSvg }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
