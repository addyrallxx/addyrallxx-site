"use client";

import { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { NEXT } from "@/lib/content";

export function NextUp() {
  const list = useRef<HTMLOListElement>(null);

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
        { clipPath: "inset(42% 88% 42% 0 round 999px)", borderRadius: "999px" },
        { clipPath: "inset(0% 0% 0% 0% round 16px)", borderRadius: "16px" },
      ];
      for (const step of root.querySelectorAll<HTMLElement>("[data-next-step]")) {
        const panel = step.querySelector<HTMLElement>("[data-next-panel]");
        if (!panel || typeof panel.animate !== "function") continue;
        if (Timeline) {
          animations.push(panel.animate(frames, {
            timeline: new Timeline({ subject: step, axis: "block" }),
            rangeStart: "entry 0%", rangeEnd: "entry 100%", fill: "both",
          }));
        } else if (typeof IntersectionObserver !== "undefined") {
          observer ??= new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const surface = entry.target.querySelector<HTMLElement>("[data-next-panel]");
              if (surface) animations.push(surface.animate(frames, {
                duration: 550, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "both",
              }));
              observer?.unobserve(entry.target);
            }
          }, { threshold: 0.2 });
          observer.observe(step);
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
    <section id="next" aria-labelledby="next-heading" className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]">
      <SectionHeading id="next-heading" eyebrow={NEXT.eyebrow}>{NEXT.headline}</SectionHeading>
      <ol ref={list} className="mt-[var(--space-12)]">
        {NEXT.items.map((item) => (
          <li key={item.title} data-next-step className="relative pb-[var(--space-10)] pl-[var(--space-10)] last:pb-0 sm:pl-[var(--space-12)] [view-timeline-name:--next-step] [view-timeline-axis:block]">
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[3px] w-px bg-hairline [container-type:size]">
              <span className="absolute top-0 left-0 h-px w-[100cqh] origin-top-left rotate-90">
                <span className="motion-hairline-draw block size-full bg-ink-subtle [animation-timeline:--next-step] [animation-range:entry_0%_cover_45%]" />
              </span>
            </span>
            <span aria-hidden="true" className="absolute top-[0.6em] left-0 size-[7px] rounded-full bg-accent" />
            <div className="relative isolate rounded-[var(--radius-lg)] p-[var(--space-5)] sm:grid sm:grid-cols-[10rem_1fr] sm:gap-[var(--space-8)] sm:p-[var(--space-6)]">
              <span aria-hidden="true" data-next-panel className="pointer-events-none absolute inset-0 -z-10 rounded-[var(--radius-lg)] border border-hairline bg-surface-1 shadow-[var(--shadow-float)]" />
              <div className="motion-fade-rise contents [--motion-rise:12px]">
                <p className="data pt-[var(--space-1)] text-ink-muted">{item.when}</p>
                <div>
                  <h3 className="text-[length:var(--step-1)] font-semibold">{item.title}</h3>
                  <p className="mt-[var(--space-3)] max-w-[60ch] text-ink-muted">{item.body}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
