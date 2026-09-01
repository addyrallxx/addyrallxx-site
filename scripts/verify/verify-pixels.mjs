// Asserts the world actually reaches the screen.
//
// This exists because every other check in scripts/verify passed while the
// world rendered NOTHING. fps was 240, the camera moved, the frame counter
// climbed, GPU uploads were correct and the console was silent, all while the
// canvas was a flat rectangle of background colour. The cause was a CSS
// painting order bug: the canvas is fixed at z-index -10, and an opaque
// background on body paints over negative z-index descendants.
//
// The lesson is the assertion. Instrumentation can be green end to end while
// nothing is visible, so at least one check has to read real pixels.
//
// Usage: npm run build && npm run start -- -p 4173, then
//        node scripts/verify/verify-pixels.mjs
// Kill the server by port afterwards, never with pkill:
//        Get-NetTCPConnection -LocalPort 4173 -State Listen

import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE_URL = "http://localhost:4173";
// Real windowed Chrome on the real GPU, matching verify-world.mjs. The Browser
// pane cannot verify this project (see CLAUDE.md).
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
  args: ["--window-size=1000,720"],
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 620 });
await page.goto(BASE_URL, { waitUntil: "networkidle0" });
await page.waitForFunction(() => !!window.__world, { timeout: 10000 });

const rows = [];
for (const fraction of [0.02, 0.35, 0.75, 1.0]) {
  await page.evaluate((f) => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, scrollable * f);
  }, fraction);
  await new Promise((resolve) => setTimeout(resolve, 2200));

  const arc = await page.evaluate(() => window.__world.debug.arc());
  // Hide the DOM so the copy panels and the amber email link cannot be
  // mistaken for the world. That mistake already cost one debugging round.
  await page.evaluate(() => { document.querySelector("main").style.visibility = "hidden"; });
  await new Promise((resolve) => setTimeout(resolve, 150));
  const shot = await page.screenshot({ encoding: "base64" });
  await page.evaluate(() => { document.querySelector("main").style.visibility = ""; });

  const counts = await page.evaluate(async (source) => {
    const image = new Image();
    image.src = "data:image/png;base64," + source;
    await image.decode();
    const surface = document.createElement("canvas");
    surface.width = image.width;
    surface.height = image.height;
    const context = surface.getContext("2d");
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, surface.width, surface.height).data;
    let lit = 0;
    let amber = 0;
    for (let index = 0; index < data.length; index += 4) {
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      if (r + g + b > 120) lit += 1;
      if (r > 120 && r - b > 45 && g > 60) amber += 1;
    }
    return { lit, amber };
  }, shot);

  rows.push({ fraction, arcProgress: Number(arc.progress.toFixed(3)), ...counts });
}
await browser.close();

console.table(rows);

// A scrollbar alone lights roughly 9,300 pixels, so the floor sits well above it.
const LIT_FLOOR = 20000;
const failures = [];
for (const row of rows) {
  if (row.lit < LIT_FLOOR) {
    failures.push(`scroll ${row.fraction}: only ${row.lit} lit pixels, floor is ${LIT_FLOOR}`);
  }
}
const contact = rows[rows.length - 1];
if (contact.arcProgress < 0.99) failures.push(`arc never completed, progress ${contact.arcProgress}`);
if (contact.amber < 300) failures.push(`chapter 6 arc drew only ${contact.amber} amber pixels`);

if (failures.length > 0) {
  for (const failure of failures) console.error("FAIL " + failure);
  process.exit(1);
}
console.log("PASS world reaches the screen at every chapter, and the arc draws at chapter 6");
