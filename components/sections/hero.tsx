"use client";

import { useEffect, useRef } from "react";
import { WordReveal } from "@/components/story/word-reveal";
import { HeroObject } from "@/components/ui/hero-object";
import { HERO } from "@/lib/content";

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const subject = section.current;
    const target = content.current;
    const Timeline = (window as unknown as {
      ViewTimeline?: new (options: { subject: Element; axis: string }) => AnimationTimeline;
    }).ViewTimeline;
    if (!subject || !target || !Timeline) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: Animation | undefined;
    const configure = () => {
      animation?.cancel();
      if (preference.matches) return;
      // Exit only: never dim above-the-fold content while it is entering.
      animation = target.animate([
        { transform: "translateY(0) scale(1)" },
        { transform: "translateY(16px) scale(0.975)" },
      ], {
        timeline: new Timeline({ subject, axis: "block" }),
        rangeStart: "exit 0%", rangeEnd: "exit 100%", fill: "both",
      });
    };
    configure();
    preference.addEventListener("change", configure);
    return () => {
      animation?.cancel();
      preference.removeEventListener("change", configure);
    };
  }, []);

  return (
    <section ref={section} id="hero" aria-labelledby="hero-heading" className="hero-intro relative isolate mx-auto flex min-h-svh max-w-[var(--content-max)] flex-col justify-center px-[var(--gutter)] pt-[var(--space-32)] pb-[var(--space-24)]">
      {/* Stash 24747: explicit visual/content planes and a readable measure.
          Absolute decoration never reserves a mobile or no-WebGL fallback. */}
      {/*
        The galaxy shows on every viewport, phones included.

        This used to be `hidden ... md:block`, from when the decoration here
        was a wireframe object that removed itself below 768px. The galaxy
        scales its particle count to viewport area instead, so a phone gets
        the same composition rather than a blank corner, which is what Adnan
        asked for: the phone is not a degraded tier.

        Keeping the utility and overriding it from hero-object.css was the
        other option and it is worse. That override matched on
        `.hero-intro > div:has(> .galaxy)`, so a change to this element's
        nesting would silently stop it matching and the galaxy would vanish
        on phones with nothing failing anywhere. Phone SIZING still lives in
        hero-object.css, which is fine because sizing degrades visibly.
      */}
      <div aria-hidden="true" className="hero-decoration pointer-events-none absolute top-[12%] right-0 z-0 block h-[min(65vw,42rem)] w-[58%]">
        <HeroObject />
      </div>
      <div ref={content} className="relative z-10 origin-top-left">
        <p className="hero-in label mb-[var(--space-8)] flex items-center gap-[var(--space-3)]" style={{ "--stagger": 0 } as React.CSSProperties}>
          <span aria-hidden className="inline-block size-[6px] rounded-full bg-accent" />
          {HERO.eyebrow}
        </p>
        <h1 id="hero-heading" className="max-w-[19ch] text-balance text-[length:var(--step-6)]">
          <WordReveal text={HERO.headline} />
        </h1>
        <p className="hero-in mt-[var(--space-10)] max-w-[60ch] text-pretty text-[length:var(--step-1)] text-ink-muted" style={{ "--stagger": 2 } as React.CSSProperties}>
          {HERO.lead}
        </p>
        <div className="hero-in mt-[var(--space-12)] flex flex-wrap items-center gap-[var(--space-6)]" style={{ "--stagger": 3 } as React.CSSProperties}>
          <a href={HERO.primary.href} className="press inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-accent px-[var(--space-8)] py-[var(--space-4)] font-display text-[length:var(--step-0)] font-semibold text-canvas hover:bg-accent-deep hover:text-white">
            {HERO.primary.label}
          </a>
          <a href={HERO.secondary.href} className="press inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-surface-1 px-[var(--space-6)] py-[var(--space-4)] text-[length:var(--step-0)] text-ink-muted hover:text-ink">
            {HERO.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
