import Reveal from "@/components/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { EXPERIENCE } from "@/lib/content";

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <SectionHeading id="experience-heading">Experience</SectionHeading>

      <ol className="mt-[var(--space-12)] flex flex-col">
        {EXPERIENCE.map((job, i) => (
          <li key={job.company} className={i > 0 ? "pt-[var(--space-8)]" : ""}>
            {/* Staggered by index so the rows arrive in sequence rather
                than as a block, same mechanism Selected work uses. */}
            <Reveal delay={i * 80}>
              <article className="grid gap-[var(--space-6)] rounded-[var(--radius-lg)] border border-hairline bg-surface-1 p-[var(--space-6)] shadow-[var(--shadow-float)] motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:ease-[var(--ease)] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[var(--shadow-lift)] sm:grid-cols-[14rem_1fr] sm:p-[var(--space-8)]">
                <div>
                  <p className="data text-ink-subtle">{job.period}</p>
                  <p className="data mt-[var(--space-1)] text-ink-subtle">{job.place}</p>
                </div>
                <div>
                  <h3 className="text-[length:var(--step-2)] font-semibold">{job.company}</h3>
                  <p className="mt-[var(--space-1)] text-[length:var(--step-1)] text-ink-muted">
                    {job.role}
                  </p>
                  <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-ink-muted">
                    {job.summary}
                  </p>
                  <ul className="mt-[var(--space-6)] flex flex-col gap-[var(--space-2)] text-ink-muted">
                    {job.points.map((point) => (
                      <li key={point} className="flex gap-[var(--space-3)]">
                        <span
                          aria-hidden
                          className="mt-[0.6em] size-[4px] shrink-0 rounded-full bg-hairline-strong"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-[var(--space-6)] flex flex-wrap gap-[var(--space-2)]">
                    {job.tags.map((tag, tagIndex) => (
                      <li key={tag}>
                        <Reveal className="inline-block" delay={i * 80 + tagIndex * 45}>
                          <span className="data inline-block rounded-[var(--radius-pill)] border border-hairline px-[var(--space-4)] py-[var(--space-1)] text-ink-subtle">
                            {tag}
                          </span>
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
