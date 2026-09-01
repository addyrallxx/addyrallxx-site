"use client";

// Ported from totaltex-web/components/smooth-scroll.tsx (unchanged: already
// generic).

import { useEffect } from "react";

type GsapModule = typeof import("gsap");
type LenisModule = typeof import("lenis");
type LenisInstance = InstanceType<LenisModule["default"]>;

/**
 * Site-wide smooth scroll. Lenis drives native scroll; GSAP ScrollTrigger
 * is kept in sync so scroll-scrubbed choreography can attach triggers
 * without re-plumbing.
 *
 * GSAP/Lenis/ScrollTrigger are loaded via `import()` inside this effect
 * instead of top-level `import`, so they land in a chunk fetched after
 * mount rather than in the shared bundle every route pays for before first
 * paint. Purely a load-timing change: the motion itself, its options, and
 * its cleanup are unchanged.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let gsap: GsapModule["default"] | undefined;
    let lenis: LenisInstance | undefined;
    let raf: ((time: number) => void) | undefined;

    (async () => {
      const [{ default: gsapMod }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;

      gsap = gsapMod;
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        lerp: 0.09,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      });

      lenis.on("scroll", ScrollTrigger.update);

      raf = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      // Anchor scrolling + menu scroll-lock reach the instance through here
      window.__lenis = lenis;
    })();

    return () => {
      cancelled = true;
      if (gsap && raf) gsap.ticker.remove(raf);
      delete window.__lenis;
      lenis?.destroy();
    };
  }, []);

  return null;
}
