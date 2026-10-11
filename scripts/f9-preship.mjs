import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
const require = createRequire('C:/Users/adnan/projects/totaltex-web/package.json');
const puppeteer = require('puppeteer-core');
const base = process.argv[2] ?? 'http://localhost:3100';
const out = 'C:/Users/adnan/AppData/Local/Temp/claude/briefs';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: false, args: ['--window-position=-2000,0', '--hide-scrollbars', '--force-device-scale-factor=1'] });
const results = [];
const luminance = rgb => rgb.map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((s,c,i) => s + c * [.2126,.7152,.0722][i], 0);
try {
  const p = await browser.newPage();
  await p.setCacheEnabled(false);
  await p.evaluateOnNewDocument(() => {
    window.__vitals = { cls: 0, lcp: null };
    new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.__vitals.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(list => { const e = list.getEntries().at(-1); window.__vitals.lcp = e.element?.tagName; window.__vitals.priority = e.element?.tagName !== 'IMG' || (e.element.getAttribute('loading') !== 'lazy' && !!document.querySelector('link[rel="preload"][as="image"]')); }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  p.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); });
  p.on('response', response => { if (response.status() >= 400 && new URL(response.url()).pathname !== '/f9-missing-route') errors.push(`${response.status()} ${response.url()}`); });
  for (const width of [390, 1440]) {
    await p.setViewport({ width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1 });
    await p.goto(base);
    if (await p.$eval('h1', el => el.getAttribute('aria-label')) !== 'Systems with taste') throw Error('identity mismatch');
    await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
    const routes = ['/', '/school', '/work', ...await p.$$eval('.work-pill', els => els.map(el => el.getAttribute('href')).filter(Boolean)), '/f9-missing-route'];
    for (const route of [...new Set(routes)]) {
      const response = await p.goto(base + route, { waitUntil: 'domcontentloaded' });
      await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
      await sleep(1800);
      await p.evaluate(() => document.fonts.ready);
      const info = await p.evaluate(() => {
        const visible = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width && r.height && s.visibility === 'visible' && s.display !== 'none'; };
        const targets = [...document.querySelectorAll('a,button,summary,input,select,textarea')].filter(visible);
        return {
          title: document.title, description: document.querySelector('meta[name="description"]')?.content,
          og: document.querySelector('meta[property="og:image"]')?.content, favicon: !!document.querySelector('link[rel="icon"]'), chrome: !!document.querySelector('.chrome'),
          smallTargets: targets.filter(el => { const r = el.getBoundingClientRect(); return r.width < 43.9 || r.height < 43.9; }).map(el => ({ text: el.getAttribute('aria-label') || el.textContent.trim(), class: el.className, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })),
          smallBody: [...document.querySelectorAll('.t-body')].filter(visible).filter(el => parseFloat(getComputedStyle(el).fontSize) < 16).length,
          alt: [...document.images].every(el => el.hasAttribute('alt') || el.getAttribute('aria-hidden') === 'true'),
          dashes: /[\u2013\u2014]/.test(document.querySelector('main')?.innerText ?? document.body.innerText),
          vitals: window.__vitals,
          measures: [...document.querySelectorAll('.t-body')].filter(visible).map(el => ({ width: el.getBoundingClientRect().width, max: getComputedStyle(el).maxWidth, fontSize: getComputedStyle(el).fontSize })),
        };
      });
      info.ogStatus = info.og ? await p.evaluate(async path => { const response = await fetch(path); return { status: response.status, type: response.headers.get('content-type') }; }, new URL(info.og).pathname) : null;
      info.focus = [];
      await p.evaluate(() => document.activeElement.blur());
      const seen = new Set();
      for (let i = 0; i < 100; i++) {
        await p.keyboard.press('Tab');
        const focused = await p.evaluate(() => { const el = document.activeElement, s = getComputedStyle(el); return { text: el.getAttribute('aria-label') || el.textContent.trim().slice(0,80), key: el.outerHTML.slice(0,250), control: el !== document.body, visible: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 }; });
        if (!focused.control) continue;
        if (seen.has(focused.key)) break;
        seen.add(focused.key); info.focus.push(focused);
      }
      // Keyboard activation exercises the native skip target, not just its href.
      await p.keyboard.press('Tab');
      await p.$eval('.skip-link', el => el.focus());
      await p.keyboard.press('Enter');
      info.skip = await p.evaluate(() => location.hash === '#main' && (document.activeElement.id === 'main' || document.activeElement === document.body));
      await p.evaluate(() => document.activeElement.blur());
      const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      const points = Array.from({ length: Math.ceil(max / (width === 390 ? 650 : 720)) + 1 }, (_, i) => Math.min(max, i * (width === 390 ? 650 : 720)));
      const contrast = [];
      let minimumContrast = Infinity, contrastSamples = 0;
      let overflow = false;
      for (const mode of ['night', 'day']) {
        await p.evaluate(mode => { document.documentElement.dataset.mode = mode; window.dispatchEvent(new CustomEvent('sky:mode', { detail: { mode } })); }, mode);
        await sleep(1100);
        for (const y of points) {
          await p.evaluate(y => { window.__lenis?.resize(); if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true }); else scrollTo(0,y); }, y);
          await sleep(1200);
          overflow ||= await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
          const texts = await p.evaluate(() => {
            const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true }); canvas.width = canvas.height = 1;
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            const result = [];
            while (walker.nextNode()) {
              const node = walker.currentNode, el = node.parentElement;
              if (!node.textContent.trim() || el.closest('script,style,.school-ascii,.marquee-track,.sphere-item,.flap-sr,.sr-only,.glyph-pit')) continue;
              const s = getComputedStyle(el); if (s.visibility !== 'visible' || s.display === 'none') continue;
              let opacity = 1; for (let ancestor = el; ancestor; ancestor = ancestor.parentElement) opacity *= Number(getComputedStyle(ancestor).opacity);
              if (opacity === 0) continue;
              ctx.clearRect(0,0,1,1); ctx.fillStyle = s.color; ctx.fillRect(0,0,1,1); const rgba = [...ctx.getImageData(0,0,1,1).data];
              if (rgba[3] === 0) continue;
              const range = document.createRange(); range.selectNodeContents(node);
              for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth) {
                const hit = document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
                if (hit && (el.contains(hit) || hit.contains(el))) result.push({ text: node.textContent.trim().slice(0,65), class: el.className, rgb: rgba.slice(0,3), alpha: opacity * rgba[3] / 255, x:r.left,y:r.top,w:r.width,h:r.height });
              }
            }
            for (const el of document.querySelectorAll('.flap-card')) {
              const r = el.getBoundingClientRect(), s = getComputedStyle(el, '::before');
              if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth || s.visibility !== 'visible') continue;
              let opacity = 1; for (let ancestor = el; ancestor; ancestor = ancestor.parentElement) opacity *= Number(getComputedStyle(ancestor).opacity);
              if (!opacity) continue;
              ctx.clearRect(0,0,1,1); ctx.fillStyle = s.color; ctx.fillRect(0,0,1,1); const rgba = [...ctx.getImageData(0,0,1,1).data];
              result.push({ text: el.dataset.target, class: 'flap-card', rgb: rgba.slice(0,3), alpha: opacity*rgba[3]/255, x:r.left,y:r.top,w:r.width,h:r.height });
            }
            return result;
          });
          const maskStyle = await p.addStyleTag({ content: 'body * { color: rgb(255,0,255) !important; -webkit-text-fill-color: rgb(255,0,255) !important; } body *::before, body *::after { color: rgb(255,0,255) !important; -webkit-text-fill-color: rgb(255,0,255) !important; } .flap-card::before { color:rgb(255,255,0)!important; -webkit-text-fill-color:rgb(255,255,0)!important; }' });
          const painted = await sharp(await p.screenshot()).raw().toBuffer({ resolveWithObject: true });
          await maskStyle.evaluate(el => el.remove());
          const sheet = await p.addStyleTag({ content: 'body * { color: transparent !important; -webkit-text-fill-color: transparent !important; } body *::before, body *::after { color: transparent !important; -webkit-text-stroke-color: transparent !important; }' });
          const { data, info: image } = await sharp(await p.screenshot()).raw().toBuffer({ resolveWithObject: true });
          await sheet.evaluate(el => el.remove());
          for (const text of texts) {
            let minimum = Infinity;
            // Use filled glyph pixels, not bright stars in the unused space of a line box.
            for (let yy = Math.ceil(text.y); yy < Math.min(image.height,text.y+text.h); yy += 2) for (let xx = Math.ceil(text.x); xx < Math.min(image.width,text.x+text.w); xx += 2) {
              const i = (yy * image.width + xx) * image.channels, bg = [data[i],data[i+1],data[i+2]];
              const fg = text.rgb.map((c,j) => c * text.alpha + bg[j] * (1-text.alpha));
              const mask = [painted.data[i],painted.data[i+1],painted.data[i+2]];
              if (text.class === 'flap-card' ? (mask[0] < 180 || mask[1] < 180 || mask[2] > 80) : (mask[0] < 180 || mask[1] > 80 || mask[2] < 180)) continue;
              const a = luminance(bg), b = luminance(fg);
              minimum = Math.min(minimum,(Math.max(a,b)+.05)/(Math.min(a,b)+.05));
            }
            if (Number.isFinite(minimum)) { minimumContrast = Math.min(minimumContrast, minimum); contrastSamples++; }
            if (minimum < 4.5) contrast.push({ mode,y,text:text.text,class:text.class,ratio:minimum });
          }
        }
      }
      results.push({ width,route,status:response.status(),...info,overflow,contrast,minimumContrast,contrastSamples });
      writeFileSync(`${out}/f9-preship-results.json`, JSON.stringify({ results,errors }, null,2));
      console.log(width,route, 'targets',info.smallTargets.length,'contrast',contrast.length,'CLS', info.vitals.cls);
    }
  }
  const failures = results.filter(r => r.status !== (r.route === '/f9-missing-route' ? 404 : 200) || !r.title || !r.description || !r.ogStatus || r.ogStatus.status !== 200 || !r.favicon || !r.chrome || r.smallTargets.length || r.smallBody || !r.alt || r.dashes || !r.skip || r.overflow || r.vitals.cls >= .1 || !r.vitals.priority || r.focus.some(f => !f.visible) || !r.contrastSamples || r.contrast.length);
  if (failures.length || errors.length) throw Error(`Preship defects in ${failures.map(r => `${r.width}:${r.route}`).join(', ')}. ${errors.join('; ')}`);
  console.log('F9 preship checks passed');
} finally { await browser.close(); }
