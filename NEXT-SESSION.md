# Portfolio rebuild handoff

## Current state (2026-10-11): Level 4 "Two skies" live in production

- Live at https://addyrallxx-site.vercel.app. Latest implementation: `8577f6d`; prior documentation checkpoint `19b5172`; this F10 refresh records the same shipped implementation. Both origin `level4` and `main` contain these commits. Older handoffs below are historical, including the superseded F12 uncommitted state and F8 missing metadata labels.
- F5/F8 shipped always-night entry, two skies, intro/resume facts, logo globe, Services, Alongside school, Taste, Method, Info, standalone E92 tach/photos, smaller-build cards, Contact pit (`59dcc1b`), Work pages (`54fcc0f`), route wipes (`423fbf9`), clocks (`388ea1f`), chrome scrim and School privacy guard (`76a9434`, `d8eebb3`).
- Shipped stacking Work cards (`8622a7d`), pinned E92 (`bd670e8`), metadata labels (`ab0e4e6`), kinetic type, meshes, marquees and split flaps (`519d45d`), School banner/tree (`61e3c63`), contrast/accessibility/metadata/404 repairs (`e133e83`), active nav and uncovered terminal entry (`6bde5f2`).
- Phone layouts shipped (`8577f6d`): sequential Work/E92, touch fluid off, compact chrome, full-screen Menu and responsive School. F9/F13 production ledgers report 246 live Chrome assertions and all eight unchanged frame budgets passing, no console/runtime/HTTP errors. Phone evidence is Chrome emulation; physical handset/Safari acceptance remains open. F13 records its review coverage exception and warmed-frame method. Empty Questions stays hidden.

### Next

- Copy pass by Claude (humanizer, slopmonster).
- Design Loop critics on the hero.
- Twinkle audit.
- FAQ copy.
- Portrait from Adnan.

## F12 local implementation, 2026-10-10, image gate blocked

F12 is uncommitted on `level4`, based on F11 commit
`ab0e4e69eafe26d3b24ffb48df278e8ca9c6da4d`. No site copy or dependencies changed.
It adds lit paragraphs, kinetic hero letters and marquee bands, the three
scoped meshes, facts/clocks/labels split flaps, boxed glyph physics and the
brutal copy pill, service media strips and section tint. Settled flaps retain
flat cards and exact generated glyphs; two animated faces exist only during
each character's flip. Tickers use the shared GSAP/Lenis clock.

Required image acceptance is RED: TotalTex Ops and Puzzled have empty `WORK`
image arrays in `lib/content.ts`, with no approved matching files in `public`.
Internal tools, Automation and Dealership operations use provisional existing
typographic project visuals. Adnan was asked whether this fallback is acceptable.
No response or approved paths received. Nothing is staged, committed or pushed.
Do not commit or push while that required image gate is red.

Build, TypeScript, copy-gate, 90 seeded rectangular physics cases and 41 focused
F12 Chrome assertions and all 246 Level 4 assertions pass. All eight unchanged
frame budgets pass with both marquees running and no long tasks. Final status is recorded in
`C:/Users/adnan/AppData/Local/Temp/claude/briefs/f12-progress.md`; read it before
claiming the complete acceptance gate is green. Phone checks are real Chrome
emulation, not physical hardware.

Owned production server: port 3100, PID 27368, command line confirmed. Confirm
that PID again before stopping it. Port 3000 was untouched. Diagnostic scripts
were removed. The four requested DPR 1, 1000px viewport captures are in the
briefs directory: `f12-hero.png`, `f12-marquee.png`, `f12-services.png`,
`f12-pit.png`. Browser verification uses `scripts/f12-check.mjs` and the unchanged
budget thresholds in `scripts/level4-check.mjs`.

## F8 completion, 2026-10-10

F8 finishes Contact, the Work index and five static project pages, the shared
route wipe, 12 hour clocks, the bottom chrome scrim and the School no-grades
guard. TypeScript and Kotlin keep their brand colours; globe depth runs .45
to 1 without selection. Each part is committed and pushed to level4 and then
fast-forwarded to main only after tsc, copy-gate, build and real Chrome verify
pass on the agent's confirmed port 3100 server. Frame thresholds stay intact.

Missing copy: project metadata labels Kind, Year, Stack and Status, and the
What it does heading. These labels render nothing. Supplied project values
and does lines render. FitTrack shows its supplied status instead of its live
link while the existing history-cleanup restriction is unresolved. Questions
stays hidden while FAQ.items is empty.

The progress ledger and final production verification status are at
`C:/Users/adnan/AppData/Local/Temp/claude/briefs/f8-progress.md`. The four
requested 1000px viewport captures are there as f8-globe.png, f8-contact.png,
f8-work-page.png and f8-clocks.png. Clock-only F7 capture and progress are
also there. Bottom chrome contrast is measured against captured E92 pixels
in both skies. Its tertiary period token is locally strengthened for 4.5:1.

Concurrent lib/content.ts copy edits and public/e92/profile.jpg are outside
F8 ownership and remain unstaged. Browser evidence is real Chrome with phone
emulation, not physical phone hardware. Read the ledger for final deployment
state before treating the older handoffs below as current.

Read `GOAL.md` first (cold-start plan of record, carries the Level 4
objective), then this file for current state, then `CLAUDE.md` for operating
rules, then `docs/REDESIGN.md` (design of record) and `bar.md`. `PLAN.md`
sections 1 to 7 still carry the narrative spine and confidentiality rules.

### Adnan's direction, 2026-10-10

- The site is also his resume: lead with hard facts (UCalgary CS April 2028,
  Puzzled co-founder, incoming TotalTex managing director, summer 2027
  internships), not only "Systems with taste".
- Keep and enhance the skill sphere: 60fps, premium, ink colour aligned,
  redesign allowed. Add Services, Alongside school (side work while
  studying: Puzzled, TotalTex, Handled AI, the studio), and Questions last.
- Fluid hover reveal was too wide and lingered, then "too messy". Retuned:
  radius day 2.5, night 6; dye dissipation 2.8 day, 2.2 night; a stroke is
  gone in about 0.5s.
- BMW M tricolour stripe at exactly three moving moments (intro finale split,
  scroll velocity rev bar, E92 card), never the BMW logo or the M letter. An
  optional `///` mark (three slanted tricolour bars, no M) is allowed.
- The rev bar must be a period-correct E92-era analogue tach.
- E92 335xi: public copy says only "BMW Individual Bernina Grey" (never
  "wrapped" or "painted"). Photos from Drive folder "E92 pics" via rclone.
  Build notes are now in the vault (`E92 335xi (Project Car)`).

### GitHub profile (full access granted by Adnan; Sadman gave the go-ahead)

- Live: public `addyrallxx/addyrallxx` (profile README: animated day/night
  SVG banners plus six project cards, generated by
  `C:/Users/adnan/projects/github-showcase/profile/build.mjs` and
  `cards.mjs`) and public `addyrallxx/studio` (AI tooling scripts, secret
  scanned twice, MIT).
- Kept private: totaltex-ops, totaltex-web, puzzled-ops, CPSC 598, and
  sadman-shakib-portfolio (consent for street portraits unconfirmed, internal
  docs committed; do not publish until fixed).
- fittrack is PUBLIC and its history held health data and a Gmail. The
  history scrub is waiting on Adnan's explicit yes before any force-push.
  Do not link fittrack anywhere until it is done.
- TotalTex Ops screenshots still not captured (local Postgres service
  stopped, needs admin; `seed:buyers` holds real buyer names).
- For Adnan by hand: pin repos in the GitHub UI (no API), turn on "include
  private contributions" in profile settings.

### Traps learned this stretch (also in CLAUDE.md Known traps)

- A sky that pauses on window blur freezes whenever focus moves to another
  window, including the off screen verification Chrome. Pause on
  `document.hidden` only.
- Vercel previews are SSO protected; the identity abort rule applies.

### Do not touch without asking

The archived `rebuild` branch and anything under `totaltex-ops/samples/`.

## Settled decisions, carried forward

Still true: graduation April 2028; public email
`adnanshakib.business@gmail.com`; LinkedIn and GitHub only; staying on the
vercel.app URL; TotalTex named outright, Adnan taking over as managing
director; Puzzled started 2023, worked with more than seven Calgary
dealerships and dealer families; Claude writes copy, Codex reviews, Gemini is
excluded from copy. Adnan grades progress in named Levels, not chunk numbers.

## Deployment

Git origin `github.com/addyrallxx/addyrallxx-site.git`. Branch `main` feeds production `addyrallxx-site.vercel.app`; `level4` is the working branch and is fast-forwarded to `main` for releases. Vercel Deployment Protection is ON; a preview needs a Vercel login
or a temporary share link from the Vercel MCP `get_access_to_vercel_url`
(expires after 23 hours). Do not disable deployment protection (account
setting, never authorised). Level 4 is live; release pushes to `main` are fast-forward only.

## Outstanding, unchanged by Level 4

- Adnan's portrait (the E92 photos and build notes are in).
- TotalTex Ops screenshots (Postgres service, seeded demo data only).
- Phone checked only in Chrome emulation at 390x844, never real hardware.

## History, condensed

- **Level 1** (before 2026-09-20): dark editorial spine, flat starfield.
- **Level 2** (2026-09-20): 3D star volume, Cosmos bloom, coverflow,
  ScrollTilt, first procedural hero object.
- **Level 3** (2026-09-20, `b9aea76`, `f4a5627`): procedural galaxy with
  differential rotation, ion blue `#7b8cff` replacing red, sphere jitter fix,
  three scroll driven shape morphs, 58 live checks passing, `framer-motion`
  removed (`31ffdc4`). All of it was retired by Level 4 (see `docs/REDESIGN.md`
  section 10); the lessons survive as CLAUDE.md Known traps (404 check placed
  where it can fail, intro overlay measured instead of the page, stale server
  on port 3000, sampling resolution, `git add -A` during live agents).
- **2026-10-09:** design floor fixes under the Jack Roberts protocol
  (`59f0628`); `docs/DESIGN.md` is superseded by `docs/REDESIGN.md`.

### Handoff, 2026-10-10 late night (Claude, usage nearly out)

- F3.5 landed as `2381531`: analogue tach and grouped globe. Codex reports 125 checks green and phone 4x scroll p95 12.6ms (root cause: forced layout from scrollY reads in the sky, fixed by cached Lenis positions). Claude viewed the globe and night tach captures and they look right. **Claude has NOT re-run verify on its own server yet: do that first.**
- F3.6 (review fixes) was running; F4 (`briefs/f4-sections.md`: Taste, How I work, Info with the E92 block from `docs/e92-copy.md`, hidden Questions, Contact, /work pages, transitions) is chained to start after it. Logs and progress: `C:/Users/adnan/AppData/Local/Temp/claude/briefs/f36*.md|log`, `f4*.md|log`. Read their "Missing copy" and "Decisions I made" lists, re-run tsc, copy-gate, build and verify yourself, and look at f4-info.png, f4-contact.png and f4-work-page.png.
- Gemini tach research failed twice (turn cap, one page opened). Dropped; spec in REDESIGN section 14 stands.
- After F4: copy passes, Design Loop critics, impeccable detect, preship 20, twinkle audit, then production only on Adnan's word.
- **Update, 01:40:** F3.6 committed as `6ae0419` (2 real fixes, 8 findings judged false). Level 3 galaxy archived to branch `archive-level3-galaxy` (the create-next-app site was already on `old-site-archive`). `main` fast-forwarded to level4: **Level 4 is live in production** at addyrallxx-site.vercel.app. F4 relaunched with Adnan's changes: the tach leaves the chrome and lives in the Info E92 block (sweeps when the block enters view); page transitions per REDESIGN 6.5, segerman.dev style; Codex pushes `level4:main` after each fully green part. Check `briefs/f4-progress.md` and the live site first.
- **Update, late:** F4 stopped before anything went green and was folded into **F5** (`briefs/f5-combined.md`, log `f5.log`, progress `f5-progress.md`). Adds Adnan's asks: always night on load; globe as brand colour logos only, no text; the E92 as its own home section `#e92` with the tach, photos and specs; the E92 card replaced in Other things by "Class steward"; a `/school` page (copy in `SCHOOL`, vault facts only). **Claude still needs from Adnan: his course list and anything else for /school** (no grades or courses are on the site yet). Codex deploys each green part to main.
- **Update, 02:50:** F5 parts 1 to 8 are live (always night, tach out of chrome, colour logo globe, Taste, Method, Info, the E92 section with tach and photos, three typographic cards, /school with coursework, hidden FAQ). Codex hit its usage limit (reset 04:57). **Windows scheduled task `portfolio-codex-f8` runs `briefs/run-f8.sh` at 05:05**: F8 = globe colour fix (TypeScript and Kotlin came out white), Contact, /work pages, page transitions, the new 12 hour clocks with sun and moon figures (`briefs/f7-clocks.md`), a scrim under the bottom chrome, a no-grades check on /school. Progress in `briefs/f8-progress.md`. Delete the scheduled task afterwards: `schtasks /Delete /TN portfolio-codex-f8 /F`. Never put grades, GPA, student ID or birthdate anywhere (Adnan's transcript is in his Downloads, course names only were used).

### F11 Part A, 2026-10-10
Selected Work now uses sticky stacking cards, masked words, clip morphs, image parallax, velocity skew and cursor followers. Phone cards are sequential with media first. Preserved Claude's content edits. tsc, copy-gate, build and 225 real Chrome checks passed on confirmed own 3100 PID 27288. All eight frame budget configurations passed. F11 progress and screenshot evidence are in the Temp claude/briefs folder. Parts B to H remain.

### F11 Part B, 2026-10-10
Display L heading parallax, entry hairlines, magnetic section pills and 42px/32px globe logos are implemented. Sky and globe now use the existing GSAP ticker, with visibility pause. tsc, copy-gate, build and 229 Chrome checks passed on own confirmed 3100 PID 17200. Eight frame configurations and redundant repeats passed. Part C is in progress and not included in this checkpoint.

### F11 Part C, 2026-10-10
Curved GSAP wipes and centered supplied destination names are complete. Timing is 650ms cover, 180ms hold, 750ms reveal. Shared motion clock is capped at 60Hz and animated Work layers are promoted to meet the unchanged budgets. tsc, copy-gate, build and 225 Chrome checks passed on own 3100 PID 1984. All eight budgets passed; wipe p95 4.3ms. Parts D/H and E are prepared in the working tree, excluded from this checkpoint. G remains.

### F11 Parts D/H, 2026-10-10
The tach and cropped gallery are retired. The supplied 2000x1125 profile now lives in a golden-hour 220vh pinned scene with lens opening, stripe, one sun sweep, build-row reveals and word-masked sign off. Phone, no-JS and reduced motion show complete unpinned content. tsc, copy-gate, build and 218 real Chrome checks passed on own 3100 PID 26908. All eight budgets and both pinned budgets passed. Grain panel cropping verified visually. E remains pending in the working tree; G remains.

### F11b completion, 2026-10-10
Part E glyph physics shipped as 560163c. Contact now uses CONTACT.mail and shows the address once. All five WORK_META labels are wired into every project page. Physics self-check, TypeScript, copy-gate and production build passed. Full real Chrome suite: 238 checks, all eight frame configurations and both E92 pinned budgets passed on confirmed own 3100 PID 25304, no runtime or HTTP errors. Screenshots are in Temp claude/briefs; project metadata capture inspected. Initial E run failed an existing wipe timing lower bound at 628.4ms; unchanged repeat and final local run passed, thresholds unchanged. Production acceptance is pending the final push and live verify; see f11-progress.md for the final result.
