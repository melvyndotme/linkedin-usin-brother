// Vercel Serverless Function: Save or Seed Templates into Notion "LinkedUsIn: Template Library" Database

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = req.body?.apiKey || process.env.NOTION_API_KEY;
  let pageId = req.body?.pageId || process.env.NOTION_PAGE_ID || '3c701136-de48-8101-b258-000b3c706126';
  const template = req.body?.template; // Single template object to save
  const templates = req.body?.templates; // Array of templates to seed in bulk

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing Notion Secret Token. Please configure NOTION_API_KEY or provide apiKey in request.'
    });
  }

  const itemsToSave = templates && Array.isArray(templates) ? templates : (template ? [template] : []);

  if (itemsToSave.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No template provided to save.'
    });
  }

  // Format pageId
  pageId = pageId.trim();
  if (pageId.includes('notion.so') || pageId.includes('notion.site') || pageId.includes('notion.com')) {
    const parts = pageId.split('-');
    pageId = parts[parts.length - 1].split('?')[0];
  }
  pageId = pageId.replace(/-/g, '');

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  try {
    // 1. Locate or Auto-Discover the "LinkedUsIn: Template Library" Database
    let templateDbId = null;

    // Search via Notion Search API
    const searchRes = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: { value: 'database', property: 'object' },
        page_size: 50
      })
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const databases = searchData.results || [];
      const foundDb = databases.find(d => {
        const title = (d.title || []).map(t => t.plain_text).join('').toLowerCase();
        return title.includes('template library') || title.includes('template');
      });
      if (foundDb) {
        templateDbId = foundDb.id;
      }
    }

    // If not found, provision the Database under parent pageId
    if (!templateDbId) {
      const createDbRes = await fetch('https://api.notion.com/v1/databases', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { type: 'page_id', page_id: pageId },
          title: [{ type: 'text', text: { content: 'LinkedUsIn: Template Library' } }],
          icon: { type: 'emoji', emoji: '📚' },
          properties: {
            'Template Name': { title: {} },
            'Category': {
              select: {
                options: [
                  { name: 'Employer Branding & Culture', color: 'blue' },
                  { name: 'Talent Acquisition & Internships', color: 'purple' },
                  { name: 'Innovation & Kaizen', color: 'green' },
                  { name: 'Sustainability & ESG', color: 'emerald' },
                  { name: 'Leadership & Vision', color: 'orange' },
                  { name: 'Customer Partnership', color: 'pink' }
                ]
              }
            },
            'Tone': { rich_text: {} },
            'Source': { rich_text: {} },
            'Description': { rich_text: {} }
          }
        })
      });

      if (createDbRes.ok) {
        const createdDb = await createDbRes.json();
        templateDbId = createdDb.id;
      } else {
        const errData = await createDbRes.json();
        throw new Error(`Failed to create Template Library database in Notion: ${errData.message || createDbRes.statusText}`);
      }
    }

    // 2. Insert each template into the database
    const results = [];
    for (const item of itemsToSave) {
      const name = item.name || 'Custom Ingested Template';
      const category = item.category || 'Employer Branding & Culture';
      const tone = item.tone || 'Grounded, Professional';
      const source = item.source || 'AI Ingestion Engine';
      const description = item.description || '';
      const blueprint = item.placeholderTemplate || '';

      // Break long blueprint into Notion paragraph blocks (Notion allows max 2000 chars per text block)
      const chunks = [];
      let remaining = blueprint;
      while (remaining.length > 0) {
        chunks.push(remaining.substring(0, 1900));
        remaining = remaining.substring(1900);
      }

      const childrenBlocks = [
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: '📋 Post Template Blueprint' } }]
          }
        },
        ...chunks.map(chunk => ({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{ type: 'text', text: { content: chunk } }],
            language: 'markdown'
          }
        }))
      ];

      const pagePayload = {
        parent: { database_id: templateDbId },
        icon: { type: 'emoji', emoji: '📄' },
        properties: {
          'Template Name': {
            title: [{ text: { content: name } }]
          },
          'Category': {
            select: { name: category.substring(0, 95) }
          },
          'Tone': {
            rich_text: [{ text: { content: tone.substring(0, 1000) } }]
          },
          'Source': {
            rich_text: [{ text: { content: source.substring(0, 1000) } }]
          },
          'Description': {
            rich_text: [{ text: { content: description.substring(0, 1000) } }]
          }
        },
        children: childrenBlocks
      };

      const saveRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify(pagePayload)
      });

      if (saveRes.ok) {
        const savedPage = await saveRes.json();
        results.push({ success: true, id: savedPage.id, url: savedPage.url, name });
      } else {
        const errJson = await saveRes.json();
        results.push({ success: false, name, error: errJson.message || saveRes.statusText });
      }
    }

    const successfulCount = results.filter(r => r.success).length;
    const lastSavedUrl = results.find(r => r.success)?.url || `https://notion.so/${templateDbId.replace(/-/g, '')}`;

    return res.status(200).json({
      success: successfulCount > 0,
      savedCount: successfulCount,
      total: itemsToSave.length,
      databaseId: templateDbId,
      notionUrl: lastSavedUrl,
      results
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while saving to Notion'
    });
  }
}
