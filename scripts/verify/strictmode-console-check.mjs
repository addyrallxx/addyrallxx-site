import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: false,
  defaultViewport: null,
  args: ["--window-size=1400,900"],
});
const page = await browser.newPage();
const messages = [];
page.on("console", (msg) => messages.push(`${msg.type()}: ${msg.text()}`));
page.on("pageerror", (err) => messages.push(`pageerror: ${err.message}`));
await page.setViewport({ width: 1400, height: 900 });
await page.goto("http://localhost:4174", { waitUntil: "networkidle0" });
await page.waitForFunction(() => !!window.__world, { timeout: 8000 });
await new Promise((r) => setTimeout(r, 1500));
console.log(JSON.stringify(messages, null, 2));
await browser.close();
