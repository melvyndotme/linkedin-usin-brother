// Vercel Serverless Function: Persistent Custom Events & Campaigns Hub
// Connects to Notion Database "LinkedUsIn: Calendar Events & Campaigns" (ID: 3f101136de4881aeb226f12f0a1283cd)
// Provides bidirectional sync across desktop, mobile PWA, and multiple team members

const KNOWN_EVENTS_DB_ID = '3f101136de4881aeb226f12f0a1283cd';
const PARENT_PAGE_ID = '3c701136de48802bba88ede64e4c0cc0'; // LinkedUsIn Hub

// In-memory fallback cache
let inMemoryCache = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15 * 1000; // 15 seconds

function getDayName(dateStr) {
  try {
    const d = new Date(dateStr);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[d.getDay()] || 'Friday';
  } catch (e) {
    return 'Friday';
  }
}

function parseNotionPageToEvent(page) {
  const props = page.properties || {};
  const name = props['Event Name']?.title?.[0]?.plain_text || props['Event Name']?.title?.[0]?.text?.content || 'Untitled Event';
  const date = props['Date']?.date?.start || new Date().toISOString().split('T')[0];
  const category = props['Category']?.select?.name || 'Promotions & Campaigns';
  const theme = props['Theme']?.select?.name || 'red';
  const eventType = props['Event Type']?.select?.name || 'promotion';
  const eventId = props['Event ID']?.rich_text?.[0]?.plain_text || page.id;
  const details = props['Details']?.rich_text?.[0]?.plain_text || '';
  const url = props['URL']?.url || '';
  const badgeText = props['Badge']?.rich_text?.[0]?.plain_text || 'Official Brother';
  const hashtagsRaw = props['Hashtags']?.rich_text?.[0]?.plain_text || '';
  
  let suggestedHashtags = ['#BrotherSingapore', '#AtYourSide'];
  if (hashtagsRaw) {
    suggestedHashtags = hashtagsRaw.split(',').map(s => s.trim()).filter(Boolean);
  }

  const yr = date ? date.split('-')[0] : '2026';
  const day = getDayName(date);

  return {
    id: eventId,
    pageId: page.id,
    name,
    date,
    year: yr,
    day,
    category,
    eventType,
    badgeText,
    subtitle: details || `${name} • Brother Singapore`,
    theme,
    details,
    url,
    promoUrl: url,
    suggestedHashtags,
    isCustom: true
  };
}

async function findOrCreateEventsDatabase(headers) {
  // 1. Verify known DB
  try {
    const metaRes = await fetch(`https://api.notion.com/v1/databases/${KNOWN_EVENTS_DB_ID}`, {
      method: 'GET',
      headers
    });
    if (metaRes.ok) {
      return KNOWN_EVENTS_DB_ID;
    }
  } catch (e) {
    console.warn('Known DB check warning:', e.message);
  }

  // 2. Search for existing events database
  try {
    const searchRes = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: { value: 'database', property: 'object' },
        query: 'Calendar Events'
      })
    });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const match = (searchData.results || []).find(d => {
        const title = (d.title || []).map(t => t.plain_text).join('').toLowerCase();
        return title.includes('calendar events') || title.includes('events & campaigns');
      });
      if (match) return match.id.replace(/-/g, '');
    }
  } catch (e) {
    console.warn('Search for events DB warning:', e.message);
  }

  return KNOWN_EVENTS_DB_ID;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.body?.apiKey || req.query?.apiKey || process.env.NOTION_API_KEY;

  const headers = apiKey ? {
    'Authorization': `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  } : null;

  // 1. GET: List all custom events
  if (req.method === 'GET') {
    const now = Date.now();
    if (inMemoryCache && (now - lastCacheTime < CACHE_TTL_MS) && !req.query?.refresh) {
      return res.status(200).json({
        success: true,
        events: inMemoryCache,
        cached: true,
        total: inMemoryCache.length
      });
    }

    if (!headers) {
      return res.status(200).json({
        success: true,
        events: inMemoryCache || [],
        notionConnected: false,
        total: (inMemoryCache || []).length
      });
    }

    try {
      const dbId = await findOrCreateEventsDatabase(headers);
      const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          page_size: 100,
          filter: {
            property: 'Event Name',
            title: { is_not_empty: true }
          },
          sorts: [
            {
              property: 'Date',
              direction: 'ascending'
            }
          ]
        })
      });

      if (!queryRes.ok) {
        const errJson = await queryRes.json();
        throw new Error(errJson.message || 'Failed to query Notion database');
      }

      const queryData = await queryRes.json();
      const results = queryData.results || [];
      const events = results.map(parseNotionPageToEvent);

      inMemoryCache = events;
      lastCacheTime = now;

      return res.status(200).json({
        success: true,
        events,
        databaseId: dbId,
        notionConnected: true,
        total: events.length
      });
    } catch (err) {
      console.warn('Error fetching events from Notion:', err.message);
      return res.status(200).json({
        success: true,
        events: inMemoryCache || [],
        error: err.message,
        notionConnected: false,
        total: (inMemoryCache || []).length
      });
    }
  }

  // 2. POST: Create or Update an Event
  if (req.method === 'POST') {
    const { event, events } = req.body || {};
    const eventsToSave = events && Array.isArray(events) ? events : (event ? [event] : []);

    if (eventsToSave.length === 0) {
      return res.status(400).json({ success: false, error: 'No event provided to save.' });
    }

    if (!headers) {
      // Store in memory cache
      for (const ev of eventsToSave) {
        if (!inMemoryCache) inMemoryCache = [];
        const idx = inMemoryCache.findIndex(e => e.id === ev.id);
        if (idx >= 0) inMemoryCache[idx] = ev;
        else inMemoryCache.unshift(ev);
      }
      return res.status(200).json({
        success: true,
        savedInNotion: false,
        events: eventsToSave,
        message: 'Saved to local server memory (Notion API key not configured).'
      });
    }

    try {
      const dbId = await findOrCreateEventsDatabase(headers);
      const savedResults = [];

      for (const ev of eventsToSave) {
        const titleText = (ev.name || 'Untitled Event').trim();
        const dateVal = ev.date || new Date().toISOString().split('T')[0];
        const categoryVal = ev.category || 'Promotions & Campaigns';
        const themeVal = ev.theme || 'red';
        const typeVal = ev.eventType || 'promotion';
        const badgeVal = ev.badgeText || 'Official Brother';
        const detailsVal = (ev.details || ev.subtitle || '').trim();
        const eventIdVal = ev.id || `custom-${Date.now()}`;
        const urlVal = (ev.url || ev.promoUrl || '').trim();
        const hashtagsVal = Array.isArray(ev.suggestedHashtags) ? ev.suggestedHashtags.join(', ') : (ev.suggestedHashtags || '');

        const properties = {
          'Event Name': { title: [{ text: { content: titleText } }] },
          'Date': { date: { start: dateVal } },
          'Category': { select: { name: categoryVal } },
          'Theme': { select: { name: themeVal } },
          'Event Type': { select: { name: typeVal } },
          'Badge': { rich_text: [{ text: { content: badgeVal } }] },
          'Details': { rich_text: [{ text: { content: detailsVal.slice(0, 2000) } }] },
          'Event ID': { rich_text: [{ text: { content: eventIdVal } }] }
        };

        if (urlVal) {
          properties['URL'] = { url: urlVal };
        }
        if (hashtagsVal) {
          properties['Hashtags'] = { rich_text: [{ text: { content: hashtagsVal.slice(0, 1000) } }] };
        }

        // Check if page already exists in Notion by Event ID or exact Name
        let existingPageId = ev.pageId || null;
        if (!existingPageId) {
          try {
            const searchExisting = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                filter: {
                  or: [
                    { property: 'Event ID', rich_text: { equals: eventIdVal } },
                    { property: 'Event Name', title: { equals: titleText } }
                  ]
                },
                page_size: 1
              })
            });
            if (searchExisting.ok) {
              const resData = await searchExisting.json();
              if (resData.results && resData.results.length > 0) {
                existingPageId = resData.results[0].id;
              }
            }
          } catch (checkErr) {
            console.warn('Check existing event warning:', checkErr.message);
          }
        }

        if (existingPageId) {
          // Update existing page
          const patchRes = await fetch(`https://api.notion.com/v1/pages/${existingPageId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ properties })
          });
          if (patchRes.ok) {
            const updatedPage = await patchRes.json();
            savedResults.push({ ...ev, pageId: updatedPage.id, action: 'updated' });
            continue;
          }
        }

        // Create new page
        const createRes = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            parent: { database_id: dbId },
            properties
          })
        });

        if (createRes.ok) {
          const newPage = await createRes.json();
          savedResults.push({ ...ev, pageId: newPage.id, action: 'created' });
        } else {
          const errData = await createRes.json();
          console.warn('Failed to insert event into Notion:', errData.message);
          savedResults.push({ ...ev, action: 'local_only', error: errData.message });
        }
      }

      // Invalidate memory cache so next GET fetches fresh data
      inMemoryCache = null;
      lastCacheTime = 0;

      return res.status(200).json({
        success: true,
        savedInNotion: true,
        results: savedResults,
        event: savedResults[0] || eventsToSave[0]
      });
    } catch (err) {
      console.error('Error in POST /api/events:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // 3. DELETE: Archive an Event
  if (req.method === 'DELETE') {
    const id = req.query?.id || req.body?.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Event ID is required for deletion.' });
    }

    if (!headers) {
      if (inMemoryCache) {
        inMemoryCache = inMemoryCache.filter(e => e.id !== id && e.pageId !== id);
      }
      return res.status(200).json({ success: true, removedId: id });
    }

    try {
      const dbId = await findOrCreateEventsDatabase(headers);
      let pageIdToArchive = id.includes('-') && id.length >= 32 ? id : null;

      if (!pageIdToArchive) {
        // Query by Event ID property
        const searchRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            filter: {
              property: 'Event ID',
              rich_text: { equals: id }
            },
            page_size: 1
          })
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData.results && searchData.results.length > 0) {
            pageIdToArchive = searchData.results[0].id;
          }
        }
      }

      if (pageIdToArchive) {
        await fetch(`https://api.notion.com/v1/pages/${pageIdToArchive}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ archived: true })
        });
      }

      if (inMemoryCache) {
        inMemoryCache = inMemoryCache.filter(e => e.id !== id && e.pageId !== id);
      }

      return res.status(200).json({
        success: true,
        removedId: id,
        pageId: pageIdToArchive
      });
    } catch (err) {
      console.error('Error in DELETE /api/events:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
