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

  // Active Gemini 3 / Gemma Model Selection
  const targetModel = modelName && typeof modelName === 'string'
    ? modelName.trim()
    : 'gemini-3.8-flash';

  const systemInstruction = `
You are an elite, world-class B2B editorial strategist, award-winning creative director, and master brand consultant for Brother Singapore (calibrated to the "At your side" brand promise, Singapore commercial landscape, and Japanese Monozukuri / Kaizen precision).

Your mission is to perform a masterclass-level DECONSTRUCTION of a competitor post (e.g., Epson, HP, Canon, Xerox) or benchmark campaign creative and evolve it into a completely elevated, reusable CONTENT FRAMEWORK with an authentic, non-rehashed Brother Singapore post.

STUDY THE BENCHMARK STANDARD (THIS IS THE LEVEL OF QUALITY AND THINKING REQUIRED):
When deconstructing a post like Epson's SureColor F370:
1. Deconstruct what the post is doing simultaneously:
   - Announcing a new product
   - Reframing the machine around user capability (creators, small businesses)
   - Contrastive insight: Notice what it DOES NOT DO: It avoids print speed specs, dimensions, ink volume, price, or a 10-bullet spec dump.
2. Dissect the Tone DNA:
   - "Optimistic + Approachable + Product-Confident"
   - Conversational, human, positive, specific, concise.
3. Infer the Communication Philosophy:
   - Sell the possibility before the specification.
   - Every post must transform: Company Message → Audience Relevance → Audience Action.
4. Deliver an honest, rigorous Critique (Weaknesses & Blindspots):
   - Hook is generic/cliché ("Our printer family just got a little bigger!").
   - Customer friction is left implicit instead of explicit.
   - Benefit ("bring personalized products to life") is attractive but vague — what can they actually make (apparel, drinkware, merch)?
   - Lacks a strong, single Call to Action (CTA) — it leaves the reader with a dead end.
   - Zero conversation potential — one-way broadcasting instead of two-way LinkedIn participation.
5. Evolve into a memorable Framework (e.g., H-C-V-P-P-A):
   - HOOK: Earn attention with curiosity, relatable problem, or opportunity before naming any product.
   - CONTEXT: Why should the audience care right now in their daily work/life?
   - VALUE: Translate specs into human outcome and creative/operational possibility.
   - PROOF: Credible facts (bundle, dates, model) without technical overwhelm.
   - POSSIBILITY: Future projection ("Office today. Rainy commute tomorrow. Brother has you covered.").
   - ACTION: One single, clear invitation to act or comment.
6. Synthesize a Creative Platform (Conceptual Leap):
   - Don't just say "Buy ink, get umbrella".
   - Find the conceptual bridge: Ink + Umbrella = "We've got you covered."
   - Connect it to the brand DNA: Brother "At your side" — useful at work and beyond!
7. Applied Brother Singapore Post:
   - Write an authentic, compelling post that embodies this creative leap, with generous whitespace, crisp cadence, and zero corporate fluff.

CRITICAL GUARDRAIL AGAINST CLONING / REHASHING:
- NEVER merely rehash competitor sentences by swapping names (e.g. replacing "Epson SureColor F370" with "Brother GTXpro"). That is lazy and strictly forbidden!
- You must solve the competitor's weaknesses by identifying a genuine Singapore workplace or business scenario, anchoring the story in Brother's "At your side" partnership, and ending with an active community discussion prompt.

CRITICAL CONTENT POLICY & CULTURAL GUARDRAILS:
1. STRICT BAN ON LGBTQ+ TOPICS:
   - ABSOLUTELY NO PRIDE in relation to LGBTQ+, Pride Month, Spectrum, Pink Dot, or any queer/gender identity campaigns.
   - Do NOT include any LGBTQ+ terminology, hashtags, flags, or concepts under any circumstance.
   - Legitimate uses of pride such as "national pride in Singapore's milestones" or "craftsman pride (Monozukuri)" in engineering excellence are acceptable.
2. HOFSTEDE ASIAN CULTURAL CALIBRATION:
   - Power Distance (PDI: 74): Respectful, consultative, honoring leadership custodianship.
   - Collectivism (IDV: 20): Highlight team solidarity, collective harmony (Wa), and Singapore's workplace community.
   - Long-Term Orientation (LTO: 72): Emphasize Kaizen, multi-year reliability, and sustainable value.
   - Monozukuri: Celebrate quiet engineering precision, mission-critical dependability, and zero-defect excellence over empty marketing hype.
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
      parts.push({ 
        text: `Execute the full 8-step strategic deconstruction on this LinkedIn post screenshot. Evolve the competitor's approach into a superior Content Framework for Brother Singapore. Remember: DO NOT CLONE or rehash the source post copy for Brother; craft an authentic, elevated post demonstrating the framework applied to Brother Singapore.`
      });
    } else {
      parts.push({
        text: `Execute the full 8-step strategic deconstruction on this post:\n\n${postContent}\n\nEvolve it into a superior Content Framework for Brother Singapore. Remember: DO NOT CLONE or rehash the source post copy for Brother; craft an authentic, elevated post demonstrating the framework applied to Brother Singapore.`
      });
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Memorable framework name, e.g. "The Possibility Launch Framework"' },
            category: { type: 'STRING', description: 'Content category, e.g. "Product & Commercial Innovation"' },
            formula: { type: 'STRING', description: 'Acronym formula, e.g. "H-C-V-P-P-A"' },
            tone: { type: 'STRING', description: 'Tonal analysis, e.g. "Optimistic + Approachable + Product-Confident"' },
            description: { type: 'STRING', description: 'Executive summary of how this framework works' },
            philosophy: { type: 'STRING', description: 'The implicit communication philosophy (e.g. Sell possibility before specification)' },
            whyItDiffers: { type: 'STRING', description: 'Why this framework differs from conventional specification dumps' },
            whenToUse: { type: 'STRING', description: 'Clear scenarios and triggers for when to deploy this framework' },
            structureSteps: {
              type: 'ARRAY',
              description: 'The narrative sequence of the evolved framework',
              items: {
                type: 'OBJECT',
                properties: {
                  step: { type: 'STRING', description: 'e.g. HOOK, CONTEXT, VALUE, PROOF, POSSIBILITY, ACTION' },
                  label: { type: 'STRING', description: 'Human-readable step name' },
                  purpose: { type: 'STRING', description: 'Why this step exists' },
                  prompt: { type: 'STRING', description: 'Actionable guidance for the copywriter' }
                },
                required: ['step', 'label', 'purpose', 'prompt']
              }
            },
            sourceDeconstruction: {
              type: 'OBJECT',
              description: 'Detailed analysis of the benchmark post',
              properties: {
                whatItDoes: { type: 'STRING', description: 'What the benchmark post is doing simultaneously' },
                whatItAvoids: { type: 'STRING', description: 'What the benchmark post intentionally avoids (specs, jargon)' },
                tonalTraits: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Granular tonal characteristics' },
                visualAlignment: { type: 'STRING', description: 'How the image reinforces the central proposition' }
              }
            },
            critique: {
              type: 'OBJECT',
              properties: {
                strengths: { type: 'ARRAY', items: { type: 'STRING' } },
                weaknesses: { type: 'ARRAY', items: { type: 'STRING' } }
              },
              required: ['strengths', 'weaknesses']
            },
            rules: { 
              type: 'ARRAY', 
              items: { type: 'STRING' },
              description: 'Algorithmic and formatting guidelines'
            },
            examplePost: { 
              type: 'STRING', 
              description: 'Completely original, differentiated Brother Singapore post applying the framework. NOT a rehash or clone of the benchmark!' 
            },
            placeholderTemplate: { 
              type: 'STRING',
              description: 'Reusable prompt template with bracketed placeholders'
            }
          },
          required: ['name', 'category', 'formula', 'tone', 'description', 'philosophy', 'whyItDiffers', 'whenToUse', 'structureSteps', 'critique', 'rules', 'examplePost', 'placeholderTemplate']
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
        sourceDeconstruction: parsed.sourceDeconstruction || null,
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
