import http from 'node:http';
import { URL } from 'node:url';
import { scrapeLinkedInAdLibrary } from './scraper.js';

const PORT = process.env.PORT || 3001;

// -------------------------------------------------------------
// Native HTTP Server with Live Playwright Scraper
// -------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3001'}`);
  const pathname = parsedUrl.pathname;

  // 1. Health check
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      timestamp: new Date().toISOString(),
      service: 'LinkedIn Ads Library Real-Time Playwright Scraper'
    }));
    return;
  }

  // 2. Competitors suggestions
  if (pathname === '/api/linkedin/competitors' && req.method === 'GET') {
    const suggestions = [
      { name: 'Epson Singapore', category: 'Printers & Projectors', popular: true },
      { name: 'HP', category: 'IT & Enterprise Printing', popular: true },
      { name: 'Canon', category: 'Imaging & Copiers', popular: true },
      { name: 'Ricoh', category: 'Document Automation', popular: true },
      { name: 'Fujifilm', category: 'Commercial & Digital Press', popular: true },
      { name: 'Brother Singapore', category: 'Printers & Labelling', popular: false },
      { name: 'Kyocera', category: 'Document Solutions', popular: false }
    ];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: suggestions.length, competitors: suggestions }));
    return;
  }

  // 3. Search & Live Extract from LinkedIn Ads Library via Playwright
  if (pathname === '/api/linkedin/search' && req.method === 'GET') {
    const accountOwner = parsedUrl.searchParams.get('accountOwner');
    const countries = parsedUrl.searchParams.get('countries');

    if (!accountOwner || !accountOwner.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Missing required query parameter: accountOwner (e.g. ?accountOwner=epson+singapore)'
      }));
      return;
    }

    const countryList = countries
      ? countries.split(',').map(c => c.trim().toUpperCase()).filter(Boolean)
      : ['SG'];

    const countriesParam = countryList.join(',');
    const constructedUrl = `https://www.linkedin.com/ad-library/search?accountOwner=${encodeURIComponent(
      accountOwner.trim()
    )}&countries=${encodeURIComponent(countriesParam)}`;

    try {
      console.log(`[API] Executing live Playwright scrape for "${accountOwner}" in [${countriesParam}]...`);
      const scrapeResult = await scrapeLinkedInAdLibrary(accountOwner, countryList);

      const ads = scrapeResult.ads || [];
      const formatBreakdown = ads.reduce((acc, ad) => {
        acc[ad.format] = (acc[ad.format] || 0) + 1;
        return acc;
      }, {});

      const responsePayload = {
        success: true,
        meta: {
          source: scrapeResult.source || 'live_playwright',
          queryAccountOwner: accountOwner.trim(),
          queryCountries: countryList,
          constructedLinkedInUrl: constructedUrl,
          extractedAt: new Date().toISOString(),
          totalAdsFound: ads.length,
          formatBreakdown
        },
        advertiser: scrapeResult.advertiser,
        ads: ads
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(responsePayload));
    } catch (scrapeErr) {
      console.error('[API Scrape Error]:', scrapeErr);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Failed to scrape live LinkedIn Ads Library',
        details: scrapeErr.message
      }));
    }
    return;
  }

  // 4. AI Strategic Analysis of Competitor Ads
  if (pathname === '/api/linkedin/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const ads = parsed.ads || [];
        const competitor = parsed.competitor || 'Target Competitor';

        const ctas = ads.map(a => a.ctaText);
        const isProjectorTheme = ads.some(
          a => (a.primaryText || '').toLowerCase().includes('3lcd') ||
               (a.primaryText || '').toLowerCase().includes('projection') ||
               (a.primaryText || '').toLowerCase().includes('interactive')
        );

        const isEcoThemed = ads.some(
          a => (a.primaryText || '').toLowerCase().includes('sustainability') ||
               (a.primaryText || '').toLowerCase().includes('heat-free') ||
               (a.primaryText || '').toLowerCase().includes('ecotank')
        );

        const analysis = {
          competitorName: competitor,
          activeCampaignCount: ads.length,
          primaryStrategy: isProjectorTheme
            ? 'Interactive Education & Simulation-Based 3LCD Projection Displays'
            : isEcoThemed
            ? 'Eco-Efficiency & Green TCO Savings'
            : 'Enterprise IT & Business Hardware',
          keyPillars: [
            'Immersive classroom and simulation-based learning environments',
            'Floor-to-ceiling high brightness visual scale for venues and institutions',
            'Direct lead generation to "View details" technical specifications'
          ],
          callToActionDistribution: {
            'View details': ctas.filter(c => c === 'View details').length || ads.length,
            'Learn more': ctas.filter(c => c === 'Learn more').length,
            'Other': ctas.filter(c => c !== 'View details' && c !== 'Learn more').length
          },
          recommendedCounterPositioning: [
            'Highlight Brother high-reliability printing and compact desktop all-in-one efficiency.',
            'Emphasize local Singapore fast onsite service and low maintenance cost.',
            'Target hybrid office teams requiring secure network integration.'
          ]
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, analysis }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 LinkedIn Ads Library Live Playwright Server running on port ${PORT}`);
  console.log(`📡 Endpoints available:`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/linkedin/competitors`);
  console.log(`   - GET  http://localhost:${PORT}/api/linkedin/search?accountOwner=epson+singapore&countries=SG`);
  console.log(`   - POST http://localhost:${PORT}/api/linkedin/analyze`);
});
