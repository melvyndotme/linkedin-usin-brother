// Vercel Serverless Function: Consolidated AI Media Studio & CORS Image Proxy
// Merges Imagen 3 Image Generation & Secure Image Proxy to optimize Vercel Serverless limits
import { logServerAudit } from '../audit-helper.js';

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

  // 1.5 Gemini 3-Draft Post Generation Mode (POST /api/ai/media with type: 'drafts')
  if (req.method === 'POST' && req.body?.type === 'drafts') {
    const { occasionName, occasionDetails, styleGuide, facts, audience, modelName } = req.body;
    const targetModel = modelName || req.body?.model || 'gemini-3.8-flash';
    const clientKey = (req.headers['x-gemini-key'] || req.body?.apiKey || '').trim();
    const apiKey = 
      clientKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        errorType: 'MISSING_API_KEY',
        error: 'No Gemini API Key found. Add GEMINI_API_KEY in environment or app settings.'
      });
    }

    const rawFrameworks = req.body?.frameworks || (req.body?.framework ? [req.body.framework] : []);
    const activeFrameworks = Array.isArray(rawFrameworks) 
      ? rawFrameworks.filter(f => f && f.id && f.id !== 'none')
      : [];

    let systemPrompt = '';
    if (activeFrameworks.length > 0) {
      systemPrompt = `You are the lead executive LinkedIn editorial strategist and communication architect for Brother International Singapore.
Your goal is to engineer exactly ${activeFrameworks.length} distinct, high-converting LinkedIn post candidate draft(s) tailored to each framework below:
- BRAND POSITIONING: "At your side" — empathetic, dependable, consultative, customer-centric.
- JAPANESE CRAFTSMANSHIP: Grounded in Kaizen (continuous refinement) and Monozukuri (the art, spirit, and dedication of Japanese making).
- LOCAL SINGAPORE RELEVANCE: Tailored specifically to Singapore SMEs, enterprise decision-makers, office managers, IT heads, and modern workplaces.
- STRICT ETHICAL GUARDRAIL: Strict ban on LGBTQ+ or polarizing political topics. Focus on workplace harmony (Wa), productivity, sustainable technology (Brother Earth), and genuine community connection.

TOPIC / OCCASION: ${occasionName || 'Workplace Productivity & Innovation'}
SOURCE CONTEXT / FACTS: ${occasionDetails || facts || 'Brother "At your side" philosophy, Japanese craftsmanship (Kaizen, Monozukuri), long-term reliability, Singapore SME solutions.'}

EDITORIAL EXECUTION REQUIREMENTS:
1. HOOK: First 140 characters must captivate reader curiosity before the LinkedIn mobile fold ("...see more"). Never open with generic corporate self-congratulations.
2. RHYTHM & PACING: Use short, breathable paragraphs (1-2 sentences each), rhythmic line breaks, and clear bullet points for scanning.
3. CONCRETE VALUE OVER ABSTRACT TECH: Translate technical features into concrete human outcomes (time saved, seamless collaboration, uninterrupted peace of mind).
4. ENGAGING CALL-TO-ACTION (CTA): End with an authentic, consultative conversation-starter that invites comments, reflections, or shares.
5. HASHTAGS: Exactly 3 to 5 targeted professional hashtags including #BrotherSingapore and #AtYourSide.

${activeFrameworks.map((fw, i) => `
--- DRAFT ${i + 1} (Target Slot: Draft 0${(typeof fw.slotIndex === 'number' ? fw.slotIndex : i) + 1}) ---
Framework Name: ${fw.name || 'High-Impact Thought Leadership'}
Cognitive Formula: ${fw.formula || 'Strategic narrative sequence'}
Underlying Philosophy: ${fw.philosophy || 'Sell the outcome before the feature; make the audience the protagonist.'}
Sequence Steps: ${(fw.structureSteps || []).map(s => s.step + ': ' + (s.purpose || s.prompt)).join(' | ')}
Writing Rules: ${(fw.rules || []).join(', ')}
`).join('\n')}

Return ONLY a strict JSON array of exactly ${activeFrameworks.length} object(s):
[
${activeFrameworks.map((fw, i) => `  {
    "slotIndex": ${typeof fw.slotIndex === 'number' ? fw.slotIndex : i},
    "id": "draft-${(typeof fw.slotIndex === 'number' ? fw.slotIndex : i) + 1}",
    "name": "${fw.name || `Draft ${i + 1}`}",
    "angle": "Specific Angle & Strategic Rationale",
    "whyThisWorks": "Detailed explanation of why this hooks and persuades the audience using this framework",
    "postContent": "Complete LinkedIn post with hook, narrative spacing, bullet points, consultative call to action, and hashtags #BrotherSingapore #AtYourSide",
    "frameworkId": "${fw.id || ''}"
  }`).join(',\n')}
]`;
    } else {
      systemPrompt = `You are the lead LinkedIn editorial strategist for Brother Singapore.
Generate exactly 3 distinct, high-impact LinkedIn post drafts for Brother Singapore based on the following framework rules and context:

FRAMEWORK NAME: ${styleGuide?.name || 'Brother Content Framework'}
PHILOSOPHY: ${styleGuide?.philosophy || 'Sell outcome before features'}
AUDIENCE: ${audience || styleGuide?.audience || 'Singapore professionals, SMEs, and community partners'}
TOPIC / OCCASION: ${occasionName || 'Workplace Productivity & Innovation'}
SOURCE FACTS: ${occasionDetails || facts || 'Brother "At your side" philosophy, Japanese craftsmanship (Kaizen), long-term reliability.'}
NARRATIVE STEPS: ${(styleGuide?.structureSteps || []).map(s => s.step + ': ' + (s.purpose || s.prompt)).join(' | ')}
WRITING RULES: ${(styleGuide?.rules || []).join(', ')}
CULTURAL CALIBRATION: Respectful, consultative, collective harmony (Wa), Long-Term Orientation (LTO), and craft precision (Monozukuri). STRICT BAN ON LGBTQ+ TOPICS.

Return ONLY a strict JSON array of exactly 3 objects:
[
  {
    "id": "draft-1",
    "name": "Concise Descriptive Title for Angle 1",
    "angle": "Specific Angle & Strategic Rationale",
    "whyThisWorks": "Detailed explanation of why this hooks and persuades the target audience",
    "postContent": "Complete LinkedIn post with hook, narrative spacing, bullet points, call to action, and hashtags #BrotherSingapore #AtYourSide"
  },
  {
    "id": "draft-2",
    "name": "Concise Descriptive Title for Angle 2",
    "angle": "Specific Angle & Strategic Rationale",
    "whyThisWorks": "Detailed explanation of why this hooks and persuades the target audience",
    "postContent": "Complete LinkedIn post with hook, narrative spacing, bullet points, call to action, and hashtags #BrotherSingapore #AtYourSide"
  },
  {
    "id": "draft-3",
    "name": "Concise Descriptive Title for Angle 3",
    "angle": "Specific Angle & Strategic Rationale",
    "whyThisWorks": "Detailed explanation of why this hooks and persuades the target audience",
    "postContent": "Complete LinkedIn post with hook, narrative spacing, bullet points, call to action, and hashtags #BrotherSingapore #AtYourSide"
  }
]`;
    }

    try {
      const parts = [{ text: systemPrompt }];

      // Multimodal Support: Attach uploaded promotional image if supplied
      const inputImage = req.body?.imageBase64 || req.body?.image;
      if (inputImage && typeof inputImage === 'string') {
        const base64Data = inputImage.includes('base64,') ? inputImage.split('base64,')[1] : inputImage;
        const mimeMatch = inputImage.match(/data:([^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        parts.unshift({
          inline_data: {
            mime_type: mimeType,
            data: base64Data
          }
        });
        // Append explicit multimodal instruction to prompt
        parts[1].text += '\n\nIMPORTANT MULTIMODAL INSTRUCTION: The user has attached a promotional product image. Carefully inspect the visual features, product name/model, visible specs, headlines, and aesthetic cues in this image, and weave these specific product details directly into each generated draft.';
      }

      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        })
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        return res.status(resp.status).json({ success: false, error: errJson.error?.message || resp.statusText });
      }

      const data = await resp.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedDrafts = JSON.parse(rawText);
      logServerAudit({
        event: 'Generated 3 AI Drafts',
        user: req.body?.user?.name || 'Content Creator',
        email: req.body?.user?.email || '',
        role: req.body?.user?.role || 'Team Member',
        category: 'Content Generation',
        details: `Generated 3 candidate drafts for "${occasionName || 'Campaign'}" with style guide "${styleGuide?.name || 'Curated Angle'}"`,
        status: 'Success'
      });
      return res.status(200).json({ success: true, drafts: parsedDrafts });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
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

    const baseUserPrompt = prompt?.trim() || `High-end commercial corporate photography for ${occasionName || 'Brother Singapore'}`;
    const enhancedPrompt = `${baseUserPrompt}. Ultra-realistic commercial photography, high dynamic range, crisp three-point studio lighting with soft diffused fill, clean architectural lines, modern Japanese minimalist aesthetic, photorealistic corporate editorial visual. CRITICAL REQUIREMENTS: Text-free, no typography, no letters or numbers, no watermark, clean background layer for graphic layout. 8k resolution, cinematic color grading.`;

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
              logServerAudit({
                apiKey: process.env.NOTION_API_KEY,
                event: 'Generated AI Visual',
                user: req.body?.user?.name || 'Visual Designer',
                email: req.body?.user?.email || '',
                role: req.body?.user?.role || 'Team Member',
                category: 'Visual Studio',
                details: `Generated AI visual using ${m} for "${occasionName || 'Brother Singapore'}" (${aspectRatio})`,
                status: 'Success'
              });
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
              logServerAudit({
                apiKey: process.env.NOTION_API_KEY,
                event: 'Generated AI Visual',
                user: req.body?.user?.name || 'Visual Designer',
                email: req.body?.user?.email || '',
                role: req.body?.user?.role || 'Team Member',
                category: 'Visual Studio',
                details: `Generated visual using Imagen 3 for "${occasionName || 'Brother Singapore'}" (${aspectRatio})`,
                status: 'Success'
              });
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
