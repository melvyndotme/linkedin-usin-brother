// Vercel Serverless Function: Fetch Notion Page and Extract Custom Agent Drafts

function extractPlainText(prop) {
  if (!prop) return '';
  if (prop.rich_text && Array.isArray(prop.rich_text)) {
    return prop.rich_text.map(t => t.plain_text || '').join('');
  }
  if (prop.title && Array.isArray(prop.title)) {
    return prop.title.map(t => t.plain_text || '').join('');
  }
  if (prop.formula) {
    return prop.formula.string || String(prop.formula.number || '');
  }
  return '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = req.query?.apiKey || req.body?.apiKey || process.env.NOTION_API_KEY;
  let pageId = req.query?.pageId || req.body?.pageId;

  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'Missing NOTION_API_KEY.' });
  }

  if (!pageId) {
    return res.status(400).json({ success: false, error: 'Missing Notion Page ID.' });
  }

  pageId = pageId.trim().replace(/-/g, '');

  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Notion API error: ${data.message || response.statusText}`
      });
    }

    const properties = data.properties || {};
    let draft1 = '';
    let draft2 = '';
    let rationale = '';
    let sourceContext = '';
    let title = '';

    for (const [propName, propVal] of Object.entries(properties)) {
      const lower = propName.toLowerCase();
      const valText = extractPlainText(propVal);

      if (lower === 'title' || propVal.type === 'title') {
        title = valText;
      } else if (lower.includes('source context')) {
        sourceContext = valText;
      } else if (lower.includes('community') || lower.includes('harmony') || lower.includes('wa') || lower.includes('draft 1')) {
        draft1 = valText;
      } else if (lower.includes('kaizen') || lower.includes('tech') || lower.includes('draft 2')) {
        draft2 = valText;
      } else if (lower.includes('rationale') || lower.includes('strategic') || lower.includes('summary')) {
        rationale = valText;
      }
    }

    const isComplete = Boolean(draft1 && draft1.trim().length > 10);

    return res.status(200).json({
      success: true,
      pageId: data.id,
      url: data.url,
      title,
      sourceContext,
      draft1,
      draft2,
      rationale,
      isComplete,
      allProperties: Object.keys(properties)
    });
  } catch (error) {
    console.error('Error fetching Notion page:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
