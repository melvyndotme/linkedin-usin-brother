// Vercel Serverless Function: Update User Profile in Notion Team Database

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { name, email, role, department, apiKey: userKey, databaseId: userDbId } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const apiKey = userKey || process.env.NOTION_API_KEY;
  const databaseId = (userDbId || '3c701136de4881869782cd894c6126c5').replace(/-/g, '');

  if (!apiKey) {
    return res.status(200).json({
      success: true,
      updatedInNotion: false,
      message: 'Profile saved locally. NOTION_API_KEY is not configured on server.'
    });
  }

  try {
    // 1. Query for the user's page in the Notion Team Database
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          or: [
            { property: 'Email', email: { equals: normalizedEmail } },
            { property: 'Email', rich_text: { equals: normalizedEmail } }
          ]
        }
      })
    });

    const queryData = await queryRes.json();
    if (!queryRes.ok) {
      return res.status(200).json({
        success: true,
        updatedInNotion: false,
        error: queryData.message || 'Could not query Notion database.'
      });
    }

    const page = queryData.results?.[0];
    if (!page) {
      return res.status(200).json({
        success: true,
        updatedInNotion: false,
        message: 'User email was not found as an existing record in Notion database.'
      });
    }

    // 2. Inspect available schema on this page to construct compatible update properties
    const pageProps = page.properties || {};
    const updateProperties = {};

    if (pageProps['Name'] && name) {
      updateProperties['Name'] = {
        title: [
          {
            text: { content: name }
          }
        ]
      };
    }

    if (pageProps['Role'] && role) {
      if (pageProps['Role'].type === 'select') {
        updateProperties['Role'] = {
          select: { name: role }
        };
      } else if (pageProps['Role'].type === 'rich_text') {
        updateProperties['Role'] = {
          rich_text: [{ text: { content: role } }]
        };
      }
    }

    if (pageProps['Department'] && department) {
      if (pageProps['Department'].type === 'select') {
        updateProperties['Department'] = {
          select: { name: department }
        };
      } else if (pageProps['Department'].type === 'rich_text') {
        updateProperties['Department'] = {
          rich_text: [{ text: { content: department } }]
        };
      }
    }

    // 3. Patch page in Notion
    const patchRes = await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: updateProperties
      })
    });

    const patchData = await patchRes.json();
    if (!patchRes.ok) {
      return res.status(200).json({
        success: true,
        updatedInNotion: false,
        error: patchData.message || 'Failed to update page in Notion.'
      });
    }

    return res.status(200).json({
      success: true,
      updatedInNotion: true,
      pageId: page.id,
      message: 'Successfully synchronized profile update directly with Notion Team Database.'
    });
  } catch (err) {
    console.error('Notion profile update error:', err);
    return res.status(200).json({
      success: true,
      updatedInNotion: false,
      error: err.message
    });
  }
}
