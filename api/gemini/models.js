// Dynamic Google Gemini / Nano Banana / Gemma Models API Resolver
// Queries Google's live GET /v1beta/models endpoint when an API key is available,
// and gracefully falls back to the official up-to-date Gemini 3 / Nano Banana / Gemma catalog.

const OFFICIAL_GEMINI_3_CATALOG = {
  text: [
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', badge: 'New Flagship', category: 'Gemini 3 (Frontier)', description: 'Most intelligent Flash model for autonomous agents and complex workflows' },
    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', badge: 'Stable', category: 'Gemini 3 (Frontier)', description: 'Balanced speed and multimodal capabilities across everyday tasks' },
    { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', badge: 'Fast & High-Throughput', category: 'Gemini 3 (Frontier)', description: 'Fastest, most cost-effective 3.5 model for high-throughput execution' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', badge: 'Cost Efficient', category: 'Gemini 3 (Frontier)', description: 'Frontier-class performance rivaling larger models at a fraction of the cost' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', badge: 'Deep Reasoning', category: 'Gemini 3 (Pro Reasoning)', description: 'Advanced intelligence, complex problem-solving, and agentic capabilities' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', badge: 'Preview', category: 'Gemini 3 (Pro Reasoning)', description: 'Frontier-class performance preview' },
    { id: 'gemma-2-27b-it', name: 'Gemma 2 27B IT', badge: 'Open Weights', category: 'Gemma Open Family', description: 'Google DeepMind high-performance 27B instruction-tuned open weights model' },
    { id: 'gemma-2-9b-it', name: 'Gemma 2 9B IT', badge: 'Balanced Open', category: 'Gemma Open Family', description: 'Balanced 9B parameter open model' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Enterprise 2.5', category: 'Gemini 2.5 Enterprise', description: 'Best price-performance for enterprise tasks requiring reasoning' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', badge: 'Enterprise Pro', category: 'Gemini 2.5 Enterprise', description: 'Advanced 2.5 model for deep reasoning and multi-turn workflows' }
  ],
  image: [
    { id: 'gemini-nano-banana-2.1', name: 'Nano Banana 2.1', badge: 'New Flagship Image', category: 'Nano Banana Creative', description: 'High-efficiency image generation and editing with improved visual quality and typography' },
    { id: 'gemini-3.1-flash-lite-image', name: 'Nano Banana 2 Lite', badge: 'Fast & Cheap', category: 'Nano Banana Creative', description: 'Fastest and cheapest Gemini image model for velocity and scale' },
    { id: 'gemini-3.1-flash-image', name: 'Nano Banana 2', badge: '4K Production', category: 'Nano Banana Creative', description: 'Powerful, high-efficiency image generation optimized for 4K rendering' },
    { id: 'gemini-3-pro-image', name: 'Nano Banana Pro', badge: 'Studio 4K & Thinking', category: 'Nano Banana Creative', description: 'State-of-the-art design engine with reasoning core for studio 4K visuals' },
    { id: 'gemini-2.5-flash-image', name: 'Nano Banana Legacy', badge: 'Legacy 2.5', category: 'Nano Banana Creative', description: 'Previous-generation native image generation and editing' }
  ]
};

export default async function handler(req, res) {
  const clientKey = (req.headers['x-gemini-key'] || req.query.apiKey || '').trim();
  const apiKey = 
    clientKey ||
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_API_KEY || 
    process.env.GOOGLE_GEMINI_API_KEY || 
    process.env.VITE_GEMINI_API_KEY;

  const filterContext = req.query.context; // 'text', 'image', or undefined for all

  // If no API key provided, immediately return the official static catalog
  if (!apiKey) {
    const models = filterContext === 'image' 
      ? OFFICIAL_GEMINI_3_CATALOG.image 
      : filterContext === 'text' 
        ? OFFICIAL_GEMINI_3_CATALOG.text 
        : [...OFFICIAL_GEMINI_3_CATALOG.text, ...OFFICIAL_GEMINI_3_CATALOG.image];

    return res.status(200).json({
      success: true,
      source: 'official-catalog',
      models,
      fetchedAt: new Date().toISOString()
    });
  }

  try {
    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!googleRes.ok) {
      throw new Error(`Google API returned status ${googleRes.status}`);
    }

    const data = await googleRes.json();
    const liveModels = Array.isArray(data.models) ? data.models : [];

    // Map and categorize live models
    const textModels = [];
    const imageModels = [];

    // First preserve our curated Gemini 3 & Nano Banana models that exist in Google's ecosystem
    const liveModelIds = new Set(liveModels.map(m => m.name.replace(/^models\//, '')));

    // Check curated text models
    for (const curated of OFFICIAL_GEMINI_3_CATALOG.text) {
      textModels.push({
        ...curated,
        isLiveVerified: liveModelIds.has(curated.id)
      });
    }

    // Check curated image models
    for (const curated of OFFICIAL_GEMINI_3_CATALOG.image) {
      imageModels.push({
        ...curated,
        isLiveVerified: liveModelIds.has(curated.id)
      });
    }

    // Also ingest any new models returned by Google's live endpoint that are not in our initial curated list
    for (const m of liveModels) {
      const cleanId = m.name.replace(/^models\//, '');
      const isKnownText = textModels.some(t => t.id === cleanId);
      const isKnownImage = imageModels.some(i => i.id === cleanId);

      if (!isKnownText && !isKnownImage && m.supportedGenerationMethods?.includes('generateContent')) {
        const isImage = /image|banana|vision/i.test(cleanId) || /image/i.test(m.displayName || '');
        const entry = {
          id: cleanId,
          name: m.displayName || cleanId,
          badge: 'Live Discovered',
          category: cleanId.startsWith('gemma') ? 'Gemma Open Family' : isImage ? 'Nano Banana Creative' : 'Google AI Live',
          description: m.description || '',
          isLiveVerified: true
        };

        if (isImage) {
          imageModels.push(entry);
        } else {
          textModels.push(entry);
        }
      }
    }

    let result = [];
    if (filterContext === 'image') {
      result = imageModels;
    } else if (filterContext === 'text') {
      result = textModels;
    } else {
      result = [...textModels, ...imageModels];
    }

    return res.status(200).json({
      success: true,
      source: 'live-google-api',
      totalAvailable: liveModels.length,
      models: result,
      fetchedAt: new Date().toISOString()
    });

  } catch (err) {
    console.warn('Could not query Google live models API, falling back to official catalog:', err.message);
    const fallback = filterContext === 'image' 
      ? OFFICIAL_GEMINI_3_CATALOG.image 
      : filterContext === 'text' 
        ? OFFICIAL_GEMINI_3_CATALOG.text 
        : [...OFFICIAL_GEMINI_3_CATALOG.text, ...OFFICIAL_GEMINI_3_CATALOG.image];

    return res.status(200).json({
      success: true,
      source: 'official-catalog-fallback',
      models: fallback,
      fetchedAt: new Date().toISOString()
    });
  }
}
