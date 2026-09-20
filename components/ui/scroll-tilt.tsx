"use client";

import { useEffect, useRef, type CSSProperties, type JSX, type ReactNode } from "react";

export type ScrollTiltProps = {
  children: ReactNode;
  /** How strongly the element reacts. 0 disables. Default 1. */
  intensity?: number;
  /** Pointer-driven 3D tilt on hover. Default true. */
  tilt?: boolean;
  /** Scale down on pointer press. Default true. */
  press?: boolean;
  /** Vertical parallax offset in px as it crosses the viewport. Default 0 (off). */
  parallax?: number;
  className?: string;
};

export function ScrollTilt({
  children, intensity = 1, tilt = true, press = true, parallax = 0, className = "",
}: ScrollTiltProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const strength = Number.isFinite(intensity) ? Math.max(0, intensity) : 0;
  const distance = Number.isFinite(parallax) ? parallax * strength : 0;

  useEffect(() => {
    const root = ref.current;
    const track = root?.firstElementChild as HTMLDivElement | null;
    const surface = track?.firstElementChild as HTMLDivElement | null;
    if (!root || !track || !surface || strength === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const nativeTimeline = typeof CSS !== "undefined" && CSS.supports("animation-timeline", "view()");
    let frame: number | null = null;
    let previousTime = 0;
    let enabled = false;
    let observer: IntersectionObserver | undefined;
    const positioned = new Set<Element>();
    const current = { x: 0, y: 0, z: 0, scale: 1 };
    const target = { ...current };

    function reset() {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      previousTime = 0;
      Object.assign(current, { x: 0, y: 0, z: 0, scale: 1 });
      Object.assign(target, current);
      surface!.style.removeProperty("transform");
      root!.removeAttribute("data-interacting");
    }

    function tick(time: number) {
      const alpha = 1 - Math.exp(-Math.min(previousTime ? time - previousTime : 16.67, 64) / 65);
      previousTime = time;
      let moving = false;
      for (const key of ["x", "y", "z", "scale"] as const) {
        current[key] += (target[key] - current[key]) * alpha;
        if (Math.abs(target[key] - current[key]) < 0.0001) current[key] = target[key];
        else moving = true;
      }
      surface!.style.transform = `translateZ(${current.z}px) rotateX(${current.x}deg) rotateY(${current.y}deg) scale(${current.scale})`;
      frame = moving ? requestAnimationFrame(tick) : null;
      if (!moving) {
        previousTime = 0;
        if (!current.x && !current.y && !current.z && current.scale === 1) reset();
      }
    }

    function animate() {
      if (!enabled) return;
      root!.setAttribute("data-interacting", "");
      if (frame === null) frame = requestAnimationFrame(tick);
    }

    function leave() {
      Object.assign(target, { x: 0, y: 0, z: 0, scale: 1 });
      animate();
    }

    function release() {
      if (target.scale === 1) return;
      target.scale = 1;
      animate();
    }

    function move(event: PointerEvent) {
      if (!enabled || !tilt || !fine.matches || event.pointerType === "touch") return;
      const bounds = root!.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
      target.x = -y * 6 * strength;
      target.y = x * 6 * strength;
      target.z = 8 * strength;
      animate();
    }

    function down(event: PointerEvent) {
      if (!enabled || !press || !event.isPrimary || event.button !== 0) return;
      target.scale = 1 - Math.min(0.06, 0.015 * strength);
      animate();
    }

    function configure() {
      reset();
      observer?.disconnect();
      // Perspective/transforms establish containing blocks. If a child needs
      // sticky/fixed positioning, all three wrappers become display:contents.
      // This also avoids a short wrapper constraining a sticky child's range.
      positioned.clear();
      for (const node of [root!, ...surface!.querySelectorAll<HTMLElement>("*")]) {
        const position = getComputedStyle(node).position;
        if (position === "sticky" || position === "fixed") positioned.add(node);
      }
      const sticky = positioned.size > 0;
      root!.toggleAttribute("data-sticky-content", sticky);
      enabled = !reduced.matches && !sticky;
      root!.toggleAttribute("data-motion-enabled", enabled);
      root!.removeAttribute("data-parallax-fallback");
      track!.style.removeProperty("transform");
      if (!enabled || !distance || nativeTimeline || typeof IntersectionObserver === "undefined") return;

      root!.setAttribute("data-parallax-fallback", "");
      // Discrete progress steps are eased with CSS in browsers without view().
      // Visible content stays visible even if observer delivery is delayed.
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const viewport = entry.rootBounds?.height ?? window.innerHeight;
          const progress = Math.max(0, Math.min(1, (viewport - entry.boundingClientRect.top) / (viewport + entry.boundingClientRect.height)));
          track!.style.transform = `translateY(${distance * (1 - 2 * progress)}px)`;
        }
      }, { threshold: Array.from({ length: 21 }, (_, index) => index / 20) });
      observer.observe(root!);
    }

    configure();
    // Recheck positioning when content or responsive classes change. Ignore
    // our own style writes (including nested instances) to avoid feedback.
    const mutations = new MutationObserver((records) => {
      if (records.some((record) => {
        if (record.type === "childList" || record.attributeName === "class") return true;
        const node = record.target;
        if (!(node instanceof Element) || node.matches(".scroll-tilt__track, .scroll-tilt__surface")) return false;
        if (positioned.has(node)) return true;
        const position = (node as HTMLElement).style.position;
        return position === "sticky" || position === "fixed";
      })) configure();
    });
    mutations.observe(surface, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style"] });
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointercancel", leave);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", leave);
    window.addEventListener("blur", leave);
    window.addEventListener("resize", configure);
    reduced.addEventListener("change", configure);
    fine.addEventListener("change", configure);
    return () => {
      reset();
      observer?.disconnect();
      mutations.disconnect();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointercancel", leave);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", leave);
      window.removeEventListener("blur", leave);
      window.removeEventListener("resize", configure);
      reduced.removeEventListener("change", configure);
      fine.removeEventListener("change", configure);
      root.removeAttribute("data-motion-enabled");
      root.removeAttribute("data-sticky-content");
      root.removeAttribute("data-parallax-fallback");
      track.style.removeProperty("transform");
    };
  }, [strength, tilt, press, distance]);

  return (
    <div ref={ref} className={`scroll-tilt ${className}`} data-parallax={distance !== 0 ? "" : undefined} style={{ "--scroll-tilt-distance": `${distance}px` } as CSSProperties}>
      <div className="scroll-tilt__track">
        <div className="scroll-tilt__surface">{children}</div>
      </div>
    </div>
  );
}
