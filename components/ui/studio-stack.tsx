"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORK } from "@/lib/content";
import "./studio-stack.css";

export function StudioStack() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = root.current!, media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const layers = Array.from(el.querySelectorAll<HTMLElement>(".studio-plane"));
      const speeds = [.05, .12, .22];
      const moves = layers.map(layer => ({ x: gsap.quickTo(layer.firstElementChild, "x", { duration: .6, ease: "power3.out" }), y: gsap.quickTo(layer.firstElementChild, "y", { duration: .6, ease: "power3.out" }) }));
      let bounds = el.getBoundingClientRect();
      const measure = () => { bounds = el.getBoundingClientRect(); };
      const resize = new ResizeObserver(measure); resize.observe(el);
      const desktop = matchMedia("(min-width: 900px)").matches;
      const distance = () => desktop ? innerHeight : innerHeight + el.offsetHeight;
      layers.forEach((layer, i) => gsap.fromTo(layer, { y: () => -distance() * speeds[i] / 2 }, { y: () => distance() * speeds[i] / 2, ease: "none", scrollTrigger: {
        trigger: desktop ? el.closest(".work-stack") : el, start: desktop ? () => `top+=${innerHeight * 5} top` : "top bottom", end: desktop ? () => `+=${innerHeight}` : "bottom top", scrub: .6, invalidateOnRefresh: true,
        onToggle: self => { layer.style.willChange = self.isActive ? "transform" : ""; },
      } }));
      const pointer = (event: PointerEvent) => {
        // Bounds refresh on pointer entry, never inside a frame or scroll callback.
        const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
        const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
        moves.forEach((move, i) => { move.x(x * 6 * (i + 1) / 3); move.y(y * 6 * (i + 1) / 3); });
      };
      const reset = () => moves.forEach(move => { move.x(0); move.y(0); });
      el.addEventListener("pointerenter", measure); el.addEventListener("pointermove", pointer); el.addEventListener("pointerleave", reset);
      return () => { resize.disconnect(); el.removeEventListener("pointerenter", measure); el.removeEventListener("pointermove", pointer); el.removeEventListener("pointerleave", reset); };
    });
    return () => media.revert();
  }, []);
  // Reference B clips 6 and 14: real alpha cutouts in front of oversized display type.
  return <div className="studio-stack" ref={root} aria-hidden="true">
    <div className="studio-plane studio-back"><div><img src="/studio/background.webp" alt="" loading="lazy" /></div></div>
    <span className="studio-title t-display-l">{WORK.find(item => item.slug === "studio")!.name}</span>
    {(["mid", "front"] as const).map(layer => <div className={`studio-plane studio-${layer}`} key={layer}><div><img src={`/studio/${layer}.webp`} alt="" loading="lazy" /></div></div>)}
  </div>;
}
