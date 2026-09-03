"use client";

// Section heading: eyebrow (optional) plus a self-drawing accent rule on one
// row, then a large display heading below. Reuses WordReveal (already the
// repo's scroll-bound per-word stagger) for the heading text instead of
// inventing a second stagger mechanism.
//
// The accent rule follows the exact dual-path pattern documented in
// components/reveal.tsx: where `animation-timeline: view()` is supported the
// rule's width is scrubbed directly by scroll position (see app/headings.css),
// and this effect does nothing. Elsewhere it falls back to an
// IntersectionObserver that arms a hidden (width: 0) state and then adds
// `is-visible`, which app/headings.css transitions to full width over 600ms.
// The hidden state is only ever armed from inside this effect, never from
// server-rendered markup, so a dropped chunk or failed hydration fails open
// (rule renders at full width, see the `.section-heading-rule` base style).

import { useEffect, useRef } from "react";
import { WordReveal } from "@/components/story/word-reveal";

export function SectionHeading({
  id,
  eyebrow,
  children,
}: {
  id: string;
  eyebrow?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const ruleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ruleRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline", "view()")) {
      // The @supports rule in app/headings.css drives this element directly.
      return;
    }
    el.classList.add("rule-armed");
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
  }, []);

  return (
    <div className="section-heading">
      <div className="section-heading-top">
        <span ref={ruleRef} className="section-heading-rule" aria-hidden="true" />
        {eyebrow ? <p className="label section-heading-eyebrow">{eyebrow}</p> : null}
      </div>
      <h2 id={id} className="section-heading-title">
        {typeof children === "string" ? <WordReveal text={children} /> : children}
      </h2>
    </div>
  );
}
