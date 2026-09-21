// Vercel Serverless Function: Google News & Serper Proxy
// Primary: Serper.dev Google News API (when key is available)
// Resilient Fallback: Real-time Google News RSS Feed (Zero-key live search for Singapore & regional news)

async function fetchGoogleNewsRSS(query, maxResults = 10, tbs = 'qdr:d') {
  const cleanQuery = (query || 'Brother Singapore workplace').trim();
  
  let refinedQuery = cleanQuery;
  if (cleanQuery.toLowerCase() === 'brother singapore') {
    refinedQuery = '"Brother Singapore" OR (Brother printer Singapore) OR (Brother International Singapore)';
  }
  
  // Map tbs parameter to Google News RSS timeframe syntax when applicable
  let timeframeParam = '';
  if (tbs === 'qdr:h' || tbs === 'qdr:d') {
    timeframeParam = ' when:7d'; // Use 7d window for RSS to avoid 0-result drops while keeping fresh
  } else if (tbs === 'qdr:w') {
    timeframeParam = ' when:14d';
  } else if (tbs === 'qdr:m') {
    timeframeParam = ' when:30d';
  }

  const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(refinedQuery + timeframeParam)}&hl=en-SG&gl=SG&ceid=SG:en`;
  
  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    // If timeframeParam narrowed too much, try basic query without timeframe
    const fallbackUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=en-SG&gl=SG&ceid=SG:en`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    if (!fallbackRes.ok) {
      throw new Error(`Google News RSS responded with status ${response.status}`);
    }
    return parseGoogleNewsXml(await fallbackRes.text(), cleanQuery, maxResults);
  }

  const xmlText = await response.text();
  const items = parseGoogleNewsXml(xmlText, cleanQuery, maxResults);

  // If 0 items found with timeframe restriction, retry once with base query
  if (items.length === 0 && timeframeParam) {
    try {
      const fallbackUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanQuery)}&hl=en-SG&gl=SG&ceid=SG:en`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      });
      if (fallbackRes.ok) {
        return parseGoogleNewsXml(await fallbackRes.text(), cleanQuery, maxResults);
      }
    } catch (e) {
      // Ignore retry error and return empty
    }
  }

  return items;
}

function parseGoogleNewsXml(xml, query, maxResults = 10) {
  const items = [];
  const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>(?:[\s\S]*?<source[^>]*>(.*?)<\/source>)?[\s\S]*?<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) && items.length < maxResults) {
    let rawTitle = match[1] || '';
    // Decode XML entities
    rawTitle = rawTitle
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    const link = match[2] || '';
    const pubDate = match[3] || '';
    let source = (match[4] || '')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .trim();

    // Remove source duplication from title if present
    if (!source && rawTitle.includes(' - ')) {
      const parts = rawTitle.split(' - ');
      source = parts.pop().trim();
      rawTitle = parts.join(' - ').trim();
    } else if (source && rawTitle.endsWith(` - ${source}`)) {
      rawTitle = rawTitle.slice(0, -(source.length + 3)).trim();
    }

    // Relative date formatting
    let dateStr = pubDate;
    try {
      const pTime = new Date(pubDate).getTime();
      const diffMs = Date.now() - pTime;
      const diffHrs = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
      if (diffHrs < 1) {
        dateStr = 'Just now';
      } else if (diffHrs < 24) {
        dateStr = `${diffHrs} hours ago`;
      } else {
        const diffDays = Math.round(diffHrs / 24);
        dateStr = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
      }
    } catch (e) {}

    const cleanSource = source || 'Google News Verified';
    items.push({
      title: rawTitle,
      link,
      snippet: `Latest report from ${cleanSource}: "${rawTitle}". Relevant for Singapore enterprise workplace discussions, employee initiatives, and industry updates.`,
      date: dateStr,
      source: cleanSource,
      imageUrl: null
    });
  }

  return items;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-API-KEY'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, tbs, num, apiKey } = req.body || {};
  const headerKey = req.headers['x-api-key'];
  const activeKey = (apiKey || headerKey || process.env.SERPER_API_KEY || process.env.VITE_SERPER_API_KEY || '').trim();

  // 1. Try Serper.dev if an API key is available
  if (activeKey) {
    try {
      const response = await fetch('https://google.serper.dev/news', {
        method: 'POST',
        headers: {
          'X-API-KEY': activeKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: (query || 'Singapore AI enterprise').trim(),
          num: num || 10,
          tbs: tbs || 'qdr:d'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.news && data.news.length > 0) {
          return res.status(200).json(data);
        }
      }
    } catch (serperErr) {
      console.warn('Serper API call failed, falling back to Google News RSS:', serperErr.message);
    }
  }

  // 2. Resilient Fallback: Google News RSS Feed (Requires no API key, works globally)
  try {
    const rssNews = await fetchGoogleNewsRSS(query, num || 10, tbs || 'qdr:d');
    return res.status(200).json({
      news: rssNews,
      source: 'google-news-rss',
      query: (query || '').trim()
    });
  } catch (rssErr) {
    console.error('Google News RSS fetch error:', rssErr);
    return res.status(500).json({
      error: rssErr.message || 'Failed to retrieve news from Google News feed.'
    });
  }
}
