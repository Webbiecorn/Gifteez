import { chromium } from 'playwright';

const url = process.argv[2] ?? 'https://gifteez-7533b.web.app/blog';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('pageerror', (error) => {
    console.error('Page error:', error);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text());
    }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.waitForTimeout(2000);
  console.log('Page title:', await page.title());
  const h1 = await page.$eval('h1', (el) => el.textContent);
  console.log('First heading:', h1);

  await browser.close();
})();
