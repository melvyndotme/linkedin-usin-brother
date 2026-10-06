import { safeGetItem } from './storage.js';

export function getGoogleNewsSearchUrl(query) {
  const q = (query || '').toLowerCase();
  if (q.includes('brother')) {
    return 'https://www.brother.com.sg/en/news';
  }
  return `https://news.google.com/search?q=${encodeURIComponent(query || 'Singapore enterprise')}&hl=en-SG&gl=SG&ceid=SG:en`;
}

export const EXTENDED_AI_NEWS = [];

export function formatAs120WordMarkdown(item) {
  if (!item) return '';
  const actualUrl = item.searchUrl || item.sourceUrl || getGoogleNewsSearchUrl(item.headline);
  return `## ${item.headline || 'Enterprise Intelligence'} - [${item.topic || 'Market Trends'}]
${item.summary120 || ''}
Source: [${item.sourceTitle || 'Google News Search Result'}](${actualUrl})`;
}

export function getEffectiveSerperKey() {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SERPER_API_KEY || import.meta.env.VITE_SERPER_KEY)) || '';
  return (safeGetItem('key_serper') || envKey || '').trim();
}

/**
 * Validate Serper API key
 */
export async function testSerperKey(apiKey) {
  const keyToTest = (apiKey || getEffectiveSerperKey()).trim();
  
  if (keyToTest) {
    const response = await fetch("https://google.serper.dev/news", {
      method: "POST",
      headers: {
        "X-API-KEY": keyToTest,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: "Singapore AI enterprise",
        num: 1
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      let msg = response.statusText;
      try {
        msg = JSON.parse(errBody)?.message || msg;
      } catch (e) {}
      throw new Error(`Serper API error (${response.status}): ${msg}`);
    }

    const data = await response.json();
    return { success: true, count: data.news?.length || 0 };
  }

  // Try serverless endpoint if no local key
  try {
    const proxyRes = await fetch("/api/serper/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "Singapore AI enterprise", num: 1 })
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return { success: true, count: data.news?.length || 0 };
    }
  } catch (e) {}

  throw new Error("No Serper API key provided or found in environment variables.");
}

/**
 * Strict date verification helper
 * Ensures older results do not leak into tight timeframes (e.g. 24 hours)
 */
function isDateWithinWindow(dateStr, unit, number) {
  if (!dateStr) return true;
  const lower = dateStr.toLowerCase().trim();

  // If user requested hours or 1 day:
  if (unit === "hours" || (unit === "days" && number <= 1)) {
    if (lower.includes("week") || lower.includes("month") || lower.includes("year")) {
      return false;
    }
    const monthPattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i;
    if (monthPattern.test(lower)) {
      return false;
    }
    return true;
  }

  // If user requested days:
  if (unit === "days") {
    if (lower.includes("month") || lower.includes("year")) return false;
    const dayMatch = lower.match(/(\d+)\s*day/);
    if (dayMatch && parseInt(dayMatch[1], 10) > number) return false;
    if (lower.includes("week")) {
      const match = lower.match(/(\d+)\s*week/);
      const weeks = match ? parseInt(match[1], 10) : 1;
      if (weeks * 7 > number) return false;
    }
    return true;
  }

  // If user requested weeks:
  if (unit === "weeks") {
    if (lower.includes("year")) return false;
    if (lower.includes("month")) {
      const match = lower.match(/(\d+)\s*month/);
      if (match && parseInt(match[1]) > 1) return false;
    }
    return true;
  }

  // If user requested months:
  if (unit === "months") {
    if (lower.includes("year")) return false;
    const match = lower.match(/(\d+)\s*month/);
    if (match && parseInt(match[1]) > number) return false;
    return true;
  }

  return true;
}

export function refineQueryForSearch(query) {
  const clean = (query || 'enterprise agentic AI productivity').trim();
  const lower = clean.toLowerCase();
  if (lower === 'brother singapore' || lower.includes('brother singapore') || lower === 'brother' || lower.includes('brother international')) {
    return '("Brother International" OR "Brother Singapore" OR "Brother Industries" OR "Brother printer")';
  }
  return clean;
}

/**
 * Execute real-time news search via Serper.dev with date-filtering (tbs parameter)
 */
export async function searchSerperWithTimeframe({
  apiKey = "",
  query = "enterprise agentic AI productivity",
  number = 24,
  unit = "hours", // 'hours', 'days', 'weeks', 'months'
  maxResults = 5
}) {
  const activeKey = (apiKey || getEffectiveSerperKey()).trim();

  // Convert number + unit into Serper standard `tbs` Google time parameter
  let tbs = "qdr:d";
  if (unit === "hours") {
    tbs = number <= 1 ? "qdr:h" : "qdr:d";
  } else if (unit === "days") {
    tbs = number <= 1 ? "qdr:d" : number <= 7 ? "qdr:w" : "qdr:m";
  } else if (unit === "weeks") {
    tbs = number <= 1 ? "qdr:w" : "qdr:m";
  } else if (unit === "months") {
    tbs = "qdr:m";
  }

  const refinedTargetQuery = refineQueryForSearch(query);

  const searchPayload = {
    q: refinedTargetQuery,
    num: Math.max(maxResults * 2, 10), // Fetch candidates to filter strictly
    tbs
  };

  let rawNewsItems = null;

  // 1. Direct call if client-side key exists
  if (activeKey) {
    try {
      const response = await fetch("https://google.serper.dev/news", {
        method: "POST",
        headers: {
          "X-API-KEY": activeKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(searchPayload)
      });

      if (!response.ok) {
        const errText = await response.text();
        let msg = response.statusText;
        try {
          msg = JSON.parse(errText)?.message || msg;
        } catch (e) {}
        throw new Error(`Serper API (${response.status}): ${msg}`);
      }

      const data = await response.json();
      rawNewsItems = data.news || [];
    } catch (err) {
      console.error("Direct Serper API error:", err);
      throw err;
    }
  } else {
    // 2. Try Vercel Serverless proxy (which now supports Google News RSS fallback)
    try {
      const proxyRes = await fetch("/api/serper/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchPayload.q,
          num: searchPayload.num,
          tbs: searchPayload.tbs
        })
      });
      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.news && Array.isArray(data.news) && data.news.length > 0) {
          rawNewsItems = data.news;
        }
      }
    } catch (e) {
      console.warn("Serverless news proxy not reachable, falling back to dynamic synthesis:", e.message);
    }
  }

  // If live results were fetched from either direct Serper or backend proxy:
  if (rawNewsItems !== null && rawNewsItems.length > 0) {
    const validItems = rawNewsItems.filter(item => isDateWithinWindow(item.date, unit, number));
    // If strict timeframe filtered everything out, gracefully use the freshest available live articles
    const itemsToMap = validItems.length > 0 ? validItems : rawNewsItems;

    const mapped = itemsToMap.slice(0, maxResults).map((item, idx) => {
      // Direct publisher article URL from Serper
      const directArticleUrl = item.link || '';
      return {
        id: `serper-${Date.now()}-${idx}`,
        headline: item.title,
        topic: query,
        timeAgo: item.date || `${number} ${unit} ago`,
        summary120: item.snippet || item.title || '',
        sourceTitle: item.source || "Industry Source",
        sourceUrl: directArticleUrl,
        link: directArticleUrl,
        timeframe: item.date || `${number} ${unit}`,
        imageUrl: item.imageUrl || null,
        isLive: true
      };
    });

    return {
      isLive: true,
      hasKey: Boolean(activeKey),
      results: mapped,
      totalFound: mapped.length,
      source: activeKey ? "Serper.dev" : "Live News"
    };
  }

  // If 0 live results found, return an honest empty results array.
  // DO NOT fall back to synthetic news. DO NOT pad with fake articles.
  return {
    isLive: true,
    hasKey: Boolean(activeKey),
    results: [],
    totalFound: 0,
    source: activeKey ? "Serper.dev" : "Live News"
  };
}

/**
 * Returns empty array. Never synthesizes fake / hallucinated mock news articles.
 */
export function generateDynamicTopicalNews(query = "workplace productivity", maxResults = 5) {
  return [];
}

export function getFeaturedImageForArticle(item, topic = '') {
  // If imageUrl is a low-res Google thumbnail (encrypted-tbn0.gstatic.com or tbn), discard it so we never render blurry images
  const isLowResGoogleThumbnail = item?.imageUrl && (
    item.imageUrl.includes('encrypted-tbn0.gstatic.com') ||
    item.imageUrl.includes('tbn:') ||
    item.imageUrl.includes('googleusercontent.com')
  );

  // If there is an authentic external high-res publication image, use it
  if (item?.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http') && !isLowResGoogleThumbnail) {
    return item.imageUrl;
  }

  const text = `${item?.headline || ''} ${item?.topic || ''} ${topic || ''} ${item?.summary120 || ''}`.toLowerCase();
  const idStr = String(item?.id || item?.headline || 'news');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const pick = (arr) => arr[Math.abs(hash) % arr.length];

  if (text.includes('work-life') || text.includes('flexibility') || text.includes('schedule') || text.includes('parent') || text.includes('remote') || text.includes('9–5') || text.includes('9-5')) {
    return pick([
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=90'
    ]);
  }

  if (text.includes('productivity') || text.includes('engaged') || text.includes('manager') || text.includes('leaders') || text.includes('workforce') || text.includes('team') || text.includes('happiness')) {
    return pick([
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=90'
    ]);
  }

  if (text.includes('brother') || text.includes('printer') || text.includes('scanner') || text.includes('hardware') || text.includes('print') || text.includes('at your side') || text.includes('document')) {
    return pick([
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=90'
    ]);
  }

  if (text.includes('ai') || text.includes('agentic') || text.includes('automation') || text.includes('digital') || text.includes('technology') || text.includes('smart')) {
    return pick([
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=90'
    ]);
  }

  if (text.includes('sustainable') || text.includes('eco') || text.includes('green') || text.includes('esg') || text.includes('earth')) {
    return pick([
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=90',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=90'
    ]);
  }

  return pick([
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=90',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=90',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=90'
  ]);
}

/**
 * Returns a high-res brand favicon/icon URL for a publisher name or domain.
 */
export function getSourceFaviconUrl(sourceTitle = '', sourceUrl = '') {
  try {
    if (sourceUrl && sourceUrl.startsWith('http') && !sourceUrl.includes('google.com')) {
      const parsed = new URL(sourceUrl);
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    }
  } catch (e) {}

  const clean = (sourceTitle || '').toLowerCase();
  let domain = 'google.com';
  if (clean.includes('business.com')) domain = 'business.com';
  else if (clean.includes('cnbc')) domain = 'cnbc.com';
  else if (clean.includes('fast company')) domain = 'fastcompany.com';
  else if (clean.includes('gallup')) domain = 'gallup.com';
  else if (clean.includes('hospitality net')) domain = 'hospitalitynet.org';
  else if (clean.includes('barracuda')) domain = 'barracuda.com';
  else if (clean.includes('procter') || clean.includes('p&g')) domain = 'pg.com';
  else if (clean.includes('straits times')) domain = 'straitstimes.com';
  else if (clean.includes('cna') || clean.includes('channel newsasia')) domain = 'channelnewsasia.com';
  else if (clean.includes('business times')) domain = 'businesstimes.com.sg';
  else if (clean.includes('eco-business')) domain = 'eco-business.com';
  else if (clean.includes('pr newswire')) domain = 'prnewswire.com';
  else if (clean.includes('techcrunch')) domain = 'techcrunch.com';
  else if (clean.includes('venturebeat')) domain = 'venturebeat.com';
  else if (clean.includes('mit tech')) domain = 'technologyreview.com';

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

