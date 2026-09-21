// Populate + capture FitTrack (https://addyrallxx.github.io/fittrack/fittrack.html)
// Real Chrome via puppeteer-core (borrowed from totaltex-web's node_modules;
// this machine's Browser pane reports document.hidden and can't be trusted
// for anything relying on visibility/animation state).
//
// Architecture note: FitTrack is not a tabbed SPA. Every section (Home,
// Workout, Nutrition, Progress, Settings) is mounted in the DOM at once as
// one long scrolling page. The bottom nav buttons just scroll their section
// into view. page.screenshot() with no clip always captures the current
// viewport, so "go to a section" here means "click its nav button, wait for
// the scroll, then screenshot the viewport."
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(
  "C:/Users/adnan/projects/totaltex-web/package.json"
);
const puppeteer = require("puppeteer-core");
// sharp is already in this repo's own node_modules (a transitive dep), so a
// normal ESM import resolves it, unlike puppeteer-core above.
const { default: sharp } = await import("sharp");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const URL = "https://addyrallxx.github.io/fittrack/fittrack.html";
const OUT_DIR = path.resolve("public/fittrack");
const MAX_BYTES = 400 * 1024;
fs.mkdirSync(OUT_DIR, { recursive: true });

// Only ever click elements that are actually visible: the app keeps every
// section's markup mounted at once, so an exact-text match can otherwise
// land on a same-named control sitting off in another section.
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
  await el.evaluate((node) =>
    node.scrollIntoView({ block: "center", behavior: "instant" })
  );
  await sleep(150);
  // A real mouse click at the element's own center, not
  // ElementHandle.click()'s CDP hit-test based clickablePoint, which throws
  // "Node is either not clickable" on this page under deviceScaleFactor 2 +
  // its internally scrolling container even when the element is plainly on
  // screen and on top.
  const box = await el.evaluate((node) => {
    const r = node.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.click(box.x, box.y);
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
  return page.evaluate(() => document.body.innerText.slice(0, 2500));
}

// Clicks a food search result row by its leading text, which opens the
// "Add to meal" bottom sheet, then picks a meal slot to finish adding it.
// leadingText must uniquely identify one row (startsWith), since the app
// returns several near-duplicate results per query.
async function addFoodResult(page, leadingText, mealSlot) {
  const clicked = await page.evaluate((leading) => {
    const els = [...document.querySelectorAll("body *")];
    const target = els.find((el) => el.textContent?.trim().startsWith(leading));
    if (!target) return false;
    let node = target;
    for (let i = 0; i < 6 && node; i++) {
      if (node.tagName === "BUTTON" || node.getAttribute("role") === "button") {
        node.click();
        return true;
      }
      node = node.parentElement;
    }
    target.click();
    return true;
  }, leadingText);
  if (!clicked) throw new Error(`Food result not found: ${leadingText}`);
  await sleep(700);
  // Not an exact match: the meal-slot button also contains a trailing
  // arrow glyph in the same textContent ("Lunch→").
  const picked = await clickByText(page, "button", mealSlot, false);
  if (!picked) throw new Error(`Meal slot button not found: ${mealSlot}`);
  await sleep(500);
}

// The "+ Add meal" search results render inline in the page flow (not a
// modal), and stay open after a successful add so a second item can be
// searched right away. Clears the query so the results list collapses,
// leaving a clean state for a screenshot.
async function closeSearchIfOpen(page) {
  const input = await page.$(
    'input[placeholder="Search food or browse presets..."]'
  );
  if (!input) return;
  await input.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await sleep(300);
}

// Exercise cards on Workout load collapsed (name/sets/machine tag only);
// the Set/Weight/Reps table and the "Done, skip the set details" button
// only get non-zero height, and become clickable, once the card's own
// header (div.ex-hdr, not a <button>) is clicked to expand it.
async function expandExercise(page, exerciseName) {
  const clicked = await page.evaluate((name) => {
    const target = [...document.querySelectorAll("body *")].find(
      (el) => el.textContent?.trim() === name && el.children.length === 0
    );
    if (!target) return false;
    let node = target;
    for (let i = 0; i < 6 && node; i++) {
      if (node.classList?.contains("ex-hdr")) {
        node.click();
        return true;
      }
      node = node.parentElement;
    }
    return false;
  }, exerciseName);
  if (!clicked) throw new Error(`Exercise header not found: ${exerciseName}`);
  await sleep(400);
}

async function shootAndCompress(page, filename) {
  // The single reused #toast element (e.g. "+500ml added") picks up a
  // "show" class for a few seconds after any action. This script fires
  // several actions close together, so waiting out the dismiss timer is
  // unreliable; none of them are meant to be in any of these shots
  // anyway. Force-hide it outright rather than just removing the class,
  // since the class alone drives a fade-out transition that would still
  // be mid-animation in the screenshot.
  await page.evaluate(() => {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.classList.remove("show");
      toast.style.display = "none";
    }
  });
  const filePath = path.join(OUT_DIR, filename);
  await page.screenshot({ path: filePath });
  let { size } = fs.statSync(filePath);
  if (size > MAX_BYTES) {
    const buf = await sharp(filePath)
      .png({ quality: 80, compressionLevel: 9, palette: true })
      .toBuffer();
    fs.writeFileSync(filePath, buf);
    size = fs.statSync(filePath).size;
  }
  console.log(`SHOT ${filename}: ${(size / 1024).toFixed(0)} KB`);
  return size;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Builds a plausible 35 day downward weight trend ending today, oldest
// first, so the Progress chart has enough points to read as a real trend
// instead of the two point line that looks broken.
function buildWeightHistory(todayStr) {
  const today = new Date(todayStr + "T00:00:00");
  const daysAgoAndWeight = [
    [35, 84.6],
    [31, 84.1],
    [28, 83.8],
    [24, 84.0],
    [21, 83.3],
    [17, 82.7],
    [14, 82.4],
    [10, 81.6],
    [7, 81.0],
    [3, 80.2],
    [0, 79.6],
  ];
  return daysAgoAndWeight.map(([daysAgo, weight]) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const date = d.toISOString().slice(0, 10);
    return { date, weight };
  });
}

// Backfills 10 days of check-ins, steps and workout completion so the
// Activity calendar and Streaks tiles on Progress are not all zero.
function buildRecentLogs(todayStr) {
  const today = new Date(todayStr + "T00:00:00");
  const gymDays = new Set([1, 3, 6, 8]); // roughly 3 sessions/week
  const logs = {};
  for (let daysAgo = 9; daysAgo >= 1; daysAgo--) {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const date = d.toISOString().slice(0, 10);
    const gym = gymDays.has(daysAgo);
    const protein = daysAgo % 3 !== 0;
    const water = daysAgo % 4 !== 0;
    logs[date] = {
      date,
      workout: { completed: gym, dayIndex: gym ? 0 : -1, exercises: {}, startTime: null },
      nutrition: { meals: [], water: water ? 3600 : 1800 },
      checkins: { gym, protein, water },
      steps: 5800 + ((daysAgo * 733) % 4200),
      weight: null,
      creatine: 0,
      rhr: null,
    };
  }
  return logs;
}

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

  // --- Onboarding, 5 known steps. Neutral invented identity, not Adnan's. ---
  const nameInput = await page.$('input[placeholder="Your name"]');
  if (nameInput) await nameInput.type("Alex");
  await clickByText(page, "button", "Get started");
  await sleep(400);

  await setVisibleInputByType(page, "number", 0, "175");
  await setVisibleInputByType(page, "date", 0, "1996-03-12");
  await clickByText(page, "button", "Male");
  await sleep(200);
  await clickByText(page, "button", "Continue");
  await sleep(400);

  await setVisibleInputByType(page, "number", 0, "84.6");
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
  if (homeText.includes("Step ")) {
    throw new Error("Onboarding did not finish, still on a wizard step");
  }
  if (!/quick log/i.test(homeText)) {
    throw new Error("Did not land on the Home dashboard after onboarding");
  }

  // --- Backfill weight history and recent check-ins via the app's own
  // localStorage schema, then reload so Chart.js and the calendar pick up
  // the new data. The UI's own "Log weight" flow only ever writes today,
  // there is no in-app way to backdate a weigh-in. ---
  const todayKey = await page.evaluate(() => Object.keys(JSON.parse(localStorage.ft_logs))[0]);
  console.log("TODAY KEY:", todayKey);

  const weights = buildWeightHistory(todayKey);
  const recentLogs = buildRecentLogs(todayKey);
  const startWeight = weights[0].weight;
  const currentWeight = weights[weights.length - 1].weight;
  const programStart = weights[0].date;

  await page.evaluate(
    ({ weights, recentLogs, startWeight, currentWeight, programStart, todayKey }) => {
      localStorage.setItem("ft_weights", JSON.stringify(weights));

      const logs = JSON.parse(localStorage.ft_logs);
      Object.assign(logs, recentLogs);
      logs[todayKey].weight = currentWeight;
      localStorage.setItem("ft_logs", JSON.stringify(logs));

      const settings = JSON.parse(localStorage.ft_settings);
      settings.programStart = programStart;
      settings.body.startingWeight = startWeight;
      settings.body.currentWeight = currentWeight;
      localStorage.setItem("ft_settings", JSON.stringify(settings));
    },
    { weights, recentLogs, startWeight, currentWeight, programStart, todayKey }
  );

  await page.reload({ waitUntil: "networkidle2", timeout: 30000 });
  await sleep(800);
  const reloadedText = await visibleText(page);
  if (!/quick log/i.test(reloadedText)) {
    throw new Error("Reload after backfill did not land back on Home");
  }

  // --- Populate today: two one-tap daily check-ins, steps ---
  // These tiles are div.ci-card with an onclick handler, not <button>, so
  // they need their own selector rather than clickByText's usual "button".
  const gymChecked = await clickByText(page, ".ci-card", "Gym", false);
  await sleep(300);
  const proteinChecked = await clickByText(page, ".ci-card", "Protein", false);
  await sleep(300);
  if (!gymChecked || !proteinChecked) {
    throw new Error("Daily check-in tile not found (gym/protein)");
  }

  await clickByText(page, "button", "Log steps");
  await sleep(400);
  await setVisibleInputByType(page, "number", 0, "7482");
  await clickByText(page, "button", "Save steps");
  await sleep(400);

  // --- Nutrition: search first (screenshot the live Open Food Facts /
  // curated results dropdown), then add two real meals and some water. ---
  await clickByText(page, "button", "Nutrition");
  await sleep(400);
  await clickByText(page, "button", "+ Add meal");
  await sleep(400);
  const searchInput = await page.$(
    'input[placeholder="Search food or browse presets..."]'
  );
  await searchInput.type("chicken breast");
  await sleep(1500);
  console.log("--- Nutrition, search open ---\n", await visibleText(page));
  await shootAndCompress(page, "fittrack-nutrition-food-search.png");

  await addFoodResult(
    page,
    "Grilled chicken breast with brown rice and vegetables",
    "Lunch"
  );
  // The search results list stays open after adding; clear the query so it
  // collapses before searching again, rather than stacking two open panels.
  await closeSearchIfOpen(page);

  await searchInput.type("greek yogurt");
  await sleep(1500);
  await addFoodResult(page, "Greek yogurt, vanilla", "Breakfast");
  await closeSearchIfOpen(page);

  await clickByText(page, "button", "+1L");
  await sleep(300);
  await clickByText(page, "button", "+500ml");
  await sleep(300);
  console.log("--- Nutrition, populated ---\n", await visibleText(page));
  await shootAndCompress(page, "fittrack-nutrition-macros-water.png");

  // --- Workout: log one exercise's sets with real numbers and tick each
  // set done, skip-complete two more, leave the rest pending, so the
  // session reads mid-workout rather than all-or-nothing. ---
  await clickByText(page, "button", "Workout");
  await sleep(400);
  // Program day rotation can default to any of the three sessions; pin it
  // to Session A (Push) so the exercise names in the screenshot and this
  // script's own weight/reps values line up.
  await clickByText(page, "button", "Session A", false);
  await sleep(400);

  // Cards load collapsed: the Set/Weight/Reps table has zero height (and
  // is therefore unclickable) until the exercise's own header is clicked
  // open. The three real, working sets logged this way each go: tick all
  // 3 sets, which starts a rest-timer countdown; skip it; then click the
  // "Mark complete" button that only appears once the rest is cleared.
  // Weight/reps inputs and set-chk checkboxes are laid out in a fixed
  // global DOM order across all 7 exercises (3 sets each for the first
  // 5), so each exercise's own slice can be addressed by a fixed offset
  // regardless of which cards are currently expanded.
  const exercises = [
    { name: "Chest Press", inputOffset: 0, chkOffset: 0, sets: [[40, 10], [40, 9], [37.5, 8]] },
    { name: "Leg Press", inputOffset: 6, chkOffset: 3, sets: [[60, 12], [60, 11], [55, 10]] },
    { name: "Seated Row", inputOffset: 12, chkOffset: 6, sets: [[45, 10], [45, 10], [42.5, 9]] },
  ];
  for (const ex of exercises) {
    await expandExercise(page, ex.name);
    for (let s = 0; s < ex.sets.length; s++) {
      await setVisibleInputByType(page, "number", ex.inputOffset + s * 2, String(ex.sets[s][0]));
      await setVisibleInputByType(page, "number", ex.inputOffset + s * 2 + 1, String(ex.sets[s][1]));
    }
    await sleep(200);
    for (let s = 0; s < ex.sets.length; s++) {
      const ticked = await page.evaluate((idx) => {
        const boxes = [...document.querySelectorAll("button.set-chk")];
        const el = boxes[idx];
        if (!el) return false;
        el.click();
        return true;
      }, ex.chkOffset + s);
      if (!ticked) throw new Error(`Set checkbox ${s} not found on ${ex.name}`);
      await sleep(250);
    }
    await clickByText(page, "button.rest-skip", "Skip", true);
    await sleep(300);
    await clickByText(page, "button", "Mark complete", false);
    await sleep(300);
  }

  // Scroll back to the top of the Workout section so its title and the
  // "X/7 exercises done" progress bar are in frame. The bottom nav's own
  // "Workout" button lands lower than expected now that three cards have
  // grown taller (green completed borders, expanded set tables along the
  // way), so scroll the section's own "Workout" heading into view
  // directly instead of trusting the nav click's scroll target.
  // div.header-title holding the text "Workout" is the section's own
  // heading (document.body itself stays a fixed 844px; the real scroll
  // happens on an inner div.screen container).
  await page.evaluate(() => {
    const heading = [...document.querySelectorAll("*")].find(
      (el) => el.textContent?.trim() === "Workout" && el.children.length === 0 && el.tagName !== "BUTTON"
    );
    heading?.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await sleep(500);
  console.log("--- Workout, mid-session ---\n", await visibleText(page));
  await shootAndCompress(page, "fittrack-workout-session.png");

  // --- Home, now fully populated with today's real activity ---
  await clickByText(page, "button", "Home");
  await sleep(400);
  console.log("--- Home, populated ---\n", await visibleText(page));
  await shootAndCompress(page, "fittrack-home-dashboard.png");

  // --- Progress: weight trend with enough points, calendar and streaks ---
  await clickByText(page, "button", "Progress");
  await sleep(500);
  console.log("--- Progress ---\n", await visibleText(page));
  await shootAndCompress(page, "fittrack-progress-weight-trend.png");

  // --- Settings: profile, targets, and the About section that confirms
  // this is a local-first PWA (JSON export, no backend). ---
  await clickByText(page, "button", "Settings");
  await sleep(400);
  console.log("--- Settings ---\n", await visibleText(page));
  await shootAndCompress(page, "fittrack-settings-profile.png");

  console.log("DONE");
} finally {
  await browser.close();
}
