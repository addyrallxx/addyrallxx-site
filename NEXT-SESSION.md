# Portfolio rebuild handoff

Read `GOAL.md` first now, it is the cold-start document and survives session
resets. Then this file for current state. Then `CLAUDE.md` for operating
rules. Then `PLAN.md` sections 1 to 7 for the narrative spine and
confidentiality rules (its Three.js-specific technical sections are
superseded).

Last updated **2026-09-20, Level 3.** Branch `rebuild`, HEAD `19c7692`
("Level 3: a real galaxy, and the red is gone"). Not yet deployed to a
checked preview by this checkpoint, verification below ran against a local
production build.

## The headline: Level 3 shipped, a real galaxy replaced a spinning rotor, and the red accent is gone for good

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
- **`framer-motion` is installed but no longer used anywhere in
  `components/` or `app/`.** Confirmed by `grep -rn "framer-motion"
  components/ app/`, which now returns only a comment in `components/reveal.tsx`
  explaining why `Reveal` deliberately avoids it. It powered `preloader.tsx`
  as of chunk 2; this session's galaxy work rewrote the preloader to share
  the Galaxy WebGL canvas instead and dropped the framer-motion import. The
  package is still in `package.json` (`^13.1.1`), just dead weight until
  something uses it again or it gets removed.

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

## What Agent J did and did not finish

Agent J's brief was motion and morphing across every remaining section
(`currently`, `experience`, `skills`, `education`, `next-up`, `mindset`,
`work`, `section-heading`). It hit Codex's usage limit partway through and
never wrote `J-report.md`. Checked directly against `git show --stat
19c7692` rather than trusted from any summary: **it touched
`experience.tsx`, `next-up.tsx`, `skills.tsx`, and `work.tsx`. It did NOT
touch `currently.tsx`, `education.tsx`, `mindset.tsx`, or
`section-heading.tsx`** (none of those four appear in the commit's changed
file list). `currently.tsx` needed no change per its own brief (already had
tilt and press from an earlier pass). `education.tsx`, `mindset.tsx`, and
`section-heading.tsx` are genuinely untouched this session and still carry
whatever motion they had going in. File ownership being disjoint from every
other agent is why the tree still built cleanly despite J dying mid-task.

## What is still outstanding, none of this is done

- **Adnan's own photography** (portrait, BMW E92 335xi) is still entirely
  blocked on him. The warm About section remains the only section with no
  image.
- **TotalTex Ops screenshots** are still blocked on the Postgres service
  (`net start postgresql-x64-18` needs an admin shell). No screenshot of
  that app exists on disk; when it happens it must come from
  `npm run seed:demo` or `seed:play`, never real data.
- **Mobile has only been checked at 390x844 in Chrome emulation**, never on
  physical hardware. The phone measurements in this session's verification
  (starfield/galaxy frame timing, DPR handling) are Chrome touch/viewport
  emulation on a laptop, not a real phone.
- **FitTrack's own live app has two display quirks visible in the new
  `public/fittrack/` screenshots captured this session**: a workout pill
  reading "1/7 done" when 3 exercises are actually complete, and a water
  widget reading 0% next to a visibly filled bar. These were reported as the
  live app's own behaviour, not a capture artifact; not independently
  re-verified pixel-by-pixel for this checkpoint, flagging as-is.
- `education.tsx`, `mindset.tsx`, and `section-heading.tsx` have not
  received the motion/morphing pass the rest of the sections got (see
  above). Section-heading in particular is shared by every section on the
  page, so it is the single highest-leverage element still untouched.

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
   parity.~~ Done, this handoff.
4. **Finish the motion pass Agent J did not reach**: `education.tsx`,
   `mindset.tsx`, `section-heading.tsx`.
5. **Photography and the warm band.** Blocked on Adnan's portrait and car
   photographs, and on the Postgres service for TotalTex Ops screenshots.
6. **Cutover to production**, once the above lands and is verified against a
   deployed preview, not just a local build.

Full original plan: `C:\Users\adnan\.claude\plans\flickering-forging-trinket.md`.
GOAL.md carries the current standing objective and backlog; keep that file,
not this section, as the source of truth on priority order.
