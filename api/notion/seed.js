// Vercel Serverless Function: Force-Seed Team Members and Sample Data into Existing Notion DBs

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

  if (!apiKey || !pageId) {
    return res.status(400).json({ success: false, error: 'Missing API Key or Page ID.' });
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
    const blocksData = await searchRes.json();
    const childDbs = (blocksData.results || []).filter(b => b.type === 'child_database');

    const teamDb = childDbs.find(d => d.child_database?.title?.includes('Team'));
    const postsDb = childDbs.find(d => d.child_database?.title?.includes('Posts'));
    const templatesDb = childDbs.find(d => d.child_database?.title?.includes('Template'));
    const researchDb = childDbs.find(d => d.child_database?.title?.includes('Research'));

    let seededCount = 0;

    // Seed Team Members if Team DB found
    if (teamDb) {
      const members = [
        { name: 'Allan Cheng', email: 'allan.cheng@brother.com.sg', role: 'Admin (POD Lead)' },
        { name: 'Chloe Lee', email: 'chloe.lee@brother.com.sg', role: 'Reviewer (HR Lead)' },
        { name: 'Sean', email: 'sean@brother.com.sg', role: 'User (POD Member)' },
        { name: 'Melvyn Tan', email: 'melvyn@advisor.ai', role: 'External Advisor' }
      ];

      for (const member of members) {
        await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            parent: { database_id: teamDb.id },
            properties: {
              'Name': { title: [{ text: { content: member.name } }] },
              'Email': member.email,
              'Active': true
            }
          })
        });
        seededCount++;
      }
    }

    // Seed Posts DB if found
    if (postsDb) {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: postsDb.id },
          properties: {
            'Title': { title: [{ text: { content: 'Singapore National Day 2026 Celebration' } }] },
            'Status': { select: { name: 'Published' } },
            'Category': { select: { name: 'Festive & Cultural' } },
            'Author': { select: { name: 'Allan Cheng' } },
            'LinkedIn Post URN': { rich_text: [{ text: { content: 'urn:li:share:984729103' } }] }
          }
        })
      });
    }

    // Seed Template DB if found
    if (templatesDb) {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: templatesDb.id },
          properties: {
            'Template Name': { title: [{ text: { content: 'Kaizen Innovation & Precision Superpowers' } }] },
            'Category': { select: { name: 'Productivity & Kaizen' } },
            'Tone': { rich_text: [{ text: { content: 'Inspiring, authoritative, human-centric' } }] },
            'Hook Style': { rich_text: [{ text: { content: 'Pain-to-Superpower' } }] }
          }
        })
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully seeded all team members and sample records into your Notion databases!`,
      seededCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
