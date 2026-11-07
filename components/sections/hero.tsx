"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO } from "@/lib/content";
import { SplitFlap } from "@/components/ui/split-flap";
import "./hero.css";

export function Hero() {
  const hero = useRef<HTMLElement>(null);
  // Split the longest supplied line at its nearest word boundary on phones.
  const longest = HERO.lines.reduce((best, line, i) => line.length > HERO.lines[best].length ? i : best, 0);
  const phoneLines = HERO.lines.flatMap((line, i) => {
    const spaces = Array.from(line.matchAll(/\s+/g));
    if (i !== longest || !spaces.length) return [line];
    const split = spaces.reduce((best, space) => Math.abs(space.index - line.length / 2) < Math.abs(best.index - line.length / 2) ? space : best);
    return [line.slice(0, split.index), line.slice(split.index + split[0].length)];
  });

  useEffect(() => {
    const el = hero.current!;
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    let entered = false;
    const fit = () => {
      if (disposed) return;
      el.querySelectorAll<HTMLElement>(".hero-fit").forEach(line => {
        if (line.offsetWidth) line.style.setProperty("--hero-fit", String(Math.min(1, el.querySelector("h1")!.clientWidth / line.offsetWidth)));
      });
    };
    const resize = new ResizeObserver(fit);
    resize.observe(el);
    void document.fonts.ready.then(fit);
    fit();
    const media = gsap.matchMedia();
    media.add({ motion: "(prefers-reduced-motion: no-preference)", phone: "(max-width: 719px)", desktop: "(min-width: 720px)" }, context => {
      if (!context.conditions?.motion) return;
      const lines = gsap.utils.toArray<HTMLElement>(context.conditions.phone ? ".hero-phone-line" : ".hero-desktop-line", el);
      const entrances = lines.flatMap(line => Array.from(line.querySelectorAll(".hero-letter-enter")));
      const peels = lines.flatMap(line => Array.from(line.querySelectorAll(".hero-letter-peel")));
      const details = el.querySelectorAll(".hero-lead, .hero-facts > div");
      const entrance = gsap.timeline({ paused: true })
        .fromTo(entrances, { yPercent: 110 }, { yPercent: 0, stagger: .022, duration: .9, ease: "expo.out" })
        .fromTo(details, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .06 }, "-=.25");
      if (entered) entrance.progress(1);
      else { gsap.set(entrances, { yPercent: 110 }); gsap.set(details, { y: 16, opacity: 0 }); }
      const rise = () => { entered = true; entrance.play(); };
      if (!entered && document.documentElement.dataset.intro === "done") rise();
      const timer = entered ? 0 : window.setTimeout(rise, 5000);
      window.addEventListener("intro:done", rise, { once: true });
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: .6, invalidateOnRefresh: true } })
        .to(el.querySelector("h1"), { yPercent: -28 }, 0)
        .to(el.querySelectorAll(".hero-lead, .hero-facts"), { yPercent: -12 }, 0)
        .to(lines.map(line => line.firstElementChild), { x: i => (i % 2 ? 1 : -1) * innerWidth * .06 }, 0)
        .to(peels, { yPercent: -30, stagger: .012 }, 0);
      // Reference B clip 1: the image beside the final word grows into the next scene.
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { id: "hero-mask", trigger: el, start: "top top", end: () => `+=${innerHeight}`, pin: true, scrub: .6, invalidateOnRefresh: true } })
        .fromTo(el.querySelector(".hero-portal"), { clipPath: "inset(69% 8% 13% 76% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.2 }, 0)
        .fromTo(el.querySelector(".hero-portal img"), { scale: 1.4 }, { scale: 1, duration: 1.2 }, 0)
        .to(el.querySelectorAll("h1, .hero-lead, .hero-facts"), { opacity: 0, duration: .4 }, .8);
      return () => { clearTimeout(timer); window.removeEventListener("intro:done", rise); };
    });
    return () => { disposed = true; resize.disconnect(); media.revert(); };
  }, []);

  const renderLine = (line: string, i: number, variant: string) => <span className={`hero-line hero-${variant}-line`} aria-hidden="true" key={`${variant}-${i}`}>
    <span className="hero-line-drift"><span className="hero-fit">{Array.from(line).map((letter, j) => <span className="hero-letter-mask" key={j}><span className="hero-letter-peel"><span className="hero-letter-enter">{letter === " " ? "\u00a0" : letter}</span></span></span>)}</span></span>
  </span>;

  return <section className="hero" ref={hero}>
    <div className="hero-portal" aria-hidden="true"><img src="/studio/composite.webp" alt="" fetchPriority="high" /></div>
    <dl className="hero-facts">{HERO.facts.map(fact => <div key={fact.label}><dt className="t-label">{fact.label}</dt><dd className="t-small"><SplitFlap text={fact.value} intro /></dd></div>)}</dl>
    <p className="hero-lead t-body">{HERO.lead}</p>
    <h1 className="t-display-xl" aria-label={HERO.lines.join(" ")}>{HERO.lines.map((line, i) => renderLine(line, i, "desktop"))}{phoneLines.map((line, i) => renderLine(line, i, "phone"))}</h1>
  </section>;
}
