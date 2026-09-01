// Asserts the chapter 6 great-circle arc actually reaches the screen.
// A LineMaterial whose resolution uniform is zero renders nothing and logs no
// error, so console silence is not evidence. This reads the live material
// state numerically, then confirms with real pixels.
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
await page.waitForFunction(() => !!window.__world, { timeout: 10000 });

async function stateAt(fraction) {
  await page.evaluate((f) => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, scrollable * f);
  }, fraction);
  await new Promise((r) => setTimeout(r, 2500));
  const arc = await page.evaluate(() => window.__world.debug.arc());
  const canvas = await page.$("canvas");
  const shot = await canvas.screenshot({ encoding: "base64" });
  const pixels = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let amber = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 10) continue;
      if (d[i] > 120 && d[i] - d[i + 2] > 45 && d[i + 1] > 60) amber++;
    }
    return amber;
  }, shot);
  return { arc, amber: pixels };
}

const before = await stateAt(0.70);
const after = await stateAt(1.0);
console.log("scroll 0.70", JSON.stringify(before));
console.log("scroll 1.00", JSON.stringify(after));

const checks = [
  ["resolution is non zero", after.arc.resolution[0] > 0 && after.arc.resolution[1] > 0],
  ["arc progress reaches 1", after.arc.progress > 0.99],
  ["arc is opaque at chapter 6", after.arc.opacity > 0.5],
  ["dash offset fully swept", after.arc.dashOffset < 0.01],
  ["arc hidden before chapter 6", before.arc.opacity === 0],
  ["arc adds amber pixels", after.amber > before.amber + 300],
];
let ok = true;
for (const [name, pass] of checks) {
  if (!pass) ok = false;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}`);
}
await browser.close();
process.exit(ok ? 0 : 1);
