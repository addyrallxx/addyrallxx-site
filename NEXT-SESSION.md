# Portfolio rebuild handoff

Read this first, then `PLAN.md` (plan of record: the narrative spine and
content sections 1 to 6 still apply, its Three.js-specific technical
sections are superseded), then `CLAUDE.md` (operating rules).
Last updated **2026-09-02, chunk 0 of the reset.**

## The headline: Adnan rejected the Phase 2/3 build, reset to chunk 0

Adnan's own words: it looks bizarre, the copy is "pure 2023 AI", and
assistant chatter reached the published page. He named five reference sites
he likes (sawad.framer.website, redoyanulhaque.me, cade.codes,
dheerajakula.dev, abdulmomin.dev) and asked why his own 21st.dev component
stash was never used.

### Three diagnosed failures

1. 3,105 of the repo's 5,705 lines (54 percent) were the Three.js particle
   world plus the verification scripts that existed only to prove it painted
   pixels. Meanwhile the site had no skills section, no experience section,
   no projects grid, no resume link and no photography.
2. Every component Adnan praised was already in his own 21st.dev bookmarks
   and had been ignored. Img Sphere (id 9464) is the abdulmomin.dev skill
   sphere, already pulled to the vault with full source on 2026-08-31.
   Preloader (2556) is the redoyanulhaque.me loading screen. Contact Card
   (5689) is the cade.codes contact block.
3. The copy was written to pass an audit rather than to be read. No em
   dashes and no classic AI vocabulary (that rule was genuinely followed),
   but every section closed with a manufactured aphorism of the form "X is
   not a Y, it is a Z", every paragraph ended in a line-count stat dump, and
   `components/chapter/chapter-content.tsx` lines 271 to 277 shipped a
   sentence to the live page telling visitors that an AI had invented
   revenue figures about the family business. Root cause: `PLAN.md`
   optimised so hard against overclaiming that the site's entire personality
   became "I am not lying".

## Decisions made this session

- Goal: summer 2027 internship, plus growing Puzzled, plus freelance and
  contract work. Three audiences, one site.
- Design: dark editorial spine with warm photographic chapters.
- The car (a BMW E92 335xi) is woven into the about copy plus one striking
  image and a light "off the clock" element, not given its own chapter.
- Name both TotalTex and Puzzled outright. Client dealerships stay
  anonymous.
- Adnan will take a portrait photograph. He has car photos and video, and
  will generate Calgary day-to-day imagery.
- Work history on the site: Prime Autos Calgary only. Drop Vector
  Marketing.

### The story that was missing, and is now the spine

His 2024 resume (`C:\Users\adnan\Desktop\New folder\adnan shakib
resume.pdf`) shows he was Sales and Inventory Manager at Prime Autos Calgary
from October 2022 to February 2023, earned his AMVIC certification there,
and overhauled that dealership's website and its listings on Facebook,
Kijiji and Carfax. He then built Puzzled, which sells listing automation to
dealerships. He did the job by hand, then automated it, then sold it back to
the industry. The same resume confirms University of Calgary, Faculty of
Science, Computer Science since 2022, which resolves an older CV's
conflicting claim of Schulich School of Engineering.

## What chunk 0 shipped

Commit `4848287` on branch `rebuild`.

- Deleted 20 files: all of `lib/world/`, `components/world/`,
  `scripts/verify/`, plus `components/chapter/chapter-content.tsx`,
  `docs/copy.md`, `docs/arc-reference.md`, `docs/phase-2-world.md`.
- Installed framer-motion 13.1.1.
- New design system in `app/globals.css`, "graphite spine, paper break":
  canvas `#08090b`, surfaces `#101216` and `#171a1f`, hairlines `#23272e`
  and `#333841`, ink `#f1f2f4`, ink-muted `#a4aab3`, ink-subtle `#6d747e`,
  one accent `#e5484d` with `#b8353a` deep. A `[data-tone="warm"]` scope
  flips to paper `#f4f1ea` with ink `#14130f` and accent `#c0392f`. M
  tricolour tokens exist for a single 3px rule at the car moment. Modelled
  on the design-md specs for BMW M and Linear.
- Type scale gained `--step-6` reaching 112px at a 1440px viewport (the old
  scale topped out at 75.8px).
- Fonts: Archivo display, Manrope body, Instrument Serif for the warm band,
  JetBrains Mono for figures and labels only. Deliberately not Inter.
- Lenis is now mounted in `app/layout.tsx`. It had been left out because the
  deleted world already damped scroll and the two fought.
- `app/page.tsx` is header, hero and a "currently" strip only. Hero
  headline: "I sold cars, then I automated the part I hated."

## Two bugs the new verification harness caught, both real

- The heading defaults in `app/globals.css` were unlayered, so the `h1`
  element rule outranked every Tailwind utility (Tailwind 4 puts utilities
  in a layer, and unlayered rules beat layered ones regardless of
  specificity). The hero measured 76px where 112px was intended. Fixed by
  moving the block into `@layer base`.
- `Reveal` is a default export and was imported as a named one.

## Verification approach, carry this forward

19 checks driven through real Chrome with puppeteer-core (required from
`C:\Users\adnan\projects\totaltex-web\node_modules`, since the portfolio does
not have it installed), never the in-app Browser pane. Every check asserts
something a human would see: the hero string, its box dimensions, its
computed font family, the painted ground colour, a literal count of lit
pixels above the fold, and zero em or en dashes in rendered text. All 19 pass
against the live Vercel preview, not only localhost.

The script currently lives outside the repo, at
`C:\Users\adnan\AppData\Local\Temp\claude\C--Users-adnan-projects-portfolio\0e77ed02-eb8a-4696-84ee-003cedc87329\scratchpad\verify-chunk0.mjs`
(a session scratchpad, may not survive). **Move it into the repo as
`scripts/verify.mjs` in a later chunk** so it can be run without hunting for
a session path.

## Deployment

The portfolio repo's git origin is already
`github.com/addyrallxx/addyrallxx-site.git`, so pushing the `rebuild` branch
produces a Vercel preview at
`addyrallxx-site-git-rebuild-addyrallxxs-projects.vercel.app` while
production on `main` stays untouched. Vercel Deployment Protection is ON for
that project, so the preview requires a Vercel login; a temporary shareable
link can be minted with the Vercel MCP `get_access_to_vercel_url` tool and
expires after 23 hours. **Do not disable deployment protection**, it is an
account setting and was not authorised.

## Operational trap to record

21st.dev free tier allows 2 `get_component` retrievals per day, and the
scheduled task `21st-daily-code-stash` spends both automatically on
newest-first bookmarks. It will eat into the build's own budget if not
watched. Today's quota is spent, 0 of 2 remaining, resets 2026-09-03, spent
on Preloader 2556. Every other 21st tool is free and unmetered (search,
list_bookmarks, list_bookmark_lists, get_usage).

## Remaining plan

1. **Chunk 1, structure and real copy for every section.** The most
   important chunk: Adnan judges the words and the bones before any polish.
2. **Chunk 2, the Img Sphere, the Preloader, and the motion pass.**
3. **Chunk 3, photography and the warm band.**
4. **Chunk 4, contact, footer, humanizer, accessibility and performance.**
5. **Chunk 5, the cutover to production.**

Full plan: `C:\Users\adnan\.claude\plans\flickering-forging-trinket.md`.

## Open questions still needing Adnan

1. Expected graduation year.
2. Whether the phone number 587-894-1429 goes public.
3. Which socials to show: LinkedIn `/in/adnanshakib`, Instagram
   `adnann____`, GitHub `addyrallxx`.
4. Whether to register a real domain or keep the vercel.app URL.
5. Whether his father knows TotalTex will be named on the site.
