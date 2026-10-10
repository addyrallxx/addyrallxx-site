# Portfolio rebuild handoff

Read `GOAL.md` first (cold-start plan of record, carries the Level 4
objective), then this file for current state, then `CLAUDE.md` for operating
rules, then `docs/REDESIGN.md` (design of record) and `bar.md`. `PLAN.md`
sections 1 to 7 still carry the narrative spine and confidentiality rules.

## Current state (2026-10-10): Level 4 "Two skies", foundation and hero shipped, F3 on final verification

### Handoff, 2026-10-10 01:15 (session ending on usage)

Pushed: 14161c1 (Codex F3 sections) and 939e853 (graded E92 photos, REDESIGN 13 globe and 14 tach specs). Running unattended when this was written, read their logs before anything else:
1. Codex F3.5 (tach, globe, phone 4x scroll spike): brief and log in C:/Users/adnan/AppData/Local/Temp/claude/briefs/f35-*.
2. Codex F3.6 starts automatically after F3.5: fixes the Gemini review findings (review at C:/Users/adnan/AppData/Local/Temp/claude/gem-f3rev/review.md), log briefs/f36.log, findings table briefs/f36-progress.md.
3. Gemini research on the real E92 tach: C:/Users/adnan/AppData/Local/Temp/claude/gem-tach/tach.md. Compare its table to REDESIGN section 14 and adjust the tach values.
Then: re-run tsc, copy-gate, build and verify on YOUR OWN 3100 server (my run of F3 failed phone 4x scroll at p95 33.3ms with a 61ms long task; F3.5 must fix it). Review f35-tach-day.png, f35-tach-night.png, f35-globe.png. Next copy job: E92 car copy from vault .raw/e92/2026-10-10-chatgpt-build-breakdown.md (all seven carbon pieces confirmed; never say wrapped or painted; HP figures are tune estimates).

Branch `level4`, three commits on top of `59f0628`, pushed:

- `5e46a5a` Level 4 foundation: two skies, new tokens, chrome, intro.
- `9e558ef` Horizon intro with an odometer number (starts blank, counts 1 to
  100, never shows 0 or 000), full width hero with a 4 item facts row
  (Studying, Running, Taking over, Looking for), calmer fluid trail, the sky
  pauses only on `document.hidden`, `scripts/level4-check.mjs` replaces
  `verify.mjs`. 52 real Chrome checks pass, including p95 frame budgets at
  1440 and 390, at 1x and 4x CPU.
- `ade9967` Stripe and E92 spec in `docs/REDESIGN.md` (sections 11 and 12),
  E92 photos in `public/e92`, EXIF stripped.

The working tree also holds uncommitted F3 work (see below). Production
(`rebuild` branch, `addyrallxx-site.vercel.app`) is untouched. Preview:
`addyrallxx-site-git-level4-addyrallxxs-projects.vercel.app`, behind Vercel
SSO (a curl or harness against it measures a login redirect unless a share
token is used).

### In flight right now

Codex **F3** (stripe with rev bar, intro finale split and E92 card; Work
index; Other things card fan with the E92; Alongside school; Tools sphere;
Services) is on its final verification rerun. Its progress file reports green
TypeScript, copy gate, production build and design detector, plus real Chrome
confirmation of the stripe colours, Work cursor follow, fan matrices, rev bar
behaviour, sphere item count and flat DOM. A first full 91-check run failed
only a long-task gate (isolated 130ms and 54ms tasks); a CPU-profiled
reproduction passed (p95 4.3ms at 1x, 12.6ms at 4x) and thresholds were kept.
Codex owns `app/`, `components/`, `scripts/`, `lib/` and globals while it
runs. Read its actual diff and re-run `scripts/level4-check.mjs` before
believing any summary. Do not commit while it still has files open.

### Next

- Process F3 (review diff, rerun checks, commit).
- Redesign the rev bar as a period-correct E92-era analogue tach (no modern
  screen look); redesign the skill sphere (60fps, premium, ink colour
  aligned); grade and polish the E92 photos.
- Write the E92 copy from the vault page `second-brain/wiki/entities/E92 335xi
  (Project Car).md` (colour copy: only "BMW Individual Bernina Grey"; power
  figures are tune estimates, not dyno).
- **F4:** Taste, How I work, Info, Questions (written last, ships hidden
  while `FAQ.items` is empty), Contact glyph pit, `/work/[slug]` pages, page
  transitions.
- Then: copy passes (humanizer plus a Codex rival pass), Design Loop critics
  (hero), `impeccable detect`, preship 20 at 390 and 1440, the twinkle audit
  (Adnan says stars twinkle a bit too much; audit only AFTER a stable
  version, side by side captures, amplitude 0.25 and which layers twinkle),
  then production, only when Adnan says so.

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

Production, the `rebuild` branch, and anything under `totaltex-ops/samples/`.

## Settled decisions, carried forward

Still true: graduation April 2028; public email
`adnanshakib.business@gmail.com`; LinkedIn and GitHub only; staying on the
vercel.app URL; TotalTex named outright, Adnan taking over as managing
director; Puzzled started 2023, worked with more than seven Calgary
dealerships and dealer families; Claude writes copy, Codex reviews, Gemini is
excluded from copy. Adnan grades progress in named Levels, not chunk numbers.

## Deployment

Git origin `github.com/addyrallxx/addyrallxx-site.git`. Branch `rebuild`
feeds production `addyrallxx-site.vercel.app`; branch `level4` pushes to a
Preview. Vercel Deployment Protection is ON; a preview needs a Vercel login
or a temporary share link from the Vercel MCP `get_access_to_vercel_url`
(expires after 23 hours). Do not disable deployment protection (account
setting, never authorised). Level 4 reaches production only when Adnan says so.

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
