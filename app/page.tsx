import Reveal from "@/components/reveal";

/*
  Chunk 0: the look, and nothing else.

  Header, hero and the "currently" strip only, so the type scale, the
  graphite palette, the spacing rhythm and the accent budget can be judged
  before any of the real sections are built on top of them. Copy here is
  working copy; the full pass lands in chunk 1 with the rest of the site.
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

export default function Home() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-hairline/60 bg-canvas/80 backdrop-blur">
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[var(--content-max)] items-center justify-between px-[var(--gutter)] py-[var(--space-4)]"
        >
          <a href="#main" className="font-display text-[length:var(--step-0)] font-semibold tracking-[-0.02em]">
            Adnan Shakib
          </a>
          <a
            href="mailto:adnanshakib888@gmail.com"
            className="press label hover:text-ink"
            style={{ transitionProperty: "color" }}
          >
            Email
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="mx-auto flex min-h-svh max-w-[var(--content-max)] flex-col justify-center px-[var(--gutter)] pt-[var(--space-32)] pb-[var(--space-24)]">
          <Reveal immediate>
            {/* The hero is not a numbered section. Numbering starts at
                Currently, so the index reads as a table of contents rather
                than as decoration. */}
            <p className="label mb-[var(--space-8)] flex items-center gap-[var(--space-3)]">
              <span aria-hidden className="inline-block size-[6px] rounded-full bg-accent" />
              Calgary, Alberta
            </p>
          </Reveal>

          <Reveal immediate>
            <h1 className="max-w-[16ch] text-[length:var(--step-6)] font-semibold">
              I sold cars, then I automated the part I hated.
            </h1>
          </Reveal>

          <Reveal immediate>
            <p className="mt-[var(--space-10)] max-w-[52ch] text-[length:var(--step-1)] text-ink-muted">
              Puzzled now handles vehicle listings for four Calgary-area dealerships. The order
              system I built runs a garment factory in Dhaka. Computer science at the University of
              Calgary in between.
            </p>
          </Reveal>

          <Reveal immediate>
            <div className="mt-[var(--space-12)] flex flex-wrap items-center gap-[var(--space-6)]">
              <a
                href="#currently"
                className="press rounded-[var(--radius-pill)] bg-accent px-[var(--space-8)] py-[var(--space-4)] font-display text-[length:var(--step-0)] font-semibold text-white transition-colors hover:bg-accent-deep"
              >
                See the work
              </a>
              <a
                href="mailto:adnanshakib888@gmail.com"
                className="press border-b border-hairline-strong pb-[2px] text-[length:var(--step-0)] text-ink-muted transition-colors hover:border-accent hover:text-ink"
              >
                adnanshakib888@gmail.com
              </a>
            </div>
          </Reveal>
        </section>

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
      </main>
    </>
  );
}
