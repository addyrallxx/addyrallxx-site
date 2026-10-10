"use client";

import { useEffect, useRef } from "react";
import { Noto_Sans_Bengali } from "next/font/google";

const bangla = Noto_Sans_Bengali({ weight: "700", subsets: ["bengali"], display: "swap" });
const glyphs = ["অ", "✦", "&", "{ }", "৳", "A", "S", "→", "★"];
const sizes = [140, 96, 180, 112, 130, 160, 144, 100, 72];
const palette = ["#2340FF", "#F2A93B", "#0F7A4A", "#E8687A", "#7FB2E5", "var(--ink)"];

export function GlyphPit() {
  const pit = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pit.current!;
    el.dataset.physics = "true";
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const bodies = Array.from(el.children).map((node, i) => ({ el: node as HTMLElement, x: 0, y: 0, r: 0, vx: (i % 3 - 1) * .7, vy: 0, a: (i % 3 - 1) * 16, spin: (i % 2 ? 1 : -1), dx: 0, dy: 0 }));
    let width = 0, height = 360, frame = 0, last = 0, quiet = 0, settleAt = 0, started = false, visible = false, drag = -1, pointer = -1, px = 0, py = 0;
    const paint = () => bodies.forEach(b => { b.el.style.transform = `translate3d(${b.x - b.r}px,${b.y - b.r}px,0) rotate(${b.a}deg)`; });
    const rest = () => {
      const gap = (width - bodies.reduce((sum, b) => sum + b.r * 2, 0)) / (bodies.length + 1);
      let x = gap;
      bodies.forEach(b => { b.x = x + b.r; x += b.r * 2 + gap; b.y = height - b.r; b.vx = b.vy = b.spin = 0; }); paint();
    };
    const step = (now: number) => {
      frame = 0;
      const dt = last ? Math.min(2, (now - last) / 16.67) : 1; last = now;
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        if (i === drag) continue;
        b.vy += .45 * dt; b.vx *= Math.pow(.99, dt); b.spin *= Math.pow(.96, dt);
        b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.spin * dt;
        if (b.x < b.r || b.x > width - b.r) { b.x = Math.max(b.r, Math.min(width - b.r, b.x)); b.vx *= -.55; }
        if (b.y >= height - b.r) { b.y = height - b.r; b.vy = Math.abs(b.vy) < 1.4 ? 0 : -b.vy * .55; b.vx *= .85; b.spin *= .8; }
      }
      for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j], dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy), overlap = a.r + b.r - distance;
        if (overlap <= 0 || distance < .001) continue;
        const nx = dx / distance, ny = dy / distance;
        if (i !== drag) { a.x -= nx * overlap / 2; a.y -= ny * overlap / 2; }
        if (j !== drag) { b.x += nx * overlap / 2; b.y += ny * overlap / 2; }
        const velocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (velocity < 0) {
          const impulse = velocity * .775;
          if (i !== drag) { a.vx += impulse * nx; a.vy += impulse * ny; }
          if (j !== drag) { b.vx -= impulse * nx; b.vy -= impulse * ny; }
        }
      }
      // ponytail: footer physics settles into a row after 1.5s, not a persistent simulation.
      if (drag < 0 && now >= settleAt) rest();
      else paint();
      quiet = drag < 0 && bodies.every(b => Math.hypot(b.vx, b.vy, b.spin) < .05) ? quiet + 1 : 0;
      if (quiet < 30 && visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(step);
      else { el.dataset.running = "false"; bodies.forEach(b => { b.el.style.willChange = ""; }); }
    };
    const run = () => {
      if (motion.matches) { cancelAnimationFrame(frame); frame = 0; rest(); el.dataset.running = "false"; return; }
      if (started && visible && !document.hidden && !frame) { last = 0; quiet = 0; el.dataset.running = "true"; bodies.forEach(b => { b.el.style.willChange = "transform"; }); frame = requestAnimationFrame(step); }
      if (!visible || document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; }
    };
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width; height = entry.contentRect.height;
      bodies.forEach((b, i) => { const size = sizes[i] * width / 1440; b.el.style.fontSize = `${size}px`; b.el.style.width = b.el.style.height = `${size}px`; b.r = size / 2; b.x = width * (i + .5) / bodies.length; b.y = started ? height - b.r : b.r; });
      paint(); run();
    });
    resize.observe(el);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && !started) { started = true; settleAt = performance.now() + 1500; } run(); }, { threshold: .3 });
    observer.observe(el);
    const down = (e: PointerEvent) => {
      if (motion.matches) return;
      const index = bodies.findIndex(b => b.el === (e.target as Element).closest(".falling-glyph"));
      if (index < 0) return;
      drag = index; pointer = e.pointerId; px = e.clientX; py = e.clientY;
      bodies[index].vx = bodies[index].vy = bodies[index].dx = bodies[index].dy = 0;
      el.setPointerCapture(pointer); run();
    };
    const move = (e: PointerEvent) => {
      if (drag < 0 || e.pointerId !== pointer) return;
      const b = bodies[drag]; b.dx = e.clientX - px; b.dy = e.clientY - py; px = e.clientX; py = e.clientY;
      b.x = Math.max(b.r, Math.min(width - b.r, b.x + b.dx)); b.y = Math.max(b.r, Math.min(height - b.r, b.y + b.dy)); paint();
    };
    const release = () => { if (drag < 0) return; const b = bodies[drag]; b.vx = b.dx * .3; b.vy = b.dy * .3; b.spin = (b.vx - b.vy) * .5; drag = -1; settleAt = performance.now() + 1500; run(); };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerup", release); el.addEventListener("pointercancel", release); el.addEventListener("lostpointercapture", release);
    motion.addEventListener("change", run); document.addEventListener("visibilitychange", run);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect(); motion.removeEventListener("change", run); document.removeEventListener("visibilitychange", run); el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", release); el.removeEventListener("pointercancel", release); el.removeEventListener("lostpointercapture", release); };
  }, []);
  return <div className="glyph-pit" ref={pit} aria-hidden="true">{glyphs.map((glyph, i) => <span key={glyph} className={`falling-glyph ${i === 0 || i === 4 ? bangla.className : ""}`} style={{ color: palette[i % palette.length], fontSize: `calc(${sizes[i]} / 1440 * (100vw - 2 * var(--gutter)))` }}>{glyph}</span>)}</div>;
}
