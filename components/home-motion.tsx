"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function HomeMotion() {
  const atmosphere = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const main = document.querySelector("main")!;
    const originals = new Map<HTMLElement, string>();
    const paragraphs = Array.from(main.querySelectorAll<HTMLElement>("p.t-body"));
    paragraphs.forEach(el => {
      const text = el.textContent ?? "";
      if (text.trim().split(/\s+/).length <= 12) return;
      originals.set(el, text);
      const accessible = document.createElement("span"); accessible.className = "sr-only"; accessible.textContent = text;
      const visual = document.createElement("span"); visual.className = "lit-text"; visual.setAttribute("aria-hidden", "true");
      text.split(/(\s+)/).forEach(word => {
        if (!word.trim()) visual.append(document.createTextNode(word));
        else { const span = document.createElement("span"); span.className = "lit-word"; span.textContent = word; visual.append(span); }
      });
      el.replaceChildren(accessible, visual);
    });
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const cleanups: (() => void)[] = [];
      originals.forEach((_text, el) => {
        const words = Array.from(el.querySelectorAll<HTMLElement>(".lit-word"));
        gsap.set(words, { opacity: .18 });
        let previous = 0;
        const light = (progress: number) => {
          const position = progress * (words.length - 1 + .3);
          const first = Math.max(0, Math.floor(Math.min(position, previous)));
          const last = Math.min(words.length - 1, Math.ceil(Math.max(position, previous)));
          // Only newly crossed words need a write, including large jumps and reverse scroll.
          for (let i = first; i <= last; i++) {
            const opacity = (.18 + .82 * Math.max(0, Math.min(1, (position - i) / .3))).toFixed(3);
            if (words[i].style.opacity !== opacity) words[i].style.opacity = opacity;
          }
          previous = position;
        };
        const scene = el.classList.contains("car-lead") ? el.closest<HTMLElement>("#e92") : null;
        const trigger = ScrollTrigger.create({ trigger: el, start: "top 80%", end: "bottom 45%", scrub: true, onUpdate: self => { if (!document.hidden && !scene?.dataset.pin) light(self.progress); } });
        light(trigger.progress);
        if (scene) {
          let active = false;
          const observer = new IntersectionObserver(entries => { active = entries.some(entry => entry.isIntersecting); }); observer.observe(scene);
          // The pinned scene moves this paragraph independently of document scroll.
          const tick = () => {
            if (!active || !scene.dataset.pin || document.hidden) return;
            const rect = el.getBoundingClientRect();
            light(Math.max(0, Math.min(1, (innerHeight * .8 - rect.top) / (innerHeight * .35 + rect.height))));
          };
          gsap.ticker.add(tick);
          cleanups.push(() => { observer.disconnect(); gsap.ticker.remove(tick); });
        }
      });
      const layer = atmosphere.current!;
      const grounds = [["#work", "#0B1230"], [".services", "#0B0F2A"], ["#info", "#0E0B1A"], ["#e92", "transparent"], ["#contact", "#0B0F2A"]];
      grounds.forEach(([selector, colour]) => {
        const el = main.querySelector(selector);
        if (!el) return;
        ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: self => {
          if (self.isActive) gsap.to(Array.from(layer.children), { opacity: (_i: number, node: HTMLElement) => node.dataset.colour === colour ? .3 : 0, duration: .6, overwrite: true });
        } });
      });
      return () => cleanups.forEach(cleanup => cleanup());
    });
    media.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const hero = main.querySelector<HTMLElement>(".hero")!, headline = hero.querySelector<HTMLElement>("h1")!;
      const letters = Array.from(hero.querySelectorAll<HTMLElement>(".kinetic-letter"));
      let points: { x: number; y: number }[] = [], pointerX = -1000, pointerY = -1000, stretch = 1, active = true;
      const values = letters.map(() => ({ y: 0, weight: 800 }));
      const measure = () => { const scroll = window.__lenis?.animatedScroll ?? 0; points = letters.map(el => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 + scroll }; }); };
      const move = (event: PointerEvent) => { pointerX = event.clientX; pointerY = event.clientY; };
      const leave = () => { pointerX = pointerY = -1000; };
      const observer = new IntersectionObserver(entries => { active = entries.some(e => e.isIntersecting); if (active) measure(); }); observer.observe(hero);
      const tick = () => {
        if (document.hidden || !active) return;
        const velocity = window.__lenis?.velocity ?? 0;
        const next = stretch + (1 + Math.min(.08, Math.abs(velocity) * .001) - stretch) * .15;
        if (Math.abs(next - stretch) > .0001) { stretch = next; headline.style.transform = `scaleY(${stretch.toFixed(4)})`; }
        const scroll = window.__lenis?.animatedScroll ?? 0;
        letters.forEach((letter, i) => {
          const p = points[i]; if (!p) return;
          const force = Math.max(0, 1 - Math.hypot(pointerX - p.x, pointerY + scroll - p.y) / 220);
          const value = values[i];
          const y = value.y + (-6 * force - value.y) * .15;
          const weight = value.weight + (800 + force * 100 - value.weight) * .15;
          if (Math.abs(y - value.y) > .01) { letter.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`; value.y = y; }
          if (Math.abs(weight - value.weight) > 1) { letter.style.setProperty("--letter-weight", String(Math.round(weight))); value.weight = weight; }
        });
      };
      void document.fonts.ready.then(measure);
      window.addEventListener("pointermove", move); window.addEventListener("pointerout", leave); window.addEventListener("resize", measure); window.addEventListener("intro:done", measure);
      hero.addEventListener("animationend", measure);
      gsap.ticker.add(tick);
      return () => { gsap.ticker.remove(tick); observer.disconnect(); window.removeEventListener("pointermove", move); window.removeEventListener("pointerout", leave); window.removeEventListener("resize", measure); window.removeEventListener("intro:done", measure); hero.removeEventListener("animationend", measure); headline.style.transform = ""; letters.forEach(el => { el.style.transform = ""; el.style.removeProperty("--letter-weight"); }); };
    });
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => { media.revert(); originals.forEach((text, el) => { el.textContent = text; }); };
  }, []);
  return <div className="section-atmosphere" ref={atmosphere} aria-hidden="true">{["#0B1230", "#0B0F2A", "#0E0B1A"].map(colour => <div data-colour={colour} style={{ background: colour }} key={colour} />)}</div>;
}
