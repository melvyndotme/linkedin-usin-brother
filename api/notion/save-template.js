// Vercel Serverless Function: Save or Seed Templates into Notion "LinkedUsIn: Template Library" Database

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = req.query?.apiKey || req.body?.apiKey || process.env.NOTION_API_KEY;
  let pageId = req.query?.pageId || req.body?.pageId || process.env.NOTION_PAGE_ID || '3c701136-de48-8101-b258-000b3c706126';
  const template = req.body?.template; // Single template object to save
  const templates = req.body?.templates; // Array of templates to seed in bulk
  const isListRequest = req.method === 'GET' || req.body?.action === 'list' || req.query?.action === 'list';
  const cleanupOnly = Boolean(req.body?.cleanupOnly || req.body?.deduplicate || req.query?.cleanup);

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Missing Notion Secret Token. Please configure NOTION_API_KEY in Vercel or Settings.'
    });
  }

  const itemsToSave = templates && Array.isArray(templates) ? templates : (template ? [template] : []);

  if (!isListRequest && !cleanupOnly && itemsToSave.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No template provided to save.'
    });
  }

  // Format pageId
  pageId = pageId.trim();
  if (pageId.includes('notion.so') || pageId.includes('notion.site') || pageId.includes('notion.com')) {
    const parts = pageId.split('-');
    pageId = parts[parts.length - 1].split('?')[0];
  }
  pageId = pageId.replace(/-/g, '');

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  try {
    // 1. Locate or Auto-Discover the "LinkedUsIn: Template Library" Database
    let templateDbId = null;
    let dbProps = {};

    // Search via Notion Search API
    const searchRes = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: { value: 'database', property: 'object' },
        page_size: 50
      })
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const databases = searchData.results || [];
      const foundDb = databases.find(d => {
        const title = (d.title || []).map(t => t.plain_text).join('').toLowerCase();
        return title.includes('template library') || title.includes('template');
      });
      if (foundDb) {
        templateDbId = foundDb.id;
        dbProps = foundDb.properties || {};
      }
    }

    // If not found, provision the Database under parent pageId
    if (!templateDbId) {
      const createDbRes = await fetch('https://api.notion.com/v1/databases', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { type: 'page_id', page_id: pageId },
          title: [{ type: 'text', text: { content: 'LinkedUsIn: Template Library' } }],
          icon: { type: 'emoji', emoji: '📚' },
          properties: {
            'Template Name': { title: {} },
            'Category': {
              select: {
                options: [
                  { name: 'Employer Branding & Culture', color: 'blue' },
                  { name: 'Talent Acquisition & Internships', color: 'purple' },
                  { name: 'Innovation & Kaizen', color: 'green' },
                  { name: 'Sustainability & ESG', color: 'emerald' },
                  { name: 'Leadership & Vision', color: 'orange' },
                  { name: 'Customer Partnership', color: 'pink' }
                ]
              }
            },
            'Tone': { rich_text: {} },
            'Source': { rich_text: {} },
            'Description': { rich_text: {} }
          }
        })
      });

      if (createDbRes.ok) {
        const createdDb = await createDbRes.json();
        templateDbId = createdDb.id;
        dbProps = createdDb.properties || {};
      } else {
        const errData = await createDbRes.json();
        throw new Error(`Failed to create Template Library database in Notion: ${errData.message || createDbRes.statusText}`);
      }
    } else if (Object.keys(dbProps).length === 0) {
      // If we found a templateDbId but don't have its properties yet, fetch them
      try {
        const dbMetaRes = await fetch(`https://api.notion.com/v1/databases/${templateDbId}`, {
          method: 'GET',
          headers
        });
        if (dbMetaRes.ok) {
          const dbMeta = await dbMetaRes.json();
          dbProps = dbMeta.properties || {};
        }
      } catch (e) {
        console.warn('Could not fetch template db metadata:', e.message);
      }
    }

    // 2. Ensure database schema has all required properties (PATCH database schema if missing)
    try {
      const missingProps = {};
      const lowerPropKeys = Object.keys(dbProps).map(k => k.toLowerCase());

      if (!lowerPropKeys.includes('category')) {
        missingProps['Category'] = {
          select: {
            options: [
              { name: 'Employer Branding & Culture', color: 'blue' },
              { name: 'Talent Acquisition & Internships', color: 'purple' },
              { name: 'Innovation & Kaizen', color: 'green' },
              { name: 'Sustainability & ESG', color: 'emerald' },
              { name: 'Leadership & Vision', color: 'orange' },
              { name: 'Customer Partnership', color: 'pink' }
            ]
          }
        };
      }
      if (!lowerPropKeys.includes('tone')) {
        missingProps['Tone'] = { rich_text: {} };
      }
      if (!lowerPropKeys.includes('source')) {
        missingProps['Source'] = { rich_text: {} };
      }
      if (!lowerPropKeys.includes('description')) {
        missingProps['Description'] = { rich_text: {} };
      }

      if (Object.keys(missingProps).length > 0) {
        const patchRes = await fetch(`https://api.notion.com/v1/databases/${templateDbId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ properties: missingProps })
        });
        if (patchRes.ok) {
          const updatedMeta = await patchRes.json();
          dbProps = updatedMeta.properties || dbProps;
        }
      }
    } catch (e) {
      console.warn('Could not auto-add properties to database schema:', e.message);
    }

    // Identify actual property keys in the database schema
    const titleEntry = Object.entries(dbProps).find(([_, val]) => val?.type === 'title');
    const titleKey = titleEntry ? titleEntry[0] : 'Template Name';

    const findPropKey = (desiredName) => {
      const lower = desiredName.toLowerCase();
      return Object.keys(dbProps).find(k => k.toLowerCase() === lower);
    };

    const catKey = findPropKey('Category');
    const toneKey = findPropKey('Tone');
    const sourceKey = findPropKey('Source');
    const descKey = findPropKey('Description');

    // 3. Query existing template pages to detect and clean up duplicates
    let existingPages = [];
    try {
      const queryDbRes = await fetch(`https://api.notion.com/v1/databases/${templateDbId}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ page_size: 100 })
      });
      if (queryDbRes.ok) {
        const queryData = await queryDbRes.json();
        existingPages = queryData.results || [];
      }
    } catch (e) {
      console.warn('Could not query existing template pages:', e.message);
    }

    const getPageTitle = (p) => {
      const prop = p.properties?.[titleKey] || Object.values(p.properties || {}).find(pr => pr.type === 'title');
      return prop?.title?.map(t => t.plain_text).join('').trim() || '';
    };

    // Group existing pages by title and archive existing duplicates
    const pagesByName = new Map();
    const duplicatesToArchive = [];

    for (const page of existingPages) {
      const pageTitle = getPageTitle(page).toLowerCase();
      if (!pageTitle) continue;

      if (!pagesByName.has(pageTitle)) {
        pagesByName.set(pageTitle, [page]);
      } else {
        pagesByName.get(pageTitle).push(page);
      }
    }

    for (const [title, pages] of pagesByName.entries()) {
      if (pages.length > 1) {
        // Keep the latest edited page, archive older duplicates
        pages.sort((a, b) => new Date(b.last_edited_time) - new Date(a.last_edited_time));
        const [keep, ...dups] = pages;
        duplicatesToArchive.push(...dups.map(p => p.id));
        pagesByName.set(title, [keep]);
      }
    }

    // Archive duplicates in Notion
    if (duplicatesToArchive.length > 0) {
      await Promise.allSettled(
        duplicatesToArchive.map(dupId =>
          fetch(`https://api.notion.com/v1/pages/${dupId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ archived: true })
          })
        )
      );
    }

    if (cleanupOnly) {
      return res.status(200).json({
        success: true,
        archivedCount: duplicatesToArchive.length,
        message: `Successfully cleaned up and archived ${duplicatesToArchive.length} duplicate templates.`,
        databaseId: templateDbId,
        notionUrl: `https://notion.so/${templateDbId.replace(/-/g, '')}`
      });
    }

    if (isListRequest) {
      const benchmarkNames = [
        'workplace flexibility & family wellbeing',
        'early career mentorship & real ownership',
        'from the talent desk (candidate guidance & mutual fit)',
        'career longevity & multigenerational stewardship',
        'multicultural harmony & community stewardship (csr)',
        'precision craftsmanship & frontline dedication (monozukuri)'
      ];

      const templatesList = await Promise.all(existingPages.map(async page => {
        const name = getPageTitle(page);
        const catProp = page.properties?.[catKey] || Object.values(page.properties || {}).find(pr => pr.type === 'select');
        const sourceProp = page.properties?.[sourceKey] || Object.values(page.properties || {}).find(pr => pr.type === 'rich_text');
        const descProp = page.properties?.[descKey];
        const toneProp = page.properties?.[toneKey];

        const isBenchmark = benchmarkNames.includes(name.trim().toLowerCase());
        let placeholderTemplate = '';

        // For custom ingested templates, fetch blueprint from Notion page code blocks
        if (!isBenchmark) {
          try {
            const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=30`, { headers });
            if (blocksRes.ok) {
              const blocksData = await blocksRes.json();
              const codeBlocks = (blocksData.results || []).filter(b => b.type === 'code');
              if (codeBlocks.length > 0) {
                placeholderTemplate = codeBlocks.map(b => b.code?.rich_text?.map(t => t.plain_text).join('')).join('\n');
              }
            }
          } catch (bErr) {
            console.warn('Could not fetch blocks for Notion page:', page.id, bErr.message);
          }
        }

        const rawDesc = descProp?.rich_text?.map(t => t.plain_text).join('') || '';
        const cleanDesc = rawDesc.replace(/\s*\(Awaiting GEMINI_API_KEY for live autonomous inference\)\.?/gi, ' aligned with Brother Singapore brand guidelines.');

        return {
          id: page.id,
          name,
          category: catProp?.select?.name || 'Extracted Benchmark',
          source: sourceProp?.rich_text?.map(t => t.plain_text).join('') || '',
          description: cleanDesc || 'Instructional template blueprint deconstructed for Brother Singapore.',
          tone: toneProp?.rich_text?.map(t => t.plain_text).join('') || 'Professional, consultative, team-oriented',
          placeholderTemplate: placeholderTemplate,
          url: page.url,
          lastEdited: page.last_edited_time,
          isCustom: !isBenchmark
        };
      }));

      const validList = templatesList.filter(t => Boolean(t.name));

      return res.status(200).json({
        success: true,
        databaseId: templateDbId,
        notionUrl: `https://notion.so/${templateDbId.replace(/-/g, '')}`,
        templates: validList,
        total: validList.length
      });
    }

    // 4. Insert or Update each template in the database (Upsert)
    const results = [];
    for (const item of itemsToSave) {
      const name = item.name || 'Custom Ingested Template';
      const normName = name.trim().toLowerCase();
      const category = item.category || 'Employer Branding & Culture';
      const tone = item.tone || 'Grounded, Professional';
      const source = item.source || 'AI Ingestion Engine';
      const description = item.description || '';
      const blueprint = item.placeholderTemplate || '';

      const pageProperties = {
        [titleKey]: {
          title: [{ text: { content: name } }]
        }
      };

      if (catKey) {
        pageProperties[catKey] = {
          select: { name: category.substring(0, 95) }
        };
      }
      if (toneKey) {
        pageProperties[toneKey] = {
          rich_text: [{ text: { content: tone.substring(0, 1000) } }]
        };
      }
      if (sourceKey) {
        pageProperties[sourceKey] = {
          rich_text: [{ text: { content: source.substring(0, 1000) } }]
        };
      }
      if (descKey) {
        pageProperties[descKey] = {
          rich_text: [{ text: { content: description.substring(0, 1000) } }]
        };
      }

      const existingMatch = pagesByName.get(normName)?.[0];

      if (existingMatch) {
        // Template already exists in Notion: Update existing row properties
        const updateRes = await fetch(`https://api.notion.com/v1/pages/${existingMatch.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ properties: pageProperties })
        });

        if (updateRes.ok) {
          const updatedPage = await updateRes.json();
          results.push({ success: true, id: updatedPage.id, url: updatedPage.url, name, action: 'updated' });
        } else {
          const errJson = await updateRes.json();
          results.push({ success: false, name, error: errJson.message || updateRes.statusText });
        }
      } else {
        // Template does not exist: Create new page with blueprint blocks
        const chunks = [];
        let remaining = blueprint;
        while (remaining.length > 0) {
          chunks.push(remaining.substring(0, 1900));
          remaining = remaining.substring(1900);
        }

        const childrenBlocks = [
          {
            object: 'block',
            type: 'heading_3',
            heading_3: {
              rich_text: [{ type: 'text', text: { content: '📋 Post Template Blueprint' } }]
            }
          },
          ...chunks.map(chunk => ({
            object: 'block',
            type: 'code',
            code: {
              rich_text: [{ type: 'text', text: { content: chunk } }],
              language: 'markdown'
            }
          }))
        ];

        const pagePayload = {
          parent: { database_id: templateDbId },
          icon: { type: 'emoji', emoji: '📄' },
          properties: pageProperties,
          children: childrenBlocks
        };

        const saveRes = await fetch('https://api.notion.com/v1/pages', {
          method: 'POST',
          headers,
          body: JSON.stringify(pagePayload)
        });

        if (saveRes.ok) {
          const savedPage = await saveRes.json();
          results.push({ success: true, id: savedPage.id, url: savedPage.url, name, action: 'created' });
          pagesByName.set(normName, [savedPage]);
        } else {
          const errJson = await saveRes.json();
          results.push({ success: false, name, error: errJson.message || saveRes.statusText });
        }
      }
    }

    const successfulCount = results.filter(r => r.success).length;
    const firstError = results.find(r => !r.success)?.error;
    const lastSavedUrl = results.find(r => r.success)?.url || `https://notion.so/${templateDbId.replace(/-/g, '')}`;

    return res.status(200).json({
      success: successfulCount > 0,
      savedCount: successfulCount,
      total: itemsToSave.length,
      archivedDuplicates: duplicatesToArchive.length,
      databaseId: templateDbId,
      notionUrl: lastSavedUrl,
      error: successfulCount === 0 ? (firstError || 'Failed to save templates to Notion') : undefined,
      results
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while saving to Notion'
    });
  }
}
