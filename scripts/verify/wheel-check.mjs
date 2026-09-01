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
const before = await page.evaluate(() => window.scrollY);
const client = await page.createCDPSession();
for (let i = 0; i < 10; i++) {
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: 700,
    y: 450,
    deltaX: 0,
    deltaY: 300,
  });
  await new Promise((r) => setTimeout(r, 100));
}
await new Promise((r) => setTimeout(r, 1500));
const after = await page.evaluate(() => window.scrollY);
console.log(JSON.stringify({ before, after, moved: after !== before }));
await browser.close();
