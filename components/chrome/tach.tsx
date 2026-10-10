"use client";

import { useEffect, useRef } from "react";
import { CHROME } from "@/lib/content";
import "@/lib/scroll";

const angle = (rpm: number) => -120 + rpm * .03;
const point = (a: number, r: number) => [100 + Math.sin(a * Math.PI / 180) * r, 100 - Math.cos(a * Math.PI / 180) * r];

export function Tach() {
  const needle = useRef<SVGGElement>(null);
  useEffect(() => {
    const el = needle.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, last = 0, rpm = 800, speed = 0, held = 0, sweepAt = 0, swept = false;
    const paint = () => { el.style.transform = `rotate(${angle(rpm)}deg)`; };
    const tick = (now: number) => {
      frame = 0;
      const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60;
      last = now;
      const demand = 800 + Math.min(Math.abs(window.__lenis?.velocity ?? 0) * 160, 7400);
      held = demand >= 7000 ? held + dt * 1000 : 0;
      const target = demand - (held > 120 && (held - 120) % 210 < 90 ? 350 : 0);
      if (sweepAt) {
        const t = Math.min((now - sweepAt) / 900, 1);
        rpm = 800 + 7200 * Math.sin(Math.PI * t) ** 2;
        speed = 0;
        if (t === 1) sweepAt = 0;
      } else {
        // Exact underdamped solution for stiffness 180 and damping 22.
        const offset = rpm - target, w = Math.sqrt(59), decay = Math.exp(-11 * dt);
        const c = Math.cos(w * dt), s = Math.sin(w * dt), b = (speed + 11 * offset) / w;
        rpm = target + decay * (offset * c + b * s);
        speed = decay * (speed * c - (11 * b + w * offset) * s);
      }
      paint();
      if (sweepAt || demand > 805 || Math.abs(rpm - target) > 5 || Math.abs(speed) > 5) frame = requestAnimationFrame(tick);
      else { rpm = 800; speed = 0; last = 0; paint(); el.style.willChange = ""; }
    };
    const wake = () => {
      if (!frame && !motion.matches && !document.hidden) { last = 0; el.style.willChange = "transform"; frame = requestAnimationFrame(tick); }
    };
    const intro = () => { if (!swept) { swept = true; if (!motion.matches) { sweepAt = performance.now(); wake(); } } };
    const sync = () => {
      if (motion.matches || document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; sweepAt = 0; rpm = 800; speed = 0; held = 0; paint(); el.style.willChange = ""; }
      else wake();
    };
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("intro:done", intro);
    document.addEventListener("visibilitychange", sync); motion.addEventListener("change", sync);
    if (document.documentElement.dataset.intro === "done") intro();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", wake); window.removeEventListener("intro:done", intro); document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync); };
  }, []);
  const redStart = point(90, 86), redEnd = point(120, 86);
  return <svg className="tach" viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <linearGradient id="tach-bezel" x2="1" y2="1"><stop stopColor="#A7A9AD" /><stop offset="1" stopColor="#2B2C2F" /></linearGradient>
      <radialGradient id="tach-face"><stop stopColor="#0B0B0C" /><stop offset="1" stopColor="#000" /></radialGradient>
    </defs>
    <circle cx="100" cy="100" r="96" fill="url(#tach-face)" stroke="url(#tach-bezel)" strokeWidth="3" />
    <circle cx="100" cy="100" r="94" fill="none" stroke="#000" />
    <path d={`M${redStart.join(" ")} A86 86 0 0 1 ${redEnd.join(" ")}`} fill="none" stroke="#D9231E" strokeWidth="5" />
    {Array.from({ length: 17 }, (_, i) => {
      const a = -120 + i * 15, outer = point(a, 86), inner = point(a, 86 - (i % 2 ? 4.5 : 8.1));
      return <line key={i} className={i >= 14 ? "tach-red" : "tach-ink"} x1={inner[0]} y1={inner[1]} x2={outer[0]} y2={outer[1]} strokeWidth={i % 2 ? 1.2 : 2.2} />;
    })}
    {Array.from({ length: 8 }, (_, i) => { const p = point(-90 + i * 30, 66); return <text key={i} className={i >= 6 ? "tach-number tach-red" : "tach-number tach-ink"} x={p[0]} y={p[1]} textAnchor="middle" dominantBaseline="central">{i + 1}</text>; })}
    <text className="tach-legend tach-ink" x="100" y="57" textAnchor="middle" opacity=".55">{CHROME.tach}</text>
    <g transform="translate(91 121) skewX(-20)"><path d="M0 0h6v16H0z" fill="var(--m-light)" /><path d="M9 0h6v16H9z" fill="var(--m-dark)" /><path d="M18 0h6v16H18z" fill="var(--m-red)" /></g>
    <g className="tach-needle" ref={needle} style={{ transform: `rotate(${angle(800)}deg)` }}>
      <path d="M97.5 100L99.2 28h1.6l1.7 72z" fill="#FF4A12" /><path d="M97.5 100h5l-1 19.8h-3z" fill="#B8350C" />
    </g>
    <circle cx="100" cy="100" r="16.2" fill="#121212" stroke="#3A3A3A" />
    <path d="M89 89a15.5 15.5 0 0 1 22 0" fill="none" stroke="#2F2F2F" />
  </svg>;
}
