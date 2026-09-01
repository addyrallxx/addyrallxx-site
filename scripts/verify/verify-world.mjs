// Independent verification of the scrolled world, driven against real Chrome
// via puppeteer-core. The Browser pane reports document.hidden = true and
// cannot verify this project. See CLAUDE.md.
//
// Usage: node scripts/verify/verify-world.mjs
// Expects `npm run build && npm run start -- -p 4173` already running.

import { readFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:4173";
const EXPECTED_HEADING_IDS = [
  "arrival-heading",
  "ground-heading",
  "totaltex-heading",
  "puzzled-heading",
  "field-notes-heading",
  "contact-heading",
];
const results = {};
const failures = [];

function log(label, value) {
  results[label] = value;
  console.log(`[${label}]`, typeof value === "object" ? JSON.stringify(value) : value);
}

function check(label, condition, evidence = null) {
  const pass = Boolean(condition);
  log(`check_${label}`, { pass, evidence });
  console.log(`${pass ? "PASS" : "FAIL"} ${label}`);
  if (!pass) failures.push(`${label}: ${JSON.stringify(evidence)}`);
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function problemMessages(messages) {
  return messages.filter(
    (message) =>
      message.startsWith("error:") ||
      message.startsWith("warning:") ||
      message.startsWith("pageerror:"),
  );
}

function watchPage(page, consoleMessages, networkProblems) {
  page.on("console", (message) => {
    consoleMessages.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleMessages.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      networkProblems.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("requestfailed", (request) => {
    networkProblems.push(`${request.url()}: ${request.failure()?.errorText ?? "unknown"}`);
  });
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: false,
    defaultViewport: null,
    args: ["--window-size=1400,900"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900, deviceScaleFactor: 1 });
    const consoleMessages = [];
    const networkProblems = [];
    watchPage(page, consoleMessages, networkProblems);

    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => !!window.__world, { timeout: 10000 });

    const fullTierInfo = await page.evaluate(() => ({
      tier: window.__world.tier,
      particleCount: window.__world.particleCount,
      documentHidden: document.hidden,
    }));
    check(
      "desktop_full_tier",
      fullTierInfo.tier === "full" &&
        fullTierInfo.particleCount === 24000 &&
        fullTierInfo.documentHidden === false,
      fullTierInfo,
    );

    const frame0 = await page.evaluate(() => window.__world.debug.frameCount());
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const frame1 = await page.evaluate(() => window.__world.debug.frameCount());
    check("raf_is_running", frame1 - frame0 >= 50, { frame0, frame1, delta: frame1 - frame0 });

    async function setScrollFraction(fraction) {
      await page.evaluate((target) => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, scrollable * target);
      }, fraction);

      let previous = null;
      let stableSamples = 0;
      const deadline = Date.now() + 10000;
      while (Date.now() < deadline) {
        const current = await page.evaluate(() => window.__world.debug.cameraPosition());
        if (previous && distance(previous, current) < 0.0005) {
          stableSamples += 1;
          if (stableSamples >= 3) return current;
        } else {
          stableSamples = 0;
        }
        previous = current;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error(`camera did not settle at scroll ${fraction}`);
    }

    const cameraPositions = {};
    for (const fraction of [0, 0.5, 1]) {
      cameraPositions[fraction] = await setScrollFraction(fraction);
    }
    const cameraFinite = Object.values(cameraPositions).every((position) =>
      position.every(Number.isFinite),
    );
    const cameraDistances = {
      startToMiddle: distance(cameraPositions[0], cameraPositions[0.5]),
      middleToEnd: distance(cameraPositions[0.5], cameraPositions[1]),
      startToEnd: distance(cameraPositions[0], cameraPositions[1]),
    };
    check(
      "camera_path_is_material",
      cameraFinite &&
        cameraDistances.startToMiddle > 0.25 &&
        cameraDistances.middleToEnd > 0.25 &&
        cameraDistances.startToEnd > 1,
      { positions: cameraPositions, distances: cameraDistances },
    );

    async function measureFps(fraction) {
      await setScrollFraction(fraction);
      const start = await page.evaluate(() => window.__world.debug.frameCount());
      const startedAt = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const end = await page.evaluate(() => window.__world.debug.frameCount());
      const elapsed = (Date.now() - startedAt) / 1000;
      return (end - start) / elapsed;
    }
    const fpsMeasurements = {
      arrival: await measureFps(0),
      totaltex: await measureFps(0.39),
      contact: await measureFps(1),
      floor: 50,
    };
    check(
      "desktop_fps_floor",
      fpsMeasurements.arrival >= 50 &&
        fpsMeasurements.totaltex >= 50 &&
        fpsMeasurements.contact >= 50,
      fpsMeasurements,
    );

    const client = await page.createCDPSession();
    await page.evaluate(() => {
      window.__verifyWheelEvents = [];
      window.addEventListener(
        "wheel",
        (event) => {
          const deltaY = event.deltaY;
          setTimeout(() => {
            window.__verifyWheelEvents.push({
              deltaY,
              defaultPrevented: event.defaultPrevented,
            });
          }, 0);
        },
        { passive: true },
      );
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, maxScroll / 2);
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    const beforeWheel = await page.evaluate(() => window.scrollY);
    for (let index = 0; index < 4; index += 1) {
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseWheel",
        x: 700,
        y: 450,
        deltaX: 0,
        deltaY: 300,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const afterWheelDown = await page.evaluate(() => window.scrollY);
    for (let index = 0; index < 4; index += 1) {
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseWheel",
        x: 700,
        y: 450,
        deltaX: 0,
        deltaY: -300,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const wheelResult = await page.evaluate(() => ({
      afterWheelUp: window.scrollY,
      events: window.__verifyWheelEvents,
    }));
    const wheelEvidence = {
      before: beforeWheel,
      afterDown: afterWheelDown,
      afterUp: wheelResult.afterWheelUp,
      downDistance: afterWheelDown - beforeWheel,
      upDistance: wheelResult.afterWheelUp - afterWheelDown,
      events: wheelResult.events,
    };
    check(
      "wheel_direction_distance_and_cancellation",
      Math.abs(wheelEvidence.downDistance - 1200) <= 50 &&
        Math.abs(wheelEvidence.upDistance + 1200) <= 50 &&
        wheelEvidence.events.length === 8 &&
        wheelEvidence.events.every((event) => event.defaultPrevented === false),
      wheelEvidence,
    );

    const a11y = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const headings = Array.from(document.querySelectorAll("[id$='-heading']")).map(
        (heading) => ({
          id: heading.id,
          tag: heading.tagName,
          text: heading.textContent?.trim() ?? "",
        }),
      );
      const skipLink = document.querySelector('a[href="#main"]');
      return {
        mainPresent: Boolean(document.querySelector("main#main")),
        sectionCount: document.querySelectorAll("main#main > section").length,
        canvasCount: document.querySelectorAll("canvas").length,
        canvasAriaHidden: canvas?.getAttribute("aria-hidden"),
        headings,
        skipLinkPresent: Boolean(skipLink),
        skipLinkText: skipLink?.textContent?.trim(),
      };
    });
    check(
      "semantic_page_structure",
      a11y.mainPresent &&
        a11y.sectionCount === 6 &&
        a11y.canvasCount === 1 &&
        a11y.canvasAriaHidden === "true" &&
        a11y.skipLinkPresent &&
        a11y.skipLinkText === "Skip to content" &&
        a11y.headings.length === 6 &&
        a11y.headings[0]?.tag === "H1" &&
        a11y.headings.slice(1).every((heading) => heading.tag === "H2") &&
        a11y.headings.every((heading, index) =>
          heading.id === EXPECTED_HEADING_IDS[index] && heading.text.length > 0,
        ),
      a11y,
    );

    await page.evaluate(() => {
      window.scrollTo(0, 0);
      document.activeElement?.blur();
    });
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      href: document.activeElement?.getAttribute?.("href"),
      text: document.activeElement?.textContent?.trim(),
    }));
    check(
      "skip_link_is_first_focus",
      firstFocused.tag === "A" &&
        firstFocused.href === "#main" &&
        firstFocused.text === "Skip to content",
      firstFocused,
    );

    const worldSource = await readFile(
      new URL("../../lib/world/index.ts", import.meta.url),
      "utf8",
    );
    const uploadHits = [...worldSource.matchAll(/\.needsUpdate\s*=\s*true/g)].map(
      (match) => match.index,
    );
    const renderedWorldStart = worldSource.indexOf("function createRenderedWorld");
    const uploadEvidence = { hitCount: uploadHits.length, positions: uploadHits, renderedWorldStart };
    check(
      "single_init_only_gpu_upload",
      uploadHits.length === 1 && uploadHits[0] < renderedWorldStart,
      uploadEvidence,
    );

    await client.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
    await page.reload({ waitUntil: "networkidle0" });
    await page.waitForFunction(() => !!window.__world, { timeout: 10000 });
    const staticTierInfo = await page.evaluate(() => ({
      tier: window.__world.tier,
      particleCount: window.__world.particleCount,
      isAnimating: window.__world.debug.isAnimating(),
      frame0: window.__world.debug.frameCount(),
    }));
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const staticFrame1 = await page.evaluate(() => window.__world.debug.frameCount());
    check(
      "reduced_motion_stays_static",
      staticTierInfo.tier === "static" &&
        staticTierInfo.particleCount === 8000 &&
        staticTierInfo.isAnimating === false &&
        staticTierInfo.frame0 === 1 &&
        staticFrame1 === 1,
      { ...staticTierInfo, frameAfter3Seconds: staticFrame1 },
    );

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await new Promise((resolve) => setTimeout(resolve, 300));
    const staticFrameAfterScroll = await page.evaluate(() => window.__world.debug.frameCount());
    check(
      "static_tier_renders_once_on_chapter_change",
      staticFrameAfterScroll === staticFrame1 + 1,
      { before: staticFrame1, after: staticFrameAfterScroll },
    );
    await client.send("Emulation.setEmulatedMedia", { features: [] });

    const mobilePage = await browser.newPage();
    const mobileConsole = [];
    const mobileNetwork = [];
    watchPage(mobilePage, mobileConsole, mobileNetwork);
    const mobileClient = await mobilePage.createCDPSession();
    await mobileClient.send("Emulation.setTouchEmulationEnabled", { enabled: true });
    await mobilePage.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    await mobilePage.goto(BASE_URL, { waitUntil: "networkidle0" });
    await mobilePage.waitForFunction(() => !!window.__world, { timeout: 10000 });
    const liteTierInfo = await mobilePage.evaluate(() => ({
      tier: window.__world.tier,
      particleCount: window.__world.particleCount,
      pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
      innerWidth: window.innerWidth,
      frame0: window.__world.debug.frameCount(),
    }));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    liteTierInfo.frame1 = await mobilePage.evaluate(() => window.__world.debug.frameCount());
    check(
      "mobile_lite_tier",
      liteTierInfo.tier === "lite" &&
        liteTierInfo.particleCount === 8000 &&
        liteTierInfo.pointerCoarse === true &&
        liteTierInfo.innerWidth === 375 &&
        liteTierInfo.frame1 - liteTierInfo.frame0 >= 30,
      liteTierInfo,
    );
    check(
      "mobile_console_and_network_clean",
      problemMessages(mobileConsole).length === 0 && mobileNetwork.length === 0,
      { console: problemMessages(mobileConsole), network: mobileNetwork },
    );
    await mobilePage.close();

    const ssrPage = await browser.newPage();
    await ssrPage.setJavaScriptEnabled(false);
    await ssrPage.setViewport({ width: 900, height: 700, deviceScaleFactor: 1 });
    await ssrPage.goto(BASE_URL, { waitUntil: "networkidle0" });
    const ssr = await ssrPage.evaluate(() => {
      const sections = Array.from(document.querySelectorAll("main#main > section"));
      return {
        worldAbsent: typeof window.__world === "undefined",
        headingIds: sections.map((section) =>
          section.querySelector("h1, h2")?.id ?? "",
        ),
        panels: sections.map((section) => {
          const panel = section.querySelector(".reveal");
          const style = panel ? getComputedStyle(panel) : null;
          return {
            textLength: panel?.textContent?.trim().length ?? 0,
            opacity: style ? Number.parseFloat(style.opacity) : 0,
            visibility: style?.visibility,
            display: style?.display,
          };
        }),
        scrollable: document.documentElement.scrollHeight > window.innerHeight,
      };
    });
    check(
      "javascript_disabled_copy_is_readable",
      ssr.worldAbsent &&
        ssr.scrollable &&
        JSON.stringify(ssr.headingIds) === JSON.stringify(EXPECTED_HEADING_IDS) &&
        ssr.panels.every(
          (panel) =>
            panel.textLength > 20 &&
            panel.opacity >= 0.99 &&
            panel.visibility === "visible" &&
            panel.display !== "none",
        ),
      ssr,
    );
    await ssrPage.close();

    const fallbackPage = await browser.newPage();
    await fallbackPage.evaluateOnNewDocument(() => {
      const nativeGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
        if (typeof type === "string" && type.startsWith("webgl")) return null;
        return nativeGetContext.call(this, type, ...args);
      };
    });
    await fallbackPage.setViewport({ width: 900, height: 700, deviceScaleFactor: 1 });
    await fallbackPage.goto(BASE_URL, { waitUntil: "networkidle0" });
    await fallbackPage.waitForFunction(() => !!window.__world, { timeout: 10000 });
    const fallbackState = await fallbackPage.evaluate(() => ({
      tier: window.__world.tier,
      particleCount: window.__world.particleCount,
      isAnimating: window.__world.debug.isAnimating(),
      frameCount: window.__world.debug.frameCount(),
    }));
    const fallbackChapters = [];
    for (const headingId of EXPECTED_HEADING_IDS) {
      await fallbackPage.evaluate((id) => {
        document.getElementById(id)?.scrollIntoView({ block: "center" });
      }, headingId);
      await new Promise((resolve) => setTimeout(resolve, 300));
      fallbackChapters.push(
        await fallbackPage.evaluate((id) => {
          const heading = document.getElementById(id);
          const panel = heading?.closest(".reveal");
          const headingRect = heading?.getBoundingClientRect();
          const panelStyle = panel ? getComputedStyle(panel) : null;
          return {
            id,
            textLength: panel?.textContent?.trim().length ?? 0,
            panelOpacity: panelStyle ? Number.parseFloat(panelStyle.opacity) : 0,
            panelVisibility: panelStyle?.visibility,
            headingOnScreen: Boolean(
              headingRect && headingRect.bottom > 0 && headingRect.top < window.innerHeight,
            ),
          };
        }, headingId),
      );
    }
    check(
      "webgl_unavailable_copy_is_readable",
      fallbackState.tier === "static" &&
        fallbackState.particleCount === 8000 &&
        fallbackState.isAnimating === false &&
        fallbackState.frameCount === 0 &&
        fallbackChapters.every(
          (chapter) =>
            chapter.textLength > 20 &&
            chapter.panelOpacity >= 0.99 &&
            chapter.panelVisibility === "visible" &&
            chapter.headingOnScreen,
        ),
      { fallbackState, chapters: fallbackChapters },
    );
    await fallbackPage.close();

    await page.goto(BASE_URL, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => !!window.__world, { timeout: 10000 });
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let index = 0; index <= 10; index += 1) {
      await page.evaluate((y) => window.scrollTo(0, y), (scrollHeight * index) / 10);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    const consoleProblems = problemMessages(consoleMessages);
    check(
      "production_console_and_network_clean",
      consoleProblems.length === 0 && networkProblems.length === 0,
      { console: consoleProblems, network: networkProblems },
    );
    await page.close();
  } finally {
    await browser.close();
  }

  console.log("\n=== RESULTS JSON ===");
  console.log(JSON.stringify(results, null, 2));
  if (failures.length > 0) {
    console.error("\n=== FAILURES ===");
    for (const failure of failures) console.error("FAIL " + failure);
    throw new Error(`${failures.length} world verification failure(s)`);
  }
  console.log("PASS all world verifier assertions");
}

main().catch((error) => {
  console.error("VERIFY SCRIPT FAILED:", error);
  process.exit(1);
});
