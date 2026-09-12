import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Sparkles, Copy, Check, Download, ArrowRight, Flame, Layers, ExternalLink, RefreshCw, AlertCircle, Database, CheckCircle2, Plus, Trash2, Tag, X } from 'lucide-react';
import { generateBrotherWebsiteBannerSVG } from '../lib/svgBrotherWebsiteTemplates.js';
import { safeGetItem, safeSetItem } from '../lib/storage.js';

// Pre-seeded starter custom events (Festivals & Promotional Campaigns)
const INITIAL_CUSTOM_EVENTS = [
  {
    id: 'custom-mid-autumn-2026',
    name: 'Mid-Autumn Festival (中秋节)',
    date: '2026-09-25',
    year: '2026',
    day: 'Friday',
    category: 'Cultural Festival',
    eventType: 'cultural',
    badgeText: 'Mid-Autumn Harmony',
    subtitle: 'Celebrating togetherness, reunion & lighting the path forward',
    theme: 'mid-autumn',
    details: 'Full moon celebration, reunion over mooncakes & tea, honoring trusted partnerships and long-term customer relationships.',
    suggestedHashtags: ['#MidAutumnFestival', '#MooncakeFestival', '#Togetherness', '#BrotherSingapore', '#AtYourSide'],
    isCustom: true
  },
  {
    id: 'custom-printer-tradein-2026',
    name: 'Brother Business Printer & Scanner Trade-In',
    date: '2026-10-15',
    year: '2026',
    day: 'Thursday',
    category: 'Promotional Campaign',
    eventType: 'promotion',
    badgeText: 'Trade-In Special',
    subtitle: 'Upgrade office productivity with up to $100 trade-in rebate + 3-year warranty',
    theme: 'promotion',
    details: 'Trade in any brand of old printer or scanner to receive up to $100 cashback and free 3-year on-site warranty on Brother business series.',
    suggestedHashtags: ['#BrotherSingapore', '#PrinterTradeIn', '#WorkplaceProductivity', '#OfficeUpgrade', '#AtYourSide'],
    isCustom: true
  },
  {
    id: 'custom-ewaste-drive-2026',
    name: 'Brother SG E-Waste Recycling & Eco Drive',
    date: '2026-11-20',
    year: '2026',
    day: 'Friday',
    category: 'Sustainability & ESG',
    eventType: 'sustainability',
    badgeText: 'Eco-Conscious SG',
    subtitle: 'Responsible recycling for a cleaner, greener Singapore',
    theme: 'sustainability',
    details: 'Community and SME drop-off initiative for spent toner cartridges and end-of-life hardware, in alignment with SG Green Plan 2030.',
    suggestedHashtags: ['#BrotherEarth', '#SustainabilitySG', '#EWasteRecycling', '#GreenPlan2030', '#AtYourSide'],
    isCustom: true
  }
];

function enrichEventWithDays(evt) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const evtDate = new Date(evt.date);
  evtDate.setHours(0, 0, 0, 0);
  const diffTime = evtDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return {
    ...evt,
    daysRemaining: diffDays,
    isUrgent: diffDays >= 0 && diffDays <= 10
  };
}

function generateEventDrafts(occasion) {
  if (!occasion) return [];

  const name = occasion.name;
  const details = occasion.details || occasion.subtitle || '';
  const hashtags = (occasion.suggestedHashtags || ['#BrotherSingapore', '#AtYourSide']).join(' ');

  // Promotional or Campaign Event
  if (occasion.eventType === 'promotion') {
    return [
      {
        id: 'opt-1',
        name: 'High-ROI Workplace Value & Commercial Savings',
        whyThisWorks: 'Directly addresses SME business owners and procurement leaders looking to optimize operating expenses and boost daily office output with Brother Japanese reliability.',
        post: `Upgrade your business productivity with the ${name}! 🚀🏢\n\n${details ? `${details}\n\n` : ''}In today's fast-paced business environment, reliable printing and document management shouldn't slow your team down. With Brother's business multi-function centres, enjoy ultra-low cost per page, razor-sharp output, and complete peace of mind backed by our dedicated on-site support.\n\n✨ Why Singapore SMEs choose Brother:\n• Dependable Japanese craftsmanship (Kaizen precision)\n• Seamless wireless, mobile & cloud scanning\n• Low running costs with high-yield consumables\n• Comprehensive 3-year warranty protection\n\nEquip your office for success today. Speak to our team or visit an authorized Brother dealer to claim your exclusive privilege! 💼\n\n${hashtags}`
      },
      {
        id: 'opt-2',
        name: 'Workplace Reliability & Zero Downtime (Kaizen Focus)',
        whyThisWorks: 'Emphasizes preventive engineering and hassle-free operation, tapping into the customer desire to eliminate printer breakdowns and office interruptions.',
        post: `A smooth workday starts with tools you can always depend on. ⚙️📄\n\nWhen document bottlenecks happen, business slows down. That's why Brother Singapore is proud to introduce our ${name}.\n\nBuilt on decades of precision engineering, Brother printers and scanners are crafted to work tirelessly beside your team. Whether you're processing bulk contracts, high-resolution presentations, or everyday invoices, our hardware delivers consistent, jam-free speed day after day.\n\n${details ? `💡 Current Campaign Highlight: ${details}\n\n` : ''}Discover how we stand 'At your side' to keep your enterprise moving forward.\n\n${hashtags} #OfficeProductivity #ZeroDowntime #Kaizen`
      },
      {
        id: 'opt-3',
        name: 'Limited-Time Campaign Call-to-Action & Community Prompt',
        whyThisWorks: 'High conversion urgency combined with an interactive engagement question to prompt comments from office managers and decision-makers.',
        post: `Special announcement for our Singapore business community! 📢✨\n\nThe ${name} is officially live!\n\n${details ? `👉 ${details}\n\n` : ''}Don't let legacy hardware drain your company's energy and budget. Take advantage of this limited-time opportunity to modernize your office workspace.\n\n📍 Available across all Brother Singapore authorized dealers and corporate partners.\n\nBusiness owners & office managers: What is the #1 feature you look for when upgrading your workplace printers? Speed, wireless connectivity, or running costs? Drop your thoughts below! 👇\n\n${hashtags} #BusinessUpgrade #SingaporeSME #WorkplaceTech`
      }
    ];
  }

  // Sustainability / CSR Event
  if (occasion.eventType === 'sustainability') {
    return [
      {
        id: 'opt-1',
        name: 'Brother Earth & Green Plan 2030 Commitment',
        whyThisWorks: 'Highlights Brother\'s ESG credentials and environmental stewardship in Singapore, connecting corporate responsibility with customer partnership.',
        post: `Building a greener, more sustainable Singapore starts with everyday workplace choices. 🌿🇸🇬\n\nIn conjunction with ${name}, Brother Singapore is reaffirming our global Brother Earth commitment — working in harmony with nature to reduce carbon footprints across our island nation.\n\n${details ? `${details}\n\n` : ''}Through our cartridge recycling programmes and energy-efficient hardware design, we empower enterprises to meet their ESG goals without compromising performance.\n\nLet's champion sustainability together. How is your organization reducing e-waste this year? Share your initiatives with us! 💬\n\n${hashtags} #BrotherEarth #GreenPlan2030 #EcoAction`
      },
      {
        id: 'opt-2',
        name: 'Circular Economy & Responsible E-Waste Recycling',
        whyThisWorks: 'Educational and actionable post providing clear steps on how corporate partners can recycle consumables and hardware easily.',
        post: `Did you know that recycling spent toner cartridges can divert tons of industrial plastics from our landfills? ♻️💡\n\nAs part of ${name}, we invite all our corporate partners and community members to take part in our circular recycling initiative.\n\n${details ? `📌 Highlight: ${details}\n\n` : ''}At Brother, sustainable design is engineered into every product we build — from recyclable casing materials to ultra-low standby power consumption.\n\nDrop off your spent Brother consumables at our dedicated collection points and be part of the change. Every step counts! 🌱\n\n${hashtags} #CircularEconomy #ZeroWasteSG #AtYourSide`
      },
      {
        id: 'opt-3',
        name: 'Team Green Culture & Workplace Sustainability Action',
        whyThisWorks: 'Employer branding and workplace culture angle showcasing staff participation in environmental initiatives.',
        post: `Our Brother Singapore team taking collective action for our planet! 🌍💚\n\nFor ${name}, our colleagues stepped up to lead our recycling and sustainability efforts across our offices and partner hubs.\n\nCreating positive environmental impact isn't just a corporate policy — it's a core value lived by our people every day.\n\n${details ? `✨ ${details}\n\n` : ''}Thank you to all who joined hands with us! What green habits has your team adopted recently? Tell us below! 👇\n\n${hashtags} #LifeAtBrother #SustainableWorkplace #PeopleFirst`
      }
    ];
  }

  // Cultural Festival (like Mid-Autumn Festival)
  if (occasion.eventType === 'cultural') {
    return [
      {
        id: 'opt-1',
        name: 'Warm Community Unity & Shared Traditions (Wa Harmony)',
        whyThisWorks: 'Employs high Hofstede Harmony (*Wa*) and multiracial Singaporean connection. Celebrates reunion and gratitude, tying back to Brother\'s "At your side" philosophy.',
        post: `Warmest greetings on this joyous ${name}! 🥮🌕✨\n\nAs the full moon shines bright across Singapore, we celebrate the enduring values of reunion, gratitude, and cherished relationships with family, colleagues, and valued partners.\n\n${details ? `${details}\n\n` : ''}At Brother Singapore, standing 'At your side' means being part of your journey through every milestone and festive season. We are grateful for the trust you place in us every day.\n\nWishing you and your loved ones an abundance of joy, peace, and meaningful moments together. Happy ${name}!\n\nWhat is your favorite family or team tradition during this festive season? Share with us below! 👇\n\n${hashtags}`
      },
      {
        id: 'opt-2',
        name: 'Guiding Light, Precision & Kaizen Innovation',
        whyThisWorks: 'Draws a poetic, inspiring parallel between festive lanterns/moonlight and Brother\'s guiding mission of innovation, precision craftsmanship, and sustainable progress.',
        post: `Just as the moon illuminates the night sky, ${name} reminds us of the power of clarity, focus, and dedicated craftsmanship. 🏮💡\n\nIn both technology and relationships, enduring strength is built through patient dedication and continuous improvement (*Kaizen*).\n\nAt Brother Singapore, we take pride in illuminating the road ahead for our business community with dependable technologies that empower smarter, more connected workplaces.\n\nMay this festive season bring fresh inspiration, renewed clarity, and lasting success to your team! 🤝\n\n${hashtags} #Kaizen #WorkplaceExcellence #GuidingLight`
      },
      {
        id: 'opt-3',
        name: 'Office Festive Culture & Team Togetherness',
        whyThisWorks: 'Employer branding and internal team culture focus highlighting employee bonding, festive treats, and authentic workplace warmth.',
        post: `Lanterns, sweet mooncakes, and wonderful team smiles across our Brother Singapore office for ${name}! 🥮🎉\n\nMoments like these remind us that our greatest strength lies in our people and the vibrant, inclusive culture we nurture together.\n\nA heartfelt thank you to our entire Brother family for your dedication, enthusiasm, and teamwork every single day.\n\nHow is your workplace celebrating ${name} this week? Let us know in the comments! 💬\n\n${hashtags} #LifeAtBrother #FestiveCulture #TeamBrotherSG`
      }
    ];
  }

  // Official Singapore Public Holidays / General Occasions
  return [
    {
      id: "opt-1",
      name: "Warm Community Unity & Shared Pride (Wa Harmony)",
      whyThisWorks: "Employs high Hofstede Harmony (*Wa*) and multiracial Singaporean pride. Opens with an energetic greeting, connects cultural resilience with Brother's 'At your side' ethos, and ends with an authentic communal question.",
      post: `Happy ${name}! 🇸🇬✨\n\nAs we celebrate this milestone across Singapore, we reflect on what makes our community extraordinary — unity, resilience, and the relentless drive to innovate for the future.\n\nAt Brother Singapore, our commitment to standing 'At your side' is inspired by the vibrant spirit of our island nation. From local SMEs to multinational enterprises, we are honored to walk alongside Singapore's growth journey every single day.\n\nWishing all our partners, clients, and colleagues a wonderful ${name} with your loved ones! 🎉\n\nTo everyone celebrating, what is your team's favorite tradition today? Share with us below! 👇\n\n${hashtags}`
    },
    {
      id: "opt-2",
      name: "Craftsmanship, Kaizen & Long-Term Purpose",
      whyThisWorks: "Bridges Japanese craftsmanship (*Kaizen* / precision) with Singapore's Long-Term Orientation (LTO). Connects cultural values of dedication and excellence with sustainable enterprise growth.",
      post: `Beyond the celebrations, ${name} reminds us of the enduring power of strong foundations and shared purpose. 🌿\n\nIn both nation-building and business, true progress is achieved when precision meets human-centered care.\n\nAt Brother Singapore, we channel this philosophy into everything we build — delivering reliable technologies that empower workplaces while staying deeply rooted in sustainable community trust.\n\nMay this season inspire fresh breakthroughs, enduring partnerships, and renewed strength for the road ahead. 🤝\n\nWishing you a joyful and meaningful ${name}.\n\n${hashtags} #Kaizen #WorkplaceExcellence #SustainabilityInAction`
    },
    {
      id: "opt-3",
      name: "Internal Team Culture & Festive Behind-the-Scenes",
      whyThisWorks: "Employer branding focus. Highlights the multicultural harmony and inclusive workplace culture within the Brother Singapore family, engaging both prospective candidates and current staff.",
      post: `The festive energy is in full swing across our Brother Singapore office for ${name}! 🎉🇸🇬\n\nFrom sharing festive treats to reflecting on team achievements, moments like these showcase the incredible diverse talent that drives our business forward.\n\nWhen our people are supported, empowered, and celebrated, extraordinary things happen. A big thank you to our entire Brother family for bringing energy, warmth, and dedication to work every day!\n\nHow is your workplace celebrating ${name} this week? Let us know in the comments! 💬\n\n${hashtags} #LifeAtBrother #PeopleFirst #TeamBrotherSG`
    }
  ];
}

export default function Module1EventPosts({ isDark, onNavigateToDraftStudio }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Category Filter: 'all', 'public_holiday', 'custom'
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');

  // Custom Events State (loaded from localStorage)
  const [customEvents, setCustomEvents] = useState(() => {
    try {
      const stored = safeGetItem('brother_custom_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read custom events from storage:', e);
    }
    return INITIAL_CUSTOM_EVENTS;
  });

  // Modal State for Adding Custom Event
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-09-25');
  const [newEventCategory, setNewEventCategory] = useState('Cultural Festival');
  const [newEventType, setNewEventType] = useState('cultural');
  const [newEventDetails, setNewEventDetails] = useState('');
  const [newEventTheme, setNewEventTheme] = useState('mid-autumn');

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
        const tagged = data.holidays.map(h => ({
          ...h,
          eventType: 'public_holiday',
          category: 'Singapore Public Holiday'
        }));
        setHolidays(tagged);
        
        // If nothing selected yet, select first
        if (!selectedOccasion) {
          const first = tagged[0];
          setSelectedOccasion(first);
          setCustomBadge(first.badgeText || 'Singapore Public Holiday');
          setCustomHeadline(first.name);
          setCustomSubtitle(first.subtitle || 'Honoring unity, resilience & innovation');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch public holidays:', err);
    } finally {
      setLoadingHolidays(false);
    }
  };

  useEffect(() => {
    fetchHolidays(selectedYear);
  }, [selectedYear]);

  // Combine and sort holidays + custom events
  const combinedEvents = useMemo(() => {
    const yearFilteredHolidays = holidays;
    const yearFilteredCustom = customEvents.filter(evt => {
      if (selectedYear === 'all') return true;
      return evt.year === selectedYear || (evt.date && evt.date.startsWith(selectedYear));
    }).map(enrichEventWithDays);

    let all = [...yearFilteredHolidays, ...yearFilteredCustom];
    all.sort((a, b) => new Date(a.date) - new Date(b.date));

    return all;
  }, [holidays, customEvents, selectedYear]);

  const displayedEvents = useMemo(() => {
    if (eventCategoryFilter === 'public_holiday') {
      return combinedEvents.filter(e => e.eventType === 'public_holiday');
    }
    if (eventCategoryFilter === 'custom') {
      return combinedEvents.filter(e => e.isCustom);
    }
    return combinedEvents;
  }, [combinedEvents, eventCategoryFilter]);

  // Ensure an item is selected if current selection is outside displayed list
  useEffect(() => {
    if (displayedEvents.length > 0 && (!selectedOccasion || !displayedEvents.some(e => e.id === selectedOccasion.id))) {
      handleSelectOccasion(displayedEvents[0]);
    }
  }, [displayedEvents]);

  const handleSelectOccasion = (h) => {
    setSelectedOccasion(h);
    setSelectedDraftIndex(0);
    setCustomBadge(h.badgeText || (h.eventType === 'promotion' ? 'Promo Special' : 'Special Event'));
    setCustomHeadline(h.name);
    setCustomSubtitle(h.subtitle || h.details || 'Brother Singapore • At your side');
  };

  const handleSaveNewEvent = (e) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventDate) {
      alert('Please enter an event name and date.');
      return;
    }

    const eventDateObj = new Date(newEventDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[eventDateObj.getDay()];
    const yr = String(eventDateObj.getFullYear());

    let hashtags = ['#BrotherSingapore', '#AtYourSide'];
    if (newEventType === 'promotion') {
      hashtags = ['#BrotherSingapore', '#Promotion', '#WorkplaceTech', '#OfficeUpgrade', '#AtYourSide'];
    } else if (newEventType === 'cultural') {
      hashtags = ['#FestiveSG', '#Celebration', '#Community', '#BrotherSingapore', '#AtYourSide'];
    } else if (newEventType === 'sustainability') {
      hashtags = ['#BrotherEarth', '#SustainabilitySG', '#EcoAction', '#GreenPlan2030', '#AtYourSide'];
    }

    const newEvent = enrichEventWithDays({
      id: `custom-${Date.now()}`,
      name: newEventName.trim(),
      date: newEventDate,
      year: yr,
      day: dayName,
      category: newEventCategory,
      eventType: newEventType,
      badgeText: newEventCategory.includes('Promo') ? 'Special Privilege' : 'Celebration',
      subtitle: newEventDetails.trim() || `${newEventName.trim()} • Brother Singapore`,
      theme: newEventTheme,
      details: newEventDetails.trim(),
      suggestedHashtags: hashtags,
      isCustom: true
    });

    const updated = [newEvent, ...customEvents];
    setCustomEvents(updated);
    safeSetItem('brother_custom_events', JSON.stringify(updated));

    // Select the new event and close modal
    handleSelectOccasion(newEvent);
    setShowAddModal(false);

    // Reset form fields
    setNewEventName('');
    setNewEventDetails('');
  };

  const handleDeleteCustomEvent = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Remove this custom event?')) {
      const updated = customEvents.filter(evt => evt.id !== id);
      setCustomEvents(updated);
      safeSetItem('brother_custom_events', JSON.stringify(updated));
    }
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
            category: selectedOccasion.category || 'Events & Celebrations',
            status: 'Draft',
            author: 'Allan Cheng',
            draft1: drafts[0]?.post || '',
            draft2: drafts[1]?.post || '',
            rationale: drafts[0]?.whyThisWorks || '',
            sourceContext: `Event: ${selectedOccasion.name}\nDate: ${selectedOccasion.date}\nCategory: ${selectedOccasion.category}\nDetails: ${selectedOccasion.details || selectedOccasion.subtitle || ''}\nHashtags: ${(selectedOccasion.suggestedHashtags || []).join(' ')}`
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

  const drafts = selectedOccasion ? generateEventDrafts(selectedOccasion) : [];
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
                Event Content Generator
              </div>
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Singapore Public Holidays & Events
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official Singapore public holidays and custom promotional campaigns with AI copy angles and banner graphics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold px-3.5 sm:px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
            <button
              onClick={() => fetchHolidays(selectedYear, true)}
              disabled={loadingHolidays}
              title="Refresh Singapore Public Holidays from MOM"
              className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHolidays ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Holidays</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-3.5 sm:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
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
        {/* Left Column: Events & Singapore Public Holidays List */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-3.5 sm:p-4 rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {eventCategoryFilter === 'public_holiday'
                  ? `Singapore Public Holidays (${displayedEvents.length})`
                  : eventCategoryFilter === 'custom'
                    ? `Custom & Promos (${displayedEvents.length})`
                    : `Events & Holidays (${displayedEvents.length})`}
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f2ea2] dark:text-blue-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Event</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-3">
              <button
                onClick={() => setEventCategoryFilter('all')}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all text-center ${
                  eventCategoryFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-[#0f2ea2] dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({combinedEvents.length})
              </button>
              <button
                onClick={() => setEventCategoryFilter('public_holiday')}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all text-center ${
                  eventCategoryFilter === 'public_holiday'
                    ? 'bg-white dark:bg-slate-800 text-[#0f2ea2] dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Public ({holidays.length})
              </button>
              <button
                onClick={() => setEventCategoryFilter('custom')}
                className={`py-1.5 text-[11px] font-bold rounded-lg transition-all text-center ${
                  eventCategoryFilter === 'custom'
                    ? 'bg-white dark:bg-slate-800 text-[#0f2ea2] dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Custom ({customEvents.length})
              </button>
            </div>

            {loadingHolidays ? (
              <div className="p-8 text-center space-y-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0f2ea2]" />
                <p className="text-xs">Loading Singapore Public Holidays...</p>
              </div>
            ) : displayedEvents.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <Calendar className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs text-slate-500">No events found for this filter.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f2ea2] text-white text-xs font-bold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Event</span>
                </button>
              </div>
            ) : (
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-none lg:max-h-[520px] pb-2 lg:pb-0 pr-1 custom-scrollbar">
                {displayedEvents.map((h) => {
                  const isSelected = selectedOccasion?.id === h.id;
                  return (
                    <div
                      key={h.id}
                      onClick={() => handleSelectOccasion(h)}
                      className={`group p-3 rounded-xl border cursor-pointer transition-all shrink-0 lg:shrink w-64 lg:w-full relative ${
                        isSelected
                          ? 'bg-blue-50/80 border-[#0f2ea2] dark:bg-blue-950/50 dark:border-blue-500 shadow-sm'
                          : isDark
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 gap-1">
                        <span className={`text-xs font-bold line-clamp-1 flex-1 ${isSelected ? 'text-[#0f2ea2] dark:text-blue-300' : isDark ? 'text-white' : 'text-slate-900'}`}>
                          {h.name}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {h.isUrgent ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> T-10
                            </span>
                          ) : h.daysRemaining >= 0 ? (
                            <span className="text-[10px] text-slate-400 font-mono">{h.daysRemaining}d</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Passed</span>
                          )}

                          {h.isCustom && (
                            <button
                              onClick={(e) => handleDeleteCustomEvent(h.id, e)}
                              className="opacity-0 group-hover:opacity-100 hover:text-rose-500 p-0.5 text-slate-400 transition-opacity"
                              title="Delete custom event"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            h.isCustom
                              ? h.eventType === 'promotion'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {h.isCustom ? (h.eventType === 'promotion' ? 'Promo' : 'Custom') : 'Holiday'}
                          </span>
                          <span>{new Date(h.date).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{h.day}</span>
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
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] font-mono text-[#0f2ea2] dark:text-blue-400 font-bold uppercase tracking-wider block">
                      Post Angle {selectedDraftIndex + 1} of 3 • {selectedOccasion.name}
                    </span>
                    {selectedOccasion.isCustom && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">
                        {selectedOccasion.category}
                      </span>
                    )}
                  </div>
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
                    Official Brother SG Banner Graphic (SVG)
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

      {/* Add Custom Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0f2ea2] text-white flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Custom Event or Promotion</h3>
                  <p className="text-[11px] text-slate-500">Create a promotional campaign, festival, or milestone</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewEvent} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title / Campaign Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Autumn Festival or Brother Mega Roadshow"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category Type
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setNewEventType(type);
                      if (type === 'cultural') {
                        setNewEventCategory('Cultural Festival');
                        setNewEventTheme('mid-autumn');
                      } else if (type === 'promotion') {
                        setNewEventCategory('Promotional Campaign');
                        setNewEventTheme('promotion');
                      } else if (type === 'sustainability') {
                        setNewEventCategory('Sustainability & ESG');
                        setNewEventTheme('sustainability');
                      } else {
                        setNewEventCategory('Corporate Milestone');
                        setNewEventTheme('corporate');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
                  >
                    <option value="cultural">🏮 Cultural & Festive</option>
                    <option value="promotion">🏷️ Promotional & Campaign</option>
                    <option value="sustainability">🌿 Sustainability & CSR</option>
                    <option value="corporate">🏢 Corporate & Milestone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Promotion / Event Context (Used by AI Copy Generator)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Trade in any old printer and receive up to $100 cashback + free 3-year warranty on Brother MFC-L3760CDW..."
                  value={newEventDetails}
                  onChange={(e) => setNewEventDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Banner Graphic Visual Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'mid-autumn', label: 'Mid-Autumn Gold', color: '#FBBF24' },
                    { id: 'promotion', label: 'Promo Orange', color: '#FF6B00' },
                    { id: 'corporate', label: 'Brother Blue', color: '#0f2ea2' },
                    { id: 'sustainability', label: 'Eco Emerald', color: '#10B981' }
                  ].map((thm) => (
                    <button
                      type="button"
                      key={thm.id}
                      onClick={() => setNewEventTheme(thm.id)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                        newEventTheme === thm.id
                          ? 'border-[#0f2ea2] bg-blue-50/80 dark:bg-blue-950/40 text-[#0f2ea2] dark:text-blue-300 ring-2 ring-[#0f2ea2]/20'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: thm.color }} />
                      <span className="truncate text-[11px]">{thm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Save & Generate Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
