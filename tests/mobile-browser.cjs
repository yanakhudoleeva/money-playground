// Optional browser smoke test. This is not an iOS/WKWebView simulator test.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, '.build-ios/browser-check');
fs.mkdirSync(artifacts, { recursive: true });
(async () => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let file;
    if (url.pathname === '/web/') file = path.join(root, 'piggy-onboarding.html');
    else if (url.pathname.startsWith('/web/')) file = path.join(root, 'dist', url.pathname.slice(5));
    else file = path.join(root, '.capacitor-web', url.pathname.replace(/^\/mobile\//, '') || 'index.html');
    if (url.pathname === '/mobile/') file = path.join(root, '.capacitor-web/index.html');
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const data = fs.readFileSync(file);
      const mime = { '.html': 'text/html', '.css': 'text/css', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.wav': 'audio/wav' };
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  let browser;
  const results = [];
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const [width, height] of [[375, 667], [390, 844], [430, 932]]) {
      const samples = [];
      for (const variant of ['web', 'mobile']) {
        const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const errors = [], external = [];
        page.on('pageerror', e => errors.push(e.message));
        await context.route('**/*', route => {
          const url = route.request().url();
          if (url.startsWith(origin)) return route.continue();
          // Use the same bundled fonts for deterministic baseline comparison.
          if (variant === 'web' && url.startsWith('https://fonts.googleapis.com/')) {
            const css = fs.readFileSync(path.join(root, 'mobile/fonts/fonts.css'), 'utf8').replaceAll('url(./', `url(${origin}/mobile/fonts/`);
            return route.fulfill({ contentType: 'text/css', body: css });
          }
          external.push(url); return route.abort();
        });
        await page.goto(`${origin}/${variant}/`);
        await page.evaluate(() => document.fonts.ready);
        async function checkFullscreen(selector) {
          if (variant !== 'mobile') return;
          const bounds = await page.locator(selector).boundingBox();
          assert.ok(bounds, `${selector} must be visible`);
          assert.equal(bounds.x, 0);
          assert.equal(bounds.y, 0);
          assert.equal(bounds.width, width);
          assert.equal(bounds.height, height);
          assert.equal(await page.locator(selector).evaluate(el => getComputedStyle(el).borderRadius), '0px');
          assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(23, 23, 23)');
        }
        await checkFullscreen('#piggy-onboarding .on-phone');
        if (variant === 'mobile') {
          const smallFields = await page.locator('.on-phone input:not([type="hidden"])').evaluateAll(inputs => inputs.filter(input => parseFloat(getComputedStyle(input).fontSize) < 16).map(input => input.outerHTML));
          assert.deepEqual(smallFields, [], 'Onboarding inputs must not trigger iOS focus zoom');
        }

        await page.screenshot({ path: path.join(artifacts, `${variant}-${width}-onboarding.png`) });
        for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
        assert.equal(await page.locator('.sp-nav [aria-current="page"]').getAttribute('data-tab'), 'bank', 'Skipping onboarding lands on the created Piggy Bank');
        await page.locator('.pb-pig-motion').waitFor();
        const pigFilters = await page.locator('[data-pig-art]').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).filter));
        assert.ok(pigFilters.length >= 4 && pigFilters.every(filter => filter === 'none'), 'Every mascot retains its original artwork colors');
        await page.screenshot({ path: path.join(artifacts, `${variant}-${width}-soft-pig-bank.png`) });
        await page.locator('.sp-nav [data-tab="spending"]').click();
        await page.getByRole('button', { name: 'Open expense history', exact: true }).waitFor();
        // Touch navigation must coexist with vertical scrolling and tab taps.
        await page.evaluate(() => {
          const nav=document.querySelector('.sp-nav'), result=nav.parentElement;
          const active=()=>nav.querySelector('[aria-current="page"]').dataset.tab;
          const tabs=Array.from(nav.querySelectorAll('[data-tab]'));
          function gesture(target,x,y,dx,dy){
            const point=(a,b)=>new Touch({identifier:1,target,clientX:a,clientY:b});
            target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[point(x,y)]}));
            target.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[point(x+dx,y+dy)]}));
            target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[]}));
          }
          const spending=result.querySelector('.sp-page');
          gesture(spending,240,200,0,100);
          if(active()!=='spending')throw Error('Vertical scroll changed tab');
          gesture(spending,240,200,-100,0);
          if(active()!==tabs[1].dataset.tab)throw Error('Screen swipe did not select next tab');
          const first=tabs[0].getBoundingClientRect(),last=tabs.at(-1).getBoundingClientRect();
          gesture(tabs[0],first.x+22,first.y+22,last.x-first.x,0);
          if(active()!==tabs.at(-1).dataset.tab)throw Error('Menu scrub did not select last tab');
        });
        await page.waitForTimeout(450);
        await page.locator('.sp-nav [data-tab="spending"]').click();

        await checkFullscreen('#piggy-onboarding .on-result');
        await page.getByRole('button', { name: '1', exact: true }).click();
        await page.getByRole('button', { name: '2', exact: true }).click();
        await page.getByRole('button', { name: 'Groceries', exact: true }).click();
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('money-playground-spending-v2')));
        assert.equal(state.expenses.length, 1);
        assert.equal(state.expenses[0].amount, 1200);
        assert.equal(state.expenses[0].category, 'groceries');
        await page.reload();
        await page.getByRole('button', { name: 'Open expense history', exact: true }).waitFor();
        const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('money-playground-spending-v2')));
        assert.deepEqual(restored.expenses, state.expenses);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, `${variant} horizontal overflow at ${width}`);
        const text = await page.locator('body').innerText();
        await page.screenshot({ path: path.join(artifacts, `${variant}-${width}-spending.png`) });
        await page.getByRole('button', { name: 'Open expense history', exact: true }).click();
        const history = await page.locator('body').innerText();
        assert.ok(history.includes('Groceries'));
        await page.screenshot({ path: path.join(artifacts, `${variant}-${width}-history.png`) });
        assert.deepEqual(errors, []);
        assert.deepEqual(external, [], 'All launch resources must be available locally');
        samples.push({ text, history });
        // Complete the Create action in a fresh session as well as the skip path.
        const fresh = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
        const creation = await fresh.newPage();
        await creation.goto(`${origin}/mobile/`);
        await creation.locator('#mp-launch').waitFor({ state: 'detached' });
        for (let i = 0; i < 2; i++) await creation.getByRole('button', { name: 'Skip for now', exact: true }).click();
        await creation.locator('.on-income > .on-expenses-toggle').click();
        await creation.locator('[data-income]').fill('3000');
        await creation.locator('[data-next="3"]').click();
        assert.equal(await creation.locator('.sp-nav [aria-current="page"]').getAttribute('data-tab'), 'bank', 'Create opens Piggy Bank');
        assert.equal(await creation.locator('#pb-income').inputValue(), '3000', 'Onboarding income is preserved');
        await fresh.close();
        await context.close();
      }
      assert.deepEqual(samples[1], samples[0], `Web and packaged screen content differ at ${width}`);
      results.push({ width, height, result: 'PASS', checks: ['onboarding', 'add 12 EUR expense', 'reload persistence', 'history', 'no horizontal overflow', 'no JS errors', 'no external requests', 'web/mobile visible text parity'] });
    }
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
