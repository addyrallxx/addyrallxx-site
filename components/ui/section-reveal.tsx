"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function SectionReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    const targets = el.querySelectorAll(".section-line, .section-body, .index-row, .e92-stripe");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -20% 0px" });
    targets.forEach(target => { target.classList.add("section-armed"); observer.observe(target); });
    const finish = () => { if (motion.matches) { targets.forEach(target => target.classList.add("is-visible")); observer.disconnect(); } };
    motion.addEventListener("change", finish);
    return () => { observer.disconnect(); motion.removeEventListener("change", finish); targets.forEach(target => target.classList.remove("section-armed")); };
  }, []);
  return <div ref={ref}>{children}</div>;
}
