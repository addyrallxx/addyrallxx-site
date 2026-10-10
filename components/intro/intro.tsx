"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Clocks } from "@/components/chrome/clocks";

declare global { interface Window { __introDone?: boolean } }

export function Intro() {
  const overlay = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = overlay.current!;
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let cancelled = false;
    let ready = 0;
    let display = 0;
    let last = performance.now();
    const start = last;
    let timeline: gsap.core.Timeline | undefined;
    const done = () => {
      try { sessionStorage.setItem("intro-seen", "1"); } catch { /* Storage can be unavailable. */ }
      el.hidden = true;
      root.dataset.intro = "done";
      if (!window.__introDone) {
        window.__introDone = true;
        window.dispatchEvent(new Event("intro:done"));
      }
    };
    let seen = false;
    try { seen = sessionStorage.getItem("intro-seen") === "1"; } catch { /* Storage can be unavailable. */ }
    if (motion.matches || seen || window.__introDone) { done(); return; }
    root.dataset.intro = "running";
    gsap.registerPlugin(CustomEase);
    const ease = CustomEase.create("intro-inout", ".76,0,.24,1");
    // The temporary hero has no image. Fonts are its only asynchronous asset.
    document.fonts.ready.then(() => { if (!cancelled) ready = 1; });
    const exit = () => {
      root.dataset.intro = "exiting";
      timeline = gsap.timeline({ onComplete: done });
      timeline.to(counter.current, { yPercent: -101, duration: .9, ease }, 0);
      timeline.fromTo(el, { clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease }, .2);
      // Chrome completes its specified delayed fade at 1500ms.
      timeline.call(done, [], 1.5);
    };
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const elapsed = now - start;
      display += Math.min(Math.min(ready, elapsed / 2000) - display, .9 * dt);
      counter.current!.textContent = String(Math.floor(display * 100)).padStart(3, "0");
      if (display >= 1 && elapsed >= 2000) { counter.current!.textContent = "100"; exit(); }
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const skip = () => { if (motion.matches) { cancelAnimationFrame(frame); timeline?.kill(); done(); } };
    motion.addEventListener("change", skip);
    // CSS also fails open at 4s; dispatch the interface event on that ceiling.
    const ceiling = window.setTimeout(done, 4000);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      clearTimeout(ceiling);
      timeline?.kill();
      motion.removeEventListener("change", skip);
      // A Strict Mode effect replay must not dispatch a second completion.
    };
  }, []);
  return <div className="intro" ref={overlay} aria-hidden="true">
    <div className="intro-counter-wrap"><span ref={counter} className="intro-counter t-display-l">000</span></div>
    <Clocks label />
  </div>;
}
