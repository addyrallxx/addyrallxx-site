import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: false,
  defaultViewport: null,
  args: ["--window-size=1400,900"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });
await page.goto("http://localhost:4174", { waitUntil: "networkidle0" });
await page.waitForFunction(() => !!window.__world, { timeout: 8000 });

// Give StrictMode's mount/cleanup/remount cycle time to settle.
await new Promise((r) => setTimeout(r, 1000));

const canvasCount = await page.evaluate(() => document.querySelectorAll("canvas").length);
const isAnimating = await page.evaluate(() => window.__world.debug.isAnimating());

const f0 = await page.evaluate(() => window.__world.debug.frameCount());
const t0 = Date.now();
await new Promise((r) => setTimeout(r, 3000));
const f1 = await page.evaluate(() => window.__world.debug.frameCount());
const elapsed = (Date.now() - t0) / 1000;
const fps = (f1 - f0) / elapsed;

console.log(JSON.stringify({ canvasCount, isAnimating, fps }, null, 2));
await browser.close();
