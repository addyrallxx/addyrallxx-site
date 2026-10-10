// Level 4 checks. Uses the existing real-Chrome tooling, no new dependency.
// Run after npm run build and npm run start -- --port 3100.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import sharp from "sharp";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { readFileSync } from "node:fs";

const require = createRequire("C:/Users/adnan/projects/totaltex-web/package.json");
const puppeteer = require("puppeteer-core");
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: false,
  args: ["--window-position=-2000,0", "--force-device-scale-factor=1", "--hide-scrollbars"],
});
const url = process.argv[2] ?? "http://localhost:3100";
const errors = [];
const budgets = [];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let checks = 0;
function check(name, value) { assert.ok(value, name); checks++; console.log("ok", name); }
async function page(options = {}) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1, ...options });
  p.on("pageerror", (error) => errors.push(String(error)));
  p.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  p.on("response", (response) => { if (response.status() >= 400) errors.push(response.status() + " " + response.url()); });
  await p.evaluateOnNewDocument(() => {
    window.__f1 = { done: 0, scroll: 0, time: 0, renders: 0 };
    window.__introSamples = [];
    window.__tachSamples = [];
    window.addEventListener('tach:probe', () => {
      const until = performance.now() + 1100;
      const sample = () => { const needle = document.querySelector('.tach-needle'); if (needle) window.__tachSamples.push(parseFloat(needle.style.transform.slice(7))); if (performance.now() < until) requestAnimationFrame(sample); }; requestAnimationFrame(sample);
    });
    window.addEventListener("intro:done", () => { window.__f1.done++; window.__f1.doneAt = performance.now(); });
    const sample = setInterval(() => {
      const el = document.querySelector(".intro");
      if (!el) return;
      if (!el.hidden) window.__f1.halves = {
        top: el.querySelector(".intro-top").getBoundingClientRect().bottom,
        bottom: el.querySelector(".intro-bottom").getBoundingClientRect().top,
      };
      if (el.dataset.parting && !window.__f1.partAt) window.__f1.partAt = performance.now();
      window.__introSamples.push({
        text: el.querySelector(".intro-counter").dataset.value,
        rendered: [...el.querySelectorAll(".intro-digit:not([hidden])")].map(d => d.lastElementChild.textContent).join(""),
        scale: new DOMMatrix(getComputedStyle(el.querySelector(".intro-horizon")).transform).a,
        stripe: el.dataset.finale ? [...el.querySelectorAll(".intro-stripe > span")].map(band => ({ colour: getComputedStyle(band).backgroundColor, height: band.getBoundingClientRect().height, y: new DOMMatrix(getComputedStyle(band).transform).f })) : null,
      });
      if (el.hidden) clearInterval(sample);
    }, 50);
    const locations = new WeakMap();
    const proto = WebGL2RenderingContext.prototype;
    const get = proto.getUniformLocation;
    proto.getUniformLocation = function (program, name) {
      const location = get.call(this, program, name);
      if (location) locations.set(location, name);
      return location;
    };
    const set = proto.uniform1f;
    proto.uniform1f = function (location, value) {
      const name = locations.get(location);
      if (name === "uScroll") window.__f1.scroll = value;
      if (name === "uTime") { window.__f1.time = value; window.__f1.renders++; }
      return set.call(this, location, value);
    };
  });
  return p;
}
async function heroBounds(p) {
  const b = await p.evaluate(() => {
    const h = document.querySelector("h1").getBoundingClientRect();
    const heading = document.querySelector("h1");
    const lead = document.querySelector(".hero-lead").getBoundingClientRect();
    const clocks = document.querySelector(".chrome-bottom .clocks").getBoundingClientRect();
    const range = document.createRange();
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const rects = [];
    while (walker.nextNode()) {
      range.selectNodeContents(walker.currentNode);
      rects.push(...[...range.getClientRects()].filter(r => r.width > 0));
    }
    return { bottom: h.bottom, clocks: clocks.top, left: Math.min(...rects.map(r => r.left)), right: Math.max(...rects.map(r => r.right)), width: innerWidth, top: h.top, leadBottom: lead.bottom,
      lines: [...heading.querySelectorAll(".hero-line")].filter(el => getComputedStyle(el).display !== "none").length, size: parseFloat(getComputedStyle(heading).fontSize) };
  });
  console.log("hero bounds", b);
  check("hero above clocks and within viewport", b.bottom < b.clocks && b.left >= 0 && b.right <= b.width && b.top >= 0);
  check("lead above headline and authored line count", b.leadBottom < b.top && b.lines === (b.width < 720 ? 3 : 2) && b.size >= 56);
}
async function frameBudget(p, rate, spin = false) {
  const cdp = await p.createCDPSession();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  await p.evaluate(spin => window.__lenis.scrollTo(spin ? document.querySelector("[data-sphere]").getBoundingClientRect().top + scrollY - 160 : 0, { immediate: true }), spin);
  await sleep(300);
  const sphereBefore = spin ? await p.$eval('[data-sphere-item]', el => el.style.transform) : null;
  check("visible before frame probe", await p.evaluate(() => !document.hidden));
  const result = await p.evaluate(spin => new Promise(resolve => {
    const frames = [], tasks = [];
    const observer = new PerformanceObserver(list => tasks.push(...list.getEntries().map(e => e.duration)));
    observer.observe({ type: "longtask" });
    const width = innerWidth, height = innerHeight;
    const max = document.documentElement.scrollHeight - height;
    const start = performance.now();
    const renders = window.__f1.renders;
    let peakScroll = 0;
    let last;
    const probe = now => {
      if (last !== undefined) frames.push(now - last);
      last = now;
      const t = Math.min((now - start) / (spin ? 3000 : 6000), 1);
      if (!spin) window.__lenis.scrollTo(max * (.5 - .5 * Math.cos(t * Math.PI * 2)));
      peakScroll = Math.max(peakScroll, window.__lenis.animatedScroll);
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: width * (.5 + .45 * Math.sin(t * Math.PI * 8)), clientY: height * (.5 + .4 * Math.cos(t * Math.PI * 6)), pointerType: "mouse" }));
      if (t < 1) requestAnimationFrame(probe);
      else {
        tasks.push(...observer.takeRecords().map(e => e.duration));
        observer.disconnect();
        frames.sort((a, b) => a - b);
        resolve({ p95: frames[Math.ceil(frames.length * .95) - 1], frames: frames.length, maxTask: Math.max(0, ...tasks), renders: window.__f1.renders - renders, peakScroll, max, width, height });
      }
    };
    requestAnimationFrame(probe);
  }), spin);
  console.log(`FRAME ${result.width}x${result.height} CPU ${rate}x ${spin ? "sphere" : "scroll"} p95=${result.p95.toFixed(3)}ms frames=${result.frames} maxLongTask=${result.maxTask.toFixed(1)}ms`);
  check(spin ? "frame probe exercises canvas while sphere is visible" : "frame probe exercises canvas and Lenis", result.renders > 60 && (spin || result.peakScroll > result.max * .8));
  if (spin) check('globe spins throughout sphere frame sample', sphereBefore !== await p.$eval('[data-sphere-item]', el => el.style.transform));
  budgets.push({ ...result, rate, spin });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await cdp.detach();
}
async function scrollTo(p, selector, offset = 160) {
  const y = await p.$eval(selector, (el, offset) => Math.max(0, Math.min(el.getBoundingClientRect().top + scrollY - offset, document.documentElement.scrollHeight - innerHeight)), offset);
  await p.evaluate(y => { window.__lenis.resize(); window.__lenis.scrollTo(y, { immediate: true }); }, y);
  await sleep(1100);
  const landed = await p.evaluate(y => ({ actual: scrollY, target: Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight)), limit: window.__lenis.limit }), y);
  if (Math.abs(landed.actual - landed.target) >= 2) console.log('scroll mismatch', landed);
  check("Lenis lands at requested section", Math.abs(landed.actual - landed.target) < 2);
}
async function sweepPage(p) {
  const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y <= max + 500; y += 500) {
    await p.evaluate(y => window.__lenis.scrollTo(y, { immediate: true }), Math.min(y, max));
    await sleep(100);
  }
  await sleep(800);
  check("no HTTP or runtime errors after whole-page lazy image sweep", errors.length === 0);
}
async function fanMatrices(p, hover) {
  const matrices = await p.$$eval(".fan-card", cards => cards.map(card => {
    const m = new DOMMatrix(getComputedStyle(card).transform); return [m.a, m.b, m.c, m.d, m.e, m.f];
  }));
  const values = hover ? [[-16, -16, 20], [0, 0, 4], [16, 16, 20]] : [[-8, 0, 0], [4, 0, 0], [9, 0, 0]];
  check(`fan computed matrices match technique at ${hover ? "hover" : "rest"}`, matrices.length === 3 && matrices.every((m, i) => {
    const [angle, x, y] = values[i], a = angle * Math.PI / 180;
    const expected = [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), x, y];
    return m.every((v, j) => Math.abs(v - expected[j]) < .00001);
  }));
}
async function f3Desktop(p) {
  check('Work has one card per project and no index numbers', await p.evaluate(count => document.querySelectorAll('#work .work-card').length === count && !document.querySelector('#work .index-number'), [...readFileSync('lib/content.ts', 'utf8').split('export const WORK: Project[] =')[1].split('export const CAR')[0].matchAll(/slug: /g)].length));
  await scrollTo(p, '#work', 100);
  check('desktop cards are 78svh with a 560px minimum', await p.$$eval('.work-card', cards => cards.every(card => Math.abs(card.getBoundingClientRect().height / new DOMMatrix(getComputedStyle(card).transform).a - Math.max(560, innerHeight * .78)) < 2)));
  const entry = await p.$eval('.work-card', el => el.getBoundingClientRect().top + scrollY);
  const clips = [];
  for (let i = 0; i < 8; i++) {
    await p.evaluate(({entry, i}) => window.__lenis.scrollTo(entry - innerHeight + innerHeight * .65 * i / 7, {immediate:true}), {entry, i});
    await sleep(100);
    clips.push(await p.$eval('.work-media-frame', el => getComputedStyle(el).clipPath));
  }
  check('first media morphs across eight entry samples', new Set(clips).size >= 6);
  console.log('WORK clips', clips);
  await scrollTo(p, '.work-card:nth-child(2)', 110);
  check('covered card reaches scale below .95', await p.$eval('.work-card', el => new DOMMatrix(getComputedStyle(el).transform).a <= .95));
  await p.setViewport({width:1000,height:900,deviceScaleFactor:1});
  await scrollTo(p, '.work-card:nth-child(2)', 240);
  await p.screenshot({path:join(tmpdir(),'claude/briefs/f11-work.png')});
  await p.setViewport({width:1440,height:900,deviceScaleFactor:1});  await scrollTo(p, ".other-band", 180);
  check('Other things has one accessible heading and a concise link name', await p.$eval('.other-band', el => el.getAttribute('aria-label') === el.querySelector('h2').getAttribute('aria-label') && el.querySelector('.card-fan').getAttribute('aria-hidden') === 'true' && el.querySelectorAll('h2:not([aria-hidden="true"])').length === 1));
  await p.mouse.move(1, 100);
  await sleep(450); await fanMatrices(p, false);
  await p.hover(".other-band");
  await sleep(500); await fanMatrices(p, true);
  check("Other things renders three typographic cards as a set", await p.$$eval(".fan-card", cards => cards.length === 3 && cards.every(card => card.classList.contains("fan-type") && !card.querySelector('img') && card.title.length > 0 && card.scrollHeight <= card.clientHeight && getComputedStyle(card).backgroundColor === getComputedStyle(cards[0]).backgroundColor)));
  await sharp(await p.screenshot()).resize({ width: 1000 }).toFile(join(tmpdir(), "claude/briefs/f3-fan.png"));

}
async function tachChecks(p) {
  await p.evaluate(() => window.__lenis.scrollTo(0, { immediate: true }));
  await sleep(1500);
  await p.evaluate(() => window.dispatchEvent(new Event('tach:probe')));
  await scrollTo(p, '.car-instrument', 120);
  check('tach performs its one start sweep', await p.evaluate(() => Math.max(...window.__tachSamples) > 115 && Math.abs(window.__tachSamples.at(-1) + 96) < 1));
  await tachScreenshots(p);
  await scrollTo(p, '.car-instrument', 120);
  const needleAngle = () => p.$eval('.tach-needle', el => parseFloat(el.style.transform.slice(7)));
  check('tach rests at 800 rpm within 1deg', Math.abs(await needleAngle() + 96) <= 1);
  await p.evaluate(() => {
    window.__tachPeak = -96;
    const until = performance.now() + 700;
    const sample = () => { window.__tachPeak = Math.max(window.__tachPeak, parseFloat(document.querySelector('.tach-needle').style.transform.slice(7))); if (performance.now() < until) requestAnimationFrame(sample); };
    requestAnimationFrame(sample); window.__lenis.scrollTo(window.scrollY - 160, { duration: .05 });
  });
  await sleep(700);
  check('onscreen tach responds to real Lenis scroll velocity', await p.evaluate(() => window.__tachPeak > -95));
  await p.waitForFunction(() => Math.abs(window.__lenis.velocity) < .001);
  await sleep(1500);
  check('tach returns within 2deg of idle in 1.5s', Math.abs(await needleAngle() + 96) <= 2);
  const flutter = await p.evaluate(() => new Promise(resolve => {
    const lenis = window.__lenis, descriptor = Object.getOwnPropertyDescriptor(lenis, 'velocity');
    Object.defineProperty(lenis, 'velocity', { configurable: true, get: () => 50, set: () => {} });
    window.dispatchEvent(new Event('scroll'));
    const start = performance.now(); let previous = -Infinity, fell = false, peak = -96;
    const sample = now => {
      const a = parseFloat(document.querySelector('.tach-needle').style.transform.slice(7));
      peak = Math.max(peak, a);
      if (now - start > 700 && a < previous - .05) fell = true;
      previous = a;
      if (now - start < 1600) requestAnimationFrame(sample);
      else { if (descriptor) Object.defineProperty(lenis, 'velocity', descriptor); else delete lenis.velocity; resolve({ fell, peak }); }
    }; requestAnimationFrame(sample);
  }));
  check('tach exceeds 4000 rpm during sustained fast Lenis velocity', flutter.peak > 0);
  check('tach limiter flutters while target stays above 7000 rpm', flutter.fell);
  await sleep(1500);
  await p.evaluate(() => window.__lenis.scrollTo(0, { immediate: true }));
  await sleep(1500);
  check('tach stops offscreen at idle', await p.$eval('.tach-needle', el => el.style.transform === 'rotate(-96deg)' && el.style.willChange === ''));
  await p.evaluate(() => { window.__tachSamples = []; window.dispatchEvent(new Event('tach:probe')); });
  await scrollTo(p, '.car-instrument', 120);
  check('tach start sweep happens only once', await p.evaluate(() => window.__tachSamples.length > 10 && window.__tachSamples.every(a => a === -96)));
  await p.evaluate(() => window.__lenis.scrollTo(0, { immediate: true }));
}
async function tachScreenshots(p) {
  for (const mode of ['day', 'night']) {
    await p.evaluate(mode => window.dispatchEvent(new CustomEvent('sky:mode', { detail: { mode } })), mode);
    await sleep(1950);
    if (mode === 'night') check('night tach numeral computes to E9x orange', await p.$eval('.tach-number', el => getComputedStyle(el).fill === 'rgb(255, 140, 46)'));
    await p.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 });
    await scrollTo(p, '.car-instrument', 120);
    await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f35-tach-' + mode + '.png') });
    await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  }
}
async function sphereChecks(p) {
  // Leave the prior Work hover so this measures idle spin rather than pill hover pause.
  await p.mouse.move(1, 100);
  await scrollTo(p, "[data-sphere]");
  const names = [...readFileSync("lib/content.ts", "utf8").split("export const SKILLS =")[1].split("export const SERVICES")[0].matchAll(/name: "([^"]+)", slug: "([^"]+)"/g)].map(match => match[1]);
  const expected = names.length;
  const snapshot = () => p.evaluate(() => ({ count: document.querySelectorAll("[data-sphere-item]").length, nodes: document.querySelectorAll("*").length, transform: document.querySelector("[data-sphere-item]").style.transform }));
  const before = await snapshot();
  await sleep(3000);
  const after = await snapshot();
  check("sphere count equals SKILLS items with logos", before.count === expected && after.count === expected);
  check('globe has no visible text and every logo has an accessible name and title', await p.$$eval('[data-sphere-item]', (logos, names) => logos.every((logo, i) => logo.textContent.trim() === '' && logo.getAttribute('aria-label') === names[i] && logo.title === names[i] && !logo.closest('[aria-hidden="true"]')), names));
  check('globe has 42px desktop or 32px phone colour logos without pills or borders', await p.$$eval('[data-sphere-item]', logos => logos.every(logo => {
    const style = getComputedStyle(logo), icon = getComputedStyle(logo.querySelector('.skill-icon'));
    return style.borderWidth === '0px' && style.backgroundColor === 'rgba(0, 0, 0, 0)' && icon.width === (innerWidth < 720 ? '32px' : '42px') && icon.maskImage !== 'none' && icon.backgroundColor !== 'rgba(0, 0, 0, 0)';
  }) && new Set(logos.map(logo => getComputedStyle(logo.querySelector('.skill-icon')).backgroundColor)).size > 3));
  check('SQL stays in the list and off the globe', await p.evaluate(() => [...document.querySelectorAll('.skills-list li')].some(li => li.textContent === 'SQL') && !document.querySelector('[data-sphere-item][aria-label="SQL"]')));
  const colours = JSON.parse(readFileSync('lib/skill-colors.ts', 'utf8').split('= ')[1].replace(/;\s*$/, ''));
  check('logo colours follow 3:1 contrast against night ground', await p.$$eval('[data-sphere-item]', (logos, colours) => logos.every(logo => {
    const hex = colours[logo.dataset.slug];
    const channels = [0,2,4].map(i => parseInt(hex.slice(i,i+2),16)/255).map(c => c <= .04045 ? c/12.92 : ((c+.055)/1.055)**2.4);
    const probe = document.createElement('span');
    probe.style.color = (channels[0]*.2126 + channels[1]*.7152 + channels[2]*.0722 + .05) / (.00251 + .05) < 3 ? 'var(--ink)' : '#'+hex;
    document.body.append(probe); const colour = getComputedStyle(probe).color; probe.remove();
    return getComputedStyle(logo.querySelector('.skill-icon')).backgroundColor === colour;
  }), colours));
  check('TypeScript and Kotlin retain their brand fills', await p.evaluate(() => getComputedStyle(document.querySelector('[data-slug="typescript"] .skill-icon')).backgroundColor === 'rgb(49, 120, 198)' && getComputedStyle(document.querySelector('[data-slug="kotlin"] .skill-icon')).backgroundColor === 'rgb(127, 82, 255)'));
  check('unselected globe depth opacity stays between .45 and 1', await p.$$eval('[data-sphere-item]', logos => logos.every(logo => +logo.style.opacity >= .45 && +logo.style.opacity <= 1)));
  check("sphere DOM stays flat over 3s idle spin", Math.abs(after.nodes - before.nodes) <= 5 && before.transform !== after.transform);
  await p.$eval('.skills-list button', el => el.click());
  await sleep(800);
  const held = await p.evaluate(async () => {
    const el = document.querySelector('[data-sphere]'), r = el.getBoundingClientRect();
    const event = (type, x) => el.dispatchEvent(new PointerEvent(type, { pointerId: 91, clientX: x, clientY: r.top + 200, bubbles: true }));
    // Synthetic pointers cannot acquire native capture, so isolate that platform call.
    const capture = el.setPointerCapture; el.setPointerCapture = () => {};
    event('pointerdown', r.left + 200); event('pointermove', r.left + 240);
    await new Promise(resolve => setTimeout(resolve, 500));
    const before = getComputedStyle(document.querySelector('[data-sphere-item]')).transform;
    event('pointerup', r.left + 240); el.setPointerCapture = capture;
    await new Promise(resolve => setTimeout(resolve, 100));
    return { before, after: getComputedStyle(document.querySelector('[data-sphere-item]')).transform };
  });
  check('held globe drag releases without stale horizontal fling', await p.evaluate(held => Math.abs(new DOMMatrix(held.before).e - new DOMMatrix(held.after).e) < .1, held));
  await p.keyboard.press('Escape');
  await p.$eval('.skills-list button', el => el.click());
  await sleep(750);
  check('pressed group highlights its pills and caps the others', await p.evaluate(() => {
    const button = document.querySelector('.skills-list button'), accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const probe = document.createElement('span'); probe.style.color = accent; document.body.append(probe); const colour = getComputedStyle(probe).color; probe.remove();
    return button.getAttribute('aria-pressed') === 'true' && [...document.querySelectorAll('[data-sphere-item]')].every(pill => pill.dataset.group === '0' ? getComputedStyle(pill, '::after').borderColor === colour && getComputedStyle(pill, '::after').borderWidth === '1px' && +pill.style.opacity === 1 : +pill.style.opacity <= .3);
  }));
  await p.keyboard.press('Escape');
  check('Escape clears the selected group', await p.$$eval('.skills-list button', buttons => buttons.every(button => button.getAttribute('aria-pressed') === 'false')));
  await p.$eval('.skills-list button', el => { el.click(); el.click(); });
  check('pressing a group twice clears it', await p.$eval('.skills-list button', el => el.getAttribute('aria-pressed') === 'false'));
  if (await p.evaluate(() => innerWidth > 700)) {
    await p.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 });
    await scrollTo(p, '[data-sphere]', 200);
    await p.$eval('.skills-list button', el => el.click()); await sleep(750);
    await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f8-globe.png') });
    await p.keyboard.press('Escape');
    await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  }
  await p.evaluate(() => window.__lenis.scrollTo(0, { immediate: true }));
  await sleep(200);
  const stopped = await snapshot();
  await sleep(200);
  check("sphere stops offscreen", stopped.transform === (await snapshot()).transform);
}
async function sphereVisibilityCheck(p) {
  await scrollTo(p, "[data-sphere]");
  // A synthetic visibility event also resets the sky's adaptive budget.
  // Keep this isolated lifecycle test after normal scroll measurements.
  await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  const hidden = await p.$eval("[data-sphere-item]", el => el.style.transform);
  await sleep(200);
  check("sphere stops when document is hidden", hidden === await p.$eval("[data-sphere-item]", el => el.style.transform));
  await p.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
}
async function skyPixels(p) {
  await p.evaluate(() => {
    document.querySelector("main").style.visibility = "hidden";
    document.querySelector(".chrome").style.visibility = "hidden";
  });
  const buffer = await p.screenshot();
  await p.evaluate(() => {
    document.querySelector("main").style.visibility = "";
    document.querySelector(".chrome").style.visibility = "";
  });
  return sharp(buffer).raw().toBuffer({ resolveWithObject: true });
}
async function schoolChecks() {
  const p = await page({ width: 1000, height: 900, deviceScaleFactor: 1 });
  const response = await p.goto(new URL('/school', url).href, { waitUntil: 'networkidle0' });
  check('/school returns 200 with its heading', response.status() === 200 && await p.$eval('h1', el => el.getAttribute('aria-label') === 'University of Calgary'));
  await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
  await sleep(1100);
  check('School uses night sky and the shared chrome', await p.evaluate(() => document.documentElement.dataset.mode === 'night' && !!document.querySelector('.chrome') && !!document.querySelector('.sky')));
  check('School has four facts, three sections, supplied courses and a back link', await p.evaluate(() => document.querySelectorAll('.page-facts > div').length === 4 && document.querySelectorAll('.school-section-row').length === 3 && document.querySelectorAll('.school-course-row li').length === 14 && document.querySelector('.back-link').getAttribute('href') === '/'));
  const hasCourseGrade = text => [...text.matchAll(/\b[A-Z]{2,5}\s*\d{3}\b/g)].some(code => {
    const before = text.slice(0, code.index).trim().replace(/[:|,]\s*$/, '').trim().split(/\s+/).at(-1) ?? '';
    const after = text.slice(code.index + code[0].length).trim().replace(/^[:|,-]\s*/, '').split(/\s+/)[0] ?? '';
    return [before, after].some(token => { token = token.replace(/^[(),|:]+|[(),|:]+$/g, ''); return /^[A-DF][+-]?$/.test(token) && /\b[A-DF][+-]?\b/.test(token); });
  });
  check('school grade guard catches adjacent grades and preserves real course titles', ['CPSC 331 A', 'CPSC331: B+', 'A- | CPSC 331', 'CPSC 331 (F)'].every(hasCourseGrade) && ['CPSC 331 Data Structures, Algorithms and Analysis', 'CPSC 365 C++ Programming', 'CPSC 413 Design and Analysis of Algorithms'].every(text => !hasCourseGrade(text)));
  const schoolText = await p.$eval('main', el => el.innerText);
  check('/school text has no GPA', !/GPA/i.test(schoolText));
  check('/school text has no letter grade beside a course code', !hasCourseGrade(schoolText));
  await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f5-school.png') });
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  check('School phone layout has no overflow', await p.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  await p.close();
}
async function contactChecks(p) {
  await scrollTo(p, '#contact', 100);
  check('Contact has supplied heading, separate mailto and three social links', await p.evaluate(() => document.querySelector('#contact-heading').getAttribute('aria-label') === "Let's build something" && document.querySelector('.contact-mailto').href === 'mailto:adnanshakib.business@gmail.com' && document.querySelectorAll('.contact-socials a').length === 3 && document.querySelectorAll('.site-footer > *').length === 3));
  await p.evaluate(() => { window.__copiedEmail = ''; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.__copiedEmail = value; } } }); });
  await p.click('.email-copy');
  check('copy email writes the address and swaps to Copied', await p.evaluate(() => window.__copiedEmail === 'adnanshakib.business@gmail.com' && document.querySelector('.email-copy').textContent === 'Copied'));
  await sleep(2100);
  check('Copied resets to the email', await p.$eval('.email-copy', el => el.textContent === 'adnanshakib.business@gmail.com'));
  await p.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('denied'); }; });
  await p.click('.email-copy');
  check('clipboard failure never claims Copied and keeps mailto available', await p.evaluate(() => document.querySelector('.email-copy').textContent !== 'Copied' && !!document.querySelector('.contact-mailto')));
  await scrollTo(p, '.glyph-pit', 180);
  await sleep(2200);
  check('nine glyphs settle and stop their loop', await p.evaluate(() => document.querySelectorAll('.falling-glyph').length === 9 && document.querySelector('.glyph-pit').dataset.running === 'false'));
  for (const mode of ['day', 'night']) {
    await p.evaluate(mode => { document.documentElement.dataset.mode = mode; }, mode);
    await p.hover('.email-copy');
    check('all accent buttons clear 4.5:1 in ' + mode, await p.evaluate(() => {
      const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
      const lum = c => c.map(n => { n /= 255; return n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4; }).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
      const probe = document.createElement('span'); document.body.append(probe);
      probe.style.color = 'var(--bg)'; const bg = getComputedStyle(probe).color;
      probe.style.color = 'var(--accent)'; const accent = getComputedStyle(probe).color; probe.remove();
      return [...document.querySelectorAll('button, .contact-pill')].every(el => {
        const s = getComputedStyle(el); if (s.color !== accent && s.backgroundColor !== accent) return true;
        const a = lum(rgb(s.color)), b = lum(rgb(s.backgroundColor === 'rgba(0, 0, 0, 0)' ? bg : s.backgroundColor));
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5;
      });
    }));
  }
  await p.evaluate(() => { document.documentElement.dataset.mode = 'night'; });
  await p.setViewport({ width: 1000, height: 1200, deviceScaleFactor: 1 });
  await scrollTo(p, '#contact', 80); await sleep(1000);
  await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f8-contact.png') });
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
}
async function projectChecks() {
  const projects = [...readFileSync('lib/content.ts', 'utf8').split('export const WORK: Project[] =')[1].split('export const CAR')[0].matchAll(/slug: "([^"]+)"/g)].map(match => match[1]);
  const p = await page({ width: 1000, height: 900, deviceScaleFactor: 1 });
  await p.goto(new URL('/work', url).href, { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
  check('/work has the shared project index and smaller builds', await p.evaluate(count => document.querySelectorAll('.work-card').length === count && document.querySelectorAll('.smaller-row').length === 3 && document.querySelectorAll('h1').length === 1, projects.length));
  for (let i = 0; i < projects.length; i++) {
    const response = await p.goto(new URL('/work/' + projects[i], url).href, { waitUntil: 'networkidle0' });
    await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
    check(projects[i] + ' returns its static project page and wrapping next link', response.status() === 200 && await p.evaluate(({ slug, next }) => document.querySelector('main').dataset.project === slug && document.querySelectorAll('.project-meta li').length === 4 && document.querySelectorAll('.project-does li').length >= 3 && document.querySelector('.next-project').getAttribute('href') === '/work/' + next, { slug: projects[i], next: projects[(i + 1) % projects.length] }));
    if (projects[i] === 'fittrack') check('FitTrack uses supplied status while its live link is withheld', await p.evaluate(() => !document.querySelector('.project-meta a') && document.querySelector('.project-meta li:last-child').textContent === 'Live'));
    await sweepPage(p);
    check(projects[i] + ' project imagery loads and missing imagery renders nothing', await p.evaluate(() => [...document.querySelectorAll('.project-page img')].every(image => image.complete && image.naturalWidth > 0) && (!document.querySelector('.project-cover') || !!document.querySelector('.project-cover img'))));
    if (projects[i] === 'totaltex-web') {
      await p.evaluate(() => window.__lenis.scrollTo(0, { immediate: true })); await sleep(1100);
      await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f8-work-page.png') });
    }
    await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    check(projects[i] + ' project phone layout has no overflow', await p.evaluate(() => document.documentElement.scrollWidth === innerWidth));
    await p.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 });
  }
  check('unknown project returns 404', (await fetch(new URL('/work/not-a-project', url))).status === 404);
  await p.close();
}
async function transitionChecks() {
  const p = await page();
  await p.goto(new URL('/work', url).href, { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
  await p.evaluate(() => {
    window.__wipe = { frames: [], phases: [], violations: [], shifts: 0, started: 0, covered: 0, ready: 0, revealed: 0, changed: false, coverScroll: 0 };
    const w = window.__wipe;
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) w.shifts += entry.value; }).observe({ type: 'layout-shift' });
    new MutationObserver(() => {
      if (!document.querySelector('[data-project="puzzled"]') || w.changed) return;
      w.changed = true;
      const panel = document.querySelector('.route-panel'), r = panel.getBoundingClientRect();
      if (panel.hidden || r.top > .5 || r.bottom < innerHeight - .5 || getComputedStyle(panel).opacity !== '1') w.violations.push('new route committed before cover');
    }).observe(document.querySelector('.route-content'), { childList: true, subtree: true });
    for (const [event, key] of [['route:wipe-start', 'started'], ['route:covered', 'covered'], ['route:ready', 'ready'], ['route:revealed', 'revealed']]) window.addEventListener(event, () => { w[key] = performance.now(); if (key === 'covered') w.coverScroll = scrollY; });
    let last = 0;
    const sample = now => {
      const phase = document.documentElement.dataset.transition;
      if (phase) { if (last) w.frames.push(now - last); last = now; w.phases.push(phase); }
      if (!w.revealed) requestAnimationFrame(sample);
    }; requestAnimationFrame(sample);
  });
  await scrollTo(p, '.work-card:first-child', 120); await p.evaluate(() => { window.__wipe.initialScroll = scrollY; window.__wipe.shifts = 0; }); await p.click('.work-pill');
  await p.waitForFunction(() => window.__wipe.revealed > 0);
  const wipe = await p.evaluate(() => window.__wipe);
  check('new project stays covered until its route commits', wipe.changed && wipe.violations.length === 0 && wipe.phases.includes('covering') && wipe.phases.includes('revealing'));
  check('wipe uses a 600ms cover and 700ms reveal', wipe.covered - wipe.started >= 580 && wipe.covered - wipe.started < 850 && wipe.revealed - wipe.ready >= 680 && wipe.revealed - wipe.ready < 900);
  check('wipe preserves scroll until cover and has no layout shift', wipe.coverScroll === wipe.initialScroll && wipe.shifts === 0);
  wipe.frames.sort((a, b) => a - b);
  const p95 = wipe.frames[Math.ceil(wipe.frames.length * .95) - 1];
  console.log('WIPE p95=' + p95.toFixed(3) + 'ms'); check('wipe p95 is at most 16.7ms', p95 <= 16.7);
  check('heading line rises only after the panel exits', await p.evaluate(() => document.querySelector('h1').classList.contains('route-heading-rise') && !document.querySelector('h1').classList.contains('route-heading-armed') && document.querySelector('.route-panel').hidden && scrollY === 0 && !document.querySelector('.route-content').inert));
  await p.goBack({ waitUntil: 'networkidle0' });
  check('Back skips the panel', await p.evaluate(() => location.pathname === '/work' && document.querySelector('.route-panel').hidden && !document.documentElement.dataset.transition));
  await p.goForward({ waitUntil: 'networkidle0' });
  check('Forward skips the panel', await p.evaluate(() => location.pathname === '/work/puzzled' && document.querySelector('.route-panel').hidden && !document.documentElement.dataset.transition));
  await p.click('.chrome-nav a[href="/school"]');
  await p.waitForFunction(() => location.pathname === '/school' && !document.documentElement.dataset.transition);
  check('School uses the shared wipe', await p.$eval('h1', el => el.classList.contains('route-heading-rise')));
  await p.click('.back-link');
  await p.waitForFunction(() => location.pathname === '/' && !document.documentElement.dataset.transition);
  check('Home uses the shared wipe and restores the top', await p.evaluate(() => document.querySelector('h1').classList.contains('route-heading-rise') && scrollY === 0));
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.waitForFunction(() => !document.querySelector('.route-panel'));
  await p.click('.chrome-nav a[href="/school"]');
  await p.waitForFunction(() => location.pathname === '/school');
  check('reduced route navigation has no panel or heading animation', await p.evaluate(() => !document.querySelector('.route-panel') && !document.documentElement.dataset.transition && getComputedStyle(document.querySelector('h1 .section-line > span')).animationName === 'none'));
  await p.close();
}
async function clockChecks() {
  const p = await page({ width: 1000, height: 900, deviceScaleFactor: 1 });
  await p.evaluateOnNewDocument(() => {
    window.__clockTime = Date.parse('2026-10-10T00:00:30.250Z');
    const RealDate = Date;
    window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : [window.__clockTime])); } static now() { return window.__clockTime; } };
    window.__clockTimers = new Map();
    const set = window.setTimeout.bind(window), clear = window.clearTimeout.bind(window);
    window.setTimeout = (callback, delay, ...args) => { const id = set(callback, delay, ...args); if (delay === 29750) window.__clockTimers.set(id, delay); return id; };
    window.clearTimeout = id => { window.__clockTimers.delete(id); return clear(id); };
  });
  await p.goto(url, { waitUntil: 'networkidle0' });
  await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
  for (const offset of [0, 12]) {
    await p.evaluate(offset => { window.__clockTime = Date.parse('2026-10-10T00:00:30.250Z') + offset * 3600000; document.dispatchEvent(new Event('visibilitychange')); }, offset);
    if (offset) {
      await sleep(300);
      check('clock figures crossfade over 600ms', await p.$$eval('.chrome-bottom .clock-figure', figures => figures.every(figure => {
        const sun = getComputedStyle(figure.querySelector('.clock-sun')), moon = getComputedStyle(figure.querySelector('.clock-moon'));
        return sun.transitionDuration === '0.6s' && +sun.opacity > 0 && +sun.opacity < 1 && +moon.opacity > 0 && +moon.opacity < 1;
      })));
      await sleep(350);
    } else await sleep(650);
    check('both clocks use 12 hour digits and AM/PM at fake UTC hour ' + offset, await p.$$eval('.chrome-bottom .clock', clocks => clocks.length === 2 && clocks.every(clock => {
      const digits = clock.querySelector('.clock-digits').textContent, period = clock.querySelector('.clock-period').textContent;
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: clock.dataset.zone, hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(new Date());
      const value = type => parts.find(part => part.type === type).value;
      return /^\d{1,2}:\d{2}$/.test(digits) && Number(digits.split(':')[0]) <= 12 && !digits.startsWith('0') && /^(AM|PM)$/.test(period) && digits === value('hour') + ':' + value('minute') && period === value('dayPeriod') && clock.getAttribute('aria-label') === clock.querySelector('.clock-city').textContent + ', ' + digits + ' ' + period;
    })));
    check('each clock shows its correct single sun or moon at fake UTC hour ' + offset, await p.$$eval('.chrome-bottom .clock', clocks => clocks.every(clock => {
      const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: clock.dataset.zone, hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
      const day = hour >= 6 && hour < 18, figure = clock.querySelector('.clock-figure');
      return clock.querySelectorAll('.clock-figure').length === 1 && figure.dataset.day === String(day) && getComputedStyle(figure.querySelector('.clock-sun')).opacity === (day ? '1' : '0') && getComputedStyle(figure.querySelector('.clock-moon')).opacity === (day ? '0' : '1');
    })));
  }
  check('intro and chrome share one minute-boundary timer with scoped wall-clock phase', await p.evaluate(() => window.__clockTimers.size === 1 && [...document.querySelectorAll('.clocks')].every(el => el.style.getPropertyValue('--clock-phase') === '-250ms') && !document.documentElement.style.getPropertyValue('--clock-phase')));
  check('clock sync restarts the CSS colon at its wall-clock phase', await p.evaluate(() => {
    const colon = document.querySelector('.chrome-bottom .clock-colon');
    const before = getComputedStyle(colon).animationName;
    document.dispatchEvent(new Event('visibilitychange'));
    const after = getComputedStyle(colon).animationName;
    return before !== after && /^clock-colon-[ab]$/.test(after) && colon.getAnimations()[0].currentTime < 50;
  }));
  check('desktop figures have a physical 5px sun disc and eight 1.5px rays', await p.$$eval('.chrome-bottom .clock-figure', figures => figures.every(figure => figure.viewBox.baseVal.width === 16 && getComputedStyle(figure).width === '16px' && figure.querySelector('.clock-sun > circle').r.baseVal.value === 5 && figure.querySelectorAll('.clock-rays line').length === 8 && getComputedStyle(figure.querySelector('.clock-rays')).strokeWidth === '1.5px')));
  const other = await page(); await other.bringToFront(); await sleep(200);
  check('clock motion pauses when document is hidden', await p.evaluate(() => document.hidden && document.documentElement.classList.contains('clock-paused') && [...document.querySelectorAll('.clock-rays, .clock-star, .clock-colon')].every(el => getComputedStyle(el).animationPlayState === 'paused')));
  await other.close(); await p.bringToFront();
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  check('reduced chrome has no running animations and a solid colon', await p.evaluate(() => document.querySelector('.chrome-bottom').getAnimations({ subtree: true }).every(animation => animation.playState !== 'running') && [...document.querySelectorAll('.clock-colon')].every(el => getComputedStyle(el).animationName === 'none' && getComputedStyle(el).opacity === '1')));
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  check('phone clock figures are 14px with no overflow', await p.evaluate(() => [...document.querySelectorAll('.clock-figure')].every(el => getComputedStyle(el).width === '14px') && document.documentElement.scrollWidth === innerWidth));
  await p.close();
  const capture = await page({ width: 1000, height: 900, deviceScaleFactor: 1 });
  await capture.goto(url, { waitUntil: 'networkidle0' }); await capture.waitForFunction(() => document.documentElement.dataset.intro === 'done'); await sleep(1000);
  const png = await capture.screenshot({ path: join(tmpdir(), 'claude/briefs/f8-clocks.png') });
  await sharp(png).extract({ left: 0, top: 800, width: 1000, height: 100 }).toFile(join(tmpdir(), 'claude/briefs/f7-clocks.png'));
  await capture.close();
}
async function scrimChecks() {
  const p = await page({ width: 1000, height: 900, deviceScaleFactor: 1 });
  await p.goto(url, { waitUntil: 'networkidle0' }); await p.waitForFunction(() => document.documentElement.dataset.intro === 'done');
  await sweepPage(p);
  // Place photography and specs beneath the fixed clocks, then measure painted pixels.
  await p.evaluate(() => { const image = document.querySelector('.car-bay'); window.__lenis.scrollTo(image.getBoundingClientRect().top + scrollY - 760, { immediate: true }); });
  for (const mode of ['night', 'day']) {
    await p.evaluate(mode => { document.documentElement.dataset.mode = mode; window.dispatchEvent(new CustomEvent('sky:mode', { detail: { mode } })); }, mode);
    await sleep(1100);
    check('bottom scrim is fixed, 96px, inert and themed in ' + mode, await p.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.chrome-bottom'), '::before');
      return style.position === 'fixed' && style.height === '96px' && style.pointerEvents === 'none' && style.backgroundImage.startsWith('linear-gradient') && style.backgroundImage.includes('0.85');
    }));
    const text = await p.evaluate(() => {
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      return [...document.querySelectorAll('.chrome-bottom .clock-city, .chrome-bottom .clock-digits > span:first-child, .chrome-bottom .clock-digits > span:last-child, .chrome-bottom .clock-period, .chrome-bottom .availability')].map(el => {
        const r = el.getBoundingClientRect(); ctx.fillStyle = getComputedStyle(el).color; ctx.fillRect(0, 0, 1, 1);
        return { x: r.left, y: r.top, width: r.width, height: r.height, rgb: Array.from(ctx.getImageData(0, 0, 1, 1).data).slice(0, 3) };
      });
    });
    check('E92 photo is painted directly beneath the clocks in ' + mode, await p.evaluate(() => {
      const image = document.querySelector('.car-bay img'), r = image.getBoundingClientRect(), clocks = document.querySelector('.chrome-bottom').getBoundingClientRect();
      return image.naturalWidth > 0 && r.top < clocks.top && r.bottom > clocks.bottom;
    }));
    await p.$$eval('.chrome-bottom > *', nodes => nodes.forEach(node => { node.style.visibility = 'hidden'; }));
    const { data, info } = await sharp(await p.screenshot()).raw().toBuffer({ resolveWithObject: true });
    await p.$$eval('.chrome-bottom > *', nodes => nodes.forEach(node => { node.style.visibility = ''; }));
    const lum = rgb => rgb.map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    let minimum = Infinity;
    for (const rect of text) for (let y = Math.max(0, Math.floor(rect.y)); y < Math.min(info.height, Math.ceil(rect.y + rect.height)); y++) for (let x = Math.max(0, Math.floor(rect.x)); x < Math.min(info.width, Math.ceil(rect.x + rect.width)); x++) {
      const i = (y * info.width + x) * info.channels, bg = lum([data[i], data[i + 1], data[i + 2]]), fg = lum(rect.rgb);
      minimum = Math.min(minimum, (Math.max(bg, fg) + .05) / (Math.min(bg, fg) + .05));
    }
    console.log('CHROME ' + mode + ' minimum photographed contrast=' + minimum.toFixed(2) + ':1');
    check('chrome city, digits, AM/PM and availability clear 4.5:1 over E92 pixels in ' + mode, minimum >= 4.5);
    await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f8-e92-scrim-' + mode + '.png') });
  }
  await p.close();
}
try {
  const firstPaint = await page();
  await firstPaint.evaluateOnNewDocument(() => {
    localStorage.setItem('sky', 'day');
    const RealDate = Date;
    window.Date = class extends RealDate {
      constructor(...args) { super(...(args.length ? args : ['2026-10-10T18:00:00Z'])); }
    };
    window.__loadModes = [];
    new MutationObserver(() => {
      const mode = document.documentElement?.dataset.mode;
      if (mode) window.__loadModes.push(mode);
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mode'] });
  });
  await firstPaint.goto(url, { waitUntil: 'networkidle0' });
  check('Calgary noon with stored day starts night before first paint', await firstPaint.evaluate(() =>
    new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Edmonton', hour: '2-digit', hourCycle: 'h23' }).format(new Date()) === '12' &&
    localStorage.sky === 'day' && window.__loadModes.length > 0 && window.__loadModes.every(mode => mode === 'night') && document.documentElement.dataset.mode === 'night'));
  check('bottom chrome contains no tach', await firstPaint.$('.chrome-bottom .tach') === null);
  await firstPaint.close();
  const p = await page();
  await p.goto(url, { waitUntil: "domcontentloaded" });
  check("visible real Chrome before measurement", await p.evaluate(() => document.hidden === false));
  await p.waitForFunction(() => Number(document.querySelector(".intro-counter")?.dataset.value) >= 58, { timeout: 6000 });
  await sharp(await p.screenshot()).resize({ width: 1000 }).toFile(join(tmpdir(), "claude/briefs/f2-intro.png"));
  check("identity", await p.$eval("h1", (el) => el.getAttribute("aria-label") === "Systems with taste"));
  await p.waitForFunction(() => document.documentElement.dataset.intro === "done", { timeout: 6000 });
  await sleep(1100);
  const info = await p.evaluate(() => ({
    hidden: document.hidden, done: window.__f1.done, sky: document.documentElement.dataset.sky,
    font: getComputedStyle(document.querySelector("h1")).fontFamily,
    body: getComputedStyle(document.body).fontFamily,
    size: getComputedStyle(document.querySelector("h1")).fontSize,
    wdth: getComputedStyle(document.querySelector("h1")).fontVariationSettings,
    width: document.documentElement.scrollWidth, viewport: innerWidth,
    counter: document.querySelector(".intro-counter").dataset.value,
    canvas: document.querySelector(".sky canvas")?.width,
    mode: document.documentElement.dataset.mode,
  }));
  console.log(info);
  check("visible real Chrome", !info.hidden);
  check("single intro completion", info.done === 1);
  if (await p.$('.tach-needle')) check('tach stays idle before car enters view', await p.$eval('.tach-needle', el => parseFloat(el.style.transform.slice(7)) === -96));
  check("counter reaches 100", info.counter === "100");
  const intro = await p.evaluate(() => ({ samples: window.__introSamples, timing: window.__f1.doneAt - window.__f1.partAt,
    ...window.__f1.halves, height: innerHeight }));
  check("intro samples every 50ms contain no zero or padding", intro.samples.length > 20 && intro.samples.some(s => s.text === "100") && intro.samples.every(s => !/^0/.test(s.text) && !/^0/.test(s.rendered)));
  check("intro starts blank", intro.samples[0].text === "" && intro.samples[0].scale === 0);
  check("intro at 100 has three exact 2px stripe colours", intro.samples.some(s => s.text === "100" && s.stripe?.length === 3 && s.stripe.every((band, i) => band.height === 2 && band.colour === ["rgb(108, 178, 228)", "rgb(27, 79, 160)", "rgb(231, 34, 46)"][i])));
  check("intro stripe separates to 3px gaps", intro.samples.some(s => s.stripe && Math.abs(s.stripe[0].y + 5) < .01 && Math.abs(s.stripe[1].y) < .01 && Math.abs(s.stripe[2].y - 5) < .01));
  check("horizon grows monotonically", intro.samples.every((s, i, a) => i === 0 || s.scale >= a[i - 1].scale - .000001) && intro.samples.at(-1).scale === 1);
  check("both halves end off screen", intro.top <= 0 && intro.bottom >= intro.height);
  check("headline event 700ms into part", intro.timing >= 640 && intro.timing <= 740);
  check("live WebGL canvas", info.sky === "webgl" && info.canvas >= 1080 && info.canvas <= 1440);
  check("exact display typography", info.font.includes("Archivo") && info.wdth.includes("125") && parseFloat(info.size) === 165.6);
  check("Instrument body", info.body.includes("Instrument"));
  check("no horizontal overflow", info.width === info.viewport);
  await heroBounds(p);

  await p.evaluate(() => window.dispatchEvent(new CustomEvent("sky:mode", { detail: { mode: "day" } })));
  await sleep(1950);
  await sharp(await p.screenshot()).resize({ width: 1000 }).toFile(join(tmpdir(), "claude/briefs/f2-hero.png"));
  const day = await skyPixels(p);
  let low = 255, high = 0;
  for (let i = 0; i < day.data.length; i += day.info.channels) { low = Math.min(low, day.data[i]); high = Math.max(high, day.data[i]); }
  check("paper grain paints", high > low && low > 225);
  await p.click(".sky-toggle");
  check("tokens stay day at sweep start", await p.evaluate(() => document.documentElement.dataset.mode === "day"));
  await sleep(600);
  check("tokens swap at sweep midpoint", await p.evaluate(() => document.documentElement.dataset.mode === "night"));
  await sleep(1350);
  const night = await skyPixels(p);
  let bright = 0;
  for (let i = 0; i < night.data.length; i += night.info.channels) if (night.data[i] > 80) bright++;
  check("night stars and band paint", bright > 100 && bright < night.info.width * night.info.height * .25);
  await p.mouse.move(200, 500);
  for (let x = 220; x < 950; x += 30) await p.mouse.move(x, 500);
  await sleep(100);
  const trail = await skyPixels(p);
  check("fluid changes painted sky", !night.data.equals(trail.data));
  await p.evaluate(() => window.__lenis.scrollTo(900, { immediate: true }));
  await sleep(150);
  check("scroll reaches sky shader", await p.evaluate(() => window.__f1.scroll >= 899));
  // 2026-10-10: blur no longer pauses (it froze the sky on a visible second
  // screen and froze this harness whenever its window lost focus).
  await p.evaluate(() => window.dispatchEvent(new Event("blur")));
  const blurred = await p.evaluate(() => window.__f1.renders);
  await sleep(250);
  check("sky keeps rendering on blur", await p.evaluate((count) => window.__f1.renders > count, blurred));
  await f3Desktop(p);
  const headingTop = await p.$eval('#taste-heading', el => el.closest('section').getBoundingClientRect().top + scrollY);
  await p.evaluate(y => window.__lenis.scrollTo(y - innerHeight * .7, {immediate:true}), headingTop); await sleep(150);
  const headingBefore = await p.$eval('#taste .t-display-l', el => getComputedStyle(el).transform);
  await p.evaluate(y => window.__lenis.scrollTo(y, {immediate:true}), headingTop); await sleep(150);
  check('display heading parallaxes within its pass', headingBefore !== await p.$eval('#taste .t-display-l', el => getComputedStyle(el).transform));
  check('section hairline reaches full width', await p.$eval('#taste-heading', el => new DOMMatrix(getComputedStyle(el.parentElement.querySelector('.section-hairline')).transform).a === 1));
  await scrollTo(p, '.work-card:first-child', 100);
  const pill = await p.$eval('.work-pill', el => { const r = el.getBoundingClientRect(); return {x:r.right-1,y:r.bottom-1}; });
  await p.mouse.move(pill.x,pill.y); await sleep(400);
  check('magnetic pull is bounded to 8px', await p.$eval('.work-pill', el => {const m=new DOMMatrix(getComputedStyle(el).transform); return Math.hypot(m.e,m.f)<=8.01 && Math.hypot(m.e,m.f)>0;}));
  check('tach lives only in E92, with nine spec rows after Info', await p.evaluate(() => document.querySelectorAll('#e92 .tach').length === 1 && document.querySelectorAll('#e92 .car-specs > div').length === 9 && document.querySelector('#info').nextElementSibling.id === 'e92' && !document.querySelector('.chrome .tach')));
  await tachChecks(p);
  await sphereChecks(p);
  await contactChecks(p);
  for (const [id, heading] of [['taste', 'Taste'], ['method', 'How I work'], ['info', 'Info']]) check(id + ' section has its heading', await p.$eval('#' + id + ' h2', (el, heading) => el.textContent === heading, heading));
  check('Info has its bio and lists without a car block or portrait placeholder', await p.evaluate(() => document.querySelectorAll('#info .info-lists > div').length === 3 && document.querySelector('#info .info-bio').textContent.length > 0 && !document.querySelector('#info img, #info .tach, #info .car-block')));
  check('Questions is absent while FAQ copy is empty', await p.$('#questions') === null);
  await sweepPage(p);
  check('all three E92 images loaded after scrolling', await p.$$eval('#e92 .car-images img', images => images.length === 3 && images.every(image => image.naturalWidth > 0)));
  check('E92 stripe reveals along its top edge', await p.$eval('.e92-stripe', el => getComputedStyle(el).clipPath === 'inset(0px)' && getComputedStyle(el).top === '0px'));
  await p.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 });
  await scrollTo(p, '#e92', 60);
  await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f5-e92.png') });
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await frameBudget(p, 1);
  await frameBudget(p, 4);
  await frameBudget(p, 1, true);
  await frameBudget(p, 4, true);
  await sphereVisibilityCheck(p);
  await p.reload({ waitUntil: "networkidle0" });
  check("session intro skips once", await p.evaluate(() => window.__f1.done === 1 && document.querySelector(".intro").hidden));
  await p.close();

  const mobile = await page({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mobile.goto(url, { waitUntil: "networkidle0" });
  check("visible phone before measurement", await mobile.evaluate(() => document.hidden === false));
  await mobile.waitForFunction(() => document.documentElement.dataset.intro === "done", { timeout: 6000 });
  await sleep(1100);
  check("coarse DPR cap", await mobile.$eval(".sky canvas", (canvas) => canvas.width <= 488));
  check("phone no overflow", await mobile.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  await heroBounds(mobile);
  await scrollTo(mobile, '.work-card:nth-child(3)');
  check('phone Work is sequential with media above text', await mobile.$eval('.work-card:nth-child(3)', el => getComputedStyle(el).position === 'relative' && el.querySelector('.work-media').getBoundingClientRect().top < el.querySelector('.work-copy').getBoundingClientRect().top));  await sphereChecks(mobile);
  await sweepPage(mobile);
  check("phone no overflow after scrolling whole page", await mobile.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  await frameBudget(mobile, 1);
  await frameBudget(mobile, 4);
  await frameBudget(mobile, 4);
  await frameBudget(mobile, 4);
  await frameBudget(mobile, 1, true);
  await frameBudget(mobile, 4, true);
  await sphereVisibilityCheck(mobile);
  await mobile.evaluate(() => window.__lenis.scrollTo(0, { immediate: true }));
  await sleep(150);
  await mobile.click(".menu-button");
  check("menu locks Lenis and body", await mobile.evaluate(() => document.querySelector("dialog").open && document.body.style.overflow === "hidden" && window.__lenis.isStopped));
  await mobile.keyboard.press("Tab");
  check("focus stays inside sheet", await mobile.evaluate(() => document.querySelector("dialog").contains(document.activeElement)));
  await mobile.keyboard.press("Escape");
  await sleep(100);
  check("Escape restores scrolling and focus", await mobile.evaluate(() => !document.querySelector("dialog").open && document.body.style.overflow === "" && !window.__lenis.isStopped && document.activeElement === document.querySelector(".menu-button")));
  await mobile.evaluate(() => window.__lenis.scrollTo(900, { immediate: true }));
  await sleep(100);
  check("phone bottom chrome hides after hero", await mobile.$eval(".chrome-bottom", (el) => getComputedStyle(el).visibility === "hidden"));
  await mobile.evaluate(() => document.querySelector(".sky canvas").getContext("webgl2").getExtension("WEBGL_lose_context").loseContext());
  await sleep(150);
  check("context loss falls back", await mobile.evaluate(() => document.documentElement.dataset.sky === "css" && !document.querySelector(".sky canvas")));
  const fallbackMode = await mobile.evaluate(() => document.documentElement.dataset.mode);
  await mobile.click(".sky-toggle");
  check("fallback toggle still works", await mobile.evaluate((previous) => document.documentElement.dataset.mode !== previous, fallbackMode));
  await mobile.close();

  const reduced = await page();
  await reduced.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await reduced.goto(url, { waitUntil: "networkidle0" });
  check("reduced motion skips canvas and intro", await reduced.evaluate(() => !document.querySelector(".sky canvas") && document.querySelector(".intro").hidden && window.__f1.done === 1));
  check('reduced glyph pit is static', await reduced.$eval('.glyph-pit', el => el.dataset.running === 'false'));
  check('reduced section headlines have no animation', await reduced.$$eval('.section-line', lines => lines.length > 0 && lines.every(line => {
    line.classList.add('section-armed', 'is-visible');
    return getComputedStyle(line.querySelector('span')).animationName === 'none';
  })));
  const reducedMode = await reduced.evaluate(() => document.documentElement.dataset.mode);
  await reduced.click(".sky-toggle");
  check("reduced toggle is immediate", await reduced.evaluate((previous) => document.documentElement.dataset.mode !== previous, reducedMode));
  await reduced.$eval("[data-sphere]", el => el.scrollIntoView());
  const staticSphere = await reduced.$eval("[data-sphere-item]", el => el.style.transform);
  await sleep(300);
  check("reduced sphere is static and tach rests without sweep", await reduced.evaluate(transform => document.querySelector("[data-sphere-item]").style.transform === transform && (!document.querySelector('.tach-needle') || parseFloat(document.querySelector(".tach-needle").style.transform.slice(7)) === -96) && window.__tachSamples.every(a => a === -96), staticSphere));
  await reduced.$eval('.skills-list button', el => el.click());
  await sleep(750);
  check('reduced group highlight works without a globe turn', await reduced.evaluate(transform => document.querySelector('.skills-list button').getAttribute('aria-pressed') === 'true' && document.querySelector('[data-sphere-item]').dataset.selected === 'true' && document.querySelector('[data-sphere-item]').style.transform === transform, staticSphere));
  await reduced.close();

  const nojs = await page();
  await nojs.setJavaScriptEnabled(false);
  await nojs.goto(url, { waitUntil: "networkidle0" });
  await sleep(5100);
  check("no-JS intro fails open", await nojs.$eval(".intro", (el) => getComputedStyle(el).visibility === "hidden"));
  check("no-JS headline is visible", await nojs.$eval(".hero-line > span", (el) => getComputedStyle(el).transform === "none"));
  await nojs.close();
  await schoolChecks();
  await projectChecks();
  await transitionChecks();
  await clockChecks();
  await scrimChecks();
  check("no console, runtime or HTTP errors", errors.length === 0);
  for (const b of budgets) check(`frame budget ${b.width}x${b.height} CPU ${b.rate}x ${b.spin ? "sphere" : "scroll"}`, b.p95 <= (b.rate === 4 ? 33 : 16.7) && b.maxTask <= 50);
  console.log(`${checks} Level 4 checks passed.`);
} finally {
  await browser.close();
  if (errors.length) console.error(errors);
}
