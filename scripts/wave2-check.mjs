// Wave 2 contracts and final viewport captures. Run serially against the production server.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { WORK } from '../lib/content.ts';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const base = process.argv[2] ?? 'http://localhost:3100';
const output = 'C:/Users/adnan/AppData/Local/Temp/claude/briefs/w2/final';
mkdirSync(output, { recursive: true });
let checks = 0;
const check = (name, value) => { assert.ok(value, name); checks++; console.log('ok', name); };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
check('seven unique projects including Sadman', WORK.length === 7 && new Set(WORK.map(item => item.slug)).size === 7 && WORK.some(item => item.slug === 'sadman'));
for (const project of WORK) for (const path of [...project.images.map(image => image.src), ...Object.values(project.video ?? {})]) check('media exists ' + path, existsSync('public' + path));
const errors = [];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, args: ['--window-position=-2000,0', '--window-size=1500,1000', '--disable-features=CalculateNativeWinOcclusion', '--force-device-scale-factor=1', '--hide-scrollbars'] });
try {
  const p = await browser.newPage();
  await p.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 });
  p.on('pageerror', error => errors.push(String(error)));
  p.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  p.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  await p.goto(base, { waitUntil: 'domcontentloaded' });
  check('identity', await p.$eval('h1', el => el.getAttribute('aria-label') === 'Written in Calgary. Running in Dhaka.'));
  await p.waitForFunction(() => document.documentElement.dataset.intro === 'done' && window.__lenis);
  await sleep(2300);
  const go = async y => { await p.evaluate(y => window.__lenis.scrollTo(y, { immediate: true }), y); await sleep(1400); };
  const top = selector => p.$eval(selector, el => el.getBoundingClientRect().top + scrollY);
  await go(0); await p.screenshot({ path: output + '/hero.png' });
  const masks = [];
  for (const y of [0, 450, 900]) { await go(y); masks.push(await p.$eval('.hero-portal', el => getComputedStyle(el).clipPath)); }
  check('hero word window grows with scroll', new Set(masks).size === 3);
  const work = await top('.work-stack');
  await go(work + 600);
  await p.waitForFunction(() => !document.querySelector('.scroll-video video').paused);
  check('visible showcase plays muted inline', await p.$eval('video', v => v.muted && v.playsInline && v.loop && v.readyState >= 2));
  await p.screenshot({ path: output + '/work.png' });
  const studioIndex = WORK.findIndex(item => item.slug === 'studio');
  await p.evaluate(y => window.__lenis.scrollTo(y, { immediate:true }), work + (studioIndex + .5) * 900);
  await sleep(60);
  check('fast pinned scroll retains a fully revealed backdrop during scrub catch-up', await p.$$eval('.work-card', cards => cards.some(card => {
    const style = getComputedStyle(card);
    return style.visibility !== 'hidden' && (style.clipPath === 'none' || /^inset\(0(?:px|%)?(?:\s+0(?:px|%)?){0,3}\)$/.test(style.clipPath));
  })));
  await go(work + (studioIndex + .2) * 900);
  const layerY = () => p.$$eval('.studio-plane', layers => layers.map(layer => new DOMMatrix(getComputedStyle(layer).transform).f));
  const before = await layerY(); await go(work + (studioIndex + .5) * 900); const after = await layerY();
  const rates = after.map((y, i) => (y - before[i]) / 270);
  console.log('studio px per scroll px', rates);
  check('studio scroll depth is .05 .12 .22', rates.every((rate, i) => Math.abs(rate - [.05, .12, .22][i]) < .01));
  await p.hover('.studio-stack'); await p.mouse.move(960, 700); await sleep(800);
  check('studio pointer travel is bounded to six pixels per axis', await p.$$eval('.studio-plane > div', layers => layers.every(layer => { const m = new DOMMatrix(getComputedStyle(layer).transform); return Math.abs(m.e) <= 6.01 && Math.abs(m.f) <= 6.01; })));
  check('hidden showcase pauses', await p.$eval('video', v => v.paused));
  check('pinned stage paints only the current and preceding beats', await p.$$eval('.work-card', cards => cards.filter(card => getComputedStyle(card).visibility !== 'hidden').length <= 2 && cards.find(card => !card.inert)?.dataset.visible === 'true'));
  // The Studio mask finishes at .65; measure its link after it is actually exposed.
  await go(work + (studioIndex + .8) * 900);
  const magnet = await p.evaluate(async () => {
    const native = Element.prototype.getBoundingClientRect;
    let reads = 0, inertReads = 0;
    Element.prototype.getBoundingClientRect = function () {
      if (this.matches('.work-pill')) { reads++; if (this.closest('[inert]')) inertReads++; }
      return native.call(this);
    };
    try {
      for (let i = 0; i < 100; i++) window.dispatchEvent(new PointerEvent('pointermove', { clientX:500, clientY:450, pointerType:'mouse' }));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }
    finally { Element.prototype.getBoundingClientRect = native; }
    return { reads, inertReads };
  });
  console.log('magnet measurements', magnet);
  check('100 pointer samples coalesce to one active Work link measurement', magnet.reads === 1 && magnet.inertReads === 0);
  for (const slug of ['totaltex-ops', 'totaltex-web', 'fittrack', 'handled', 'sadman']) {
    const index = WORK.findIndex(item => item.slug === slug);
    await go(work + (index + .8) * 900);
    const selector = `.work-card:nth-child(${index + 1}) .work-media-inner img`;
    await p.waitForFunction(selector => document.querySelector(selector)?.complete && document.querySelector(selector)?.naturalWidth > 0, {}, selector);
    check(slug + ' screenshot is contained with intrinsic dimensions and responsive sources', await p.$eval(selector, img => getComputedStyle(img).objectFit === 'contain' && +img.getAttribute('width') > 0 && +img.getAttribute('height') > 0 && img.sizes && img.srcset.includes('w') && img.currentSrc.includes('q=90')));
    if (['fittrack','handled'].includes(slug)) check(slug + ' has no inset phone padding', await p.$eval(selector, img => {
      const inner = img.parentElement, frame = inner.parentElement;
      return Math.abs(inner.getBoundingClientRect().height - frame.getBoundingClientRect().height) < 1 && Math.abs(inner.getBoundingClientRect().top - frame.getBoundingClientRect().top) < 1;
    }));
    if (['fittrack','handled'].includes(slug)) check(slug + ' full screen clears the fixed chrome', await p.$eval(selector, img => {
      const frame = img.parentElement.parentElement.getBoundingClientRect();
      return frame.top >= 56 && frame.bottom <= innerHeight - 56;
    }));
    await p.screenshot({ path: output + '/work-' + slug + '.png' });
  }
  const journey = await top('.journey'); await go(journey); const x0 = await p.$eval('.journey-track', el => new DOMMatrix(getComputedStyle(el).transform).e);
  await go(journey + 500); const x1 = await p.$eval('.journey-track', el => new DOMMatrix(getComputedStyle(el).transform).e);
  check('place-name track scrubs horizontally', x1 < x0 - 250);
  await go(await top('#svc-panel-1')); await p.screenshot({ path: output + '/services.png' });
  check('service navigation retains a readable inactive opacity', await p.$$eval('.svc-row', rows => rows.every(row => +getComputedStyle(row).opacity >= .7)));
  const e92 = await top('#e92'); await go(e92 + 900 * 3.2 * .4); await p.screenshot({ path: output + '/e92.png' });
  check('four retouched E92 images decode', await p.$$eval('#e92 img', images => images.length === 4 && images.every(image => image.naturalWidth > 0)));
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await sleep(800); await p.$eval('video', v => v.scrollIntoView()); await sleep(500);
  check('reduced showcase is paused with a 44px labelled control', await p.$eval('.scroll-video', el => { const b = el.querySelector('button'), r = b.getBoundingClientRect(); return el.querySelector('video').paused && r.width >= 44 && r.height >= 44 && b.getAttribute('aria-label') === 'Puzzled'; }));
  await p.$eval('.scroll-video button', b => b.click()); await sleep(500);
  check('reduced showcase manual play works', await p.$eval('video', v => !v.paused));
  await p.$eval('.scroll-video button', b => b.click());
  check('reduced showcase manual pause works', await p.$eval('video', v => v.paused));
  check('reduced motion clears all pinned layouts', await p.evaluate(() => !document.querySelector('#work').dataset.pinned && !document.querySelector('.journey').dataset.track && !document.querySelector('#e92').dataset.pin));
  check('live reduced motion releases smooth scrolling', await p.evaluate(() => !window.__lenis));
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await p.waitForFunction(() => window.__lenis && document.querySelector('#work').dataset.pinned === 'true');
  check('motion can resume with one accessible Work beat', await p.$$eval('.work-card', cards => cards.filter(card => !card.inert).length === 1));
  await p.setViewport({ width:1000, height:900, deviceScaleFactor:3 });
  for (const slug of ['fittrack','handled']) {
    await p.goto(base + '/work/' + slug, { waitUntil:'networkidle0' });
    const density = await p.$$eval('.project-media img', async images => {
      for (const image of images) { image.loading = 'eager'; await image.decode(); }
      return Promise.all(images.map(async image => {
        const bitmap = await createImageBitmap(await (await fetch(image.currentSrc)).blob());
        const enough = bitmap.width + 1 >= image.getBoundingClientRect().width * devicePixelRatio;
        bitmap.close(); return enough;
      }));
    });
    check(slug + ' serves native density for every phone image at DPR 3', density.length > 0 && density.every(Boolean));
  }
  check('no runtime console or HTTP errors', errors.length === 0);
  console.log(checks + ' wave 2 checks passed. Four 1000x900 DPR 1 screenshots saved.');
} finally { await browser.close(); if (errors.length) console.error(errors); }
