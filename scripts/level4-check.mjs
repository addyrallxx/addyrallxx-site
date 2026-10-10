// Level 4 checks. Uses the existing real-Chrome tooling, no new dependency.
// Run after npm run build and npm run start -- --port 3100.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import sharp from "sharp";
import { join } from "node:path";
import { tmpdir } from "node:os";

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
async function frameBudget(p, rate) {
  const cdp = await p.createCDPSession();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  await p.evaluate(() => window.__lenis.scrollTo(0, { immediate: true }));
  await sleep(300);
  check("visible before frame probe", await p.evaluate(() => !document.hidden));
  const result = await p.evaluate(() => new Promise(resolve => {
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
      const t = Math.min((now - start) / 6000, 1);
      window.__lenis.scrollTo(max * (.5 - .5 * Math.cos(t * Math.PI * 2)));
      peakScroll = Math.max(peakScroll, window.scrollY);
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
  }));
  console.log(`FRAME ${result.width}x${result.height} CPU ${rate}x p95=${result.p95.toFixed(3)}ms frames=${result.frames} maxLongTask=${result.maxTask.toFixed(1)}ms`);
  check("frame probe exercises canvas and Lenis", result.renders > 60 && result.peakScroll > result.max * .8);
  budgets.push({ ...result, rate });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await cdp.detach();
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
try {
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
  check("counter reaches 100", info.counter === "100");
  const intro = await p.evaluate(() => ({ samples: window.__introSamples, timing: window.__f1.doneAt - window.__f1.partAt,
    ...window.__f1.halves, height: innerHeight }));
  check("intro samples every 50ms contain no zero or padding", intro.samples.length > 20 && intro.samples.some(s => s.text === "100") && intro.samples.every(s => !/^0/.test(s.text) && !/^0/.test(s.rendered)));
  check("intro starts blank", intro.samples[0].text === "" && intro.samples[0].scale === 0);
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
  await frameBudget(p, 1);
  await frameBudget(p, 4);
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
  await frameBudget(mobile, 1);
  await frameBudget(mobile, 4);
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
  const reducedMode = await reduced.evaluate(() => document.documentElement.dataset.mode);
  await reduced.click(".sky-toggle");
  check("reduced toggle is immediate", await reduced.evaluate((previous) => document.documentElement.dataset.mode !== previous, reducedMode));
  await reduced.close();

  const nojs = await page();
  await nojs.setJavaScriptEnabled(false);
  await nojs.goto(url, { waitUntil: "networkidle0" });
  await sleep(5100);
  check("no-JS intro fails open", await nojs.$eval(".intro", (el) => getComputedStyle(el).visibility === "hidden"));
  check("no-JS headline is visible", await nojs.$eval(".hero-line > span", (el) => getComputedStyle(el).transform === "none"));
  await nojs.close();
  check("no console, runtime or HTTP errors", errors.length === 0);
  for (const b of budgets) check(`frame budget ${b.width}x${b.height} CPU ${b.rate}x`, b.p95 <= (b.rate === 4 ? 33 : 16.7) && b.maxTask <= 50);
  console.log(`${checks} Level 4 checks passed.`);
} finally {
  await browser.close();
  if (errors.length) console.error(errors);
}

