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
    href: document.activeElement?.getAttribute?.("href"),
    text: document.activeElement?.textContent?.trim()?.slice(0, 40),
  }));
  focusOrder.push(info);
}
console.log(JSON.stringify(focusOrder, null, 2));
const expected = [
  { tag: "A", href: "#main", text: "Skip to content" },
  { tag: "A", href: "https://totaltex-bd.com", text: "totaltex-bd.com" },
  {
    tag: "A",
    href: "https://addyrallxx.github.io/fittrack/fittrack.html",
    text: "A workout and nutrition tracker you can ",
  },
  { tag: "A", href: "mailto:adnanshakib888@gmail.com", text: "adnanshakib888@gmail.com" },
  { tag: "BODY", href: null, text: "Skip to contentI build the software two " },
];
for (let index = 0; index < expected.length; index += 1) {
  const actual = focusOrder[index];
  const wanted = expected[index];
  if (actual.tag !== wanted.tag || actual.href !== wanted.href || actual.text !== wanted.text) {
    await browser.close();
    throw new Error(
      `tab ${index + 1} focused ${JSON.stringify(actual)}, expected ${JSON.stringify(wanted)}`,
    );
  }
}
await browser.close();
console.log("PASS keyboard focus follows the complete expected order");
