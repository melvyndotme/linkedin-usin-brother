// Vercel Serverless Function: Consolidated AI Media Studio & CORS Image Proxy
// Merges Imagen 3 Image Generation & Secure Image Proxy to optimize Vercel Serverless limits

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

  // 1. Image Proxy Mode (GET /api/ai/media?url=...)
  const imageUrl = req.query?.url;
  if (req.method === 'GET' || imageUrl) {
    if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
      return res.status(400).json({ error: 'Valid image URL is required' });
    }

    try {
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Failed to fetch image: ${response.statusText}` });
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const buffer = await response.arrayBuffer();

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      return res.send(Buffer.from(buffer));
    } catch (err) {
      console.error('Image proxy error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. AI Image Generation Mode (POST /api/ai/media)
  if (req.method === 'POST') {
    const { 
      prompt, 
      occasionName, 
      theme, 
      aspectRatio = '1:1', 
      model = 'gemini-3.1-flash-image' 
    } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-key'] || req.body?.apiKey;

    const enhancedPrompt = prompt || `High-end commercial corporate photography for ${occasionName || 'Brother Singapore'}. Professional lighting, authentic cultural celebration in Singapore, elegant modern aesthetic, cinematic 8k resolution, photorealistic corporate editorial style. No text, no distorted hands, clean composition.`;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        errorType: 'MISSING_API_KEY',
        modelUsed: model,
        error: 'No Gemini API Key found. Please add your Gemini API Key in Settings to generate AI visuals.',
        troubleshooting: 'Go to Settings > Gemini API to enter your API key from Google AI Studio.'
      });
    }

    try {
      // Candidate image generation endpoints for Google AI Studio / Gemini
      const candidateEndpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`
      ];

      let lastError = null;

      for (const endpoint of candidateEndpoints) {
        try {
          const imagenRes = await fetch(endpoint, {
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
          });

          if (imagenRes.ok) {
            const data = await imagenRes.json();
            const b64 = data.predictions?.[0]?.bytesBase64Encoded;
            if (b64) {
              return res.status(200).json({
                success: true,
                source: 'imagen-3',
                modelUsed: model,
                imageUrl: `data:image/jpeg;base64,${b64}`,
                prompt: enhancedPrompt
              });
            }
          }

          const errData = await imagenRes.json().catch(() => ({}));
          lastError = errData.error?.message || `HTTP ${imagenRes.status} ${imagenRes.statusText}`;
        } catch (fetchErr) {
          lastError = fetchErr.message;
        }
      }

      // Check if the error is due to tier restriction / missing predict permission
      const isTierIssue =
        !lastError ||
        lastError.includes('is not found') ||
        lastError.includes('not supported for predict') ||
        lastError.includes('PERMISSION_DENIED') ||
        lastError.includes('API_KEY_INVALID') ||
        lastError.includes('404');

      return res.status(200).json({
        success: false,
        errorType: isTierIssue ? 'TIER_BILLING_REQUIRED' : 'API_ERROR',
        modelUsed: model,
        error: isTierIssue
          ? `Google AI Studio: The model "${model}" requires an account with billing enabled (Tier 1/Pay-As-You-Go). Free-tier Google AI Studio API keys do not include access to the Imagen predict image generation API.`
          : (lastError || 'Image generation API was unable to generate an image.'),
        troubleshooting: isTierIssue
          ? 'To generate custom AI images: 1) Go to aistudio.google.com, 2) Link a billing project for Pay-As-You-Go access, and 3) Generate an API key. Alternatively, pick from Brother\'s 12 official SG assets or curated Singapore photography below (0 tokens required).'
          : 'Please check your API key in Settings.',
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

  return res.status(405).json({ error: 'Method not allowed' });
}
