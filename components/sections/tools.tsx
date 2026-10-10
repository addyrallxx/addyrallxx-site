"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { SKILLS } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";

const items = SKILLS.groups.flatMap(group => group.items);
const jitter = (seed: number) => { const x = Math.sin(seed) * 43758.5453; return x - Math.floor(x); };
// Fibonacci placement and depth mechanics ported from 59f0628's Img Sphere,
// adapted from 21st.dev 9464 (tonyzebastian).
const positions = items.map((_, i) => {
  let phi = Math.acos(1 - 2 * i / items.length) * 180 / Math.PI;
  const pole = Math.pow(Math.abs(phi - 90) / 90, .6) * 35;
  phi = phi < 90 ? Math.max(5, phi - pole) : Math.min(175, phi + pole);
  phi = Math.max(0, Math.min(180, 15 + phi / 180 * 150 + (jitter(i * 78.233 + 2) - .5) * 10)) * Math.PI / 180;
  const theta = (2 * Math.PI / ((1 + Math.sqrt(5)) / 2) * i) + (jitter(i * 12.9898 + 1) - .5) * 20 * Math.PI / 180;
  return { x: 170 * Math.sin(phi) * Math.cos(theta), y: 170 * Math.cos(phi), z: 170 * Math.sin(phi) * Math.sin(theta) };
});
function project(rx: number, ry: number) {
  const xAngle = rx * Math.PI / 180, yAngle = ry * Math.PI / 180;
  const raw = positions.map(p => {
    const x = p.x * Math.cos(yAngle) + p.z * Math.sin(yAngle);
    const z1 = -p.x * Math.sin(yAngle) + p.z * Math.cos(yAngle);
    const y = p.y * Math.cos(xAngle) - z1 * Math.sin(xAngle);
    const z = p.y * Math.sin(xAngle) + z1 * Math.cos(xAngle);
    const scale = Math.max(.3, 1 - Math.min(Math.hypot(x, y) / 170, 1) * .6) * Math.max(.5, .8 + (z + 170) / 340 * .3);
    return { x, y, scale, opacity: z <= -10 ? Math.max(0, (z + 30) / 20) : 1 };
  });
  return raw.map((a, i) => {
    let scale = a.scale;
    if (a.opacity > 0) raw.forEach((b, j) => {
      if (i === j || b.opacity === 0) return;
      const distance = Math.hypot(a.x - b.x, a.y - b.y), minimum = (100.8 * a.scale + 100.8 * b.scale) / 2 + 25;
      if (distance > 0 && distance < minimum) scale = Math.min(scale, scale * Math.max(.4, 1 - (minimum - distance) / minimum * .6));
    });
    return { ...a, scale: Math.max(.25, scale) };
  });
}
const initial = project(15, 15);
const transform = (p: ReturnType<typeof project>[number]) => `translate3d(${p.x.toFixed(2)}px,${p.y.toFixed(2)}px,0) translate(-50%,-50%) scale(${p.scale.toFixed(2)})`;

export function Tools() {
  const sphere = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sphere.current!;
    const tiles = Array.from(el.querySelectorAll<HTMLElement>("[data-sphere-item]"));
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let rx = 15, ry = 15, vx = 0, vy = 0, last = 0, frame = 0, visible = false;
    let drag: { id: number; x: number; y: number } | null = null;
    const paint = () => project(rx, ry).forEach((p, i) => { tiles[i].style.transform = transform(p); tiles[i].style.opacity = String(p.opacity); });
    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 16.67, 3) : 1; last = now;
      if (!drag) {
        const decay = Math.pow(.97, dt); vx *= decay; vy *= decay;
        if (Math.abs(vx) < .01) vx = 0; if (Math.abs(vy) < .01) vy = 0;
        rx = (rx + vx * dt) % 360; ry = (ry + (vy + .12) * dt) % 360;
      }
      paint(); frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = visible && !document.hidden && !motion.matches;
      if (run && !frame) { last = 0; tiles.forEach(tile => { tile.style.willChange = "transform, opacity"; }); frame = requestAnimationFrame(tick); }
      else if (!run) { cancelAnimationFrame(frame); frame = 0; last = 0; drag = null; vx = 0; vy = 0; el.removeAttribute("data-dragging"); tiles.forEach(tile => { tile.style.willChange = ""; }); }
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    observer.observe(el);
    const down = (e: PointerEvent) => {
      if (motion.matches || (e.pointerType === "mouse" && e.button !== 0)) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; vx = 0; vy = 0;
      el.setPointerCapture(e.pointerId); el.dataset.dragging = "true";
    };
    const move = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      vx = Math.max(-5, Math.min(5, -(e.clientY - drag.y) * .45)); vy = Math.max(-5, Math.min(5, (e.clientX - drag.x) * .45));
      rx = (rx + vx) % 360; ry = (ry + vy) % 360; drag.x = e.clientX; drag.y = e.clientY;
    };
    const up = () => { drag = null; el.removeAttribute("data-dragging"); };
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); el.addEventListener("lostpointercapture", up);
    document.addEventListener("visibilitychange", sync); motion.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); el.removeEventListener("lostpointercapture", up);
      document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync);
    };
  }, []);
  return <section className="home-section tools" aria-labelledby="tools-heading"><SectionReveal>
    <h2 className="t-label section-label" id="tools-heading">{SKILLS.label}</h2>
    <div className="tools-grid">
      <div className="sphere-column"><div className="skill-sphere" ref={sphere} data-sphere aria-hidden="true">
        {items.map((item, i) => <div key={item.name} data-sphere-item className="sphere-item" style={{ transform: transform(initial[i]), opacity: initial[i].opacity }}>
          {item.slug ? <><span className="skill-icon" style={{ maskImage: `url(/icons/${item.slug}.svg)` }} /><span className="sphere-label t-small">{item.name}</span></> : <span className="t-small">{item.name}</span>}
        </div>)}
      </div><p className="t-label">{SKILLS.hint}</p></div>
      <div className="skills-list">{SKILLS.groups.map(group => <div key={group.title} className="section-body"><h3 className="t-label">{group.title}</h3><ul>{group.items.map(item => <li className="t-small" key={item.name}>{item.name}</li>)}</ul></div>)}</div>
    </div>
  </SectionReveal></section>;
}
