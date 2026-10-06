import fs from 'fs';
import path from 'path';

const sites = [
  { id: 'jp', country: 'Japan', name: 'Brother Japan', url: 'https://www.brother.co.jp/' },
  { id: 'sg', country: 'Singapore', name: 'Brother Singapore', url: 'https://www.brother.com.sg/en' },
  { id: 'my', country: 'Malaysia', name: 'Brother Malaysia', url: 'https://www.brother.com.my/en' },
  { id: 'tw', country: 'Taiwan', name: 'Brother Taiwan', url: 'https://www.brother.tw/zh-tw' },
  { id: 'kr', country: 'South Korea', name: 'Brother Korea', url: 'https://www.brother-korea.com/ko-kr' },
  { id: 'id', country: 'Indonesia', name: 'Brother Indonesia', url: 'https://www.brother.co.id/id-id' },
  { id: 'ph', country: 'Philippines', name: 'Brother Philippines', url: 'https://www.brother.com.ph/en' }
];

function extractImages(html, baseUrl) {
  const images = new Map();

  // 1. img tags
  const imgRegex = /<img\b([^>]*)>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/\b(?:src|data-src|data-original)=["']([^"'>]+)["']/i);
    const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
    if (srcMatch && srcMatch[1]) {
      try {
        const fullUrl = new URL(srcMatch[1], baseUrl).href;
        if (!images.has(fullUrl)) {
          images.set(fullUrl, {
            url: fullUrl,
            alt: altMatch ? altMatch[1].trim() : '',
            type: classifyAsset(fullUrl, altMatch ? altMatch[1] : '')
          });
        }
      } catch (e) {}
    }
  }

  // 2. picture source srcset
  const sourceRegex = /<source\b([^>]*)>/gi;
  while ((match = sourceRegex.exec(html)) !== null) {
    const attrs = match[1];
    const srcsetMatch = attrs.match(/\bsrcset=["']([^"'>]+)["']/i);
    if (srcsetMatch && srcsetMatch[1]) {
      const candidates = srcsetMatch[1].split(',');
      for (const cand of candidates) {
        const clean = cand.trim().split(/\s+/)[0];
        if (clean) {
          try {
            const fullUrl = new URL(clean, baseUrl).href;
            if (!images.has(fullUrl)) {
              images.set(fullUrl, {
                url: fullUrl,
                alt: '',
                type: classifyAsset(fullUrl, '')
              });
            }
          } catch (e) {}
        }
      }
    }
  }

  // 3. CSS background-image
  const bgRegex = /url\(\s*['"]?([^"')]+)['"]?\s*\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw.startsWith('data:') && (raw.match(/\.(png|jpe?g|svg|webp|gif|ashx)/i) || raw.includes('/media/'))) {
      try {
        const fullUrl = new URL(raw, baseUrl).href;
        if (!images.has(fullUrl)) {
          images.set(fullUrl, {
            url: fullUrl,
            alt: '',
            type: classifyAsset(fullUrl, '')
          });
        }
      } catch (e) {}
    }
  }

  return Array.from(images.values());
}

function classifyAsset(url, alt) {
  const lower = (url + ' ' + alt).toLowerCase();
  if (lower.includes('logo')) return 'Logo';
  if (lower.includes('icon') || lower.includes('arrow') || lower.includes('search') || lower.includes('cart') || lower.includes('hamburger') || lower.includes('user.svg')) return 'Icon / UI';
  if (lower.includes('banner') || lower.includes('kv') || lower.includes('hero') || lower.includes('campaign') || lower.includes('slider')) return 'Banner / Campaign';
  if (lower.includes('printer') || lower.includes('scanner') || lower.includes('mfc') || lower.includes('hl-') || lower.includes('dcp') || lower.includes('ads') || lower.includes('t920') || lower.includes('ql') || lower.includes('pj')) return 'Product Image';
  return 'Marketing Asset';
}

function getFileName(urlString) {
  try {
    const u = new URL(urlString);
    const parts = u.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'image';
  } catch (e) {
    return 'image';
  }
}

async function exportAll() {
  const allRecords = [];
  const siteSummaries = [];

  for (const site of sites) {
    try {
      console.log(`Scraping ${site.name}...`);
      const res = await fetch(site.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      const imgs = extractImages(html, res.url);
      
      siteSummaries.push({
        country: site.country,
        site: site.name,
        url: site.url,
        count: imgs.length
      });

      imgs.forEach((img, idx) => {
        const filename = getFileName(img.url);
        const name = img.alt || filename.replace(/[?#].*$/, '').replace(/\.[^/.]+$/, '');
        allRecords.push({
          id: `${site.id}-${idx + 1}`,
          name: name || `Asset ${idx + 1}`,
          country: site.country,
          sourceSite: site.name,
          category: img.type,
          imageUrl: img.url,
          filename: filename
        });
      });
    } catch (e) {
      console.error(`Error scraping ${site.name}:`, e.message);
    }
  }

  // 1. Write CSV for Notion
  const csvHeader = 'Name,Country,Source Site,Category,Image URL,Filename\n';
  const csvRows = allRecords.map(r => {
    const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;
    return [
      escapeCsv(r.name),
      escapeCsv(r.country),
      escapeCsv(r.sourceSite),
      escapeCsv(r.category),
      escapeCsv(r.imageUrl),
      escapeCsv(r.filename)
    ].join(',');
  }).join('\n');

  const outDir = '/Users/melvyndotme/Sites/linkedin-us/data';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const csvPath = path.join(outDir, 'brother_scraped_images.csv');
  const jsonPath = path.join(outDir, 'brother_scraped_images.json');

  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify({ summary: siteSummaries, total: allRecords.length, records: allRecords }, null, 2), 'utf8');

  console.log(`\nSuccessfully exported ${allRecords.length} images!`);
  console.log(`CSV: ${csvPath}`);
  console.log(`JSON: ${jsonPath}`);
}

exportAll();
