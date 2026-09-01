import puppeteer from "puppeteer-core";
const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: false,
  defaultViewport: null,
  args: ["--window-size=1400,900"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1400, height: 900 });
await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });
await page.waitForFunction(() => !!window.__world, { timeout: 5000 });
await page.evaluate(() => {
  window.__verifyWheelEvents = [];
  window.addEventListener(
    "wheel",
    (event) => {
      const deltaY = event.deltaY;
      setTimeout(() => {
        window.__verifyWheelEvents.push({ deltaY, defaultPrevented: event.defaultPrevented });
      }, 0);
    },
    { passive: true },
  );
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo(0, maxScroll / 2);
});
await new Promise((resolve) => setTimeout(resolve, 200));
const before = await page.evaluate(() => window.scrollY);
const client = await page.createCDPSession();
for (let i = 0; i < 4; i += 1) {
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: 700,
    y: 450,
    deltaX: 0,
    deltaY: 300,
  });
  await new Promise((r) => setTimeout(r, 100));
}
await new Promise((resolve) => setTimeout(resolve, 300));
const afterDown = await page.evaluate(() => window.scrollY);
for (let i = 0; i < 4; i += 1) {
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: 700,
    y: 450,
    deltaX: 0,
    deltaY: -300,
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
}
await new Promise((resolve) => setTimeout(resolve, 300));
const result = await page.evaluate(() => ({
  afterUp: window.scrollY,
  events: window.__verifyWheelEvents,
}));
const downDistance = afterDown - before;
const upDistance = result.afterUp - afterDown;
const detail = { before, afterDown, afterUp: result.afterUp, downDistance, upDistance, events: result.events };
console.log(JSON.stringify(detail));

const tolerance = 50;
if (Math.abs(downDistance - 1200) > tolerance) {
  await browser.close();
  throw new Error(`downward wheel moved ${downDistance}px, expected 1200px within ${tolerance}px`);
}
if (Math.abs(upDistance + 1200) > tolerance) {
  await browser.close();
  throw new Error(`upward wheel moved ${upDistance}px, expected -1200px within ${tolerance}px`);
}
if (result.events.length !== 8 || result.events.some((event) => event.defaultPrevented)) {
  await browser.close();
  throw new Error(`wheel event cancellation audit failed: ${JSON.stringify(result.events)}`);
}
await browser.close();
console.log("PASS real wheel input moved in both directions by the requested distance without cancellation");
