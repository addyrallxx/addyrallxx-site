"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { HERO } from "@/lib/content";
import { SplitFlap } from "@/components/ui/split-flap";

export function Hero() {
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
      timer = window.setTimeout(rise, 5000);
    }
    window.addEventListener("intro:done", rise);
    return () => { clearTimeout(timer); window.removeEventListener("intro:done", rise); };
  }, []);
  return (
    <>
      <section className="hero" ref={hero}>
        <dl className="hero-facts">
          {HERO.facts.map((fact) => (
            <div key={fact.label}><dt className="t-label">{fact.label}</dt><dd className="t-small"><SplitFlap text={fact.value} intro /></dd></div>
          ))}
        </dl>
        <p className="hero-lead t-body">{HERO.lead}</p>
        <h1 className="t-display-xl" aria-label={HERO.lines.join(" ")}>
          {HERO.lines.flatMap((line, i) => [
            <span className={`hero-line ${i === 1 ? "hero-desktop-line" : ""}`} aria-hidden="true" key={line}>
              <span style={{ "--line-index": i } as CSSProperties}>{Array.from(line).map((letter, j) => <span className="kinetic-letter" key={j}>{letter === " " ? "\u00a0" : letter}</span>)}</span>
            </span>,
            ...(i === 1 ? line.split(" ").map((word, j) => <span className="hero-line hero-phone-line" aria-hidden="true" key={word}>
              <span style={{ "--line-index": i + j } as CSSProperties}>{word}</span>
            </span>) : []),
          ])}
        </h1>
      </section>
    </>
  );
}
