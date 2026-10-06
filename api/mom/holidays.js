// Vercel Serverless Function & Node Route: Live MOM (Ministry of Manpower) Singapore Public Holiday Scraper & API
// Scrapes official public holidays from https://www.mom.gov.sg/employment-practices/public-holidays

const MONTH_MAP = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

const THEME_PRESETS = {
  'new year': {
    badgeText: 'New Year Fresh Start',
    subtitle: 'Stepping boldly into a new year of digital breakthroughs & shared success',
    theme: 'new-year',
    culturalContext: 'Celebrating new beginnings, fresh aspirations, and looking ahead to smart workplace automation.',
    hashtags: ['#NewYear', '#FreshBeginnings', '#WorkplaceInnovation', '#BrotherSingapore', '#AtYourSide']
  },
  'chinese new year': {
    badgeText: 'Prosperity & Reunion',
    subtitle: 'Gong Xi Fa Cai • Wishing you abundance, harmony and lasting success',
    theme: 'cny',
    culturalContext: 'Celebration of new beginnings, family reunion, renewal, and prosperity across Singapore.',
    hashtags: ['#ChineseNewYear', '#GongXiFaCai', '#SpringFestival', '#BrotherSingapore', '#AtYourSide']
  },
  'hari raya puasa': {
    badgeText: 'Gratitude & Harmony',
    subtitle: 'Selamat Hari Raya Aidilfitri • Celebrating forgiveness, unity and community blessings',
    theme: 'hari-raya',
    culturalContext: 'Eid al-Fitr marks the culmination of Ramadan — celebrating forgiveness, gratitude, reflection, and community bonding.',
    hashtags: ['#HariRayaPuasa', '#EidMubarak', '#ForgivenessAndGratitude', '#BrotherSingapore', '#AtYourSide']
  },
  'good friday': {
    badgeText: 'Reflection & Peace',
    subtitle: 'Warmest thoughts of peace, gratitude and renewal this Easter weekend',
    theme: 'reflection',
    culturalContext: 'A time of quiet reflection, renewal, and peace with loved ones.',
    hashtags: ['#GoodFriday', '#EasterWeekend', '#Reflection', '#BrotherSingapore', '#AtYourSide']
  },
  'labour day': {
    badgeText: 'Workforce Appreciation',
    subtitle: 'Honoring the dedication, craftsmanship & resilience of our workforce',
    theme: 'labour-day',
    culturalContext: 'Honoring the dedication, resilience, and contributions of all workers shaping Singapore\'s progress.',
    hashtags: ['#LabourDay', '#MayDay', '#WorkforceEmpowerment', '#LifeAtBrother', '#BrotherSingapore', '#AtYourSide']
  },
  'vesak day': {
    badgeText: 'Peace & Compassion',
    subtitle: 'Commemorating universal goodwill, harmony and shared wisdom',
    theme: 'peace-harmony',
    culturalContext: 'Commemorating peace, compassion, wisdom, and universal goodwill across communities.',
    hashtags: ['#VesakDay', '#PeaceAndCompassion', '#CommunityHarmony', '#BrotherSingapore', '#AtYourSide']
  },
  'hari raya haji': {
    badgeText: 'Sacrifice & Unity',
    subtitle: 'Commemorating devotion, sharing blessings and selfless dedication',
    theme: 'devotion',
    culturalContext: 'Commemorating devotion, selfless sacrifice, and sharing blessings with the wider community.',
    hashtags: ['#HariRayaHaji', '#UnityAndGiving', '#BrotherSingapore', '#AtYourSide']
  },
  'national day': {
    badgeText: 'Celebrate SG National Harmony',
    subtitle: 'Majulah Singapura • Honoring unity, resilience & future-forward innovation',
    theme: 'national-day',
    culturalContext: 'Singapore National Day celebrating sovereignty, multicultural harmony, and forward-looking innovation as one nation.',
    hashtags: ['#NationalDay', '#NDP', '#MajulahSingapura', '#OneSingapore', '#BrotherSingapore', '#AtYourSide']
  },
  'deepavali': {
    badgeText: 'Festival of Lights',
    subtitle: 'May the divine light illuminate your path with joy, wisdom & prosperity',
    theme: 'deepavali',
    culturalContext: 'Deepavali signifies the victory of light over darkness and knowledge over ignorance across Singapore\'s vibrant Indian community.',
    hashtags: ['#Deepavali', '#FestivalOfLights', '#JoyAndProsperity', '#BrotherSingapore', '#AtYourSide']
  },
  'christmas day': {
    badgeText: 'Season of Giving',
    subtitle: 'Warmest wishes of peace, joy and heartfelt gratitude to our partners',
    theme: 'christmas',
    culturalContext: 'The season of giving, warm connections, joy, and reflecting on a fruitful year standing beside our partners.',
    hashtags: ['#MerryChristmas', '#SeasonOfGiving', '#YearEndCelebration', '#BrotherSingapore', '#AtYourSide']
  }
};

function parseMOMDate(rawDateStr, fallbackYear) {
  // Format examples: "1 January 2026", "17 February 2026 18 February 2026"
  const tokens = rawDateStr.split(/\s+/).filter(Boolean);
  const dates = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const day = parseInt(tokens[i], 10);
    if (!isNaN(day) && day >= 1 && day <= 31 && i + 1 < tokens.length) {
      const monthStr = tokens[i + 1].toLowerCase();
      if (MONTH_MAP[monthStr]) {
        let year = fallbackYear;
        if (i + 2 < tokens.length && /^\d{4}$/.test(tokens[i + 2])) {
          year = parseInt(tokens[i + 2], 10);
        }
        const mm = MONTH_MAP[monthStr];
        const dd = String(day).padStart(2, '0');
        dates.push(`${year}-${mm}-${dd}`);
      }
    }
  }

  return {
    isoDate: dates[0] || `${fallbackYear}-01-01`,
    endDate: dates.length > 1 ? dates[dates.length - 1] : null,
    allDates: dates
  };
}

function normalizeHolidayName(name) {
  return (name || '')
    .replace(/’/g, "'")
    .replace(/\s*\((?:observed|in lieu)\)/i, '')
    .trim();
}

function enrichHoliday(h, refDate = new Date()) {
  const nameLower = h.name.toLowerCase();
  let matchedPreset = Object.entries(THEME_PRESETS).find(([key]) => nameLower.includes(key));
  const preset = matchedPreset ? matchedPreset[1] : {
    badgeText: 'Singapore Special Occasion',
    subtitle: `Celebrating ${h.name} with our community across Singapore`,
    theme: 'corporate',
    culturalContext: `Singapore public holiday: ${h.name}.`,
    hashtags: [`#${h.name.replace(/[^a-zA-Z0-9]/g, '')}`, '#BrotherSingapore', '#AtYourSide']
  };

  const targetDate = new Date(h.isoDate);
  const diffTime = targetDate - refDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status = `${diffDays} days away`;
  let isUrgent = false;

  if (diffDays >= 0 && diffDays <= 10) {
    status = 'Ready for Drafting (T-10 Window Active)';
    isUrgent = true;
  } else if (diffDays < 0) {
    status = 'Past';
  }

  const slug = h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    id: `${slug}-${h.year}`,
    name: h.name,
    date: h.isoDate,
    endDate: h.endDate,
    day: h.day,
    observedDate: h.observedDate || null,
    observedDay: h.observedDay || null,
    hasObserved: Boolean(h.observedDate),
    year: h.year,
    category: 'MOM Public Holiday',
    badgeText: preset.badgeText,
    subtitle: preset.subtitle,
    theme: preset.theme,
    culturalContext: preset.culturalContext,
    suggestedHashtags: preset.hashtags,
    daysRemaining: diffDays,
    status,
    isUrgent,
    t10Active: isUrgent,
    source: 'Data.gov.sg Collection 691 (Ministry of Manpower)'
  };
}

// In-memory cache
let cachedHolidays = null;
let lastFetchTime = 0;
let lastSourceType = 'data_gov_sg_collection_691';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour

// Primary: Official Data.gov.sg API (Collection 691 - Singapore Public Holidays)
async function fetchFromDataGovSg() {
  const url = 'https://data.gov.sg/api/action/datastore_search?resource_id=d_8ef23381f9417e4d4254ee8b4dcdb176&limit=300';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Data.gov.sg API returned HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data?.success || !Array.isArray(data?.result?.records)) {
    throw new Error('Data.gov.sg response format invalid');
  }

  const recs = data.result.records;
  // Sort chronologically by ISO date
  recs.sort((a, b) => (a.date > b.date ? 1 : -1));

  // Group by (year, baseHolidayName) to unify "Observed" holidays into a single card
  const grouped = new Map();
  for (const r of recs) {
    const yr = parseInt(r.date.split('-')[0], 10);
    const cleanHoliday = (r.holiday || '').replace(/’/g, "'").trim();
    const isObserved = /\((?:observed|in lieu)\)/i.test(cleanHoliday);
    const baseName = normalizeHolidayName(cleanHoliday);
    const key = `${yr}::${baseName.toLowerCase()}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        name: baseName,
        year: yr,
        records: []
      });
    }
    grouped.get(key).records.push({ ...r, isObserved, cleanHoliday });
  }

  const list = [];
  for (const [, item] of grouped) {
    const primaryRecords = item.records.filter(r => !r.isObserved);
    const observedRecords = item.records.filter(r => r.isObserved);

    // If only observed records exist, treat the first observed as primary
    const mainRecords = primaryRecords.length > 0 ? primaryRecords : observedRecords;
    const firstMain = mainRecords[0];
    const lastMain = mainRecords[mainRecords.length - 1];

    const observedRecord = observedRecords[0] || null;

    list.push({
      name: item.name,
      year: item.year,
      isoDate: firstMain.date,
      endDate: lastMain !== firstMain ? lastMain.date : null,
      day: mainRecords.map(r => r.day).join(' '),
      observedDate: observedRecord ? observedRecord.date : null,
      observedDay: observedRecord ? observedRecord.day : null,
      hasObserved: Boolean(observedRecord),
      sourceId: firstMain._id
    });
  }

  // Sort chronologically by ISO date
  list.sort((a, b) => (a.isoDate > b.isoDate ? 1 : -1));

  return list;
}

// Fallback: Direct MOM Scraper if Data.gov.sg API is ever unavailable
async function fetchFromMOM() {
  const url = 'https://www.mom.gov.sg/employment-practices/public-holidays';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  if (!res.ok) {
    throw new Error(`MOM website returned HTTP ${res.status}`);
  }

  const html = await res.text();
  const allHolidays = [];
  const years = [2025, 2026, 2027];

  for (const year of years) {
    const tabMatch = html.match(new RegExp(`<div id="Year-${year}"[^>]*>([\\s\\S]*?)<\\/table>`, 'i'));
    if (tabMatch) {
      const rowRegex = /<tr[^>]*>[\s\S]*?<td>([\s\S]*?)<\/td>[\s\S]*?<td>([\s\S]*?)<\/td>[\s\S]*?<td class="cell-holiday-name">([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;
      let match;
      while ((match = rowRegex.exec(tabMatch[1])) !== null) {
        const rawDate = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const rawDay = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const rawName = match[3].split('<')[0].replace(/\s+/g, ' ').trim();
        if (rawName && rawDate) {
          const { isoDate, endDate } = parseMOMDate(rawDate, year);
          allHolidays.push({
            name: rawName,
            isoDate,
            endDate,
            day: rawDay,
            year
          });
        }
      }
    }
  }

  // Deduplicate and group any (Observed) entries from MOM HTML
  const groupedMOM = new Map();
  for (const h of allHolidays) {
    const isObserved = /\((?:observed|in lieu)\)/i.test(h.name || '');
    const baseName = normalizeHolidayName(h.name);
    const key = `${h.year}::${baseName.toLowerCase()}`;

    if (!groupedMOM.has(key)) {
      groupedMOM.set(key, {
        name: baseName,
        year: h.year,
        isoDate: h.isoDate,
        endDate: h.endDate,
        day: h.day,
        observedDate: isObserved ? h.isoDate : null,
        observedDay: isObserved ? h.day : null,
        hasObserved: isObserved
      });
    } else {
      const existing = groupedMOM.get(key);
      if (isObserved) {
        existing.observedDate = h.isoDate;
        existing.observedDay = h.day;
        existing.hasObserved = true;
      } else {
        existing.endDate = h.isoDate;
        existing.day = `${existing.day} ${h.day}`;
      }
    }
  }

  return Array.from(groupedMOM.values());
}

// Fallback dataset if MOM is offline
const FALLBACK_HOLIDAYS_RAW = [
  // 2025
  { name: "New Year's Day", isoDate: "2025-01-01", day: "Wednesday", year: 2025 },
  { name: "Chinese New Year", isoDate: "2025-01-29", endDate: "2025-01-30", day: "Wednesday Thursday", year: 2025 },
  { name: "Hari Raya Puasa", isoDate: "2025-03-31", day: "Monday", year: 2025 },
  { name: "Good Friday", isoDate: "2025-04-18", day: "Friday", year: 2025 },
  { name: "Labour Day", isoDate: "2025-05-01", day: "Thursday", year: 2025 },
  { name: "Vesak Day", isoDate: "2025-05-12", day: "Monday", year: 2025 },
  { name: "Hari Raya Haji", isoDate: "2025-06-07", day: "Saturday", year: 2025 },
  { name: "National Day", isoDate: "2025-08-09", day: "Saturday", year: 2025 },
  { name: "Deepavali", isoDate: "2025-10-20", day: "Monday", year: 2025 },
  { name: "Christmas Day", isoDate: "2025-12-25", day: "Thursday", year: 2025 },
  // 2026
  { name: "New Year's Day", isoDate: "2026-01-01", day: "Thursday", year: 2026 },
  { name: "Chinese New Year", isoDate: "2026-02-17", endDate: "2026-02-18", day: "Tuesday Wednesday", year: 2026 },
  { name: "Hari Raya Puasa", isoDate: "2026-03-21", day: "Saturday", year: 2026 },
  { name: "Good Friday", isoDate: "2026-04-03", day: "Friday", year: 2026 },
  { name: "Labour Day", isoDate: "2026-05-01", day: "Friday", year: 2026 },
  { name: "Hari Raya Haji", isoDate: "2026-05-27", day: "Wednesday", year: 2026 },
  { name: "Vesak Day", isoDate: "2026-05-31", day: "Sunday", year: 2026 },
  { name: "National Day", isoDate: "2026-08-09", day: "Sunday", year: 2026 },
  { name: "Deepavali", isoDate: "2026-11-08", day: "Sunday", year: 2026 },
  { name: "Christmas Day", isoDate: "2026-12-25", day: "Friday", year: 2026 },
  // 2027
  { name: "New Year's Day", isoDate: "2027-01-01", day: "Friday", year: 2027 },
  { name: "Chinese New Year", isoDate: "2027-02-06", endDate: "2027-02-07", day: "Saturday Sunday", year: 2027 },
  { name: "Hari Raya Puasa", isoDate: "2027-03-10", day: "Wednesday", year: 2027 },
  { name: "Good Friday", isoDate: "2027-03-26", day: "Friday", year: 2027 },
  { name: "Labour Day", isoDate: "2027-05-01", day: "Saturday", year: 2027 },
  { name: "Hari Raya Haji", isoDate: "2027-05-17", day: "Monday", year: 2027 },
  { name: "Vesak Day", isoDate: "2027-05-20", day: "Thursday", year: 2027 },
  { name: "National Day", isoDate: "2027-08-09", day: "Monday", year: 2027 },
  { name: "Deepavali", isoDate: "2027-10-29", day: "Friday", year: 2027 },
  { name: "Christmas Day", isoDate: "2027-12-25", day: "Saturday", year: 2027 }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const requestedYear = query.year ? query.year.toString().toLowerCase() : '2026';
  const forceRefresh = query.refresh === 'true';

  let rawHolidays = [];
  let isLive = false;

  const now = Date.now();
  if (!forceRefresh && cachedHolidays && (now - lastFetchTime < CACHE_TTL_MS)) {
    rawHolidays = cachedHolidays;
    isLive = true;
  } else {
    try {
      rawHolidays = await fetchFromDataGovSg();
      if (rawHolidays && rawHolidays.length > 0) {
        cachedHolidays = rawHolidays;
        lastFetchTime = now;
        lastSourceType = 'data_gov_sg_collection_691';
        isLive = true;
      } else {
        throw new Error('No records returned from Data.gov.sg');
      }
    } catch (dataGovErr) {
      console.warn('[Data.gov.sg Collection 691 API] Fetch failed, falling back to MOM website:', dataGovErr.message);
      try {
        rawHolidays = await fetchFromMOM();
        if (rawHolidays && rawHolidays.length > 0) {
          cachedHolidays = rawHolidays;
          lastFetchTime = now;
          lastSourceType = 'mom_gov_sg_scraper';
          isLive = true;
        } else {
          rawHolidays = FALLBACK_HOLIDAYS_RAW;
          lastSourceType = 'fallback_dataset';
        }
      } catch (momErr) {
        console.warn('[MOM API Scraper] Live fetch failed, using official fallback:', momErr.message);
        rawHolidays = cachedHolidays || FALLBACK_HOLIDAYS_RAW;
        lastSourceType = 'fallback_dataset';
      }
    }
  }

  const refDate = new Date();
  let enriched = rawHolidays.map(h => enrichHoliday(h, refDate));

  if (requestedYear !== 'all') {
    const yearInt = parseInt(requestedYear, 10) || 2026;
    enriched = enriched.filter(h => h.year === yearInt);
  }

  // Sort upcoming first
  enriched.sort((a, b) => {
    if (a.daysRemaining >= 0 && b.daysRemaining >= 0) return a.daysRemaining - b.daysRemaining;
    if (a.daysRemaining >= 0) return -1;
    if (b.daysRemaining >= 0) return 1;
    return b.daysRemaining - a.daysRemaining;
  });

  return res.status(200).json({
    success: true,
    source: isLive ? (lastSourceType || 'data_gov_sg_collection_691') : 'cached_official_mom',
    sourceUrl: 'https://data.gov.sg/collections/691/view',
    collectionId: '691',
    agency: 'Ministry of Manpower (MOM)',
    year: requestedYear,
    totalCount: enriched.length,
    holidays: enriched,
    meta: {
      cached: !forceRefresh && !!cachedHolidays,
      lastUpdated: new Date(lastFetchTime || Date.now()).toISOString(),
      t10TriggerCount: enriched.filter(h => h.isUrgent).length
    }
  });
}
