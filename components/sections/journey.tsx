"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHROME } from "@/lib/content";
import "./journey.css";
import { JourneyZipper } from "@/components/ui/journey-zipper";

export function Journey() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!, media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      el.dataset.track = "true";
      // Reference B clip 14: place names travel at 1.4x the horizontal image track.
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { id: "journey", trigger: el, start: "top top", end: () => `+=${innerWidth * 1.4}`, pin: true, scrub: .7, invalidateOnRefresh: true } })
        .to(el.querySelector(".journey-track"), { x: () => -innerWidth, duration: 1 }, 0)
        .fromTo(el.querySelectorAll(".journey-title"), { x: (i: number) => i === 0 ? 0 : innerWidth * (innerWidth < 720 ? .06 : .4) }, { x: (i: number) => i === 0 ? -innerWidth * (innerWidth < 720 ? .06 : .4) : 0, duration: 1 }, 0);
      return () => { delete el.dataset.track; };
    });
    return () => media.revert();
  }, []);
  return <section className="journey" ref={root} aria-label={CHROME.clocks.slice().reverse().map(clock => clock.city).join(" / ")}>
    <JourneyZipper />
    <div className="journey-track">{CHROME.clocks.slice().reverse().map(clock => <div className="journey-place" key={clock.city}>
      <h2 className="journey-title t-display-xl">{clock.city}</h2>
    </div>)}</div>
  </section>;
}
