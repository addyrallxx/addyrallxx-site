import Reveal from "@/components/reveal";

/*
  Currently, moved out of app/page.tsx unchanged. Working copy from chunk 0,
  not yet swapped for lib/content.ts's CURRENTLY export: that would be a
  copy change, and this move is not the place for one.
*/
const CURRENTLY = [
  {
    label: "Company",
    name: "Puzzled",
    role: "Co-founder, technical",
    place: "Calgary",
    detail: "Vehicle listings for four Calgary-area dealerships.",
  },
  {
    label: "Family business",
    name: "TotalTex",
    role: "Built the order system",
    place: "Dhaka",
    detail: "Order to job card to challan to bill, on the factory floor.",
  },
  {
    label: "School",
    name: "University of Calgary",
    role: "Computer science",
    place: "Since 2022",
    detail: "Faculty of Science.",
  },
];

export function Currently() {
  return (
    <section
      id="currently"
      aria-labelledby="currently-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <Reveal>
        <h2 id="currently-heading" className="label mb-[var(--space-12)]">
          <span className="label-index">01</span>
          <span className="mx-[var(--space-3)] text-hairline-strong">/</span>
          Currently
        </h2>
      </Reveal>

      <ul className="grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-hairline bg-hairline sm:grid-cols-3">
        {CURRENTLY.map((item) => (
          <li key={item.name}>
            <Reveal>
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
