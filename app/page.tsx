// Six chapter landmarks, one per lib/world's ChapterId, in scroll order.
// Real copy is docs/copy.md and lands in full in Phase 3. The Arrival
// headline is already the approved line from that file, because the page
// needs exactly one h1 and a placeholder h1 would have to be replaced twice.
//
// Section height is derived from lib/world/pacing's CHAPTER_PACING rather
// than hardcoded: each chapter's `scroll` value is dwell distance as a
// multiple of viewport height (docs/phase-2-world.md section 3.4), so a
// chapter with scroll: 2 gets a section twice as tall as one with scroll: 1.
// The engine reads window scroll fraction against total document height
// (components/world/world-canvas.tsx), so keeping every section's height in
// that same ratio is what makes the two agree on where each chapter falls.
//
// Deliberately NO kicker line above these headings. A short label sitting
// above a heading is the `kicker-above-heading` anti-pattern, and it is one
// of the 49 findings against the site this replaces (PLAN.md section 1).

import { CHAPTER_PACING } from "@/lib/world";
import type { ChapterId } from "@/lib/world/types";

const CHAPTER_LABEL: Record<ChapterId, string> = {
  arrival: "I build the software two businesses actually run on.",
  ground: "Ground",
  totaltex: "TotalTex Ops",
  puzzled: "Puzzled",
  "field-notes": "Field notes",
  contact: "Contact",
};

export default function Home() {
  return (
    <main id="main">
      {CHAPTER_PACING.map((chapter) => {
        const headingId = `${chapter.id}-heading`;
        const isArrival = chapter.id === "arrival";
        const Heading = isArrival ? "h1" : "h2";
        return (
          <section
            key={chapter.id}
            id={chapter.id}
            aria-labelledby={headingId}
            className="relative flex items-center px-6 md:px-10"
            style={{ minHeight: `${Math.round(chapter.scroll * 10000) / 100}vh` }}
          >
            <div className="max-w-[640px] rounded-sm bg-ink-0/70 p-[var(--space-6)] backdrop-blur-sm">
              <Heading
                id={headingId}
                className={
                  isArrival
                    ? "font-sans text-[length:var(--step-4)] leading-[1.1] tracking-[-0.02em] text-paper-0"
                    : "font-sans text-[length:var(--step-3)] text-paper-0"
                }
              >
                {CHAPTER_LABEL[chapter.id]}
              </Heading>
            </div>
          </section>
        );
      })}
    </main>
  );
}
