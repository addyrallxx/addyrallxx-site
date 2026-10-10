"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { HERO } from "@/lib/content";

export default function Home() {
  const hero = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = hero.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    const rise = () => {
      el.classList.remove("hero-armed");
      if (!reduced.matches) el.classList.add("hero-rise");
    };
    if (document.documentElement.dataset.intro === "done") rise();
    else {
      el.classList.add("hero-armed");
      // A dropped intro chunk must not leave the headline hidden.
      timer = window.setTimeout(rise, 4000);
    }
    window.addEventListener("intro:done", rise);
    return () => { clearTimeout(timer); window.removeEventListener("intro:done", rise); };
  }, []);
  return (
    <main id="main">
      <section className="hero" ref={hero}>
        <h1 className="t-display-xl" aria-label={HERO.lines.join(" ")}>
          {HERO.lines.map((line, i) => (
            <span className="hero-line" aria-hidden="true" key={line}>
              <span style={{ "--line-index": i } as CSSProperties}>{line}</span>
            </span>
          ))}
        </h1>
        <p className="hero-lead t-body">{HERO.lead}</p>
      </section>
      <section id="work" className="h-[200vh] px-[var(--gutter)] pt-[var(--u)]"><h2 className="t-display-l">Work</h2></section>
    </main>
  );
}
