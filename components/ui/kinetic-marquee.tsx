"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CHROME, WORK } from "@/lib/content";

export function KineticMarquee({ cities = false }: { cities?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!, track = el.firstElementChild as HTMLElement;
    const motion = gsap.matchMedia();
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      let width = 1, x = 0, direction = -1, skew = 0;
      const measure = () => { width = Math.max(1, (track.firstElementChild as HTMLElement).offsetWidth); };
      const resize = new ResizeObserver(measure); resize.observe(track.firstElementChild!); measure();
      const tick = (_time: number, delta: number) => {
        if (document.hidden) return;
        const velocity = window.__lenis?.velocity ?? 0;
        if (Math.abs(velocity) > .1) direction = velocity > 0 ? -1 : 1;
        x += direction * (40 + Math.abs(velocity) * .6) * Math.min(delta, 50) / 1000;
        x = ((x % width) - width) % width;
        skew += (Math.max(-8, Math.min(8, velocity * .12)) - skew) * .15;
        track.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
        el.dataset.direction = String(direction);
      };
      gsap.ticker.add(tick);
      return () => { gsap.ticker.remove(tick); resize.disconnect(); track.style.transform = ""; };
    });
    return () => motion.revert();
  }, []);
  const items = cities ? [...CHROME.clocks].reverse().map(c => c.city) : WORK.map(w => w.name);
  return <div className="kinetic-marquee" ref={root} aria-hidden="true"><div className="marquee-track">{Array.from({ length: 3 }, (_, copy) => <div className="marquee-copy" key={copy}>{items.map((item, i) => <span className={`marquee-item ${(copy * items.length + i) % 3 === 2 ? "marquee-filled" : ""}`} key={item}>{item}<span className="marquee-separator">{cities ? " → " : " / "}</span></span>)}</div>)}</div></div>;
}
