import { chromium } from 'playwright';

async function inspectImgAttrs() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  await page.goto('https://www.linkedin.com/ad-library/search?accountOwner=Epson%20Singapore&countries=SG', {
    waitUntil: 'networkidle',
    timeout: 25000
  });

  // Scroll down smoothly to trigger lazy loading
  await page.evaluate(async () => {
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, 800);
      await new Promise(r => setTimeout(r, 500));
    }
  });

  await page.waitForTimeout(2000);

  const imagesInfo = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => {
      const attrs = {};
      for (const attr of img.attributes) {
        attrs[attr.name] = attr.value;
      }
      return {
        className: img.className,
        src: img.src,
        currentSrc: img.currentSrc,
        attrs
      };
    });
  });

  console.log('Images Info:', JSON.stringify(imagesInfo.filter(i => i.src || Object.keys(i.attrs).length > 2), null, 2));
  await browser.close();
}

inspectImgAttrs();
