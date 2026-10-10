# bar.md: Level 4 "Two skies"

One job: make a stranger think "this person has taste and ships real
systems" inside the first screen, and want to contact him by the last.

Reference to beat: segerman.dev (first screen craft) and morez.co (footer).

Visible mechanisms, with numbers:

1. The cursor opens the night sky under the day page: fluid trail, sim res
   128, mask threshold .001 to .004, visible on the first mouse move.
2. Night sky reads as a real sky: three star layers, at least 2,500 visible
   stars at 1440x900, twinkle on 2 layers, a Milky Way band, one shooting
   star roughly every 5s, 60fps at 1440 (frame p95 under 16.7ms).
3. Intro counter 000 to 100 in at least 2.0s, wipe 1.1s, headline lines
   rise with 90ms stagger, and content is readable with JS off.
4. Day to night sweep 1.8s with a noise warped edge; text never sits at
   contrast below 4.5:1 for more than 300ms.
5. Work index: 5 projects, one line each, cursor following preview (lerp
   .12, tilt clamp 6deg) that blooms from duotone to colour after 400ms.
6. Card fan band: three cards at -8/4/9deg spread to -16/0/16deg in 400ms.
7. Contact pit: 9 glyphs fall, bounce at .55 restitution, settle under
   1.5s, draggable, physics loop stops when settled.

Copy bar: no paragraph over 45 words, no section over 80 words, hero lead
under 35 words, every project described in one line of what it is and does.
