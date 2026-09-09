// Vercel Serverless Function: Sync Post Draft to Notion Posts & Drafts Database

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = req.body?.apiKey || process.env.NOTION_API_KEY;
  const databaseId = req.body?.databaseId;
  const post = req.body?.post;

  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'Missing NOTION_API_KEY.' });
  }

  if (!databaseId) {
    return res.status(400).json({ success: false, error: 'Missing Notion Database ID.' });
  }

  if (!post) {
    return res.status(400).json({ success: false, error: 'Missing post data to sync.' });
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  try {
    let targetDbId = databaseId.replace(/-/g, '');

    // If targetDbId is the parent page ID (ending with 000b3c706126), redirect to Posts Database
    if (targetDbId.includes('000b3c706126') || targetDbId.includes('8101')) {
      targetDbId = '3c701136de4881de9d29ca4ea415e856';
    }

    const buildPayload = (dbId) => ({
      parent: { database_id: dbId },
      properties: {
        'Title': {
          title: [{ type: 'text', text: { content: post.title || 'Untitled Post Draft' } }]
        },
        'Status': {
          select: { name: post.status || 'Draft' }
        },
        'Category': {
          select: { name: post.category || 'AI & Employer Branding' }
        },
        'Author': {
          select: { name: post.author || 'Allan Cheng' }
        },
        ...(post.sourceContext ? {
          'Source Context': {
            rich_text: [{ type: 'text', text: { content: post.sourceContext } }]
          }
        } : {}),
        ...(post.date ? {
          'Scheduled Date': {
            date: { start: post.date }
          }
        } : {})
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: { content: post.content || '' }
              }
            ]
          }
        }
      ]
    });

    let response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify(buildPayload(targetDbId))
    });

    let data = await response.json();

    // If could not find database, auto-discover via Notion Search API
    if (!response.ok && (data.message || '').toLowerCase().includes('could not find database')) {
      console.log('Database not found with given ID. Auto-discovering via Notion Search API...');
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
        const dbs = searchData.results || [];
        const postsDb = dbs.find(d => {
          const title = (d.title || []).map(t => t.plain_text).join('').toLowerCase();
          return title.includes('post') || title.includes('draft');
        }) || dbs[0];

        if (postsDb) {
          console.log(`Auto-discovered Posts Database ID: ${postsDb.id}`);
          targetDbId = postsDb.id.replace(/-/g, '');
          response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers,
            body: JSON.stringify(buildPayload(targetDbId))
          });
          data = await response.json();
        }
      }
    }

    if (!response.ok) {
      throw new Error(`Notion API error creating page: ${data.message || response.statusText}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Post successfully synced to Notion Posts Database!',
      pageId: data.id,
      url: data.url
    });
  } catch (error) {
    console.error('Error syncing to Notion:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync post to Notion'
    });
  }
}
