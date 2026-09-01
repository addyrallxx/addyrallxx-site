import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: false,
  defaultViewport: null,
  args: ["--window-size=1400,900"],
});
const page = await browser.newPage();
const failures = [];
page.on("response", (res) => {
  if (res.status() >= 400) failures.push(`${res.status()} ${res.url()}`);
});
page.on("requestfailed", (request) => {
  failures.push(`request failed ${request.url()}: ${request.failure()?.errorText ?? "unknown"}`);
});

try {
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });
  await page.waitForFunction(() => !!window.__world, { timeout: 8000 });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (failures.length > 0) {
    for (const failure of failures) console.error("FAIL " + failure);
    throw new Error(`${failures.length} failed HTTP request(s)`);
  }
  console.log("PASS no HTTP responses at 400 or above and no failed requests");
} finally {
  await browser.close();
}
