// Curated Google Gemini & Nano Banana Models API Resolver
// Returns strictly the Top 5 Frontier Text models and Top 3 Frontier Image models.
// Verifies live availability with Google's API while preventing model list clutter.

const CURATED_FRONTIER_MODELS = {
  text: [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      badge: 'New Flagship',
      category: 'Frontier Flagship',
      description: 'Our most intelligent Flash model, engineered for autonomous agents and complex workflows'
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'Gemini 3.1 Pro',
      badge: 'Deep Reasoning',
      category: 'Frontier Flagship',
      description: 'Advanced intelligence, multi-step problem solving, and nuanced strategic deconstruction'
    },
    {
      id: 'gemini-3.6-flash',
      name: 'Gemini 3.6 Flash',
      badge: 'Balanced Workhorse',
      category: 'Frontier Flagship',
      description: 'Production-grade workhorse balancing speed, precision, and multimodal understanding'
    },
    {
      id: 'gemini-3.5-flash-lite',
      name: 'Gemini 3.5 Flash-Lite',
      badge: 'Ultra Fast',
      category: 'Frontier High-Speed',
      description: 'Lightweight, ultra-fast generation engineered for velocity and instant turnaround'
    },
    {
      id: 'gemma-2-27b-it',
      name: 'Gemma 2 27B',
      badge: 'Open Weights',
      category: 'Open Source Frontier',
      description: 'Google DeepMind high-performance 27B instruction-tuned open weights model'
    }
  ],
  image: [
    {
      id: 'gemini-nano-banana-2.1',
      name: 'Nano Banana 2.1',
      badge: 'New Flagship Image',
      category: 'Nano Banana Creative',
      description: 'High-efficiency image generation with state-of-the-art typography and photorealism'
    },
    {
      id: 'gemini-3-pro-image',
      name: 'Nano Banana Pro',
      badge: 'Studio 4K & Thinking',
      category: 'Nano Banana Creative',
      description: 'Professional design engine with reasoning core for studio-quality 4K visuals'
    },
    {
      id: 'gemini-3.1-flash-lite-image',
      name: 'Nano Banana 2 Lite',
      badge: 'Fast & Lightweight',
      category: 'Nano Banana Creative',
      description: 'Ultra-fast, cost-effective image generator designed for rapid social asset creation'
    }
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

  const filterContext = req.query.context || req.query.type; // 'text', 'image', or undefined for all

  // Select target curated models based on context
  const targetCurated = filterContext === 'image'
    ? CURATED_FRONTIER_MODELS.image
    : filterContext === 'text'
      ? CURATED_FRONTIER_MODELS.text
      : [...CURATED_FRONTIER_MODELS.text, ...CURATED_FRONTIER_MODELS.image];

  // If no API key provided, return curated list immediately
  if (!apiKey) {
    return res.status(200).json({
      success: true,
      source: 'curated-frontier',
      models: targetCurated,
      fetchedAt: new Date().toISOString()
    });
  }

  try {
    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!googleRes.ok) {
      throw new Error(`Google API status ${googleRes.status}`);
    }

    const data = await googleRes.json();
    const liveModels = Array.isArray(data.models) ? data.models : [];
    const liveIds = new Set(liveModels.map(m => m.name.replace(/^models\//, '')));

    // Tag whether each curated model is currently active/accessible on user's API key
    const validated = targetCurated.map(m => ({
      ...m,
      isLiveVerified: liveIds.has(m.id)
    }));

    return res.status(200).json({
      success: true,
      source: 'curated-frontier-verified',
      models: validated,
      fetchedAt: new Date().toISOString()
    });

  } catch (err) {
    // If Google request fails or times out, gracefully return curated models
    return res.status(200).json({
      success: true,
      source: 'curated-frontier-fallback',
      models: targetCurated,
      fetchedAt: new Date().toISOString()
    });
  }
}
