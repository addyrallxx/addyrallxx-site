// Wave 4 checks use real Chrome and retain lifecycle, HTTP and contrast gates.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const output = 'C:/Users/adnan/AppData/Local/Temp/claude/briefs/w4';
mkdirSync(output, { recursive: true });
const base = process.argv[2] ?? 'http://localhost:3100';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const measurements = { video: [], contrast: [], services: [], assets: [] };
const errors = [];
let checks = 0;
const check = (name, value) => { assert.ok(value, name); checks++; console.log('ok', name); };
const luminance = rgb => rgb.map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
const rgb = hex => hex.match(/../g).map(channel => parseInt(channel, 16));
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, args: ['--window-position=-2000,0', '--window-size=1500,1100', '--disable-features=CalculateNativeWinOcclusion', '--force-device-scale-factor=1', '--hide-scrollbars'] });
try {
  const p = await browser.newPage();
  p.on('pageerror', error => errors.push(String(error)));
  p.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  p.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  const go = async (selector, offset = 0) => {
    await p.evaluate(({ selector, offset }) => { const el = document.querySelector(selector), y = el.getBoundingClientRect().top + scrollY - offset; if (window.__lenis) { window.__lenis.resize(); window.__lenis.scrollTo(y, { immediate: true }); } else window.scrollTo(0, y); }, { selector, offset });
    await sleep(1400);
  };
  const capture = async name => sharp(await p.screenshot()).resize({ width: 1000, withoutEnlargement: true }).toFile(output + '/' + name + '.png');
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    await p.setViewport({ width, height, deviceScaleFactor: 1 });
    await p.goto(base, { waitUntil: 'networkidle0' });
    check('portfolio identity ' + width, await p.$eval('h1', el => el.getAttribute('aria-label') === 'Written in Calgary. Running in Dhaka.'));
    await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
    await go('.work-stack');
    const frame = await p.$eval('.scroll-video-frame', el => { const r = el.getBoundingClientRect(), chrome = document.querySelector('.chrome-bottom').getBoundingClientRect(); return { width: innerWidth, height: innerHeight, top: r.top, bottom: r.bottom, centre: (r.top + r.bottom) / 2, centrePercent: (r.top + r.bottom) / 2 / innerHeight * 100, below: innerHeight - r.bottom, chromeTop: chrome.top, chromeVisible: getComputedStyle(document.querySelector('.chrome-bottom')).visibility }; });
    measurements.video.push(frame); console.log('VIDEO', JSON.stringify(frame));
    check('video centre is 54 percent and clears viewport and chrome ' + width, Math.abs(frame.centrePercent - 54) <= 1 && frame.top >= 0 && frame.below >= 24 && (frame.chromeVisible === 'hidden' || frame.bottom + 24 <= frame.chromeTop));
    check('pause control stays visually hidden until focused ' + width, await p.$eval('.scroll-video-control', el => el.getBoundingClientRect().width <= 1 && getComputedStyle(el).clip !== 'auto'));
    await p.waitForFunction(() => document.querySelector('video').readyState >= 2);
    await p.$eval('video', video => video.play());
    await p.$eval('.scroll-video-frame', el => el.click());
    check('clicking the frame pauses video ' + width, await p.$eval('video', el => el.paused));
    await p.keyboard.press('Tab'); await p.focus('.scroll-video-control');
    check('focused pause button is a paper pill with a 44px target ' + width, await p.$eval('.scroll-video-control', el => { const s = getComputedStyle(el), r = el.getBoundingClientRect(); return r.height >= 44 && r.width > 44 && s.backgroundColor === 'rgb(243, 240, 232)' && s.right === '12px' && s.bottom === '12px'; }));
    await p.keyboard.press('Space'); await sleep(100);
    check('keyboard control resumes video ' + width, await p.$eval('video', el => !el.paused));
    await p.$eval('.scroll-video-control', el => el.blur());
    await capture('video-' + width);
    await go('.other-band', width < 720 ? 100 : 120);
    check('offscreen video pauses ' + width, await p.$eval('video', el => el.paused));
    await p.$$eval('.fan-card img', images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
    const rest = await p.$$eval('.fan-card', cards => cards.map(card => getComputedStyle(card).transform));
    await p.hover('.other-band'); await sleep(500);
    check('fan scale matches the brief ' + width, await p.$eval('.card-fan', (el, width) => Math.abs(new DOMMatrix(getComputedStyle(el).transform).a - (width < 720 ? 1.3 : 1.9)) < .01, width));
    check('three individual destinations remain keyboard reachable ' + width, await p.$$eval('.fan-links a', links => links.length === 3 && links.every(link => link.tabIndex === 0)));
    if (width < 720) check('phone hover leaves cards at rest', await p.$$eval('.fan-card', (cards, rest) => cards.every((card, i) => getComputedStyle(card).transform === rest[i]), rest));
    await capture('fan-' + width);
    await go('.tools', 80);
    await capture('tools-' + width);
    if (width === 1440) {
      const before = await p.$eval('.skill-ink', el => getComputedStyle(el).fontVariationSettings);
      await p.hover('.skill-ink'); await sleep(350);
      check('tool hover widens Archivo to 125', await p.$eval('.skill-ink', el => getComputedStyle(el).fontVariationSettings.includes('125')));
      await p.mouse.move(1, 100); await sleep(450);
      check('tool hover settles back to 100', await p.$eval('.skill-ink', el => getComputedStyle(el).fontVariationSettings === '"wdth" 100'));
      console.log('TOOL entry width', before);
      for (let i = 0; i < 4; i++) {
        await go('#svc-panel-' + (i + 1), 0);
        const state = await p.$eval('.svc-section', el => { const s = getComputedStyle(el); return { active: el.dataset.activeService, colour: s.color, accent: s.getPropertyValue('--accent').trim() }; });
        measurements.services.push(state); check('service active beat ' + (i + 1), state.active === String(i));
        if (i === 2) check('chartreuse flips ink to midnight', state.colour === 'rgb(10, 15, 44)');
        if (i === 3) check('bordeaux accents become champagne', state.accent.toUpperCase() === '#F1E3C2');
        if (i === 3) {
          const entry = await p.$eval('#svc-panel-4', el => el.getBoundingClientRect().top + scrollY);
          const clips = [];
          for (let step = 0; step < 8; step++) {
            await p.evaluate(({ entry, step }) => window.__lenis.scrollTo(entry - innerHeight * (.94 - step * .6 / 7), { immediate: true }), { entry, step }); await sleep(700);
            clips.push(await p.$eval('[data-svc-colour="3"]', el => getComputedStyle(el).clipPath));
          }
          check('aperture has eight points and intermediate scroll states', new Set(clips).size >= 6 && clips.every(clip => clip.split(',').length === 8));
          check('aperture dims the preceding image and zooms the new one', await p.evaluate(() => Math.abs(new DOMMatrix(getComputedStyle(document.querySelector('#svc-panel-3 .svc-art')).transform).a - .9) < .01 && Math.abs(+getComputedStyle(document.querySelector('#svc-panel-3 .svc-frame'), '::after').opacity - .3) < .01 && Math.abs(new DOMMatrix(getComputedStyle(document.querySelector('#svc-panel-4 .svc-art')).transform).a - 1) < .01));
          await go('#svc-panel-4');
        }
        await capture('service-' + (i + 1));
      }
    }
    await go('.car-photo');
    check('E92 photograph fills a viewport ' + width, await p.$eval('.car-photo', el => Math.abs(el.clientHeight - innerHeight) <= 1 && Math.abs(el.clientWidth - innerWidth) <= 1));
    await capture('e92-' + width);
    await go('#contact', 60);
    check('Something stays inside its masked line at maximum width ' + width, await p.$eval('.contact-width', el => { const before = el.style.getPropertyValue('--contact-wdth'); el.style.setProperty('--contact-wdth', '125'); const fits = el.scrollWidth <= el.parentElement.clientWidth; el.style.setProperty('--contact-wdth', before); return fits; }));
    await capture('contact-' + width);
    await go('.site-footer', height - 160);
    await capture('footer-' + width);
    const rects = await p.$$eval('.site-footer > *', els => els.map(el => el.getBoundingClientRect().toJSON()));
    await p.$$eval('.site-footer > *', els => els.forEach(el => el.style.visibility = 'hidden'));
    const { data, info } = await sharp(await p.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let minimum = Infinity;
    for (const rect of rects) for (let y = Math.max(0, Math.floor(rect.top)); y < Math.min(info.height, rect.bottom); y += 2) for (let x = Math.max(0, Math.floor(rect.left)); x < Math.min(info.width, rect.right); x += 2) { const at = (y * info.width + x) * info.channels; minimum = Math.min(minimum, contrast(rgb('F3F0E8'), [data[at], data[at + 1], data[at + 2]])); }
    measurements.contrast.push({ pair: 'footer against rendered contact mesh ' + width, ratio: minimum });
    check('footer clears 4.5 over rendered cobalt mesh ' + width, minimum >= 4.5);
    await p.$$eval('.site-footer > *', els => els.forEach(el => el.style.visibility = ''));
    const glyphContrast = await p.$$eval('.falling-glyph', nodes => {
      const lum = css => css.match(/[\d.]+/g).slice(0, 3).map(Number).map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
      return nodes.map(node => { const s = getComputedStyle(node), a = lum(s.color), b = lum(s.backgroundColor); return { pair: 'glyph ' + node.textContent + ' on ' + s.backgroundColor, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }; });
    });
    measurements.contrast.push(...glyphContrast);
    check('glyph labels clear 4.5 against their actual fills ' + width, glyphContrast.length === 10 && glyphContrast.every(pair => pair.ratio >= 4.5));
    check('no horizontal overflow ' + width, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); await sleep(500);
    await go('#svc-panel-3');
    check('reduced service heading stays readable on the midnight ground ' + width, await p.$eval('.svc-section', el => getComputedStyle(el).color === 'rgb(243, 240, 232)'));
    check('reduced third service keeps its chartreuse ground and midnight ink ' + width, await p.$eval('#svc-panel-3', el => { const s = getComputedStyle(el); return s.backgroundColor === 'rgb(215, 242, 107)' && s.color === 'rgb(10, 15, 44)'; }));
    check('reduced tool names stay at width 100 ' + width, await p.$$eval('.skill-ink', nodes => nodes.every(node => getComputedStyle(node).fontVariationSettings === '"wdth" 100')));
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  }
  for (const foreground of ['F3F0E8', 'F1E3C2', 'D7F26B']) for (const ground of ['0A0F2C', '2340FF']) { const ratio = contrast(rgb(foreground), rgb(ground)); measurements.contrast.push({ pair: '#' + foreground + ' on #' + ground, ratio }); check('tool colour contrast ' + foreground + ' on ' + ground, ratio >= 4.5); }
  for (const file of ['public/services/automation@2x.webp', 'public/services/dealership@2x.webp', 'public/other/steward@2x.webp', 'public/other/studio@2x.webp', 'public/e92/v2/profile.webp', 'public/e92/v2/profile-small.webp', 'public/e92/v2/profile.jpg']) { const meta = await sharp(file).metadata(); measurements.assets.push({ file, width: meta.width, height: meta.height }); check('image metadata ' + file, file.includes('e92') ? meta.width === (file.includes('small') ? 1600 : 3024) : meta.width === (file.includes('automation') || file.includes('steward') ? 1536 : 1672) && meta.height === (file.includes('automation') || file.includes('steward') ? 864 : 941)); }
  check('zero console runtime and HTTP errors', errors.length === 0);
  console.log(checks + ' Wave 4 checks passed');
} finally {
  writeFileSync(output + '/codex-a-measurements.json', JSON.stringify({ ...measurements, errors }, null, 2));
  await browser.close();
}
