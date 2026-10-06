// Vercel Serverless Function: Sync Final Posts, Telemetry, and Audit Logs to Notion Database

function formatAuditLogs(results) {
  return results.map(page => {
    const props = page.properties || {};
    const event = props['Event']?.title?.[0]?.plain_text || props['Event']?.title?.[0]?.text?.content || 'Activity';
    const user = props['User']?.rich_text?.[0]?.plain_text || props['User']?.title?.[0]?.plain_text || 'Anonymous';
    const email = props['Email']?.email || props['Email']?.rich_text?.[0]?.plain_text || '';
    const role = props['Role']?.select?.name || props['Role']?.rich_text?.[0]?.plain_text || 'Team Member';
    const category = props['Category']?.select?.name || props['Category']?.rich_text?.[0]?.plain_text || 'System';
    const details = props['Details']?.rich_text?.[0]?.plain_text || '';
    const status = props['Status']?.select?.name || props['Status']?.rich_text?.[0]?.plain_text || 'Success';
    const timestamp = props['Timestamp']?.date?.start || page.created_time || new Date().toISOString();

    return {
      id: page.id,
      event,
      user,
      email,
      role,
      category,
      details,
      status,
      timestamp,
      url: page.url
    };
  });
}

async function getOrCreateAuditDatabase(headers, parentPageId) {
  // 1. Search for existing Audit Log database
  try {
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
      const auditDb = databases.find(d => {
        const title = (d.title || []).map(t => t.plain_text).join('').toLowerCase();
        return title.includes('audit') || title.includes('activity') || title.includes('telemetry log');
      });
      if (auditDb) return auditDb.id.replace(/-/g, '');
    }
  } catch (e) {
    console.warn('Error searching for audit db:', e.message);
  }

  // 2. Auto-create Audit Database if parent page is available
  const cleanParentId = (parentPageId || '3c701136de488101b258000b3c706126').replace(/-/g, '');
  try {
    const createDbRes = await fetch('https://api.notion.com/v1/databases', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { type: 'page_id', page_id: cleanParentId },
        icon: { type: 'emoji', emoji: '📋' },
        title: [{ type: 'text', text: { content: 'LinkedUsIn Activity & Audit Log' } }],
        properties: {
          'Event': { title: {} },
          'User': { rich_text: {} },
          'Email': { email: {} },
          'Role': {
            select: {
              options: [
                { name: 'Admin', color: 'blue' },
                { name: 'Reviewer', color: 'purple' },
                { name: 'Team Member', color: 'green' },
                { name: 'External Advisor', color: 'yellow' },
                { name: 'System', color: 'gray' }
              ]
            }
          },
          'Category': {
            select: {
              options: [
                { name: 'Auth', color: 'blue' },
                { name: 'Content Generation', color: 'green' },
                { name: 'Visual Studio', color: 'purple' },
                { name: 'Review Gate', color: 'orange' },
                { name: 'Publishing', color: 'red' },
                { name: 'Settings', color: 'pink' },
                { name: 'System', color: 'gray' }
              ]
            }
          },
          'Details': { rich_text: {} },
          'Status': {
            select: {
              options: [
                { name: 'Success', color: 'green' },
                { name: 'Warning', color: 'yellow' },
                { name: 'Error', color: 'red' },
                { name: 'Pending', color: 'gray' }
              ]
            }
          },
          'Timestamp': { date: {} }
        }
      })
    });

    if (createDbRes.ok) {
      const createdDb = await createDbRes.json();
      return createdDb.id.replace(/-/g, '');
    }
  } catch (err) {
    console.warn('Error auto-creating audit db:', err.message);
  }

  return null;
}

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

  const apiKey = req.body?.apiKey || req.query?.apiKey || process.env.NOTION_API_KEY;
  const databaseId = req.body?.databaseId || req.query?.databaseId;
  const action = req.body?.action || req.query?.action;

  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'Missing NOTION_API_KEY.' });
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  // 1. Database Seeding Routine
  if (action === 'seed') {
    try {
      const searchRes = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filter: { value: 'database', property: 'object' },
          page_size: 50
        })
      });

      if (!searchRes.ok) {
        const errData = await searchRes.json();
        return res.status(400).json({
          success: false,
          error: `Notion Search API error: ${errData.message || searchRes.statusText}`
        });
      }

      const searchData = await searchRes.json();
      const databases = searchData.results || [];
      const teamDb = databases.find(d => {
        const title = (d.title || []).map(t => t.plain_text).join('').toLowerCase();
        return title.includes('team') || title.includes('whitelist');
      });

      if (!teamDb) {
        return res.status(400).json({
          success: false,
          error: 'No Team Whitelist database found. Please ensure LinkedUsIn Studio is connected.'
        });
      }

      let existingEmails = new Set();
      let existingNames = new Set();
      try {
        const existingQuery = await fetch(`https://api.notion.com/v1/databases/${teamDb.id}/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ page_size: 100 })
        });
        if (existingQuery.ok) {
          const existingJson = await existingQuery.json();
          (existingJson.results || []).forEach(p => {
            const email = (p.properties['Email']?.email || p.properties['Email']?.rich_text?.[0]?.plain_text || '').toLowerCase().trim();
            const name = (p.properties['Name']?.title?.[0]?.plain_text || p.properties['Name']?.title?.[0]?.text?.content || '').toLowerCase().trim();
            if (email) existingEmails.add(email);
            if (name) existingNames.add(name);
          });
        }
      } catch (e) {
        console.warn('Could not query existing team members in Notion:', e);
      }

      const members = [
        { name: 'Allan Cheng', email: 'allan.cheng@brother.com.sg' },
        { name: 'Chloe Lee', email: 'chloe.lee@brother.com.sg' },
        { name: 'Sean', email: 'sean.tan@brother.com.sg' },
        { name: 'Melvyn Tan', email: 'melvyn@befinityai.com' }
      ];

      let inserted = 0;
      let skipped = 0;

      for (const member of members) {
        const normalizedEmail = member.email.toLowerCase().trim();
        const normalizedName = member.name.toLowerCase().trim();
        if (existingEmails.has(normalizedEmail) || existingNames.has(normalizedName)) {
          skipped++;
          continue;
        }

        const insertRes = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            parent: { database_id: teamDb.id },
            properties: {
              'Name': { title: [{ text: { content: member.name } }] },
              'Email': { email: member.email },
              'Active': { checkbox: true }
            }
          })
        });
        if (insertRes.ok) inserted++;
      }

      return res.status(200).json({
        success: true,
        message: inserted > 0
          ? `Success! Inserted ${inserted} team members (${skipped} already present) into Notion.`
          : 'All team members are already present in Notion.'
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // 2. Audit Log - Write Event Routine
  if (action === 'log_audit' || action === 'audit_log') {
    const { event, user, email, role, category, details, status, timestamp } = req.body || {};
    if (!event) {
      return res.status(400).json({ success: false, error: 'Event name is required for audit logging.' });
    }

    try {
      const auditDbId = await getOrCreateAuditDatabase(headers, databaseId);
      if (!auditDbId) {
        return res.status(200).json({
          success: true,
          logged: false,
          message: 'Notion Audit Log database not found or could not be auto-created.'
        });
      }

      const isoTimestamp = timestamp || new Date().toISOString();
      const userStr = user || email?.split('@')[0] || 'Anonymous';
      const emailStr = email || '';
      const roleStr = role || 'Team Member';
      const categoryStr = category || 'System';
      const detailsStr = typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details || '');
      const statusStr = status || 'Success';

      const pageRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: auditDbId },
          properties: {
            'Event': {
              title: [{ type: 'text', text: { content: String(event).slice(0, 200) } }]
            },
            'User': {
              rich_text: [{ type: 'text', text: { content: String(userStr).slice(0, 200) } }]
            },
            ...(emailStr ? { 'Email': { email: emailStr } } : {}),
            'Role': {
              select: { name: roleStr }
            },
            'Category': {
              select: { name: categoryStr }
            },
            'Details': {
              rich_text: [{ type: 'text', text: { content: detailsStr.slice(0, 2000) } }]
            },
            'Status': {
              select: { name: statusStr }
            },
            'Timestamp': {
              date: { start: isoTimestamp }
            }
          }
        })
      });

      if (!pageRes.ok) {
        const errJson = await pageRes.json();
        return res.status(pageRes.status).json({
          success: false,
          error: errJson.message || 'Failed to insert audit log entry to Notion.'
        });
      }

      const pageData = await pageRes.json();
      return res.status(200).json({
        success: true,
        logged: true,
        pageId: pageData.id,
        url: pageData.url,
        message: `Audit event '${event}' recorded in Notion!`
      });
    } catch (e) {
      console.error('Audit log write error:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // 3. Audit Log - Read Events Routine
  if (action === 'get_audit_logs' || action === 'audit_list') {
    try {
      const auditDbId = await getOrCreateAuditDatabase(headers, databaseId);
      if (!auditDbId) {
        return res.status(200).json({ success: true, logs: [], total: 0 });
      }

      let queryRes = await fetch(`https://api.notion.com/v1/databases/${auditDbId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          page_size: 50,
          sorts: [
            {
              property: 'Timestamp',
              direction: 'descending'
            }
          ]
        })
      });

      if (!queryRes.ok) {
        // Fallback without sorts
        queryRes = await fetch(`https://api.notion.com/v1/databases/${auditDbId}/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ page_size: 50 })
        });
      }

      if (!queryRes.ok) {
        const err = await queryRes.json();
        return res.status(queryRes.status).json({ success: false, error: err.message });
      }

      const data = await queryRes.json();
      const logs = formatAuditLogs(data.results || []);
      return res.status(200).json({
        success: true,
        logs,
        total: logs.length,
        databaseId: auditDbId,
        databaseUrl: `https://notion.so/${auditDbId}`
      });
    } catch (e) {
      console.error('Audit log read error:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // 4. Get Posts / Calendar Posts Routine
  if (action === 'get_posts' || action === 'get_calendar_posts' || action === 'list_posts') {
    try {
      let targetDbId = (databaseId || '3c701136de4881de9d29ca4ea415e856').replace(/-/g, '');
      if (targetDbId.includes('000b3c706126') || targetDbId.includes('8101')) {
        targetDbId = '3c701136de4881de9d29ca4ea415e856';
      }

      const queryRes = await fetch(`https://api.notion.com/v1/databases/${targetDbId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          page_size: 100,
          sorts: [
            {
              property: 'Scheduled Date',
              direction: 'ascending'
            }
          ]
        })
      });

      let resultsData = null;
      if (queryRes.ok) {
        resultsData = await queryRes.json();
      } else {
        const retryRes = await fetch(`https://api.notion.com/v1/databases/${targetDbId}/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ page_size: 100 })
        });
        if (retryRes.ok) {
          resultsData = await retryRes.json();
        }
      }

      if (!resultsData) {
        return res.status(200).json({ success: true, posts: [], total: 0 });
      }

      const formattedPosts = (resultsData.results || []).map(page => {
        const props = page.properties || {};
        const title = props['Title']?.title?.[0]?.plain_text || props['Title']?.title?.[0]?.text?.content || 'Untitled Post';
        const status = props['Status']?.select?.name || 'Working Draft';
        const category = props['Category']?.select?.name || 'General';
        const author = props['Author']?.select?.name || 'Brother Singapore';
        const scheduledDate = props['Scheduled Date']?.date?.start || null;
        const cleanImageUrl = props['Clean Image URL']?.url || props['Clean Image URL']?.rich_text?.[0]?.plain_text || '';
        const compositeImageUrl = props['Composite Image URL']?.url || props['Composite Image URL']?.rich_text?.[0]?.plain_text || '';
        const imageType = props['Image Type']?.select?.name || props['Image Type']?.rich_text?.[0]?.plain_text || '';
        const slideCount = props['Slide Count']?.number || 1;
        const urn = props['LinkedIn URN']?.rich_text?.[0]?.plain_text || '';
        const postContent = props['Post Content']?.rich_text?.[0]?.plain_text || '';

        return {
          id: page.id,
          pageId: page.id,
          title,
          status,
          category,
          author,
          scheduledDate,
          cleanImageUrl,
          compositeImageUrl,
          imageType,
          slideCount,
          urn,
          content: postContent,
          url: page.url
        };
      });

      return res.status(200).json({
        success: true,
        posts: formattedPosts,
        total: formattedPosts.length,
        databaseId: targetDbId
      });
    } catch (e) {
      console.error('Error fetching posts from Notion:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // 5. Update Single Post in Notion Routine
  if (action === 'update_post') {
    const { pageId, post } = req.body || {};
    if (!pageId || !post) {
      return res.status(400).json({ success: false, error: 'pageId and post are required for update_post.' });
    }

    try {
      const updatePayload = {
        properties: {}
      };

      if (post.title) {
        updatePayload.properties['Title'] = {
          title: [{ type: 'text', text: { content: post.title } }]
        };
      }
      if (post.status) {
        updatePayload.properties['Status'] = {
          select: { name: post.status }
        };
      }
      if (post.scheduledDate) {
        updatePayload.properties['Scheduled Date'] = {
          date: { start: post.scheduledDate }
        };
      }
      if (post.content) {
        updatePayload.properties['Post Content'] = {
          rich_text: [{ type: 'text', text: { content: String(post.content).slice(0, 2000) } }]
        };
      }
      if (post.cleanImageUrl) {
        updatePayload.properties['Clean Image URL'] = {
          url: post.cleanImageUrl
        };
      }
      if (post.compositeImageUrl) {
        updatePayload.properties['Composite Image URL'] = {
          url: post.compositeImageUrl
        };
      }
      if (post.imageType) {
        updatePayload.properties['Image Type'] = {
          rich_text: [{ type: 'text', text: { content: post.imageType } }]
        };
      }
      if (post.slideCount !== undefined) {
        updatePayload.properties['Slide Count'] = {
          number: Number(post.slideCount) || 1
        };
      }

      const patchRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updatePayload)
      });

      if (!patchRes.ok) {
        const errJson = await patchRes.json();
        return res.status(patchRes.status).json({ success: false, error: errJson.message });
      }

      const updatedPage = await patchRes.json();
      return res.status(200).json({
        success: true,
        pageId: updatedPage.id,
        url: updatedPage.url,
        message: 'Post updated in Notion'
      });
    } catch (e) {
      console.error('Error updating post in Notion:', e);
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // 6. Post Sync Routine
  const singlePost = req.body?.post;
  const postsList = req.body?.posts || (singlePost ? [singlePost] : null);

  if (!postsList || postsList.length === 0) {
    return res.status(400).json({ success: false, error: 'Missing post data to sync.' });
  }

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

    // Ensure database has telemetry and asset columns
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
      if (!lowerPropKeys.includes('clean image url')) {
        missingProps['Clean Image URL'] = { url: {} };
      }
      if (!lowerPropKeys.includes('composite image url')) {
        missingProps['Composite Image URL'] = { url: {} };
      }
      if (!lowerPropKeys.includes('image type')) {
        missingProps['Image Type'] = { rich_text: {} };
      }
      if (!lowerPropKeys.includes('slide count')) {
        missingProps['Slide Count'] = { number: { format: 'number' } };
      }
      if (!lowerPropKeys.includes('post content')) {
        missingProps['Post Content'] = { rich_text: {} };
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

      if (post.cleanImageUrl) assignIfSchema('Clean Image URL', post.cleanImageUrl, 'rich_text');
      if (post.compositeImageUrl) assignIfSchema('Composite Image URL', post.compositeImageUrl, 'rich_text');
      if (post.imageType) assignIfSchema('Image Type', post.imageType, 'rich_text');
      if (post.slideCount !== undefined) assignIfSchema('Slide Count', post.slideCount, 'number');
      if (post.content || post.finalContent) {
        const textContent = String(post.content || post.finalContent || '').slice(0, 2000);
        assignIfSchema('Post Content', textContent, 'rich_text');
      }

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

      // Embedded Visual / Slide Asset from Vercel Blob if present
      if (post.imageUrl || post.mediaUrl) {
        const visualUrl = post.imageUrl || post.mediaUrl;
        blocks.push({
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: '🖼️ Attached Visual Asset' } }]
          }
        });
        blocks.push({
          object: 'block',
          type: 'image',
          image: {
            type: 'external',
            external: {
              url: visualUrl
            }
          }
        });
      }

      return blocks;
    };

    const results = [];

    for (const post of postsList) {
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
