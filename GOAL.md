# GOAL: ship Adnan Shakib's portfolio, and keep shipping it

This file is the standing objective for this repo. It survives session resets.
**A fresh chat should be able to read this file alone and know what to do next.**

Read order for a cold start:
`GOAL.md` (this file) then `NEXT-SESSION.md` (current state) then `CLAUDE.md`
(operating rules) then `PLAN.md` sections 1 to 7 (narrative and confidentiality).

---

## The objective, in one line

A portfolio at Adnan's existing Vercel URL that makes a stranger want to contact
him within thirty seconds, built for zero dollars, and never left in a half
finished state between sessions.

## The experience bar, in Adnan's own words

> "the site needs to be a cinematic experience that is visually pleasing and
> addictive to scroll thru."

That is the acceptance test for anything visual, and it outranks any individual
feature request. Three things follow from it and they are not optional.

**It is a deep space piece.** The ground is a galaxy: a real 3D star volume that
moves, stars that twinkle and radiate, atmospheric depth behind everything, and
a page that feels like it is floating in that volume rather than printed on it.
Backgrounds move. Things morph. The page reacts to the scroll continuously, not
in discrete pop-in steps.

**Motion has a budget and it is still a budget.** A reader should feel the page
is alive and should not be able to point at one element and say "that is
animating at me". More motion is the instruction; more noise is not. When two
adjacent elements both tilt, drift and glow, cut one.

**Phone is not a degraded tier.** Adnan has asked explicitly that the phone get
the same visual experience, and every change has to be confirmed there, not
assumed. A thing that cannot run on a phone gets a designed phone answer, never
a blank space where the desktop had something.

### The level ladder, how Adnan talks about progress

He grades the site in levels and expects each session to move it up one.

- **Level 1**, before 2026-09-20: the dark editorial spine. Real copy, real
  sections, a flat starfield, a working skill sphere. Correct but static.
- **Level 2**, 2026-09-20: 3D projected star volume, a Cosmos bloom layer, a
  coverflow slideshow, ScrollTilt, a procedural hero object, the How I work and
  Up next sections, and copy rewritten to lead with capability.
- **Level 3**, in progress: a real galaxy asset that rotates and morphs, the
  preloader built around it, a palette that is not red, 60fps everywhere,
  slideshow chrome replaced with star navigation, full colour contact marks,
  and phone parity.

### Standing feedback from Adnan, carried forward

- **He does not like the red accent.** Whatever replaces it, the site keeps
  exactly one saturated UI accent.
- **A 3D asset that does not move, morph or react is a picture.** His words
  about the first attempt: "looks like an image in the back". If it is going to
  cost a WebGL context it has to earn it.
- **The star field should be evident**, not a suggestion. More stars, visible
  motion, twinkle and radiance.
- **Icons and tiles must not jitter.** A CSS transition on a property that a
  rAF loop rewrites every frame is the usual cause; never combine the two.

## Who it has to work for, in priority order

1. A recruiter filling a **summer 2027 software internship**. Wants a graduation
   date, evidence he ships, and a reason to believe a third year student runs
   real systems.
2. A **dealership owner or dealer family** in Calgary. Wants to know Puzzled is
   real and that somebody competent is behind the software.
3. A **freelance client** with money and a problem.

Everything on the page is judged against those three. If a section serves none
of them it should not exist.

## The standing definition of done

The site is "done for now" when all of these hold at the same time:

- `npm run copy-gate` passes.
- `npx tsc --noEmit` passes.
- `npm run build` passes.
- `node scripts/verify.mjs <live url>` passes end to end in **real Chrome**,
  with identity asserted first.
- The production Vercel URL serves the current build.
- `NEXT-SESSION.md` describes the true current state, including what is broken.

It is never done because a run completed. See the verification rule below.

---

## Hard constraints that do not move

- **Zero dollars.** No paid API, no paid asset, no paid hosting tier, no
  Higgsfield credits, no Monid, no metered image or video generation. If a
  chapter needs an asset and no free path exists, flag it to Adnan instead of
  reaching for a paid one.
- **No em dashes, no en dashes**, anywhere in this repo. Code, comments, commit
  messages, copy, docs.
- **Confidentiality**, from `PLAN.md` section 7: no TotalTex financials,
  addresses, ownership split or CapEx; dealership clients are never named (a
  count and a city are fine, "more than seven Calgary dealerships and dealer
  families"); immigration detail stops at "Bangladeshi citizen studying in
  Canada"; nothing sourced from `totaltex-ops/samples`, which is real
  unredacted third party business data; family emotional content stays out.
- **Claude owns the copy. Codex reviews it. Gemini is excluded from copy here.**
- **Never script Facebook Marketplace**, in any project. The client accounts are
  the product.

---

## How the work is run

**Adnan's usage limit is the binding constraint, and so is Codex's.**
Both reset on a rolling window. If either runs out mid task, stop cleanly,
checkpoint, and resume when it resets. Never leave the tree broken.

The delegation ladder, in order:

1. **Claude Opus** plans, writes copy, makes design calls, reads diffs, decides.
   It should not be doing mechanical labour.
2. **Codex (GPT-6-Astra)** does the heavy creative implementation passes. Bills
   the ChatGPT subscription, not dollars.
3. **Codex (GPT-5.6-Terra or Luna)** does bug fixes, polish and mechanical
   follow ups. Learned from the Astra web design write up: use Astra for the
   first prompt to get 90 percent of the way there, then drop to a cheaper model
   for everything after. Astra burns quota fast.
4. **Sonnet subagents** do research, mechanical multi file edits and verification
   runs, in parallel.

Rules for fanning out, every one of them earned from a real failure:

- Partition agents by **file ownership**. Name in every brief the files that
  agent owns and the files another agent is holding right now.
- **Pin the interface before starting.** Exact export signature, exact payload
  shape. File ownership stops overwrites, it does not stop two agents building
  incompatible contracts.
- **Forbid `git stash` in every brief.** An agent has swallowed another agent's
  in flight edits with it. `git diff` to inspect, nothing else.
- **Forbid starting a dev server in every brief.** Concurrent `npm run build`
  in one directory produces transient failures that look like real bugs.
- Serialise anything that builds or measures. Parallelise anything that only
  reads and writes source.
- **Never report a parallel run as done on its own summary.** Read the actual
  return values, then re-run the claim yourself.

---

## Verification, which is where this project keeps getting caught

**The in app Browser pane CANNOT verify this site.** Automation browsers on this
machine report `document.hidden = true`, which throttles `requestAnimationFrame`
so no scroll choreography, Lenis smoothing or motion ever visibly runs, and
`loading="lazy"` images come back `naturalWidth: 0` with zero network requests.
That looks exactly like a broken build when it is not.

**Drive real Chrome with `puppeteer-core`** against
`C:\Program Files\Google\Chrome\Application\chrome.exe`.

Traps already paid for once each:

- **Lenis hijacks programmatic scrolling.** `scrollIntoView` and
  `window.scrollTo` are reverted on Lenis's next frame. Drive
  `window.__lenis.scrollTo(y, { immediate: true })` and then assert
  `window.scrollY` actually landed.
- **`page.screenshot({ clip })` captures DOCUMENT coordinates, not viewport.**
  Every scrolled screenshot comes back identical to the top of the page. Omit
  `clip`. The tell is several files with identical byte sizes.
- **`waitUntil: "networkidle0"` never settles here.** Use `domcontentloaded`
  plus an explicit wait.
- **A `MutationObserver` on `document.documentElement` inside
  `evaluateOnNewDocument` throws**, because `documentElement` is null at
  `document_start`. Observe `document`.
- **`sessionStorage` is per tab**, so a second tab is not a test of a session
  gate. Reload the same tab.
- **Identity assertion must ABORT the run**, not record a failure. A Vercel
  share token minted before a deployment finishes returns the login page, and
  every downstream check then reports meaningless numbers about a login page.
- **Assert counts are STABLE OVER TIME**, not plausible once. The skill sphere
  leaked about 100 DOM nodes a second and every prior check called it passing.
- Screenshots cost roughly 3,600 tokens at 2160px. Shoot at
  `deviceScaleFactor: 1`, crop to the element, resize to 1000px or less, and
  read ONE confirming frame. Prefer asserting numerically
  (`getBoundingClientRect`, `getComputedStyle`) over looking.

---

## Code traps specific to this repo

- **Unlayered CSS element rules beat Tailwind 4 utilities regardless of
  specificity.** Tailwind 4 puts its utilities in a cascade layer, so a bare
  `h1 { }` outside any layer outranks every utility class. Every element or
  component level rule goes in `@layer base` or `@layer components`. This has
  bitten twice in `app/globals.css`.
- **A hidden state must never come from server rendered markup that only client
  JavaScript can undo.** A dropped chunk or failed hydration then leaves every
  section at `opacity: 0` over correct markup: a blank page with a healthy DOM.
  Arm hidden states from inside the component's own client effect. Fail open.
- **Do not put a background back on `body`.** A previous build put an opaque
  background on `body` over a fixed canvas at a negative z index. In CSS
  painting order the negative z index descendant paints first, so `body` painted
  straight over the canvas and hid it, with every instrument reading green and
  the screen blank. `html` carries the background, `body` stays transparent.
- **Never key a React list on a field that can be null or shared.** Three skills
  carry `slug: null` in the same group, so a key of `${group}-${slug}` collapsed
  all three onto one key and the sphere leaked nodes every frame. Key on an id.
- **A fix applied to one instance of a pattern does not travel to instances
  built later.** The white on accent contrast failure (3.91:1, below WCAG AA)
  was fixed on the hero button, then shipped again on the contact button because
  nobody grepped for the pattern. Grep before calling a token level fix done.
- **Check the 21st.dev stash before hand rolling any UI.** Index at
  `C:\Users\adnan\second-brain\wiki\resources\21st-components\_index.md`. State
  which id you checked and whether you used or skipped it. This rule was skipped
  once already on this project.

---

## Where everything lives

| Thing | Path |
|---|---|
| Repo | `C:/Users/adnan/projects/portfolio` |
| Git origin | `github.com/addyrallxx/addyrallxx-site.git` |
| Vercel project | `addyrallxx-site`, id `prj_h8ayJXXZlNuwhX2sxNon0womzElQ` |
| Vercel team | `team_dAhI3X7c5OSADLP8iQKWtbco` |
| Production branch | `main` |
| Vault | `C:/Users/adnan/second-brain`, `wiki/hot.md` then `wiki/log.md` |
| Component stash | `C:/Users/adnan/second-brain/wiki/resources/21st-components/` |
| puppeteer-core | not in this repo yet; 25.4.0 is in `projects/totaltex-ops` |

Vercel Deployment Protection is ON for this project. A preview needs a Vercel
login, or a temporary share link from the Vercel MCP `get_access_to_vercel_url`
tool, which expires after 23 hours. **Do not disable deployment protection**, it
is an account setting and was never authorised.

---

## Standing backlog, in priority order

Update this list every session. Do not let it go stale.

1. **Photography.** Blocked on Adnan: his portrait, and the BMW E92 335xi
   photographs. The warm About section is the only section with no image.
2. **TotalTex Ops screenshots.** Blocked on the Postgres service being stopped
   (`net start postgresql-x64-18` needs an admin shell). Every screenshot must
   come from `npm run seed:demo` or `seed:play` in that repo. **No visual on
   this site may ever come from `totaltex-ops/samples/`.**
3. **Two of four Selected Work cards still have no imagery.** Puzzled is client
   confidential by design and will stay that way; TotalTex Ops is item 2.
4. Keep the motion budget honest. A reader should feel the page is alive and
   should not be able to point at one element and say "that is animating at me".
