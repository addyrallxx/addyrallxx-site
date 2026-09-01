// Ported from totaltex-web/lib/scroll.ts (unchanged: already generic).

import type Lenis from "lenis";

declare global {
  interface Window {
    // "lenis" itself is already globally declared by the lenis package
    // with a different shape; we park the instance under __lenis.
    __lenis?: Lenis;
  }
}

/** Weighted long-travel easing shared by all programmatic scrolls. */
const EASE = (t: number) => 1 - Math.pow(1 - t, 4);

/** Smooth-scroll to a section by id, Lenis-first. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.scrollIntoView();
    return;
  }
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { duration: 1.4, easing: EASE });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
