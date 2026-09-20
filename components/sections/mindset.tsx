"use client";

import { useEffect, useRef } from "react";
import Reveal from "@/components/reveal";
import { ScrollTilt } from "@/components/ui/scroll-tilt";
import { MINDSET } from "@/lib/content";

export function Mindset() {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const Timeline = (window as unknown as {
      ViewTimeline?: new (options: { subject: Element; axis: string }) => AnimationTimeline;
    }).ViewTimeline;
    let animations: Animation[] = [];
    let observer: IntersectionObserver | undefined;
    const reset = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      observer?.disconnect();
      observer = undefined;
    };
    const configure = () => {
      reset();
      if (preference.matches) return;
      const frames = [
        { clipPath: "inset(12% 5% round 48px)" },
        { clipPath: "inset(0% 0% round 16px)" },
      ];
      // Only the backing changes shape. Text never clips or waits for JS.
      // This is the brief's exception to transform/opacity motion.
      for (const item of root.querySelectorAll<HTMLElement>("[data-principle]")) {
        const backing = item.querySelector<HTMLElement>("[data-backing]");
        if (!backing || typeof backing.animate !== "function") continue;
        if (Timeline) {
          animations.push(backing.animate(frames, {
            timeline: new Timeline({ subject: item, axis: "block" }),
            rangeStart: "entry 0%", rangeEnd: "entry 100%", fill: "both",
          }));
        } else if (typeof IntersectionObserver !== "undefined") {
          // The fallback starts only on a delivered intersection. No hidden
          // server state, and no observer is needed in native browsers.
          observer ??= new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const surface = entry.target.querySelector<HTMLElement>("[data-backing]");
              if (surface) animations.push(surface.animate(frames, {
                duration: 550, easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              }));
              observer?.unobserve(entry.target);
            }
          }, { threshold: 0.2 });
          observer.observe(item);
        }
      }
    };
    configure();
    preference.addEventListener("change", configure);
    return () => {
      reset();
      preference.removeEventListener("change", configure);
    };
  }, []);

  return (
    <section id="mindset" aria-labelledby="mindset-heading" className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)] py-[var(--space-24)]">
      <p className="label mb-[var(--space-6)]">{MINDSET.eyebrow}</p>
      <Reveal>
        <h2 id="mindset-heading" className="max-w-[20ch] text-balance text-[length:var(--step-5)] leading-[1.04] tracking-[var(--tracking-display)]">
          {MINDSET.headline}
        </h2>
      </Reveal>
      <Reveal>
        <p className="mt-[var(--space-8)] max-w-[52ch] text-[length:var(--step-1)] text-ink-muted md:ml-auto md:max-w-[42ch]">
          {MINDSET.lead}
        </p>
      </Reveal>
      <ul ref={list} className="mt-[var(--space-12)] grid gap-[var(--space-6)] md:grid-cols-12 md:gap-y-[var(--space-8)]">
        {MINDSET.principles.map((principle, index) => (
          <li key={principle.title} data-principle className={index % 2 === 0 ? "md:col-span-8 md:col-start-1" : "md:col-span-8 md:col-start-5"}>
            <ScrollTilt intensity={0.45}>
              <article className="relative isolate p-[var(--space-6)] sm:p-[var(--space-8)]">
                <span aria-hidden="true" data-backing className="pointer-events-none absolute inset-0 -z-10 rounded-[var(--radius-lg)] bg-surface-1 shadow-[var(--shadow-float)]" />
                <h3 className="text-[length:var(--step-1)] font-semibold">{principle.title}</h3>
                <p className="mt-[var(--space-4)] max-w-[60ch] text-ink-muted">{principle.body}</p>
              </article>
            </ScrollTilt>
          </li>
        ))}
      </ul>
    </section>
  );
}
