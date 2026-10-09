# Adnan Shakib: deep field, paper break

Recorded 2026-10-09 from the current shipped implementation in this checkout. This is a documentation snapshot, not a new palette or a live deployment audit. Existing locked decisions win over blueprint defaults. `GOAL.md` and `NEXT-SESSION.md` supersede PLAN.md's original continuous-world implementation; PLAN.md retains the Dhaka to Calgary narrative and confidentiality rules.

## Overview

A cinematic editorial portfolio for a summer 2027 software internship recruiter, a Calgary dealership owner or dealer family, then a freelance client. The spine is Dhaka to Calgary and the software running real businesses in both places. Deep space surrounds the work; the personal chapter changes to warm paper and serif headings. Zero dollars, existing Vercel URL.

Sources: `app/globals.css` (tokens and Tailwind 4 inline mappings), `app/layout.tsx` (fonts), `app/headings.css`, `app/media.css`, `app/motion.css`, `lib/motion.ts`, and the hero, header, contact, carousel, galaxy and reduced-motion components. Code values take priority over stale explanatory comments.

## Colors

These are the actual hex tokens, not proposed replacements. Warm values override the same names under `data-tone="warm"`.

| Token | Deep field | Paper break | Job |
|---|---|---|---|
| `--canvas` | `#04050f` | `#f4f1ea` | Ground |
| `--canvas-dark` | `#04050f` | unchanged | Dark seam and icon chips |
| `--surface-1` | `#0b0e1c` | `#ebe6dc` | Cards and screenshot frames |
| `--surface-2` | `#121629` | `#e2dcd0` | Raised and hover surfaces |
| `--hairline` | `#1b2036` | `#d8d2c4` | Decorative separators |
| `--hairline-strong` | `#2a3050` | `#bfb8a7` | Stronger panel edges |
| `--ink` | `#f1f2f7` | `#14130f` | Main text |
| `--ink-muted` | `#a4a9c2` | `#55514a` | Supporting text |
| `--ink-subtle` | `#7b809b` | `#666056` | Labels and quiet data |
| `--accent` | `#7b8cff` | `#4955c6` | One interactive accent |
| `--accent-deep` | `#4a56c8` | `#333d96` | Filled-button hover |

Decorative tokens retained: `--m-blue-light: #6cb2e4`, `--m-blue-dark: #1b4fa0`, `--m-red: #e7222e`. Only the single 3px car rule uses that tricolour. `--bloom-indigo: #2d3f9e`, `--bloom-teal: #1d6672`, `--bloom-ember: #7a3a2e` belong only to low-alpha inert Cosmos depth, never text or controls. Warm stars and photographic colours are not extra UI accents.

Tailwind names `canvas`, `surface-1`, `surface-2`, `hairline`, `hairline-strong`, `ink`, `ink-muted`, `ink-subtle`, `accent`, `accent-deep` resolve to the matching CSS variables through `@theme inline`.

## Typography

Four approved Google font families load through `next/font/google` with Latin subsets and `display: swap`. The blueprint's two-family preference does not remove these registers.

| Variable | Family | Shipped role and weight | Existing fallback |
|---|---|---|---|
| `--font-display` | Archivo | Dark headings 600, primary CTA 600 | ui-sans-serif, system-ui, sans-serif |
| `--font-sans` | Manrope | Body, normal 400 | ui-sans-serif, system-ui, sans-serif |
| `--font-serif` | Instrument Serif | Warm headings 400 | ui-serif, Georgia, serif |
| `--font-mono` | JetBrains Mono | Data, tags, timestamps, labels | ui-monospace, monospace |

Exact scale from `app/globals.css`, pixels assume a 16px root:

| Token | Exact value | Clamp bounds in px |
|---|---|---|
| `--step--1` | `clamp(0.833rem, 0.83rem + 0.016vw, 0.844rem)` | 13.328 to 13.504 |
| `--step-0` | `clamp(1rem, 0.956rem + 0.188vw, 1.125rem)` | 16 to 18 |
| `--step-1` | `clamp(1.2rem, 1.095rem + 0.45vw, 1.5rem)` | 19.2 to 24 |
| `--step-2` | `clamp(1.44rem, 1.243rem + 0.84vw, 1.999rem)` | 23.04 to 31.984 |
| `--step-3` | `clamp(1.728rem, 1.398rem + 1.407vw, 2.665rem)` | 27.648 to 42.64 |
| `--step-4` | `clamp(2.074rem, 1.553rem + 2.221vw, 3.552rem)` | 33.184 to 56.832 |
| `--step-5` | `clamp(2.488rem, 1.697rem + 3.375vw, 4.735rem)` | 39.808 to 75.76 |
| `--step-6` | `clamp(2.986rem, 1.573rem + 6.03vw, 7rem)` | 47.776 to 112 |

Hero uses step-6; base h1 step-5; base h2 step-4; h3 step-2. Section titles rise from step-4 to step-5 at 1024px. Lead copy uses step-1, body step-0, labels and carousel captions step--1. `--leading-display: 0.94`, `--leading-heading: 1.08`, `--leading-body: 1.6`. Tracking: display `-0.03em`, heading `-0.02em`, uppercase labels `0.08em`. Mono is for data, never decorative prose.

## Layout

`--content-max: 76rem` (1216px), `--content-narrow: 44rem` (704px), `--measure: 68ch`, `--gutter: var(--space-6)` (24px). Hero heading is capped at 19ch and lead at 60ch. Body is left aligned; headings balance, paragraphs use pretty wrapping.

Spacing is an approved 4px base, not a replacement 8px grid. `--space-N = N * 0.25rem` for N = 1 through 16, then 20, 24, 32, 40. Actual px values: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 80, 96, 128, 160.

Work cards stack, then use 1:1.1 alternating columns at 1024px; media frames reserve 16:10. Hero fills at least one small viewport height, with 128px top and 96px bottom padding. Paper seams occupy `clamp(72px, 10vh, 144px)` above and below the warm section.

## Elevation & Depth

| Token | Actual value |
|---|---|
| `--glass-bg` | `rgba(11, 14, 28, 0.55)` |
| `--glass-border` | `rgba(255, 255, 255, 0.08)` |
| `--shadow-float` | `0 24px 60px -20px rgba(0, 0, 0, 0.8), 0 2px 8px -2px rgba(0, 0, 0, 0.6)` |
| `--shadow-lift` | `0 40px 90px -28px rgba(0, 0, 0, 0.85), 0 4px 12px -4px rgba(0, 0, 0, 0.7)` |
| `--glow-accent` | `0 0 40px -8px rgba(123, 140, 255, 0.35)` |

Header uses canvas at 80% opacity, `blur(20px) saturate(1.8)` and shadow-float. Contact cards hover from shadow-float to shadow-lift. `html` paints the ground; `body` stays transparent. Fixed Cosmos and starfield are inert background layers, with content above them.

## Shapes

`--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 16px`, `--radius-pill: 999px`. Controls are pills, panels are not. Recorded radius references in the source: dheerajakula.dev (22px cards), cade.codes (5px inputs), Sawad (6px to 16px panels). Sawad's exact URL is not recorded there.

## Components

- Header: fixed translucent surface, name link home, desktop chapter links with `aria-current="location"`, email link, warm tone follows About. Chapter and email links have a 44px minimum height.
- Hero: one h1, headline plus lead, one filled accent primary and surface-coloured secondary. Primary uses canvas text on accent; hover uses white on accent-deep. Galaxy remains present on phones.
- Section heading: eyebrow, 48px by 2px accent rule, display title; rule draws on scroll.
- Work card and coverflow: alternating copy/media, proof panel when imagery is absent, 16:10 reserved frame, caption, previous/pause/next controls and indicator hit areas at 44px, with 15px stars. Dwell is 5000ms; hover, focus, dragging, hidden/offscreen, pending image and reduced motion pause it. Empty arrays show a framed message; failed current or requested images stop playback and show a visible status with a retry button. Retry reloads the failed source, committing a requested slide after it loads. Playback remains stopped until resumed. Pause/play is disabled during reduced motion, pending requests and errors.
- Contact: three email opener cards, email CTA and real social marks; null destinations are omitted. Contact is mailto-based in shipped code, not the original PLAN.md Web3Forms or globe proposal.
- Reveal and ScrollTilt: client-armed motion with readable server defaults. Contact press belongs to ScrollTilt (0.985), not a second simultaneous press transform.

### Motion as shipped

`--ease: cubic-bezier(0.16, 1, 0.3, 1)` matches `EASE_SITE = [0.16, 1, 0.3, 1]`. `--dur-fast: 150ms`, `--dur-base: 300ms`, `--dur-slow: 600ms`. `.press:active` scales to 0.97. Work backing lifts 4px. Hero words run 700ms with 40ms word increments after 180ms; hero blocks run 800ms with 180ms stagger; reveal fallback runs 850ms; heading fallback runs 600ms.

Scroll ranges govern continuous choreography, not elapsed milliseconds: About wedge `entry 0% entry 18%`, carousel opening `entry 0% cover 24%`, frame travel `entry 0% exit 100%`. A declared 1ms on a view timeline is not a 1ms timed animation. Galaxy uses one Points draw call, capacity 12,000, area-scaled count (10,000 at 1440x900), shared intro/hero context and shader differential rotation. Static reduced-motion rendering freezes galaxy time; global CSS neutralises transitions and animations, with component static end states and preference listeners.

## Do's and Don'ts

- Keep the cold structural interface, one UI accent, warm personal chapter, and photographic colour. Keep one filled primary per screen and roughly six accent appearances maximum per viewport (`app/globals.css`).
- Preserve approved brand-mark colours and the single car tricolour exception. Never turn bloom colours into controls (`app/globals.css`, `social-icon.tsx`).
- Never restore amber or automotive red as the primary accent; both were rejected (`NEXT-SESSION.md`). Never copy TotalTex's warm-paper tokens (`CLAUDE.md`).
- Keep readable no-JS, no-WebGL and reduced-motion compositions. Never server-render a hidden state requiring hydration to undo (`CLAUDE.md`).
- Never publish confidential business records or assistant/process chatter; screenshots use seeded demo data only (PLAN.md section 7). No paid assets, generation, hosting upgrades or new dependencies for taste.

## Iconography

Existing inline Simple Icons MIT paths supply GitHub, LinkedIn and WhatsApp; email uses a plain envelope. Marks have a 24x24 viewBox and render at 20px in 32px dark chips. LinkedIn is `#0A66C2`, WhatsApp `#25D366`, GitHub ink, email accent. Only marks take brand colours, labels stay neutral. Utility arrows use 20px inline SVG with 1.5px strokes; carousel stars are 15px. Preserve this approved choice rather than installing Lucide by default. Personal identity is the text name in the header, not an invented logo.

## Voice

First-person, concrete, evidence-led. State what was built and why a visitor should care. Claude owns public copy; Codex reviews; Gemini stays excluded. PLAN.md's 8 to 14 word declarative sentence preference and confidentiality ceiling remain in force; current approved copy is in `lib/content.ts`.

## Design protocol (Jack Roberts blueprint, 2026-10-09)

Precedence: this file and its existing locked system first, then `C:/Users/adnan/.claude/CLAUDE.md` under "Design task protocol", then taste skills. Floors are audit criteria, not permission to change approved tokens, fonts, components or motion. Flag every FAIL for Adnan; do not silently fix it. Linearity, Mobbin, Refero, Higgsfield and Kie.ai are excluded. No paid trials, generation APIs, affiliate spending or unpinned CDN loads.

### Portfolio task sequence

Read this system and the 21st.dev situation table before any UI task. Name one job, for example "Show shipped business software and invite a conversation." Select one exact real reference and confirm it can be captured in real Chrome; report missing inputs and any blind critic. Write the surface's `bar.md` from the mechanisms below, show it and wait for go. Use one direction skill. For a large surface, compare three versions from safest to boldest at 1440px and 390px, then mix; for a small edit, one version. Copy structure, never reference words, logos, artwork or code; credit the reference. Use existing tokens, run the floors and preship, then the applicable critics and copy review. Report fails first.

Five-version template: `C:/Users/adnan/second-brain/.raw/design-blueprint/five-versions.md`. Reserve five for an explicitly requested exploration; the merged global protocol defaults to three to conserve usage. On variants apply `one-screen-test.md` in that same folder and count fields, buttons, links and words. Do not turn the portfolio into a signup flow: existing contact needs zero form fields.

### bar.md: portfolio mechanisms

Reference lineage already recorded in `app/globals.css`: Linear for single-accent discipline; dheerajakula.dev, cade.codes and Sawad for pill controls versus panel radii; Adnan's selected spiral-galaxy photography for cold structure and warm light. These are recorded influences, not newly measured reference-site claims. TODO: record Linear's exact comparison page, Sawad's URL and the galaxy reference file before a craft comparison. Do not invent missing links or measurements.

1. Type hierarchy: at 1440px the hero approaches 112px versus 24px lead and 18px body, roughly 4.7:1 headline to lead. At 390px headline is about 48.7px versus 19.3px lead. One h1 stays within 19ch; prose remains left aligned.
2. Accent discipline from Linear: one ion-blue UI accent, one filled primary per screen, no more than about six visible accent uses per viewport. Full-colour social marks and the one 3px car rule remain approved exceptions.
3. Editorial layout: content stops at 1216px with 24px gutters; hero lead stops at 60ch, long prose at 68ch. Work alternates 1:1.1 columns at 1024px and stacks on a 390px phone.
4. Pill/panel split from the recorded portfolio references: 999px control corners, 4/8/16px panel corners, 16:10 media frames. No new all-square or all-pill direction.
5. Two temperatures from the galaxy reference: cold `#04050f` ground and ion-blue controls give way to exactly the personal paper register `#f4f1ea` with Instrument Serif; warm stellar light remains inert. Seams occupy 72px to 144px instead of a full-screen flash.
6. Tactile response: 4px backing lift, 0.97 press for `.press` controls, and 150ms/300ms ease-out feedback. The contact card's single 0.985 ScrollTilt press stays distinct. At reduced motion all text and the full frame remain readable without travel.
7. Continuous depth: galaxy is visible at both 390px and 1440px and changes across a scroll sweep; About wedge settles flat over its entry's first 18%, and carousel slit opens by cover 24%. Readable text never clips or disappears behind stars while these shapes change.

### Floors audit, flag for Adnan

Static source audit dated 2026-10-09. Contrast was recomputed from the real hex values using sRGB linearisation (channel <= 0.04045: channel/12.92, otherwise ((channel+0.055)/1.055)^2.4), luminance weights 0.2126/0.7152/0.0722 and (lighter+0.05)/(darker+0.05). Ratios are rounded to two decimals. PASS below is limited to the stated token or source evidence; no live browser acceptance is claimed.

| Floor | This system's value | Pass/fail/unknown |
|---|---|---|
| Text >= 4.5:1 on main ground | Dark ink/muted/subtle against `#04050f`: 18.17/8.74/5.23. Warm against `#f4f1ea`: 16.48/6.99/5.52 | PASS |
| Text >= 4.5:1 on raised surfaces | Dark subtle `#767b96` to `#7b809b` on surface-2 `#121629`: 4.30 to 4.61. Warm subtle `#716b61` to `#666056` on surface-1 `#ebe6dc`: 4.24 to 5.01; on surface-2 `#e2dcd0`: 3.87 to 4.56. Warm accent `#4a56c8` to `#4955c6` on surface-2: 4.45 to 4.53 | PASS for token pairs; actual placement still needs render audit |
| Filled CTA text >= 4.5:1 | Dark canvas on accent: 6.81; warm canvas on accent: 5.48; white on dark accent-deep hover: 6.08; white on warm accent-deep: 9.34 | PASS for shipped pairings |
| No prohibited white-on-accent text | `#ffffff` on `#7b8cff`: 2.98 | FAIL if used; already prohibited, not the shipped default CTA pairing |
| Contrast over moving or glass backgrounds | Galaxy, bloom, translucent header and paper seams composite behind content | UNKNOWN until worst-case frames at both widths |
| 44px by 44px taps | Carousel previous/pause/next 44x44; indicator buttons 28x28 to 44x44 with unchanged 15px stars and wrapping rows; header name has no 44px minimum | PASS for carousel in source. Name and inline-link bounds UNKNOWN |
| Body >= 16px | step-0 clamp 16px to 18px; step-1 lead 19.2px to 24px. Caption/label register 13.33px to 13.50px | PASS for body; small caption/register is a preship review item |
| Lines 45 to 75ch | measure 68ch, hero lead 60ch; 19ch heading deliberately separate; phone available width can shorten prose | PASS for declared prose maxima; actual per-screen line lengths UNKNOWN |
| Five control states | `.press` adds disabled treatment. Carousel controls/indicators specify default, hover, focus-visible, active and disabled; disabled controls do not hover/press. Pause/play uses native disabled during reduced motion, pending requests and errors | PASS in source |
| Designed empty state | MediaCarousel changes from null to a 16:10 framed title and supporting message for zero images; missing contact channels omitted; work can use proof panels | PASS in source |
| Designed error state | Failed current/requested image changes from silent stop to visible status and a 44px retry control; failed current image has a framed placeholder; retry remounts that source and waits for load before committing | PASS in source; live recovery still needs render verification |
| Reduced motion | Global 0.01ms backstop; component static states, galaxy time frozen, carousel paused and flattened; live preference listeners | PASS in inspected source; visual and keyboard outcomes need render verification |
| Motion 150 to 300ms ease-out | Fast 150ms, base 300ms pass. Slow 600ms, words 700ms, hero 800ms, reveal fallback 850ms remain unchanged. Scroll timelines use progress, not time | ACCEPTED EXCEPTION: approved narrative/hero choreography and scroll-driven reveals exceed 300ms; ordinary control feedback stays 150ms/300ms |
| Focus/icon/essential border >= 3:1 (preship rule 11) | Accent on canvas dark/warm 6.81/5.48. Hairline and strong on main grounds dark 1.26/1.58, warm 1.34/1.75 | PASS for flat focus pairs; FAIL if these decorative borders alone identify a control |

Other blueprint differences stay explicit: four approved font families, a 4px spacing base, sRGB hex tokens, 0.94 hero leading, custom SVG stars and scroll choreography. None is silently replaced to satisfy a generic checklist.

### Design Loop critics

Apply the loop to a new or materially redesigned hero, portfolio landing composition, portfolio poster, and portfolio pitch slides. Existing minor hero edits and all other surfaces get the single preship pass unless Adnan explicitly requests a loop. No poster or pitch deck is currently defined by this site system; establish its brief and reference first.

Split large work into three or four reviewable pieces. Use three fresh-context critics, unaware of the builder's process, judging renders rather than code. All checks are binary PASS/FAIL; all three critics must pass. A fail returns the single biggest gap to the builder; repeat without a fixed round count, keeping piece verdicts, gap history and rounds visible. Missing reference or render means craft is blind, never an automatic pass.

Brief critic, given only the visitor job and approved evidence:
- PASS iff a recruiter can identify Adnan, the Dhaka to Calgary story and shipped business software within five seconds of the first screen.
- PASS iff the internship route exposes the April 2028 graduation fact and proof a recruiter can inspect, without unsupported technical claims.
- PASS iff Calgary business visitors and freelance clients can find a working next step within thirty seconds, with no placeholder or dead contact channel.
- PASS iff project evidence protects dealership identity and TotalTex confidential data, and does not present supply-chain reach as personal travel.

System critic, given only this file and output renders:
- PASS iff deep-field and paper registers, approved type hierarchy and pill/panel split remain intact with no invented token or decorative UI colour.
- PASS iff there is one filled primary per screen and brand marks remain the scoped colour exception.
- PASS iff 390px and 1440px compositions preserve legible copy, usable controls and the explicit floors disposition; unresolved FAILs are disclosed to Adnan, never hidden behind a critic PASS.
- PASS iff reduced motion shows complete content and inert depth, without a blank galaxy slot or clipped text.

Craft critic, given renders and the surface's bar only:
- PASS iff the stripped-label side-by-side comparison beats the selected exact reference on hierarchy and scan path at both widths; name the single biggest remaining gap.
- PASS iff mechanisms 1 to 5 hold visibly, with paper warmth tied to the personal chapter and work evidence prominent.
- PASS iff mechanism 6 feels responsive without double press, jitter or delayed hover settling.
- PASS iff a fine scroll sweep and still frames demonstrate mechanism 7, with no bright star covering prose, shape clipping or empty phone composition.

### Preship

Run `C:/Users/adnan/second-brain/.raw/design-blueprint/preship-20.md`, all 20 yes/no checks with evidence. Use `design-checklist-20.md` in the same folder as the audit map, not an automatic five-agent fan-out for a small task. Run impeccable detect first. Inspect 390px and 1440px real Chrome captures, also test 320/768/1024px and the five-second 1366x768 first screen. Locked differences remain flagged for Adnan rather than silently fixed or counted as passes.

Portfolio additions: wait for `.galaxy-intro` to leave before measuring; abort on wrong page identity; confirm the server PID; drive scroll through `window.__lenis`; sweep each morph's own entry interval finely; check all lazy asset requests after scrolling; inspect no-JS/no-WebGL and reduced-motion content; check stable sphere DOM counts and keyboard carousel pause. Use seeded-demo TotalTex Ops imagery only. Physical phone performance is still unknown, distinct from Chrome emulation. For future code changes retain copy-gate, TypeScript, build and `scripts/verify.mjs` on the actual deployed candidate; this documentation task does not rerun or claim those gates.

For motion tasks, read `motion-brief.md`, `style-md-template.md`, `camera-words.md` and `motion-pass.md` under `C:/Users/adnan/second-brain/.raw/design-blueprint/`. Record the exact clip/file, palette, type, shot timings and numbered camera travel; do not turn camera examples into new site tokens. Film work requires reference frames every 0.5s, three storyboards and a pick, one still per scene, then frames at 0/25/50/75/100%. Website motion uses scroll-position captures at those fractions plus fine morph samples; elapsed time alone cannot test view timelines. Follow existing project motion ownership and zero-dollar rules.

### Human copy

Use `C:/Users/adnan/second-brain/.raw/design-blueprint/human-copy-prompt.md`, slopmonster and the existing humanizer pass. First line answers the visitor's first question about what Adnan has shipped. Prefer 8 to 14 word active sentences, one fact each, common words and specific verbs. Keep approved facts and meaning. Never invent client names, numbers, ratings, quotes, dates or results; write `[needs number]` in drafts when proof is missing. No em dashes or en dashes anywhere. No persona slogans, numbered-kicker saturation, framework lists without artifacts, or assistant workflow language on the public page. Claude writes and Codex reviews public copy; report before/after checker results and whether the rival pass ran, never claim a pass that did not run.

### Gaps

TODO: Record exact reference URLs/captures for Linear and Sawad and the selected galaxy photograph; choose the exact reference for each new surface before a craft loop.
TODO: Define the empty-media omission contract and visible image-error/recovery treatment, plus a loading treatment consistent with the reserved 16:10 frame.
TODO: Document all five control states and review the 28px indicators and unbounded name/inline links with Adnan before any size or component change.
TODO: Resolve the flagged raised-surface text combinations and essential-control border use through actual render evidence and Adnan's decision, without changing locked hex values in this task.
TODO: Motion tokens exist, but semantic mapping for long narrative motion versus 150ms/300ms feedback and the approved exceptions is incomplete; record that disposition with Adnan.
TODO: Document a single utility-icon vocabulary and upstream source/version for every non-brand glyph; keep existing Simple Icons brand paths and approved custom stars.
TODO: Record an approved personal logo source if future posters or pitch slides need one; the current text-name identity needs no invented mark.
TODO: Capture physical-phone performance, worst-case composited contrast and per-screen line lengths; this source audit cannot substitute for those measurements.
