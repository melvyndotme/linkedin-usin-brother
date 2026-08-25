// Vercel Serverless Function: Auto-Discover & Seed Notion Databases using Notion Search API

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

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing Notion Secret Token. Please click "Token Override" and paste your secret token, or add NOTION_API_KEY in Vercel.'
    });
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  try {
    // 1. Auto-discover all accessible databases via Notion Search API
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

    // Find the Team Whitelist database
    const teamDb = databases.find(d => {
      const title = (d.title || []).map(t => t.plain_text).join('').toLowerCase();
      return title.includes('team') || title.includes('whitelist');
    });

    if (!teamDb) {
      const foundTitles = databases.map(d => (d.title || []).map(t => t.plain_text).join('')).filter(Boolean);
      return res.status(400).json({
        success: false,
        error: `No 'Team Whitelist' database found. Found accessible databases: ${foundTitles.join(', ') || 'None'}. Please ensure LinkedUsIn Studio is connected to the database.`
      });
    }

    // 2. Insert all 4 team members into the discovered Team Database
    const members = [
      { name: 'Allan Cheng', email: 'allan.cheng@brother.com.sg' },
      { name: 'Chloe Lee', email: 'chloe.lee@brother.com.sg' },
      { name: 'Sean', email: 'sean@brother.com.sg' },
      { name: 'Melvyn Tan', email: 'melvyn@advisor.ai' }
    ];

    let inserted = 0;
    const errors = [];

    for (const member of members) {
      const insertRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: teamDb.id },
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

    if (inserted > 0) {
      return res.status(200).json({
        success: true,
        message: `Success! Successfully inserted ${inserted} team members (Allan Cheng, Chloe Lee, Sean, Melvyn Tan) into your Notion Team Whitelist database!`
      });
    } else {
      return res.status(400).json({
        success: false,
        error: `Failed inserting team members: ${errors.join('; ')}`
      });
    }
  } catch (error) {
    console.error('Error during Notion seed:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
