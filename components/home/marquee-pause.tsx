"use client";

// Ported from totaltex-web/components/home/marquee-pause.tsx. Changes:
// brand utility classes (text-muted, hover:text-accent-deep) swapped for
// this repo's tokens (text-ink-subtle, hover:text-accent), and the button's
// text-[10px] size swapped for --step--1 since 10px is below the 11px
// floor this project enforces (the old site's flagged anti-pattern, see
// PLAN.md section 1). Behavior is unchanged.

import { useState, type ReactNode } from "react";

/**
 * WCAG 2.2.2 pause control for auto-scrolling marquees. A marquee's own
 * `:hover`/`:focus-within` rule (see the `.marquee-track` family in
 * globals.css once one exists) stops it for a mouse resting on the strip or
 * a keyboard user tabbing onto something inside it, but neither reaches
 * touch (no hover state exists at all) nor is discoverable without already
 * knowing to try. Content that moves automatically for more than five
 * seconds needs a persistent, visible pause mechanism regardless of input
 * device; this renders it.
 *
 * Client-scoped to just this wrapper, not the section around it: the
 * marquee's own content (logos, cards, links) is ordinary server-rendered
 * JSX passed in as `children`, so it never itself joins the client bundle,
 * only the toggle and the few bytes of button markup do. Toggling adds
 * `marquee-paused` to the children wrapper; that class is a plain
 * descendant selector in globals.css, so it reaches whichever track
 * variant(s) are nested inside without this component needing to know
 * which ones they are.
 *
 * Without JS the button still renders (SSR) but can't toggle, inherent to
 * any button-driven state, and no regression: the marquee itself is a pure
 * CSS animation that runs with or without JS either way, and :hover still
 * pauses it for a mouse user with JS disabled.
 */
export function MarqueePause({
  label,
  className = "",
  children,
}: {
  /** Used only in the button's accessible name, e.g. "the global brand
      marquee", the visible label stays a quiet "Pause"/"Play" so a screen
      reader hears which marquee this one controls. */
  label: string;
  /** Top-margin utilities for the whole block; each call site passes
      whatever spacing the wrapped marquee used to carry on its own root
      element, since that spacing now needs to sit above the button too. */
  className?: string;
  children: ReactNode;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div className={className}>
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <button
          type="button"
          aria-pressed={paused}
          aria-label={`${paused ? "Play" : "Pause"} ${label}`}
          onClick={() => setPaused((p) => !p)}
          className="press text-[length:var(--step--1)] font-mono uppercase tracking-[0.18em] text-ink-subtle transition-colors duration-200 hover:text-accent"
        >
          {paused ? "Play" : "Pause"}
        </button>
      </div>
      <div className={`mt-4 ${paused ? "marquee-paused" : ""}`}>{children}</div>
    </div>
  );
}
