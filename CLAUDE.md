# Portfolio rebuild

Adnan Shakib's personal portfolio site. **Plan of record is `PLAN.md`. Read it
first, every session, before changing anything.** This file holds the
operating rules that apply while building. `NEXT-SESSION.md` holds current
state and the handoff.

## What this is

Dhaka to Calgary, chapters as places not sections, replacing the old
create-next-app-flavoured site at `addyrallxx-site.vercel.app`. The build was
originally a continuous scrolled Three.js particle world; that build was
rejected by Adnan on 2026-09-02 (bizarre, generic AI copy, assistant chatter
reached the published page) and its code deleted. Current direction: a dark
editorial spine with warm photographic chapters. See `NEXT-SESSION.md` for
the chunk 0 reset and what happens next. `PLAN.md` sections 1 to 6 still
carry the narrative spine and content reasoning (Dhaka to Calgary,
confidentiality rules, chapter content); its Three.js-specific technical
sections are superseded.

## Stack, chosen but not scaffolded

Next.js 16, React 19, TypeScript, Tailwind 4. Same versions as the old repo
and as `totaltex-web`. **Nothing is scaffolded yet.** No `package.json`, no
`node_modules`, no `app/` directory exists on disk as of 2026-08-31. Do not
assume any of it is there without checking first.

## Hard constraints

- **Zero dollars.** No paid API, no paid asset, no paid hosting tier.
- **No Higgsfield credits.** Free tier only has 5 credits and Adnan's standing
  rule is no top-ups without his explicit permission in the moment, every
  time. Do not spend them on this project without asking first.
- **No Monid.** Ruled out in `PLAN.md` section 4.1, roughly $27 per 6-scene
  chain for the asset pipeline `scroll-world` would otherwise use.
- **No other paid image or video API of any kind.** If a chapter needs an
  asset and no free path exists, flag it to Adnan rather than reaching for a
  paid one. Codex (bills the ChatGPT subscription, not dollars) can help with
  image generation, but only after asking Adnan first, per `PLAN.md`
  section 9 Phase 5.

## No em dashes

Adnan's standing global rule, applies to every file in this repo: code
comments, commit messages, copy, docs. Periods, commas, colons, parentheses
instead. No en dashes used as punctuation either.

## Confidentiality, summarised from PLAN.md section 7

Read section 7 in full before writing any copy or capturing any asset. The
rules that bite hardest:

- Never publish TotalTex revenue, growth rate, CapEx, debt, ownership split,
  street addresses, or Adnan's father's contact details.
- Anonymise Puzzled dealership clients as "four Calgary-area dealerships."
  Never name them.
- Visa and immigration mechanics stay at "Bangladeshi citizen studying in
  Canada." No permit type, no bond amounts.
- **`totaltex-ops/samples/` is real, unredacted third-party business data**
  (buyer and factory names, real job and challan numbers, a cost and profit
  spreadsheet). It is committed to a private repo, which is not currently
  leaking, but **no visual on this portfolio may come from it, ever.**
- **Every TotalTex Ops screenshot must come from `npm run seed:demo` or
  `seed:play` in that repo, never from real data.** No screenshots of that
  app exist on disk today, so every one used here has to be captured fresh
  against seeded demo data, not pulled from a real session.
- Family emotional content from the vault stays out entirely.

## Verification protocol, from PLAN.md section 10

**The Browser pane cannot verify this site.** Automation browsers on this
machine (both the in-app Browser pane and subagent automation tabs) report
`document.hidden = true`, which throttles `requestAnimationFrame`, so any
scroll choreography, Lenis smoothing or framer-motion animation never
visibly runs there. `loading="lazy"` images also come back `naturalWidth: 0`
with zero network requests in that environment, which looks exactly like a
broken build when it is not.

**Drive real Chrome with `puppeteer-core`** for every motion or asset check,
against `C:\Program Files\Google\Chrome\Application\chrome.exe`. This is
already proven working in `totaltex-web` and `totaltex-ops`.

Prefer asserting numerically (`getBoundingClientRect`, `getComputedStyle`)
over eyeballing a screenshot. Screenshots cost roughly 3,600 tokens each at
2160px: shoot at `deviceScaleFactor: 1`, crop to the element, resize to
1000px or less, read one confirming frame.

**A run completing is not a task succeeding.** Re-run the actual claim
yourself (the demo, the diff, the number) rather than trusting an agent's own
summary of what it did.

## Parallel agent rules, from PLAN.md section 9

- Partition agents by **file ownership**. Name in every brief the files that
  agent owns and the files another agent is holding right now.
- **Pin the interface before starting parallel agents.** Exact function
  signature, exact payload shape. File ownership stops one agent overwriting
  another's file, it does not stop two agents building incompatible
  contracts against each other on schedule.
- **Never `git stash` in any agent brief.** Use `git diff` to inspect state
  instead. An agent has previously swallowed another's in-flight edits with
  a stash on a different project; forbid it every time.
- **Pass `model: 'sonnet'` and `effort` on every fan-out `agent()` call.** A
  Workflow `agent()` call silently inherits Opus otherwise, and an
  un-overridden fan-out has previously eaten most of a session's budget in
  one prompt.
- **Serialise anything that builds or measures. Parallelise anything that
  only reads and writes source.**

## Reuse before writing, from PLAN.md section 4.4

`totaltex-web` already contains battle-tested, accessibility-hardened
primitives Adnan owns outright. Copy these into this repo rather than
reinventing them: `lib/motion.ts`, `lib/scroll.ts`, `lib/magnetic.ts`,
`components/reveal.tsx`, `components/smooth-scroll.tsx`,
`components/story/word-reveal.tsx`, `components/home/marquee-pause.tsx`,
`components/home/thread-divider.tsx`. See `PLAN.md` section 4.4 for what each
one gives and why.

**Do not copy `totaltex-web/app/globals.css` design tokens.** That warm-paper
palette is TotalTex's client-locked brand. This site needs its own design
system, built fresh.

## Known traps

- **Check the 21st.dev stash before building any UI component from
  scratch.** Index at
  `C:\Users\adnan\second-brain\wiki\resources\21st-components\`. The chunk 0
  reset found that Adnan's own bookmarked, already-pulled components matched
  the reference sites he pointed to and had simply gone unused. Check the
  stash first.
- **Unlayered CSS element rules beat Tailwind 4 utilities regardless of
  specificity.** Tailwind 4 puts its own utilities inside a cascade layer; a
  bare `h1 { ... }` outside any `@layer` outranks every Tailwind utility
  class no matter how specific that class is. Base type defaults belong
  inside `@layer base` in `app/globals.css`, never left unlayered.
