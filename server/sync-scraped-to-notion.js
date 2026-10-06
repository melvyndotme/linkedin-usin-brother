import fs from 'fs';
import path from 'path';

/**
 * Sync scraped Brother images directly into Notion Database
 */

// Load .env if present
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      const key = k.trim();
      let val = v.join('=').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const TARGET_DB_ID = '3f101136-de48-81d6-9ba7-ca159483a544';

if (!NOTION_API_KEY) {
  console.error('\n❌ ERROR: NOTION_API_KEY is not set.');
  process.exit(1);
}

const NOTION_HEADERS = {
  'Authorization': `Bearer ${NOTION_API_KEY.trim()}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28'
};

const cleanId = (id) => id.replace(/-/g, '');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function syncAll() {
  const dataPath = path.join(process.cwd(), 'data/brother_scraped_images.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Scraped data not found at ${dataPath}. Please run scraper first.`);
  }

  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const records = rawData.records || [];
  console.log(`\n🚀 Starting Notion Sync for ${records.length} Brother Digital Assets...`);
  console.log(`Target Database: https://app.notion.com/p/${cleanId(TARGET_DB_ID)}`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < records.length; i++) {
    const item = records[i];
    const progress = `[${i + 1}/${records.length}]`;
    const cleanName = (item.name || item.filename || 'Brother Digital Asset').slice(0, 100);

    try {
      const pageRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: NOTION_HEADERS,
        body: JSON.stringify({
          parent: { database_id: cleanId(TARGET_DB_ID) },
          cover: {
            type: 'external',
            external: { url: item.imageUrl }
          },
          properties: {
            'Asset Name': {
              title: [{ text: { content: cleanName } }]
            },
            'Country': {
              select: { name: item.country }
            },
            'Source Site': {
              select: { name: item.sourceSite }
            },
            'Category': {
              select: { name: item.category }
            },
            'Image URL': {
              url: item.imageUrl
            },
            'Preview': {
              files: [
                {
                  name: (item.filename || 'asset').slice(0, 80),
                  type: 'external',
                  external: { url: item.imageUrl }
                }
              ]
            }
          },
          children: [
            {
              object: 'block',
              type: 'image',
              image: {
                type: 'external',
                external: { url: item.imageUrl }
              }
            }
          ]
        })
      });

      if (pageRes.ok) {
        successCount++;
        if ((i + 1) % 25 === 0 || i === records.length - 1) {
          console.log(`${progress} Synced ${successCount} assets (${item.country} - ${cleanName.slice(0, 30)})`);
        }
      } else {
        const err = await pageRes.json();
        console.warn(`${progress} ⚠️ Notion rejected ${item.id} (${item.imageUrl}):`, err.message || err);
        failCount++;
      }
    } catch (e) {
      console.warn(`${progress} ⚠️ Network error on ${item.id}:`, e.message);
      failCount++;
    }

    // Rate-limit safety: 340ms delay between calls to respect Notion 3 requests/second
    await sleep(340);
  }

  console.log(`\n🎉 NOTION SYNC FINISHED!`);
  console.log(`✅ Successfully uploaded: ${successCount} assets`);
  if (failCount > 0) {
    console.log(`⚠️ Failed: ${failCount} assets`);
  }
  console.log(`🔗 View your database: https://app.notion.com/p/${cleanId(TARGET_DB_ID)}\n`);
}

syncAll().catch(err => {
  console.error('Fatal sync error:', err.message);
  process.exit(1);
});
