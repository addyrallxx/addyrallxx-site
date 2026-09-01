// Asserts the chapter 6 great-circle arc actually reaches the screen.
// Material state alone is not evidence: a line can be fully configured while
// empty, clipped, covered, or behind the globe. This verifier hides the DOM,
// reads real pixels, and requires one long connected amber stroke.
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const VIEWPORT = { width: 1280, height: 800, deviceScaleFactor: 1 };
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
  args: ["--window-size=1280,800"],
});
const page = await browser.newPage();

async function waitForSettledArc(fraction, accept) {
  await page.evaluate((target) => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, scrollable * target);
  }, fraction);

  let previous = null;
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const current = await page.evaluate(() => window.__world.debug.arc());
    if (
      accept(current) &&
      previous &&
      Math.abs(current.progress - previous.progress) < 0.0001
    ) {
      return current;
    }
    previous = current;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`arc did not settle at scroll ${fraction}`);
}

async function stateAt(fraction, accept) {
  const arc = await waitForSettledArc(fraction, accept);
  await page.evaluate(() => {
    document.querySelector("main").style.visibility = "hidden";
  });
  const shot = await page.screenshot({ encoding: "base64" });
  await page.evaluate(() => {
    document.querySelector("main").style.visibility = "";
  });

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
    const mask = new Uint8Array(surface.width * surface.height);
    let amber = 0;
    for (let offset = 0; offset < data.length; offset += 4) {
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      if (red > 120 && red - blue > 45 && green > 60) {
        mask[offset / 4] = 1;
        amber += 1;
      }
    }

    let largest = { size: 0, width: 0, height: 0 };
    const neighbors = [-1, 0, 1];
    for (let start = 0; start < mask.length; start += 1) {
      if (mask[start] === 0) continue;
      mask[start] = 0;
      const queue = [start];
      let head = 0;
      let minX = start % surface.width;
      let maxX = minX;
      let minY = Math.floor(start / surface.width);
      let maxY = minY;
      while (head < queue.length) {
        const pixel = queue[head];
        head += 1;
        const x = pixel % surface.width;
        const y = Math.floor(pixel / surface.width);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        for (const dy of neighbors) {
          for (const dx of neighbors) {
            if (dx === 0 && dy === 0) continue;
            const nextX = x + dx;
            const nextY = y + dy;
            if (
              nextX < 0 ||
              nextX >= surface.width ||
              nextY < 0 ||
              nextY >= surface.height
            ) {
              continue;
            }
            const next = nextY * surface.width + nextX;
            if (mask[next] === 0) continue;
            mask[next] = 0;
            queue.push(next);
          }
        }
      }
      if (queue.length > largest.size) {
        largest = {
          size: queue.length,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
        };
      }
    }
    return { amber, largest };
  }, shot);
  return { arc, ...pixels };
}

try {
  await page.setViewport(VIEWPORT);
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await page.waitForFunction(() => !!window.__world, { timeout: 10000 });
  await page.addStyleTag({ content: "::-webkit-scrollbar{display:none}" });
  await page.evaluate(() => window.__world.resize());
  const canvasSize = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    return [canvas.clientWidth, canvas.clientHeight];
  });

  const before = await stateAt(0.7, (arc) => arc.progress === 0);
  const middle = await stateAt(
    0.85,
    (arc) => arc.progress > 0.35 && arc.progress < 0.75,
  );
  const after = await stateAt(1, (arc) => arc.progress > 0.9999);
  console.log("scroll 0.70", JSON.stringify(before));
  console.log("scroll 0.85", JSON.stringify(middle));
  console.log("scroll 1.00", JSON.stringify(after));

  const checks = [
    [
      "resolution matches the canvas",
      Math.abs(after.arc.resolution[0] - canvasSize[0]) <= 1 &&
        Math.abs(after.arc.resolution[1] - canvasSize[1]) <= 1,
    ],
    ["arc progress reaches 1", after.arc.progress > 0.9999],
    ["arc is opaque at chapter 6", after.arc.opacity >= 0.85],
    ["dash offset fully swept", Math.abs(after.arc.dashOffset) < 0.01],
    ["arc visible flag is true at chapter 6", after.arc.visible === true],
    [
      "arc is absent before chapter 6",
      before.arc.progress === 0 && before.arc.opacity === 0 && before.arc.visible === false,
    ],
    [
      "arc is partially drawn during the chapter 6 entrance",
      middle.arc.progress > 0.35 &&
        middle.arc.progress < 0.75 &&
        middle.arc.visible === true &&
        middle.arc.dashOffset > after.arc.dashOffset + 1,
    ],
    ["chapter 6 contains amber pixels", after.amber > 500],
    [
      "arc produces one long connected amber stroke",
      after.largest.size > Math.max(150, before.largest.size * 3) &&
        after.largest.width > 100 &&
        after.largest.height > 40,
    ],
  ];
  let ok = true;
  for (const [name, pass] of checks) {
    if (!pass) ok = false;
    console.log(`${pass ? "PASS" : "FAIL"}  ${name}`);
  }
  if (!ok) throw new Error("chapter 6 arc visibility verification failed");
} finally {
  await browser.close();
}
