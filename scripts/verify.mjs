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
import { readFileSync, writeFileSync } from "node:fs";

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

// Ground truth for the skill sphere icon count: read straight from the
// content file rather than hardcoding a number that will go stale the next
// time a skill is added or removed. "slug" appears nowhere else in this
// file, so a whole-file scan is enough, no need to locate the SKILLS block.
function countSkillSlugs() {
  const src = readFileSync(new URL("../lib/content.ts", import.meta.url), "utf8");
  const nonNull = (src.match(/slug:\s*"[^"]+"/g) || []).length;
  const nullCount = (src.match(/slug:\s*null\b/g) || []).length;
  return { nonNull, nullCount, total: nonNull + nullCount };
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

  // Attached before the first navigation so it catches every request the
  // initial load makes, including the skill sphere's icon mount.
  const requestUrls = [];
  page.on("request", (r) => requestUrls.push(r.url()));

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  // Let next/font settle so we measure the real family, not the fallback.
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 600));

  // ---- Identity first. A share link minted before the deployment finished
  // returns Vercel's own login page, and every check below would then be
  // reporting on that login page instead of the site. Abort the whole run
  // rather than record one failed check among many meaningless ones.
  const identity = await page.evaluate(() => ({
    hasMain: !!document.getElementById("main"),
    title: document.title,
  }));
  if (!identity.hasMain) {
    console.error(
      `ABORT: no #main element found (page title: "${identity.title}"). ` +
        "This is very likely a Vercel login or error page, not the site. Fix access and rerun."
    );
    process.exit(2);
  }

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

  // ---- 8. Scroll to the skills section and hold there for the sphere
  // checks below. Lenis hijacks scrollIntoView and window.scrollTo, both get
  // reverted on its next frame, so drive it directly and confirm the landing
  // rather than trusting the call resolved.
  async function lenisScrollTo(y) {
    const landed = await page.evaluate((targetY) => {
      const lenis = window.__lenis;
      if (lenis && typeof lenis.scrollTo === "function") {
        lenis.scrollTo(targetY, { immediate: true });
      } else {
        window.scrollTo(0, targetY);
      }
      return true;
    }, y);
    await new Promise((r) => setTimeout(r, 250));
    const landedAt = await page.evaluate(() => window.scrollY);
    return { landed, landedAt };
  }

  const skillsTop = await page.evaluate(() => {
    const el = document.getElementById("skills");
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  });
  check("found #skills to scroll to", skillsTop !== null);

  if (skillsTop !== null) {
    const { landedAt } = await lenisScrollTo(skillsTop);
    check(
      "scrolled to the skills section",
      Math.abs(landedAt - skillsTop) < 200,
      `target ${Math.round(skillsTop)}, landed ${Math.round(landedAt)}`
    );

    // DOM node stability at t=0 and t=4s, sampling the sphere's rotation at
    // the 2s midpoint in the same dwell. A previous build leaked roughly 100
    // DOM nodes a second from a duplicate React key on the sphere items, and
    // every prior agent reported it passing because nobody watched it hold
    // steady over time.
    const t0 = await page.evaluate(() => ({
      nodeCount: document.getElementsByTagName("*").length,
      itemRect: (() => {
        const el = document.querySelector("[data-sphere-item]");
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top };
      })(),
    }));

    await new Promise((r) => setTimeout(r, 2000));
    const t2 = await page.evaluate(() => {
      const el = document.querySelector("[data-sphere-item]");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top };
    });

    await new Promise((r) => setTimeout(r, 2000));
    const t4 = await page.evaluate(() => document.getElementsByTagName("*").length);

    const growth = t4 - t0.nodeCount;
    check(
      "sphere DOM node count is stable over 4s (growth <= 25)",
      growth <= 25,
      `${t0.nodeCount} -> ${t4} (+${growth})`
    );

    // ---- 9. Sphere rotation speed. The component exposes no rotation
    // state on the DOM, so a tile's own screen position stands in for it: a
    // rigid sphere rotation moves every visible tile together, so the tile at
    // DOM index 0 is a fair proxy even if which logical item that is shifts
    // slightly as tiles cross the visibility edge. Frozen (delta 0) means
    // auto-rotate is broken; a huge jump means the rotation math is not the
    // slow, ambient drift the brief asked for.
    if (t0.itemRect && t2) {
      const delta = Math.hypot(t2.x - t0.itemRect.x, t2.y - t0.itemRect.y);
      check(
        "sphere rotates slowly, not frozen and not spinning wildly (0.3..250px over 2s)",
        delta > 0.3 && delta < 250,
        `${delta.toFixed(1)}px over 2s`
      );
    } else {
      check("sphere rotation measurable", false, "no [data-sphere-item] found on screen");
    }

    // ---- 10. Skill sphere icons: inline svg, not img, count matches the
    // content file, and zero network requests for a vendored icon file.
    const sphereIcons = await page.evaluate(() => {
      const wrap = document.querySelector("[data-sphere]");
      if (!wrap) return null;
      const svgCount = wrap.querySelectorAll("[data-sphere-item] svg").length;
      const imgCount = wrap.querySelectorAll("[data-sphere-item] img").length;
      return { svgCount, imgCount };
    });
    const slugCounts = countSkillSlugs();
    check("skill sphere found", !!sphereIcons);
    if (sphereIcons) {
      check("sphere icons are inline svg, not img", sphereIcons.imgCount === 0, `${sphereIcons.imgCount} img tags`);
      check(
        "sphere icon count matches non-null slugs in lib/content.ts",
        sphereIcons.svgCount === slugCounts.nonNull,
        `sphere has ${sphereIcons.svgCount}, content.ts has ${slugCounts.nonNull} non-null slugs`
      );
    }
    const iconRequests = requestUrls.filter((u) => /\/icons\/.*\.svg(\?|$)/i.test(u));
    check(
      "zero network requests for /icons/*.svg (icons are inlined)",
      iconRequests.length === 0,
      `${iconRequests.length} requests: ${iconRequests.slice(0, 3).join(", ")}`
    );
  }

  // ---- 11. Starfield and Cosmos: two separate ambient background layers.
  // Selectors are deliberately loose (any canvas, any .cosmos) rather than a
  // specific component name, since this pass is mid-rebuild on both layers.
  const layers = await page.evaluate(() => {
    function info(el) {
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { pointerEvents: cs.pointerEvents, ariaHidden: el.getAttribute("aria-hidden") };
    }
    const canvas = document.querySelector("canvas");
    const cosmos = document.querySelector(".cosmos");
    let painting = null;
    if (canvas) {
      try {
        const ctx = canvas.getContext("2d");
        const w = Math.min(canvas.width || 0, 64);
        const h = Math.min(canvas.height || 0, 64);
        if (ctx && w > 0 && h > 0) {
          const data = ctx.getImageData(0, 0, w, h).data;
          let nonTransparent = 0;
          for (let i = 3; i < data.length; i += 4) if (data[i] > 0) nonTransparent++;
          painting = nonTransparent;
        } else {
          painting = 0;
        }
      } catch {
        painting = -1;
      }
    }
    return { canvas: info(canvas), cosmos: info(cosmos), painting };
  });
  check("starfield canvas exists", !!layers.canvas, layers.canvas ? "" : "no <canvas> found on the page");
  if (layers.canvas) {
    check("starfield is pointer-events none", layers.canvas.pointerEvents === "none", layers.canvas.pointerEvents);
    check("starfield is aria-hidden", layers.canvas.ariaHidden === "true", layers.canvas.ariaHidden);
    check(
      "starfield canvas is actually painting stars",
      layers.painting > 0,
      layers.painting === -1 ? "could not read canvas pixels" : `${layers.painting} non-transparent px sampled`
    );
  }
  check("cosmos layer exists", !!layers.cosmos, layers.cosmos ? "" : "no .cosmos found on the page");
  if (layers.cosmos) {
    check("cosmos is pointer-events none", layers.cosmos.pointerEvents === "none", layers.cosmos.pointerEvents);
    check("cosmos is aria-hidden", layers.cosmos.ariaHidden === "true", layers.cosmos.ariaHidden);
  }

  // ---- 12. Scroll reactivity. At three depths, at least one element that
  // carries a scroll-driven transform (the .reveal / .word-in animation-
  // timeline system, or the newer motion-* utility classes) should show a
  // non-identity transform, proving the scroll-linked motion system is
  // actually wired up rather than just present in the stylesheet.
  const maxScroll = await page.evaluate(() =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  );
  const SCROLL_SELECTOR =
    ".reveal, .word-in, .motion-fade-rise, .motion-drift-x, .scroll-tilt__track, .scroll-tilt__surface";
  for (const fraction of [0.2, 0.5, 0.8]) {
    const targetY = Math.round(maxScroll * fraction);
    const { landedAt } = await lenisScrollTo(targetY);
    check(
      `scrolled to ${Math.round(fraction * 100)}% depth`,
      Math.abs(landedAt - targetY) < Math.max(100, maxScroll * 0.05),
      `target ${targetY}, landed ${Math.round(landedAt)}`
    );
    await new Promise((r) => setTimeout(r, 150));
    const hasTransform = await page.evaluate((sel) => {
      for (const el of document.querySelectorAll(sel)) {
        const t = getComputedStyle(el).transform;
        if (t && t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)") return true;
      }
      return false;
    }, SCROLL_SELECTOR);
    check(`a scroll-driven transform is active at ${Math.round(fraction * 100)}% depth`, hasTransform);
  }
  // Back to the top for the new-section and screenshot checks below.
  await lenisScrollTo(0);

  // ---- 13. New sections: mindset, next, contact each exist with a heading
  // and are not empty.
  for (const id of ["mindset", "next", "contact"]) {
    const section = await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return null;
      const heading = el.querySelector("h1, h2, h3");
      return {
        hasHeading: !!heading && heading.textContent.trim().length > 0,
        textLength: el.textContent.trim().length,
      };
    }, id);
    check(`#${id} section exists`, !!section, section ? "" : "not found in the DOM");
    if (section) {
      check(`#${id} has a heading`, section.hasHeading);
      check(`#${id} is not empty`, section.textLength > 20, `${section.textLength} chars`);
    }
  }

  // ---- 14. Contact contrast. The exact bug (white text on the accent
  // colour, 3.91:1) shipped twice on this project: once on the hero button,
  // then again on this one after the first fix did not travel.
  const contactContrast = await page.evaluate(() => {
    // Standard WCAG relative luminance and contrast ratio, inline because
    // this runs inside the page, not in this script's own scope.
    function channel(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    function luminance(rgb) {
      return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
    }
    function parseRgb(str) {
      const m = (str || "").match(/rgba?\(([^)]+)\)/);
      if (!m) return [0, 0, 0];
      return m[1].split(",").slice(0, 3).map((s) => parseFloat(s));
    }
    function contrastRatio(a, b) {
      const l1 = luminance(parseRgb(a)) + 0.05;
      const l2 = luminance(parseRgb(b)) + 0.05;
      return l1 > l2 ? l1 / l2 : l2 / l1;
    }
    const el = document.querySelector('#contact a[href^="mailto:"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const ratio = contrastRatio(cs.color, cs.backgroundColor);
    return { ratio, color: cs.color, backgroundColor: cs.backgroundColor };
  });
  check("found the contact email button", !!contactContrast);
  if (contactContrast) {
    check(
      "contact email button meets WCAG AA contrast (>=4.5:1)",
      contactContrast.ratio >= 4.5,
      `${contactContrast.ratio.toFixed(2)}:1, ${contactContrast.color} on ${contactContrast.backgroundColor}`
    );
  }

  // ---- One confirming frame, cropped to the hero, small. Taken from the
  // normal, fully interactive page before the two reload-based checks below
  // change page state.
  await lenisScrollTo(0);
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1 });
  await new Promise((r) => setTimeout(r, 300));
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 800 } });
  writeFileSync(OUT, png);

  // ---- 15. Reduced motion. Installed before the reload below so the
  // counter is present from the very first script on the new document.
  await page.evaluateOnNewDocument(() => {
    window.__rafCount = 0;
    const orig = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      window.__rafCount++;
      return orig(cb);
    };
  });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1000));

  const reducedMotionSections = await page.evaluate(() => {
    const sections = [...document.querySelectorAll("main > section")];
    return sections.map((s) => ({ id: s.id, opacity: getComputedStyle(s).opacity }));
  });
  check("reduced motion: found sections to check", reducedMotionSections.length > 0);
  const blankUnderReducedMotion = reducedMotionSections.filter((s) => s.opacity === "0");
  check(
    "reduced motion: no section is invisible",
    blankUnderReducedMotion.length === 0,
    blankUnderReducedMotion.map((s) => s.id || "(no id)").join(", ")
  );

  const rafBefore = await page.evaluate(() => window.__rafCount || 0);
  await new Promise((r) => setTimeout(r, 1000));
  const rafAfter = await page.evaluate(() => window.__rafCount || 0);
  const rafPerSecond = rafAfter - rafBefore;
  check(
    "reduced motion: no rAF loop running hot (<15 calls/s)",
    rafPerSecond < 15,
    `${rafPerSecond} requestAnimationFrame calls in 1s`
  );

  // ---- 16. Fail open. JavaScript disabled entirely, reload, and confirm no
  // section renders at opacity 0 over otherwise-correct server markup. This
  // project shipped exactly that blank-over-correct-markup bug once, from a
  // hidden state that server-rendered markup could not undo without JS.
  await page.setJavaScriptEnabled(false);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 300));
  const noJsSections = await page.evaluate(() => {
    const sections = [...document.querySelectorAll("main > section")];
    return sections.map((s) => ({ id: s.id, opacity: getComputedStyle(s).opacity }));
  });
  check("no-js: found sections to check", noJsSections.length > 0);
  const blankWithNoJs = noJsSections.filter((s) => s.opacity === "0");
  check(
    "no-js: no section is invisible (fails open)",
    blankWithNoJs.length === 0,
    blankWithNoJs.map((s) => s.id || "(no id)").join(", ")
  );

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
