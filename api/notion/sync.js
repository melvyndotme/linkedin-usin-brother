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
    const payload = {
      parent: { database_id: databaseId.replace(/-/g, '') },
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
        }
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
    };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await response.json();
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
