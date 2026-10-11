"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { attachMagnetic } from "@/lib/magnetic";

export function SectionReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    gsap.registerPlugin(ScrollTrigger);
    const magnets = Array.from(el.querySelectorAll<HTMLElement>(".contact-pill:not(.email-copy)")).map(button => attachMagnetic(button));
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(el.querySelector(".section-hairline"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 65%", scrub: true } });
    });
    media.add("(min-width: 720px) and (prefers-reduced-motion: no-preference)", () => {
      el.querySelectorAll<HTMLElement>(".t-display-l").forEach(heading => {
        gsap.fromTo(heading, { y: 48 }, { y: -48, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return () => { media.revert(); magnets.forEach(cleanup => cleanup()); };
    const targets = el.querySelectorAll(".section-line, .section-body, .index-row, .e92-stripe");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -20% 0px" });
    targets.forEach(target => { target.classList.add("section-armed"); observer.observe(target); });
    const finish = () => { if (motion.matches) { targets.forEach(target => target.classList.add("is-visible")); observer.disconnect(); } };
    motion.addEventListener("change", finish);
    return () => { media.revert(); magnets.forEach(cleanup => cleanup()); observer.disconnect(); motion.removeEventListener("change", finish); targets.forEach(target => target.classList.remove("section-armed")); };
  }, []);
  return <div ref={ref}><span className="section-hairline" aria-hidden="true" />{children}</div>;
}
