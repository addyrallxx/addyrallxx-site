"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Noto_Sans_Bengali } from "next/font/google";
import { gsap } from "gsap";
import { createGlyphBodies, stepGlyphBodies, GLYPH_STEP, type GlyphBody } from "@/lib/glyph-physics";
import "./glyph-pit.css";

const bangla = Noto_Sans_Bengali({ weight: "700", subsets: ["bengali"], display: "swap" });
const glyphs = ["অ", "✦", "&", "{ }", "৳", "A", "S", "→", "★", "$"];
const sizes = [120, 84, 150, 96, 110, 136, 124, 86, 64, 104];
const night = ["#FF4A12", "#FFC233", "#2EC4B6", "#7C5CFF", "#FF5D8F", "#2EA8FF", "#9BE564", "#1C69D4", "#FF8C2E", "#E8E6E3"];
// Preserve each hue and saturation, with day lightness at 90%.
const day = ["#FFD8CC", "#FFF0CC", "#D6F5F2", "#D6CCFF", "#FFCCDC", "#CCEAFF", "#E3F8D3", "#D2E2F9", "#FFE3CC", "#E8E6E3"];

export function GlyphPit() {
  const pit = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pit.current!;
    const nodes = Array.from(el.children) as HTMLElement[];
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let bodies: GlyphBody[] = [], width = 0, height = 0, elapsed = 0, accumulator = 0, last = 0;
    let started = false, running = false, disposed = false;
    const previous = new Array<string>(nodes.length).fill("");
    const paint = () => bodies.forEach((b, i) => {
      const value = `translate3d(${(b.x - b.width / 2).toFixed(2)}px,${(b.y - b.height / 2).toFixed(2)}px,0) rotate(${b.angle.toFixed(2)}deg)`;
      if (value !== previous[i]) { nodes[i].style.transform = value; previous[i] = value; }
      const state = String(b.asleep);
      if (nodes[i].dataset.asleep !== state) nodes[i].dataset.asleep = state;
    });
    const stop = () => { gsap.ticker.remove(tick); running = false; el.dataset.running = "false"; nodes.forEach(node => { node.style.willChange = ""; }); };
    const tick = () => {
      if (document.hidden) { last = 0; return; }
      const now = performance.now();
      accumulator += last ? Math.min((now - last) / 1000, .05) : 0; last = now;
      let asleep = false;
      while (accumulator >= GLYPH_STEP) {
        elapsed += GLYPH_STEP; accumulator -= GLYPH_STEP;
        asleep = stepGlyphBodies(bodies, width, height, elapsed);
      }
      paint();
      if (asleep) stop();
    };
    const finish = () => {
      stop();
      for (let i = 0; i < 480 && !bodies.every(b => b.asleep); i++) { elapsed += GLYPH_STEP; stepGlyphBodies(bodies, width, height, elapsed); }
      paint();
    };
    const run = () => {
      if (!started || !bodies.length) return;
      if (motion.matches) { finish(); return; }
      if (!running && !bodies.every(b => b.asleep)) {
        last = 0; running = true; el.dataset.running = "true";
        nodes.forEach(node => { node.style.willChange = "transform"; }); gsap.ticker.add(tick);
      }
    };
    const visibility = () => { last = 0; };
    const measure = () => {
      const nextWidth = el.clientWidth, nextHeight = el.clientHeight;
      if (nextWidth <= 0 || nextHeight <= 0) return;
      if (width === nextWidth && height === nextHeight && bodies.length) return;
      stop(); width = nextWidth; height = nextHeight;
      nodes.forEach((node, i) => { node.style.transform = "none"; previous[i] = ""; });
      const boxes = nodes.map(node => { const r = node.getBoundingClientRect(); return { width: r.width, height: r.height }; });
      bodies = createGlyphBodies(boxes, width); elapsed = accumulator = 0;
      el.dataset.physics = "true"; paint();
      if (started || motion.matches) { started = true; finish(); }
    };
    const resize = new ResizeObserver(measure);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.intersectionRatio >= .3) && !started) { started = true; run(); observer.disconnect(); }
    }, { threshold: .3 });
    void document.fonts.ready.then(() => {
      if (disposed) return;
      measure(); resize.observe(el); observer.observe(el);
    });
    motion.addEventListener("change", run); document.addEventListener("visibilitychange", visibility);
    return () => { disposed = true; stop(); resize.disconnect(); observer.disconnect(); motion.removeEventListener("change", run); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <div className="glyph-pit" ref={pit} aria-hidden="true">{glyphs.map((glyph, i) => <span key={glyph} className={`falling-glyph ${i === 0 || i === 4 ? bangla.className : ""}`} style={{ "--glyph-night": night[i], "--glyph-day": day[i], "--glyph-ink": i === 7 ? "#F5F3EE" : "#0A0A0A", fontSize: `calc(${sizes[i]} * .9 / 1440 * (100vw - 2 * var(--gutter)))` } as CSSProperties}>{glyph}</span>)}</div>;
}
