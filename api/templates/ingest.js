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
  // gemini-3.1-flash-lite: high-speed, cost-effective multimodal inference
  // gemini-3.1-pro-preview: deep contextual reasoning and complex document deconstruction
  const targetModel = modelName === 'gemini-3.1-pro-preview' 
    ? 'gemini-3.1-pro-preview' 
    : 'gemini-3.1-flash-lite';

  const systemInstruction = `
You are an expert social media copywriter and cultural linguist for Brother Singapore.
Your task is to analyze a LinkedIn post (provided as text, screenshot, or PDF) and reverse-engineer it into an "Instructional Placeholder Template".

CRITICAL CONTENT POLICY & CULTURAL GUARDRAILS:
1. STRICT BAN ON LGBTQ+ TOPICS:
   - ABSOLUTELY NO PRIDE in relation to LGBTQ+, Pride Month, Spectrum, Pink Dot, or any queer/gender identity campaigns.
   - Do NOT include any LGBTQ+ terminology, hashtags, flags, or concepts under any circumstance.
   - Note: Legitimate uses of pride such as "national unity / national pride in Singapore's milestones" or "dedication and pride in craftsmanship (Monozukuri)" are acceptable when strictly referring to work excellence or national occasions.
2. HOFSTEDE ASIAN CULTURAL CALIBRATION:
   - Power Distance (PDI: 74): Deferential, consultative, honoring leadership custodianship and the Senpai-Kohai mentorship dynamic.
   - Collectivism (IDV: 20): Highlight team solidarity, collective harmony (Wa), family care, and Singapore's multicultural tapestry (Chinese, Malay, Indian, Eurasian).
   - Long-Term Orientation (LTO: 72): Emphasize Kaizen, multi-year skills adaptation (SkillsFuture), and generational stewardship.
   - Monozukuri: Celebrate quiet engineering precision, mission-critical dependability, and zero-defect excellence over boastful marketing swagger.
3. OUTPUT FORMAT:
   - Strip all specific model numbers, personal names, and temporal dates.
   - Produce only clean, bracketed instructional guidance: [Insert Hook: ...], [State Context: ...], [Brother Connection: ...], [Call to Action: ...].
   - Output valid JSON conforming strictly to the requested schema.
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
      parts.push({ text: 'Deconstruct this LinkedIn post screenshot into an instructional template blueprint.' });
    } else {
      parts.push({
        text: `Analyze this post content and extract its instructional template blueprint conforming to the cultural rules:\n\n${postContent}`
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
            tone: { type: 'STRING' },
            description: { type: 'STRING' },
            placeholderTemplate: { type: 'STRING' }
          },
          required: ['name', 'category', 'tone', 'description', 'placeholderTemplate']
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
        id: `tmpl-gemini-${Date.now()}`,
        source: type === 'url' ? `Live Post: ${content}` : type === 'screenshot' ? `Visual Ingestion (${targetModel})` : `PDF Archive (${targetModel})`,
        name: parsed.name,
        category: parsed.category || 'Extracted Benchmark',
        tone: parsed.tone,
        description: parsed.description,
        placeholderTemplate: parsed.placeholderTemplate
      }
    });
  } catch (err) {
    console.error('Gemini extraction error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
