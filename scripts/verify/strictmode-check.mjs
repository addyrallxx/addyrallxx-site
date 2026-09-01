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
await page.evaluateOnNewDocument(() => {
  const nativeRequest = window.requestAnimationFrame.bind(window);
  const nativeCancel = window.cancelAnimationFrame.bind(window);
  const active = new Set();
  window.__rafAudit = { active };
  window.requestAnimationFrame = (callback) => {
    let requestId = 0;
    requestId = nativeRequest((time) => {
      active.delete(requestId);
      callback(time);
    });
    active.add(requestId);
    return requestId;
  };
  window.cancelAnimationFrame = (requestId) => {
    active.delete(requestId);
    nativeCancel(requestId);
  };
});

try {
  await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://localhost:4174", { waitUntil: "networkidle0" });
  await page.waitForFunction(() => !!window.__world, { timeout: 8000 });

  // Give StrictMode's mount, cleanup, and remount cycle time to settle.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const state = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll("canvas").length,
    isAnimating: window.__world.debug.isAnimating(),
    tier: window.__world.tier,
    particleCount: window.__world.particleCount,
    documentHidden: document.hidden,
  }));

  const activeRafSamples = [];
  for (let index = 0; index < 20; index += 1) {
    activeRafSamples.push(await page.evaluate(() => window.__rafAudit.active.size));
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  const f0 = await page.evaluate(() => window.__world.debug.frameCount());
  const t0 = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const f1 = await page.evaluate(() => window.__world.debug.frameCount());
  const elapsed = (Date.now() - t0) / 1000;
  const fps = (f1 - f0) / elapsed;

  await page.evaluate(() => {
    document.querySelector("main").style.visibility = "hidden";
  });
  const shot = await page.screenshot({ encoding: "base64" });
  const pixels = await page.evaluate(async (source) => {
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
    for (let offset = 0; offset < data.length; offset += 4) {
      if (data[offset] + data[offset + 1] + data[offset + 2] > 120) lit += 1;
    }
    return { lit, total: surface.width * surface.height };
  }, shot);

  const evidence = {
    ...state,
    fps,
    frameDelta: f1 - f0,
    activeRafMin: Math.min(...activeRafSamples),
    activeRafMax: Math.max(...activeRafSamples),
    litPixels: pixels.lit,
    litRatio: pixels.lit / pixels.total,
  };
  console.log(JSON.stringify(evidence, null, 2));

  const failures = [];
  if (state.canvasCount !== 1) failures.push(`canvas count ${state.canvasCount}, expected 1`);
  if (!state.isAnimating) failures.push("world animation loop is not scheduled");
  if (state.tier !== "full" || state.particleCount !== 24000) {
    failures.push(`tier ${state.tier} with ${state.particleCount} particles, expected full with 24000`);
  }
  if (state.documentHidden) failures.push("real Chrome reported document.hidden=true");
  if (fps < 50) failures.push(`fps ${fps.toFixed(2)}, floor is 50`);
  if (evidence.activeRafMax > 3) {
    failures.push(`up to ${evidence.activeRafMax} rAF callbacks stayed scheduled after StrictMode settled`);
  }
  if (evidence.litRatio < 0.02 || evidence.litRatio > 0.4) {
    failures.push(`world lit ratio ${evidence.litRatio.toFixed(4)} is outside 0.02 to 0.4`);
  }
  if (failures.length > 0) {
    for (const failure of failures) console.error("FAIL " + failure);
    throw new Error(`${failures.length} StrictMode verification failure(s)`);
  }
  console.log("PASS StrictMode leaves one visible, animated full-tier world without duplicate rAF loops");
} finally {
  await browser.close();
}
