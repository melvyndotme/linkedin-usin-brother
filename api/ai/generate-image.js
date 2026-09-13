// Vercel Serverless Function: AI Image Generation for LinkedIn Visuals
// Integrates with Google Imagen 3 (imagen-3.0-generate-002) via Gemini API Key

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-gemini-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { prompt, occasionName, theme, aspectRatio = '1:1' } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-key'] || req.body?.apiKey;

  // Build brand-calibrated prompt
  const enhancedPrompt = prompt || `High-end commercial corporate photography for ${occasionName || 'Brother Singapore'}. Professional lighting, authentic cultural celebration in Singapore, elegant modern aesthetic, cinematic 8k resolution, photorealistic corporate editorial style. No text, no distorted hands, clean composition.`;

  if (!apiKey) {
    return res.status(200).json({
      success: true,
      source: 'curated-fallback',
      message: 'GEMINI_API_KEY is not configured. Returning curated high-res visual.',
      imageUrl: null
    });
  }

  try {
    // 1. Attempt Imagen 3 call via Gemini Generative Language API
    const imagenRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: enhancedPrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatio === '1.91:1' ? '16:9' : '1:1',
            personGeneration: 'ALLOW_ADULT'
          }
        })
      }
    );

    if (imagenRes.ok) {
      const data = await imagenRes.json();
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        return res.status(200).json({
          success: true,
          source: 'imagen-3',
          imageUrl: `data:image/jpeg;base64,${b64}`,
          prompt: enhancedPrompt
        });
      }
    }

    const errData = await imagenRes.json().catch(() => ({}));
    return res.status(200).json({
      success: false,
      error: errData.error?.message || 'Imagen API was unable to generate an image.',
      prompt: enhancedPrompt
    });
  } catch (error) {
    console.error('Error generating AI image:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
