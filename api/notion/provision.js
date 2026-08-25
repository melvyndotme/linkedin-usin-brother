// Vercel Serverless Function: Auto-Provision & Seed 4 LinkedUsIn Databases into Notion

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
    return res.status(400).json({
      success: false,
      error: 'Missing Notion API Key.'
    });
  }

  if (!pageId) {
    return res.status(400).json({
      success: false,
      error: 'Missing Notion Page ID.'
    });
  }

  // Clean pageId
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
    const createdDatabases = {};

    // 1. Create Posts & Drafts Database
    const postsDbPayload = {
      parent: { type: 'page_id', page_id: pageId },
      title: [{ type: 'text', text: { content: 'LinkedUsIn: Posts & Drafts Database' } }],
      icon: { type: 'emoji', emoji: '📝' },
      properties: {
        'Title': { title: {} },
        'Status': {
          select: {
            options: [
              { name: 'Idea', color: 'gray' },
              { name: 'Draft', color: 'yellow' },
              { name: 'Under Review', color: 'orange' },
              { name: 'Approved', color: 'blue' },
              { name: 'Published', color: 'green' }
            ]
          }
        },
        'Category': {
          select: {
            options: [
              { name: 'Festive & Cultural', color: 'purple' },
              { name: 'AI & Employer Branding', color: 'blue' },
              { name: 'B2B Solutions & Sustainability', color: 'green' }
            ]
          }
        },
        'Scheduled Date': { date: {} },
        'Author': {
          select: {
            options: [
              { name: 'Allan Cheng', color: 'blue' },
              { name: 'Chloe Lee', color: 'purple' },
              { name: 'Sean', color: 'green' },
              { name: 'Melvyn Tan', color: 'orange' }
            ]
          }
        },
        'LinkedIn Post URN': { rich_text: {} }
      }
    };

    const resPosts = await fetch('https://api.notion.com/v1/databases', {
      method: 'POST',
      headers,
      body: JSON.stringify(postsDbPayload)
    });
    const postsData = await resPosts.json();
    if (!resPosts.ok) {
      throw new Error(`Notion API error creating Posts DB: ${postsData.message || resPosts.statusText}`);
    }
    createdDatabases.postsDb = { id: postsData.id, url: postsData.url, title: 'Posts & Drafts Database' };

    // Seed Posts DB
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { database_id: postsData.id },
        properties: {
          'Title': { title: [{ text: { content: 'Singapore National Day 2026 Celebration' } }] },
          'Status': { select: { name: 'Published' } },
          'Category': { select: { name: 'Festive & Cultural' } },
          'Author': { select: { name: 'Allan Cheng' } },
          'LinkedIn Post URN': { rich_text: [{ text: { content: 'urn:li:share:984729103' } }] }
        }
      })
    });

    // 2. Create Template Library Database
    const templatesDbPayload = {
      parent: { type: 'page_id', page_id: pageId },
      title: [{ type: 'text', text: { content: 'LinkedUsIn: Template Library' } }],
      icon: { type: 'emoji', emoji: '📚' },
      properties: {
        'Template Name': { title: {} },
        'Category': {
          select: {
            options: [
              { name: 'Festive', color: 'purple' },
              { name: 'Productivity & Kaizen', color: 'blue' },
              { name: 'B2B Sustainability', color: 'green' },
              { name: 'Culture & Employer Branding', color: 'pink' }
            ]
          }
        },
        'Tone': { rich_text: {} },
        'Hook Style': { rich_text: {} }
      }
    };

    const resTemplates = await fetch('https://api.notion.com/v1/databases', {
      method: 'POST',
      headers,
      body: JSON.stringify(templatesDbPayload)
    });
    const templatesData = await resTemplates.json();
    createdDatabases.templatesDb = { id: templatesData.id, url: templatesData.url, title: 'Template Library' };

    // Seed Template DB
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { database_id: templatesData.id },
        properties: {
          'Template Name': { title: [{ text: { content: 'Kaizen Innovation & Precision Superpowers' } }] },
          'Category': { select: { name: 'Productivity & Kaizen' } },
          'Tone': { rich_text: [{ text: { content: 'Inspiring, authoritative, human-centric, Kaizen' } }] },
          'Hook Style': { rich_text: [{ text: { content: 'Pain-to-Superpower Transition' } }] }
        }
      })
    });

    // 3. Create Research & News Database
    const researchDbPayload = {
      parent: { type: 'page_id', page_id: pageId },
      title: [{ type: 'text', text: { content: 'LinkedUsIn: Research & 24h News' } }],
      icon: { type: 'emoji', emoji: '📰' },
      properties: {
        'Headline': { title: {} },
        'Topic': { select: { options: [{ name: 'Enterprise AI', color: 'blue' }, { name: 'Precision AI', color: 'purple' }, { name: 'Document AI', color: 'green' }] } },
        'Source URL': { url: {} },
        'Timeframe': { rich_text: {} }
      }
    };

    const resResearch = await fetch('https://api.notion.com/v1/databases', {
      method: 'POST',
      headers,
      body: JSON.stringify(researchDbPayload)
    });
    const researchData = await resResearch.json();
    createdDatabases.researchDb = { id: researchData.id, url: researchData.url, title: 'Research & News' };

    // Seed Research DB
    await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        parent: { database_id: researchData.id },
        properties: {
          'Headline': { title: [{ text: { content: 'Autonomous Multi-Agent Workflows Outperform Single LLMs in Enterprise Operations' } }] },
          'Topic': { select: { name: 'Enterprise AI' } },
          'Source URL': 'https://www.technologyreview.com/2026/agentic-ai-enterprise',
          'Timeframe': { rich_text: [{ text: { content: '24 Hours' } }] }
        }
      })
    });

    // 4. Create Team Whitelist Database
    const teamDbPayload = {
      parent: { type: 'page_id', page_id: pageId },
      title: [{ type: 'text', text: { content: 'LinkedUsIn: Team & Review Whitelist' } }],
      icon: { type: 'emoji', emoji: '👥' },
      properties: {
        'Name': { title: {} },
        'Email': { email: {} },
        'Role': {
          select: {
            options: [
              { name: 'Admin (POD Lead)', color: 'blue' },
              { name: 'Reviewer (HR Lead)', color: 'purple' },
              { name: 'User (POD Member)', color: 'green' },
              { name: 'External Advisor', color: 'orange' }
            ]
          }
        },
        'Active': { checkbox: {} }
      }
    };

    const resTeam = await fetch('https://api.notion.com/v1/databases', {
      method: 'POST',
      headers,
      body: JSON.stringify(teamDbPayload)
    });
    const teamData = await resTeam.json();
    createdDatabases.teamDb = { id: teamData.id, url: teamData.url, title: 'Team Whitelist' };

    // ⭐️ Explicitly Seed All 4 Team Members into Notion Team Whitelist DB!
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
          parent: { database_id: teamData.id },
          properties: {
            'Name': { title: [{ text: { content: member.name } }] },
            'Email': member.email,
            'Role': { select: { name: member.role } },
            'Active': true
          }
        })
      });
    }

    return res.status(200).json({
      success: true,
      message: 'All 4 LinkedUsIn databases & Team Whitelist members have been successfully seeded into Notion!',
      parentPageId: pageId,
      databases: createdDatabases
    });
  } catch (error) {
    console.error('Error provisioning Notion databases:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error connecting to Notion API'
    });
  }
}
