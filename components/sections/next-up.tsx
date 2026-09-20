import { SectionHeading } from "@/components/ui/section-heading";
import { NEXT } from "@/lib/content";

export function NextUp() {
  return (
    <section id="next" aria-labelledby="next-heading" className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]">
      <SectionHeading id="next-heading" eyebrow={NEXT.eyebrow}>{NEXT.headline}</SectionHeading>
      <ol className="mt-[var(--space-12)]">
        {NEXT.items.map((item) => (
          <li key={item.title} className="relative pb-[var(--space-10)] pl-[var(--space-10)] last:pb-0 sm:pl-[var(--space-12)] [view-timeline-name:--next-step] [view-timeline-axis:block]">
            {/* Rotate the drawing plane, not the scale animation: the shared
                utility becomes a vertical rail, sized to each row's copy. */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[3px] w-px bg-hairline [container-type:size]">
              <span className="absolute top-0 left-0 h-px w-[100cqh] origin-top-left rotate-90">
                <span className="motion-hairline-draw block size-full bg-ink-subtle [animation-timeline:--next-step] [animation-range:entry_0%_cover_45%]" />
              </span>
            </span>
            <span aria-hidden="true" className="absolute top-[0.6em] left-0 size-[7px] rounded-full bg-accent" />
            <div className="motion-fade-rise grid gap-[var(--space-3)] sm:grid-cols-[10rem_1fr] sm:gap-[var(--space-8)] [--motion-rise:12px]">
              <p className="data pt-[var(--space-1)] text-ink-muted">{item.when}</p>
              <div>
                <h3 className="text-[length:var(--step-1)] font-semibold">{item.title}</h3>
                <p className="mt-[var(--space-3)] max-w-[60ch] text-ink-muted">{item.body}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
