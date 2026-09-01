# Portfolio rebuild handoff

Read this first in any new session, then `PLAN.md` for the plan of record, then
`CLAUDE.md` for operating rules, then `docs/phase-2-world.md` if touching the
world. Last updated **2026-09-01, mid session**.

## Where we are

**Phases 0, 1 and 2 are done and independently verified. Phase 3 copy is
drafted and reviewed but not yet wired into the page.**

Git, branch `phase-1-scaffold`:

    f327d33  Phase 2 shell, plus four verification fixes
    9b3ea7f  Phase 2 engine: GPU morph world, six formations
    536293f  Copy revision after adversarial critique
    e80d5cf  Phase 3 draft: site copy, all six chapters
    3b8cca3  Phase 2 groundwork: world spec, pinned interface, arc reference
    0c99650  Phase 1: scaffold, design system, ported primitives
    7902ff3  Phase 0: plan of record, operating rules, handoff

### Phase 2, measured in real Chrome, not asserted

Harness is committed at `scripts/verify/`. Re-run it with the production
server up: `npm run build && npm run start -- -p 4173`, then
`node scripts/verify/verify-world.mjs`. It drives real Chrome through
puppeteer-core, because the Browser pane cannot verify this project.

    tier full        24000 particles
    tier lite         8000 particles at 375px with a coarse pointer
    fps              240 at chapter 1 and chapter 6 (floor was 50)
    reduced motion   tier static, isAnimating false, frameCount held at 1
                     across 3 seconds, incremented to 2 on chapter change
    camera           materially different at scroll 0.0, 0.5 and 1.0
    CPU uploads      one needsUpdate total, the DataTexture at init, none per frame
    scrolljack       none, wheel defaultPrevented false
    console          zero errors, zero warnings
    SSR              all six chapter headings present with JS disabled

**Do not trust a green run alone.** The first re-run reported three 500s and a
missing world handle, which looked like a real regression. It was a stale
`next start` still serving a deleted `.next`, surviving `pkill`. Kill test
servers by port with `Get-NetTCPConnection -LocalPort <p> -State Listen`, not
with `pkill`.

### Four fixes the verification forced

1. **Lenis is no longer mounted.** It calls `preventDefault` on every wheel
   event, which `docs/phase-2-world.md` section 5 bans, and it double damped
   against the world's own easing so the world lagged the wheel twice.
   `lib/scroll.ts` falls back to native smooth scroll, so anchors still work,
   and lenis is now absent from the client bundle. The component stays in the
   repo for a future non-world page.
2. **Added the missing `h1`.** The page had six `h2` and no top level heading.
   Arrival now carries the real hero line from `docs/copy.md`.
3. **Removed the "Chapter" kicker.** A label above a heading is the
   `kicker-above-heading` anti-pattern, one of the 49 findings against the old
   site. It had been reintroduced by accident.
4. **Added `app/icon.svg`.** Every page load was 404ing on `favicon.ico`.

### Known imprecision, not a bug

Section heights are sized as a fraction of total document height, while the
engine reads scroll as a fraction of *scrollable* distance (total minus one
viewport). So chapter boundaries land slightly earlier than the pacing ratios
predict. It is small and it is deliberate for now. Fix it when Phase 3 copy
makes exact boundaries matter, by having one side own both calculations.

### Phase 1, verified not just claimed

Hand written scaffold, deliberately **no `create-next-app`**, because shipping
its boilerplate was the previous site's worst single failure (a page title still
reading "Create Next App"). Next 16.2.12, React 19.2.4, TS strict, Tailwind 4,
versions matched to `totaltex-ops` which is proven in production here.

Re-run by the orchestrator rather than trusted from an agent summary:

- `npx tsc --noEmit` clean, `npm run build` succeeds
- contrast on `--ink-0`: paper-0 **16.17:1**, paper-1 **9.04:1**,
  paper-2 **4.26:1**, signal **7.91:1**, signal-dim **3.15:1**. All above target.
- type scale bottoms out at **13.3px**, above the 11px floor the old site broke
- zero em or en dashes in source
- `public/` empty, no default SVGs, no boilerplate README
- fonts via `next/font` (Inter + JetBrains Mono), self hosted, no CDN request

Design system is **cold ground, warm signal**: blue black surfaces, warm off
white text, one amber accent. Chosen so the palette carries the Dhaka to Calgary
narrative, and specifically to avoid the colored-glow-on-dark look the old site
was flagged for.

All 8 accessibility hardened primitives ported from `totaltex-web`.

### Phase 2, in flight

Spec is **`docs/phase-2-world.md`**, and it supersedes the looser description in
`PLAN.md` section 4. The interface is pinned in **`lib/world/types.ts`**, written
before implementation so the WebGL layer and the React layer cannot drift.

Concept: **one particle field that re-forms six times**, morphing on the GPU.
Formation 4 is the real 1,069 audited Puzzled descriptions with the real 2
compliance violations flagged in signal color, so the geometry is the case study
rather than decoration.

## Two decisions made this session that change PLAN.md

1. **cobe is dropped.** The globe becomes formation 6 of the same particle field.
   `PLAN.md` 4.2 still describes cobe as chosen; `docs/phase-2-world.md` section 2
   is now authoritative. The original justification (two WebGL contexts crash
   mobile) was **wrong** and is withdrawn: the practical iOS Safari limit is
   nearer 16. The decision stands purely on the seam, since a field collapsing
   into a sphere is a connection and a canvas cross-fade is a cut. cobe remains
   the documented fallback.
2. **The reduced-motion tier renders WebGL, not SVG.** Earlier thinking had a
   hand built SVG composition per chapter. That would mean maintaining two
   visual systems that never match. Instead: same scene, snap progress to the
   chapter integer, render exactly once, schedule no rAF loop.

Both came out of an adversarial review by Gemini 3.1 Pro, which also caught that
the great-circle arc is **not** trivial (native GL_LINES is 1px, so it needs
slerp plus `Line2` or `TubeGeometry` plus a dash offset uniform). Budget it as
its own task.

## Three platform setup, now working

`agy` (Antigravity CLI) was installed this session and **Gemini is reachable
headlessly**:

    agy --model gemini-3.1-pro-high --new-project --print='your prompt'

The prompt must be attached to `--print` with an equals sign or the CLI silently
eats the next flag as the prompt. Models include Gemini 3.7/3.6 Flash, Gemini 3.1
Pro, and also Claude Sonnet/Opus 4.6 and GPT-OSS 120B.

**Hard money rule discovered this session:** Gemini image and video generation is
free **only inside the Gemini app UI** (roughly 100 images/day, 3 Veo videos/day
on the Pro tier). The Veo and Nano Banana **APIs bill per call with zero free
quota, and the consumer subscription grants no API credit at all.** So Gemini is
not a scriptable free asset pipeline. It joins Monid and Higgsfield on the banned
list for automated asset generation. Manual generate-then-download in the app is
fine and is the intended route for Phase 5.

Codex was hard rate limited for most of this session, resetting 08:32 local. A
usage telemetry script now runs at every session start
(`C:\Users\adnan\.claude\tools\ai-usage.ps1`) so partner quota is known without
asking.

## What is next

1. **Phase 3, wire the copy in.** `docs/copy.md` holds all six chapters,
   already through one adversarial review. It is drafted, not placed. Only
   the Arrival h1 is currently on the page. Two lines in it carry variants
   awaiting Adnan (TotalTex naming, phone number) and one Puzzled line is
   explicitly marked as needing his confirmation before it ships.
2. **The great-circle arc**, chapter 6. Budgeted as its own task, not a
   detail. `docs/arc-reference.md` has an unverified reference implementation
   to check rather than trust. The engine left a commented seam for it and
   documented its sphere axis convention, which the arc must match.
3. **Phase 5 assets**, TotalTex Ops screenshots from seeded demo data only.
4. **Phase 6**, `impeccable detect`, `/humanizer` on all copy, Lighthouse,
   then a Codex adversarial review of the finished diff.

## How the work got split, for the next session

Codex built the world engine and did it well. Gemini reviewed specs and copy
and caught real errors both times. Claude wrote the copy, made the design and
architecture calls, and re-verified every claim rather than accepting an
agent's summary. That split is deliberate and worth keeping:

- **Gemini reviews, it does not write.** Given a copy brief with an explicit
  "invent nothing" rule it still fabricated a number. Given a spec to attack,
  it found three real errors.
- **Codex builds well-specified, self-contained modules.** The engine brief
  was tight and the result needed no correction.
- **Claude keeps** architecture, voice, confidentiality calls, and final
  verification. Every partner has now been caught being confidently wrong
  once, so re-running the claim is not optional.

## Open questions, all still awaiting Adnan

Unchanged from the last handoff except where noted. None block Phase 2.

1. **Domain.** Keep `addyrallxx-site.vercel.app` or register one?
2. **Contact surface.** Keep the phone number public?
3. **TotalTex naming.** Name the client, or anonymise to "a garment accessories
   manufacturer in Dhaka"? Needs family confirmation.
4. **Photo.** No photograph of Adnan exists on this machine. A real face beats
   any 3D flourish for trust.
5. **Asset generation.** Now sharper than before: the free route is Adnan
   generating images by hand in the Gemini app and saving them into the repo.
   Nothing scripted, because scripted means billed. Confirm before any is made.
