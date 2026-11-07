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
    return () => media.revert();
  }, []);
  return null;
}
