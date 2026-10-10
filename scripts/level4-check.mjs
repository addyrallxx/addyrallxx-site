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
  check('Work thumbnails do not repeat the link description', await p.$$eval('.work-inline-image img', images => images.length > 0 && images.every(image => image.alt === '')));
  await scrollTo(p, "#work", 100);
  check("desktop Work rows are exactly 96px", await p.$$eval(".work-row", rows => rows.every(row => row.getBoundingClientRect().height === 96)));
  check("home sections keep the specified order", await p.$$eval("main > section", sections => (sections.length >= 9 ? [".hero-line", ".work-row", ".other-band", ".plain-row", "#taste-heading", "[data-sphere]", ".service-row", "#method-heading", "#info-heading"] : [".hero-line", ".work-row", ".other-band", ".plain-row", "[data-sphere]", ".service-row"]).every((selector, i) => sections[i].querySelector(selector))));
  check("Alongside school and Services render four rows each", await p.evaluate(() => document.querySelectorAll(".plain-row").length === 4 && document.querySelectorAll(".service-row").length === 4 && document.querySelector(".contact-pill").getAttribute("href") === "#contact"));
  await p.mouse.move(1, 100);
  await sleep(100);
  await p.evaluate(() => {
    window.__previewMounts = [];
    window.__previewObserver = new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) if (node instanceof Element && node.matches('.work-preview')) window.__previewMounts.push(node.style.transform);
    });
    window.__previewObserver.observe(document.querySelector('.work'), { childList: true, subtree: true });
  });
  const row = await p.$eval(".work-row:nth-child(3)", el => { const r = el.getBoundingClientRect(); return { x: r.left + 400, y: r.top + r.height / 2 }; });
  await p.mouse.move(row.x, row.y);
  await p.waitForSelector(".work-preview");
  await sleep(700);
  const before = await p.$eval(".work-preview", el => { const m = new DOMMatrix(getComputedStyle(el).transform); return { x: m.e, y: m.f }; });
  await p.mouse.move(row.x + 160, row.y);
  await sleep(850);
  const after = await p.$eval(".work-preview", el => { const m = new DOMMatrix(getComputedStyle(el).transform); return { x: m.e, y: m.f }; });
  check("work preview lerps to pointer with 24px offset", Math.abs(after.x - before.x - 160) < 2 && Math.abs(after.x - row.x - 160 - 24) < 2 && Math.abs(after.y - row.y - 24) < 2);
  check("work preview is fixed at the measured pointer coordinates", await p.$eval(".work-preview", (el, target) => {
    const r = el.getBoundingClientRect(); return getComputedStyle(el).position === "fixed" && Math.abs(r.left - target.x) < 2 && Math.abs(r.top - target.y) < 2;
  }, after));
  await sharp(await p.screenshot()).resize({ width: 1000 }).toFile(join(tmpdir(), "claude/briefs/f3-work.png"));
  await p.hover('.work-row:nth-child(4)');
  await sleep(150);
  check('Work previews mount positioned before paint on entry and row switch', await p.evaluate(() => {
    window.__previewObserver.disconnect();
    return window.__previewMounts.length === 2 && window.__previewMounts.every(transform => { const m = new DOMMatrix(transform); return transform !== 'none' && m.e > 0 && m.f > 0; });
  }));
  await scrollTo(p, ".work-row:first-child");
  await p.hover(".work-row:first-child");
  check("projects without images have no floating preview", await p.$(".work-preview") === null);
  await scrollTo(p, ".other-band", 180);
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
  check('globe has 34px desktop or 26px phone colour logos without pills or borders', await p.$$eval('[data-sphere-item]', logos => logos.every(logo => {
    const style = getComputedStyle(logo), icon = getComputedStyle(logo.querySelector('.skill-icon'));
    return style.borderWidth === '0px' && style.backgroundColor === 'rgba(0, 0, 0, 0)' && icon.width === (innerWidth < 720 ? '26px' : '34px') && icon.maskImage !== 'none' && icon.backgroundColor !== 'rgba(0, 0, 0, 0)';
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
  await p.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 });
  await scrollTo(p, '#contact', 100); await sleep(1000);
  await p.screenshot({ path: join(tmpdir(), 'claude/briefs/f8-contact.png') });
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
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
  await scrollTo(mobile, ".work-row:nth-child(3)");
  await mobile.hover(".work-row:nth-child(3)");
  check("touch viewport has no floating preview", await mobile.$(".work-preview") === null);
  check("touch preview sits inline at 88px", await mobile.$eval(".work-row:nth-child(3) .work-inline-image", el => el.getBoundingClientRect().height === 88));
  await sphereChecks(mobile);
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
  check("no console, runtime or HTTP errors", errors.length === 0);
  for (const b of budgets) check(`frame budget ${b.width}x${b.height} CPU ${b.rate}x ${b.spin ? "sphere" : "scroll"}`, b.p95 <= (b.rate === 4 ? 33 : 16.7) && b.maxTask <= 50);
  console.log(`${checks} Level 4 checks passed.`);
} finally {
  await browser.close();
  if (errors.length) console.error(errors);
}
