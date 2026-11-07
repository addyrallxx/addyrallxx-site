"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Clocks } from "@/components/chrome/clocks";
import { INTRO } from "@/lib/content";
import "./intro.css";

declare global { interface Window { __introDone?: boolean } }

export function Intro() {
  const overlay = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    const el = overlay.current!;
    const root = document.documentElement;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const columns = Array.from(el.querySelectorAll<HTMLElement>(".intro-digit"));
    const line = el.querySelector<HTMLElement>(".intro-horizon")!;
    const curtain = el.querySelector<SVGSVGElement>(".intro-curtain")!;
    let cancelled = false, fonts = false, exiting = false, display = 0;
    let previous = "000", changedAt = 0, completedAt = 0;
    const start = performance.now();
    let timeline: gsap.core.Timeline | undefined;
    const announce = () => {
      if (!window.__introDone) {
        window.__introDone = true;
        window.dispatchEvent(new Event("intro:done"));
      }
    };
    const done = () => {
      gsap.ticker.remove(tick);
      timeline?.kill();
      gsap.killTweensOf(el.querySelectorAll(".intro-digit span"));
      try { sessionStorage.setItem("intro-seen", "1"); } catch { /* Storage can be unavailable. */ }
      root.dataset.intro = "done";
      announce();
      setMounted(false);
    };
    const show = (value: number) => {
      const text = String(value).padStart(3, "0");
      columns.forEach((column, i) => {
        if (text[i] === previous[i]) return;
        const [old, next] = Array.from(column.children) as HTMLElement[];
        gsap.killTweensOf([old, next]);
        old.textContent = previous[i];
        next.textContent = text[i];
        gsap.fromTo(old, { yPercent: 0 }, { yPercent: -100, duration: .5, ease: "power3.out" });
        gsap.fromTo(next, { yPercent: 100 }, { yPercent: 0, duration: .5, ease: "power3.out" });
      });
      previous = text;
      el.querySelector<HTMLElement>(".intro-counter")!.dataset.value = text;
    };
    const exit = () => {
      exiting = true;
      gsap.ticker.remove(tick);
      const height = window.innerHeight;
      timeline = gsap.timeline({ onComplete: done })
        .to(el.querySelectorAll(".intro-exit"), { yPercent: -110, stagger: .04, duration: .5, ease: "power3.in" }, 0)
        .fromTo(curtain, { scaleY: 0 }, { scaleY: 1, duration: .2, ease: "power3.in" }, 0)
        .set(el.querySelector(".intro-paper"), { opacity: 0 }, .2)
        .set(curtain, { transformOrigin: "50% 50%" }, .2)
        .to(curtain, { y: -height * 1.18, duration: .9, ease: "expo.inOut", modifiers: { y: value => `${Math.round(parseFloat(value))}px` }, onUpdate: () => { if (Number(gsap.getProperty(curtain, "y")) <= -height * 1.18 * .6) { root.dataset.intro = "exiting"; announce(); } } }, .2);
    };
    const tick = () => {
      const elapsed = performance.now() - start;
      const real = (Number(fonts) + Number(Boolean(root.dataset.sky))) / 2;
      display = Math.max(display, Math.min(real, elapsed / 1600));
      if (elapsed >= 2400) display = 1;
      line.style.transform = `scaleX(${display})`;
      const value = Math.floor(display * 100);
      if (String(value).padStart(3, "0") !== previous && (elapsed - changedAt >= 500 || value === 100)) {
        show(value); changedAt = elapsed;
        if (value === 100) completedAt = elapsed;
      }
      if ((elapsed >= 1600 && completedAt && elapsed - completedAt >= 500) || elapsed >= 2900) exit();
    };
    let seen = false;
    try { seen = sessionStorage.getItem("intro-seen") === "1"; } catch { /* Storage can be unavailable. */ }
    if (motion.matches || seen || window.__introDone) { done(); return; }
    root.dataset.intro = "running";
    document.fonts.ready.then(() => { if (!cancelled) fonts = true; });
    gsap.ticker.add(tick);
    const skip = () => { if (motion.matches) done(); };
    motion.addEventListener("change", skip);
    const ceiling = window.setTimeout(done, 4000);
    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      clearTimeout(ceiling);
      timeline?.kill();
      gsap.killTweensOf(el.querySelectorAll(".intro-digit span"));
      motion.removeEventListener("change", skip);
      if (!exiting) root.dataset.intro = "done";
    };
  }, []);
  if (!mounted) return null;
  return <div className="intro journey-intro" ref={overlay} aria-hidden="true" aria-label={INTRO.label}>
    <div className="intro-paper" />
    <div className="intro-journey">
      <div className="intro-number-mask"><div className="intro-counter intro-exit" data-value="000">
        {[0, 1, 2].map(i => <span className="intro-digit" key={i}><span>0</span><span /></span>)}
      </div></div>
      <div className="intro-horizon" />
      <div className="intro-label-mask"><div className="intro-exit"><Clocks label /></div></div>
    </div>
    <svg className="intro-curtain" viewBox="0 0 1000 1180" preserveAspectRatio="none"><path d="M0 0 H1000 V1000 Q500 1360 0 1000 Z" /></svg>
  </div>;
}
