"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function HomeMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const covered = new Set<Element>();
      const announce = () => window.dispatchEvent(new CustomEvent("sky:occluded", { detail: covered.size > 0 }));
      // Reference B clips 7 and 14: opaque stages hide the sky, so stop its GPU work.
      document.querySelectorAll("main .work, main .journey, main #e92").forEach(stage => ScrollTrigger.create({
        trigger: stage, start: "top top", end: "bottom bottom",
        onToggle: self => { if (self.isActive) covered.add(stage); else covered.delete(stage); announce(); },
        onRefresh: self => { if (self.isActive) covered.add(stage); else covered.delete(stage); announce(); },
      }));
      return () => { covered.clear(); announce(); };
    });
    media.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
      // Reference B clips 6, 8 and 19: bounded perspective on three different objects.
      const cleanups = [".hero-portal img", ".fan-depth", ".taste-word"].flatMap(selector => {
        const target = document.querySelector<HTMLElement>(selector), section = target?.closest("section");
        if (!target || !section) return [];
        let bounds = section.getBoundingClientRect();
        gsap.set(target, { transformPerspective: 1000 });
        const x = gsap.quickTo(target, "rotationY", { duration: .7, ease: "power3.out" });
        const y = gsap.quickTo(target, "rotationX", { duration: .7, ease: "power3.out" });
        const measure = () => { bounds = section.getBoundingClientRect(); target.style.willChange = "transform"; };
        const move = (event: Event) => {
          if (document.hidden) return;
          const pointer = event as PointerEvent;
          x(Math.max(-1, Math.min(1, (pointer.clientX - bounds.left) / bounds.width * 2 - 1)) * 3);
          y(Math.max(-1, Math.min(1, (pointer.clientY - bounds.top) / bounds.height * 2 - 1)) * -2);
        };
        const leave = () => { x(0); y(0); target.style.willChange = ""; };
        section.addEventListener("pointerenter", measure); section.addEventListener("pointermove", move, { passive: true }); section.addEventListener("pointerleave", leave);
        return [() => { section.removeEventListener("pointerenter", measure); section.removeEventListener("pointermove", move); section.removeEventListener("pointerleave", leave); target.style.willChange = ""; }];
      });
      return () => cleanups.forEach(cleanup => cleanup());
    });
    return () => media.revert();
  }, []);
  return null;
}
