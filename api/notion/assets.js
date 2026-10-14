// Vercel Serverless Function: Stream Live Digital Assets from Notion Database
// Database ID: 3f101136de4881d69ba7ca159483a544 (Brother Regional Digital Assets)

import fs from 'fs';
import path from 'path';

const KNOWN_ASSETS_DB_ID = '3f101136de4881d69ba7ca159483a544';

// In-memory cache to ensure sub-100ms response times after initial load
let assetsCache = {
  data: null,
  timestamp: 0,
  ttlMs: 5 * 60 * 1000 // 5 minutes cache
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = req.body?.apiKey || req.query?.apiKey || process.env.NOTION_API_KEY;
  const targetDbId = (req.body?.databaseId || req.query?.databaseId || KNOWN_ASSETS_DB_ID).replace(/-/g, '');
  const filterCountry = req.query?.country || req.body?.country || 'all';
  const filterCategory = req.query?.category || req.body?.category || 'all';
  const searchQuery = (req.query?.search || req.body?.search || '').trim().toLowerCase();

  // 1. Check in-memory cache first
  const now = Date.now();
  if (assetsCache.data && (now - assetsCache.timestamp < assetsCache.ttlMs)) {
    let filtered = filterAssets(assetsCache.data, filterCountry, filterCategory, searchQuery);
    return res.status(200).json({
      success: true,
      source: 'notion-cache',
      liveNotion: true,
      totalAll: assetsCache.data.length,
      count: filtered.length,
      assets: filtered
    });
  }

  // 2. Fetch live from Notion API if key is present
  if (apiKey) {
    try {
      const headers = {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      };

      let cursor = undefined;
      let hasMore = true;
      const allResults = [];

      while (hasMore) {
        const notionRes = await fetch(`https://api.notion.com/v1/databases/${targetDbId}/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            page_size: 100,
            start_cursor: cursor
          })
        });

        if (!notionRes.ok) {
          console.warn(`Notion query error: HTTP ${notionRes.status}`);
          break;
        }

        const data = await notionRes.json();
        if (Array.isArray(data.results)) {
          data.results.forEach(p => {
            const props = p.properties || {};
            const name = props['Asset Name']?.title?.[0]?.plain_text || 'Brother Digital Asset';
            const imgUrl = props['Image URL']?.url ||
              props['Preview']?.files?.[0]?.external?.url ||
              props['Preview']?.files?.[0]?.file?.url ||
              p.cover?.external?.url ||
              p.cover?.file?.url || '';
            const country = props['Country']?.select?.name || 'Regional';
            const category = props['Category']?.select?.name || 'Marketing Asset';
            const sourceSite = props['Source Site']?.select?.name || 'Brother';

            if (imgUrl && typeof imgUrl === 'string' && (imgUrl.startsWith('http') || imgUrl.startsWith('data:image'))) {
              // Exclude tiny icons, site logos, social badges, and navigation arrows
              if (!isIrrelevantAsset(name, imgUrl, category)) {
                allResults.push({
                  id: p.id,
                  title: name,
                  name: name,
                  url: imgUrl,
                  thumb: imgUrl,
                  country,
                  category,
                  sourceSite,
                  source: 'notion-live'
                });
              }
            }
          });
        }

        hasMore = Boolean(data.has_more);
        cursor = data.next_cursor;
      }

      if (allResults.length > 0) {
        assetsCache = {
          data: allResults,
          timestamp: Date.now(),
          ttlMs: 5 * 60 * 1000
        };

        let filtered = filterAssets(allResults, filterCountry, filterCategory, searchQuery);
        return res.status(200).json({
          success: true,
          source: 'notion-live',
          liveNotion: true,
          totalAll: allResults.length,
          count: filtered.length,
          assets: filtered
        });
      }
    } catch (err) {
      console.warn('Failed querying Notion live assets, falling back to cached file:', err.message);
    }
  }

  // 3. Fallback: Load from local scraped records (data/brother_scraped_images.json)
  try {
    const dataPath = path.join(process.cwd(), 'data/brother_scraped_images.json');
    if (fs.existsSync(dataPath)) {
      const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const records = (raw.records || [])
        .filter(r => !isIrrelevantAsset(r.name || r.filename, r.imageUrl, r.category))
        .map(r => ({
          id: r.id || `scraped-${Math.random().toString(36).substring(7)}`,
          title: r.name || r.filename || 'Brother Digital Asset',
          name: r.name || r.filename || 'Brother Digital Asset',
          url: r.imageUrl,
          thumb: r.imageUrl,
          country: r.country || 'Regional',
          category: r.category || 'Marketing Asset',
          sourceSite: r.sourceSite || 'Brother',
          source: 'local-sync'
        }));

      assetsCache = {
        data: records,
        timestamp: Date.now(),
        ttlMs: 60 * 1000
      };

      let filtered = filterAssets(records, filterCountry, filterCategory, searchQuery);
      return res.status(200).json({
        success: true,
        source: 'local-fallback',
        liveNotion: false,
        totalAll: records.length,
        count: filtered.length,
        assets: filtered
      });
    }
  } catch (fsErr) {
    console.error('Error reading scraped fallback data:', fsErr);
  }

  return res.status(200).json({
    success: true,
    source: 'empty',
    totalAll: 0,
    count: 0,
    assets: []
  });
}

function filterAssets(assets, country, category, search) {
  return assets.filter(item => {
    if (country && country !== 'all') {
      if (item.country.toLowerCase() !== country.toLowerCase()) return false;
    }
    if (category && category !== 'all') {
      if (item.category.toLowerCase() !== category.toLowerCase()) return false;
    }
    if (search) {
      const target = `${item.title} ${item.country} ${item.category}`.toLowerCase();
      if (!target.includes(search)) return false;
    }
    return true;
  });
}

function isIrrelevantAsset(name = '', url = '', category = '') {
  const n = String(name || '').toLowerCase();
  const u = String(url || '').toLowerCase();
  const c = String(category || '').toLowerCase();

  // Exclude icon, logo, and UI categories
  if (c.includes('icon') || c.includes('logo') || c.includes('ui')) return true;

  // Exclude URLs pointing to icons, logos, buttons, arrows, headers, or social marks
  if (
    u.includes('/icon') ||
    u.includes('_icon') ||
    u.includes('link_icon') ||
    u.includes('logo_') ||
    u.includes('/logo') ||
    u.includes('common/img/header') ||
    u.includes('/btn') ||
    u.includes('_btn') ||
    u.includes('/arrow') ||
    u.includes('social') ||
    u.includes('facebook') ||
    u.includes('twitter') ||
    u.includes('youtube') ||
    u.includes('instagram') ||
    u.includes('favicon')
  ) {
    return true;
  }

  // Exclude titles indicating web navigational elements or symbols
  if (
    n.includes('[pdf]') ||
    n.includes('[新しいウィンドウ]') ||
    n.includes('検索') ||
    n.includes('search') ||
    n.includes('facebook') ||
    n.includes('twitter') ||
    n.includes('youtube') ||
    n.includes('logo') ||
    n.includes('favicon') ||
    n.includes('important_') ||
    n.includes('お知らせ')
  ) {
    return true;
  }

  return false;
}

