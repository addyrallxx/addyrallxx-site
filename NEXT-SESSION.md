# Portfolio rebuild handoff

Read this first, then `PLAN.md` (plan of record: the narrative spine and
content sections 1 to 6 still apply, its Three.js-specific technical
sections are superseded), then `CLAUDE.md` (operating rules).
Last updated **2026-09-02, chunk 1 of the reset.**

## The headline: chunk 1 shipped, every section now has structure and real copy

Commit `8c74fc6` on branch `rebuild`, deployed and verified live at the
Vercel preview for that branch (deployment protection still on, see
`CLAUDE.md`/`PLAN.md` for the access route).

The site now has every section as structure and copy: hero, currently,
experience, selected work, skills, education, off the clock, contact,
footer. All copy lives in `lib/content.ts`, no component holds a user
facing string of its own. Section components are in `components/sections/`
(`about.tsx`, `contact.tsx`, `currently.tsx`, `education.tsx`,
`experience.tsx`, `hero.tsx`, `site-footer.tsx`, `skills.tsx`, `work.tsx`).

## Settled decisions, confirmed by Adnan 2026-09-02, do not re-ask

- Graduates April 2028.
- Public email is `adnanshakib.business@gmail.com`, written once in
  `SITE.email` and derived everywhere else. No phone number on the site.
- LinkedIn and GitHub only. No Instagram.
- Staying on the vercel.app URL. No domain purchase.
- His father knows TotalTex will be named and welcomes it. Adnan is taking
  over as managing director, and naming the company is a decision the two
  of them made together. TotalTex is now a third Experience entry, not only
  a project.

## Still open, carry forward

- **Puzzled's start date is recorded nowhere on this machine.** The name
  dates to first year of university, the code history begins 2026-08. The
  Experience entry currently says "Current" rather than a start year.
- **The hero line is undecided.** Current copy: "I sold cars, then I
  automated the part I hated." Candidate swap Adnan has not ruled on: "I
  sold cars, then I wrote the software that does it for me."

## Codex reviewed the chunk 0 to chunk 1 diff and found seven real defects, all now fixed

Record these, several are reusable traps beyond this repo.

1. Reduced motion users could receive invisible content. The
   `@supports (animation-timeline: view())` block reinstated an animation
   that outranks the reduced motion declarations, so setting
   `animation-duration: 0.01ms` did not disable a scroll timeline. Both view
   timeline blocks now sit inside `@media (prefers-reduced-motion: no-preference)`.
2. Reveals failed closed on a failed hydration. The hidden state came from a
   `js` class rendered on the server, before any JavaScript had proven it
   could run, so a dropped chunk left every section at `opacity: 0` over
   correct markup. `components/reveal.tsx` now adds a `reveal-armed` class
   from inside its own effect, only on the IntersectionObserver branch. The
   `js` class and the `noscript` counter-rule are gone from `app/layout.tsx`.
3. `.label` and `.data` were unlayered in `app/globals.css`, so
   `hover:text-ink` on the header link was emitted and silently never
   applied. Moved into `@layer components`. This is the SECOND instance of
   the Tailwind 4 layering trap in that one file, the first pinned the hero
   heading to 76px in chunk 0.
4. Three WCAG contrast failures: `--ink-subtle` was 4.22:1 on the dark
   ground and 3.62:1 on the warm ground, both under the 4.5:1 needed for
   normal text, now `#747b85` at 4.66 and `#716b61` at 4.68. White on the
   accent CTA was 3.91:1, the button now uses the canvas colour at 5.09:1
   and keeps white on the deeper hover at 5.82:1. `::selection` had the same
   fault.
5. `--step-6` never reached its documented 112px. The clamp resolved to
   about 102px at a 1440px viewport and only hit the cap near 1633px.
   Corrected to `clamp(2.986rem, 1.573rem + 6.03vw, 7rem)`.
6. Warm scope headings kept a `font-semibold` utility that beat the base
   weight 400, so Instrument Serif would have been synthetically bolded.
7. `calgary-time.tsx`, `marquee-pause.tsx` and `thread-divider.tsx` still
   requested `text-paper-0`, `text-paper-2` and `text-signal`, tokens the
   new theme deleted, so they would have rendered with inherited colours
   when mounted. Renamed.

Also fixed: the hero button read "See the work" and linked to `#currently`.

## Reference site study, findings worth keeping

A study of the five reference sites (sawad.framer.website,
redoyanulhaque.me, cade.codes, dheerajakula.dev, abdulmomin.dev) measured
their computed styles.

- Every one of them pills its controls (buttons, nav, tag chips at 999px or
  above) while card radii cluster between 6 and 22px. The design system had
  said "nothing on this site is a pill", which was wrong and is reversed.
- They run a bimodal type scale: hero type 40 to 110px against body 14 to
  18px with almost nothing between, and negative letter spacing on display
  sizes.
- Four of five are dark with exactly one saturated accent.
- Scroll heights run 3,600 to 8,200px. This site is now 8,469px.
- The redoyanulhaque preloader is a light lavender-grey overlay with a
  marquee of role titles behind a black pill, and a two phase fake progress
  counter that runs fast to 50 percent, crawls to a hard cap of 91, then
  snaps to 100 when the real asset load resolves. Exit is staged at 600ms,
  1000ms then 900ms, with a GSAP background flip to dark.
- The abdulmomin skill sphere is Three.js r182 via react-three-fiber,
  OrbitControls limited to rotation, icons as billboarded Sprites on
  Icosahedron vertices, an orange LineSegments wireframe, gated by
  frameloop plus IntersectionObserver.

## Verification

27 browser checks in real Chrome via puppeteer-core, passing against the
live deployment, not only localhost. They assert every section id exists
with non zero height, exactly one h1, no skipped heading level, every
`aria-labelledby` resolving, the warm ground measured at
`rgb(244, 241, 234)` with a real 400 weight Instrument Serif, exactly one
M tricolour rule, numerals 01 through 07 in order, the CTA and ink-subtle
colours at their new values, no reveal stuck invisible, and no em or en
dashes in rendered text.

Two gates now live in the repo:

```
npm run copy-gate
npm run verify
```

The copy gate (`scripts/copy-gate.mjs`) strips comments before checking (a
naive version flagged its own documentation) and runs every rule against a
canary built from the rejected chunk-0 copy, exiting 2 if any rule matches
nothing, because a gate that cannot fail is not a gate. `scripts/verify.mjs`
is the 27-check puppeteer-core harness, now permanently in the repo (it
lived in a session scratchpad through chunk 0).

## Known cosmetic issue, not yet fixed

The fixed header keeps its dark translucent background when scrolled over
the warm paper section. It reads acceptably but was not a deliberate
decision.

## What is next, chunk 2

The Preloader (component 2556, already pulled, source saved in the vault),
the Img Sphere for the skills section (component 9464, already pulled),
and the motion pass. Chunk 3 is photography and real assets. Chunk 4 is
polish, humanizer, accessibility and performance. Chunk 5 is the cutover
to production on `main`.

## Asset pipeline, settled

Gemini generation happens in the Gemini app on Adnan's Pro plan, which is
free (roughly 100 Nano Banana images a day, 3 Veo clips a day). The Gemini
and Veo APIs bill real money and are banned. Claude writes structured
prompts, Adnan pastes them and drops the files in. Gemini's highest value
use is colour grading his real car photos to one consistent look. It must
never generate his portrait, product screenshots, factory photos or logos,
all of which have real sources: 383 production photographs already in
`totaltex-web`, TotalTex Ops via `npm run seed:demo`, FitTrack's live URL,
and Iconify Simple Icons for logos.

## Deployment

The portfolio repo's git origin is already
`github.com/addyrallxx/addyrallxx-site.git`, so pushing the `rebuild`
branch produces a Vercel preview while production on `main` stays
untouched. Vercel Deployment Protection is ON for that project, so the
preview requires a Vercel login; a temporary shareable link can be minted
with the Vercel MCP `get_access_to_vercel_url` tool and expires after 23
hours. **Do not disable deployment protection**, it is an account setting
and was not authorised.

## Remaining plan

1. ~~Chunk 1, structure and real copy for every section.~~ Done, this
   handoff.
2. **Chunk 2, the Img Sphere, the Preloader, and the motion pass.**
3. **Chunk 3, photography and the warm band.**
4. **Chunk 4, contact, footer, humanizer, accessibility and performance.**
5. **Chunk 5, the cutover to production.**

Full plan: `C:\Users\adnan\.claude\plans\flickering-forging-trinket.md`.
