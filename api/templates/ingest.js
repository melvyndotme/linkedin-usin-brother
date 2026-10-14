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
You are a master Communication Style Reverse-Engineering Analyst & Social Media Editorial Architect.

Your task is to analyze a user-provided reference social media post (via image screenshot, URL, or text) and extract its underlying communication system so that the approach can be reused for any unrelated brand, industry, or campaign.

CORE DESIGN PRINCIPLE:
Do not preserve the subject matter or product details of the reference.
Preserve the underlying COMMUNICATION LOGIC.
Separate the method from the subject matter!
Whether the reference post is a printer launch, a banking ad, an automotive showcase, or a recruitment message, the output MUST be a PORTABLE COMMUNICATION SYSTEM.

Follow this systematic 8-part reverse-engineering workflow:

1. INGEST THE REFERENCE:
   - Extract the visible copy, message hierarchy, visual composition, call to action (CTA), product/customer framing, and subtle creative cues.
   - Note what the reference post DOES NOT DO (e.g. avoids technical spec dumps, price tags, or corporate jargon).

2. DECONSTRUCT THE STRUCTURE:
   - Identify the sequence of communication components:
     hook, context/problem, audience framing, value proposition, proof/features, aspirational payoff, and action.
   - Explain the functional role of each component (what it is doing, not just what it says).

3. ANALYZE TONE:
   - Assess the post across 6 dialectical dimensions:
     formal vs conversational,
     technical vs accessible,
     product-led vs customer-led,
     transactional vs aspirational,
     restrained vs enthusiastic,
     corporate vs human.
   - Summarize the dominant tone in 3 to 5 transferable traits.

4. ANALYZE CONTENT & VISUAL STYLE:
   - Evaluate text density, sentence length, whitespace, typography, visual hierarchy, lifestyle vs isolated product staging, and caption-to-creative alignment.
   - Verify whether the post communicates one singular central proposition.

5. INFER COMMUNICATION PHILOSOPHY:
   - Convert the observed choices into 3–5 generalized, portable principles.
   - Examples: "Sell the outcome before the feature", "Make the audience the protagonist", "Show rather than over-explain", "Create curiosity before revealing the offer".
   - Express these principles so they apply to ANY brand or industry.

6. CRITIQUE (WHAT WORKS vs WHAT COULD BE STRONGER):
   - Evaluate hook strength, relevance, clarity, specificity, emotional resonance, CTA strength, engagement potential, and visual/copy alignment.

7. CONVERT CRITIQUE INTO REUSABLE RECOMMENDATIONS:
   - Convert every identified weakness into a reusable editorial rule (e.g. Weak generic opening → Open with audience tension or curiosity; Weak/missing CTA → End with one clear next action).

8. SYNTHESIZE INTO A REUSABLE STYLE GUIDE & APPLIED DEMONSTRATION:
   Produce the complete Reference Post Style Guide:
   - 1. Communication Philosophy (3–5 portable principles)
   - 2. Narrative Architecture (e.g. Hook → Context → Value → Action with step prompts)
   - 3. Tone (3–5 traits)
   - 4. Writing Rules (cadence, word count, line breaks)
   - 5. Visual / Creative Rules
   - 6. CTA Rules
   - 7. Things to Avoid
   - 8. Quality Checklist (verification questions)
   - 9. Applied Demonstration Post for Brother Singapore:
     CRITICAL INSTRUCTION ON THE DEMONSTRATION POST:
     DO NOT DO A SHALLOW MAD-LIB REHASH!
     If the reference post says: "Our printer family just got a little bigger! Meet the new [Model]...",
     DO NOT simply swap the words to: "Our business solutions family just got a little bigger! Meet the new Brother MFC-...".
     That is a lazy parody/clone, NOT reverse-engineering.
     In your critique, you flagged that a generic announcement hook ("family just got bigger") is a major weakness!
     Therefore, the Applied Demonstration Post MUST ACTUALLY FIX THAT WEAKNESS:
     - Open with real operational tension, an engaging industry insight, or audience curiosity.
     - Frame the customer or Singapore SME as the protagonist.
     - Ground the copy in authentic B2B workplace realities (e.g. logistics dispatch, clinic paperwork, architectural blueprints, legal auditing).
     - Weave in the Brother "At your side" ethos and Japanese Monozukuri craft naturally, not as a buzzword slapped on the end.
     - Close with one consultative, thoughtful next step or discussion prompt.
     The post must read like a polished, world-class executive LinkedIn post by a seasoned B2B copywriter.

CRITICAL POLICY & CULTURAL GUARDRAILS:
- STRICT BAN ON LGBTQ+ TOPICS: Absolutely NO pride/queer/LGBTQ+ campaigns or terminology.
- HOFSTEDE ASIAN CALIBRATION: Respectful, consultative, collective harmony (Wa), Long-Term Orientation (LTO), and craft precision (Monozukuri).
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
        text: `Reverse-engineer the communication system of this reference post screenshot. Separate the method from the subject matter and synthesize a portable Reference Post Style Guide with an applied Brother Singapore demonstration.`
      });
    } else {
      parts.push({
        text: `Reverse-engineer the communication system of this reference post:\n\n${postContent}\n\nSeparate the method from the subject matter and synthesize a portable Reference Post Style Guide with an applied Brother Singapore demonstration.`
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
            formula: { type: 'STRING', description: 'Narrative sequence, e.g. "Hook → Context → Value → Action"' },
            tone: { type: 'STRING', description: 'Summary of dominant tone, e.g. "Optimistic + Approachable + Product-Confident"' },
            tonalTraits: { 
              type: 'ARRAY', 
              items: { type: 'STRING' },
              description: '3-5 distinct tonal traits' 
            },
            description: { type: 'STRING', description: 'Executive summary of the reverse-engineered communication system' },
            philosophy: { type: 'STRING', description: 'Primary communication philosophy' },
            philosophyPrinciples: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: '3-5 generalized, portable communication principles'
            },
            whyItDiffers: { type: 'STRING', description: 'Why this communication system differs from conventional feature/spec dumping' },
            whenToUse: { type: 'STRING', description: 'Scenarios and triggers for deploying this framework' },
            structureSteps: {
              type: 'ARRAY',
              description: 'Narrative sequence of communication components',
              items: {
                type: 'OBJECT',
                properties: {
                  step: { type: 'STRING', description: 'e.g. HOOK, CONTEXT, VALUE, PROOF, POSSIBILITY, ACTION' },
                  label: { type: 'STRING', description: 'Component name' },
                  purpose: { type: 'STRING', description: 'Function of the component (what it is doing)' },
                  prompt: { type: 'STRING', description: 'Actionable writing prompt for copywriters' }
                },
                required: ['step', 'label', 'purpose', 'prompt']
              }
            },
            sourceDeconstruction: {
              type: 'OBJECT',
              description: 'Deconstruction of the reference post',
              properties: {
                whatItDoes: { type: 'STRING', description: 'What the reference is doing simultaneously' },
                whatItAvoids: { type: 'STRING', description: 'What the reference deliberately avoids' },
                visualAlignment: { type: 'STRING', description: 'How creative and caption reinforce each other' }
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
              description: 'Writing rules (sentence length, whitespace, word count)'
            },
            visualRules: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Visual and creative composition rules'
            },
            ctaRules: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Call to action guidelines'
            },
            thingsToAvoid: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Things to avoid (traps, clichés, spec dumps)'
            },
            qualityChecklist: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Verification questions before finalizing a post'
            },
            examplePost: { 
              type: 'STRING', 
              description: 'A completely original, elevated B2B LinkedIn post for Brother Singapore that executes the reverse-engineered philosophy. It MUST NOT parrot or Mad-Lib swap the reference post sentences (e.g. do not say "Our family just got bigger! Meet the new Brother..."). It must address the critique, lead with audience tension or friction, and exemplify Brother "At your side" reliability.' 
            },
            placeholderTemplate: { 
              type: 'STRING',
              description: 'Prompt template with bracketed placeholders'
            }
          },
          required: [
            'name', 'category', 'formula', 'tone', 'description', 'philosophy', 
            'whyItDiffers', 'whenToUse', 'structureSteps', 'critique', 'rules', 
            'examplePost', 'placeholderTemplate'
          ]
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
