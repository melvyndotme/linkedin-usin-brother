import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Sparkles, Copy, Check, Download, ArrowRight, Flame, Layers, ExternalLink, RefreshCw, AlertCircle, Database, CheckCircle2, Plus, Trash2, Tag, X, BookOpen, Link2, Globe } from 'lucide-react';
import { safeGetItem, safeSetItem } from '../lib/storage.js';
import { logActivity } from '../lib/auditLogger.js';

// Color Scheme:
// Blue: Official Brother Events
// Green: Sustainability
// Red: Promotions
// Amber: Other Events (Mid-Autumn Festivals, Celebrations, etc.)

const THEME_PRESETS = [
  { id: 'blue', label: 'Official Brother', desc: 'Company milestones, holidays & corporate news', color: '#0f2ea2', badgeClass: 'bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300 border-blue-200' },
  { id: 'green', label: 'Sustainability', desc: 'Brother Earth, ESG initiatives & recycling', color: '#10B981', badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200' },
  { id: 'red', label: 'Promotions', desc: 'Sales campaigns, deals & printer trade-ins', color: '#EF4444', badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200' },
  { id: 'amber', label: 'Other Events', desc: 'Mid-Autumn, festive occasions & celebrations', color: '#F59E0B', badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200' }
];

// Pre-seeded starter custom events following the exact color scheme
const INITIAL_CUSTOM_EVENTS = [
  {
    id: 'custom-mid-autumn-2026',
    name: 'Mid-Autumn Festival (中秋节)',
    date: '2026-09-25',
    year: '2026',
    day: 'Friday',
    category: 'Festivals & Celebrations',
    eventType: 'cultural',
    badgeText: 'Mid-Autumn Harmony',
    subtitle: 'Celebrating togetherness, reunion & lighting the path forward',
    theme: 'amber',
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
    category: 'Promotions & Campaigns',
    eventType: 'promotion',
    badgeText: 'Trade-In Special',
    subtitle: 'Upgrade office productivity with up to $100 trade-in rebate + 3-year warranty',
    theme: 'red',
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
    theme: 'green',
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

  // Red Theme: Promotional or Campaign Event
  if (occasion.eventType === 'promotion' || occasion.theme === 'red') {
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
        post: `A smooth workday starts with tools you can always depend on. ⚙️📄\n\nWhen document bottlenecks happen, business slows down. That's why Brother Singapore is pleased to introduce our ${name}.\n\nBuilt on decades of precision engineering, Brother printers and scanners are crafted to work tirelessly beside your team. Whether you're processing bulk contracts, high-resolution presentations, or everyday invoices, our hardware delivers consistent, jam-free speed day after day.\n\n${details ? `💡 Current Campaign Highlight: ${details}\n\n` : ''}Discover how we stand 'At your side' to keep your enterprise moving forward.\n\n${hashtags} #OfficeProductivity #ZeroDowntime #Kaizen`
      },
      {
        id: 'opt-3',
        name: 'Limited-Time Campaign Call-to-Action & Community Prompt',
        whyThisWorks: 'High conversion urgency combined with an interactive engagement question to prompt comments from office managers and decision-makers.',
        post: `Special announcement for our Singapore business community! 📢✨\n\nThe ${name} is officially live!\n\n${details ? `👉 ${details}\n\n` : ''}Don't let legacy hardware drain your company's energy and budget. Take advantage of this limited-time opportunity to modernize your office workspace.\n\n📍 Available across all Brother Singapore authorized dealers and corporate partners.\n\nBusiness owners & office managers: What is the #1 feature you look for when upgrading your workplace printers? Speed, wireless connectivity, or running costs? Drop your thoughts below! 👇\n\n${hashtags} #BusinessUpgrade #SingaporeSME #WorkplaceTech`
      }
    ];
  }

  // Green Theme: Sustainability / CSR Event
  if (occasion.eventType === 'sustainability' || occasion.theme === 'green') {
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

  // Amber Theme: Other Events (Festivals, Cultural, Celebrations, Mid-Autumn)
  if (occasion.eventType === 'cultural' || occasion.theme === 'amber') {
    return [
      {
        id: 'opt-1',
        name: 'Warm Community Unity & Shared Traditions (Wa Harmony)',
        whyThisWorks: 'Employs high Hofstede Harmony (*Wa*) and multiracial Singaporean connection. Celebrates reunion and gratitude, tying back to Brother\'s "At your side" philosophy.',
        post: `Warmest greetings on this joyous ${name}! 🥮🌕✨\n\nAs we celebrate together across Singapore, we honor the enduring values of reunion, gratitude, and cherished relationships with family, colleagues, and valued partners.\n\n${details ? `${details}\n\n` : ''}At Brother Singapore, standing 'At your side' means being part of your journey through every milestone and celebratory season. We are grateful for the trust you place in us every day.\n\nWishing you and your loved ones an abundance of joy, peace, and meaningful moments together. Happy ${name}!\n\nWhat is your favorite family or team tradition during this celebration? Share with us below! 👇\n\n${hashtags}`
      },
      {
        id: 'opt-2',
        name: 'Guiding Light, Precision & Kaizen Innovation',
        whyThisWorks: 'Draws an inspiring parallel between celebrations and Brother\'s guiding mission of innovation, precision craftsmanship, and sustainable progress.',
        post: `Moments of celebration like ${name} remind us of the power of clarity, shared purpose, and dedicated craftsmanship. 🏮💡\n\nIn both technology and relationships, enduring strength is built through patient dedication and continuous improvement (*Kaizen*).\n\nAt Brother Singapore, we are dedicated to illuminating the road ahead for our business community with dependable technologies that empower smarter, more connected workplaces.\n\nMay this season bring fresh inspiration, renewed clarity, and lasting success to your team! 🤝\n\n${hashtags} #Kaizen #WorkplaceExcellence #GuidingLight`
      },
      {
        id: 'opt-3',
        name: 'Office Festive Culture & Team Togetherness',
        whyThisWorks: 'Employer branding and internal team culture focus highlighting employee bonding, festive treats, and authentic workplace warmth.',
        post: `Smiles, festive treats, and celebration across our Brother Singapore office for ${name}! 🎉✨\n\nMoments like these remind us that our greatest strength lies in our people and the vibrant, inclusive culture we nurture together.\n\nA heartfelt thank you to our entire Brother family for your dedication, enthusiasm, and teamwork every single day.\n\nHow is your workplace celebrating ${name} this week? Let us know in the comments! 💬\n\n${hashtags} #LifeAtBrother #FestiveCulture #TeamBrotherSG`
      }
    ];
  }

  // Blue Theme: Official Brother Events / Public Holidays
  return [
    {
      id: "opt-1",
      name: "Warm Community Unity & Shared Harmony (Wa)",
      whyThisWorks: "Employs high Hofstede Harmony (*Wa*) and multiracial Singaporean solidarity. Opens with an energetic greeting, connects cultural resilience with Brother's 'At your side' ethos, and ends with an authentic communal question.",
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
      post: `The energy is in full swing across our Brother Singapore office for ${name}! 🎉🇸🇬\n\nFrom sharing treats to reflecting on team achievements, moments like these showcase the incredible diverse talent that drives our business forward.\n\nWhen our people are supported, empowered, and celebrated, extraordinary things happen. A big thank you to our entire Brother family for bringing energy, warmth, and dedication to work every day!\n\nHow is your workplace celebrating ${name} this week? Let us know in the comments! 💬\n\n${hashtags} #LifeAtBrother #PeopleFirst #TeamBrotherSG`
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
  const [copiedIndex, setCopiedIndex] = useState(null);

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
  const [newEventUrl, setNewEventUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newEventCategory, setNewEventCategory] = useState('Promotions & Campaigns');
  const [newEventType, setNewEventType] = useState('promotion');
  const [newEventDetails, setNewEventDetails] = useState('');
  const [newEventTheme, setNewEventTheme] = useState('red');

  // SVG Customization
  const [customBadge, setCustomBadge] = useState('Celebrate SG Special');
  const [customHeadline, setCustomHeadline] = useState('Singapore National Day');
  const [customSubtitle, setCustomSubtitle] = useState('Honoring unity, resilience & innovation');

  const fetchHolidays = async (year = selectedYear, refresh = false) => {
    setLoadingHolidays(true);
    try {
      const res = await fetch(`/api/mom/holidays?year=${year}${refresh ? '&refresh=true' : ''}`);
      const data = await res.json();
      if (data.success && data.holidays?.length > 0) {
        const tagged = data.holidays.map(h => ({
          ...h,
          eventType: 'public_holiday',
          theme: 'blue',
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

  // Combine and sort holidays + custom events, ensuring custom events are always preserved
  const combinedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enrichedHolidays = holidays.map(enrichEventWithDays);
    const enrichedCustom = customEvents.map(enrichEventWithDays);

    let all = [...enrichedHolidays, ...enrichedCustom];

    // Filter events
    all = all.filter(evt => {
      // Exclude 2025 unless explicitly selected
      if (selectedYear !== '2025' && selectedYear !== 'all') {
        if (evt.year === '2025' || (evt.date && evt.date.startsWith('2025'))) {
          return false;
        }
      }
      // Year filter if not 'all'
      if (selectedYear !== 'all' && evt.year !== selectedYear && !(evt.date && evt.date.startsWith(selectedYear))) {
        return false;
      }
      // Custom events are ALWAYS retained so user creation is never silently discarded
      if (evt.isCustom) return true;

      // Remove past public holidays
      const evtDate = new Date(evt.date);
      evtDate.setHours(0, 0, 0, 0);
      return evtDate >= today;
    });

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
    setCustomBadge(h.badgeText || (h.theme === 'red' ? 'Special Privilege' : h.theme === 'green' ? 'Eco-Conscious SG' : h.theme === 'amber' ? 'Festive Special' : 'Official Brother'));
    setCustomHeadline(h.name);
    setCustomSubtitle(h.subtitle || h.details || 'Brother Singapore • At your side');
  };

  const handleScrapePromoUrl = async () => {
    let urlToScrape = newEventUrl?.trim();
    if (!urlToScrape) {
      setScrapeStatus({ type: 'error', message: 'Please enter a webpage URL first.' });
      return;
    }
    if (!/^https?:\/\//i.test(urlToScrape)) {
      urlToScrape = `https://${urlToScrape}`;
      setNewEventUrl(urlToScrape);
    }

    setIsScraping(true);
    setScrapeStatus(null);

    try {
      const res = await fetch('/api/templates/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'scrape_promo',
          url: urlToScrape
        })
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to extract promotion info.');
      }

      const { data } = resData;
      if (data) {
        if (data.title) setNewEventName(data.title);
        if (data.details) setNewEventDetails(data.details);
        if (data.date) setNewEventDate(data.date);
        if (data.categoryType) {
          setNewEventType(data.categoryType);
          if (data.categoryType === 'corporate') setNewEventCategory('Official Brother Event');
          else if (data.categoryType === 'sustainability') setNewEventCategory('Sustainability & ESG');
          else if (data.categoryType === 'promotion') setNewEventCategory('Promotional & Campaign');
          else setNewEventCategory('Festivals & Celebrations');
        }
        if (data.theme) setNewEventTheme(data.theme);

        setScrapeStatus({
          type: 'success',
          message: '✓ Webpage scraped! Campaign title, context & details populated.'
        });
      }
    } catch (err) {
      console.warn('Scraping error:', err);
      setScrapeStatus({
        type: 'error',
        message: `Extraction failed: ${err.message}`
      });
    } finally {
      setIsScraping(false);
    }
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
    let badgeText = 'Official Brother';

    if (newEventTheme === 'red') {
      hashtags = ['#BrotherSingapore', '#Promotion', '#WorkplaceTech', '#OfficeUpgrade', '#AtYourSide'];
      badgeText = 'Special Privilege';
    } else if (newEventTheme === 'green') {
      hashtags = ['#BrotherEarth', '#SustainabilitySG', '#EcoAction', '#GreenPlan2030', '#AtYourSide'];
      badgeText = 'Eco-Conscious SG';
    } else if (newEventTheme === 'amber') {
      hashtags = ['#FestiveSG', '#Celebration', '#Community', '#BrotherSingapore', '#AtYourSide'];
      badgeText = 'Festive Special';
    }

    const newEvent = enrichEventWithDays({
      id: `custom-${Date.now()}`,
      name: newEventName.trim(),
      date: newEventDate,
      year: yr,
      day: dayName,
      category: newEventCategory,
      eventType: newEventType,
      badgeText,
      subtitle: newEventDetails.trim() || `${newEventName.trim()} • Brother Singapore`,
      theme: newEventTheme,
      details: newEventDetails.trim(),
      suggestedHashtags: hashtags,
      url: newEventUrl.trim(),
      promoUrl: newEventUrl.trim(),
      isCustom: true
    });

    const updated = [newEvent, ...customEvents];
    setCustomEvents(updated);
    safeSetItem('brother_custom_events', JSON.stringify(updated));

    // Ensure tab filter does not hide the new custom event
    if (eventCategoryFilter === 'public_holiday') {
      setEventCategoryFilter('all');
    }

    // Sync custom event to Notion Enterprise database
    const token = safeGetItem('notion_token') || safeGetItem('token_notion');
    const explicitDb = safeGetItem('notion_database_id') || '3c701136de4881de9d29ca4ea415e856';
    if (token) {
      fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: token,
          databaseId: explicitDb,
          post: {
            title: newEvent.name,
            content: newEvent.details || newEvent.subtitle || `${newEvent.name} • Brother Singapore`,
            category: newEvent.category || 'Campaign Event',
            status: 'Working Draft',
            author: 'Allan Cheng',
            date: newEvent.date,
            scheduledDate: `${newEvent.date}T09:00:00`
          }
        })
      }).catch(err => console.warn('Notion custom event sync warning:', err));
    }

    logActivity({
      event: 'Created Custom Calendar Event',
      category: 'Content Generation',
      details: `Created custom event "${newEvent.name}" (${newEvent.date}) under ${newEvent.category} and synced to Notion`,
      status: 'Success'
    });

    // Select the new event and close modal
    handleSelectOccasion(newEvent);
    setShowAddModal(false);

    // Reset form fields
    setNewEventName('');
    setNewEventDetails('');
    setNewEventUrl('');
    setScrapeStatus(null);

    // Auto-launch into Content Studio
    const evtDrafts = generateEventDrafts(newEvent);
    if (onNavigateToDraftStudio) {
      onNavigateToDraftStudio({
        content: newEvent.details || newEvent.subtitle || '',
        title: `${newEvent.name} ${newEvent.year || 2026}`,
        occasion: newEvent,
        activeDraft: evtDrafts[0],
        availableDrafts: evtDrafts
      });
    }
  };

  const handleDeleteCustomEvent = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Remove this custom event?')) {
      const updated = customEvents.filter(evt => evt.id !== id);
      setCustomEvents(updated);
      safeSetItem('brother_custom_events', JSON.stringify(updated));
    }
  };

  const drafts = selectedOccasion ? generateEventDrafts(selectedOccasion) : [];
  const currentDraft = drafts[selectedDraftIndex] || drafts[0];

  const handleCopy = (text, index) => {
    const postToCopy = typeof text === 'string' ? text : currentDraft?.post;
    if (postToCopy) {
      navigator.clipboard.writeText(postToCopy);
      setCopied(true);
      setCopiedIndex(typeof index === 'number' ? index : selectedDraftIndex);
      setTimeout(() => {
        setCopied(false);
        setCopiedIndex(null);
      }, 2000);
    }
  };

  // Helper to get pill style for each event
  const getEventBadgeStyle = (evt) => {
    if (evt.theme === 'red' || evt.eventType === 'promotion') {
      return { label: 'Promotion', class: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200' };
    }
    if (evt.theme === 'green' || evt.eventType === 'sustainability') {
      return { label: 'Sustainability', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200' };
    }
    if (evt.theme === 'amber' || evt.eventType === 'cultural') {
      return { label: 'Other Event', class: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200' };
    }
    return { label: evt.isCustom ? 'Official' : 'Holiday', class: 'bg-blue-100 text-[#0f2ea2] dark:bg-blue-950 dark:text-blue-300 border-blue-200' };
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
                Singapore Event & Campaign Hub
              </div>
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Events, Public Holidays & Promotions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select any upcoming Singapore occasion or promotional campaign to immediately draft 3 LinkedIn posts in Content Studio.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => fetchHolidays(selectedYear, true)}
              disabled={loadingHolidays}
              title="Refresh Singapore Public Holidays from MOM"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHolidays ? 'animate-spin' : ''}`} />
              <span>Refresh MOM</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Event / Promo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Year Selector Bar */}
      <div className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setEventCategoryFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              eventCategoryFilter === 'all'
                ? 'bg-[#0f2ea2] text-white shadow-sm ring-2 ring-[#0f2ea2]/20'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Occasions ({combinedEvents.length})
          </button>
          <button
            onClick={() => setEventCategoryFilter('public_holiday')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              eventCategoryFilter === 'public_holiday'
                ? 'bg-[#0f2ea2] text-white shadow-sm ring-2 ring-[#0f2ea2]/20'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Public Holidays ({combinedEvents.filter(e => e.eventType === 'public_holiday').length})
          </button>
          <button
            onClick={() => setEventCategoryFilter('custom')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              eventCategoryFilter === 'custom'
                ? 'bg-[#0f2ea2] text-white shadow-sm ring-2 ring-[#0f2ea2]/20'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Custom & Promotions ({combinedEvents.filter(e => e.isCustom).length})
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            title="Select Calendar Year"
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="all">All Years</option>
          </select>
        </div>
      </div>

      {/* Events Card Grid */}
      {loadingHolidays ? (
        <div className="p-12 text-center space-y-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0f2ea2]" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Loading Singapore Public Holidays...</p>
        </div>
      ) : displayedEvents.length === 0 ? (
        <div className="p-12 text-center space-y-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <Calendar className="w-10 h-10 mx-auto text-slate-400" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No events found for this filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a custom promotion or switch your filter above to view available occasions.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f2ea2] text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event or Promotion</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedEvents.map((evt) => {
            const badgeInfo = getEventBadgeStyle(evt);
            const evtDateFormatted = new Date(evt.date).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div
                key={evt.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between group hover:shadow-md ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-blue-200 shadow-xs'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top Badges & Countdown */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeInfo.class}`}>
                      {evt.category || badgeInfo.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {evt.isUrgent ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3" /> T-10
                        </span>
                      ) : evt.daysRemaining >= 0 ? (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {evt.daysRemaining}d away
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          Past
                        </span>
                      )}
                      {evt.isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustomEvent(evt.id, e)}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-500 p-1 text-slate-400 transition-opacity cursor-pointer"
                          title="Delete custom event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date & Day */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evtDateFormatted} ({evt.day})</span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-base font-bold tracking-tight line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {evt.name}
                  </h3>

                  {/* Snippet / Subtitle */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {evt.details || evt.culturalContext || evt.subtitle}
                  </p>

                  {/* Webpage Link (if promo URL exists) */}
                  {(evt.promoUrl || evt.url) && (
                    <div className="pt-0.5">
                      <a
                        href={evt.promoUrl || evt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0f2ea2] dark:text-blue-400 hover:underline"
                      >
                        <Globe className="w-3 h-3" />
                        <span>View Promotion Webpage</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => {
                      logActivity({
                        event: 'Drafted Event in Content Studio',
                        category: 'Content Generation',
                        details: `Selected "${evt.name}" to draft in Content Studio`,
                        status: 'Success'
                      });
                      const evtDrafts = generateEventDrafts(evt);
                      onNavigateToDraftStudio({
                        content: evt.details || evt.culturalContext || evt.subtitle || '',
                        title: `${evt.name} ${evt.year || 2026}`,
                        occasion: evt,
                        activeDraft: evtDrafts[0],
                        availableDrafts: evtDrafts
                      });
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span>Draft in Content Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
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
              {/* Promotion / Webpage URL Input & Auto-Extract Action */}
              <div className="p-3.5 rounded-xl border border-blue-200/90 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0f2ea2] dark:text-blue-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Promotion / Webpage URL (Auto-Extract)</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="url"
                      placeholder="https://www.brother.com.sg/en/promotions/..."
                      value={newEventUrl}
                      onChange={(e) => {
                        setNewEventUrl(e.target.value);
                        if (scrapeStatus) setScrapeStatus(null);
                      }}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleScrapePromoUrl}
                    disabled={isScraping || !newEventUrl?.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f2ea2] hover:bg-[#0c2482] disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                  >
                    {isScraping ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Scraping...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Scrape & Auto-Fill</span>
                      </>
                    )}
                  </button>
                </div>

                {scrapeStatus && (
                  <div className={`text-[11px] font-medium flex items-center gap-1.5 pt-0.5 ${
                    scrapeStatus.type === 'error' ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {scrapeStatus.type === 'error' ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    <span>{scrapeStatus.message}</span>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Paste any Brother Singapore promotion page URL to automatically scrape the campaign title, warranty terms, and promotion details.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title / Campaign Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Autumn Festival, Mega Trade-in Promo, or Roadshow"
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
                      if (type === 'corporate') {
                        setNewEventCategory('Official Brother Event');
                        setNewEventTheme('blue');
                      } else if (type === 'sustainability') {
                        setNewEventCategory('Sustainability & ESG');
                        setNewEventTheme('green');
                      } else if (type === 'promotion') {
                        setNewEventCategory('Promotional & Campaign');
                        setNewEventTheme('red');
                      } else {
                        setNewEventCategory('Festivals & Celebrations');
                        setNewEventTheme('amber');
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
                  >
                    <option value="corporate">🔵 Official Brother Event</option>
                    <option value="sustainability">🟢 Sustainability & ESG</option>
                    <option value="promotion">🔴 Promotional & Campaign</option>
                    <option value="cultural">🟡 Festivals & Other Celebrations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Promotion / Event Context (Used by AI Copy Generator)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Special offer: Trade in any old printer to get $80 off + 3-year warranty, or celebrating Mid-Autumn with customers..."
                  value={newEventDetails}
                  onChange={(e) => setNewEventDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2ea2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Banner Graphic Color Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {THEME_PRESETS.map((thm) => {
                    const isSelected = newEventTheme === thm.id;
                    return (
                      <button
                        type="button"
                        key={thm.id}
                        onClick={() => setNewEventTheme(thm.id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0f2ea2] bg-blue-50/80 dark:bg-blue-950/40 text-slate-900 dark:text-white ring-2 ring-[#0f2ea2]/30 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 shadow-xs"
                          style={{ backgroundColor: thm.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                            {thm.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {thm.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
