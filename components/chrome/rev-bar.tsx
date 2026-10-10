"use client";

import { useEffect, useRef } from "react";
import "@/lib/scroll";

export function RevBar() {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = bar.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, previous = 0, scale = 1, speed = 0;
    // Exact critically damped spring solution, independent of frame rate.
    const tick = (now: number) => {
      frame = 0;
      const dt = previous ? Math.min((now - previous) / 1000, .05) : 1 / 60;
      previous = now;
      const target = 1 + Math.min(Math.abs(window.__lenis?.velocity ?? 0) / 18, 5);
      const offset = scale - target, decay = Math.exp(-24 * dt);
      const c = speed + 24 * offset;
      scale = target + (offset + c * dt) * decay;
      speed = (speed - 24 * c * dt) * decay;
      el.style.transform = `scaleX(${scale})`;
      if (target > 1 || Math.abs(scale - 1) > .001 || Math.abs(speed) > .001) frame = requestAnimationFrame(tick);
      else { scale = 1; speed = 0; previous = 0; el.style.transform = "scaleX(1)"; el.style.willChange = ""; }
    };
    const wake = () => {
      if (!frame && !motion.matches && !document.hidden) { previous = 0; el.style.willChange = "transform"; frame = requestAnimationFrame(tick); }
    };
    const stop = () => {
      if (motion.matches || document.hidden) { cancelAnimationFrame(frame); frame = 0; previous = 0; scale = 1; speed = 0; el.style.transform = "scaleX(1)"; el.style.willChange = ""; }
    };
    window.addEventListener("scroll", wake, { passive: true });
    document.addEventListener("visibilitychange", stop);
    motion.addEventListener("change", stop);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", wake); document.removeEventListener("visibilitychange", stop); motion.removeEventListener("change", stop); };
  }, []);
  return <span className="rev-bar m-stripe" ref={bar} aria-hidden="true"><span /><span /><span /></span>;
}
