// Vercel Serverless Function: Force-Seed Team Members into Notion DBs

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
  let pageId = req.body?.pageId || process.env.NOTION_PAGE_ID;

  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'Missing NOTION_API_KEY. Please ensure it is saved in Vercel Environment Variables.' });
  }

  if (!pageId) {
    return res.status(400).json({ success: false, error: 'Missing NOTION_PAGE_ID. Please ensure it is saved in Vercel Environment Variables.' });
  }

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
    // 1. Fetch child databases inside the page
    const searchRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
      method: 'GET',
      headers
    });
    
    if (!searchRes.ok) {
      const errData = await searchRes.json();
      return res.status(400).json({
        success: false,
        error: `Notion API error reading LinkedUsIn Hub: ${errData.message || searchRes.statusText}`
      });
    }

    const blocksData = await searchRes.json();
    const childDbs = (blocksData.results || []).filter(b => b.type === 'child_database');

    // Find all Team Whitelist databases
    const teamDbs = childDbs.filter(d => d.child_database?.title?.toLowerCase().includes('team'));

    if (teamDbs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No Team Whitelist database found inside this page. Found: ' + childDbs.map(d => d.child_database?.title).join(', ')
      });
    }

    const members = [
      { name: 'Allan Cheng', email: 'allan.cheng@brother.com.sg' },
      { name: 'Chloe Lee', email: 'chloe.lee@brother.com.sg' },
      { name: 'Sean', email: 'sean@brother.com.sg' },
      { name: 'Melvyn Tan', email: 'melvyn@advisor.ai' }
    ];

    let inserted = 0;
    const errors = [];

    for (const targetDb of teamDbs) {
      for (const member of members) {
        const insertRes = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            parent: { database_id: targetDb.id },
            properties: {
              'Name': {
                title: [{ text: { content: member.name } }]
              },
              'Email': {
                email: member.email
              },
              'Active': {
                checkbox: true
              }
            }
          })
        });

        if (insertRes.ok) {
          inserted++;
        } else {
          const errBody = await insertRes.json();
          errors.push(`${member.name}: ${errBody.message}`);
        }
      }
    }

    if (inserted > 0) {
      return res.status(200).json({
        success: true,
        message: `Successfully inserted ${inserted} team rows into Notion!`,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      return res.status(400).json({
        success: false,
        error: `Failed inserting team rows: ${errors.join('; ')}`
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
