import { scrapeLinkedInAdLibrary } from './scraper.js';

async function test() {
  console.log('Testing live Playwright scraper for Epson Singapore...');
  try {
    const result = await scrapeLinkedInAdLibrary('Epson Singapore', ['SG']);
    console.log('Scraper Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
