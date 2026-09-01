// Asserts that every quality tier reaches the screen with the intended
// chapter, then measures text against the real composited panel and WebGL
// backdrop. Instrumentation can be green while a canvas is blank or covered,
// so this verifier reads windowed Chrome pixels at device scale factor 1.
//
// Usage: npm run build && npm run start -- -p 4173, then
//        node scripts/verify/verify-pixels.mjs

import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE_URL = "http://localhost:4173";
const CHAPTERS = [
  { id: "arrival", scroll: 1 },
  { id: "ground", scroll: 1.2 },
  { id: "totaltex", scroll: 2 },
  { id: "puzzled", scroll: 1.35 },
  { id: "field-notes", scroll: 1.1 },
  { id: "contact", scroll: 1.5 },
];
const TOTAL_SCROLL = CHAPTERS.reduce((sum, chapter) => sum + chapter.scroll, 0);
let chapterStart = 0;
const CHAPTER_SAMPLES = CHAPTERS.map((chapter) => {
  const fraction = (chapterStart + chapter.scroll / 2) / TOTAL_SCROLL;
  chapterStart += chapter.scroll;
  return { id: chapter.id, fraction };
});
const failures = [];

function fail(message) {
  failures.push(message);
  console.error("FAIL " + message);
}

function signatureDistance(a, b) {
  let total = 0;
  for (let index = 0; index < a.length; index += 1) {
    total += Math.abs(a[index] - b[index]);
  }
  return total / a.length;
}

async function settleWorld(page, fraction) {
  await page.evaluate((target) => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, scrollable * target);
  }, fraction);

  const tier = await page.evaluate(() => window.__world.tier);
  if (tier === "static") {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return;
  }

  let previous = null;
  let stableSamples = 0;
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const current = await page.evaluate(() => window.__world.debug.cameraPosition());
    const movement = previous
      ? Math.hypot(
          current[0] - previous[0],
          current[1] - previous[1],
          current[2] - previous[2],
        )
      : Infinity;
    if (movement < 0.00001) {
      stableSamples += 1;
      if (stableSamples >= 10) return;
    } else {
      stableSamples = 0;
    }
    previous = current;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`world did not settle at scroll ${fraction}`);
}

async function analyseShot(page, source) {
  return page.evaluate(async (base64) => {
    const image = new Image();
    image.src = "data:image/png;base64," + base64;
    await image.decode();
    const surface = document.createElement("canvas");
    surface.width = image.width;
    surface.height = image.height;
    const context = surface.getContext("2d");
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, surface.width, surface.height).data;
    const columns = 24;
    const rows = 16;
    const litByCell = new Array(columns * rows).fill(0);
    const pixelsByCell = new Array(columns * rows).fill(0);
    let lit = 0;
    let amber = 0;
    for (let offset = 0; offset < data.length; offset += 4) {
      const pixel = offset / 4;
      const x = pixel % surface.width;
      const y = Math.floor(pixel / surface.width);
      const cellX = Math.min(columns - 1, Math.floor((x / surface.width) * columns));
      const cellY = Math.min(rows - 1, Math.floor((y / surface.height) * rows));
      const cell = cellY * columns + cellX;
      pixelsByCell[cell] += 1;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      if (red + green + blue > 120) {
        lit += 1;
        litByCell[cell] += 1;
      }
      if (red > 120 && red - blue > 45 && green > 60) amber += 1;
    }
    return {
      width: surface.width,
      height: surface.height,
      lit,
      amber,
      litRatio: lit / (surface.width * surface.height),
      signature: litByCell.map((count, index) => count / pixelsByCell[index]),
    };
  }, source);
}

async function compareShots(page, firstSource, secondSource) {
  return page.evaluate(async ({ firstBase64, secondBase64 }) => {
    async function pixels(source) {
      const image = new Image();
      image.src = "data:image/png;base64," + source;
      await image.decode();
      const surface = document.createElement("canvas");
      surface.width = image.width;
      surface.height = image.height;
      const context = surface.getContext("2d");
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, surface.width, surface.height).data;
    }
    const first = await pixels(firstBase64);
    const second = await pixels(secondBase64);
    let totalDifference = 0;
    let changed = 0;
    for (let offset = 0; offset < first.length; offset += 4) {
      const difference =
        Math.abs(first[offset] - second[offset]) +
        Math.abs(first[offset + 1] - second[offset + 1]) +
        Math.abs(first[offset + 2] - second[offset + 2]);
      totalDifference += difference;
      if (difference > 30) changed += 1;
    }
    const pixelCount = first.length / 4;
    return {
      meanChannelDifference: totalDifference / (pixelCount * 3),
      changedRatio: changed / pixelCount,
    };
  }, { firstBase64: firstSource, secondBase64: secondSource });
}

async function captureWorld(page, sample) {
  await settleWorld(page, sample.fraction);
  const state = await page.evaluate((id) => {
    const expectedHeading = document.getElementById(`${id}-heading`);
    return {
      tier: window.__world.tier,
      particleCount: window.__world.particleCount,
      headingPresent: Boolean(expectedHeading),
      arc: window.__world.debug.arc(),
    };
  }, sample.id);
  await page.evaluate(() => {
    document.querySelector("main").style.visibility = "hidden";
  });
  const source = await page.screenshot({ encoding: "base64" });
  await page.evaluate(() => {
    document.querySelector("main").style.visibility = "";
  });
  const pixels = await analyseShot(page, source);
  return { ...sample, ...state, ...pixels, source };
}

async function captureTier(page) {
  const rows = [];
  for (const sample of CHAPTER_SAMPLES) rows.push(await captureWorld(page, sample));
  return rows;
}

async function preparePage(browser, viewport, { touch = false, reduce = false } = {}) {
  const page = await browser.newPage();
  const client = await page.createCDPSession();
  if (touch) await client.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  if (reduce) {
    await client.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
  }
  await page.setViewport({ ...viewport, deviceScaleFactor: 1, isMobile: touch, hasTouch: touch });
  await page.goto(BASE_URL, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => !!window.__world, { timeout: 10000 });
  await page.addStyleTag({ content: "::-webkit-scrollbar{display:none}" });
  return page;
}

function parseRgb(color) {
  const channels = color.match(/[\d.]+/g)?.map(Number) ?? [];
  return channels.slice(0, 3);
}

async function measureContrast(page, chapterId) {
  await page.evaluate((headingId) => {
    document.getElementById(headingId)?.scrollIntoView({ block: "center" });
  }, `${chapterId}-heading`);
  const scrollFraction = await page.evaluate(
    () => window.scrollY / (document.documentElement.scrollHeight - window.innerHeight),
  );
  await settleWorld(page, scrollFraction);

  const textRuns = await page.evaluate((headingId) => {
    const heading = document.getElementById(headingId);
    const panel = heading?.closest(".reveal");
    if (!panel) return [];
    panel.id = "verify-contrast-panel";
    const runs = [];
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const parent = node.parentElement;
      if (text && parent) {
        const style = getComputedStyle(parent);
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = Array.from(range.getClientRects())
          .map((rect) => ({
            left: Math.max(0, rect.left),
            top: Math.max(0, rect.top),
            right: Math.min(window.innerWidth, rect.right),
            bottom: Math.min(window.innerHeight, rect.bottom),
          }))
          .filter((rect) => rect.right > rect.left && rect.bottom > rect.top);
        if (
          rects.length > 0 &&
          style.visibility === "visible" &&
          style.display !== "none" &&
          Number.parseFloat(style.opacity) > 0
        ) {
          runs.push({
            label: `${parent.tagName.toLowerCase()} ${text.slice(0, 48)}`,
            color: style.color,
            rects,
          });
        }
      }
      node = walker.nextNode();
    }
    return runs;
  }, `${chapterId}-heading`);

  const visibleSource = await page.screenshot({ encoding: "base64" });
  await page.addStyleTag({
    content:
      "#verify-contrast-panel,#verify-contrast-panel *{color:transparent!important;text-decoration-color:transparent!important;text-shadow:none!important}" +
      "#verify-contrast-panel *::before,#verify-contrast-panel *::after,#verify-contrast-panel *::marker{color:transparent!important}",
  });
  const backgroundSource = await page.screenshot({ encoding: "base64" });
  await page.evaluate(() => {
    document.getElementById("verify-contrast-panel")?.removeAttribute("id");
    document.querySelectorAll("style").forEach((style) => {
      if (style.textContent?.includes("#verify-contrast-panel")) style.remove();
    });
  });

  const measured = await page.evaluate(async ({ visibleBase64, backgroundBase64, runs }) => {
    async function imageData(source) {
      const image = new Image();
      image.src = "data:image/png;base64," + source;
      await image.decode();
      const surface = document.createElement("canvas");
      surface.width = image.width;
      surface.height = image.height;
      const context = surface.getContext("2d");
      context.drawImage(image, 0, 0);
      return {
        width: surface.width,
        height: surface.height,
        data: context.getImageData(0, 0, surface.width, surface.height).data,
      };
    }

    function luminance(red, green, blue) {
      const channels = [red, green, blue].map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    }

    function ratio(first, second) {
      const lighter = Math.max(first, second);
      const darker = Math.min(first, second);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const visible = await imageData(visibleBase64);
    const background = await imageData(backgroundBase64);
    const output = [];
    for (const run of runs) {
      const foreground = run.color.match(/[\d.]+/g)?.map(Number).slice(0, 3) ?? [];
      let worstActual = Infinity;
      let worstCss = Infinity;
      let samples = 0;
      for (const rect of run.rects) {
        const left = Math.max(0, Math.floor(rect.left));
        const right = Math.min(visible.width, Math.ceil(rect.right));
        const top = Math.max(0, Math.floor(rect.top));
        const bottom = Math.min(visible.height, Math.ceil(rect.bottom));
        for (let y = top; y < bottom; y += 1) {
          for (let x = left; x < right; x += 1) {
            const offset = (y * visible.width + x) * 4;
            const base = [
              background.data[offset],
              background.data[offset + 1],
              background.data[offset + 2],
            ];
            const rendered = [
              visible.data[offset],
              visible.data[offset + 1],
              visible.data[offset + 2],
            ];
            const foregroundDelta = foreground.map((channel, index) => channel - base[index]);
            const renderedDelta = rendered.map((channel, index) => channel - base[index]);
            const denominator = foregroundDelta.reduce((sum, value) => sum + value * value, 0);
            if (denominator < 1) continue;
            const coverage =
              renderedDelta.reduce(
                (sum, value, index) => sum + value * foregroundDelta[index],
                0,
              ) / denominator;
            if (coverage < 0.9 || coverage > 1.1) continue;
            const residual = Math.hypot(
              renderedDelta[0] - foregroundDelta[0] * coverage,
              renderedDelta[1] - foregroundDelta[1] * coverage,
              renderedDelta[2] - foregroundDelta[2] * coverage,
            );
            if (residual > 12) continue;
            const backgroundLuminance = luminance(base[0], base[1], base[2]);
            const renderedLuminance = luminance(rendered[0], rendered[1], rendered[2]);
            const foregroundLuminance = luminance(
              foreground[0],
              foreground[1],
              foreground[2],
            );
            worstActual = Math.min(worstActual, ratio(renderedLuminance, backgroundLuminance));
            worstCss = Math.min(worstCss, ratio(foregroundLuminance, backgroundLuminance));
            samples += 1;
          }
        }
      }
      if (samples > 0) {
        output.push({
          label: run.label,
          color: run.color,
          samples,
          actualContrast: worstActual,
          cssContrast: worstCss,
        });
      }
    }
    return output;
  }, { visibleBase64: visibleSource, backgroundBase64: backgroundSource, runs: textRuns });

  return measured.map((row) => ({ chapter: chapterId, ...row }));
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
  args: ["--window-size=1000,860"],
});

try {
  const fullPage = await preparePage(browser, { width: 900, height: 620 });
  const fullRows = await captureTier(fullPage);
  const fullState = { tier: fullRows[0].tier, particleCount: fullRows[0].particleCount };
  if (fullState.tier !== "full" || fullState.particleCount !== 24000) {
    fail(`desktop detected ${fullState.tier} with ${fullState.particleCount} particles`);
  }

  const contrastRows = [];
  for (const chapter of CHAPTERS) {
    contrastRows.push(...(await measureContrast(fullPage, chapter.id)));
  }
  await fullPage.close();

  const litePage = await preparePage(
    browser,
    { width: 375, height: 812 },
    { touch: true },
  );
  const liteRows = await captureTier(litePage);
  const liteState = { tier: liteRows[0].tier, particleCount: liteRows[0].particleCount };
  if (liteState.tier !== "lite" || liteState.particleCount !== 8000) {
    fail(`mobile detected ${liteState.tier} with ${liteState.particleCount} particles`);
  }
  await litePage.close();

  const staticPage = await preparePage(
    browser,
    { width: 375, height: 812 },
    { touch: true, reduce: true },
  );
  const staticRows = await captureTier(staticPage);
  const staticState = { tier: staticRows[0].tier, particleCount: staticRows[0].particleCount };
  if (staticState.tier !== "static" || staticState.particleCount !== 8000) {
    fail(`reduced motion detected ${staticState.tier} with ${staticState.particleCount} particles`);
  }

  for (const [tier, rows] of [
    ["full", fullRows],
    ["lite", liteRows],
    ["static", staticRows],
  ]) {
    for (const row of rows) {
      if (!row.headingPresent) fail(`${tier} ${row.id} heading is missing`);
      if (row.litRatio < 0.001 || row.litRatio > 0.35) {
        fail(`${tier} ${row.id} lit ratio ${row.litRatio.toFixed(4)} is outside 0.001 to 0.35`);
      }
    }
    for (let index = 1; index < rows.length; index += 1) {
      const difference = signatureDistance(rows[index - 1].signature, rows[index].signature);
      if (difference < 0.002) {
        fail(`${tier} ${rows[index - 1].id} and ${rows[index].id} pixel signatures differ by only ${difference.toFixed(5)}`);
      }
    }
  }

  const parityRows = [];
  for (let staticIndex = 0; staticIndex < staticRows.length; staticIndex += 1) {
    const current = staticRows[staticIndex];
    const distances = liteRows.map((candidate) => ({
      id: candidate.id,
      distance: signatureDistance(current.signature, candidate.signature),
    }));
    distances.sort((a, b) => a.distance - b.distance);
    const pixelDifference = await compareShots(
      staticPage,
      current.source,
      liteRows[staticIndex].source,
    );
    parityRows.push({
      chapter: current.id,
      closestLiteChapter: distances[0].id,
      signatureDistance: distances[0].distance,
      nextDistance: distances[1].distance,
      ...pixelDifference,
    });
    if (distances[0].id !== current.id) {
      fail(`static ${current.id} looks closest to lite ${distances[0].id}`);
    }
    if (distances[0].distance + 0.001 >= distances[1].distance) {
      fail(`static ${current.id} does not uniquely match its lite chapter`);
    }
    // Static and lite are SUPPOSED to differ. The static tier snaps progress to
    // the chapter integer and renders once, while lite eases to the exact
    // scrolled value, so at a capture position that maps to 4.93 the two render
    // 5.0 and 4.93 of the same morph. On the dense chapters that shifts a few
    // percent of pixels by a couple of levels, which is correct behaviour and
    // not a defect. Verified separately: under reduced motion the contact
    // chapter reports tier static, isAnimating false, 2 frames, and the arc
    // fully drawn at progress 1 with dashOffset 0.
    //
    // The assertion that actually earns its place is the unique signature match
    // above: static must look more like its OWN lite chapter than any other.
    // That catches a blank, stuck or wrong-chapter static render. This bound is
    // only a gross breakage guard, so it sits well above the observed worst
    // case of mean 6.15 and changed ratio 0.077.
    if (pixelDifference.meanChannelDifference > 14 || pixelDifference.changedRatio > 0.25) {
      fail(
        `static ${current.id} differs from lite by mean ${pixelDifference.meanChannelDifference.toFixed(3)} and changed ratio ${pixelDifference.changedRatio.toFixed(4)}`,
      );
    }
  }
  await staticPage.close();

  const compactRows = (rows) =>
    rows.map((row) => ({
      chapter: row.id,
      fraction: Number(row.fraction.toFixed(4)),
      lit: row.lit,
      litRatio: Number(row.litRatio.toFixed(4)),
      amber: row.amber,
      arcProgress: Number(row.arc.progress.toFixed(4)),
    }));
  console.log("\nFULL PIXELS");
  console.table(compactRows(fullRows));
  console.log("\nLITE PIXELS");
  console.table(compactRows(liteRows));
  console.log("\nSTATIC PIXELS");
  console.table(compactRows(staticRows));
  console.log("\nSTATIC TO LITE CHAPTER PARITY");
  console.table(
    parityRows.map((row) => ({
      ...row,
      signatureDistance: Number(row.signatureDistance.toFixed(5)),
      nextDistance: Number(row.nextDistance.toFixed(5)),
      meanChannelDifference: Number(row.meanChannelDifference.toFixed(4)),
      changedRatio: Number(row.changedRatio.toFixed(5)),
    })),
  );

  const contrastByChapter = CHAPTERS.map((chapter) => {
    const rows = contrastRows.filter((row) => row.chapter === chapter.id);
    const worst = rows.reduce(
      (current, row) => (row.actualContrast < current.actualContrast ? row : current),
      { actualContrast: Infinity },
    );
    return {
      chapter: chapter.id,
      measuredRuns: rows.length,
      samples: rows.reduce((sum, row) => sum + row.samples, 0),
      worstContrast: worst.actualContrast,
      element: worst.label ?? "none",
      color: worst.color ?? "none",
    };
  });
  console.log("\nREAL COMPOSITED TEXT CONTRAST");
  console.table(
    contrastByChapter.map((row) => ({
      ...row,
      worstContrast: Number.isFinite(row.worstContrast)
        ? Number(row.worstContrast.toFixed(3))
        : "not measured",
    })),
  );
  for (const row of contrastByChapter) {
    if (!Number.isFinite(row.worstContrast)) {
      fail(`contrast could not be measured for ${row.chapter}`);
    } else if (row.worstContrast < 4.5) {
      fail(
        `CONTRAST ${row.chapter} falls to ${row.worstContrast.toFixed(3)}:1 on ${row.element}`,
      );
    }
  }

  if (failures.length > 0) {
    throw new Error(`${failures.length} pixel and contrast verification failure(s)`);
  }
  const worstContrast = contrastByChapter.reduce((worst, row) =>
    row.worstContrast < worst.worstContrast ? row : worst,
  );
  console.log(
    `PASS full, lite, and static render all six chapters; static matches lite; worst composited text contrast is ${worstContrast.worstContrast.toFixed(3)}:1 in ${worstContrast.chapter}`,
  );
} finally {
  await browser.close();
}
