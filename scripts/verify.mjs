// Visual verification. Drives REAL Chrome, not the in-app Browser pane.
//
// Usage: node scripts/verify.mjs [url] [screenshot-out]
// Default url is http://localhost:3000/
//
// The rule this file exists to enforce: every assertion must be about
// something a human would actually see. The previous build's harness passed
// on frame rate, particle count and "zero console errors" while the screen
// was completely blank. So: visible text, computed colour, real fonts, and a
// literal count of non-background pixels.

import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

// puppeteer-core is deliberately NOT a dependency of this repo. It is a
// large package and this is the only script that needs it, so the script
// borrows the copy already installed in a sibling project. Override with
// PUPPETEER_FROM if that project is not present.
//
// The in-app Browser pane cannot substitute for this. Automation browsers on
// this machine report document.hidden = true, which throttles
// requestAnimationFrame so GSAP and canvas motion never run, and makes
// loading="lazy" images return naturalWidth 0 with no network request at
// all. A study of five reference sites through that pane returned blank
// screenshots for three of them while their DOM read as perfectly correct.
const FROM =
  process.env.PUPPETEER_FROM || "C:/Users/adnan/projects/totaltex-web/package.json";
const require = createRequire(FROM);
let puppeteer;
try {
  puppeteer = require("puppeteer-core");
} catch {
  console.error(
    `Could not load puppeteer-core from ${FROM}.
` +
      "Set PUPPETEER_FROM to the package.json of a project that has it installed."
  );
  process.exit(2);
}

const URL = process.argv[2] || "http://localhost:3000/";
const OUT = process.argv[3] || "./hero.png";

const fails = [];
const ok = [];
function check(name, pass, detail) {
  (pass ? ok : fails).push(`${name}${detail ? ` :: ${detail}` : ""}`);
}

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--force-device-scale-factor=1", "--hide-scrollbars"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  await page.goto(URL, { waitUntil: "networkidle0", timeout: 60000 });
  // Let next/font settle so we measure the real family, not the fallback.
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 600));

  // ---- 1. The words a visitor reads are actually on screen, and visible.
  const text = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return null;
    const r = h1.getBoundingClientRect();
    const cs = getComputedStyle(h1);
    return {
      content: h1.textContent.trim(),
      width: Math.round(r.width),
      height: Math.round(r.height),
      inViewport: r.top < window.innerHeight && r.bottom > 0,
      opacity: cs.opacity,
      visibility: cs.visibility,
      fontFamily: cs.fontFamily,
      fontSizePx: Math.round(parseFloat(cs.fontSize)),
      color: cs.color,
    };
  });

  check("h1 exists", !!text);
  if (text) {
    check(
      "h1 says the hero line",
      text.content.includes("I sold cars"),
      JSON.stringify(text.content)
    );
    check("h1 is in the viewport", text.inViewport);
    check("h1 has real size", text.width > 300 && text.height > 60, `${text.width}x${text.height}`);
    check("h1 is not transparent", text.opacity === "1", `opacity ${text.opacity}`);
    check("h1 is visible", text.visibility === "visible");
    check(
      "h1 uses Archivo, not a fallback",
      /Archivo/i.test(text.fontFamily),
      text.fontFamily
    );
    check(
      "h1 hits the new large step (>=90px at 1440)",
      text.fontSizePx >= 90,
      `${text.fontSizePx}px`
    );
  }

  // ---- 2. Body font is Manrope and body copy is legible size.
  // Target the lead paragraph, not the first <p> in main: the first one is a
  // .label, which is deliberately monospace.
  const body = await page.evaluate(() => {
    const p = [...document.querySelectorAll("main p")].find(
      (el) => !el.classList.contains("label") && el.textContent.trim().length > 60
    );
    if (!p) return null;
    const cs = getComputedStyle(p);
    return { fontFamily: cs.fontFamily, fontSizePx: parseFloat(cs.fontSize), color: cs.color };
  });
  check("found a lead paragraph", !!body);
  if (body) {
    check("body uses Manrope", /Manrope/i.test(body.fontFamily), body.fontFamily);
    check("body copy is >=18px", body.fontSizePx >= 18, `${body.fontSizePx}px`);
  }

  // Labels must be monospace, and mono must not have leaked into prose.
  const label = await page.evaluate(() => {
    const el = document.querySelector("main p.label");
    return el ? getComputedStyle(el).fontFamily : null;
  });
  check("labels use JetBrains Mono", /JetBrains/i.test(label || ""), label);

  // ---- 3. The graphite ground actually painted.
  const ground = await page.evaluate(() => {
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    return { htmlBg, bodyBg };
  });
  check(
    "html carries the canvas colour",
    ground.htmlBg === "rgb(8, 9, 11)",
    ground.htmlBg
  );
  check(
    "body stays transparent (the blank-screen bug)",
    ground.bodyBg === "rgba(0, 0, 0, 0)",
    ground.bodyBg
  );

  // ---- 4. The accent budget. Red should be rare, not a theme.
  const accentCount = await page.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      for (const v of [cs.color, cs.backgroundColor, cs.borderTopColor]) {
        if (v === "rgb(229, 72, 77)") n++;
      }
    }
    return n;
  });
  check("accent is used and is rare (1..12)", accentCount >= 1 && accentCount <= 12, `${accentCount} uses`);

  // ---- 5. Literal pixel count. Not a frame counter. Actual painted pixels.
  const shot = await page.screenshot({ encoding: "base64" });
  const lit = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let nonGround = 0;
    for (let i = 0; i < d.length; i += 4) {
      // anything meaningfully lighter than the #08090b ground
      if (d[i] > 40 || d[i + 1] > 40 || d[i + 2] > 40) nonGround++;
    }
    return { total: c.width * c.height, nonGround };
  }, shot);
  const pct = ((lit.nonGround / lit.total) * 100).toFixed(2);
  check(
    "above the fold is not blank (>1% lit pixels)",
    lit.nonGround / lit.total > 0.01,
    `${lit.nonGround} lit of ${lit.total} (${pct}%)`
  );

  // ---- 6. No console errors.
  check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

  // ---- 7. Copy gates: no em dash, no en dash anywhere in rendered text.
  const dashes = await page.evaluate(() => {
    const t = document.body.innerText;
    return { em: (t.match(/\u2014/g) || []).length, en: (t.match(/\u2013/g) || []).length };
  });
  check("no em dashes in rendered copy", dashes.em === 0, `${dashes.em} found`);
  check("no en dashes in rendered copy", dashes.en === 0, `${dashes.en} found`);

  // ---- One confirming frame, cropped to the hero, small.
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 300));
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 800 } });
  writeFileSync(OUT, png);

  console.log("\nPASS");
  for (const l of ok) console.log("  + " + l);
  if (fails.length) {
    console.log("\nFAIL");
    for (const l of fails) console.log("  - " + l);
  }
  console.log(`\n${ok.length} passed, ${fails.length} failed`);
  console.log("screenshot: " + OUT);
} finally {
  await browser.close();
}

process.exit(fails.length ? 1 : 0);
