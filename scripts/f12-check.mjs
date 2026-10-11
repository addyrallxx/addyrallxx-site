import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const url = process.argv[2] ?? 'http://localhost:3100';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, args: ['--window-position=-2000,0', '--force-device-scale-factor=1', '--hide-scrollbars'] });
const errors = [];
const missingImages = new Set();
let checks = 0;
function check(name, value) { assert.ok(value, name); console.log('ok', name); checks++; }
async function scroll(p, selector, offset = 150) {
  const y = await p.$eval(selector, (el, offset) => el.getBoundingClientRect().top + scrollY - offset, offset);
  await p.evaluate(y => { window.__lenis?.resize(); if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y); }, y);
  await sleep(650);
}
try {
  for (const width of [1000, 390]) {
    const p = await browser.newPage();
    await p.setViewport({ width, height: 900, deviceScaleFactor: 1, isMobile: width === 390, hasTouch: width === 390 });
    p.on('pageerror', error => errors.push(String(error)));
    p.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
    await p.goto(url, { waitUntil: 'networkidle0' });
    check('identity and visible Chrome ' + width, await p.evaluate(() => !!document.querySelector('.hero') && document.hidden === false && document.querySelector('h1').getAttribute('aria-label') === 'Systems with taste'));
    await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
    if (width === 1000) check('facts animate with two half faces and 400px perspective', await p.$eval('.hero-facts', el => {
      const card = el.querySelector('.flap-card[data-flipping]');
      return card && card.children.length === 2 && card.querySelector('.flap-top') && card.querySelector('.flap-bottom') && getComputedStyle(card).perspective === '400px';
    }));
    await sleep(1600);
    check('facts settle to exact supplied targets ' + width, await p.$$eval('.hero-facts .split-flap', elements => elements.every(el => el.dataset.settled === 'true' && [...el.querySelectorAll('.flap-card')].every(card => card.children.length === 0 && getComputedStyle(card, "::before").content === JSON.stringify(card.dataset.target)))));
    check('clock digits and AM/PM intact ' + width, await p.$$eval('.chrome-bottom .clock', clocks => clocks.every(el => /^\d{1,2}:\d{2}$/.test(el.querySelector('.clock-digits').textContent) && /^(AM|PM)$/.test(el.querySelector('.clock-period').textContent))));
    if (width === 1000) {
      const letter = await p.$eval('.kinetic-letter', el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
      await p.mouse.move(letter.x, letter.y); await sleep(350);
      check('hero letter reacts within 220px', await p.$eval('.kinetic-letter', el => new DOMMatrix(getComputedStyle(el).transform).m42 < -1 && +el.style.getPropertyValue('--letter-weight') > 800));
      await p.mouse.move(999, 10); await sleep(450);
      await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f12-hero.png') });
    }
    const lit = await p.$eval('.taste-body', el => ({ y: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight, text: el.querySelector('.sr-only').textContent }));
    const sample = async y => { await p.evaluate(y => window.__lenis.scrollTo(y, { immediate: true }), y); await sleep(150); return p.$eval('.taste-body', el => { const words = [...el.querySelectorAll('.lit-word')]; return +getComputedStyle(words[Math.floor(words.length / 2)]).opacity; }); };
    const before = await sample(lit.y - 900 * .8), after = await sample(lit.y + lit.height - 900 * .45);
    console.log('lit opacity', width, before, after);
    check('mid paragraph lights across its scroll window within the contrast floor ' + width, before >= .9 && after > before + .05);
    const ax = await p.createCDPSession();
    const tree = await ax.send('Accessibility.getFullAXTree');
    check('accessibility tree retains full sentence ' + width, tree.nodes.some(node => !node.ignored && node.name?.value === lit.text)); await ax.detach();
    if (width === 1000) {
      const entry = await p.$eval('#e92', el => el.getBoundingClientRect().top + scrollY);
      const values = [];
      for (const fraction of [.6, .8, 1.2]) {
        await p.evaluate(({entry,fraction}) => window.__lenis.scrollTo(entry + innerHeight * 2.2 * fraction, {immediate:true}), {entry,fraction}); await sleep(1100);
        values.push(await p.$eval('.car-lead', el => { const words = [...el.querySelectorAll('.lit-word')]; return +getComputedStyle(words[Math.floor(words.length / 2)]).opacity; }));
      }
      console.log('pinned E92 word opacity', values);
      check('E92 words follow the moving pinned paragraph within the contrast floor', values[0] === .9 && values[2] === 1);
    }
    check('meshes are confined to Services and Contact ' + width, await p.$$eval('.gradient-mesh', nodes => nodes.length === 2 && nodes.every(node => node.parentElement.matches('.services, #contact'))));
    await scroll(p, '.kinetic-marquee');
    const first = await p.$eval('.marquee-track', el => new DOMMatrix(getComputedStyle(el).transform).m41); await sleep(300);
    check('marquee moves at rest ' + width, first !== await p.$eval('.marquee-track', el => new DOMMatrix(getComputedStyle(el).transform).m41));
    await p.evaluate(() => window.__lenis.scrollTo(window.__lenis.animatedScroll + 200)); await sleep(180);
    check('marquee follows downward scroll ' + width, await p.$eval('.kinetic-marquee', el => el.dataset.direction === '-1'));
    await p.evaluate(() => window.__lenis.scrollTo(window.__lenis.animatedScroll - 200)); await sleep(180);
    check('marquee reverses with upward scroll ' + width, await p.$eval('.kinetic-marquee', el => el.dataset.direction === '1'));
    if (width === 1000) await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f12-marquee.png') });
    await scroll(p, '.services', 100);
    if (width === 1000) await p.hover('.service-entry:first-child h3');
    else await scroll(p, '.service-entry:first-child', 420);
    await sleep(550);
    console.log('services', width, await p.$$eval('.service-entry', entries => entries.map(e => ({ open:e.dataset.open, clip:getComputedStyle(e.querySelector('.service-strip')).clipPath, image:e.querySelector('img')?.naturalWidth }))));
    check('one service strip opens and its project image loads ' + width, await p.$$eval('.service-entry', entries => entries.filter(e => e.dataset.open === 'true').length === 1 && entries[0].dataset.open === 'true' && entries[0].querySelector('img').naturalWidth > 0 && getComputedStyle(entries[0].querySelector('.service-strip')).clipPath.match(/[\d.]+/g).every(n => +n === 0)));
    if (width === 1000) await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f12-services.png') });
    await scroll(p, '.service-entry:nth-child(2)', width === 1000 ? 180 : 420);
    if (width === 1000) await p.hover('.service-entry:nth-child(2) h3'); await sleep(450);
    check('opening a second service closes the first ' + width, await p.$$eval('.service-entry', entries => entries.filter(e => e.dataset.open === 'true').length === 1 && entries[1].dataset.open === 'true' && getComputedStyle(entries[0].querySelector('.service-strip')).display === 'none'));
    for (const name of await p.$$eval('.service-entry', entries => entries.filter(el => !el.querySelector('.service-strip img')).map(el => el.querySelector('h3').textContent))) missingImages.add(name);
    const paused = await p.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'));
      return [...document.querySelectorAll('.marquee-track')].map(el => el.style.transform);
    });
    await sleep(250);
    check('hidden document pauses both marquees and meshes ' + width, await p.evaluate(previous => [...document.querySelectorAll('.marquee-track')].every((el,i) => el.style.transform === previous[i]) && [...document.querySelectorAll('.gradient-mesh')].every(el => el.dataset.paused === 'true'), paused));
    await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await scroll(p, '#contact', 80); await sleep(1600);
    for (const mode of ['night', 'day']) {
      await p.evaluate(mode => { document.documentElement.dataset.mode = mode; }, mode);
      check('chunky glyph tiles and 4.5:1 contrast ' + width + ' ' + mode, await p.$$eval('.falling-glyph', nodes => {
        const lum = value => value.match(/[\d.]+/g).slice(0,3).map(Number).map(n => { n /= 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((s,n,i) => s+n*[.2126,.7152,.0722][i],0);
        return nodes.every(el => { const s = getComputedStyle(el), a = lum(s.color), b = lum(s.backgroundColor); return s.borderTopWidth === '3px' && s.borderRadius === '16px' && s.boxShadow.includes('6px 6px 0px') && (Math.max(a,b)+.05)/(Math.min(a,b)+.05) >= 4.5; });
      }));
    }
    await p.evaluate(() => { document.documentElement.dataset.mode = 'night'; });
    await scroll(p, '.email-copy', 180);
    const button = await p.$eval('.email-copy', el => { const r = el.getBoundingClientRect(); return { x:r.x+r.width/2,y:r.y+r.height/2 }; });
    await p.mouse.move(button.x, button.y); await p.mouse.down(); await sleep(150);
    check('contact press shifts four pixels and shrinks shadow ' + width, await p.$eval('.email-copy', el => { const style = getComputedStyle(el), matrix = new DOMMatrix(style.transform); return matrix.m41 === 4 && matrix.m42 === 4 && style.boxShadow.includes('2px 2px 0px'); })); await p.mouse.up();
    await scroll(p, '.glyph-pit', 440); await sleep(3100);
    console.log('pit', width, await p.$eval('.glyph-pit', el => { const r = el.getBoundingClientRect(); return { running:el.dataset.running, rect:{top:r.top,bottom:r.bottom,left:r.left,right:r.right}, nodes:[...el.children].map(node => { const b = node.getBoundingClientRect(); return { glyph:node.textContent, asleep:node.dataset.asleep, top:b.top,bottom:b.bottom,left:b.left,right:b.right }; }) }; }));
    check('glyph tile boxes settle inside the pit ' + width, await p.$eval('.glyph-pit', el => { const r = el.getBoundingClientRect(); return el.dataset.running === 'false' && [...el.children].every(node => { const b = node.getBoundingClientRect(); return b.left >= r.left-.5 && b.right <= r.right+.5 && b.top >= r.top-.5 && b.bottom <= r.bottom+.5; }); }));
    if (width === 1000) await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f12-pit.png') });
    check('no horizontal overflow ' + width, await p.evaluate(() => document.documentElement.scrollWidth === innerWidth));
    await p.goto(url + '/school', { waitUntil: 'networkidle0' });
    check('school mesh only in its hero ' + width, await p.$$eval('.gradient-mesh', nodes => nodes.length === 1 && nodes[0].matches('.mesh-school') && nodes[0].parentElement.matches('.page-hero')));
    await p.close();
  }
  const p = await browser.newPage();
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.goto(url,{waitUntil:'networkidle0'});
  check('reduced motion shows lit final text and static meshes', await p.evaluate(() => [...document.querySelectorAll('.lit-word')].every(el => getComputedStyle(el).opacity === '1') && [...document.querySelectorAll('.mesh-field')].every(el => getComputedStyle(el).animationName === 'none') && [...document.querySelectorAll('.split-flap')].every(el => el.dataset.settled === 'true')));
  await p.close();
  check('no runtime or HTTP errors', errors.length === 0);
  console.log(checks + ' F12 checks passed.');
  // Claude, 2026-10-10: Ops and Puzzled have no approved images yet; their strips use typographic visuals until real ones exist.
  if (missingImages.size) console.log('services using typographic fallback: ' + [...missingImages].join(', '));
} finally { await browser.close(); if (errors.length) console.error(errors); }
