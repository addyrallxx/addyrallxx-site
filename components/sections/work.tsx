import Reveal from "@/components/reveal";
import { WORK } from "@/lib/content";

export function Work() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <Reveal>
        <h2 id="work-heading" className="label mb-[var(--space-12)]">
          <span className="label-index">03</span>
          <span className="mx-[var(--space-3)] text-hairline-strong">/</span>
          Selected work
        </h2>
      </Reveal>

      <ul className="grid gap-[var(--space-8)] sm:grid-cols-2">
        {WORK.map((project) => (
          <li key={project.id}>
            <Reveal>
              <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface-1">
                {/* No screenshot exists yet. Reserved at the real aspect
                    ratio so the layout does not shift once one lands. */}
                <div className="flex aspect-[16/9] items-center justify-center border-b border-hairline bg-surface-2">
                  <span className="label">Screenshot pending</span>
                </div>

                <div className="flex flex-1 flex-col p-[var(--space-8)]">
                  <div className="flex items-baseline justify-between gap-[var(--space-4)]">
                    <span className="text-[length:var(--step-0)] font-semibold">{project.name}</span>
                    <span className="data text-ink-subtle">
                      {project.kind} / {project.year}
                    </span>
                  </div>

                  <h3 className="mt-[var(--space-3)] text-[length:var(--step-2)] font-semibold">
                    {project.headline}
                  </h3>
                  <p className="mt-[var(--space-4)] text-ink-muted">{project.body}</p>

                  <ul className="mt-[var(--space-6)] flex flex-col gap-[var(--space-2)] text-ink-muted">
                    {project.detail.map((d) => (
                      <li key={d} className="flex gap-[var(--space-3)]">
                        <span
                          aria-hidden
                          className="mt-[0.6em] size-[4px] shrink-0 rounded-full bg-hairline-strong"
                        />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-[var(--space-6)] flex flex-wrap gap-[var(--space-2)]">
                    {project.tags.map((tag) => (
                      <li key={tag}>
                        <span className="data inline-block rounded-[var(--radius-pill)] border border-hairline px-[var(--space-4)] py-[var(--space-1)] text-ink-subtle">
                          {tag}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {project.links.length > 0 && (
                    <ul className="mt-[var(--space-6)] flex flex-wrap gap-[var(--space-4)]">
                      {project.links.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="press border-b border-hairline-strong pb-[2px] text-ink-muted transition-colors hover:border-accent hover:text-ink"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}

                  {project.note !== "" && (
                    <p className="data mt-auto pt-[var(--space-6)] text-ink-subtle">{project.note}</p>
                  )}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
