// Vercel Serverless Function: Serper.dev Google News Proxy
// Enables using SERPER_API_KEY or VITE_SERPER_API_KEY from Vercel environment variables

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-API-KEY'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, tbs, num, apiKey } = req.body || {};
  const headerKey = req.headers['x-api-key'];
  const activeKey = (apiKey || headerKey || process.env.SERPER_API_KEY || process.env.VITE_SERPER_API_KEY || '').trim();

  if (!activeKey) {
    return res.status(400).json({
      error: 'No Serper API key configured in Vercel environment variables (SERPER_API_KEY / VITE_SERPER_API_KEY) or request payload.'
    });
  }

  try {
    const response = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'X-API-KEY': activeKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: (query || 'Singapore AI enterprise').trim(),
        num: num || 10,
        tbs: tbs || 'qdr:d'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let msg = response.statusText;
      try {
        msg = JSON.parse(errText)?.message || msg;
      } catch (e) {}
      return res.status(response.status).json({ error: `Serper API error: ${msg}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Serper proxy error:', err);
    return res.status(500).json({ error: err.message || 'Failed to proxy request to Serper.dev' });
  }
}
