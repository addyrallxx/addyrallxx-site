"use client";

import { useEffect, useRef } from "react";

export function GradientMesh({ place }: { place: "services" | "contact" | "school" }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    const observer = new IntersectionObserver(entries => { el.dataset.visible = String(entries.some(e => e.isIntersecting)); });
    observer.observe(el.parentElement!);
    const visibility = () => { el.dataset.paused = String(document.hidden); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <div ref={root} className={`gradient-mesh mesh-${place}`} aria-hidden="true"><div className="mesh-field" /></div>;
}
