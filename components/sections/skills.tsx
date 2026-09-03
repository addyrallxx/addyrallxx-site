import Reveal from "@/components/reveal";
import { ImgSphere, type SkillIcon } from "@/components/ui/img-sphere";
import { SectionHeading } from "@/components/ui/section-heading";
import { SKILLS } from "@/lib/content";

// Every SKILLS.groups item carries a Simple Icons `slug`. The sphere and the
// list below both read the same flattened array, so there is exactly one
// place that turns content data into sphere items.
const SPHERE_ITEMS: SkillIcon[] = SKILLS.groups.flatMap((group) =>
  // Keyed on the name, not the slug. Three items carry slug: null (Codex,
  // LLMs and RAG all lack a usable brand mark), and they sit in the same
  // group, so a slug based id collapsed all three onto the key
  // "AI and automation-null". The sphere re-renders every animation frame,
  // and React inserts rather than reconciles across duplicate keys, so the
  // page was gaining roughly a hundred DOM nodes a second for as long as it
  // stayed open. Names are unique across every group.
  group.items.map((item) => ({ id: `${group.title}-${item.name}`, slug: item.slug, name: item.name }))
);

export function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <SectionHeading id="skills-heading">Skills</SectionHeading>

      <div className="mt-[var(--space-12)] grid gap-[var(--space-12)] lg:grid-cols-[420px_1fr] lg:items-center">
        {/* The visual: a sphere is the one thing here that photography and
            copy alone can't do, and it's the element Adnan asked for by
            name. Icons are real files at public/icons/<slug>.svg where they
            exist; item.name always renders next to one regardless. */}
        <Reveal>
          <div className="flex flex-col items-center gap-[var(--space-4)]">
            <ImgSphere items={SPHERE_ITEMS} className="mx-auto" />
            <p className="label">Drag it</p>
          </div>
        </Reveal>

        {/* The content: a recruiter skimming needs the flat list, and it
            doubles as what a screen reader or a failed sphere mount falls
            back to. */}
        <div className="grid gap-[var(--space-10)] sm:grid-cols-3">
          {SKILLS.groups.map((group, i) => (
            <Reveal key={group.title} delay={i * 80}>
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
