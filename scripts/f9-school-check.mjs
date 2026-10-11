import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const base = process.argv[2] ?? 'http://localhost:3100';
const out = 'C:/Users/adnan/AppData/Local/Temp/claude/briefs';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, args: ['--window-position=-2000,0', '--force-device-scale-factor=1', '--hide-scrollbars'] });
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  for (const width of [1440, 390]) for (const rate of [1, 4]) {
    await page.setViewport({ width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1 });
    const cdp = await page.createCDPSession();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate });
    await page.evaluateOnNewDocument(() => {
      window.__decodeFrames = [];
      new MutationObserver(entries => entries.forEach(entry => {
        if (!entry.target.matches?.('.school-ascii')) return;
        if (entry.target.dataset.settled === 'false') { window.__decodeStarted = performance.now(); window.__decodeUncovered = document.documentElement.dataset.intro === 'done' && !document.documentElement.dataset.transition; }
        else if (window.__decodeStarted) window.__decodeDuration = performance.now() - window.__decodeStarted;
      })).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-settled'] });
      let last;
      const tick = now => {
        const banner = document.querySelector('.school-ascii');
        if (banner?.dataset.settled === 'false') {
          if (last !== undefined) window.__decodeFrames.push(now - last);
          last = now;
        } else last = undefined;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    assert.equal((await page.goto(base + '/school')).status(), 200);
    assert.equal(await page.$eval('h1', el => el.getAttribute('aria-label')), 'University of Calgary');
    assert.equal(await page.evaluate(() => document.hidden), false);
    await page.waitForFunction(() => document.documentElement.dataset.intro === 'done');
    await sleep(1500);
    assert(await page.$eval('.school-ascii', el => el.getAttribute('aria-hidden') === 'true' && el.dataset.settled === 'true' && [...el.children].map(row => row.textContent).join('\n') === el.dataset.final));
    assert(await page.evaluate(() => window.__decodeDuration > 300 && window.__decodeDuration <= 1500), 'decode settles within 1.5 seconds of entry');
    assert(await page.evaluate(() => window.__decodeUncovered), 'decode runs after the intro and route cover have gone');
    assert(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth && [...document.querySelectorAll('.ascii-row')].every(el => el.getBoundingClientRect().right <= innerWidth)));
    const timing = await page.evaluate(() => [...window.__decodeFrames].sort((a,b) => a-b));
    assert(timing.length > 10, 'decode was actually measured');
    const p95 = timing[Math.ceil(timing.length * .95) - 1];
    assert(p95 <= (rate === 4 ? 33 : 16.7), `decode p95 ${p95} at ${width} CPU ${rate}`);
    console.log(`School decode ${width} CPU ${rate} p95=${p95.toFixed(2)}ms`);
    assert.equal(await page.$$eval('.tree-course', nodes => nodes.length), 14);
    const accessibility = await cdp.send('Accessibility.getFullAXTree');
    assert(accessibility.nodes.filter(node => node.role?.value === 'listitem').length >= 17);
    assert(accessibility.nodes.some(node => node.name?.value === 'Data Structures, Algorithms and Analysis'));
    assert(!accessibility.nodes.some(node => /[├└│]/.test(node.name?.value ?? '')), 'tree art is silent in the accessibility tree');
    assert(!/GPA|\b[A-DF][+-]?\s*\|\s*CPSC/.test(await page.$eval('main', el => el.innerText)));
    if (rate === 1) {
      await page.setViewport({ width: width === 1440 ? 1000 : 390, height: width === 1440 ? 900 : 844, deviceScaleFactor: 1 });
      await sleep(100);
      await page.screenshot({ path: `${out}/${width === 1440 ? 'f9-school.png' : 'f9-school-phone.png'}` });
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await cdp.detach();
  }
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(base + '/school');
  assert(await page.$eval('.school-ascii', el => el.dataset.settled === 'true' && [...el.children].map(row => row.textContent).join('\n') === el.dataset.final));
  assert(await page.$eval('.tree-cursor', el => getComputedStyle(el).animationName === 'none'));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  assert(await page.$eval('.tree-cursor', el => getComputedStyle(el).animationPlayState === 'paused'));
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('F9 School checks passed');
} finally { await browser.close(); }
