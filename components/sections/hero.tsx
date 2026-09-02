import { WordReveal } from "@/components/story/word-reveal";
import { HERO } from "@/lib/content";

/*
  Hero.

  Fixes since chunk 0, all of them things that looked fine and were not:

  The button pointed at #currently while reading "See the work". Now it
  takes HERO.primary.href, which is #work, and that section exists.

  The email was typed into this file twice. It now comes from
  HERO.secondary, which derives from SITE.email, so the address exists in
  exactly one place in the repo.

  The button was white on --accent, which is 3.91:1 and fails AA for text
  this size. Canvas colour on --accent is 5.09:1, and white on
  --accent-deep is 5.82:1, so the hover state can keep the white.

  No font-semibold on the h1: @layer base already sets weight 600 for the
  display face, and a utility here would override the warm scope's serif
  weight if this pattern were ever reused inside one.

  No <Reveal> here any more. Reveal is a scroll driven mechanism and
  everything in the hero is already in the first viewport at load, so it
  gets its own clock driven entrance instead: .hero-in and .hero-intro
  .word-in in globals.css, staggered by the --stagger custom property below.
  The headline keeps the word.reveal look (blur plus rise, per word) through
  the same WordReveal component the fallback path already used, just driven
  by animation-delay instead of animation-timeline.
*/
export function Hero() {
  return (
    <section className="hero-intro mx-auto flex min-h-svh max-w-[var(--content-max)] flex-col justify-center px-[var(--gutter)] pt-[var(--space-32)] pb-[var(--space-24)]">
      {/* The hero is not a numbered section. Numbering starts at
          Currently, so the index reads as a table of contents rather
          than as decoration. */}
      <p
        className="hero-in label mb-[var(--space-8)] flex items-center gap-[var(--space-3)]"
        style={{ "--stagger": 0 } as React.CSSProperties}
      >
        <span aria-hidden className="inline-block size-[6px] rounded-full bg-accent" />
        {HERO.eyebrow}
      </p>

      <h1 className="max-w-[16ch] text-[length:var(--step-6)]">
        <WordReveal text={HERO.headline} />
      </h1>

      <p
        className="hero-in mt-[var(--space-10)] max-w-[52ch] text-[length:var(--step-1)] text-ink-muted"
        style={{ "--stagger": 2 } as React.CSSProperties}
      >
        {HERO.lead}
      </p>

      <div
        className="hero-in mt-[var(--space-12)] flex flex-wrap items-center gap-[var(--space-6)]"
        style={{ "--stagger": 3 } as React.CSSProperties}
      >
        <a
          href={HERO.primary.href}
          className="press rounded-[var(--radius-pill)] bg-accent px-[var(--space-8)] py-[var(--space-4)] font-display text-[length:var(--step-0)] font-semibold text-canvas transition-colors hover:bg-accent-deep hover:text-white"
        >
          {HERO.primary.label}
        </a>
        <a
          href={HERO.secondary.href}
          className="press border-b border-hairline-strong pb-[2px] text-[length:var(--step-0)] text-ink-muted transition-colors hover:border-accent hover:text-ink"
        >
          {HERO.secondary.label}
        </a>
      </div>
    </section>
  );
}
