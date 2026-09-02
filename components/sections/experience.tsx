import Reveal from "@/components/reveal";
import { EXPERIENCE } from "@/lib/content";

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <Reveal>
        <h2 id="experience-heading" className="label mb-[var(--space-12)]">
          <span className="label-index">02</span>
          <span className="mx-[var(--space-3)] text-hairline-strong">/</span>
          Experience
        </h2>
      </Reveal>

      <ol className="flex flex-col">
        {EXPERIENCE.map((job, i) => (
          <li key={job.company} className={i > 0 ? "border-t border-hairline pt-[var(--space-16)]" : ""}>
            {/* Staggered by index so the rows arrive in sequence rather
                than as a block, same mechanism Selected work uses. */}
            <Reveal delay={i * 80}>
              <article className="grid gap-[var(--space-6)] pb-[var(--space-16)] sm:grid-cols-[14rem_1fr]">
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
                    {job.tags.map((tag) => (
                      <li key={tag}>
                        <span className="data inline-block rounded-[var(--radius-pill)] border border-hairline px-[var(--space-4)] py-[var(--space-1)] text-ink-subtle">
                          {tag}
                        </span>
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
