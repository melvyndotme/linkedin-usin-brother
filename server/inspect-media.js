import { chromium } from 'playwright';

async function inspectMedia() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  await page.goto('https://www.linkedin.com/ad-library/search?accountOwner=Epson%20Singapore&countries=SG', {
    waitUntil: 'networkidle',
    timeout: 25000
  });

  await page.waitForTimeout(4000);

  const mediaElements = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('li, div, article')).filter(el => {
      const hasViewDetails = Array.from(el.querySelectorAll('a, button, span')).some(
        node => node.textContent && node.textContent.trim().toLowerCase() === 'view details'
      );
      return hasViewDetails && el.querySelectorAll('a, button').length <= 6 && el.innerText.length < 1500;
    });

    return cards.map((c, i) => {
      const imgs = Array.from(c.querySelectorAll('img')).map(img => ({
        src: img.src,
        srcset: img.srcset,
        className: img.className,
        alt: img.alt
      }));

      const videos = Array.from(c.querySelectorAll('video')).map(v => ({
        src: v.src,
        poster: v.poster,
        className: v.className
      }));

      const bgDivs = Array.from(c.querySelectorAll('[style*="background"]')).map(d => ({
        style: d.getAttribute('style'),
        className: d.className
      }));

      const allElementsWithMedia = Array.from(c.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundImage && style.backgroundImage !== 'none';
      }).map(el => window.getComputedStyle(el).backgroundImage);

      return {
        cardIndex: i,
        headline: c.querySelector('h3, h4, strong')?.innerText || '',
        textSnippet: c.innerText.slice(0, 80),
        imgs,
        videos,
        bgDivs,
        allElementsWithMedia
      };
    });
  });

  console.log('Media Inspection Results:', JSON.stringify(mediaElements, null, 2));
  await browser.close();
}

inspectMedia();
