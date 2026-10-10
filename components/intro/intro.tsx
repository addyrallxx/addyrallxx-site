"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Clocks } from "@/components/chrome/clocks";

declare global { interface Window { __introDone?: boolean } }

export function Intro() {
  const overlay = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = overlay.current!;
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const counter = el.querySelector<HTMLElement>(".intro-counter")!;
    const line = el.querySelector<HTMLElement>(".intro-horizon")!;
    const columns = Array.from(el.querySelectorAll<HTMLElement>(".intro-digit"));
    let cancelled = false, fonts = false, display = 0, previous = "";
    let last = performance.now();
    const start = last;
    let width = 0, digitWidth = 0;
    let timeline: gsap.core.Timeline | undefined;
    const announce = () => {
      if (!window.__introDone) {
        window.__introDone = true;
        window.dispatchEvent(new Event("intro:done"));
      }
    };
    const done = () => {
      try { sessionStorage.setItem("intro-seen", "1"); } catch { /* Storage can be unavailable. */ }
      el.hidden = true;
      root.dataset.intro = "done";
      announce();
    };
    let seen = false;
    try { seen = sessionStorage.getItem("intro-seen") === "1"; } catch { /* Storage can be unavailable. */ }
    if (motion.matches || seen || window.__introDone) { done(); return; }
    root.dataset.intro = "running";
    gsap.registerPlugin(CustomEase);
    const ease = CustomEase.create("intro-inout", ".76,0,.24,1");
    const out = CustomEase.create("intro-out", ".16,1,.3,1");
    const measure = () => {
      width = el.querySelector<HTMLElement>(".intro-seam")!.clientWidth;
      digitWidth = parseFloat(getComputedStyle(columns[0]).width);
    };
    document.fonts.ready.then(() => { if (!cancelled) { measure(); fonts = true; } });
    window.addEventListener("resize", measure);
    const show = (value: number) => {
      const text = String(value);
      counter.dataset.value = text;
      counter.style.opacity = "1";
      columns.forEach((column, i) => {
        const digit = text[i];
        column.hidden = digit === undefined;
        if (digit === undefined || previous[i] === digit) return;
        const [old, next] = Array.from(column.children) as HTMLElement[];
        gsap.killTweensOf([old, next]);
        old.textContent = previous[i] ?? "";
        next.textContent = digit;
        gsap.fromTo(old, { yPercent: 0 }, { yPercent: -100, duration: .16, ease: out });
        gsap.fromTo(next, { yPercent: 100 }, { yPercent: 0, duration: .16, ease: out });
      });
      previous = text;
    };
    const exit = () => {
      gsap.ticker.remove(tick);
      timeline = gsap.timeline({ onComplete: done });
      el.dataset.finale = "true";
      timeline.set(line, { background: "transparent" }, 0);
      timeline.fromTo(".intro-stripe > span", { y: 0 }, { y: (i: number) => (i - 1) * 5, duration: .28, ease: out }, 0);
      timeline.to(counter, { yPercent: -110, duration: .45, ease }, 0);
      timeline.call(() => { root.dataset.intro = "exiting"; el.dataset.parting = "true"; }, [], .15);
      timeline.to(".intro-top", { yPercent: -100, duration: 1.1, ease }, .15);
      timeline.to(".intro-bottom", { yPercent: 100, duration: 1.1, ease }, .15);
      timeline.to(line, { opacity: 0, duration: .25 }, 1);
      timeline.to(".intro-stripe", { opacity: 0, duration: .25 }, 1);
      timeline.call(announce, [], .85);
      // Preserve the exit state until the chrome's delayed fade finishes.
      timeline.to({}, { duration: .4 }, 1.25);
    };
    const tick = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      const elapsed = now - start;
      if (elapsed < 300) return;
      const real = (Number(fonts) + Number(Boolean(root.dataset.sky))) / 2;
      display += Math.min(Math.min(real, elapsed / 2000) - display, .9 * dt);
      line.style.transform = `scaleX(${display})`;
      const value = Math.floor(display * 100);
      if (value > 0 && String(value) !== previous) show(value);
      counter.style.transform = `translateX(${Math.max(0, Math.min(width - previous.length * digitWidth, width * display - previous.length * digitWidth))}px)`;
      if (display >= 1 && elapsed >= 2000) exit();
    };
    gsap.to(el.querySelector(".clocks"), { opacity: 1, duration: .4, delay: .5 });
    gsap.ticker.add(tick);
    const skip = () => { if (motion.matches) { gsap.ticker.remove(tick); timeline?.kill(); done(); } };
    motion.addEventListener("change", skip);
    const ceiling = window.setTimeout(() => { gsap.ticker.remove(tick); timeline?.kill(); done(); }, 5000);
    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      clearTimeout(ceiling);
      timeline?.kill();
      gsap.killTweensOf(el.querySelectorAll(".intro-digit span, .clocks"));
      motion.removeEventListener("change", skip);
      window.removeEventListener("resize", measure);
    };
  }, []);
  return <div className="intro" ref={overlay} aria-hidden="true">
    <div className="intro-half intro-top">
      <div className="intro-seam">
        <div className="intro-counter-wrap"><div className="intro-counter" data-value="">
          {[0, 1, 2].map((i) => <span className="intro-digit" key={i} hidden><span /><span /></span>)}
        </div></div>
        <div className="intro-horizon" />
        <div className="intro-stripe"><span /><span /><span /></div>
      </div>
    </div>
    <div className="intro-half intro-bottom"><Clocks label /></div>
  </div>;
}
