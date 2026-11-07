"use client";

// Shares the site's GSAP clock and follows live motion preferences.

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
 * paint.
 */
export default function SmoothScroll() {
  useEffect(() => {
    let cancelled = false;
    let gsap: GsapModule["default"] | undefined;
    let media: ReturnType<GsapModule["default"]["matchMedia"]> | undefined;
    const visibility = () => { if (document.hidden) gsap?.ticker.sleep(); else gsap?.ticker.wake(); };
    document.addEventListener("visibilitychange", visibility);

    (async () => {
      const [{ default: gsapMod }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled) return;

      gsap = gsapMod;
      gsap.registerPlugin(ScrollTrigger);

      media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const lenis: LenisInstance = new Lenis({
          lerp: 0.1,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.4,
        });
        lenis.on("scroll", ScrollTrigger.update);
        const raf = (time: number) => { if (!document.hidden) lenis.raf(time * 1000); };
        gsapMod.ticker.add(raf);
        gsapMod.ticker.lagSmoothing(0);
        gsapMod.ticker.fps(60);
        visibility();
        window.__lenis = lenis;
        return () => {
          gsapMod.ticker.remove(raf);
          delete window.__lenis;
          lenis.destroy();
        };
      });
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", visibility);
      media?.revert();
    };
  }, []);

  return null;
}
