import Reveal from "@/components/reveal";
import { EDUCATION } from "@/lib/content";

/*
  Education.

  Present because the primary reader is a recruiter filling a summer 2027
  internship, and the first thing that reader hunts for is a graduation
  date. Leaving it to be inferred from "since 2022" made them do arithmetic,
  which is a good way to be skipped.

  Deliberately the quietest section on the page: a two row list, no cards,
  no tags. It answers a question rather than making a case.
*/
export function Education() {
  return (
    <section
      id="education"
      aria-labelledby="education-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <Reveal>
        <h2 id="education-heading" className="label mb-[var(--space-12)]">
          <span className="label-index">05</span>
          <span className="mx-[var(--space-3)] text-hairline-strong">/</span>
          Education
        </h2>
      </Reveal>

      <ul className="flex flex-col">
        {EDUCATION.map((entry, i) => (
          <li key={entry.institution}>
            <Reveal>
              <article
                className={`grid gap-[var(--space-4)] py-[var(--space-8)] sm:grid-cols-[16rem_1fr] sm:gap-[var(--space-10)] ${
                  i > 0 ? "border-t border-hairline" : ""
                }`}
              >
                <div>
                  <p className="data text-ink-subtle">{entry.period}</p>
                  <p className="data mt-[var(--space-1)] text-ink-subtle">{entry.place}</p>
                </div>
                <div>
                  <h3 className="text-[length:var(--step-2)]">{entry.institution}</h3>
                  <p className="mt-[var(--space-2)] text-ink-muted">{entry.credential}</p>
                  <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-ink-muted">
                    {entry.detail}
                  </p>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
