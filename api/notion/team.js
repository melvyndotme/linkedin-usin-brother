// Vercel Serverless Function: Fetch Live Team Members from Notion Team Whitelist Database

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
  const databaseId = (req.query?.databaseId || req.body?.databaseId || '3c701136de4881869782cd894c6126c5').replace(/-/g, '');

  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'Missing NOTION_API_KEY.' });
  }

  try {
    const notionRes = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page_size: 50
      })
    });

    const data = await notionRes.json();
    if (!notionRes.ok) {
      return res.status(notionRes.status).json({
        success: false,
        error: data.message || 'Failed to query Notion team database.'
      });
    }

    const members = (data.results || []).map((page) => {
      const name = page.properties['Name']?.title?.[0]?.plain_text || page.properties['Name']?.title?.[0]?.text?.content || 'Unnamed';
      const email = page.properties['Email']?.email || page.properties['Email']?.rich_text?.[0]?.plain_text || '';
      const active = page.properties['Active']?.checkbox ?? true;
      let role = page.properties['Role']?.select?.name || '';
      
      const lowerEmail = email.toLowerCase();
      if (!role) {
        if (lowerEmail.includes('allan')) role = 'Admin';
        else if (lowerEmail.includes('chloe')) role = 'Reviewer (HR Lead)';
        else if (lowerEmail.includes('melvyn')) role = 'External Advisor';
        else if (lowerEmail.includes('sean')) role = 'Core Team Member';
        else role = 'Team Member (Brother SG)';
      }

      let badge = 'User';
      let badgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      let avatarBg = 'bg-emerald-600';

      if (role.toLowerCase().includes('admin') || lowerEmail.includes('allan')) {
        badge = 'Admin';
        badgeColor = 'bg-blue-500/10 text-[#0f2ea2] border-blue-500/20';
        avatarBg = 'bg-[#0f2ea2]';
      } else if (role.toLowerCase().includes('reviewer') || role.toLowerCase().includes('hr') || lowerEmail.includes('chloe')) {
        badge = 'Reviewer';
        badgeColor = 'bg-purple-500/10 text-purple-600 border-purple-500/20';
        avatarBg = 'bg-purple-600';
      } else if (role.toLowerCase().includes('advisor') || lowerEmail.includes('melvyn')) {
        badge = 'External Advisor';
        badgeColor = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        avatarBg = 'bg-amber-600';
      }

      let department = 'Brother Singapore';
      if (lowerEmail.includes('allan')) department = 'Brother X & HR Function';
      else if (lowerEmail.includes('chloe')) department = 'HR Function (Brother Singapore)';
      else if (lowerEmail.includes('sean')) department = 'Brother X Core Team';
      else if (lowerEmail.includes('melvyn')) department = 'Befinity AI Advisory';

      let responsibilities = 'Content drafting, template usage, and workflow collaboration.';
      if (lowerEmail.includes('allan')) responsibilities = 'Strategic project oversight, final publishing approval, API governance, stakeholder alignment.';
      else if (lowerEmail.includes('chloe')) responsibilities = 'Brand voice vetting, employee spotlight validation, festive copy approval, employer branding alignment.';
      else if (lowerEmail.includes('sean')) responsibilities = 'Prompt testing, prototype experimentation, workflow automation, KPI tracking.';
      else if (lowerEmail.includes('melvyn')) responsibilities = 'Agentic pipeline architecture, Serper intelligence integration, Gemini model orchestration, SVG studio engineering.';
      else if (lowerEmail.includes('zhi.jun')) responsibilities = 'Brother SG marketing campaigns, product promotions, and creative brand alignment.';

      return {
        id: page.id,
        name,
        email,
        active,
        role,
        department,
        badge,
        badgeColor,
        avatarBg,
        responsibilities,
        stats: {
          approved: lowerEmail.includes('allan') ? 24 : lowerEmail.includes('chloe') ? 19 : lowerEmail.includes('melvyn') ? 32 : lowerEmail.includes('sean') ? 14 : 8,
          pending: lowerEmail.includes('allan') ? 1 : lowerEmail.includes('chloe') ? 2 : 0
        }
      };
    });

    return res.status(200).json({
      success: true,
      members,
      total: members.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
