import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const url = process.argv[2] ?? 'http://localhost:3100';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, args: ['--window-position=-2000,0', '--window-size=1500,1000', '--disable-features=CalculateNativeWinOcclusion', '--force-device-scale-factor=1', '--hide-scrollbars'] });
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
    p.on('console', message => { if(message.type() === 'error') errors.push(message.text()); });
    p.on('pageerror', error => errors.push(String(error)));
    p.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
    await p.goto(url, { waitUntil: 'networkidle0' });
    check('identity and visible Chrome ' + width, await p.evaluate(() => !!document.querySelector('.hero') && document.hidden === false && document.querySelector('h1').getAttribute('aria-label') === 'Written in Calgary. Running in Dhaka.'));
    await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
    check('hero letters have separate entrance and peel wrappers ' + width, await p.$$eval('.hero-letter-mask', masks => masks.length > 20 && masks.every(mask => mask.querySelector('.hero-letter-enter') && mask.querySelector('.hero-letter-peel'))));
    await sleep(1600);
    check('facts settle to exact supplied targets ' + width, await p.$$eval('.hero-facts .split-flap', elements => elements.every(el => el.dataset.settled === 'true' && [...el.querySelectorAll('.flap-card')].every(card => card.children.length === 0 && getComputedStyle(card, "::before").content === JSON.stringify(card.dataset.target)))));
    check('clock digits and AM/PM intact ' + width, await p.$$eval('.chrome-bottom .clock', clocks => clocks.every(el => /^\d{1,2}:\d{2}$/.test(el.querySelector('.clock-digits').textContent) && /^(AM|PM)$/.test(el.querySelector('.clock-period').textContent))));
    if (width === 1000) {
      check('hero letters settle without pointer deformation', await p.$$eval('.hero-desktop-line .hero-letter-enter', letters => letters.every(el => Math.abs(new DOMMatrix(getComputedStyle(el).transform).f) < .1)));
      await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f12-hero.png') });
    }
    await scroll(p, '.taste-body', 200); await sleep(800);
    const lit = await p.$eval('.taste-body', el => ({text:el.textContent}));
    check('body copy stays fully opaque without per-word paint ' + width, await p.$eval('.taste-body', el => !el.querySelector('.lit-word') && getComputedStyle(el).opacity === '1'));
    const ax = await p.createCDPSession();
    const tree = await ax.send('Accessibility.getFullAXTree');
    check('accessibility tree retains full sentence ' + width, tree.nodes.some(node => !node.ignored && node.name?.value === lit.text)); await ax.detach();
    check('mesh is confined to Contact ' + width, await p.$$eval('.gradient-mesh', nodes => nodes.length === 1 && nodes[0].parentElement.matches('#contact')));
    await scroll(p, '.kinetic-marquee');
    const first = await p.$eval('.marquee-track', el => new DOMMatrix(getComputedStyle(el).transform).m41); await sleep(300);
    check('marquee moves at rest ' + width, first !== await p.$eval('.marquee-track', el => new DOMMatrix(getComputedStyle(el).transform).m41));
    await p.evaluate(() => window.__lenis.scrollTo(window.__lenis.animatedScroll + 200)); await sleep(180);
    check('marquee follows downward scroll ' + width, await p.$eval('.kinetic-marquee', el => el.dataset.direction === '-1'));
    await p.evaluate(() => window.__lenis.scrollTo(window.__lenis.animatedScroll - 200)); await sleep(180);
    check('marquee reverses with upward scroll ' + width, await p.$eval('.kinetic-marquee', el => el.dataset.direction === '1'));
    if (width === 1000) await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f12-marquee.png') });
    await scroll(p, '.svc-section', 100);
    check('services uses cobalt and uncropped media ' + width, await p.evaluate(() => {
      const heading = document.querySelector('.svc-heading > span:last-child');
      return getComputedStyle(heading).color === 'rgb(35, 64, 255)' && [...document.querySelectorAll('.svc-art img')].every(img => getComputedStyle(img).objectFit === 'contain');
    }));
    for (let i = 0; i < 4; i++) {
      await scroll(p, '#svc-panel-' + (i+1), 100); await sleep(450);
      check('service media loads ' + width + '/' + i, await p.$eval('#svc-panel-' + (i+1), panel => !!panel.querySelector('.svc-outline') || panel.querySelector('img').naturalWidth > 0));
      if (width === 1000) check('panel centre activates matching service row ' + i, await p.$$eval('.svc-row', (rows,i) => rows[i].getAttribute('aria-current') === 'location' && rows.filter(row => row.getAttribute('aria-current') === 'location').length === 1,i));
    }
    if (width === 1000) {
      check('inactive service rows retain 4.5:1 contrast', await p.$$eval('.svc-row', rows => {
        const rgb = value => value.match(/[\d.]+/g).slice(0,3).map(Number);
        const lum = c => c.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((s,v,i) => s + v * [.2126,.7152,.0722][i],0);
        const probe = document.createElement('span'); probe.style.backgroundColor = 'var(--bg)'; document.body.append(probe);
        const bg = rgb(getComputedStyle(probe).backgroundColor); probe.remove();
        return rows.every(row => { const style = getComputedStyle(row), alpha = +style.opacity, fg = rgb(style.color).map((v,i) => v * alpha + bg[i] * (1-alpha)), a = lum(fg), b = lum(bg); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05) >= 4.5; });
      }));
      await p.$eval('.svc-row', row => row.click()); await sleep(1500);
      check('service anchor reaches its panel', await p.$eval('#svc-panel-1', panel => Math.abs(panel.getBoundingClientRect().top) < 2));
      await p.screenshot({path:join(tmpdir(),'claude/briefs/f12-services.png')});
    } else check('phone service headings are stacked', await p.$$eval('.svc-phone-heading', headings => headings.length === 4 && headings.every(el => getComputedStyle(el).display !== 'none')));
    const paused = await p.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange'));
      return [...document.querySelectorAll('.marquee-track')].map(el => el.style.transform);
    });
    await sleep(250);
    check('hidden document pauses both marquees and meshes ' + width, await p.evaluate(previous => [...document.querySelectorAll('.marquee-track')].every((el,i) => el.style.transform === previous[i]) && [...document.querySelectorAll('.gradient-mesh')].every(el => el.dataset.paused === 'true'), paused));
    await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await scroll(p, '#contact', 80); await sleep(1600);
    for (const mode of ['paper']) {
      await p.evaluate(mode => { /* Day-only. */ }, mode);
      check('chunky glyph tiles and 4.5:1 contrast ' + width + ' ' + mode, await p.$$eval('.falling-glyph', nodes => {
        const lum = value => value.match(/[\d.]+/g).slice(0,3).map(Number).map(n => { n /= 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((s,n,i) => s+n*[.2126,.7152,.0722][i],0);
        return nodes.every(el => { const s = getComputedStyle(el), a = lum(s.color), b = lum(s.backgroundColor); return s.borderTopWidth === '3px' && s.borderRadius === '16px' && s.boxShadow.includes('6px 6px 0px') && (Math.max(a,b)+.05)/(Math.min(a,b)+.05) >= 4.5; });
      }));
    }
    await p.evaluate(() => { /* Day-only. */ });
    await scroll(p, '.email-copy', 180);
    const button = await p.$eval('.email-copy', el => { const r = el.getBoundingClientRect(); return { x:r.x+r.width/2,y:r.y+r.height/2 }; });
    await p.mouse.move(button.x, button.y); await p.mouse.down(); await p.$eval('.email-copy', el => getComputedStyle(el).transform); await sleep(150);
    console.log('PRESS', width, await p.$eval('.email-copy', el => ({active:el.matches(':active'),transform:getComputedStyle(el).transform,shadow:getComputedStyle(el).boxShadow,top:el.getBoundingClientRect().top,hit:document.elementFromPoint(el.getBoundingClientRect().x+el.clientWidth/2,el.getBoundingClientRect().y+el.clientHeight/2)?.className})));
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
  check('reduced motion shows lit final text and static meshes', await p.evaluate(() => [...document.querySelectorAll('p.t-body')].every(el => getComputedStyle(el).opacity === '1') && [...document.querySelectorAll('.mesh-field')].every(el => getComputedStyle(el).animationName === 'none') && [...document.querySelectorAll('.split-flap')].every(el => el.dataset.settled === 'true')));
  await p.close();
  check('no runtime or HTTP errors', errors.length === 0);
  console.log(checks + ' F12 checks passed.');
  // Claude, 2026-10-10: Ops and Puzzled have no approved images yet; their strips use typographic visuals until real ones exist.
  if (missingImages.size) console.log('services using typographic fallback: ' + [...missingImages].join(', '));
} finally { await browser.close(); if (errors.length) console.error(errors); }
