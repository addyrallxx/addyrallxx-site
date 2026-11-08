"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHROME } from "@/lib/content";
import "./journey.css";
import { ThreadRibbon } from "@/components/ui/thread-ribbon";

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
        .fromTo(el.querySelectorAll(".journey-title"), { x: () => innerWidth * .2 }, { x: () => -innerWidth * .2, duration: 1 }, 0);
      return () => { delete el.dataset.track; };
    });
    return () => media.revert();
  }, []);
  return <section className="journey" ref={root} aria-label={CHROME.clocks.slice().reverse().map(clock => clock.city).join(" / ")}>
    <ThreadRibbon />
    <div className="journey-track">{CHROME.clocks.slice().reverse().map((clock, i) => <div className="journey-place" key={clock.city}>
      <Image src={i === 0 ? "/totaltex/homepage-hero.webp" : "/e92/v2/profile.webp"} width={i === 0 ? 2880 : 2350} height={i === 0 ? 2200 : 1322} quality={90} sizes="100vw" alt="" />
      <h2 className="journey-title t-display-xl">{clock.city}</h2>
    </div>)}</div>
  </section>;
}
