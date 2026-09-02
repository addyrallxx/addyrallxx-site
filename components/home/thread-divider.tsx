"use client";

// Ported from totaltex-web/components/home/thread-divider.tsx. Only
// change: text-accent (that repo's brand class) swapped for text-accent
// (this repo's token). Logic is unchanged.

import { useEffect, useRef } from "react";

type GsapModule = typeof import("gsap");
type GsapContext = ReturnType<GsapModule["default"]["context"]>;

/**
 * A hairline thread laid across a section boundary. It morphs its own
 * curve as the page scrolls past it, so it reads as a thread shifting
 * underfoot rather than a decorative swoosh.
 *
 * No MorphSVG plugin (paid): every keyframe is a single cubic Bezier (M +
 * one C, 8 numbers) with identical anchor endpoints, so only the curve's
 * control-point y-values change between keyframes and GSAP's `attr` tween
 * genuinely interpolates them. Amplitude is deliberately small (control
 * points move within a 12px band around the midline): a thread settling,
 * not a wave.
 */

const Y_MID = 16;
const CURVE_A = `M0 ${Y_MID} C300 10 900 22 1200 ${Y_MID}`;
const CURVE_B = `M0 ${Y_MID} C300 16 900 16 1200 ${Y_MID}`;
const CURVE_C = `M0 ${Y_MID} C300 22 900 10 1200 ${Y_MID}`;

export default function ThreadDivider({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const pathEl = pathRef.current;
    if (!wrapEl || !pathEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pathEl.setAttribute("d", CURVE_B);
      return;
    }

    let cancelled = false;
    let ctx: GsapContext | undefined;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        pathEl.setAttribute("d", CURVE_A);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapEl,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
          defaults: { ease: "none", duration: 1 },
        });
        tl.to(pathEl, { attr: { d: CURVE_C } }).to(pathEl, { attr: { d: CURVE_B } });
      }, wrapEl);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className={`thread-divider w-full text-accent ${className}`}>
      <svg
        viewBox="0 0 1200 32"
        preserveAspectRatio="none"
        className="block h-6 w-full md:h-8"
      >
        <path
          ref={pathRef}
          d={CURVE_B}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
