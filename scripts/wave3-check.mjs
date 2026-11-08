// Real Chrome lifecycle, native media, contrast and concurrent GPU/video acceptance.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const base = process.argv[2] ?? 'http://localhost:3100';
const output = 'C:/Users/adnan/AppData/Local/Temp/claude/briefs/w2/wave3';
mkdirSync(output, { recursive: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let checks = 0;
const check = (name, value) => { assert.ok(value, name); checks++; console.log('ok', name); };
const errors = [];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, args: ['--window-position=-2000,0', '--window-size=1500,1100', '--disable-features=CalculateNativeWinOcclusion', '--force-device-scale-factor=1'] });
try {
  const p = await browser.newPage();
  p.on('pageerror', error => errors.push(String(error)));
  p.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  p.on('response', response => { if (response.status() >= 400) errors.push(response.status() + ' ' + response.url()); });
  const go = async selector => {
    await p.evaluate(selector => window.__lenis ? window.__lenis.scrollTo(document.querySelector(selector), { immediate: true, offset: -140 }) : document.querySelector(selector).scrollIntoView(), selector);
    await sleep(1400);
  };
  const capture = async name => { const buffer = await p.screenshot(); await sharp(buffer).resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true }).toFile(`${output}/${name}.png`); };
  for (const width of [1440, 390]) {
    await p.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
    await p.goto(base, { waitUntil: 'domcontentloaded' });
    check('portfolio identity ' + width, await p.$eval('h1', el => el.getAttribute('aria-label') === 'Written in Calgary. Running in Dhaka.'));
    await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
    await sleep(2200);
    await capture('hero-' + width);
    check('settled metadata has no line through glyphs ' + width, await p.$$eval('.hero-facts .split-flap', elements => elements.every(el => el.dataset.settled === 'true' && getComputedStyle(el.querySelector('.flap-card'), '::after').opacity === '0')));
    check('substantial visible navbar ' + width, await p.$eval('.chrome-top', el => el.getBoundingClientRect().height >= (innerWidth < 720 ? 56 : 64)));
    check('no horizontal overflow ' + width, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (width === 390) {
      await p.focus('.menu-button');
      check('phone menu focus keeps paper text on ink', await p.$eval('.menu-button', el => { const s = getComputedStyle(el); return s.color === 'rgb(243, 240, 232)' && s.backgroundColor === 'rgb(10, 15, 44)'; }));
      check('phone clocks retain visible city names', await p.$$eval('.chrome-bottom .clock-city', labels => labels.length === 2 && labels.every(el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0)));
    }
    await go('.work-stack');
    await p.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
    await capture('work-' + width);
    if (width === 1440) check('active Work capsule retains readable label', await p.$eval('.chrome-nav a[aria-current]', el => getComputedStyle(el).color === 'rgb(243, 240, 232)'));
    await go('.tools');
    await p.waitForFunction(() => document.querySelector('.sphere-field').dataset.ready === 'true');
    check('field draws at half CSS resolution ' + width, await p.$eval('.sphere-field', el => { const canvas = el.querySelector('canvas'), r = el.getBoundingClientRect(); return Math.abs(canvas.width - r.width * .5) <= 1 && Math.abs(canvas.height - r.height * .5) <= 1; }));
    const before = await p.$eval('.sphere-field', el => +el.dataset.paints);
    await p.mouse.move(width * .2, 430); await sleep(200); await p.mouse.move(width * .65, 620); await sleep(400);
    check('visible field animates ' + width, await p.$eval('.sphere-field', (el, before) => +el.dataset.paints > before + 5 && el.dataset.running === 'true', before));
    await capture('sphere-' + width);
    const heading = await p.$eval('#tools-heading', el => { const r = el.getBoundingClientRect(); return { left: Math.ceil(r.left), top: Math.ceil(r.top), width: Math.floor(r.width), height: Math.floor(r.height) }; });
    const pixels = await sharp(await p.screenshot()).extract(heading).removeAlpha().raw().toBuffer();
    let inkPixels = 0;
    for (let i = 0; i < pixels.length; i += 3) if (pixels[i] < 80 && pixels[i + 1] < 80 && pixels[i + 2] < 100) inkPixels++;
    check('Tools label paints above the field ' + width, inkPixels > 15);
    if (width === 1440) {
      await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 }); await sleep(600);
      await go('.skill-sphere');
      check('field is on screen before concurrent frame probe', await p.$eval('.sphere-field', el => el.dataset.running === 'true'));
      // A visible native-video clone avoids the production player's offscreen pause gate.
      const media = await p.$eval('video', async source => {
        const video = document.createElement('video'); video.dataset.wave3Video = 'true';
        video.src = source.currentSrc; video.muted = true; video.playsInline = true; video.loop = true;
        video.style.cssText = 'position:fixed;bottom:80px;right:40px;width:300px;z-index:30';
        document.body.appendChild(video); await video.play();
        return { width: video.videoWidth, height: video.videoHeight, paused: video.paused };
      });
      check('native 1024x576 video decodes with sphere', media.width === 1024 && media.height === 576 && !media.paused);
      const frame = await p.evaluate(() => new Promise(resolve => {
        const frames = [], tasks = [], el = document.querySelector('.sphere-field'), video = document.querySelector('[data-wave3-video]');
        const initial = +el.dataset.paints, videoStart = video.currentTime;
        let visible = !document.hidden, last, start, count = 0;
        const visibility = () => { visible &&= !document.hidden; };
        document.addEventListener('visibilitychange', visibility);
        const observer = new PerformanceObserver(list => tasks.push(...list.getEntries().map(entry => entry.duration)));
        observer.observe({ type: 'longtask' });
        const sample = now => {
          if (last !== undefined) frames.push(now - last);
          last = now; start ??= now;
          document.querySelector('.tools').dispatchEvent(new PointerEvent('pointermove', { clientX: 350 + 200 * Math.sin(count / 25), clientY: 400 + 100 * Math.cos(count / 31) }));
          count++;
          if (now - start < 6000) requestAnimationFrame(sample);
          else {
            tasks.push(...observer.takeRecords().map(entry => entry.duration)); observer.disconnect(); document.removeEventListener('visibilitychange', visibility);
            frames.sort((a, b) => a - b);
            resolve({ p95: frames[Math.ceil(frames.length * .95) - 1], maxTask: Math.max(0, ...tasks), paints: +el.dataset.paints - initial, videoAdvance: video.currentTime - videoStart, paused: video.paused, visible });
          }
        }; requestAnimationFrame(sample);
      }));
      console.log('CONCURRENT_FRAME', JSON.stringify(frame));
      check('sphere plus native video p95 <=16.7ms', frame.visible && frame.p95 <= 16.7 && frame.maxTask <= 50 && frame.paints > 100 && frame.videoAdvance > 1 && !frame.paused);
      await p.$eval('[data-wave3-video]', video => { video.pause(); video.removeAttribute('src'); video.load(); video.remove(); });
      await p.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
    }
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]); await sleep(500);
    const frozen = await p.$eval('.sphere-field', el => +el.dataset.paints); await sleep(300);
    check('reduced motion is a static field ' + width, await p.$eval('.sphere-field', (el, frozen) => +el.dataset.paints === frozen && el.dataset.running === 'false', frozen));
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]); await sleep(500);
    await go('.skill-sphere');
    check('motion resumes field ' + width, await p.$eval('.sphere-field', el => el.dataset.running === 'true'));
    const other = await browser.newPage(); await other.bringToFront(); await sleep(300);
    const hidden = await p.$eval('.sphere-field', el => +el.dataset.paints); await sleep(300);
    check('hidden tab stops field ' + width, await p.$eval('.sphere-field', (el, hidden) => document.hidden && +el.dataset.paints === hidden && el.dataset.running === 'false', hidden));
    await other.close(); await p.bringToFront(); await sleep(300);
    await go('.hero');
    const off = await p.$eval('.sphere-field', el => +el.dataset.paints); await sleep(300);
    check('offscreen field stops ' + width, await p.$eval('.sphere-field', (el, off) => +el.dataset.paints === off && el.dataset.running === 'false', off));
    await go('#taste'); await capture('taste-' + width);
    await go('#method'); await capture('method-' + width);
    if (width === 1440) {
      await p.setViewport({ width: 1300, height: 1000, deviceScaleFactor: 1 }); await sleep(200);
      check('image cards retain complete copy below 1440', await p.$$eval('.other-card', cards => cards.every(el => el.scrollHeight <= el.clientHeight)));
      await p.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 }); await sleep(200);
      check('image card set retains three columns at 1440', await p.$eval('.other-grid', el => getComputedStyle(el).gridTemplateColumns.split(' ').length === 3));
    }
  }
  const ratios = await p.evaluate(() => {
    const tokens = getComputedStyle(document.documentElement);
    const luminance = hex => { const c = hex.trim().replace('#', '').match(/../g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return c[0] * .2126 + c[1] * .7152 + c[2] * .0722; };
    return ['--ink', '--ink-2', '--ink-3', '--accent'].flatMap(ink => ['--bg', '--surface'].map(ground => { const a = luminance(tokens.getPropertyValue(ink)), b = luminance(tokens.getPropertyValue(ground)); return { ink, ground, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }; }));
  });
  console.log('CONTRAST', JSON.stringify(ratios)); check('all palette text pairs >=4.5', ratios.every(pair => pair.ratio >= 4.5));
  await p.$eval('.sphere-field canvas', canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()); await sleep(200);
  check('context loss keeps CSS fallback and releases canvas', await p.$eval('.sphere-field', el => !el.querySelector('canvas') && !el.dataset.ready && getComputedStyle(el).backgroundImage.includes('radial-gradient')));
  await p.$eval('.other-card', el => el.click());
  await p.waitForFunction(() => document.documentElement.dataset.transition === 'covered');
  check('first transition cobalt layer reaches full cover', await p.$eval('.route-backplate', el => !el.hidden && Math.abs(el.getBoundingClientRect().top) < 1));
  await p.waitForFunction(() => location.pathname === '/work' && !document.documentElement.dataset.transition);
  check('zero runtime console or HTTP errors', errors.length === 0);
  console.log(`${checks} Wave 3 checks passed`);
} finally { await browser.close(); }
