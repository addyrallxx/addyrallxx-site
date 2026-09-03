# Portfolio rebuild handoff

Read this first, then `PLAN.md` (plan of record: the narrative spine and
content sections 1 to 6 still apply, its Three.js-specific technical
sections are superseded), then `CLAUDE.md` (operating rules).
Last updated **2026-09-02, chunk 3 of the reset.** Branch `rebuild`, HEAD
`6b32443`, deployed and verified live at the Vercel preview for that branch.

## The headline: chunk 3 shipped, three defects nobody reported were found by measurement

Chunk 2 landed the preloader, Lenis, the skill sphere, and a word by word
hero reveal. Chunk 3 landed the night sky, real section headings, colour on
the sphere, and full contact and navigation chrome. Both are live and
verified.

**Chunk 2.** The preloader mounts as a sibling of the page content, never as
a gate: the tree renders underneath it on every load whether it shows or
not. The hero reveals moved from 24px with no blur (invisible to Adnan) to
32px through a 6px blur, arriving word by word with a staggered entrance.
The skill sphere from Adnan's own 21st.dev stash is in, drags with momentum,
culls by z-depth, and stops auto-rotating under reduced motion. The header
flips from dark translucent to solid paper over the warm About section,
driven by an IntersectionObserver.

**Chunk 3.** The background is no longer flat black: three parallax star
layers, per-star twinkle phase, drift and scroll separation by depth, one
shooting star every five to fourteen seconds, fading out behind the warm
paper section and painting one static frame under reduced motion. Section
headings lost their numerals and went from a 13.5px mono label to 75.75px
display type with an accent rule that draws itself in on scroll. The sphere
carries 29 technologies instead of 14, every logo in its brand colour via
Simple Icons; three have no logo (OpenAI pulled over trademark, LLMs and RAG
are categories) and render as text tiles instead of an invented mark. Contact
gained WhatsApp and an inline mark on every channel. The header gained
section navigation, the footer a signature. Selected Work has Ken Burns
drift and crossfades for the two projects with imagery; the other two pass an
empty array and render no frame, the common case rather than the edge case.

Two defects Adnan reported directly were also fixed this chunk: the Currently
grid painted its hairline through the cells under the two shorter cards,
because `Reveal` sits between the cell and the card and collapses to content
height, so `h-full` measured the wrong box; and the M stripe was three even
thirds of the wrong colours, both blues mid blue with the one named dark
actually the lighter of the two.

31 checks passed in real Chrome via puppeteer-core against the live
deployment, identity asserted first.

## Settled decisions, do not re-ask

Carried forward from chunk 1, still true:

- Graduates April 2028.
- Public email is `adnanshakib.business@gmail.com`, written once in
  `SITE.email` and derived everywhere else.
- LinkedIn and GitHub only. No Instagram.
- Staying on the vercel.app URL. No domain purchase.
- His father knows TotalTex will be named and welcomes it. Adnan is taking
  over as managing director, and naming the company is a decision the two of
  them made together. TotalTex is a third Experience entry, not only a
  project.

New this chunk:

- **Adnan's public WhatsApp is +1 587 894 1429**, supplied by him on
  2026-09-02, reversing his earlier decision that no phone number would
  appear on the site.
- **Puzzled started in 2023.** The Experience entry no longer says "Current"
  with no start year.
- **Puzzled has worked with more than seven Calgary dealerships and dealer
  families, not four.** Four was the current active client list; more than
  seven is the number worked with overall.
- **Puzzled runs a dealership's whole online presence, not only listings.**
  Inventory, listings, lead generation, finance applications, social media
  and paid boosting. The copy in `lib/content.ts` already reflects this.
- **Copy ownership on this project: Claude writes all copy, Codex reviews
  it, Gemini is excluded from copy here.** Gemini's role stays image colour
  grading and adversarial review of non-copy specs.

Still open, carried forward:

- **The hero line is still undecided.** Live copy remains "I sold cars, then
  I automated the part I hated." The candidate swap ("I sold cars, then I
  wrote the software that does it for me.") has not been ruled on.

## Three defects found by measurement that nobody reported

The most valuable part of this handoff. Write these as reusable traps, not
just as a changelog.

1. **The sphere was leaking about 100 DOM nodes a second.** Three skills
   carry `slug: null` and share a group, so a React key built as
   `${group.title}-${item.slug}` collapsed all three onto
   `"AI and automation-null"`. The sphere re-renders every animation frame,
   and across a duplicate key React inserts rather than reconciles, so node
   count climbed 558 to 817 in 2.5 seconds. Every prior agent had reported
   the sphere passing, including one that measured an esbuild-bundled copy
   of the component instead of the real page. It is keyed on `item.id` now
   (confirmed at `components/ui/img-sphere.tsx:388`) and holds steady.
   **General trap: verify against the real page, not a harness copy of the
   component, and assert that a count is STABLE over time, not just
   plausible once.**
2. **The contact email button was white on the accent at 3.91:1**, failing
   WCAG AA at 18px and 600 weight. The identical bug had already been fixed
   on the hero button in an earlier chunk (moved to the canvas colour at
   5.09:1). This second button was built after that fix and never brought in
   line; it now correctly uses `text-canvas` too (confirmed at
   `components/sections/contact.tsx:35`). **General trap: a fix applied to
   one instance of a pattern does not travel to instances built later. Grep
   for the pattern across the codebase, do not fix only the reported
   instance.**
3. **The copy gate banned the word "AI" outright**, which would have blocked
   the skills section Adnan explicitly asked for. The rule exists to stop
   the site talking about how it was made. It now fires only when six or
   more words follow the match on the same line (prose, not a label), and
   its self-test still proves it catches the original confession. **General
   trap: a rule written against one bad sentence can grow into a ban on a
   whole topic.**

## Verification traps hit this session, all mine, all worth recording

- A `MutationObserver` attached to `document.documentElement` inside
  `page.evaluateOnNewDocument` throws, because `documentElement` is still
  null at `document_start`. It failed silently and turned a real failure
  into a pass. Observe `document` instead.
- `sessionStorage` is scoped per tab, so opening a second tab is not a test
  of a session gate. Reload the same tab.
- `waitUntil: "networkidle0"` never settles on this site (25 icon SVGs plus
  fonts). Use `domcontentloaded` plus an explicit wait.
- `page.screenshot({ clip })` captures DOCUMENT coordinates, not the
  viewport, so every scrolled screenshot came back identical to the top of
  the page. Omit `clip` to capture the viewport. The tell was three files
  with identical byte sizes.
- **Lenis hijacks programmatic scrolling.** `scrollIntoView` and
  `window.scrollTo` are both reverted on Lenis's next frame. Drive
  `window.__lenis.scrollTo(y, { immediate: true })` and then assert
  `window.scrollY` actually landed where you asked.
- A Vercel share token minted before a deployment finishes returns the login
  page. Identity assertion must ABORT the run, not merely record a failure,
  or every downstream check reports meaningless numbers about a login page.

## What is left

Chunk 4 is photography and is entirely blocked on Adnan: his portrait and
the BMW E92 335xi photographs. The warm About section is the only section
with no image, and two of four Selected Work cards still have no imagery.
TotalTex Ops screenshots are blocked on the Postgres service being stopped
(`net start postgresql-x64-18` needs an admin shell). Then chunk 5 is the
cutover to the production URL. Also outstanding: a full copy polish pass
through `humanizer`, which Adnan has explicitly deferred.

## Open, needs Adnan

The `impeccable` design hook has flagged `components/ui/img-sphere.tsx` as a
broken image six times. It is a false positive: the src is a template
literal its static scanner cannot resolve, and live verification shows 17
icons rendered with zero broken and every one at `naturalWidth > 0`. It
stays unsuppressed until Adnan confirms, because silencing a design rule is
his call.

## Codex starfield bake-off

Codex wrote a competing implementation of the chunk 3 starfield. It lost:
441 lines against 296, and a warm-section observer with no `rootMargin` that
would have blanked the sky for a long stretch of scroll. Its critique of the
spec was the better output, and four of its findings are in the shipped
version: the 90-star floor made a phone sky two and a half times denser than
a desktop one, the near layer at 4 px/s moved its brightest stars 20 pixels
in five seconds against a brief that said the background should go
unnoticed, ease-out is backwards for a meteor, and the canvas kept painting
at zero opacity.

## Reference site study, findings worth keeping

A study of the five reference sites (sawad.framer.website,
redoyanulhaque.me, cade.codes, dheerajakula.dev, abdulmomin.dev) measured
their computed styles.

- Every one of them pills its controls (buttons, nav, tag chips at 999px or
  above) while card radii cluster between 6 and 22px, reversing the design
  system's original "nothing on this site is a pill" rule.
- They run a bimodal type scale: hero type 40 to 110px against body 14 to
  18px with almost nothing between, and negative letter spacing on display
  sizes.
- Four of five are dark with exactly one saturated accent.
- Scroll heights run 3,600 to 8,200px.

## Deployment

The portfolio repo's git origin is `github.com/addyrallxx/addyrallxx-site.git`,
so pushing the `rebuild` branch produces a Vercel preview while production on
`main` stays untouched. Vercel Deployment Protection is ON for that project,
so the preview requires a Vercel login; a temporary shareable link can be
minted with the Vercel MCP `get_access_to_vercel_url` tool and expires after
23 hours. **Do not disable deployment protection**, it is an account setting
and was not authorised.

## Remaining plan

1. ~~Chunk 1, structure and real copy for every section.~~ Done.
2. ~~Chunk 2, the Img Sphere, the Preloader, and the motion pass.~~ Done.
3. ~~Chunk 3, night sky, real headings, sphere colour, contact and nav
   chrome.~~ Done, this handoff.
4. **Chunk 4, photography and the warm band. Blocked on Adnan's portrait and
   car photographs, and on the Postgres service for TotalTex Ops
   screenshots.**
5. **Chunk 5, the cutover to production.**

Full plan: `C:\Users\adnan\.claude\plans\flickering-forging-trinket.md`.
