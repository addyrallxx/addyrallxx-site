# Phase 2: the world. Build spec.

Author: Opus, 2026-09-01. Revised the same day after an adversarial technical
review by Gemini 3.1 Pro, which found three real errors in the first draft.
Those corrections are marked **[corrected]** and the original reasoning is kept
so the trail is auditable.

Read `PLAN.md` sections 2, 3, 4.1 and 6 first. This document refines them, it
does not replace them.

---

## 1. The core idea

The world is **one particle field that re-forms six times**.

Not a landscape flythrough. Zero dollars means zero assets, and any attempt at
literal scenery ends as untextured grey boxes. Instead the world is rendered as
an **instrument**: procedural point and line geometry, cold ground, one warm
signal color. The visitor travels through a system, which is also literally what
Adnan builds.

| # | Chapter | Formation | Data behind it |
|---|---|---|---|
| 1 | Arrival | Unresolved cloud, settling | none, it is the establishing shot |
| 2 | Ground | Ridged terrain wireframe | procedural ridged noise, reads as foothills |
| 3 | TotalTex Ops | Directed graph, order to job to proforma to production to challan to bill | the real six stage spine, `PLAN.md` 5.1 |
| 4 | Puzzled | Scatter of 1,069 points, 2 in signal color | the real audited descriptions and the two live AMVIC violations |
| 5 | Field notes | Three clusters, one per shipped project | TotalTex Web, FitTrack, the vault |
| 6 | Contact | Sphere, arc drawn Dhaka to Calgary | real lat/lon |

Formation 4 is what earns the concept. Those are not decorative particles, they
are 1,069 real records and the two the audit caught. The geometry *is* the case
study.

## 2. Decision: no cobe, render the globe in the same scene

`PLAN.md` 4.2 chose `cobe` (5,931 B gzipped) over `globe.gl` (559,272 B). That
comparison stands. What is being rejected is the premise that a globe library is
needed once Three.js is already loaded.

**[corrected] The original argument was partly wrong.** The first draft claimed
two live WebGL contexts is a real mobile failure mode, citing a cap around 8.
Review put the practical iOS Safari limit near 16, so two contexts would not
crash anything. That reasoning is withdrawn.

**The decision stands anyway, on the seam.** `PLAN.md` 4.1 keeps scroll-world's
"never cut, always connect" discipline and calls it the thing that makes a scroll
world feel like one place. Cross-fading two canvases is a cut. The field
collapsing into a sphere is a connection, and it is the strongest single motion
beat available in the piece.

**[corrected] The arc is not cheap and the first draft understated it.** Claiming
"four lines of trigonometry" was wrong. Native `GL_LINES` is locked to one device
pixel wide and looks broken on high DPI screens. The real build is: interpolate
the great circle with `THREE.Quaternion.slerp`, build the ribbon with `Line2` from
`three/addons` (or `TubeGeometry`), and animate the draw-in with a dash offset
uniform. **Budget this as its own multi-hour task, not a detail.**

If the arc overruns, chapter 6 falls back to `cobe` on a second canvas and we
accept the seam cut. That is the documented escape hatch, not the plan.

### 2.1 Chapter 6 arc, built 2026-09-01

The arc uses the installed Three 0.185.1 `Line2`, `LineGeometry` and
`LineMaterial` addons. The existing `THREE.LineSegments` edge path was checked
first, but WebGL cannot portably render it wider than one device pixel. `Line2`
keeps the signal legible on high density displays without adding a dependency.

`lib/world/arc.ts` samples 64 spherical-linear-interpolation segments between
the same radius-4 Dhaka and Calgary positions as the contact formation. A sine
lift peaks at the midpoint and scales with the route's angular distance. The
maximum lift for this route is 0.267285 world units.

The geometry and line distances are uploaded once at init. Chapter 6 progress
updates only the material's `dashOffset` and opacity uniforms. The arc stays
transparent through world progress 4.5, sweeps to fully drawn at progress 5,
and is therefore absent from chapter 5. The static tier snaps directly to the
fully drawn state and schedules no animation frame. Line resolution is updated
with the viewport during resize, in addition to the addon's visible-object
render hook.

Run the standalone numeric check with `node lib/world/verify-arc.mjs`. It checks
both endpoints to `1e-6`, all intermediate radii against the surface and lift
bound, and every buffer value for finiteness.

## 3. Technical spine

One `THREE.Points`, one **separate** `THREE.LineSegments`, one
`PerspectiveCamera` on a spline, one `requestAnimationFrame` loop.

### 3.1 Morphing happens on the GPU, not the CPU

**[corrected] The first draft implied a CPU lerp. That is wrong and must not be
built.** Rewriting 24,000 positions per frame is 288 KB uploaded every frame plus
sustained garbage collection pressure, and it will drain battery on mid range
Android.

Morph in a **custom vertex shader**, driven by one `u_progress` uniform.

**Morph targets go in a `DataTexture`, not in vertex attributes.** Six `vec3`
targets would burn six attribute slots, and `MAX_VERTEX_ATTRIBS` is commonly 16
on mid range mobile GPUs, so adding normals, UVs and colors overflows it. Pack the
formations into a floating point `DataTexture` and read them in the vertex shader
with `texelFetch`.

### 3.2 Edges must be a separate object that scales to zero

Only formation 3 has edges. If line vertices are lerped along with everything
else, the edges do not disappear on the way to formation 4, they stretch into a
web of spaghetti across the screen. The first draft called `LineSegments`
"optional" and did not specify this. It is the single most likely thing to look
broken.

Keep the lines as their own geometry with their own index buffer, and drive their
segment scale (or alpha) to zero from `u_progress` **before** the morph out of
formation 3 begins. They fade out fully, then the points move.

### 3.3 Padding

Every formation array is the same length so no particle is created or destroyed
after init. Where a formation needs fewer points than the buffer holds, **set the
surplus points to zero size in the vertex shader so they are discarded.** Do not
pad by repeating with jitter: in the sphere formation those repeats cluster and
z-fight.

### 3.4 Pacing

Ported from scroll-world as a spec, not as code, per `PLAN.md` 4.1. Each chapter
owns a `scroll` value (dwell distance, how much page height it consumes) and a
`linger` value (time remapping, so the camera settles and holds while the copy is
at its peak). Chapter 3 gets the largest `scroll`, it is the flagship.

### 3.5 Blending and sorting

**Additive blending is banned.** It manufactures the glow that got the old site
flagged. Use flat opacity with size attenuation, and no bloom pass.

Accept the consequence up front: `THREE.Points` does not self sort, so with plain
alpha blending overlapping particles render out of order and fringe. CPU z
sorting 24,000 points would undo the entire GPU morph gain. **Use `alphaTest`
around 0.5 and accept slightly harder pixel edges.** This is a deliberate
tradeoff, not an oversight.

### 3.6 The real bottleneck is fill rate

Not the draw call, there is only one. It is overdraw. Cap device pixel ratio with
`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` and shrink
`gl_PointSize` on small viewports.

### 3.7 Camera must adapt to aspect ratio

A layout that reads as terrain on 16:9 clips or compresses badly on a 9:16 phone.
Scale camera FOV or dolly distance from `innerWidth / innerHeight`. Do not assume
one spatial layout fits every viewport.

## 4. Quality tiers, from the first commit

| Tier | Trigger | Particles | Behaviour |
|---|---|---|---|
| full | desktop, no reduced motion | 24,000 | six formations, pointer parallax |
| lite | coarse pointer, or < 768px, or `deviceMemory` <= 4 | 8,000 | six formations, no pointer parallax |
| static | `prefers-reduced-motion: reduce` | 8,000 | see below |

Decide the tier once at init. Never switch mid session.

### 4.1 [corrected] The static tier renders WebGL, it does not render SVG

The first draft substituted a hand built SVG composition per chapter. That was
wrong: it means designing and maintaining two divergent visual systems that will
never match on density, perspective or color, and the fallback ends up looking
cheap and disconnected.

**Reduced motion means stop the motion, not destroy the medium.** Build the same
scene. When a chapter threshold is crossed, snap `u_progress` to that chapter's
exact integer and call `renderer.render(scene, camera)` **once**. No rAF loop, no
pointer parallax, no interpolation. Perfect visual parity, one code path, and it
satisfies the accessibility requirement properly.

## 5. Scroll mechanics

The page must stay fully readable with JavaScript disabled, and there must be no
scrolljacking. Scroll drives the world, the world never drives scroll.

Use a **passive scroll listener plus rAF damping** inside a `'use client'`
component:

- `window.addEventListener('scroll', handler, { passive: true })` writes a target
  value into a `useRef`
- the rAF loop eases toward it: `current += (target - current) * 0.05`

This decouples the render loop from the browser's asynchronous scroll events,
which removes jitter, and it leaves the DOM untouched.

Rejected, with reasons. `IntersectionObserver` gives discrete booleans, not a
continuous 0 to 1, so it is the wrong primitive for the morph (it stays correct
for one-shot DOM reveals). Native CSS scroll-driven timelines do not hand a value
back into a rAF loop without layout thrashing. GSAP ScrollTrigger is already a
dependency here because `thread-divider` needs it, so bundle size is not the
objection: it is simply more machinery than reading one number needs. Keep GSAP
for the DOM reveals it already powers, and keep the world on the plain listener.

## 6. Accessibility, non-negotiable

- The canvas is `aria-hidden="true"` throughout and carries no information that is
  not also present as text.
- Every chapter is a real landmark with a real heading, fully readable and
  navigable with the canvas removed entirely.
- Chapter anchors are reachable by keyboard.
- No scrolljacking, no hijacked wheel events, no forced fixed duration transitions.

## 7. Verification

`PLAN.md` section 10 applies without exception. **The Browser pane cannot verify
any of this.** Automation browsers on this machine report `document.hidden = true`,
which throttles `requestAnimationFrame`, so nothing here visibly runs. That looks
exactly like a broken build.

Drive real Chrome with `puppeteer-core` against
`C:\Program Files\Google\Chrome\Application\chrome.exe`.

Assert numerically rather than looking:

- particle count per tier, read off the geometry attribute
- camera position at scroll 0.0, 0.5 and 1.0, via a debug hook exposing camera xyz
- frames per second sampled over 3 seconds per chapter, floor 50 on desktop and
  30 on a throttled profile
- that the rAF loop is genuinely not running in the static tier

One screenshot per chapter at most, `deviceScaleFactor: 1`, cropped, resized to
1000 px or less.

## 8. Out of scope for Phase 2

No copy, no case study content, no contact form, no assets. Formations may use
placeholder counts where the real number is not yet wired, **except formation 4**,
which should use the real 1,069 and the real 2 from the start, because the density
is the whole point of it and a placeholder would hide whether it reads.
