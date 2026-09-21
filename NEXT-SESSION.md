# Portfolio rebuild handoff

Read `GOAL.md` first now, it is the cold-start document and survives session
resets. Then this file for current state. Then `CLAUDE.md` for operating
rules. Then `PLAN.md` sections 1 to 7 for the narrative spine and
confidentiality rules (its Three.js-specific technical sections are
superseded).

Last updated **2026-09-20, Level 3 (complete pending photography).** Branch
`rebuild`, HEAD `f4a5627` ("Stop the harness measuring the intro overlay
instead of the page"), on top of `b9aea76` ("Two real shape morphs, and a
background that actually reacts"). Both are deployed. Production is
`addyrallxx-site.vercel.app`, publicly reachable, serving `b9aea76` as
`dpl_5Adw1ftDjN2QL2b377oQWRGMGNt7`, state READY. **The verification below
ran against that live URL, not against localhost.**

## The headline: Agent J's unfinished motion pass is closed, two real shape morphs shipped, and the nebula finally has visible depth

Commit `b9aea76`, later the same day as `19c7692` below, did three things.

**First, it closed out Agent J's motion pass from the previous session.**
Agent J died to the Codex usage limit partway through a brief covering
motion and morphing across every remaining section, and never wrote a
report. Checked directly against the diffs rather than trusted from any
summary: Agent J had finished `experience.tsx`, `next-up.tsx`, `skills.tsx`
and `work.tsx`, and never started `about.tsx`, `currently.tsx` or
`education.tsx`. This session covered those three. `about.tsx` had
literally zero scroll motion of any kind before this commit. `education.tsx`
and `currently.tsx` were close behind. `section-heading.tsx` was checked and
needed nothing, it already had `motion-hairline-draw` from an earlier pass.
`mindset.tsx` needed nothing either, and the reason matters: it already
carries a third shape morph, older than either of the two below. Each
principle card's backing animates `inset(12% 5% round 48px)` to
`inset(0% 0% round 16px)` on a real `ViewTimeline`, with an
IntersectionObserver fallback, and only the backing moves so the text can
never clip. Verified running on the live deployment, 6 distinct
intermediate shapes across its entry.

**Second, two more genuine scroll driven shape morphs shipped**, the thing the
Level 3 brief asked for. Counting the `mindset.tsx` backing morph above, the
page now has three. Before this commit it had one, and nothing
real shape morphs on the page, only translate/opacity/blur reveals.

- `.motion-morph-edge` in `app/motion.css`, applied to the warm About band.
  Animates `clip-path: polygon(...)` so the band's top edge arrives as a
  wedge and settles flat. Range `entry 0% entry 18%`.
- A `carousel-frame-morph` keyframe in `app/media.css` on
  `.media-carousel-frame`. Animates `clip-path: inset(9% 0% 9% 0% round
  40px)` to `inset(0% round var(--radius-md))`, so the project media frame
  opens from a rounded letterbox slit into a full rectangle. Written as a
  second comma separated entry inside the frame's existing `animation`
  rule rather than a new utility class, because a second class would set
  `animation` again and silently drop whichever rule the cascade put
  second (see `CLAUDE.md`'s "Known traps").

Measured in real Chrome, not eyeballed: at **1440x900**, a fine sweep of the
About band's own entry window read 6 distinct intermediate `clip-path`
values, the wedge peaking at 28.8px and closing to a full rectangle; the
carousel frame read 11 distinct intermediate values, settling at
`inset(0% round 8px)`. At **390x844 (phone)**, the same sweep read 6 and 10
distinct intermediate values, wedge peaking at 26.9px, so phone parity on
both morphs is confirmed numerically, in real Chrome, not assumed from the
desktop pass. A separate wedge safety probe confirms the wedge only ever
cuts into the band's own top padding, never text: at 1440x900 the first
content inside the About band sits 97px below the band's top edge while the
wedge peaks at 26px; at 390x844 the same clearance is 97px against a 24px
wedge.

**The first probe of these morphs read as a failure and was not.** It swept
the whole page in 13 scroll steps; both morphs run over short ranges, so a
whole-page sweep stepped straight over them and observed only the two
keyframe endpoints, which reads identically to "the animation is not
attached." Re-run at fine resolution over each element's own entry window,
it read the 6 and 11 intermediate shapes above. Full trap writeup in
`CLAUDE.md`.

**These probe scripts live in the session scratchpad, not in this repo.**
They are not committed and not part of `npm run verify`. If the morphs need
re-checking in a future session, the sweep has to be rebuilt; the technique
(fine-step sweep over the element's own entry window, not the whole page)
is what to reuse, not any specific script file.

**Third, the nebula bloom layer now genuinely reacts to scroll.** In
`app/space.css` the three `.cosmos-bloom` elements previously translated
5px to 9px across the entire page height, driven by `--cosmos-progress`.
That is imperceptible. They now translate up to 150px, rotate up to 33
degrees, and scale with scroll depth, each bloom at its own rate and
direction so the field reads as having depth rather than sliding as one
sheet. Measured: the nebula moves from `-3px 2.08px | 0.52deg | 1.0076` at
the top of the page to `-135px 93.6px | 23.4deg | 1.342` at the bottom,
across 12 distinct measured states. The `prefers-reduced-motion: reduce`
block was extended to reset `rotate` and `scale` as well as `translate`.

**Verification for this commit**, all real, all re-run rather than taken on
faith: `npx tsc --noEmit` clean, `npm run build` clean, `npm run copy-gate`
clean (it reported "every rule proved it can still fail"), and `node
scripts/verify.mjs https://addyrallxx-site.vercel.app/` at **58 passed, 0
failed**, including "every request succeeded, no missing assets :: 0 failed
across 81 requests," driven by real Chrome via puppeteer-core.

The count is 58, not 57, because `f4a5627` added a check. If a later commit
message or doc says 57, it predates that commit rather than contradicting
this one. Same shape as the 56 vs 57 note further down: **when a check is
added, grep the docs for the old number in the same commit.**

**`f4a5627` fixed a harness bug the live run exposed, and it is worth
reading before writing any new visual check.** The first live run failed
"above the fold is not blank" at 6,091 lit pixels of 1,296,000 (0.47%),
while the deployed hero was in fact rendering perfectly. Those 6,091 pixels
were the single word of greeting text on the intro overlay, which is
`position: fixed; inset: 0` over the whole viewport and only unmounts once
it has played. Locally it cleared inside the existing 600ms settle, so the
check passed. Over the network it did not, so the harness screenshotted the
overlay and counted it. Same family as the identity check: measuring before
the thing under test is on screen. The harness now waits for `.galaxy-intro`
to leave the DOM before anything visual is measured, and reports that wait
as its own check so a stuck intro says so instead of producing a spread of
blank page failures with no obvious cause. The gate was proved both
directions before being trusted (a selector that never clears returns false,
the real overlay returns true). Same check, same deployment, with the wait
in place: **174,280 lit pixels (13.45%) instead of 6,091 (0.47%).**

**The three shape morphs were confirmed on the live deployment at both
widths**, not just locally: at 1440x900 the About wedge shows 6 distinct
intermediate `clip-path` values and the carousel frame 11; at 390x844,
6 and 10. The `mindset.tsx` backing morph shows 6. The wedge safety margin
holds at both widths: first content sits 97px below the band edge against a
wedge peaking at 26px.

**A verification trap paid for again this session, not a new one.** A
backgrounded `npm run start` hit `EADDRINUSE` against a stale `next start`
left running from an earlier session, died, and the harness then measured
the stale server instead, which was serving a rebuilt `.next` directory out
from under it. That produced 14 failures that all looked like real
regressions (wrong fonts, `h1` at 32px, the accent appearing 90 times, a 500
on a CSS chunk) before it was traced to the stale process. Confirm the
listening PID is the one you just started before trusting any measurement.
Full writeup in `CLAUDE.md`'s "Known traps".

## Level 3, the galaxy and palette: shipped earlier the same day, still true

Adnan's own verdict on the Level 2 hero object was that it "looks like an
image in the back." He was right, so it was replaced rather than tuned.

**The galaxy.** `components/ui/galaxy.tsx` is a procedural spiral galaxy:
one `Points` object, one draw call, three logarithmic arms with a compact
core. 10,000 particles at 1440x900, 4,103 at 390x844 (capacity is 12,000,
resizing changes the draw range rather than the particle count). White and
blue white dominate, roughly one arm star in seven is amber or peach, and
only a small subset of warm stars pick up the site accent. The morph is
differential rotation, the real physical behaviour: angular velocity falls
off with radius, 0.0844 rad/s at the inner radius against 0.0356 at the
outer, about 0.73 radians of winding over fifteen seconds, computed entirely
in the vertex shader so the CPU does nothing per frame. The preloader and
the hero share ONE WebGL context: the intro runs face on behind eight
greetings, then hands the same canvas to the hero and settles to an oblique
tilt without resetting the clock or reallocating a buffer.

**The starfield.** 144 stars became 1,851 at desktop and 470 on a phone
(density is 1 star per 700 CSS pixels, no minimum floor). Forward drift is
2.5x faster, twinkle amplitude varies per star, and the glow sprite share
widened.

**The palette.** The red accent (`#e5484d`) is gone, replaced by an ion blue
`#7b8cff` (6.81:1 on canvas, verified in `app/globals.css:96` and matching
the rendered token). The ground deepened from `#05060b` to `#04050f`. A
read-only palette audit (`better-colors`, `apple-design`, `emil-design-eng`)
produced three candidates and recommended Candidate 2, "Ion Violet," at
`#8677f5` (5.78:1, essentially Tailwind's violet-500). **Claude overrode the
recommendation**, pushing the hue bluer off that AI-product-violet centroid
to `#7b8cff`, which also measured better (6.81:1 against 5.78:1). The
decision and its reasoning are recorded directly in `app/globals.css:74-107`
for anyone who touches this token later.
**White text on the default accent is 2.98:1 and FAILS AA.** It is legal
only on `--accent-deep` (`#4a56c8`, 6.08:1), which is exactly what the
button hover state already does. Do not "fix" a button into white text
without re-measuring.

**The sphere no longer shakes.** The skill sphere's tiles carried
`transition-transform` while a `requestAnimationFrame` loop rewrote their
transform 60 times a second, so the browser kept restarting a 200ms
interpolation toward a target that had already moved. Fixed by moving
rotation and velocity to refs and writing transforms straight to the DOM
nodes; hover moved to a nested wrapper so the two no longer fight. Measured:
12 consecutive frames at +0.25px with 0.01px of spread, 0.152ms mean
callback, zero long tasks, DOM flat at 212 nodes over 5 seconds.

**Also shipped.** Slideshow chrome: the counter and dwell bar are gone,
replaced by inline SVG star navigation (`aria-current`, focus rings,
keyboard support), captions stay. Contact marks now render in real brand
colour (GitHub near-white, LinkedIn `#0A66C2`, WhatsApp `#25D366`, email on
`--accent`) with labels left neutral, because LinkedIn blue is legal as a
graphic at 3.56:1 but would fail as text. Three defects a read-only design
audit found and Claude fixed: contact cards were compounding two independent
press animations to a 0.970 scale nobody chose, the fixed header was using
Tailwind's bare 8px `backdrop-blur` with no saturate boost over an animated
star canvas (now `blur(20px) saturate(1.8)`), and `--shadow-lift` was
defined in the design system and referenced nowhere.

**Verification: 57 checks passed, 0 failed, in real Chrome against a
production build.**

The commit message for `19c7692` says 56, and both numbers were true in
sequence. The message was drafted after a 56 check run, then the 404
response check below was added, taking the total to 57, and the commit was
amended with `--no-edit` so the message kept the older figure. The code that
shipped has 57 checks. The shipped artifact is the authority here, not the
prose attached to it.

Worth generalising: `--amend --no-edit` silently preserves a message that
may no longer describe the tree. If the amend changes anything the message
makes a claim about, rewrite the message.

## Settled decisions, do not re-ask

Carried forward from earlier chunks, still true: graduation April 2028;
public email `adnanshakib.business@gmail.com`; LinkedIn and GitHub only;
staying on the vercel.app URL; TotalTex named outright, Adnan taking over as
managing director; Puzzled started 2023, worked with more than seven Calgary
dealerships and dealer families; copy ownership is Claude writes, Codex
reviews, Gemini excluded.

New this session:

- **The design system is now called "deep field, paper break"** in
  `app/globals.css`, not "graphite spine, paper break." The accent is ion
  blue `#7b8cff` / `#4a56c8`, not red or amber. Two wrong answers preceded
  it: amber first (rejected as "the default look of an AI built portfolio"),
  then automotive red (rejected because the site's actual through line is
  now a galaxy, not cars, and a warm accent competes with the one thing the
  background does well).
- **Adnan grades progress in named levels now, not chunk numbers.** See
  GOAL.md's "level ladder." Level 1 was the dark editorial spine (flat
  starfield, working sphere, correct but static). Level 2 (also shipped
  2026-09-20, earlier the same day) added the 3D star volume, Cosmos bloom,
  coverflow slideshow, ScrollTilt, and the first procedural hero object.
  Level 3 (this session) is the galaxy, the palette fix, and phone parity
  for both. The commit history still says "chunk" through `13012b6`; treat
  "Level" as the live vocabulary going forward.
- **`framer-motion` was uninstalled in commit `31ffdc4`, later the same
  day.** It had zero imports left anywhere in `components/`, `app/`, `lib/`
  or `scripts/` once the galaxy work rewrote `preloader.tsx` to share the
  Galaxy WebGL canvas instead of framer-motion. `package.json` dependencies
  are now exactly `gsap`, `lenis`, `next`, `react`, `react-dom`, `three`,
  confirmed by reading the file directly.

## Lessons from this session, the valuable part

1. **`git add -A` while a subagent is mid-write stages a half-finished
   state.** A commit swept up an in-progress `scripts/capture-fittrack.mjs`
   run and deleted screenshots mid-flight, leaving `work.tsx` pointing at two
   image paths that no longer existed on disk. Caught before push only
   because the paths referenced in `work.tsx` were manually diffed against
   what actually exists in `public/fittrack/`; the capture agent
   independently flagged the same problem. Confirmed fixed: all six
   `fittrack-*.png` paths in `components/sections/work.tsx` now match real
   files in `public/fittrack/`.
2. **A 404ing image is invisible to every other check.** `next/image` takes
   a string and never validates it, TypeScript passes because a path is just
   a string, and a visual check passes if it happens to look elsewhere. Fix:
   `scripts/verify.mjs` now listens for every response and fails on any
   status >= 400 (`scripts/verify.mjs:96`, asserted at line 691).
3. **That new check was first placed where it could not fail.** It sat
   before the harness scrolls the page, and every project screenshot on this
   site is lazy loaded, so it observed zero image requests on its first pass
   and passed by construction. Moved to the end of the run, where it now
   observes real traffic (81 requests at the time it was written). A green
   check that cannot fail reads as coverage and is worse than no check at
   all.
4. **Contrast against a design token is not contrast against what actually
   gets painted.** On a 390x844 capture the galaxy sat directly behind the
   hero's lead paragraph. `--ink-muted` measures 8.74:1 against the flat
   canvas colour but far less against a bright star rendered behind a
   letter. Only a real screenshot caught this; there is probably no
   automated check for it. Fixed by masking the galaxy out above the lead
   paragraph on phone.
5. **A verification threshold can be miscalibrated and fail a correct
   build.** The starfield paint check originally capped ANY non-zero alpha
   at 5 percent and failed a correct, working build at 5.121 percent,
   because a dense glow field spreads faint alpha over a lot of pixels
   without that being a fill bug. Re-expressed in `scripts/verify.mjs:506`
   as: at least one lit pixel exists, AND coverage at 50 percent alpha or
   higher stays under a 25 percent ceiling. Confirmed in the code, with the
   miscalibration history left as a comment so nobody reintroduces the 5
   percent version.
6. **A CSS override fighting a Tailwind utility via `:has()` is a
   silent-failure trap.** `hero-object.css` used to match
   `.hero-intro > div:has(> .galaxy)` to defeat a `hidden md:block` utility
   on the parent; any nesting change would have silently stopped the
   selector matching and the galaxy would vanish on phones with nothing
   failing anywhere. Fixed at the cause: the parent in `hero.tsx` now
   carries a plain `block` and a `.hero-decoration` class, so there is
   nothing left to override. Confirmed removed from both files, with the
   history kept as an explanatory comment in `hero-object.css`.
7. **Codex model routing, adopted from the GPT-6-Astra write-up:** Astra at
   high effort for the one hard creative pass per area, then a cheaper model
   (GPT-5.6-Terra) for mechanical follow-up and polish. Codex hit its usage
   limit repeatedly this session; two of the six lettered agents (G and J)
   each hit it multiple times mid-task. Agent J died to quota without
   writing its report, but left a buildable tree because file ownership was
   disjoint from every other agent (see "what J did and did not finish"
   below).
8. **Two design defects found by a read-only audit, not by any build
   agent.** Contact cards were compounding two independent press animations:
   `ScrollTilt`'s default `press` (0.985) plus a separate CSS
   `active:scale-[0.985]` on the same anchor, landing on roughly 0.970 that
   nobody had actually chosen. And the fixed header used Tailwind's bare
   `backdrop-blur` (8px, no saturate) sitting directly over an animated star
   canvas; both are fixed, confirmed in `components/ui/site-header.tsx:72`
   (`backdrop-blur-[20px] backdrop-saturate-[1.8]`).

## Agent J's motion pass: CLOSED

Agent J's original brief (previous session) was motion and morphing across
every remaining section (`currently`, `experience`, `skills`, `education`,
`next-up`, `mindset`, `work`, `section-heading`). It hit Codex's usage limit
partway through and never wrote `J-report.md`. Checked directly against
`git show --stat 19c7692` rather than trusted from any summary: **it
touched `experience.tsx`, `next-up.tsx`, `skills.tsx`, and `work.tsx`. It
did NOT touch `currently.tsx`, `education.tsx`, `mindset.tsx`, or
`section-heading.tsx`.**

**This session (commit `b9aea76`) finished it.** `about.tsx` (which Agent J
was never briefed on but which had zero scroll motion of any kind),
`currently.tsx`, and `education.tsx` are done. `section-heading.tsx` was
checked and needed no change, it already had `motion-hairline-draw` from an
earlier pass. **`mindset.tsx` needed no change either**: it already had the strongest
motion on the page, a `ViewTimeline` driven backing morph, confirmed
running live. This pass is now CLOSED with no files left over. Do not
re-run it on `about.tsx`, `currently.tsx`, `education.tsx`,
`section-heading.tsx` or `mindset.tsx`,
they are done.

## What is still outstanding, none of this is done

- **Adnan's own photography** (portrait, BMW E92 335xi) is still entirely
  blocked on him. The warm About section remains the only section with no
  image.
- **TotalTex Ops screenshots** are still blocked on the Postgres service
  (`net start postgresql-x64-18` needs an admin shell). No screenshot of
  that app exists on disk; when it happens it must come from
  `npm run seed:demo` or `seed:play`, never real data.
- **Mobile has only been checked at 390x844 in Chrome emulation**, never on
  physical hardware. The phone measurements in every checkpoint so far
  (starfield/galaxy frame timing, DPR handling, this session's shape-morph
  sweep) are Chrome touch/viewport emulation on a laptop, not a real phone.
- **FitTrack's own live app has two display quirks visible in the new
  `public/fittrack/` screenshots captured this session**: a workout pill
  reading "1/7 done" when 3 exercises are actually complete, and a water
  widget reading 0% next to a visibly filled bar. These were reported as the
  live app's own behaviour, not a capture artifact; not independently
  re-verified pixel-by-pixel for this checkpoint, flagging as-is.

## Deployment

Git origin `github.com/addyrallxx/addyrallxx-site.git`, branch `rebuild`
pushes to a Vercel preview, production `main` stays untouched. Vercel
Deployment Protection is ON; a preview needs a Vercel login or a temporary
share link from the Vercel MCP `get_access_to_vercel_url` tool (expires
after 23 hours). Do not disable deployment protection, it is an account
setting and was never authorised. This checkpoint did not deploy or mint a
new share link; verification this session ran against a local production
build only.

## Remaining plan

1. ~~Level 1, the dark editorial spine.~~ Done.
2. ~~Level 2, the 3D star volume, Cosmos bloom, coverflow, ScrollTilt, the
   first procedural hero object.~~ Done.
3. ~~Level 3, the real galaxy, the palette fix, the sphere jitter fix, phone
   parity.~~ Done.
4. ~~Finish the motion pass Agent J did not reach, and ship the two shape
   morphs the Level 3 brief asked for.~~ Done, this handoff (`b9aea76`),
   with no files left over.
5. **Photography and the warm band.** Blocked on Adnan's portrait and car
   photographs, and on the Postgres service for TotalTex Ops screenshots.
6. **Cutover to production**, once the above lands and is verified against a
   deployed preview, not just a local build.

Full original plan: `C:\Users\adnan\.claude\plans\flickering-forging-trinket.md`.
GOAL.md carries the current standing objective and backlog; keep that file,
not this section, as the source of truth on priority order.
