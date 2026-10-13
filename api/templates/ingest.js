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
You are an elite B2B brand strategist, executive editorial consultant, and master creative director for Brother Singapore (calibrated to the "At your side" brand promise and Japanese Monozukuri / Kaizen craft).

Your task is to perform an uncompromising, deep-level DECONSTRUCTION of a competitor or benchmark LinkedIn post (or screenshot / campaign creative) and evolve it into a completely elevated, reusable CONTENT FRAMEWORK.

CRITICAL INSTRUCTION ON THE BROTHER SINGAPORE POST (PREVENT CLONING / REHASHING):
DO NOT merely re-skin or rehash the benchmark post! (e.g. if the source post says "Our printer family just got a little bigger! Meet the new Epson SureColor... makes it easier for creators...", DO NOT write "Our Brother family just grew a little larger! Meet the new Brother GTXpro... makes it easier for creators..."). That is a lazy clone and unacceptable!
Instead, the Brother Singapore post MUST apply the EVOLVED FRAMEWORK and address the CRITIQUE WEAKNESSES:
1. Lead with an authentic Singapore customer friction or business ambition before naming any machine.
2. Ground the post in Brother's distinct Singapore context (e.g. corporate efficiency, label/logistics automation, eco-smart ink tank technology, reliable B2B customer support, or quiet craft).
3. Connect organically back to Brother's "At your side" customer promise.
4. Conclude with a real, engaging community conversation question or clear consultative CTA.

METHODOLOGY — EXECUTE ALL 8 SYSTEMATIC DECONSTRUCTION STEPS:

STEP 1 — DECONSTRUCT THE BENCHMARK POST:
- Break down exactly what the post is doing simultaneously (e.g. announcing news vs reframing around user capability).
- Quote and dissect the visible copy line by line.
- Map out the source post's component structure: Component, Execution, and Purpose.
- Crucially note what the brand DOES NOT DO (e.g. "Notice what it doesn't do: it doesn't lead with print resolution, dimensions, ink specs, price, or a 10-bullet spec dump").

STEP 2 — ANALYZE THE TONE:
- Define the primary tone and subtitle (e.g. "optimistic + approachable + product-confident").
- Identify 3 to 4 granular tonal characteristics (e.g. Friendly, Enthusiastic without hyperbolic fluff, Customer-oriented, Aspirational).
- Show contrasts (e.g. how it avoids sounding like a stiff corporate press release).

STEP 3 — ANALYZE VISUAL & CREATIVE ALIGNMENT:
- How does the image / visual creative reinforce the copy?
- Note whether the visual communicates one singular clear proposition rather than clutter.
- How the product is situated inside the customer's world rather than on an isolated sterile background.

STEP 4 — INFER THE COMMUNICATION PHILOSOPHY:
- Extract the implicit formula (e.g. "Product → Capability → Human Outcome → Possibility" vs "Product → Feature → Feature → Spec").
- Uncover the core belief (e.g. "Sell the possibility, then introduce the product. Show, don't explain excessively. Earn attention first.").

STEP 5 — CRITIQUE THE POST (HONEST STRENGTHS & WEAKNESSES):
- What is working well (e.g. low cognitive load, curiosity opening, clean visual alignment).
- Opportunities for improvement / Critical weaknesses:
  1. Is the hook too generic or cliché?
  2. Is the customer friction / problem left implicit instead of explicit?
  3. Is the benefit too broad or vague?
  4. Is there a weak or missing Call to Action (CTA)?
  5. Does it foster two-way LinkedIn conversation or just passive broadcasting?

STEP 6 — EVOLVE THOSE RECOMMENDATIONS INTO AN ELEVATED CONTENT FRAMEWORK:
- Transform the weaknesses into a superior narrative architecture (e.g. H-C-V-P-P-A: Hook → Context → Value → Proof → Possibility → Action, or an equivalent high-converting formula).
- Detail each step's name, purpose, and actionable writing prompt.

STEP 7 — CREATE THE LINKEDIN STYLE GUIDE & WRITING RULES:
- Core narrative architecture breakdown.
- Specific algorithmic and editorial guardrails (e.g. first 2 lines before 'see more', 80-140 words, line breaks, 3-5 targeted hashtags).

STEP 8 — APPLIED BROTHER SINGAPORE POST DEMONSTRATION:
- Write an exemplary, original LinkedIn post for Brother Singapore that strictly applies the evolved framework and solves every weakness identified in the critique.
- Must feel authentic to Brother Singapore (Monozukuri precision, dependable business productivity, "At your side" partnership).

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
