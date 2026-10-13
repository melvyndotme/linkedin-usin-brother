// Gemini Ingestion & Template Deconstruction Engine
// Uses Gemini 3.1 Flash-Lite (default) or Gemini 3.1 Pro-Preview for deep multimodal extraction

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { type, content, base64Image, title, modelName } = req.body || {};
  const clientKey = (req.headers['x-gemini-key'] || req.body?.apiKey || '').trim();
  const apiKey = 
    clientKey ||
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_API_KEY || 
    process.env.GOOGLE_GEMINI_API_KEY || 
    process.env.VITE_GEMINI_API_KEY;

  let postContent = content;
  let detectedTitle = title;
  const targetPromoUrl = req.body?.url || (type === 'scrape_promo' ? content : null);

  // Dedicated Webpage Promotion Scraper
  if (type === 'scrape_promo' && targetPromoUrl) {
    if (!/^https?:\/\//i.test(targetPromoUrl)) {
      return res.status(400).json({ success: false, error: 'A valid HTTP/HTTPS URL is required.' });
    }

    try {
      const pageRes = await fetch(targetPromoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        redirect: 'follow'
      });

      if (!pageRes.ok) {
        return res.status(400).json({ success: false, error: `Webpage returned status code ${pageRes.status}` });
      }

      const rawHtml = await pageRes.text();

      // Extract metadata tags
      const ogTitleMatch = rawHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
        || rawHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
      const titleTagMatch = rawHtml.match(/<title>([^<]+)<\/title>/i);
      const ogDescMatch = rawHtml.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
        || rawHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
        || rawHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

      let cleanTitle = (ogTitleMatch?.[1] || titleTagMatch?.[1] || '').trim();
      cleanTitle = cleanTitle.replace(/\s*[|\-–—]\s*(Brother|Brother Singapore|Official Site|Singapore).*$/i, '').trim();

      const rawDesc = (ogDescMatch?.[1] || '').trim();

      // Clean HTML body to extract meaningful readable promotion text
      const cleanBody = rawHtml
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<svg[\s\S]*?<\/svg>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

      const textMatches = cleanBody.match(/<(?:h[1-6]|p|li)[^>]*>([\s\S]*?)<\/(?:h[1-6]|p|li)>/gi) || [];
      const extractedSnippets = textMatches
        .map(t => t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(t => t.length > 20)
        .slice(0, 30)
        .join('\n\n');

      const fullPageText = (rawDesc ? `Overview: ${rawDesc}\n\n` : '') + extractedSnippets;

      // Extract possible dates (e.g. "31 December 2026", "28 Feb 2026", "2026-12-31")
      let detectedDate = null;
      const dateMatch = fullPageText.match(/\b(\d{1,2})[\s\/\-\.](Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s\/\-\.](\d{4})\b/i);
      if (dateMatch) {
        try {
          const parsedD = new Date(`${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}`);
          if (!isNaN(parsedD.getTime())) {
            detectedDate = parsedD.toISOString().split('T')[0];
          }
        } catch (_) {}
      }

      // If Gemini Key is configured, use Gemini 2.5 Flash to synthesize campaign details
      if (apiKey) {
        try {
          const prompt = `You are an expert social media copywriter for Brother Singapore.
Analyze the following scraped promotional webpage content and extract the campaign details.
Return ONLY valid JSON matching this schema:
{
  "title": "Clean, attractive campaign/event title (max 8-10 words)",
  "details": "Clear, comprehensive summary of the promotion, key offers, warranty details, discounts, eligible models, and customer value proposition (2-3 paragraphs)",
  "date": "YYYY-MM-DD format of campaign end/validity date if clearly mentioned, otherwise null",
  "categoryType": "promotion",
  "theme": "red",
  "suggestedHashtags": ["#BrotherSingapore", "#Promotion", "#AtYourSide"]
}

URL: ${targetPromoUrl}
Title Found: ${cleanTitle}
Page Content:
${fullPageText.slice(0, 4500)}`;

          const gResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json'
                }
              })
            }
          );

          if (gResp.ok) {
            const gData = await gResp.json();
            const jsonText = gData.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) {
              const parsed = JSON.parse(jsonText);
              return res.status(200).json({
                success: true,
                source: 'gemini-ai',
                data: {
                  title: parsed.title || cleanTitle || 'Brother Singapore Promotion',
                  details: parsed.details || fullPageText.slice(0, 600),
                  date: parsed.date || detectedDate,
                  categoryType: parsed.categoryType || 'promotion',
                  theme: parsed.theme || 'red',
                  suggestedHashtags: parsed.suggestedHashtags || ['#BrotherSingapore', '#Promotion', '#AtYourSide']
                }
              });
            }
          }
        } catch (geminiErr) {
          console.warn('Gemini promo extraction error:', geminiErr.message);
        }
      }

      // Offline / Heuristic Fallback
      return res.status(200).json({
        success: true,
        source: 'heuristic',
        data: {
          title: cleanTitle || 'Brother Singapore Promotional Campaign',
          details: fullPageText.slice(0, 600) || rawDesc || 'Special promotional campaign and offerings from Brother Singapore.',
          date: detectedDate,
          categoryType: 'promotion',
          theme: 'red',
          suggestedHashtags: ['#BrotherSingapore', '#Promotion', '#WorkplaceTech', '#AtYourSide']
        }
      });
    } catch (fetchErr) {
      console.error('Scrape webpage error:', fetchErr);
      return res.status(500).json({ success: false, error: fetchErr.message });
    }
  }

  // If input is a URL, attempt to scrape OpenGraph metadata for the actual post text
  if (type === 'url' && /^https?:\/\//i.test(content)) {
    try {
      const pageRes = await fetch(content, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        redirect: 'follow'
      });
      if (pageRes.ok) {
        const html = await pageRes.text();
        const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);

        if (ogDescMatch && ogDescMatch[1]) {
          postContent = ogDescMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          if (!title && titleMatch && titleMatch[1]) {
            detectedTitle = titleMatch[1].split('|')[0].split(' - ')[0].trim();
          }
        }
      }
    } catch (fetchErr) {
      console.warn('Could not scrape URL metadata:', fetchErr.message);
    }
  }

  if (!apiKey) {
    // If no key is set yet, return structured fallback with professional status
    return res.status(200).json({
      success: true,
      source: 'offline-preview',
      template: {
        id: `tmpl-extracted-${Date.now()}`,
        source: type === 'url' ? `Live Post: ${content}` : type === 'screenshot' ? 'Screenshot Visual Deconstruction' : 'PDF Document Archive',
        name: detectedTitle || title || 'Culturally Calibrated Extracted Blueprint',
        category: 'Extracted Benchmark',
        tone: 'Respectful, consultative, team-oriented',
        description: 'Deconstructed into actionable instructional placeholders aligned with Brother Singapore brand guidelines.',
        placeholderTemplate: `[Insert Hook: Highlight an operational reality, thought-provoking question, or cultural reflection within 120 characters]

[State the Communal Context: Explain the workplace friction or challenge being solved without self-congratulation]

Key Reflections & Takeaways:
🔹 [Point 1: Concrete achievement, craft mastery, or precision reliability]
🔹 [Point 2: Cross-team collaboration and collective harmony (Wa)]
🔹 [Point 3: Long-term capability building and sustainability]

[Brother Connection: Connect back to our 'At your side' commitment with quiet dedication and integrity]

[Insert Call to Action: Sincere, consultative question inviting community perspectives 👇]

#BrotherSingapore #AtYourSide #LifeAtBrother #WorkplaceHarmony`
      }
    });
  }

  // Active Gemini 3.1 Model Selection
  const targetModel = modelName === 'gemini-3.1-pro-preview' 
    ? 'gemini-3.1-pro-preview' 
    : 'gemini-3.1-flash-lite';

  const systemInstruction = `
You are an expert social media strategist, brand consultant, and copywriting director for Brother Singapore.
Analyze the provided benchmark LinkedIn post (or image screenshot / PDF) through a deep strategic deconstruction and convert it into a reusable "Content Framework" for Brother Singapore.

EXECUTE A COMPREHENSIVE STRATEGIC DECONSTRUCTION:
1. Deconstruct the post: Structure, Hook, Product/Message Reveal, Audience Definition, Benefit Statement, and What it avoids (spec dumps, corporate jargon).
2. Analyze Tone: Tonal characteristics (e.g. conversational vs corporate, approachability, confidence).
3. Analyze Visual/Creative Alignment: How image creative and copy reinforce one core idea.
4. Infer Communication Philosophy: The underlying formula (e.g., Sell possibility before specification; Human outcome over machine specs).
5. Critique: What is working well vs. Opportunities for Improvement (e.g., generic hook, implicit friction, vague benefit, weak CTA).
6. Evolve into a Structured Content Framework: Generate a step-by-step formula (e.g. H-C-V-P-P-A, F-C-A-R, O-C-D-I-P) with step names, purposes, and prompts.
7. Style Guide & Writing Rules: Target word count, 'see more' fold rule, paragraph breaks, emoji guidance, hashtags.
8. Applied Brother Singapore Post Example: Write a concrete, high-converting post demonstrating the framework applied to Brother Singapore (connecting back to 'At your side' or Monozukuri / Kaizen).

CRITICAL CONTENT POLICY & CULTURAL GUARDRAILS:
1. STRICT BAN ON LGBTQ+ TOPICS:
   - ABSOLUTELY NO PRIDE in relation to LGBTQ+, Pride Month, Spectrum, Pink Dot, or any queer/gender identity campaigns.
   - Do NOT include any LGBTQ+ terminology, hashtags, flags, or concepts under any circumstance.
   - Note: Legitimate uses of pride such as "national unity / national pride in Singapore's milestones" or "dedication and pride in craftsmanship (Monozukuri)" are acceptable when strictly referring to work excellence or national occasions.
2. HOFSTEDE ASIAN CULTURAL CALIBRATION:
   - Power Distance (PDI: 74): Deferential, consultative, honoring leadership custodianship and the Senpai-Kohai mentorship dynamic.
   - Collectivism (IDV: 20): Highlight team solidarity, collective harmony (Wa), family care, and Singapore's multicultural tapestry.
   - Long-Term Orientation (LTO: 72): Emphasize Kaizen, multi-year skills adaptation, and generational stewardship.
   - Monozukuri: Celebrate quiet engineering precision, mission-critical dependability, and zero-defect excellence over boastful marketing swagger.
`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const parts = [
      { text: systemInstruction }
    ];

    if (type === 'screenshot' && base64Image) {
      const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64
        }
      });
      parts.push({ text: 'Perform a full 10-step strategic deconstruction of this LinkedIn post screenshot and evolve it into a reusable Content Framework for Brother Singapore.' });
    } else {
      parts.push({
        text: `Perform a full 10-step strategic deconstruction of this post and evolve it into a reusable Content Framework for Brother Singapore:\n\n${postContent}`
      });
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            category: { type: 'STRING' },
            formula: { type: 'STRING' },
            tone: { type: 'STRING' },
            description: { type: 'STRING' },
            philosophy: { type: 'STRING' },
            whyItDiffers: { type: 'STRING' },
            whenToUse: { type: 'STRING' },
            structureSteps: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  step: { type: 'STRING' },
                  label: { type: 'STRING' },
                  purpose: { type: 'STRING' },
                  prompt: { type: 'STRING' }
                },
                required: ['step', 'label', 'purpose', 'prompt']
              }
            },
            critique: {
              type: 'OBJECT',
              properties: {
                strengths: { type: 'ARRAY', items: { type: 'STRING' } },
                weaknesses: { type: 'ARRAY', items: { type: 'STRING' } }
              }
            },
            rules: { type: 'ARRAY', items: { type: 'STRING' } },
            examplePost: { type: 'STRING' },
            placeholderTemplate: { type: 'STRING' }
          },
          required: ['name', 'category', 'formula', 'tone', 'description', 'philosophy', 'whyItDiffers', 'whenToUse', 'structureSteps', 'rules', 'examplePost', 'placeholderTemplate']
        },
        temperature: 0.2
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(candidateText);

    return res.status(200).json({
      success: true,
      model: targetModel,
      template: {
        id: `framework-gemini-${Date.now()}`,
        source: type === 'url' ? `Live Post: ${content}` : type === 'screenshot' ? `Visual Ingestion (${targetModel})` : `PDF Archive (${targetModel})`,
        name: parsed.name,
        category: parsed.category || 'Extracted Benchmark',
        formula: parsed.formula || 'H-C-V-A',
        tone: parsed.tone,
        description: parsed.description,
        philosophy: parsed.philosophy,
        whyItDiffers: parsed.whyItDiffers,
        whenToUse: parsed.whenToUse,
        structureSteps: parsed.structureSteps || [],
        critique: parsed.critique || null,
        rules: parsed.rules || [],
        examplePost: parsed.examplePost,
        placeholderTemplate: parsed.placeholderTemplate
      }
    });
  } catch (err) {
    console.error('Gemini extraction error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
