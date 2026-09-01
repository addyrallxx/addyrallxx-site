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
await page.waitForFunction(() => !!window.__world, { timeout: 8000 });

const focusOrder = [];
for (let i = 0; i < 5; i += 1) {
  await page.keyboard.press("Tab");
  const info = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    id: document.activeElement?.id,
    text: document.activeElement?.textContent?.trim()?.slice(0, 40),
  }));
  focusOrder.push(info);
}
console.log(JSON.stringify(focusOrder, null, 2));
await browser.close();
