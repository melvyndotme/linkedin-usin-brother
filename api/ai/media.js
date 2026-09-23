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

  const urlObj = new URL(req.url, 'http://localhost');
  const queryCheck = req.query?.check || urlObj.searchParams.get('check');
  const imageUrl = req.query?.url || urlObj.searchParams.get('url');

  // 0. Server Environment Status Check (GET /api/ai/media?check=status)
  if (req.method === 'GET' && queryCheck === 'status') {
    const hasEnv = Boolean(
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY
    );
    return res.status(200).json({
      configured: hasEnv,
      source: hasEnv ? 'vercel-environment' : 'none'
    });
  }

  // 0.2 Test Gemini Image Model generateContent (GET /api/ai/media?check=test-gemini-image)
  if (req.method === 'GET' && queryCheck === 'test-gemini-image') {
    const apiKey = 
      process.env.GEMINI_API_KEY || 
      process.env.GOOGLE_API_KEY || 
      process.env.GOOGLE_GEMINI_API_KEY || 
      process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return res.status(200).json({ error: 'No key' });
    try {
      const targetModel = req.query?.model || 'gemini-3.1-flash-image';
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Generate an image of a sleek modern Brother Singapore printer on an executive office desk, professional corporate photography.' }]
          }]
        })
      });
      const data = await resp.json();
      return res.status(200).json({ status: resp.status, data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // 1. Image Proxy Mode (GET /api/ai/media?url=...)
  if (imageUrl) {
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

    const clientKey = (req.headers['x-gemini-key'] || req.body?.apiKey || '').trim();
    const apiKey = 
      clientKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    const enhancedPrompt = prompt || `High-end commercial corporate photography for ${occasionName || 'Brother Singapore'}. Professional lighting, authentic cultural celebration in Singapore, elegant modern aesthetic, cinematic 8k resolution, photorealistic corporate editorial style. No text, no distorted hands, clean composition.`;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        errorType: 'MISSING_API_KEY',
        modelUsed: model,
        error: 'No Gemini API Key found. You can add GEMINI_API_KEY directly to your Vercel Project Environment Variables, or enter it in Settings > Gemini API.',
        troubleshooting: 'In Vercel: Project Settings > Environment Variables > Add GEMINI_API_KEY. Alternatively, go to Settings in this app to enter your Google AI Studio API key.'
      });
    }

    try {
      let lastError = null;

      // 1. Primary Strategy: Native Gemini Multimodal Image Generation (:generateContent)
      const selectedModel = model || 'gemini-3.1-flash-image';
      const geminiImageModels = [
        selectedModel,
        'gemini-3.1-flash-image',
        'gemini-3.1-flash-lite-image',
        'gemini-2.5-flash-image',
        'gemini-3-pro-image'
      ].filter((m, i, arr) => m && arr.indexOf(m) === i && !m.startsWith('imagen-'));

      for (const m of geminiImageModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Generate an image: ${enhancedPrompt}`
                      }
                    ]
                  }
                ]
              })
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const parts = data.candidates?.[0]?.content?.parts || [];
            const imgPart = parts.find((p) => p.inlineData?.data);
            if (imgPart) {
              const mime = imgPart.inlineData.mimeType || 'image/jpeg';
              return res.status(200).json({
                success: true,
                source: 'google-ai',
                modelUsed: m,
                imageUrl: `data:${mime};base64,${imgPart.inlineData.data}`,
                prompt: enhancedPrompt
              });
            }
          } else {
            const errData = await geminiRes.json().catch(() => ({}));
            lastError = errData.error?.message || `HTTP ${geminiRes.status} ${geminiRes.statusText}`;
          }
        } catch (fetchErr) {
          lastError = fetchErr.message;
        }
      }

      // 2. Secondary Strategy: Imagen Predict Endpoints (:predict)
      const candidateModels = [
        'imagen-3.0-generate-002',
        'imagen-3.0-fast-generate-001',
        'imagen-3.0-generate-001'
      ];
      const candidateEndpoints = candidateModels.map(
        (m) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:predict?key=${apiKey}`
      );

      for (const endpoint of candidateEndpoints) {
        try {
          const imagenRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instances: [{ prompt: enhancedPrompt }],
              parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio === '1.91:1' ? '16:9' : '1:1'
              }
            })
          });

          if (imagenRes.ok) {
            const data = await imagenRes.json();
            const b64 = data.predictions?.[0]?.bytesBase64Encoded;
            if (b64) {
              return res.status(200).json({
                success: true,
                source: 'google-ai',
                modelUsed: model || 'imagen-3.0',
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

      // Diagnose API error category
      const isInvalidKey = lastError && (lastError.includes('API_KEY_INVALID') || lastError.includes('key not valid'));
      const isTierIssue =
        !lastError ||
        lastError.includes('is not found') ||
        lastError.includes('not supported for predict') ||
        lastError.includes('PERMISSION_DENIED') ||
        lastError.includes('BILLING_DISABLED') ||
        lastError.includes('404');

      let errorMsg = lastError || 'Image generation API was unable to generate an image.';
      let troubleMsg = 'Please verify your API key in Vercel Environment Variables or in Settings.';

      if (isInvalidKey) {
        errorMsg = 'Google AI Studio: The provided API key is invalid or has expired.';
        troubleMsg = 'Please verify the GEMINI_API_KEY environment variable in Vercel or Settings.';
      } else if (isTierIssue) {
        errorMsg = `Google AI Studio: Imagen 3 requires an account with billing enabled (Tier 1/Pay-As-You-Go). Free-tier API keys do not include access to the Imagen predict API.`;
        troubleMsg = "To generate custom AI images: 1) Go to aistudio.google.com, 2) Link a billing project for Pay-As-You-Go access, and 3) Add GEMINI_API_KEY to Vercel Environment Variables. Alternatively, choose from Brother's 12 official SG assets or curated Singapore photography below (0 tokens required).";
      }

      return res.status(200).json({
        success: false,
        errorType: isInvalidKey ? 'INVALID_KEY' : isTierIssue ? 'TIER_BILLING_REQUIRED' : 'API_ERROR',
        modelUsed: model,
        error: errorMsg,
        rawGoogleError: lastError,
        troubleshooting: troubleMsg,
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
