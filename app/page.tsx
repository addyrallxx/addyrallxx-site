const COLORS = [
  { token: "--ink-0", hex: "#05070a", label: "ink-0, deepest ground" },
  { token: "--ink-1", hex: "#0a0e14", label: "ink-1, surface" },
  { token: "--ink-2", hex: "#121821", label: "ink-2, raised surface" },
  { token: "--ink-3", hex: "#1c2530", label: "ink-3, borders / hairlines" },
  { token: "--paper-0", hex: "#e8e6e1", label: "paper-0, primary text" },
  { token: "--paper-1", hex: "#a8aeb8", label: "paper-1, secondary text" },
  { token: "--paper-2", hex: "#6b7480", label: "paper-2, tertiary text" },
  { token: "--signal", hex: "#f0873d", label: "signal, the one accent" },
  { token: "--signal-dim", hex: "#89512b", label: "signal-dim, low emphasis" },
];

const TYPE_STEPS = ["--step--1", "--step-0", "--step-1", "--step-2", "--step-3", "--step-4", "--step-5"];

export default function Home() {
  return (
    <main id="main" className="mx-auto max-w-[1000px] px-6 py-16 md:px-10 md:py-24">
      <header className="mb-16">
        <p className="font-mono text-[length:var(--step--1)] uppercase tracking-[0.18em] text-paper-2">
          Design system, Phase 1 scaffold
        </p>
        <h1 className="mt-2 font-sans text-[length:var(--step-3)] text-paper-0">
          Adnan Shakib
        </h1>
      </header>

      <section aria-labelledby="type-scale-heading" className="mb-16">
        <h2
          id="type-scale-heading"
          className="mb-6 font-mono text-[length:var(--step--1)] uppercase tracking-[0.18em] text-paper-2"
        >
          Type scale
        </h2>
        <div className="flex flex-col gap-[var(--space-4)]">
          {TYPE_STEPS.map((step) => (
            <div key={step} className="flex flex-wrap items-baseline gap-[var(--space-4)]">
              <span
                className="w-24 shrink-0 font-mono text-[length:var(--step--1)] text-paper-2"
              >
                {step}
              </span>
              <span
                className="text-paper-0"
                style={{ fontSize: `var(${step})` }}
              >
                Dhaka to Calgary
              </span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="color-tokens-heading">
        <h2
          id="color-tokens-heading"
          className="mb-6 font-mono text-[length:var(--step--1)] uppercase tracking-[0.18em] text-paper-2"
        >
          Color tokens
        </h2>
        <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
          {COLORS.map((c) => (
            <div
              key={c.token}
              className="flex items-center gap-[var(--space-4)] rounded-sm border border-ink-3 p-[var(--space-4)]"
            >
              <span
                aria-hidden
                className="h-10 w-10 shrink-0 rounded-sm border border-ink-3"
                style={{ background: c.hex }}
              />
              <div className="min-w-0">
                <p className="font-mono text-[length:var(--step--1)] text-paper-0">{c.token}</p>
                <p className="truncate font-mono text-[length:var(--step--1)] text-paper-2">
                  {c.hex} · {c.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
