// Populate + capture FitTrack (https://addyrallxx.github.io/fittrack/fittrack.html)
// Real Chrome via puppeteer-core (borrowed from totaltex-web's node_modules;
// this machine's Browser pane reports document.hidden and can't be trusted
// for anything relying on visibility/animation state).
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(
  "C:/Users/adnan/projects/totaltex-web/package.json"
);
const puppeteer = require("puppeteer-core");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "https://addyrallxx.github.io/fittrack/fittrack.html";
const OUT_DIR = path.resolve("public/fittrack");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Only ever click elements that are actually visible: the app keeps every
// tab's markup mounted at once, so an exact-text match can otherwise land on
// a same-named control sitting in a hidden tab.
async function clickByText(page, selector, text, exact = true) {
  const handle = await page.evaluateHandle(
    (sel, txt, ex) => {
      const els = [...document.querySelectorAll(sel)];
      return (
        els.find((el) => {
          const t = el.textContent?.trim() ?? "";
          const matches = ex ? t === txt : t.includes(txt);
          if (!matches) return false;
          const r = el.getBoundingClientRect();
          return el.offsetParent !== null && r.width > 0 && r.height > 0;
        }) ?? null
      );
    },
    selector,
    text,
    exact
  );
  const el = handle.asElement();
  if (!el) return false;
  await el.click();
  return true;
}

async function setVisibleInputByType(page, type, index, value) {
  return page.evaluate(
    (t, idx, v) => {
      const els = [...document.querySelectorAll(`input[type="${t}"]`)].filter(
        (el) => el.offsetParent !== null
      );
      const el = els[idx];
      if (!el) return false;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;
      setter.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    },
    type,
    index,
    value
  );
}

async function visibleText(page) {
  return page.evaluate(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT
    );
    const seen = new Set();
    let out = "";
    let node = walker.currentNode;
    while (node) {
      if (
        node.offsetParent !== null &&
        node.children.length === 0 &&
        node.textContent?.trim()
      ) {
        out += node.textContent.trim() + "\n";
      }
      node = walker.nextNode();
    }
    return out.slice(0, 1500);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  protocolTimeout: 60000,
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(800);

  const title = await page.title();
  console.log("ASSERTED PAGE TITLE:", title);
  if (!title.includes("FitTrack"))
    throw new Error("Title mismatch, not the real app");

  // --- Onboarding, 5 known steps ---
  const nameInput = await page.$('input[placeholder="Your name"]');
  if (nameInput) await nameInput.type("Adnan");
  await clickByText(page, "button", "Get started");
  await sleep(400);

  await setVisibleInputByType(page, "number", 0, "178");
  await setVisibleInputByType(page, "date", 0, "1998-06-15");
  await clickByText(page, "button", "Male");
  await sleep(200);
  await clickByText(page, "button", "Continue");
  await sleep(400);

  await setVisibleInputByType(page, "number", 0, "82");
  await setVisibleInputByType(page, "number", 1, "75");
  await clickByText(page, "button", "Continue");
  await sleep(400);

  await clickByText(page, "button", "3"); // sessions/week
  await sleep(200);
  await clickByText(page, "button", "Continue");
  await sleep(400);

  await clickByText(page, "button", "Start");
  await sleep(600);

  const homeText = await visibleText(page);
  console.log("--- Home after onboarding ---\n", homeText);
  if (homeText.includes("Step ")) {
    throw new Error("Onboarding did not finish, still on a wizard step");
  }
  if (!/quick log/i.test(homeText)) {
    throw new Error("Did not land on the Home dashboard after onboarding");
  }

  // --- Populate: two one-tap daily check-ins ---
  await clickByText(page, "button", "🏋️\nGym\nTap to log", false);
  await sleep(300);
  await clickByText(page, "button", "🥩\nProtein\nTap to log", false);
  await sleep(300);

  // --- Populate: steps (Home's "Log steps" reveals an inline form) ---
  await clickByText(page, "button", "Log steps");
  await sleep(400);
  await setVisibleInputByType(page, "number", 0, "6482");
  await clickByText(page, "button", "Save steps");
  await sleep(400);

  // Back to Home for the first screenshot.
  await clickByText(page, "button", "Home");
  await sleep(400);
  console.log("--- Home, populated ---\n", await visibleText(page));
  await page.screenshot({
    path: path.join(OUT_DIR, "fittrack-home-dashboard.png"),
  });

  // --- Populate: water, on the Nutrition tab ---
  await clickByText(page, "button", "Nutrition");
  await sleep(400);
  await clickByText(page, "button", "+750ml");
  await sleep(300);
  console.log("--- Nutrition, populated ---\n", await visibleText(page));
  await page.screenshot({
    path: path.join(OUT_DIR, "fittrack-nutrition-water.png"),
  });

  console.log("DONE");
} finally {
  await browser.close();
}
