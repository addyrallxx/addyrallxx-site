// Ported from totaltex-web/components/story/word-reveal.tsx (unchanged:
// already generic).

import { Fragment } from "react";

/**
 * Scroll-bound, bidirectional word reveal for section headings and
 * pull-quotes. Pure CSS (`animation-timeline: view()` in globals.css under
 * `.word-in`), no client JS, no hydration dependency: this is a plain
 * server component.
 *
 * `--w` is the word index, read by the `.word-in` keyframe's
 * `animation-range` to stagger entry. Capped at 10 so a long heading
 * doesn't push the range past a sane window.
 */
export function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="word-in" style={{ "--w": Math.min(i, 10) } as React.CSSProperties}>
            {word}
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </span>
  );
}
