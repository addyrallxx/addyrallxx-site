"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TASTE } from "@/lib/content";
import { SplitFlap } from "@/components/ui/split-flap";
import { SectionReveal } from "@/components/ui/section-reveal";
import "./taste.css";

// Reference B clip 19: staggered letters settle into a precise display word.
export function Taste() {
  const root = useRef<HTMLElement>(null);
  const copy: typeof TASTE & { measureLabel?: string } = TASTE;
  const last = TASTE.lines.length - 1;
  const word = TASTE.lines[last].match(/\S+\s*$/)?.[0] ?? "";
  const prefix = TASTE.lines[last].slice(0, TASTE.lines[last].length - word.length);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const letters = el.querySelectorAll(".taste-letter");
      const offsets = [0, 14, -6, 22, 4, -10];
      let measured = false;
      const guide = gsap.timeline({ paused: true })
        .to(el.querySelector(".taste-measure"), { opacity: 1, duration: .15 })
        .to(el.querySelector(".taste-measure"), { opacity: 0, duration: .2 }, "+=.6");
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, start: "top 80%", end: "center 45%", scrub: .7, invalidateOnRefresh: true }, onComplete: () => { if (!measured) { measured = true; guide.play(); } } })
        .fromTo(letters, { x: i => offsets[i % offsets.length] * innerWidth / 1400, y: i => i % 2 ? -(1 + i % 3) : 1 + i % 3 }, { x: 0, y: 0, duration: 1 }, 0)
        .fromTo(el.querySelector(".taste-first-line"), { yPercent: 110 }, { yPercent: 0, duration: .7 }, 0)
        .fromTo(el.querySelector(".taste-body"), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5 }, .5);
    });
    return () => media.revert();
  }, []);
  return <section id="taste" className="home-section taste" aria-labelledby="taste-heading" ref={root}><SectionReveal>
    <h2 id="taste-heading" className="t-label section-label"><SplitFlap text={TASTE.label} /></h2>
    <p className="t-display-l section-heading" data-custom-reveal aria-label={TASTE.lines.join(" ")}>{TASTE.lines.map((line, i) => <span className="section-line" aria-hidden="true" key={i}><span className={i === 0 ? "taste-first-line" : undefined}>{i === last ? <>{prefix}<span className="taste-word">{Array.from(word).map((letter, j) => <span className="taste-letter" key={j}>{letter}{j === 1 && <span className="taste-measure t-label" aria-hidden="true"><span>{copy.measureLabel}</span></span>}</span>)}</span></> : line}</span></span>)}</p>
    <div className="editorial-grid"><p className="t-body section-body taste-body" data-custom-reveal>{TASTE.body}</p></div>
  </SectionReveal></section>;
}
