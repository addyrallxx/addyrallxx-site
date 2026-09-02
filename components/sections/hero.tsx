import Reveal from "@/components/reveal";
import { HERO } from "@/lib/content";

/*
  Hero.

  Three fixes since chunk 0, all of them things that looked fine and were
  not:

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
*/
export function Hero() {
  return (
    <section className="mx-auto flex min-h-svh max-w-[var(--content-max)] flex-col justify-center px-[var(--gutter)] pt-[var(--space-32)] pb-[var(--space-24)]">
      <Reveal immediate>
        {/* The hero is not a numbered section. Numbering starts at
            Currently, so the index reads as a table of contents rather
            than as decoration. */}
        <p className="label mb-[var(--space-8)] flex items-center gap-[var(--space-3)]">
          <span aria-hidden className="inline-block size-[6px] rounded-full bg-accent" />
          {HERO.eyebrow}
        </p>
      </Reveal>

      <Reveal immediate>
        <h1 className="max-w-[16ch] text-[length:var(--step-6)]">{HERO.headline}</h1>
      </Reveal>

      <Reveal immediate>
        <p className="mt-[var(--space-10)] max-w-[52ch] text-[length:var(--step-1)] text-ink-muted">
          {HERO.lead}
        </p>
      </Reveal>

      <Reveal immediate>
        <div className="mt-[var(--space-12)] flex flex-wrap items-center gap-[var(--space-6)]">
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
      </Reveal>
    </section>
  );
}
