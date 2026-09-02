"use client";

// Ported from totaltex-web/components/reveal.tsx (unchanged: already
// generic). The `immediate` escape hatch and the CSS.supports feature
// detection are load-bearing, kept intact, see the inline comments.

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll reveal. Two paths, CSS decides which one runs (see the
 * "Scroll-bound upgrade" comment in globals.css):
 *
 * - Where `animation-timeline: view()` is supported, a pure-CSS
 *   `@supports` rule on `.reveal` scrubs opacity/transform to real scroll
 *   position. No JS involved at all, so this branch never waits on
 *   hydration and never needs the observer below.
 * - Everywhere else (older Safari/Firefox, no JS), the
 *   IntersectionObserver + `.is-visible` transition is the fallback, same
 *   as before. Deliberately not framer-motion: this runs on dozens of
 *   elements per page and must not block paint.
 *
 * CSS.supports is checked once per mount rather than attaching an observer
 * that would immediately become dead weight in the view()-supported case.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  immediate = false,
}: {
  children: ReactNode;
  /**
   * Opt this element OUT of the reveal entirely: it paints fully visible.
   *
   * Use it for anything ALREADY ON SCREEN at load. A `view()` timeline is
   * scrubbed by how far the element has entered the scrollport, and an
   * element sitting in the first viewport has only entered PARTWAY, with no
   * scroll left above it to finish the job. Measured on totaltex-web: the
   * content well settled at opacity 0.80 and stayed there until the user
   * scrolled, which is exactly the "doesn't load up right away, then loads
   * up too quick when we just scroll down a bit" bug this prop fixes.
   *
   * Shortening the range does not fix this, it only moves the victim. An
   * element near the top would complete, while one near the fold (entry
   * progress near zero, yet plainly on screen) would strand at opacity 0.
   * The only correct answer is that above-the-fold content does not get a
   * scroll-driven reveal at all.
   *
   * Deliberately a prop rather than a measurement inside the effect below,
   * because measuring would put it behind hydration and reintroduce the
   * very flash this system exists to avoid.
   */
  immediate?: boolean;
  /**
   * Stagger in ms. On the scroll-bound path this shifts the animation's
   * scroll RANGE (via --reveal-shift) rather than delaying playback:
   * transition-delay is meaningless once the animation is scrubbed by
   * scroll position instead of played on a clock.
   */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Nothing to observe: the CSS below already paints it visible, on both
    // the scroll-bound path and the fallback.
    if (immediate) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    if (
      typeof CSS !== "undefined" &&
      CSS.supports("animation-timeline", "view()")
    ) {
      // The @supports rule in globals.css drives this element directly;
      // attaching the observer here would be dead code that still costs a
      // layout thrash on every scroll.
      return;
    }
    // Arm the hidden state ONLY now, from the client, and only on the branch
    // that has an observer to undo it.
    //
    // This used to be a `js` class rendered into <html> on the server, which
    // meant the hidden state applied before any JavaScript had proven it
    // could run. A failed hydration or a dropped chunk then left every
    // section at opacity 0 over correctly server rendered markup: a blank
    // page with a healthy DOM, which is the exact failure this project
    // already shipped once. Arming from inside the effect fails open
    // instead. The cost is one frame of visible content before it hides, on
    // the fallback branch only, which no current browser in the reference
    // set even takes.
    document.documentElement.classList.add("reveal-armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  return (
    <div
      ref={ref}
      className={`reveal ${immediate ? "is-immediate " : ""}${className}`}
      style={
        delay
          ? ({
              transitionDelay: `${delay}ms`,
              "--reveal-shift": delay / 8,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
