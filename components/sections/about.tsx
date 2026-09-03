import Reveal from "@/components/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ABOUT } from "@/lib/content";

// The warm band. data-tone="warm" sits on the outer <section> and nowhere
// else on the page: [data-tone] in globals.css paints its own full ground
// there, and the flip only reaches descendants, so this element has to be
// the one carrying it. Everything inside stays on token classes so the flip
// actually works instead of fighting a hardcoded colour.
export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" data-tone="warm">
      <div className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]">
        <SectionHeading id="about-heading" eyebrow={ABOUT.eyebrow}>
          {ABOUT.headline}
        </SectionHeading>

        <Reveal>
          <div className="mt-[var(--space-8)] flex w-24 aspect-square items-center justify-center border border-hairline bg-surface-2 p-[var(--space-2)]">
            <span className="label text-center">Portrait pending</span>
          </div>
        </Reveal>

        {ABOUT.paragraphs.map((paragraph) => (
          <Reveal key={paragraph}>
            <p className="mt-[var(--space-6)] max-w-[var(--measure)] text-ink-muted">{paragraph}</p>
          </Reveal>
        ))}

        <hr className="m-rule my-[var(--space-16)]" />

        <Reveal>
          <div className="grid gap-[var(--space-8)] sm:grid-cols-[3fr_2fr] sm:items-start">
            <div>
              <h3 className="text-[length:var(--step-2)]">{ABOUT.car.heading}</h3>
              <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-ink-muted">
                {ABOUT.car.body}
              </p>
            </div>
            <div className="flex aspect-[3/2] items-center justify-center border border-hairline bg-surface-2">
              <span className="label">Photograph pending</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
