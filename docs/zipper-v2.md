# Journey zipper v2 spec (2026-11-08)

v1 is live as a placeholder. Adnan's verdict: the idea works, but the object looks cheap, the cobalt reads cheap, and the physics is buggy. v2 replaces only the render. The player (`components/ui/journey-zipper.tsx`, 120 webp frames, scroll-scrubbed) stays as it is.

## Direction: champagne brass on bordeaux grosgrain

This is the most premium of four researched directions and the easiest to build procedurally.

- **Tape:** dense cotton grosgrain with a fine matte rib and a soft sheen. Colour #5A1226 with a #3E0B18 shadow tone. Add a pale woven selvedge or cord bead (#E4DCCB) so it holds on a dark ground. The tape is the hero, because tapes are what TotalTex sells.
- **Teeth:** polished champagne brass. Metallic 1.0, base colour near measured brass (#F5E4AE linear 0.910/0.778/0.423, nudged warm toward the #F1E3C2 token), roughness 0.14 with a faint noise break of ±0.04. Bevel every tooth with 2 to 3 segments so each catches a highlight on the shoulder.
- **Slider and puller:** same brass. A flat, sleek body in the Riri style, and a long tapered puller with an engraved "AS" or a small TT, never a brand mark. The puller hinges on a separate pivot.
- **Ground:** warm near-black #0B0A0E behind the render, or paper. Bordeaux sinks on #0A0F2C. The Journey section ground moves to match.

Rejected:
- Palladium on bone twill: corporate, and the tape vanishes on paper.
- Ruthenium on ink wool: invisible on dark grounds.
- Rose copper on black nylon: off palette.

References:
- Riri metal chains, finishes list: https://www.riri.com/products/riri/chains/metal/
- Hermes hardware guide (Permabrass, palladium, ruthenium): https://madisonavenuecouture.com/blogs/news/hermes-hardware-guide-everything-you-need-to-know
- Lampo (Lanfranchi), in-house tapes and finishes: https://italoamericano.org/lanfranchi-zippers/
- Measured brass: https://physicallybased.info

## Geometry and physics fixes (v1 bugs)

1. **Slider direction.** The stop sits at the Dhaka end, which is closed. Scroll progress moves the slider toward the open Calgary end, so teeth close behind it, the way a real zipper works. v1 ran backwards.
2. **Real Y split.** Ahead of the slider, the rows diverge as `gap(d) = w_max * smoothstep(0, L, d)`, where d is the distance ahead of the slider and L is about 6 tooth pitches. The tapes flare with the teeth, so they no longer read as one band. Behind the slider the rows interlock at a half-pitch offset with gap 0.
3. **Tooth profile.** The scoop has a cup, a nib (hook), a socket and a shoulder, with no square chain links. It is modelled once and instanced along the spine, with a constant tooth count so nothing pops.
4. **Slider body.** Two upper channels and one lower channel with flanges and a lug. The teeth pass through the channels with clearance, not through solid metal.
5. **Puller.** A damped hinge angle with a clearance clamp so it never intersects the body. It droops with gravity and lags slider motion by about 4 frames.
6. **Motion.** No rigid-body simulation. Slider position, gap and puller angle are all deterministic per-frame functions, with a fixed seed so frames never flicker.

## Render contract

- Frames: 120 at 1920x1080 with transparent film, composited by `encode.sh` onto the chosen ground.
- Output paths and sizes match v1: `zip-1920` at about 6 MB and `zip-960` at about 3 MB. Frame 119 is the reduced-motion poster.
- Engine: Cycles OptiX at 64 to 96 samples with the denoiser on. Clamp indirect at 10. Budget about 25 s per frame, about 50 minutes per pass.
- Lighting: Poly Haven studio HDRI (spot-check the id exists), black flags for edge definition on the brass, and a cool rim light on the tape. AgX, with the look checked against 5.2.
- Before the full pass, gate on 3 test stills (frames 0, 60, 119) for Adnan.
