"use client";

import { useEffect, useRef } from "react";

const WARM_ROOT_MARGIN = "-20% 0px -20% 0px";

export function Cosmos(): React.JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let hidden = document.hidden;
    let rootVisible = true;
    const warmSections = new Set<Element>();
    let scrollFrame = 0;
    let maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const cancelScrollFrame = () => {
      if (scrollFrame) {
        window.cancelAnimationFrame(scrollFrame);
        scrollFrame = 0;
      }
    };

    const isPaused = () => hidden || !rootVisible || warmSections.size > 0 || reducedMotion.matches;

    const updatePausedState = () => {
      const paused = hidden || !rootVisible || warmSections.size > 0;
      root.dataset.paused = paused ? "true" : "false";
      root.dataset.warm = warmSections.size > 0 ? "true" : "false";
      if (isPaused()) cancelScrollFrame();
      else onScroll();
    };

    const updateScrollProgress = () => {
      scrollFrame = 0;
      if (reducedMotion.matches) return;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      root.style.setProperty("--cosmos-progress", progress.toFixed(4));
    };

    const onScroll = () => {
      if (!scrollFrame && !isPaused()) {
        scrollFrame = window.requestAnimationFrame(updateScrollProgress);
      }
    };

    const onResize = () => {
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      onScroll();
    };

    const onVisibilityChange = () => {
      hidden = document.hidden;
      updatePausedState();
    };

    const onReducedMotionChange = () => {
      cancelScrollFrame();
      if (reducedMotion.matches) root.style.setProperty("--cosmos-progress", "0");
      updatePausedState();
    };

    let warmObserver: IntersectionObserver | undefined;
    let rootObserver: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      warmObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) warmSections.add(entry.target);
            else warmSections.delete(entry.target);
          }
          updatePausedState();
        },
        { rootMargin: WARM_ROOT_MARGIN },
      );
      document.querySelectorAll("[data-tone=\"warm\"]").forEach((section) => warmObserver?.observe(section));

      rootObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          rootVisible = entry.isIntersecting;
          updatePausedState();
        },
        { rootMargin: "0px" },
      );
      rootObserver.observe(root);
      updatePausedState();
    }

    updatePausedState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onReducedMotionChange);
    onScroll();
    const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(onResize) : undefined;
    resizeObserver?.observe(document.documentElement);

    return () => {
      cancelScrollFrame();
      warmObserver?.disconnect();
      rootObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onReducedMotionChange);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="cosmos"
      aria-hidden="true"
      data-paused="false"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        ["--cosmos-progress" as string]: 0,
      }}
    >
      <div className="cosmos-bloom cosmos-bloom-indigo" />
      <div className="cosmos-bloom cosmos-bloom-teal" />
      <div className="cosmos-bloom cosmos-bloom-ember" />
      <div className="cosmos-vignette" />
    </div>
  );
}
