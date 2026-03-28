import { chromium } from 'playwright';
import { exec } from 'child_process';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error(`[PAGE ERROR] ${error.message}`);
  });
  
  const child = exec('node ./src/node/serve.js');
  
  // wait for server
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    console.log('Navigating...');
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(3000);
    const html = await page.content();
    console.log('BODY:', html);
  } catch (e) {
    console.error('Test run failed', e);
  } finally {
    child.kill();
    await browser.close();
    process.exit(0);
  }
})();
