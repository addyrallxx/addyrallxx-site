"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { INFO } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";
import "./info.css";

// Reference B clip 4: short masked-letter rise, then quiet ruled copy.
export function Info() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Hidden states are armed here, never from server markup, so a failed
    // hydration leaves everything visible.
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
    const el = root.current!;
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".info-char"));
    const rules = Array.from(el.querySelectorAll<HTMLElement>(".info-rule"));
    gsap.fromTo(el.querySelectorAll(".info-year-digit"), { yPercent: 20 }, { yPercent: -6, stagger: .05, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "center center", scrub: .7 } });
    gsap.fromTo(el.querySelector(".info-timeline-progress"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".info-lists", start: "top 70%", end: "bottom 60%", scrub: .6 } });
    gsap.set(chars, { yPercent: 105 });
    gsap.set(rules, { scaleX: 0 });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (entry.target.classList.contains("info-title")) gsap.to(chars, { yPercent: 0, duration: .6, ease: "power3.out", stagger: .03, overwrite: "auto" });
        else gsap.to(entry.target.querySelector(".info-rule"), { scaleX: 1, duration: .6, ease: "power3.out", overwrite: "auto" });
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    observer.observe(el.querySelector(".info-title")!);
    el.querySelectorAll(".info-row").forEach(row => observer.observe(row));
    return () => { observer.disconnect(); gsap.killTweensOf([...chars, ...rules]); gsap.set([...chars, ...rules], { clearProps: "transform" }); };
    });
    return () => media.revert();
  }, []);
  return <section id="info" ref={root} className="home-section info-section" aria-labelledby="info-heading"><SectionReveal>
    <h2 id="info-heading" className="t-label section-label info-title" aria-label={INFO.label}>
      <span aria-hidden="true">{Array.from(INFO.label).map((char, i) => <span className="info-mask" key={i}><span className="info-char">{char}</span></span>)}</span>
    </h2>
    <div className="editorial-grid info-grid">
      <div className="info-profile"><div className="info-year" aria-label={INFO.year}><span aria-hidden="true">{Array.from(INFO.year).map((digit, i) => <span className="info-year-digit" key={i}>{digit}</span>)}</span></div><p className="t-label info-year-label">{INFO.yearLabel}</p><p className="t-body section-body info-bio">{INFO.bio}</p></div>
      <div className="info-lists"><span className="info-timeline" aria-hidden="true"><span className="info-timeline-progress" /></span>{INFO.lists.map((list, i) => <div className="info-chapter" key={list.label}><span className="info-node" aria-hidden="true" /><h3 className="t-label"><span className="info-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{list.label}</h3><ul>{list.items.map(item => <li className="t-small info-row" key={item}><span className="info-rule" aria-hidden="true" />{item}</li>)}</ul></div>)}</div>
    </div>
  </SectionReveal></section>;
}
