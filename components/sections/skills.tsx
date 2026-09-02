import Reveal from "@/components/reveal";
import { SKILLS } from "@/lib/content";

// This grid is a placeholder for the group data, not the final presentation.
// A later chunk replaces it with a draggable 3D sphere driven by the same
// SKILLS.groups items, each of which already carries a Simple Icons `slug`
// for that purpose. Nothing about this data shape needs to change for it.
export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <Reveal>
        <h2 id="skills-heading" className="label mb-[var(--space-12)]">
          <span className="label-index">04</span>
          <span className="mx-[var(--space-3)] text-hairline-strong">/</span>
          Skills
        </h2>
      </Reveal>

      <div className="grid gap-[var(--space-10)] sm:grid-cols-3">
        {SKILLS.groups.map((group) => (
          <Reveal key={group.title}>
            <div>
              <h3 className="text-[length:var(--step-1)] font-semibold">{group.title}</h3>
              <ul className="mt-[var(--space-4)] flex flex-wrap gap-[var(--space-2)]">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <span className="data inline-block rounded-[var(--radius-pill)] border border-hairline px-[var(--space-4)] py-[var(--space-1)] text-ink-muted">
                      {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-[var(--space-16)] border-l border-hairline-strong pl-[var(--space-8)]">
          <h3 className="text-[length:var(--step-2)] font-semibold">{SKILLS.business.title}</h3>
          <p className="mt-[var(--space-3)] max-w-[var(--measure)] text-ink-muted">
            {SKILLS.business.body}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
