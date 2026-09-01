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

import { ChapterContent } from "@/components/chapter/chapter-content";
import { CHAPTER_PACING } from "@/lib/world";

export default function Home() {
  return (
    <main id="main">
      {CHAPTER_PACING.map((chapter) => {
        const headingId = `${chapter.id}-heading`;
        return (
          <section
            key={chapter.id}
            id={chapter.id}
            aria-labelledby={headingId}
            className="relative flex items-center px-[var(--space-5)] md:px-[var(--space-10)]"
            style={{ minHeight: `${Math.round(chapter.scroll * 10000) / 100}vh` }}
          >
            <ChapterContent chapterId={chapter.id} headingId={headingId} />
          </section>
        );
      })}
    </main>
  );
}
