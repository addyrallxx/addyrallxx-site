// Port 4174 is the DEVELOPMENT server, and that is deliberate: React
// StrictMode only double invokes effects in development, so pointing this at
// the production server on 4173 would make the check vacuous. It would pass
// forever without ever exercising the mount, cleanup, remount cycle it exists
// to test.
//
//   npm run dev -- -p 4174
//
// Do not "align" it with the other verifiers. Kill it by port when done, never
// with pkill: Get-NetTCPConnection -LocalPort 4174 -State Listen
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: false,
  defaultViewport: null,
  args: ["--window-size=1400,900"],
});
const page = await browser.newPage();
const messages = [];
const requestFailures = [];
page.on("console", (msg) => messages.push(`${msg.type()}: ${msg.text()}`));
page.on("pageerror", (err) => messages.push(`pageerror: ${err.message}`));
page.on("response", (response) => {
  if (response.status() >= 400) requestFailures.push(`${response.status()} ${response.url()}`);
});
page.on("requestfailed", (request) => {
  requestFailures.push(`${request.url()}: ${request.failure()?.errorText ?? "unknown"}`);
});

try {
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto("http://localhost:4174", { waitUntil: "networkidle0" });
  await page.waitForFunction(() => !!window.__world, { timeout: 8000 });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const problems = messages.filter(
    (message) =>
      message.startsWith("error:") ||
      message.startsWith("warning:") ||
      message.startsWith("pageerror:"),
  );
  console.log(JSON.stringify({ problems, requestFailures }, null, 2));
  if (problems.length > 0 || requestFailures.length > 0) {
    throw new Error(
      `StrictMode emitted ${problems.length} console problem(s) and ${requestFailures.length} request failure(s)`,
    );
  }
  console.log("PASS StrictMode emitted no errors, warnings, or failed requests");
} finally {
  await browser.close();
}
