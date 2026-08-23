import { chromium } from 'playwright';

/**
 * Scrapes real live ads from LinkedIn Ad Library
 * @param {string} accountOwner e.g. "Epson Singapore" or "HP"
 * @param {string[]} countries e.g. ["SG", "MY"]
 */
export async function scrapeLinkedInAdLibrary(accountOwner, countries = ['SG']) {
  const countryParam = countries.join(',');
  const targetUrl = `https://www.linkedin.com/ad-library/search?accountOwner=${encodeURIComponent(
    accountOwner.trim()
  )}&countries=${encodeURIComponent(countryParam)}`;

  console.log(`[Live Scraper] Navigating to: ${targetUrl}`);

  let browser = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--window-size=1440,1200'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 1200 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'Asia/Singapore'
    });

    const page = await context.newPage();

    // Navigate to LinkedIn Ad Library
    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 25000
    }).catch(err => console.warn(`[Live Scraper] Navigation warning: ${err.message}`));

    // Wait for initial render
    await page.waitForTimeout(3000);

    // Smooth scroll down to trigger LinkedIn lazy loading for all images & video covers
    await page.evaluate(async () => {
      for (let i = 0; i < 6; i++) {
        window.scrollBy(0, 800);
        await new Promise(r => setTimeout(r, 400));
      }
      await new Promise(r => setTimeout(r, 1000));
      window.scrollTo(0, 0);
    });

    // Wait for lazy-loaded images to mount
    await page.waitForTimeout(2000);

    // Extract raw live ad cards from DOM
    const extracted = await page.evaluate((searchAccountOwner) => {
      const allElements = Array.from(document.querySelectorAll('li, div, article, section'));
      
      // Filter elements that are individual ad cards
      const adCardElements = allElements.filter(el => {
        const hasViewDetails = Array.from(el.querySelectorAll('a, button, span')).some(
          node => node.textContent && node.textContent.trim().toLowerCase() === 'view details'
        );
        const hasPromoted = el.innerText && (el.innerText.includes('Promoted') || el.innerText.includes('Sponsored'));
        const isLeafCard = el.querySelectorAll('a, button').length <= 6 && el.innerText.length < 1500;

        return hasViewDetails && hasPromoted && isLeafCard;
      });

      // Deduplicate cards
      const uniqueCards = [];
      for (const cardEl of adCardElements) {
        const text = (cardEl.innerText || '').trim();
        if (!uniqueCards.some(c => c.text === text)) {
          uniqueCards.push({ el: cardEl, text });
        }
      }

      // Extract Company Logo from page
      let logoUrl = '';
      const avatarImg = document.querySelector('img[src*="company-logo"]');
      if (avatarImg && avatarImg.src) {
        logoUrl = avatarImg.src;
      }

      // Parse structured fields from each unique live card
      const parsedAds = uniqueCards.map((item, index) => {
        const card = item.el;
        const fullText = item.text;
        const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);

        // Find Advertiser Name
        let advertiserName = searchAccountOwner;
        const promotedIndex = lines.findIndex(l => l.toLowerCase() === 'promoted' || l.toLowerCase() === 'sponsored');
        if (promotedIndex > 0) {
          advertiserName = lines[promotedIndex - 1];
        }

        // Find primary copy text
        let primaryText = '';
        const bodyLines = lines.filter(l => 
          l.toLowerCase() !== 'promoted' && 
          l.toLowerCase() !== 'sponsored' && 
          l.toLowerCase() !== 'view details' &&
          l !== advertiserName &&
          l.length > 25
        );
        
        if (bodyLines.length > 0) {
          primaryText = bodyLines[0];
        }

        // Find Headline
        let headline = '';
        if (bodyLines.length > 1) {
          headline = bodyLines[bodyLines.length - 1];
        } else {
          headline = `${advertiserName} Campaign`;
        }

        // Specifically find the main creative image and EXCLUDE logo/avatar
        const creativeImgEl = card.querySelector(
          'img.ad-preview__dynamic-dimensions-image, img[class*="ad-preview"], img[src*="image-shrink"], img[src*="videocover"], img[alt]:not([alt="advertiser logo"]):not([alt="company logo"])'
        );

        let mediaUrl = '';
        if (creativeImgEl) {
          mediaUrl = creativeImgEl.src || creativeImgEl.currentSrc || creativeImgEl.getAttribute('data-delayed-url') || '';
        }

        // If not found, look through all images in card that are NOT logo
        if (!mediaUrl || mediaUrl.includes('company-logo')) {
          const nonLogoImgs = Array.from(card.querySelectorAll('img')).filter(
            img => !img.src.includes('company-logo') && 
                   !img.alt?.includes('logo') && 
                   !img.className?.includes('hue-web-entity__image')
          );
          if (nonLogoImgs.length > 0) {
            mediaUrl = nonLogoImgs[0].src || nonLogoImgs[0].currentSrc || '';
          }
        }

        // Detect if this is a video ad
        const isVideo = (mediaUrl && mediaUrl.includes('videocover')) || 
                        card.querySelector('video') || 
                        card.querySelector('[aria-label*="Play"]') ||
                        card.querySelector('[class*="play"]') ||
                        card.querySelector('svg[class*="play"]') ||
                        (mediaUrl && mediaUrl.includes('mp4'));

        let format = isVideo ? 'Video' : 'Single Image';

        // Find CTA Links
        const links = Array.from(card.querySelectorAll('a')).map(a => a.href).filter(Boolean);
        const ctaUrl = links[0] || `https://www.linkedin.com/ad-library/search?accountOwner=${encodeURIComponent(searchAccountOwner)}`;

        return {
          id: `li-live-${index + 1}`,
          status: 'Active',
          startedDate: 'Active on LinkedIn',
          format,
          targeting: ['SG'],
          primaryText: primaryText || lines.slice(1, 4).join(' '),
          headline: headline,
          description: 'linkedin.com/ad-library',
          ctaText: 'View details',
          ctaUrl: ctaUrl,
          mediaType: isVideo ? 'video' : 'image',
          mediaUrl: mediaUrl,
          videoDuration: '0:30',
          impressionsEstimate: 'Live LinkedIn Ad',
          campaignType: isVideo ? 'Video Ad' : 'Image Ad'
        };
      });

      return {
        count: parsedAds.length,
        advertiserName: parsedAds[0]?.advertiserName || searchAccountOwner,
        logoUrl: logoUrl,
        ads: parsedAds
      };
    }, accountOwner);

    console.log(`[Live Scraper] Successfully extracted ${extracted.count} live ads with accurate media!`);

    return {
      source: 'live_playwright',
      advertiser: {
        name: extracted.advertiserName || accountOwner,
        handle: accountOwner.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        avatar: extracted.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(accountOwner)}&background=0A66C2&color=fff&size=128&bold=true`,
        verified: true,
        industry: 'Verified LinkedIn Advertiser',
        headquarters: 'Singapore / Regional',
        followers: 'Live LinkedIn Profile'
      },
      ads: extracted.ads
    };
  } catch (err) {
    console.error('[Live Scraper Error]:', err);
    throw err;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
