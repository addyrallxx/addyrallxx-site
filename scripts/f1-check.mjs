// Focused F1 checks. Uses the existing real-Chrome tooling, no new dependency.
// Run after npm run build and npm run start -- --port 3064.
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
  args: ["--force-device-scale-factor=1", "--hide-scrollbars"],
});
const url = process.argv[2] ?? "http://localhost:3064";
const errors = [];
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
    window.addEventListener("intro:done", () => window.__f1.done++);
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
  await p.goto(url, { waitUntil: "networkidle0" });
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
    counter: document.querySelector(".intro-counter").textContent,
    canvas: document.querySelector(".sky canvas")?.width,
    mode: document.documentElement.dataset.mode,
  }));
  console.log(info);
  check("visible real Chrome", !info.hidden);
  check("single intro completion", info.done === 1);
  check("counter reaches 100", info.counter === "100");
  check("live WebGL canvas", info.sky === "webgl" && info.canvas === 1440);
  check("exact display typography", info.font.includes("Archivo") && info.wdth.includes("125") && parseFloat(info.size) === 165.6);
  check("Instrument body", info.body.includes("Instrument"));
  check("no horizontal overflow", info.width === info.viewport);
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("sky:mode", { detail: { mode: "day" } })));
  await sleep(1950);
  await p.screenshot({ path: join(tmpdir(), "f1-desktop-day.png") });
  const day = await skyPixels(p);
  let low = 255, high = 0;
  for (let i = 0; i < day.data.length; i += day.info.channels) { low = Math.min(low, day.data[i]); high = Math.max(high, day.data[i]); }
  check("paper grain paints", high > low && low > 225);
  await p.click(".sky-toggle");
  check("tokens stay day at sweep start", await p.evaluate(() => document.documentElement.dataset.mode === "day"));
  await sleep(600);
  check("tokens swap at sweep midpoint", await p.evaluate(() => document.documentElement.dataset.mode === "night"));
  await sleep(1350);
  await p.screenshot({ path: join(tmpdir(), "f1-desktop-night.png") });
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
  await p.evaluate(() => window.dispatchEvent(new Event("blur")));
  const paused = await p.evaluate(() => window.__f1.renders);
  await sleep(250);
  check("sky pauses on blur", await p.evaluate((count) => window.__f1.renders === count, paused));
  await p.evaluate(() => window.dispatchEvent(new Event("focus")));
  await sleep(100);
  check("sky resumes on focus", await p.evaluate((count) => window.__f1.renders > count, paused));
  await p.reload({ waitUntil: "networkidle0" });
  check("session intro skips once", await p.evaluate(() => window.__f1.done === 1 && document.querySelector(".intro").hidden));
  await p.close();

  const mobile = await page({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mobile.goto(url, { waitUntil: "networkidle0" });
  await mobile.waitForFunction(() => document.documentElement.dataset.intro === "done", { timeout: 6000 });
  await sleep(1100);
  check("coarse DPR cap", await mobile.$eval(".sky canvas", (canvas) => canvas.width <= 488));
  check("phone no overflow", await mobile.evaluate(() => document.documentElement.scrollWidth === innerWidth));
  await mobile.screenshot({ path: join(tmpdir(), "f1-phone.png") });
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
  await sleep(4100);
  check("no-JS intro fails open", await nojs.$eval(".intro", (el) => getComputedStyle(el).visibility === "hidden"));
  check("no-JS headline is visible", await nojs.$eval(".hero-line > span", (el) => getComputedStyle(el).transform === "none"));
  await nojs.close();
  check("no console, runtime or HTTP errors", errors.length === 0);
  console.log(`${checks} F1 checks passed.`);
} finally {
  await browser.close();
  if (errors.length) console.error(errors);
}
