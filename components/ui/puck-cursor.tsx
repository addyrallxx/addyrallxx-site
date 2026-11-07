"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./puck-cursor.css";

export function PuckCursor() {
  const puck = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = puck.current!;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const xTo = gsap.quickTo(element, "x", { duration: .35, ease: "power3.out" });
    const yTo = gsap.quickTo(element, "y", { duration: .35, ease: "power3.out" });
    gsap.set(element, { xPercent: -50, yPercent: -50, scale: .4, autoAlpha: 0 });
    let active: Element | null = null;
    const hide = () => {
      if (!active) return;
      active = null;
      xTo.tween.pause(); yTo.tween.pause();
      gsap.killTweensOf(element, "scale,opacity,visibility");
      gsap.set(element, { scale: .4, autoAlpha: 0, willChange: "auto" });
    };
    const update = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || document.hidden || event.pointerType === "touch") { hide(); return; }
      const target = event.target instanceof Element ? event.target.closest("[data-cursor]") : null;
      const label = target?.getAttribute("data-cursor");
      if (!target || !label) { hide(); return; }
      if (!active) {
        gsap.set(element, { x: event.clientX, y: event.clientY, willChange: "transform,opacity" });
      }
      if (target !== active) {
        element.textContent = label;
        active = target;
        gsap.to(element, { scale: 1, autoAlpha: 1, duration: .22, ease: "power3.out", overwrite: "auto" });
      }
      xTo(event.clientX); yTo(event.clientY);
    };
    document.addEventListener("pointermove", update, { passive: true });
    document.addEventListener("pointerover", update, { passive: true });
    document.addEventListener("pointerleave", hide);
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true });
    fine.addEventListener("change", hide);
    reduced.addEventListener("change", hide);
    return () => {
      document.removeEventListener("pointermove", update);
      document.removeEventListener("pointerover", update);
      document.removeEventListener("pointerleave", hide);
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide);
      fine.removeEventListener("change", hide);
      reduced.removeEventListener("change", hide);
      xTo.tween.kill(); yTo.tween.kill();
      gsap.killTweensOf(element);
    };
  }, []);
  return <div ref={puck} className="puck-cursor" aria-hidden="true" />;
}
