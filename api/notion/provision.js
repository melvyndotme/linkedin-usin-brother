// Vercel Serverless Function: Idempotent Notion Database Provisioner (Prevents Duplicates)

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
    // 1. Check existing child blocks/databases to prevent duplicates
    const searchExisting = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, {
      method: 'GET',
      headers
    });
    const existingBlocks = await searchExisting.json();
    const existingTitles = (existingBlocks.results || []).map(b => b.child_database?.title || '').filter(Boolean);

    const createdDatabases = {};

    // 1. Posts DB
    if (!existingTitles.includes('LinkedUsIn: Posts & Drafts Database')) {
      const resPosts = await fetch('https://api.notion.com/v1/databases', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { type: 'page_id', page_id: pageId },
          title: [{ type: 'text', text: { content: 'LinkedUsIn: Posts & Drafts Database' } }],
          icon: { type: 'emoji', emoji: '📝' },
          properties: {
            'Title': { title: {} },
            'Status': { select: { options: [{ name: 'Idea', color: 'gray' }, { name: 'Draft', color: 'yellow' }, { name: 'Under Review', color: 'orange' }, { name: 'Approved', color: 'blue' }, { name: 'Published', color: 'green' }] } },
            'Category': { select: { options: [{ name: 'Festive & Cultural', color: 'purple' }, { name: 'AI & Employer Branding', color: 'blue' }, { name: 'B2B Solutions & Sustainability', color: 'green' }] } },
            'Scheduled Date': { date: {} },
            'Author': { select: { options: [{ name: 'Allan Cheng', color: 'blue' }, { name: 'Chloe Lee', color: 'purple' }, { name: 'Sean', color: 'green' }] } },
            'LinkedIn Post URN': { rich_text: {} }
          }
        })
      });
      const dataPosts = await resPosts.json();
      createdDatabases.postsDb = { id: dataPosts.id, title: 'Posts & Drafts Database' };
    }

    // 2. Templates DB
    if (!existingTitles.includes('LinkedUsIn: Template Library')) {
      const resTemplates = await fetch('https://api.notion.com/v1/databases', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { type: 'page_id', page_id: pageId },
          title: [{ type: 'text', text: { content: 'LinkedUsIn: Template Library' } }],
          icon: { type: 'emoji', emoji: '📚' },
          properties: {
            'Template Name': { title: {} },
            'Category': { select: { options: [{ name: 'Festive', color: 'purple' }, { name: 'Productivity & Kaizen', color: 'blue' }, { name: 'B2B Sustainability', color: 'green' }] } },
            'Tone': { rich_text: {} },
            'Hook Style': { rich_text: {} }
          }
        })
      });
      const dataTemplates = await resTemplates.json();
      createdDatabases.templatesDb = { id: dataTemplates.id, title: 'Template Library' };
    }

    // 3. Research DB
    if (!existingTitles.includes('LinkedUsIn: Research & 24h News')) {
      const resResearch = await fetch('https://api.notion.com/v1/databases', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { type: 'page_id', page_id: pageId },
          title: [{ type: 'text', text: { content: 'LinkedUsIn: Research & 24h News' } }],
          icon: { type: 'emoji', emoji: '📰' },
          properties: {
            'Headline': { title: {} },
            'Topic': { select: { options: [{ name: 'Enterprise AI', color: 'blue' }, { name: 'Precision AI', color: 'purple' }] } },
            'Source URL': { url: {} },
            'Timeframe': { rich_text: {} }
          }
        })
      });
      const dataResearch = await resResearch.json();
      createdDatabases.researchDb = { id: dataResearch.id, title: 'Research & News' };
    }

    // 4. Team DB
    if (!existingTitles.includes('LinkedUsIn: Team & Review Whitelist')) {
      const resTeam = await fetch('https://api.notion.com/v1/databases', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { type: 'page_id', page_id: pageId },
          title: [{ type: 'text', text: { content: 'LinkedUsIn: Team & Review Whitelist' } }],
          icon: { type: 'emoji', emoji: '👥' },
          properties: {
            'Name': { title: {} },
            'Email': { email: {} },
            'Role': { select: { options: [{ name: 'Admin (POD Lead)', color: 'blue' }, { name: 'Reviewer (HR Lead)', color: 'purple' }, { name: 'User (POD Member)', color: 'green' }, { name: 'External Advisor', color: 'orange' }] } },
            'Active': { checkbox: {} }
          }
        })
      });
      const dataTeam = await resTeam.json();
      createdDatabases.teamDb = { id: dataTeam.id, title: 'Team Whitelist' };

      // Seed members
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
            parent: { database_id: dataTeam.id },
            properties: {
              'Name': { title: [{ text: { content: member.name } }] },
              'Email': member.email,
              'Role': { select: { name: member.role } },
              'Active': true
            }
          })
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notion databases verified and active in LinkedUsIn Hub!',
      databases: createdDatabases
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
