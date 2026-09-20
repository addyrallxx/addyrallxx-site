"use client";

import { useEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/lib/content";

export function SiteHeader() {
  const header = useRef<HTMLElement>(null);
  const [warm, setWarm] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"));
    const about = document.getElementById("about");
    const destinations = new Set<string>(NAV.map((item) => item.href));
    let navigation: IntersectionObserver;
    let tone: IntersectionObserver;
    const configure = () => {
      navigation?.disconnect();
      tone?.disconnect();
      const height = window.innerHeight;
      const bandTop = Math.round(height * 0.2);
      const visible = new Map<Element, number>();
      navigation = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target, entry.boundingClientRect.top);
          else visible.delete(entry.target);
        }
        const current = [...visible].sort((a, b) => b[1] - a[1])[0]?.[0];
        const href = current ? `#${current.id}` : null;
        setActive(href && destinations.has(href) ? href : null);
      }, {
        // Pixel margins matter: percentage IO margins use viewport WIDTH.
        rootMargin: `-${bandTop}px 0px -${height - bandTop - 1}px 0px`, threshold: 0,
      });
      sections.forEach((section) => navigation.observe(section));
      const headerHeight = Math.ceil(header.current?.getBoundingClientRect().height ?? 64);
      tone = new IntersectionObserver(([entry]) => setWarm(entry.isIntersecting), {
        rootMargin: `0px 0px -${Math.max(0, height - headerHeight)}px 0px`, threshold: 0,
      });
      if (about) tone.observe(about);
    };
    configure();
    window.addEventListener("resize", configure);
    const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(configure) : null;
    if (header.current) resize?.observe(header.current);
    return () => {
      navigation.disconnect();
      tone.disconnect();
      resize?.disconnect();
      window.removeEventListener("resize", configure);
    };
  }, []);

  return (
    <header ref={header} className="fixed inset-x-0 top-0 z-40">
      <div data-tone={warm ? "warm" : undefined} className="tone-surface bg-canvas/80 shadow-[0_8px_24px_-16px_var(--canvas-dark)] backdrop-blur">
        <nav aria-label="Primary" className="mx-auto flex max-w-[var(--content-max)] items-center justify-between gap-[var(--space-3)] px-[var(--gutter)] py-[var(--space-4)]">
          <a href="#main" className="shrink-0 font-display text-[length:var(--step-0)] font-semibold tracking-[-0.02em]">{SITE.name}</a>
          <ul className="hidden min-w-0 items-center gap-[var(--space-1)] overflow-x-auto md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} aria-current={active === item.href ? "location" : undefined} className="press label flex min-h-11 items-center whitespace-nowrap rounded-[var(--radius-pill)] px-[var(--space-3)] py-[var(--space-2)] text-ink-subtle hover:bg-surface-1 hover:text-ink aria-[current=location]:bg-surface-2 aria-[current=location]:text-ink">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={`mailto:${SITE.email}`} className="press label inline-flex min-h-11 shrink-0 items-center rounded-[var(--radius-pill)] border border-hairline-strong px-[var(--space-4)] py-[var(--space-2)] hover:border-accent hover:text-ink">Email</a>
        </nav>
      </div>
    </header>
  );
}
