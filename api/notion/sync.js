// Vercel Serverless Function: Sync Final Posts & Telemetry to Notion Repository Database

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
  const singlePost = req.body?.post;
  const postsList = req.body?.posts || (singlePost ? [singlePost] : null);

  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'Missing NOTION_API_KEY.' });
  }

  if (!postsList || postsList.length === 0) {
    return res.status(400).json({ success: false, error: 'Missing post data to sync.' });
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  try {
    let targetDbId = (databaseId || '3c701136de4881de9d29ca4ea415e856').replace(/-/g, '');

    // If targetDbId is the parent page ID (ending with 000b3c706126), redirect to Posts Database
    if (targetDbId.includes('000b3c706126') || targetDbId.includes('8101')) {
      targetDbId = '3c701136de4881de9d29ca4ea415e856';
    }

    // Auto-discover Posts Database if target is invalid or not found
    let dbProps = {};
    try {
      const dbMetaRes = await fetch(`https://api.notion.com/v1/databases/${targetDbId}`, {
        method: 'GET',
        headers
      });
      if (dbMetaRes.ok) {
        const dbMeta = await dbMetaRes.json();
        dbProps = dbMeta.properties || {};
      } else {
        // Try searching for Posts Database
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
            return title.includes('post') || title.includes('repository') || title.includes('archive');
          }) || dbs[0];
          if (postsDb) {
            targetDbId = postsDb.id.replace(/-/g, '');
            dbProps = postsDb.properties || {};
          }
        }
      }
    } catch (e) {
      console.warn('Database discovery warning:', e.message);
    }

    // Ensure database has telemetry columns (Impressions, Reactions, Comments, Reposts, Engagement Rate, LinkedIn URN)
    try {
      const missingProps = {};
      const lowerPropKeys = Object.keys(dbProps).map(k => k.toLowerCase());
      if (!lowerPropKeys.includes('impressions')) {
        missingProps['Impressions'] = { number: { format: 'number' } };
      }
      if (!lowerPropKeys.includes('reactions') && !lowerPropKeys.includes('likes')) {
        missingProps['Reactions'] = { number: { format: 'number' } };
      }
      if (!lowerPropKeys.includes('comments')) {
        missingProps['Comments'] = { number: { format: 'number' } };
      }
      if (!lowerPropKeys.includes('reposts')) {
        missingProps['Reposts'] = { number: { format: 'number' } };
      }
      if (!lowerPropKeys.includes('engagement rate') && !lowerPropKeys.includes('engagement')) {
        missingProps['Engagement Rate'] = { rich_text: {} };
      }
      if (!lowerPropKeys.includes('linkedin urn') && !lowerPropKeys.includes('urn')) {
        missingProps['LinkedIn URN'] = { rich_text: {} };
      }

      if (Object.keys(missingProps).length > 0) {
        const patchRes = await fetch(`https://api.notion.com/v1/databases/${targetDbId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ properties: missingProps })
        });
        if (patchRes.ok) {
          const updatedMeta = await patchRes.json();
          dbProps = updatedMeta.properties || dbProps;
        }
      }
    } catch (e) {
      console.warn('Could not auto-add properties to database schema:', e.message);
    }

    const parseNum = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      const clean = String(val).replace(/[^0-9.]/g, '');
      return Number(clean) || 0;
    };

    const buildProperties = (post) => {
      const props = {
        'Title': {
          title: [{ type: 'text', text: { content: post.title || 'Untitled Post' } }]
        },
        'Status': {
          select: { name: post.status || 'Published' }
        },
        'Category': {
          select: { name: post.category || 'AI & Employer Branding' }
        },
        'Author': {
          select: { name: post.author || 'Allan Cheng' }
        }
      };

      if (post.date) {
        props['Scheduled Date'] = { date: { start: post.date } };
      }

      // Check schema before assigning analytics to avoid 400s
      const lowerMap = {};
      for (const key of Object.keys(dbProps)) {
        lowerMap[key.toLowerCase()] = key;
      }

      const assignIfSchema = (canonical, val, type) => {
        const matchKey = lowerMap[canonical.toLowerCase()];
        if (matchKey) {
          if (type === 'number') {
            props[matchKey] = { number: parseNum(val) };
          } else if (type === 'rich_text') {
            props[matchKey] = { rich_text: [{ type: 'text', text: { content: String(val || '') } }] };
          }
        } else {
          // Default fallbacks if schema wasn't pre-fetched
          if (type === 'number') {
            props[canonical] = { number: parseNum(val) };
          } else {
            props[canonical] = { rich_text: [{ type: 'text', text: { content: String(val || '') } }] };
          }
        }
      };

      if (post.impressions !== undefined) assignIfSchema('Impressions', post.impressions, 'number');
      if (post.likes !== undefined || post.reactions !== undefined) {
        assignIfSchema('Reactions', post.likes !== undefined ? post.likes : post.reactions, 'number');
      }
      if (post.comments !== undefined) assignIfSchema('Comments', post.comments, 'number');
      if (post.reposts !== undefined) assignIfSchema('Reposts', post.reposts, 'number');
      if (post.engagementRate !== undefined) assignIfSchema('Engagement Rate', post.engagementRate, 'rich_text');
      if (post.urn) assignIfSchema('LinkedIn URN', post.urn, 'rich_text');

      return props;
    };

    const buildBlocks = (post) => {
      const blocks = [];

      // Telemetry Callout Block
      const telemetryLine = `📊 Impressions: ${post.impressions ? Number(post.impressions).toLocaleString() : 'N/A'} | Reactions: ${post.likes || post.reactions || 0} | Comments: ${post.comments || 0} | Reposts: ${post.reposts || 0} | Engagement Rate: ${post.engagementRate || 'N/A'}`;
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          icon: { type: 'emoji', emoji: '📈' },
          rich_text: [{ type: 'text', text: { content: telemetryLine } }]
        }
      });

      // Final Post Content
      const finalCopy = post.content || post.finalContent || post.draft1 || '';
      if (finalCopy) {
        blocks.push({
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: '📢 Published LinkedIn Post' } }]
          }
        });
        blocks.push({
          object: 'block',
          type: 'callout',
          callout: {
            icon: { type: 'emoji', emoji: '📝' },
            rich_text: [{ type: 'text', text: { content: finalCopy } }]
          }
        });
      }

      if (post.urn || post.postUrl) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              { type: 'text', text: { content: 'LinkedIn Reference: ' } },
              { type: 'text', text: { content: post.postUrl || post.urn || 'Brother Singapore Page' } }
            ]
          }
        });
      }

      return blocks;
    };

    const results = [];

    for (const post of postsList) {
      // 1. Check if page already exists by Title in database
      let existingPageId = null;
      try {
        const queryRes = await fetch(`https://api.notion.com/v1/databases/${targetDbId}/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            filter: {
              property: 'Title',
              title: { equals: post.title }
            },
            page_size: 1
          })
        });
        if (queryRes.ok) {
          const queryData = await queryRes.json();
          if (queryData.results && queryData.results.length > 0) {
            existingPageId = queryData.results[0].id;
          }
        }
      } catch (e) {
        console.warn('Error querying existing post in Notion:', e.message);
      }

      if (existingPageId) {
        // Update existing page properties (telemetry update)
        const updateRes = await fetch(`https://api.notion.com/v1/pages/${existingPageId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            properties: buildProperties(post)
          })
        });
        if (updateRes.ok) {
          const updatedPage = await updateRes.json();
          results.push({
            title: post.title,
            action: 'updated',
            pageId: updatedPage.id,
            url: updatedPage.url
          });
          continue;
        }
      }

      // Create new page
      const createRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: targetDbId },
          properties: buildProperties(post),
          children: buildBlocks(post)
        })
      });

      if (createRes.ok) {
        const createdPage = await createRes.json();
        results.push({
          title: post.title,
          action: 'created',
          pageId: createdPage.id,
          url: createdPage.url
        });
      } else {
        const err = await createRes.json();
        results.push({
          title: post.title,
          action: 'error',
          error: err.message || createRes.statusText
        });
      }
    }

    const successCount = results.filter(r => r.action !== 'error').length;

    return res.status(200).json({
      success: true,
      message: `Successfully synchronized ${successCount} post(s) to Notion Repository!`,
      databaseId: targetDbId,
      results,
      url: results[0]?.url || `https://notion.so/${targetDbId}`
    });
  } catch (error) {
    console.error('Error syncing to Notion repository:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync posts to Notion repository'
    });
  }
}
