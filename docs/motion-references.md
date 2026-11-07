# Motion references: teardown and what to build (2026-11-07)

Two references Adnan sent, taken apart into techniques with numbers, then turned into moves for this portfolio. Structure and decisions only: no code, words, art or assets from either source are reused. Credit them in a code comment wherever a move below is built.

Read with `docs/REDESIGN.md` (section 6 motion, 6.8 frame budget) and `docs/DESIGN.md` Design protocol. Where a move below conflicts with REDESIGN 6.3 ("nothing scrubs except the star parallax"), the move says so and needs Adnan's yes before it ships.

## Evidence quality (read first)

| Reference | How it was read | Confidence |
|---|---|---|
| Reference A: @webloved TikTok `7683600199758974230` | yt-dlp download (35.2 s, 1080x1920 HEVC, no captions, no audio transcript), 24 frames sampled about every 1.5 s, three contact sheets read. Caption text read from the post metadata. | Visual content: high. Timings: coarse (1.5 s sampling, so any move shorter than that is inferred). Implementation: inferred from how it looks, the site is filmed off a laptop and no URL is given. |
| Reference B: `neuwebstudio.com/success` | Real Chrome, new tab (closed after), public page only, no sign-in or purchase, nothing downloaded. DOM and computed style measured with JS at 1920x957, DPR 1. | Measurements: high. Intent: inferred. |

Reference B turned out to be a post-signup upsell page ("Thank you", a free download, then a paid add-on offer). Only what the public page renders was observed. One finding contradicts the brief: it has **no scroll parallax** (measured below). The parallax Adnan sees lives inside the videos.

---

## Reference A: the "3D, animated, live, interactive and reactive" site on a laptop

### What the clip is

A filmed laptop on a glossy dark desk with a mirror reflection below it, one hand on the trackpad, a monochrome overlay caption on top. The screen shows a scroll-driven, ink-illustration web experience (a large serif title reading as an experience name, manga-style figures, red and white grounds, one blue accent object). The creator's caption states the lighting thesis: one light source, nothing brighter than a candle, the page darkens as you scroll, "dark is a lighting choice". That is a design brief, not a technique, but it matches what the camera sees: the screen's own colour spills onto the desk and the reflection changes from cold white to red as the scenes change, so the filming is part of the effect.

### Frame by frame (t = seconds into the 35.2 s clip, sampled)

| t | What is on screen | What moves or reacts |
|---|---|---|
| 0 to 1.5 | Near-black ground, huge two-line serif title. A white cloud-shaped blob rises from the bottom edge. | Blob is a mask, not an image: its edge is organic (metaball or noise-displaced), and it floods the viewport. The ground flips dark to light behind it. |
| 3 | Same blob now a black cloud on a white ground, a hooded ink figure standing in a panel, a small caption card bottom-left. | Title word is cropped by the blob (type sits under the mask). Caption card is a DOM element, not baked in. |
| 4.5 | Light ground, tall profile figure, a caption card overlapping the figure. | Figure is a cut-out layer. The card overlaps it, so there are at least two depth planes. |
| 6 to 7.5 | Comic-panel layout: framed panels with a sphere, stairs and a brown figure. Panels overlap and stagger. | Panels translate at different rates (parallax inside the page). Hatched ink textures sit on separate layers. |
| 9 to 10.5 | A red disc grows behind the figure and fills the screen. Hatch texture planes lean in perspective. | The disc scales up as scroll advances (scrubbed, reads as a sun or a camera push). Texture planes show a slight 3D tilt. |
| 12 to 13 | Red wood-plank ground, a white hand reaching toward a round button puck in the centre. Next sample: hand and puck have moved, a white band enters at the bottom. | The puck is an interactive target (custom cursor or CTA). The hand and ground move between samples while the hand on the trackpad is scrolling, so this section is scroll-scrubbed. The white band is a wipe edge. |
| 15 | A circular porthole (iris) on red with a white column border, a figure inside, a small caption. | Iris is a circular `clip-path` or mask that opened from the puck, i.e. a match-cut transition. |
| 16 to 18 | The scene dissolves into vertical streaks: columns and clouds stretched into stripes, then dark slate with red below. | Pixel-sort style vertical smear transition. In a browser this is a displacement shader (UV stretched along Y by a luminance or noise mask) or a pre-rendered video. |
| 19 to 21 | Manga eyes close-up inside a wide card across red columns, then a robed figure at an altar with a small card. | Close-up card slides in over the columns (panel drop), figure scale changes between samples (push-in). |
| 22 | Figure on a pedestal in a white cloud field on red. | Cloud field is the same blob language as t0, so the reel loops its own motif. |
| 23 | Hand pouring a blue bottle into a cocktail glass on red. | New section, product story. Single saturated accent (blue) on the red and white ground. |
| 25 to 28 | Stone column close-ups, a blue-jacketed figure over the eyes, then black brush-ink masks on white. | Hard graphic cuts via masks, no crossfades. Each beat is one clear image. |
| 29 | The title again, the first letters clipped and sliding so the word reads incomplete ("XPERIENC" shape). | Per-letter masked reveal, offset by letter. |
| 31 to 32 | Another vertical smear with blue clothing, then the glass alone on flat red. | Calm beat after a busy one: one object, flat colour, large empty ground. |
| 34 | Giant serif product line with the blue bottle passing behind the letters and a white strip at the bottom. | Real occlusion: type in front of the object. |

### The technique stack, ranked by how much each carries

1. **Two inks on one ground, one accent.** Red, white, near-black, plus one blue object. The palette does more of the "premium" work than any effect. (Matches taste-rules section 5.1.)
2. **Mask-driven scene changes, never fades.** Blob flood, iris, panel drop, vertical smear, white band wipe. Count in this clip: 5 distinct transition types in about 35 s, none repeated back to back. (Matches feedback-adnan rule 6.)
3. **A scene change every 1.5 to 3 s**, but one idea per beat and a quiet beat after each loud one (t32 is one glass on flat red).
4. **Layered illustration with at least three planes** (ground, hatch texture, cut-out figure, caption card, type). Layers move at different rates. (Matches taste-rules 1.2.)
5. **Big type is part of the set.** Letters are cropped by masks and occluded by objects, so the title belongs to the scene.
6. **Scroll is the playhead.** The hand never leaves the trackpad. Everything advances with scroll, so the user feels they are operating the thing (reactive), not watching it.
7. **Light spill.** The screen colour reflected on the desk is the filmmaker's tool; on the web it is the equivalent of one global light colour changing per section.

### How it would be built (three honest options, cheapest first)

| Option | Build | Cost | Fits this site? |
|---|---|---|---|
| A. DOM layers and CSS masks | Absolute layers, `clip-path` / `mask-image` driven by GSAP ScrollTrigger `scrub`. Blob = an SVG path morph or a radial mask with a noise PNG. Iris = `clip-path: circle(r at x y)`. | Cheap, compositor friendly if only transform/clip-path animate. | Yes. This is the main path. |
| B. Pre-rendered video or frame sequence scrubbed by scroll | Render the hard parts (blob flood, vertical smear, 3D tilt planes) offline, play as video or canvas frames, overlay DOM caption cards. | Heavy payload, perfect fidelity. 120 frames of 1280w WebP is about 3 to 5 MB. | Yes for one or two set pieces only. |
| C. Three.js plane stack with a displacement shader | Planes at Z offsets, camera dolly on scroll, fragment shader for the smear and blob. `three` is already installed and the sky canvas already owns a WebGL context. | Highest. A second context is a mobile risk. | Only as extra passes inside the existing sky canvas, never a second canvas. |

Most of what looks like "3D" in this clip is 2D layers with different speeds plus perspective-looking textures. Real 3D is optional.

---

## Reference B: neuwebstudio.com/success (measured)

### Stack

| Item | Measured |
|---|---|
| Platform | Webflow. jQuery 3.5.1, `webflow.js` chunks, Webflow IX2 interactions runtime. Google fonts loader, reCAPTCHA. |
| Smooth scroll | None. No Lenis, no Locomotive, no GSAP, no ScrollTrigger on `window`. `scroll-behavior: auto`, native scroll. |
| Page | 3167 px tall at 1920x957. Body `rgb(243,243,243)`. H1 58px Clash Grotesk. Hero offer block, then one band of videos. |
| IX2 data | 564 events site-wide (hover, scroll-into-view, scrolling-in-view, mouse-move, page scroll up and down, navbar, dropdown) but this page has only 2 elements with `data-w-id` and **zero elements whose transform or opacity changed across 9 scroll positions**. So the page itself runs no scroll animation. |
| IX2 library values (site-wide, other pages use them) | `cubic-bezier(0.215, 0.61, 0.355, 1)` over 800 ms (ease-out-cubic), `cubic-bezier(0.075, 0.82, 0.165, 1)` over 1000 ms (ease-out-circ), `inOutQuint` 400 ms for move, rotate and opacity together, `inOutQuad` 100 ms for small moves, opacity fades at 200 to 500 ms. |

### The "videos that do not look like videos" band

| Measurement | Value |
|---|---|
| Video elements | 19, all `<video loop autoplay muted>` with one `<source video/mp4>`. No `playsinline` attribute, `preload=metadata`, no poster. |
| Native size | 470x320 px (tiny files, 2.9 s to 16.5 s loops, most 3.5 to 7.7 s). |
| Displayed size | 408x278 px, `object-fit: contain`, `border-radius: 0`, no mask, no clip-path, no filter, no blend mode. |
| Layout | One flex row wrapper (`slider-mobile`, 1777x1774 px) that wraps into a 4-column grid: column x = 64, 520, 977, 1433 (pitch about 456 px), row y = 899, 1262, 1625, 1988 (pitch 363 px). Gutter about 48 px horizontally, 85 px vertically. |
| Scroll behaviour | **1:1 with the page.** Tile tops at scroll 0, 400, 800 were 899, 499, 99 (exactly minus 400 per step). No scroll-linked offset, so no parallax between columns. |
| Playback gating | At scroll 0 only the first 4 to 5 videos played; scrolling to 500 and 1000 brought rows 2 and 3 to life; at 1500 the first row had stopped again. Behaviour is consistent with Chrome pausing off-screen muted autoplay videos (or an observer). Net effect: only about 4 to 8 of 19 decode at once. |
| Why they "do not look like videos" | Each clip is a screen recording of a finished site or Figma prototype, cropped to the page's own light-grey ground, so the tiles read as a grid of live websites. There is no player chrome, no frame, no play button, no border. The clip content contains the parallax and scroll motion (the creator's own work being shown), which is what Adnan perceives as "parallax motion and scrolling". |

### What to take from it

1. A grid of looping muted clips beats a static screenshot grid: it proves the work is alive without asking for a click.
2. Small files make it cheap: 470x320 clips displayed at 408x278 is about 1.15x downscale, a few hundred KB each.
3. Play only what is on screen. About 4 to 8 simultaneous decodes keeps a mid laptop at 60 fps.
4. They did not need a motion library for this band. The sophistication is in the clip content, not the page.

---

## Apply to Adnan's portfolio (16 moves)

Constraints that hold for all of them: GSAP + Lenis only (already installed, one ticker), `three` only inside the existing sky canvas, zero dollars, no glow or bloom, tokens only, reduced motion swaps each move for a 150 ms fade or a still, text stays real DOM, copy still goes through `lib/content.ts`.

Shared setup (once, in `components/smooth-scroll.tsx`, which already drives Lenis):

```ts
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

| # | Where | Move | Technique (from) | Build | 60 fps note |
|---|---|---|---|---|---|
| 1 | Preloader | Replace any fade with a **blob flood**: a rising organic mask in `--ink` that reveals the hero, 900 to 1200 ms | Ref A t0 | SVG `<clipPath>` with a path morphed by GSAP (MorphSVG is paid, so tween 6 control points by hand) or a radial `mask-image` scaled with a noise PNG. Plays once per session (existing `intro-seen` key). Hero heading sits under the mask and is revealed by it. | Animate `transform` on the mask layer only, not path `d` per frame on a large element: pre-bake 3 path states and crossfade by `opacity`. Unmount after. |
| 2 | Page transition (`/` to `/work`) | Swap the plain panel wipe for an **iris from the clicked card**: `clip-path: circle(0 at X Y)` on the incoming page, 700 ms `--ease-inout`, X Y from the click | Ref A t15 | In `TransitionLink`, read `getBoundingClientRect` of the clicked card centre, set CSS vars `--x --y`, tween `clip-path` to `circle(150% at var(--x) var(--y))`. Reverse on back is skipped (existing rule). | `clip-path` animates on the compositor in Chrome when the layer is promoted. Set `will-change: clip-path` on the incoming wrapper only for the 700 ms. |
| 3 | Hero | **Three-plane parallax with a light colour**: sky canvas (plane 0), car/portrait cut-out (plane 1), display type (plane 2). Speeds 0.10, 0.22, 0.32 px per scroll px (taste-rules 1.2) | Ref A layering | `gsap.to(layer, { yPercent: -k*100, ease: "none", scrollTrigger: { trigger: hero, scrub: true, start: "top top", end: "bottom top" } })`. Type overlaps the cut-out so the cut-out passes in front of one word (occlusion). | Only `transform`. Three layers max. One ScrollTrigger per layer, batch with `ScrollTrigger.batch` if more. |
| 4 | Hero to Work | **One global light rule**: a CSS var `--light` (hue and angle) that changes per section and tints shadows and the sky; nothing glows | Ref A caption plus the desk spill | `ScrollTrigger` per section sets `--light-h` on `:root` over 600 ms. Cards use it in a flat `box-shadow` offset (no blur above 0 with alpha, per premium-app T3). | Setting a custom property on `:root` forces style recalc for the whole tree: set it on the section wrapper, not `:root`. |
| 5 | Work cards | **Muted looping clip per card**, poster first, plays when 60 percent in view, pauses when out, grid of 2 to 3 columns | Ref B grid | `<video muted loop playsinline preload="none" poster>`. One IntersectionObserver (threshold 0.6) calls `play()` / `pause()`. Cap 4 playing at once: keep a Set and pause the oldest. Clips 640x432, H.264 ~600 kbps plus VP9 webm, 3 to 6 s, `-movflags +faststart`. | Only about 4 decode at once. `preload="none"` plus poster keeps first paint light. Never set `currentTime` per frame on these. |
| 6 | Work cards | **Fan or spread hover** already in memory (`card-fan-hover-technique`) layered with the clip: on hover the card lifts 8 px, the clip starts at 1x playback, the others dim to 0.6 opacity | Ref B plus existing | CSS `:has(:hover)` on the grid, `transition: transform 220ms var(--ease-out), opacity 220ms`. | Transform and opacity only. 220 ms is inside the 150 to 300 ms floor. |
| 7 | Puzzled (video reveal) | **Iris-open then scrub**: the section pins, a circle `clip-path` grows from 0 to full over the first 40 percent of the pin, then the existing `public/puzzled/showcase.mp4` scrubs with scroll | Ref A t15 plus scrub | Pin: `ScrollTrigger({ pin: true, end: "+=200%", scrub: 0.6 })`. Scrub needs all-intra video: `ffmpeg -i in.mp4 -vf scale=1280:-2 -c:v libx264 -g 1 -crf 24 -pix_fmt yuv420p -movflags +faststart scrub.mp4`; keep it under 6 MB (about 90 frames). Apply `video.currentTime = progress * duration` inside `onUpdate`, only when `|delta| > 1/30`. Keep `showcase.webm` as autoplay fallback for reduced motion. | Seeking a long-GOP clip stutters, so all-intra is mandatory. Throttle seeks to rAF. If under 30 fps on throttle, fall back to an image sequence on canvas (60 WebP frames, 1280w). No client name or number may be visible in the clip (PLAN.md section 7). |
| 8 | E92 photo section | **Panel drop and push-in**: a still of the bay slides down over the current section (panel drop 10 to 14 frames), then the photo scales 1.00 to 1.08 over the pin | Ref A t19 | Panel: `yPercent -100 to 0`, 550 ms `power3.out`. Push-in: `scale` on the image inside an `overflow: hidden` frame (move layers inside the panel, taste-rules 1.3). Use the existing four photos (`bay`, `bay-wide`, `front`, `night`) as the sequence. Never state car details beyond the saved build notes. | One `scale` on one image, `will-change: transform` set in `onEnter`, removed in `onLeave`. Images already compressed; use `sizes` and `priority` only for the first. |
| 9 | E92 stripe (existing M stripe) | **Vertical smear transition** between night and day sections, once | Ref A t16 to 18 | Cheapest: 8 vertical slices of the photo (CSS `background-position`), each `scaleY 1 to 2.2` with 40 ms stagger and an `opacity` out, 500 ms. Shader version only inside the sky canvas as a displacement pass if a scratch test beats the CSS one (premium-app T17, T19). | 8 transformed divs is trivial. Do not blur. |
| 10 | Services | **Number-first rows with a hairline draw and a masked rise**: already designed (REDESIGN 6.3). Add one beat: the active row's hatch texture slides 12 px in at 0.22 speed | Ref A hatch planes | Reuse the existing `scaleX` hairline. Hatch is a small PNG tile in `public/textures/`, `transform: translate3d` on scroll only for the active row. | Static texture, transform only. Test 4x CPU throttle p95 under 33 ms (REDESIGN 6.8). |
| 11 | Info (about) | **Letter-clipped title**: the section heading rises letter by letter inside a mask, 30 ms stagger, 600 ms each, plus one image occluding a letter | Ref A t29, t34 | Split by authored spans (no SplitText), `yPercent 105 to 0`, `power3.out`. Occlusion: an absolutely positioned portrait with `z-index` above the heading, `mix-blend-mode: normal`. | Under 40 split spans per heading. Do not animate `letter-spacing` (layout). |
| 12 | Info (portrait) | **Cut-out figure with a cursor-reactive plane**: portrait cut-out (PNG or WebP with alpha) over a two-ink ground, tilts toward the pointer by at most 4 degrees and 8 px | Ref A figure layers | `gsap.quickTo` on `rotationY` and `x`, one `pointermove` on the section, disabled on touch. Reuse `lib/magnetic.ts` pointer maths. | `quickTo` writes transform only. One listener. Throttle by rAF. |
| 13 | Footer / contact | **Glyph pit stays**; add a **big title that finishes itself**: the closing line is clipped on enter, then each letter slides in over 700 ms, hold 1.3 s minimum (taste-rules 2.3) | Ref A t29 | Same as move 11. End state is a held frame with the email button, no wind-down. | Pause the glyph physics `requestAnimationFrame` when the section is off screen (already a pit rule). |
| 14 | Whole page | **Two-skies as the playhead**: tie sky day to night progress to scroll position (0 to 1 over the first three sections) instead of only the toggle | Ref A "scroll is the playhead" | Single `ScrollTrigger` writes `uMode` uniform via `gsap.quickTo`. Toggle remains and overrides. | One uniform write per frame, no extra pass. |
| 15 | Cursor | **Puck cursor** on interactive cards only: a 56 px flat disc with a short label ("View", "Play"), follows with 0.18 lerp, scales 0.6 to 1 on enter | Ref A t12 puck | `quickTo` x and y, `pointer: fine` only, hide on touch. Do not stack on the existing fluid trail: it replaces the trail over cards. | Transform only. Hide when `document.hidden` (Browser pane trap). |
| 16 | Motion variety gate | Before building any section, fill a **variety table** (section by transition in, transition out, camera move, plane count). A duplicate in any column fails. | feedback-adnan rule 3, Ref A (5 transition types in 35 s) | Table lives at the top of the section's PR note. | n/a |

### Mapping to the brief's section list

Preloader: 1. Page transition: 2. Hero: 3, 4, 14. Work cards: 5, 6. Puzzled video reveal: 7. E92 photo section: 8, 9. Services: 10. Info: 11, 12. Footer: 13. Cross-cutting: 14, 15, 16.

### Budget note (the 60 fps contract)

- Animate only `transform`, `opacity`, `clip-path`. Never `filter`, `top`, `left`, `width`, `letter-spacing`, `box-shadow` blur, or SVG `d` on a large element per frame.
- `will-change` is set in `onEnter` and removed in `onLeave` or on `onComplete`. Never leave it on 20 elements.
- One rAF owner: GSAP's ticker drives Lenis and ScrollTrigger. No second rAF loop except the sky canvas, which is pinned to the same ticker.
- No layout reads (`getBoundingClientRect`, `offsetHeight`) inside `onUpdate`. Read once in `onRefresh` and cache.
- Video: all clips `muted playsinline`, at most 4 playing, `preload="none"` with a poster, H.264 plus webm, 640 to 1280 wide, under 1 Mbps for loops. Scrub clip is all-intra (`-g 1`), 1280 wide, under 6 MB, seek only on rAF with a 1/30 s delta gate.
- Total motion payload target: under 12 MB of video and frames on the home page, lazy per section.
- Gate (REDESIGN 6.8): scripted 6 s scroll plus pointer sweep in real Chrome at 1440x900 and 390x844, frame p95 under 16.7 ms, 4x CPU throttle p95 under 33 ms, no long task over 50 ms after the intro. Verify with `puppeteer-core` or `playwright-cli`, not the Browser pane (`document.hidden` is true there, so motion and lazy media never run).
- Mobile: moves 3, 7, 9, 12, 15 degrade to static or a 150 ms fade under 768 px or `prefers-reduced-motion`.

### Build order if Adnan says go

1. Moves 3 and 14 (parallax and scroll playhead): lowest risk, reuse the sky.
2. Moves 5 and 6 (card clips): needs three short clips cut from existing material.
3. Moves 2 and 7 (iris, Puzzled scrub): the headline set pieces. Scratch HTML with sliders first (premium-app T17).
4. Moves 8, 9, 11, 13: E92 and typography.
5. Moves 1, 10, 12, 15, 16: polish and gate.

### Open items

- Reference A is a filmed screen, so the exact site is not identified and nothing about its real scroll length, library or frame rate is measured. If Adnan supplies the live URL, run a `playwright-cli -s=refa --browser=chrome` capture and replace the "inferred" rows with numbers.
- Reference B's media files were not downloaded and no purchase page was entered.
- Moves 3, 7, 8 and 14 add scroll scrubs, which REDESIGN 6.3 forbids today. Adnan's call.

## Reference B: all 19 neuweb clips

Source: `neuwebstudio.com/success`, public page, real Chrome, own tab (closed), nothing downloaded or paid. Method: read each `<video>` (src, duration), paused it, seeked to 2%, 40% and 75% of its loop and drew each frame to a canvas contact sheet, then read the sheet in two screenshots. Every clip is a screen recording of a one-page scroll site shown twice: a wide desktop frame plus a narrow phone frame at the right edge (the same page, so the studio sells "responsive by default"). Frames are 3 samples per clip, so exact easing and timing are estimates; techniques are read from frame differences and are inferred where noted. Captions on the page are empty, so site names are my labels. Techniques only, no copy or code taken.

Shared stack for every clip (from the earlier measurement above plus the frames): Lenis-style smoothed scroll driving scrubbed timelines, big full-bleed hero image or cutout layers, one display serif or grotesk headline that changes between frames, a very small nav that stays fixed. Default build for all: `gsap` + `ScrollTrigger` with `scrub: 0.6 to 1`, Lenis `lerp 0.08`, one pinned section per beat.

| # | Clip (dur) | Label |
|---|---|---|
| 1 | 4.3 s | Dolomites night |
| 2 | 3.0 s | Hong Kong city of light |
| 3 | 4.5 s | Crossroads city morph |
| 4 | 5.2 s | Forest tree gaming |
| 5 | 6.8 s | Scandinavian furniture |
| 6 | 5.7 s | Thai villa plants |
| 7 | 16.5 s | History museum statues |
| 8 | 5.5 s | Green eats ingredients |
| 9 | 5.5 s | Perfume flowers |
| 10 | 3.7 s | Men's skincare |
| 11 | 4.9 s | Whale travel |
| 12 | 3.5 s | Bali villa |
| 13 | 5.2 s | Fruit vitamins |
| 14 | 7.7 s | Amalfi coast |
| 15 | 6.8 s | Beach voyage |
| 16 | 5.7 s | Yoga classes |
| 17 | 2.4 s | Car marque slider |
| 18 | 3.9 s | Soda cans |
| 19 | 8.4 s | Coffee supreme taste |

### 1. Dolomites night (4.3 s)
Site: travel page for a mountain range. Frames: centred "Discover [cloud] Dolomites" headline with a small cloud image sitting between the words, then a cave mouth framing three peaks, then a star-field night over dark land.
Techniques: the cloud is an inline image in the headline that becomes the mask: the page scales into it, so the peaks show through a rounded window (mask or clip-path grow, about 1.2 s, `power3.inOut`), then the scene cross-dissolves to night (dark grade, 0.8 s). Nav and logo stay fixed and fade down.
Build: pin the hero, animate `clip-path: circle()` or an SVG mask from the cloud rect to full screen on scrub, scale the inner image 1.4 to 1, then a second pinned layer fades in with `opacity`. Three.js not needed.
Fit: the opening of the portfolio, a mask grow from a word into the "day sky".

### 2. Hong Kong city of light (3.0 s)
Site: city landing. Frames: pale pastel apartment block facade, then a dense daytime street with signs, then the same street in neon night with a big stencil-like "CITY OF LIGHT" at the bottom edge.
Techniques: a day to night grade change on one photo (two stacked layers, top layer `opacity` 0 to 1 with a colour-graded night version), push-in scale about 1.00 to 1.12, headline rises from below the fold into the frame (`yPercent 100 to 0`, 0.7 s `expo.out`). First frame is a different, flat-colour facade that cuts to the street (hard cut or fast wipe).
Build: two images in one `overflow:hidden` frame, scrubbed `opacity` and `scale`, headline split by line with `SplitText`-style mask.
Fit: exactly the "Two skies" idea: day to night crossfade on scroll, headline rising in.

### 3. Crossroads city morph (4.5 s)
Site: architecture or urbanism site. Frames: top-down grey crossroads on white, then green and timber building blocks growing out along the arms, then glass towers with pools filling the same X shape.
Techniques: an X-shaped (diagonal) clip-path mask frames the image; the content inside swaps in stages (plan view to rooftops to towers), arms of the X reveal new imagery at the edges first. Likely three stacked images under one `polygon()` mask with staggered reveals (0.3 s offsets). Camera-like slow scale 1.0 to 1.15 throughout.
Build: `clip-path: polygon(...)` animated by ScrollTrigger scrub, layers revealed by animating the polygon points of each overlay with different delays.
Fit: a section divider with a non-rectangular reveal (diagonal) between two chapters.

### 4. Forest tree gaming (5.2 s)
Site: game studio. Frames: huge twisted tree in green forest, a glowing blue mushroom cluster lights up lower left as the cursor moves, then the whole scene warms to autumn red and "Gaming" in a large italic serif lands bottom left.
Techniques: cursor-reactive highlight (light follows the pointer, visible cursor in frames 1 and 3), seasonal colour grade shift green to autumn (crossfade of two graded images or a hue filter), headline entrance from the bottom edge with a short letter stagger (about 40 ms per letter).
Build: pointer position into a CSS variable driving a `radial-gradient` mask or `mix-blend-mode: screen` glow; scrubbed `filter: hue-rotate()` (use two images instead for performance); `SplitText` letters `y 40 to 0`.
Fit: pointer-lit hero and a season or time shift, ties to the cursor trail.

### 5. Scandinavian furniture (6.8 s)
Site: furniture shop. Frames: empty white arched room with a small framed navy alcove, then camera pushes in until the navy alcove fills the view with a furnished living room, then a navy page with a product grid.
Techniques: dolly-in through an arch: image scales large (about 1 to 3) around the alcove centre while its mask opens, then a hard colour wipe into a dark navy page where a product card grid fades up with stagger (0.1 s). Nav colours invert from light to dark across the cut.
Build: pin, `scale` the image with `transformOrigin` on the alcove, swap sections with `autoAlpha`, grid cards `stagger 0.1`, nav `color` tween on a ScrollTrigger toggle.
Fit: the entry from "Dhaka" room into "Calgary" room, a push-through-a-doorway transition.

### 6. Thai villa plants (5.7 s)
Site: boutique hotel. Frames: a villa in an arched niche framed by big tropical leaves, near identical in all three samples with the word "THAI LAND" split behind the leaves.
Techniques: parallax depth: foreground leaves move faster and larger than the villa (two or three layers at about 1.0, 0.6 and 0.3 relative speed), the headline sits between layers so leaves overlap its letters, and a slow breathing sway (rotation about 1 to 2 degrees, 3 to 4 s sine). Almost no change between samples means the motion is small and continuous.
Build: separate transparent PNG cutouts for leaves, `yPercent` scrub at different multipliers, a `repeat: -1, yoyo: true` rotation on leaves, headline z-index between layers.
Fit: the home hero: foreground cutouts overlapping a headline for depth.

### 7. History museum statues (16.5 s, the long one)
Site: museum. Frames: "history museum" over green rolling hills, then a marble David statue with columns and the title "Michelangelo David", then a winged Nike statue titled "Samothrace Niké". Same hill backdrop throughout.
Techniques: a persistent backdrop with the foreground subject cut out and swapped per beat (statue slides or scales in, the title swaps with a vertical mask reveal), a small round button under the title, the hills shift horizontally a few percent between beats (parallax about 0.2x). Long loop means about five beats of 3 s each.
Build: one pinned section, a master timeline with N labels, statues as transparent PNGs `xPercent 30 to 0` plus `opacity`, titles as line masks (`yPercent 100 to 0`, 0.6 s `power3.out`), prev/next or scroll snapping to labels.
Fit: the project list: one pinned stage where each project cutout swaps in over a fixed backdrop.

### 8. Green eats ingredients (5.5 s)
Site: healthy food brand. Frames: big "GREEN EAT" over a dish plate, then ingredients (avocado, spinach, rosemary, a dark disc) scattered across a light green page, then the ingredients have flown off, leaving a faded labelled page.
Techniques: explode and scatter: the dish splits into floating ingredient cutouts that drift to fixed positions (random rotation 20 to 60 degrees, stagger 0.05 s, `back.out`), then exit upward. Headline shrinks to a small logo as the scatter happens.
Build: one timeline: cutouts from the plate centre to target x/y with `rotation`, `stagger`, then `y -120%` out; headline `scale 1 to 0.15` toward the nav corner (use `Flip`).
Fit: the skills section: one centre object bursts into labelled items.

### 9. Perfume flowers (5.5 s)
Site: perfume. Frames: "SMELL SUMMER" over a flower meadow, then a pale yellow page with a botanical specimen grid (six flowers with labels), then a glass funnel filled with flowers behind "SCENTS".
Techniques: three scene cuts via wipe or colour fill (green to yellow to mint), specimen items pop in with a stagger from scale 0.6, the funnel is a masked glass object with petals inside (parallax inside the glass), the headline letters wide-tracked and partially hidden behind objects.
Build: pinned scenes with `clip-path` wipes or full-bleed colour panels sliding up, grid items `scale 0.6 to 1` + `opacity` stagger 0.08, glass via an image with an alpha edge.
Fit: chapter transitions by colour field instead of photo cuts.

### 10. Men's skincare (3.7 s)
Site: skincare brand. Frames: product bottles on stone plinths in beige, same products on green plinths, then a white and green infographic with "FACIAL SHIELD", percentages and droplet circles.
Techniques: background and prop colour swap (beige to green) through a crossfade or wipe, then a fast cut to a data layout where the percentages count up and dropper bottle sits right. Plinth heights differ so a subtle parallax per product (0.8x to 1.2x).
Build: stacked layers `opacity` scrub, stat counters with `gsap.to({n:0},{n:90,snap:{n:1}})`, circles `scale 0 to 1`.
Fit: the numbers strip (UCalgary, 2028, projects shipped) as a count-up with soft discs.

### 11. Whale travel (4.9 s)
Site: arctic expedition. Frames: aerial of cracked ice with a small kayak, then dark teal ocean with "SWIM WITH WHALES" and whales below, then a girl on an iceberg looking out at a pale sea.
Techniques: aerial to underwater to horizon is a vertical dive: layers slide up while the scale decreases, headline fades in over teal water, colour grade cools (white to teal to pale blue). Caption "ICE TRAVEL" fixed top centre. Likely a top-to-bottom wipe between full-bleed photos.
Build: vertical `yPercent` wipes with an inner counter-move (image `yPercent -20 to 0`), headline `scale 1.1 to 1` with `opacity`.
Fit: scroll as depth: dive from sky into a lower chapter.

### 12. Bali villa (3.5 s)
Site: villa retreat. Frames: black tropical leaves cut around "BALI TIME" with a figure in a pool, then a misty mountain and pool landscape, then a deep teal water page with "BOOK NOW" and a contact button.
Techniques: leaves form a mask frame (foreground cutouts parting left and right as the scene grows), then a mountain pan, then a colour field with a CTA. Parting leaves are the main move: `xPercent` out in opposite directions, about 0.9 s `power2.inOut`.
Build: two leaf PNGs `xPercent -100 / 100` scrubbed, background `scale 1.25 to 1`, final panel `yPercent 100 to 0`.
Fit: curtain reveal for the contact section.

### 13. Fruit vitamins (5.2 s)
Site: vitamin gummies. Frames: tight alphabet of fruit with "FRUIT VITAMINS", then fruits falling into a pastel gradient (peach to lilac) with gummies, then three big red "FRUIT PILL" bottles on peach.
Techniques: grid labels dissolve into a physics-like drop of fruit cutouts (fall with slight bounce, `bounce.out`, stagger 0.06), colour field changes, then the hero product lands large with a scale 0.8 to 1 settle. Background gradient shifts across scenes.
Build: fruit PNGs `y -300 to 0` with `ease: bounce.out` or Matter.js for a real pile, product `scale` and `yPercent` with a bright background gradient animated by `backgroundPosition`.
Fit: playful hover or reveal for a side-project card, used sparingly.

### 14. Amalfi coast (7.7 s)
Site: Italian coast tourism. Frames: pure blue sea, then "POSITANO" in big white sans over the cliff town, then "AMALFI" with a woman in a sun hat and a pine tree, with a second place name "ATRANI" peeking at the right edge.
Techniques: place names as huge titles swapping per beat with a horizontal slide (next name enters from the right edge, current exits left), background photo changes via a horizontal wipe, foreground cutout (woman, tree) overlaps the title for depth. Sea opening frame is a flat gradient that becomes the first plate.
Build: horizontal pinned track: `xPercent` scrub across 3 panels, titles `xPercent` at 1.4x of the image speed, cutouts above the title layer.
Fit: the "Dhaka to Calgary" spine as a horizontal track with place names as titles.

### 15. Beach voyage (6.8 s)
Site: coastal tour. Frames: soft beige washed screen, then turquoise water with "unforgettable EXPERIENCES" and a small button, a person and swimming figures appearing lower right in the phone frame, then the same teal with phone detail.
Techniques: fade in from a pale wash (white to colour, about 1.5 s), text centred and static while the water (video or image) drifts slowly, small thumbnails slide in at the bottom of the phone view. Low motion, mood piece.
Build: `opacity` of a light overlay 1 to 0, slow background `scale 1.0 to 1.06`, small items `y 30 to 0` stagger.
Fit: the arrival state of a page load (intro wash clearing).

### 16. Yoga classes (5.7 s)
Site: yoga studio. Frames: white arched corridor with a small logo and nav, then grey page with "OUR OUTDOOR CLASSES" and four arch-shaped photo cards (a horizontal row, last one clipped at the edge), then the grey page nearly empty with the logo and nav only.
Techniques: corridor pushes in (vanishing point scale), then a horizontal card row of arch masks slides in, cards `y 60 to 0` stagger, last card cut by the viewport hints horizontal scroll. Final frame is the row exiting left.
Build: `border-radius: 999px 999px 0 0` image cards, `xPercent` scrub on the row inside a pinned section, hero `scale 1 to 1.8` at the vanishing point.
Fit: the project cards as arched or rounded frames in a horizontal row.

### 17. Car marque slider (2.4 s, the shortest)
Site: car brand carousel. Frames: a green sports car with big word "PORCHE" (page spelling), then a red car on a chevron-patterned beige background with a partial "F", then "FORD" with the same red car sliding.
Techniques: brand names as giant background type that swaps, car cutout sliding across (left to right, about 0.6 s `power4.inOut`), chevron pattern wipes across as a transition (diagonal stripes sliding), background colour changes per brand. Fast loop, so each beat is under a second.
Build: slide track with `xPercent`, chevron pattern a repeating-linear-gradient on an overlay moving `xPercent -100 to 100`, title letters offset from the car for depth.
Fit: do not copy the brand pun; useful as a quick tab or filter transition between project categories.

### 18. Soda cans (3.9 s)
Site: drinks brand. Frames: yellow page with a lime can and lime slices, then pink with a grapefruit can and fruit, then the can alone cropped as the pink half takes over.
Techniques: two-colour split panel sweeps (yellow left, pink right) as the can swaps flavour; fruit slices orbit or float with slight rotation; the can has a small tilt (about 5 degrees) on swap. Colour panel moves `xPercent`.
Build: two full-height panels `xPercent` scrub, can image swap with `rotation -8 to 0` and `y 40 to 0`, slices parallax at 0.5x and 1.5x.
Fit: a theme flip (light/dark or accent colour) triggered by a section, not per-image.

### 19. Coffee supreme taste (8.4 s)
Site: coffee brand. Frames: tan page with beans and a chocolate bar flying across "aroma", then "supreme taste" in huge letters over pale blue with a bar standing, then a coffee maker on blue with the headline behind.
Techniques: flying product cutouts crossing the headline with motion blur-like trails (fast `xPercent` plus `rotation`), headline swaps with a stretch (letters scale vertically), a hard cut from tan to blue with the object carried across, depth because the object passes in front of and behind letters.
Build: layer order change (headline z between two copies of the object, or split letters), cutout `x -120% to 120%` with `power2.in` then `out`, headline `scaleY` via letter stagger, background colour tween on scene change.
Fit: a quick "passing object" between two chapters (the headline sits behind the moving subject).

### Five techniques to use first on the portfolio
1. Word-to-mask grow from clip 1: a small image inside the hero headline expands to full screen (day sky to night sky).
2. Day to night grade with push-in from clip 2, matches "Two skies".
3. Depth layers with foreground cutouts over a headline from clip 6 and clip 14.
4. Pinned stage with swapping cutouts and masked titles from clip 7 for the project list.
5. Horizontal pinned track with place-name titles at 1.4x speed from clip 14 for the Dhaka to Calgary spine.
