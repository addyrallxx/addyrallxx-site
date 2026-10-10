"use client";

import { useEffect, useRef } from "react";
import { SKILLS } from "@/lib/content";
import { SectionReveal } from "@/components/ui/section-reveal";

const items = SKILLS.groups.flatMap((group, groupIndex) => group.items.map(item => ({ ...item, group: groupIndex })));
const positions = new Float64Array(items.length * 3);
const centroids = new Float64Array(SKILLS.groups.length * 3);
for (let i = 0; i < items.length; i++) {
  const y = 1 - 2 * (i + .5) / items.length, r = Math.sqrt(1 - y * y), theta = i * Math.PI * (3 - Math.sqrt(5));
  positions[i * 3] = r * Math.cos(theta); positions[i * 3 + 1] = y; positions[i * 3 + 2] = r * Math.sin(theta);
  for (let j = 0; j < 3; j++) centroids[items[i].group * 3 + j] += positions[i * 3 + j];
}
const tilt = 18 * Math.PI / 180;
// Lookup the specified cubic-bezier(.16,1,.3,1) once, outside animation frames.
const ease = new Float64Array(701);
for (let i = 0; i <= 700; i++) {
  let low = 0, high = 1;
  for (let j = 0; j < 18; j++) { const t = (low + high) / 2, x = 3 * (1 - t) ** 2 * t * .16 + 3 * (1 - t) * t * t * .3 + t ** 3; if (x < i / 700) low = t; else high = t; }
  ease[i] = 1 - (1 - (low + high) / 2) ** 3;
}
function projection(i: number, rx: number, ry: number) {
  const x = positions[i * 3], y = positions[i * 3 + 1] * Math.cos(rx) - positions[i * 3 + 2] * Math.sin(rx);
  const z = positions[i * 3 + 1] * Math.sin(rx) + positions[i * 3 + 2] * Math.cos(rx);
  return { x: x * Math.cos(ry) + z * Math.sin(ry), y, z: -x * Math.sin(ry) + z * Math.cos(ry) };
}

export function Tools() {
  const sphere = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sphere.current!, controls = list.current!;
    const tiles = Array.from(el.querySelectorAll<HTMLElement>("[data-sphere-item]"));
    const buttons = Array.from(controls.querySelectorAll<HTMLButtonElement>("button"));
    const buckets = new Int8Array(items.length).fill(-1);
    const motion = matchMedia("(prefers-reduced-motion: reduce)"), phone = matchMedia("(max-width: 700px)");
    let rx = tilt, ry = 25 * Math.PI / 180, vx = 0, vy = 0, xSpeed = 0, last = 0, frame = 0, visible = false;
    let pinned = -1, preview = -1, selected = -1, hovered = false, spin = 1, turnAt = -1, fromX = rx, fromY = ry, toX = rx, toY = ry;
    let dragId = -1, dragX = 0, dragY = 0;
    const paint = () => {
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), radius = phone.matches ? 130 : 180;
      for (let i = 0; i < tiles.length; i++) {
        const x0 = positions[i * 3], y0 = positions[i * 3 + 1], z0 = positions[i * 3 + 2];
        const y = y0 * cx - z0 * sx, z1 = y0 * sx + z0 * cx, x = x0 * cy + z1 * sy, z = -x0 * sy + z1 * cy;
        const depth = (z + 1) / 2, scale = .62 + .38 * depth;
        let opacity = .16 + .84 * depth;
        if (selected >= 0) opacity = items[i].group === selected ? Math.max(.5, opacity) : Math.min(.3, opacity);
        tiles[i].style.transform = `translate3d(${x * radius}px,${y * radius}px,0) translate(-50%,-50%) scale(${scale})`;
        tiles[i].style.opacity = String(opacity);
        const bucket = Math.min(7, Math.floor(depth * 8));
        if (bucket !== buckets[i]) { buckets[i] = bucket; tiles[i].style.zIndex = String(bucket + 1); }
      }
    };
    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60; last = now;
      spin += ((hovered || selected >= 0 ? 0 : 1) - spin) * (1 - Math.exp(-dt * 10));
      if (turnAt >= 0) {
        const elapsed = Math.min(700, Math.round(now - turnAt)), t = ease[elapsed];
        rx = fromX + (toX - fromX) * t; ry = fromY + (toY - fromY) * t;
        if (elapsed === 700) turnAt = -1;
      } else if (dragId < 0) {
        const decay = Math.pow(.94, dt / .0167); vx *= decay; vy *= decay;
        ry += vy * dt + spin * Math.PI / 30 * dt;
        // Exact critically damped return to the authored tilt in about 600ms.
        const offset = rx - (selected >= 0 ? toX : tilt), c = xSpeed + 12 * offset, d = Math.exp(-12 * dt);
        rx = (selected >= 0 ? toX : tilt) + (offset + c * dt) * d; xSpeed = (xSpeed - 12 * c * dt) * d;
        rx += vx * dt;
      }
      if (dragId >= 0) { vx *= Math.exp(-dt * 40); vy *= Math.exp(-dt * 40); }
      paint(); frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = visible && !document.hidden && !motion.matches;
      if (motion.matches) { rx = tilt; ry = 25 * Math.PI / 180; turnAt = -1; paint(); }
      if (run && !frame) { last = 0; tiles.forEach(tile => { tile.style.willChange = "transform, opacity"; }); frame = requestAnimationFrame(tick); }
      else if (!run) { cancelAnimationFrame(frame); frame = 0; last = 0; dragId = -1; vx = 0; vy = 0; el.removeAttribute("data-dragging"); tiles.forEach(tile => { tile.style.willChange = ""; }); }
    };
    const select = () => {
      const next = preview >= 0 ? preview : pinned;
      buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === next)));
      if (next === selected) return;
      selected = next;
      tiles.forEach((tile, i) => { tile.dataset.selected = String(items[i].group === selected); });
      if (selected >= 0 && !motion.matches) {
        const c = selected * 3, x = centroids[c], y = centroids[c + 1], z = centroids[c + 2];
        toX = Math.atan2(y, z); toY = -Math.atan2(x, Math.hypot(y, z));
        toY = ry + Math.atan2(Math.sin(toY - ry), Math.cos(toY - ry));
        fromX = rx; fromY = ry; turnAt = performance.now(); vx = 0; vy = 0; xSpeed = 0;
      } else if (selected < 0) turnAt = -1;
      paint();
    };
    const previewGroup = (event: Event) => { const button = (event.target as Element).closest("button"); preview = buttons.indexOf(button as HTMLButtonElement); select(); };
    const leaveGroup = () => { preview = -1; select(); };
    const press = (event: Event) => { const i = buttons.indexOf((event.target as Element).closest("button") as HTMLButtonElement); if (i < 0) return; pinned = pinned === i ? -1 : i; preview = -1; select(); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { pinned = -1; preview = -1; select(); } };
    const over = (event: PointerEvent) => { hovered = !!(event.target as Element).closest("[data-sphere-item]"); };
    const leave = () => { hovered = false; };
    const down = (event: PointerEvent) => {
      if (motion.matches || (event.pointerType === "mouse" && event.button !== 0)) return;
      dragId = event.pointerId; dragX = event.clientX; dragY = event.clientY; vx = 0; vy = 0; turnAt = -1;
      el.setPointerCapture(dragId); el.dataset.dragging = "true";
    };
    const move = (event: PointerEvent) => {
      if (dragId !== event.pointerId) return;
      const dx = (event.clientX - dragX) * .008, dy = -(event.clientY - dragY) * .008;
      rx += dy; ry += dx; vx = dy * 60; vy = dx * 60; dragX = event.clientX; dragY = event.clientY;
    };
    const up = () => { dragId = -1; el.removeAttribute("data-dragging"); };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }); observer.observe(el);
    paint();
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerover", over); el.addEventListener("pointerout", over); el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); el.addEventListener("lostpointercapture", up);
    controls.addEventListener("pointerover", previewGroup); controls.addEventListener("pointerleave", leaveGroup); controls.addEventListener("focusin", previewGroup); controls.addEventListener("focusout", leaveGroup); controls.addEventListener("click", press);
    window.addEventListener("keydown", escape); document.addEventListener("visibilitychange", sync); motion.addEventListener("change", sync); phone.addEventListener("change", paint);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerover", over); el.removeEventListener("pointerout", over); el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); el.removeEventListener("lostpointercapture", up);
      controls.removeEventListener("pointerover", previewGroup); controls.removeEventListener("pointerleave", leaveGroup); controls.removeEventListener("focusin", previewGroup); controls.removeEventListener("focusout", leaveGroup); controls.removeEventListener("click", press);
      window.removeEventListener("keydown", escape); document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync); phone.removeEventListener("change", paint);
    };
  }, []);
  return <section className="home-section tools" aria-labelledby="tools-heading"><SectionReveal>
    <h2 className="t-label section-label" id="tools-heading">{SKILLS.label}</h2>
    <div className="tools-grid">
      <div className="sphere-column"><div className="skill-sphere" ref={sphere} data-sphere aria-hidden="true">
        <svg className="globe-grid" viewBox="0 0 440 440" fill="none" stroke="var(--line)"><circle cx="220" cy="220" r="180" vectorEffect="non-scaling-stroke" /><ellipse cx="220" cy="220" rx="180" ry="50.4" vectorEffect="non-scaling-stroke" /><ellipse cx="220" cy="220" rx="50.4" ry="180" vectorEffect="non-scaling-stroke" /></svg>
        {items.map((item, i) => { const p = projection(i, tilt, 25 * Math.PI / 180), depth = (p.z + 1) / 2; return <div key={item.name} data-sphere-item data-group={item.group} className="sphere-item" style={{ transform: `translate3d(calc(${p.x} * var(--globe-radius)),calc(${p.y} * var(--globe-radius)),0) translate(-50%,-50%) scale(${.62 + .38 * depth})`, opacity: .16 + .84 * depth }}>
          {item.slug && <span className="skill-icon" style={{ maskImage: `url(/icons/${item.slug}.svg)` }} />}<span className="sphere-label t-small">{item.name}</span>
        </div>; })}
      </div><p className="t-label">{SKILLS.hint}</p></div>
      <div className="skills-list" ref={list}>{SKILLS.groups.map(group => <div key={group.title} className="section-body"><h3><button type="button" className="t-label" aria-pressed="false">{group.title}</button></h3><ul>{group.items.map(item => <li className="t-small" key={item.name}>{item.name}</li>)}</ul></div>)}</div>
    </div>
  </SectionReveal></section>;
}
