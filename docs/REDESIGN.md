# Level 4: "Two skies". Design direction of record (2026-10-09)

Owner of taste: Claude (Opus). Builders implement this document exactly. If
something here is impossible, stop and report; do not improvise a look.

Supersedes the "deep field, paper break" system in `docs/DESIGN.md` (the
galaxy, cosmos bloom, starfield, hero object, skill sphere, coverflow and
warm paper band are all retired).

## 1. Thesis

Calgary and Dhaka sit twelve hours apart. When Adnan's day starts in one city
it is night in the other. The site is built on that fact: **two skies, one
page.**

- **Day** is the front world: warm paper, navy ink, photos in grain duotone.
- **Night** is the back world: a real prairie night sky drawn in a shader,
  stars, the Milky Way band, a faint aurora at the horizon.
- The cursor leaves a **fluid trail that opens a hole in the day** and shows
  the night underneath. In night mode the trail lights up the aurora.
- The mode toggle sweeps one sky into the other with a noise warped edge.
- The site opens in whichever sky Calgary is under right now (07:00 to 19:00
  local Calgary time is day), and remembers the visitor's own choice after.

Reference credit (structure and mechanism only, no code, words or assets
copied): segerman.dev (two-world reveal, intro counter, wipe transitions),
brookebeswick.com (card fan), morez.co (falling glyph footer).

The page is sparse. One huge headline per screen, everything else small and
quiet. Restraint is the expensive look; the sky does the showing off.

## 2. Tokens

Set as CSS custom properties on `:root[data-mode="day"]` and
`:root[data-mode="night"]`. Every colour on the site comes from this table.

| Token | Day | Night | Use |
|---|---|---|---|
| `--bg` | `#F3F0E8` | `#030817` | page ground (the shader paints it, CSS is the fallback) |
| `--ink` | `#0A0F2C` | `#EEF1FA` | all primary text |
| `--ink-2` | `#5C6178` | `#9AA3C0` | secondary text, labels |
| `--ink-3` | `#9A9DAA` | `#5D6684` | tertiary, disabled, index numbers |
| `--line` | `rgba(10,15,44,.12)` | `rgba(238,241,250,.12)` | hairlines |
| `--accent` | `#2340FF` | `#8EA2FF` | THE one accent: links on hover, focus ring, toggle, live dot |
| `--panel` | `#0A0F2C` | `#F3F0E8` | page transition wipe panel (always the opposite world) |

Contrast floors, checked: `--ink` on `--bg` is above 15:1 in both modes;
`--ink-2` on `--bg` is above 4.5:1 in both modes (day 5.6:1, night 7.4:1).
`--ink-3` is never used for text a reader needs.

Glyph palette (falling symbols only, illustration not UI):
`#2340FF #F2A93B #0F7A4A #E8687A #7FB2E5 #0A0F2C` (day) and the same with
`#EEF1FA` replacing the ink in night.

Radius: `--r-sm 6px`, `--r-md 14px`, `--r-pill 999px`. No shadows anywhere
except the card fan (one soft shadow, `0 18px 40px -18px rgba(10,15,44,.35)`).

Spacing unit `--u: clamp(16px, 1.6vw, 28px)`. Gutters `--gutter: clamp(16px, 2.2vw, 36px)`.

## 3. Type

Two families, both free on Google Fonts, loaded with `next/font/google`:

- **Archivo**, variable, `wdth` 125, weight 800, uppercase, for display only.
  `font-variation-settings: "wdth" 125`. Tracking `-0.01em`, line height `0.86`.
- **Instrument Sans**, weights 400 and 500, for everything else.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Display XL (hero) | `clamp(56px, 11.5vw, 188px)` | Archivo 800 | uppercase, 2 lines max |
| Display L (section) | `clamp(40px, 7vw, 120px)` | Archivo 800 | uppercase |
| Title | `clamp(20px, 1.6vw, 26px)` | Instrument 500 | project names, tracking `-0.01em` |
| Body | `16px` (17px at 1440+) | Instrument 400 | line height 1.5, max 60ch |
| Small | `14px` | Instrument 500 | nav, meta, line height 1.3 |
| Label | `12px` | Instrument 500 | uppercase, tracking `0.08em`, `--ink-2` |

No mono font. Tabular figures (`font-variant-numeric: tabular-nums`) on clocks,
counters and years.

## 4. Layout, home page `/`

All sections share a 12 column grid with `--gutter` gutters. Fixed chrome
sits on top of everything.

**Fixed chrome** (always visible, `position: fixed`, 14px Small):
- top left: `Adnan Shakib` (link to `/`).
- top right: `Work`, `Info`, `Contact` (anchors), then the sky toggle
  (36px circle button, sun or crescent, see 6.4).
- bottom left: two live clocks, `Calgary 21:14` and `Dhaka 09:14`, each with a
  6px dot: filled `--accent` if that city is in daytime, outlined if night.
- bottom right: `Open to summer 2027 internships` with the accent live dot.
- Phone (under 720px): top bar keeps name and toggle, nav collapses into a
  `Menu` text button opening a full screen sheet; bottom chrome hides after
  the hero.

**1. Hero** (100svh). Display XL headline anchored bottom left above the
clocks, lead paragraph (Body, max 34ch) in column 9 to 12 aligned to the
headline baseline. Nothing else. The sky is the image.

Decision 2026-10-10 (the type does not fit columns 1 to 8): the headline
spans the full width, columns 1 to 12, two lines at desktop, on the bottom
of the hero above the clocks. The lead moves ABOVE the headline, columns 8
to 11, with `calc(var(--u) * 1.5)` below it. Under 720px the headline wraps
to three lines (SYSTEMS / WITH / TASTE) at the 56px minimum: that stack is
the phone design, not a fallback, and wrapped lines still rise inside their
authored mask. Phone lead is full width above it.

Decision 2026-10-10, Adnan ("this is my portfolio, it acts like a resume",
"don't just boast systems with taste"): a facts row sits between the lead and
the headline, four items from `HERO.facts` (Studying, Running, Taking over,
Looking for), Label over Small, hairline above, 4 columns at desktop, 2x2 on
phone. A recruiter reads who, where, when and what next without scrolling.

**Section order, revised 2026-10-10:** Hero, Work, Other things, Alongside
school, Taste, Tools (skill sphere), Services, How I work, Info, Questions,
Contact. Questions is written last (Adnan); the section ships hidden while
`FAQ.items` is empty.

**Alongside school** (`SIDE`). Four hairline rows like Work, no links:
Puzzled, TotalTex, Handled AI (CPSC 598 capstone), the studio.

**Tools, the skill sphere** (Adnan: keep it, bring it to this system). The
old `img-sphere.tsx` (commit 59f0628) comes back rebuilt: Simple Icons
mono, drawn in `--ink` (day) or `--ink` night, no brand colours, labels
in Small on hover; drag to spin with inertia, slow idle spin, pauses when
offscreen or hidden. Transform only, one rAF, items keyed by `name`
(never slug; see the CLAUDE.md duplicate key trap). Beside it the grouped
plain list (recruiter skim plus fallback). Reduced motion: static sphere.

**Services** (`SERVICES`). Display L two lines `WHAT I'LL` / `BUILD YOU`,
then four rows in the Work index style (name, one line), then a pill to
#contact. Numbered 01 to 04.

**Questions** (`FAQ`). Hairline accordion, native `<details>`, Title
questions, Body answers. Last copy task.

**2. Work** (`#work`). Label `Selected work` top left. A full width index:
one row per project, 1px `--line` between rows, each row 96px tall at
desktop: index number (`01`, Label style, `--ink-3`), project name (Title),
one line of what it does (Body, `--ink-2`), kind and year at the far right
(Small). Hovering a row: the name shifts right 12px (240ms), a 320x220
preview image follows the cursor (lerp 0.12, rotated by horizontal velocity,
clamp 6deg), image in duotone until hover holds 400ms then blooms to colour.
Each row links to `/work/[slug]`. On touch, no floating image: the image sits
inline in the row at 88px tall.

**3. Other things** (card fan band, technique in vault
`wiki/resources/techniques/card-fan-hover.md`). A full width rounded band
(`--r-md`, 1px `--line` border, transparent ground so the sky shows):
display L word `OTHER` left, the 3 card fan centre, `THINGS` right. Fan
values exactly as the vault page, scaled 1.4x at 1440. Links to `/work`.

**4. Taste** (`#taste`). The statement section. Display L, three short lines,
each line its own masked reveal on scroll. Then one Body paragraph in
columns 7 to 12.

**5. How I work.** Three rows, same hairline index style as Work but no
links: number, principle (Title), one sentence (Body `--ink-2`).

**6. Info** (`#info`). Two columns. Left: portrait slot (4:5, `--r-md`; empty
until Adnan supplies a photo: show nothing rather than a placeholder head)
and the short bio. Right: compact lists with Label headers: `Now`,
`Before`, `School`. Plain text lists, no logos (tools moved to the sphere).

**7. Contact** (`#contact`). Display XL `LET'S BUILD` / `SOMETHING`. Under it
a pill button with the email (copies to clipboard on click with a
`Copied` swap, and a separate mailto link), and text links LinkedIn, GitHub,
WhatsApp. Below, a 360px tall glyph pit where the falling glyphs land (6.6).
Footer row: `© 2026 Adnan Shakib`, `Built by hand in Calgary`, back to top.

## 5. Project pages `/work/[slug]` and `/work`

`/work/[slug]`: hero with Display L project name, a row of meta (Kind, Year,
Stack, Status or live link), one lead paragraph, a full bleed image or
video, then `What it does` as three or four short lines, then a 2 up image
grid if images exist, then `Next project` as a full width link with the next
name in Display L. No long case study prose.

`/work`: the same index as the home Work section plus the smaller things.

## 6. Motion

GSAP for timelines, Lenis (already mounted, `lerp 0.1`) as the only smooth
scroll. Easing tokens: `--ease-out: cubic-bezier(.16,1,.3,1)` (expo out),
`--ease-inout: cubic-bezier(.76,0,.24,1)`. UI interactions 150 to 300ms.
Under `prefers-reduced-motion: reduce` everything renders in its final state,
the fluid trail and shooting stars are off, the toggle switches instantly.

### 6.1 Intro (first visit per session only, sessionStorage `intro-seen`)
Revised 2026-10-10 per Adnan: no zero padded counter, it starts blank.
Concept: **a horizon draws, then day and night open along it.**
- Overlay is two halves (top and bottom), each `position: fixed`, `--bg`
  ground, meeting at the vertical centre. Content is server rendered
  underneath and never gated; a CSS animation removes the overlay after 5s
  if JS never runs.
- 0 to 300ms: blank. Nothing on screen but the ground.
- Horizon: a 1px `--ink` line across the full width inside `--gutter`, at
  the seam, `transform: scaleX(p)` from the left (`p` = displayed progress
  0 to 1), drawing from 300ms.
- Number: unpadded integer (1, 2 ... 100), never shown as 0 or 000. Appears
  when the value reaches 1. `clamp(40px, 6vw, 96px)`, Archivo 800 wdth 125,
  tabular, sitting just above the line and riding its tip (`translateX` =
  line tip minus number width, clamped inside the gutters). Each digit is
  its own overflow hidden column: when a digit changes, the new digit rises
  from `yPercent 100` to 0 and the old leaves to `-100`, 160ms
  `--ease-out` (an odometer).
- Under the line at the left: Label with the two live clocks as two spans
  with a gap, fading in over 400ms at 500ms.
- Progress: `d += min(min(real, elapsed/2000) - d, 0.9 * dt)` where real is
  fonts plus first sky frame ready. Minimum 2000ms.
- Exit at 100: the number rolls up and out (`yPercent -110`, 450ms
  `--ease-inout`); 150ms later the halves part, top `yPercent -100`, bottom
  `yPercent 100`, 1100ms `--ease-inout`; the line rides the lower edge of
  the top half and fades over the last 250ms. The sky canvas fades 0 to 1
  over 1200ms underneath. Hero lines rise (`yPercent 105` to 0, 1000ms
  `--ease-out`, 90ms stagger) from 700ms into the part; chrome fades in at
  1200ms.
- Only `transform` and `opacity` animate. Fires `intro:done` once per load,
  immediately when skipped (reduced motion or `intro-seen`).

### 6.2 Sky canvas (`components/sky/`)
One fixed full viewport WebGL canvas, `z-index: 0`, `pointer-events: none`,
`aria-hidden`. Content sits above it at `z-index: 1` with transparent
grounds. Three.js `WebGLRenderer` with a full screen triangle, DPR capped at
1.5 (1.25 on coarse pointers), paused when `document.hidden`. Blur only drops pointer state (2026-10-10:
pausing on blur froze the sky on a visible second screen).

Layers inside one fragment shader:
- **Day**: `--bg` paper plus a 2.5 percent static grain and a very soft
  warm vignette. Must read as paper, not as a flat hex.
- **Night**: base gradient `#030817` (top) to `#08143A` (bottom 30 percent),
  a Milky Way band (fbm noise, 2 octaves of domain warp, diagonal, max
  brightness 0.16, tinted `#9DB4FF` to `#F2D6B3`), and **three star layers**
  on hashed grids, one star per cell: cell scales 240, 160 (rotated 17deg),
  90; thresholds .86, .975, .995; per star size from hash; colour
  `mix(vec3(1,.86,.68), vec3(.62,.74,1), hash)`; core `smoothstep(soft,0,d)`
  plus a 0.25 halo; **twinkle** on layers 1 and 2 only:
  `0.75 + 0.25 * sin(t * (1.5 + 3.0*h) + 6.28*h)`. Layer 3 (rare bright
  stars) gets a 4 point diffraction glint (two thin crossed lines, length 6x
  core, alpha 0.35). The whole field rotates about a point above the top
  left at `t * 0.004` rad/s and parallaxes with scroll: layer 1 at 0.02,
  layer 2 at 0.05, layer 3 at 0.09 of scrollY in screen space.
  **Shooting stars**: every 1.2s block has a 22 percent chance of one, 0.8s
  long, warm white streak with a fading tail, never during the intro.
  **Horizon**: the bottom 18 percent of the viewport gets a faint aurora
  curtain (vertical fbm, colours `#2BD49A` to `#7A5CFF`, max alpha 0.10
  normally).
- **Fluid trail**: a small stable fluid sim (Pavel Dobryakov's
  WebGL-Fluid-Simulation approach, MIT, credit it in a comment) at sim res
  128, dye res 512, 12 pressure iterations, curl 0. Pointermove with speed
  above 0.2px adds a splat of velocity `delta * 3`, dye .012 and radius
  `clamp(speed, 0, 2.5) * 0.01` (day) or `clamp(speed, 0, 6) * 0.01` (night).
  Dissipation density 2.8 day, 2.2 night, velocity 1.0, so a stroke is gone
  in about half a second. Retuned 2026-10-10 after Adnan: the first values
  (radius 6/14, density .74/.86) revealed too wide and lingered. The trail mask is
  `m = 1 - smoothstep(.001, .004, length(dye))`.
- **Composite**: day mode shows `mix(night, day, m)`, so the trail opens the
  night under the paper. Night mode shows night with the aurora alpha raised
  to 0.55 inside the trail, so moving the mouse lights the aurora.
- **Mode sweep**: uniform `uMode` 0 day, 1 night. On toggle, `uSweep` tweens
  0 to 1 over 1800ms `power4.out`; the boundary is
  `edge = smoothstep(uSweep - .03, uSweep + .01, uv.y + noise(uv*3 + t)*.06)`
  rising from the bottom (to night) or falling from the top (to day), with
  a 1.5 percent chromatic split on the edge. CSS tokens switch at the same
  moment the sweep passes 50 percent (one class swap, colours transition
  300ms), so text never sits in the wrong contrast for longer than that.
- Fallback: if WebGL fails or reduced motion is on, the canvas is replaced by
  a static CSS background (`--bg`, plus a pre-rendered night PNG in night
  mode, generated once from the shader by a script, `public/sky/night.webp`).

### 6.3 Scroll choreography
- Display headings: per line masked rise (`yPercent 105` to 0, 1000ms
  `--ease-out`, stagger 90ms) when 80 percent into view. Split by line
  wrappers authored in JSX (no SplitText dependency), aria label on the
  parent, decorative spans `aria-hidden`.
- Body copy: fade plus 12px rise, 600ms, once.
- Work rows: hairline draws left to right (scaleX 0 to 1, 900ms) as each row
  enters, stagger 60ms.
- Nothing scrubs except the star parallax.

### 6.4 Toggle
36px button, `aria-label` "Switch to night sky" or "Switch to day sky",
`aria-pressed`. Icon is two circles in SVG: a disc and an offset masking
disc; day shows the full disc (sun), night slides the mask disc in to make a
crescent (400ms `--ease-inout`). On hover the icon rotates 20deg and scales
1.1 (200ms). Writes `localStorage.sky`, sets `document.documentElement.dataset.mode`.

### 6.5 Page transitions
Next App Router. A client `TransitionLink` intercepts same origin clicks to
`/work...` and `/`: panel (`--panel`) wipes up from the bottom over 600ms
`--ease-inout`, `router.push`, then on the new route the panel wipes off the
top over 700ms and the new page's display heading runs its line rise. Back
and forward buttons skip the wipe. Reduced motion: no panel.

### 6.6 Falling glyphs (contact pit)
DOM physics, no library. Nine glyph elements set in Archivo 800 (and one in
Noto Sans Bengali 700 for the Bangla letters, loaded only for that
element): `অ`, `✦`, `&`, `{ }`, `৳`, `A`, `S`, `→`, `★`. Sizes 72 to 180px
scaled by container width / 1440, colours from the glyph palette. Trigger:
IntersectionObserver at 0.3, once. Physics per the vault recipe
(`wiki/resources/techniques/falling-glyphs.md`), but frame rate independent
(scale by `dt/16.67`), gravity .45, bounce .55 (less bouncy than morez, it
should settle within 1.5s), friction .01, rotation damping .96,
circle collisions. Draggable with pointer events, release velocity
`delta * .3`. Loop stops when every body's speed is below .05 for 30
frames, and restarts on drag or resize. Reduced motion: glyphs placed
directly in a settled resting row, no animation.

### 6.7 Image treatment
Project images in day mode are grain duotone: `filter: grayscale(1)
contrast(1.12)` plus a `::after` with `background: var(--ink);
mix-blend-mode: screen` at opacity .0 and a `::before` of
`public/textures/film-grain-A.webp` at opacity .18 `mix-blend-mode:
multiply`. On hover (400ms hold) or on the project page, the filter
transitions to none over 700ms. In night mode images are always full colour.

### 6.8 Frame budget (Adnan, 2026-10-10: "smoothness and 60 fps is a must")
Hard gate, not a goal. Measured in real Chrome with puppeteer-core over a
scripted 6s scroll plus pointer sweep at 1440x900 and 390x844: frame time
p95 under 16.7ms, no long task over 50ms after the intro, and the same run
at 4x CPU throttle p95 under 33ms. Rules that keep it there: animate only
`transform`, `opacity`, `clip-path` and shader uniforms; never `filter`
except the one image bloom; the sky renders at most 1.5 DPR and drops its
fluid and star passes to 0.75x resolution if a 2s rolling average exceeds
14ms; one rAF loop owns the canvas, GSAP's ticker drives Lenis; no layout
reads inside animation frames; `will-change` only while an element moves.

## 7. Interfaces pinned (parallel builders must not change these)

- Mode state: `document.documentElement.dataset.mode` is `"day"` or
  `"night"`. Set before paint by an inline script in `<head>` (reads
  `localStorage.sky`, else Calgary hour via `Intl.DateTimeFormat` with
  `timeZone: "America/Edmonton"`). Toggle changes it and dispatches
  `window` event `sky:mode` with `detail: { mode: "day" | "night" }`.
- The sky canvas listens to `sky:mode` and to `intro:done`.
- Intro dispatches `intro:done` exactly once per page load.
- Copy lives only in `lib/content.ts`. Components import from it.

## 8. Protocol compliance (Jack Roberts blueprint, vault `claude-design-blueprint.md`)

- Job: "Show a stranger in one screen that Adnan ships real business systems
  and has taste, then get them to contact him." Reference to beat:
  segerman.dev first screen; morez.co footer.
- `bar.md` at repo root, shown to Adnan, waits for go.
- Direction skill: **impeccable** (one only). Its `detect` is the automated
  gate. Tastemaker, emil-design-eng and apple-design are advisors on motion
  detail only, not directions.
- Three versions of the home composition on `/lab/1`, `/lab/2`, `/lab/3`
  (safest to boldest) over the same shared sky, captured at 1440 and 390,
  then mixed into `/`.
- Hero gets the Design Loop: fresh Sonnet critics (brief, system, craft),
  binary, renders only.
- Copy: slopmonster checker before and after, humanizer, Codex rival pass.
- Preship 20 at 390 and 1440 in real Chrome; fails reported first.
- Known deliberate differences from the blueprint, flagged not hidden: hex
  tokens instead of OKLCH; display and hero motion above 300ms (narrative
  motion exception already accepted for this site); Archivo uppercase
  display; no icon set beyond the toggle and Simple Icons social marks.

## 9. Audit backlog (after the stable version)

- Adnan 2026-10-10: star twinkle reads as too much sparkle. Do not edit
  until the stable version ships; then audit amplitude (0.25 now) and which
  layers twinkle, with side by side captures.

## 10. What is deleted

`components/ui/{galaxy,cosmos,starfield,preloader,hero-object,img-sphere,
media-carousel,scroll-tilt}.tsx` and their CSS (`space.css`,
`hero-object.css`, `media.css`, the galaxy parts of `motion.css`), the
skills sphere, `components/chapter/calgary-time.tsx` (replaced by the
clocks), JetBrains Mono, Manrope, Instrument Serif.
`scripts/verify.mjs` is rewritten for the new page (chunk 4).

## 11. The E92 (added 2026-10-10)

Adnan supplied photos (Drive `E92 pics`, local copy `assets-src/e92/`,
gitignored; publish only sharp-processed copies, which strip EXIF and GPS).
Picks (graded 2026-10-10 from Gemini crop and grade recipes, applied with sharp, reviewed on a contact sheet): `20260923_152246` as `bay.jpg` (4:5) and `bay-wide.jpg` (bonnet fully up, halo eyes; replaces 152338, whose bonnet sat on the secondary latch), `Snapchat-202035236` as `night.jpg` (wide profile, plate blurred), `20260521_020131` as `front.jpg` (4:5 night front). Never `IMG_5153` or any sunset frame: it shows the car black, before the Bernina Grey. Never `IMG_6588` (a house is identifiable). It becomes the
fourth card in the Other things fan and a photo in Info. Build detail lives
in Adnan's ChatGPT "E92" project, which no tool here can read: copy waits
until he pastes or exports those notes.

## 12. The stripe (Adnan, 2026-10-10: "I loved the M theme and colour stripe, make it cooler")

Tokens `--m-light: #6CB2E4; --m-dark: #1B4FA0; --m-red: #E7222E`, same in
both modes. Three hard bands, never a gradient, never a background, never
text. No BMW logo or `///M` lettering anywhere (their mark, not ours). It
appears at exactly three moments, each one moving:

1. **Intro finale.** When the count lands on 100, the 1px horizon splits
   into three 2px bands (light, dark, red) that separate to 3px gaps over
   280ms (`--ease-out`). As the halves part, the stripe rides the lower
   edge of the top half and leaves the frame with it.
2. **The tach** (replaces the rev bar, Adnan 2026-10-10: "a proper period
   correct bar with quality detail, no new modern ipad screen type shit").
   An E92 era analogue tachometer, see section 14. The stripe lives on its
   face as the `///` mark. The rev bar and its header slot are removed.
3. **The car.** The E92 card in the Other things fan and the Info car
   photo carry a 3px stripe along their bottom edge. On fan hover the
   stripe on the E92 card wipes in left to right (clip-path, 400ms).

## 13. Tools, the globe (redesign, Adnan 2026-10-10: "proper 60 fps, the new ink colour aligns, much more premium, redesign it if you have to")

Supersedes the sphere paragraph in section 4. The F3 port spun a cloud of
loose icons, ran an O(n squared) overlap pass every frame and never stopped
spinning. The redesign reads as an instrument, not a tag cloud.

- **Globe.** Container 440px (desktop), 320px (max-width 700). A static
  inline SVG behind the items: one circle, an equator ellipse (ry = 0.28r)
  and one meridian ellipse (rx = 0.28r), 1px `--line`,
  `vector-effect: non-scaling-stroke`. It never rotates.
- **Items are pills, every label always visible** (a recruiter skims it
  without hovering): height 30px, padding 0 12px, radius pill, 1px
  `--line` border, ground `var(--bg)` so a front pill covers what is behind
  it, 16px mono icon (CSS mask, `currentColor`) plus the name in Small
  (13px). Null slug: name only. Ink is `--ink` in both modes; hover,
  focus and selection switch border and icon to `--accent`. No brand
  colours.
- **Placement.** Even Fibonacci points on radius 180 (130 at phone), no
  jitter, no runtime overlap pass. Precompute unit positions once.
- **Depth.** Per frame: `translate3d(x, y, 0) scale(s)` with s from 0.62
  (back) to 1 (front), opacity from 0.16 (back) to 1 (front), linear in
  z. Stacking: `z-index` from z quantised to 8 buckets, written only when
  an item's bucket changes.
- **Motion.** Fixed 18deg X tilt, idle spin 6deg/s about Y. Drag rotates
  both axes with inertia (velocity decay 0.94 per 16.7ms, frame rate
  independent); on release X eases back to 18deg (critically damped, 600ms).
  Hovering a pill eases spin to 0 over 400ms so it can be read; leaving
  resumes it.
- **Groups drive the globe.** In the grouped list beside it each group
  title is a button (`aria-pressed`). Hover, focus or tap: that group's
  pills take the accent and a raised opacity floor (0.5 even at the back),
  every other pill caps at 0.3, and the globe turns so the group's
  centroid faces front (700ms, `--ease-out`). Pressing again or Escape
  clears it. This is the resume link: the list says what, the globe shows
  how much.
- **Budget.** One rAF, zero per frame allocation (preallocated typed
  arrays), transform and opacity only, `contain: layout paint` on the
  globe, `will-change` only while running. Stops when offscreen
  (IntersectionObserver), hidden, or reduced motion. p95 at most 16.7ms at
  1x and 33ms at 4x CPU while spinning, at 1440x900 and 390x844. DOM node
  count flat over 3s.
- **Reduced motion.** Static at tilt 18deg, Y 25deg; group highlight still
  works, without the turn.

## 14. The tach (replaces the rev bar)

An E92 era analogue tachometer: a physical instrument, not a screen. No
glass reflections, no glow rings, no digital readout, no gradients beyond
the bezel and a faint face vignette.

- **Place and size.** Fixed chrome, bottom left (the clocks and
  availability shift right of it). 88px at desktop, 64px at max-width 700.
  Inline SVG, viewBox 0 0 200 200, `aria-hidden`.
- **Face.** Black (#0B0B0C) with a static radial vignette to #000 at the
  rim. Bezel: a 3px ring, linear gradient #A7A9AD to #2B2C2F (top left
  to bottom right) for brushed metal, then a 1px #000 inner ring. The face
  stays black in both modes; on paper it reads as a real object.
- **Scale.** 0 to 8 (x1000 rpm) over a 240deg sweep, 0 at lower left, 8 at
  lower right. Major ticks every 1000 (length 9% of radius, 2.2 units
  wide), minor every 500 (5%, 1.2 units). Numerals 1 to 8 in Instrument
  Sans 600, size 17% of radius, upright.
- **Red zone.** 7 to 8: a 5 unit arc at the rim in #D9231E; numerals 7 and
  8 in the same red. (The N54 redline is 7000.)
- **Illumination.** Day: ticks and numerals #ECEAE4. Night
  (`[data-mode="night"]`): ticks and numerals #FF8C2E, the E9x orange,
  crossfaded over 300ms. No glow filter.
- **Legend.** `1/min x1000` small under the 4, from `lib/content.ts`
  (`CHROME.tach`), same ink as the numerals at 55% opacity.
- **The `///` mark.** Below the hub at 32% radius: three parallelograms,
  6 by 16 units each, skewX(-20deg), 3 unit gaps, `--m-light`, `--m-dark`,
  `--m-red`. No letter.
- **Needle.** #FF4A12, tapered from 5 units at the hub to 1.6 at the tip,
  reaching 80% of the radius, with a 22% counterweight tail in #B8350C.
  Hub cap 18% of radius, #121212, 1px #3A3A3A ring, a 1 unit #2F2F2F
  highlight arc at the top. Only the needle group moves: one `rotate()`
  transform about the hub, `transform-box: view-box`.
- **Behaviour.** Rests at idle, 800 rpm, never 0. Target rpm = 800 +
  min(|Lenis velocity| x 160, 7400). Spring: stiffness 180, damping 22
  (slightly under damped, so it reads as mechanical), frame rate
  independent, dt clamped to 50ms. At or above 7000 for more than 120ms,
  the limiter cuts: the target drops 350 rpm for 90ms, then returns, and
  repeats while held. One rAF that idles when settled within 5 rpm of the
  target.
- **Start sweep.** On `intro:done`, the needle sweeps to 8 and back to idle
  over 900ms (the coded E9x gauge sweep). Once per load.
- **Reduced motion.** Static at idle, no sweep.

### F3.5 implementation notes (2026-10-10)

The tach and globe follow sections 13 and 14. Section 12 moment 2 is the
bottom-left tach, with the header rev bar deleted. No threshold was raised.

**Decisions I made where the spec is silent:**

- The tach uses a 90-unit working radius inside the 200-unit SVG, with room
  for the bezel. The legend is 8 units. The 900ms sweep uses a sine-squared
  curve, reaching 8000 rpm halfway through and returning to 800 rpm.
- Pills have an 8px icon-to-name gap. A selected group holds its centroid
  facing front until cleared; then idle spin and the 18deg tilt return.
- Hover spin uses a 100ms exponential time constant (about 98 percent
  settled after the specified 400ms). The X return uses a critically
  damped rate of 12 per second (about 99 percent settled after 600ms).
- The phone availability text is capped at 125px to fit the 64px tach and
  the clocks in the existing bottom chrome.
- Work previews keep their image-change remount, which resets the specified
  colour bloom. A layout effect positions each new preview before paint.

**Phone profiling:** a cold 390x844, 4x CPU profile reproduced a 61ms task.
The sky scroll handler's native scrollY read synchronously flushed pending
styles, including 12.6ms of UpdateLayoutTree in that task. Chrome also read
hero geometry and rewrote its boundary attribute on every scroll. Hero
height now comes from ResizeObserver; the attribute changes only at a
boundary crossing. Chrome and sky use Lenis's cached animated position
while smooth scrolling, with the native position retained for native scroll.

Before the final cached-position fix, one trace showed 176 forced style
updates and 16 forced layouts inside 357 sky scroll calls. After the fix,
411 calls caused zero forced style updates and zero forced layouts. Three
cold profiled phone samples passed at p95 24.9, 20.9 and 20.9ms, with no
long tasks. Traces and CPU profiles are in the temporary briefs folder;
f35-profile-61ms.json preserves the reproduction.

**Outside review dispositions:** the review was absent at task start and
appeared during implementation. HIGH 1 is resolved by deleting RevBar and
using a 5 rpm settling tolerance in Tach. HIGH 2 is confirmed and fixed by
positioning Work previews before paint. HIGH 5 is confirmed and fixed by
removing the globe overlap pass and transient projection objects. HIGH 6
is confirmed and fixed with one accessible Other things heading, a concise
link name and a decorative fan hidden from assistive technology.

HIGH 3 is false: the existing reduced-motion rule already sets animation:
none !important for all elements and pseudo-elements. HIGH 4 is false for
current Safari: WebKit documented unprefixed mask support in Safari 15.4
(https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/). MEDIUM 7
is false: the cited CSS is already enclosed in @layer components. The
remaining lower-severity review items are outside this brief's required
HIGH fixes. Physical phone and Safari testing was not performed.

**Final exit checks:** TypeScript, copy gate and production build pass.
npm run verify passes 125 real-Chrome checks against the owned 3100 server
(PID 7588, confirmed with netstat). All eight required budgets pass, plus
two extra phone 4x scroll repeats. The final phone 4x scroll p95 readings
are 12.6, 12.6 and 12.6ms. Desktop scroll is 4.3ms at 1x and 16.7ms at 4x;
desktop globe is 4.4ms at 1x and 12.6ms at 4x; phone scroll is 4.3ms at 1x;
phone globe is 4.3ms at 1x and 12.5ms at 4x. Every sample has zero long tasks.
The harness verifies that the globe spins during each globe budget sample.

Captures: f35-tach-day.png and f35-tach-night.png are 1000px-wide bottom
viewport regions captured before the first page scroll. f35-globe.png is
a 1000px-wide viewport after scrolling, with Languages pressed. All use
deviceScaleFactor 1 and live real Chrome. Files are under
C:/Users/adnan/AppData/Local/Temp/claude/briefs/. No physical handset or
Safari run is claimed. No conflict between this brief and the design spec
required an exception.
