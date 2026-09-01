"use client";

// Owns the one canvas the WebGL world renders into. Scroll drives the
// world, the world never drives scroll: see docs/phase-2-world.md section 5.
//
// Pattern: passive scroll listener writes a target into a plain variable,
// a requestAnimationFrame loop eases toward it and calls world.setProgress.
// Under prefers-reduced-motion the rAF loop never starts at all; the scroll
// handler calls setProgress directly instead, since the engine renders once
// per change on the static tier (lib/world/index.ts, setProgress).
//
// React 19 StrictMode double-invokes this effect in dev (mount, cleanup,
// mount). createWorld and the listeners are only ever created inside the
// effect and torn down in its cleanup, so the double-invoke yields one
// throwaway world that is fully disposed before the real one exists, never
// two live worlds or two rAF loops. dispose() is idempotent on the engine
// side (lib/world/index.ts) so cleanup can't double free.

import { useEffect, useRef } from "react";
import { createWorld } from "@/lib/world";
import type { WorldHandle } from "@/lib/world";

declare global {
  interface Window {
    // Debug hook for puppeteer-core verification (docs/phase-2-world.md
    // section 7). Set on mount, deleted on unmount, in dev and production
    // both: the next agent has no other way to reach the engine's debug
    // surface from outside React.
    __world?: WorldHandle;
  }
}

const DAMPING = 0.05;

export default function WorldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const world = createWorld(canvas);
    window.__world = world;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let targetProgress = 0;
    let currentProgress = 0;
    let rafId: number | null = null;

    function readProgress(): number {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable > 0 ? window.scrollY / scrollable : 0;
    }

    function handleScroll() {
      targetProgress = readProgress();
      if (reducedMotion) world.setProgress(targetProgress);
    }

    function damp() {
      currentProgress += (targetProgress - currentProgress) * DAMPING;
      world.setProgress(currentProgress);
      rafId = window.requestAnimationFrame(damp);
    }

    function handlePointer(event: PointerEvent) {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -((event.clientY / window.innerHeight) * 2 - 1);
      world.setPointer(x, y);
    }

    function handleResize() {
      world.resize();
      targetProgress = readProgress();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    handleScroll();
    if (!reducedMotion) rafId = window.requestAnimationFrame(damp);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("resize", handleResize);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      world.dispose();
      if (window.__world === world) delete window.__world;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
