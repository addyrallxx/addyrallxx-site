import Reveal from "@/components/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CURRENTLY } from "@/lib/content";

/*
  Currently.

  This file used to hold its own copy of the data, forked from chunk 0 and
  never reconnected. That made lib/content.ts a claimed single source rather
  than an actual one, and the fork silently kept saying "four Calgary-area
  dealerships" after the real number moved past seven. It imports now.
*/

export function Currently() {
  return (
    <section
      id="currently"
      aria-labelledby="currently-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <SectionHeading id="currently-heading">Currently</SectionHeading>

      <ul className="mt-[var(--space-12)] grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-hairline bg-hairline sm:grid-cols-3">
        {CURRENTLY.map((item, i) => (
          // bg-canvas belongs here, on the grid cell, not on the article three
          // levels down. The ul paints bg-hairline and relies on gap-px to
          // draw the dividers, so any part of a cell the article does not
          // cover shows up as a grey block. Reveal sits between the two and
          // collapses to content height, which is what h-full on the article
          // was measuring against.
          <li key={item.name} className="bg-canvas">
            <Reveal delay={i * 80}>
              <article className="flex h-full flex-col bg-canvas p-[var(--space-8)]">
                <p className="label">{item.label}</p>
                <h3 className="mt-[var(--space-4)] text-[length:var(--step-2)] font-semibold">
                  {item.name}
                </h3>
                <p className="mt-[var(--space-2)] text-[length:var(--step-0)] text-ink-muted">
                  {item.role}
                </p>
                <p className="mt-[var(--space-6)] text-[length:var(--step-0)] text-ink-muted">
                  {item.detail}
                </p>
                <p className="data mt-auto pt-[var(--space-8)] text-ink-subtle">{item.place}</p>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
