import Reveal from "@/components/reveal";
import { MediaCarousel } from "@/components/ui/media-carousel";
import { SectionHeading } from "@/components/ui/section-heading";
import { WORK } from "@/lib/content";

/*
  Project media, keyed by WORK[].id. Lives here rather than in lib/content.ts
  because it is asset wiring, not user facing copy.

  Puzzled and TotalTex Ops are deliberately empty arrays, not missing keys:
  Puzzled's client accounts are confidential (see PLAN.md section 7) and
  TotalTex Ops has no seeded-demo screenshots captured yet. Both are
  permanent, known states, not a "pending" placeholder, so MediaCarousel
  is simply never rendered for them and the row runs text only.
*/
const PROJECT_IMAGES: Record<string, { src: string; alt: string }[]> = {
  puzzled: [],
  "totaltex-ops": [],
  "totaltex-web": [
    {
      src: "/totaltex/conning-floor-wide.jpg",
      alt: "Wide view of the TotalTex conning floor, rows of machines winding thread onto cones.",
    },
    {
      src: "/totaltex/finished-garment-tableau.jpg",
      alt: "Finished garments laid out together, trimmed with TotalTex output.",
    },
    {
      src: "/totaltex/flexo-printing-machine.jpg",
      alt: "A flexographic printing machine used for woven label printing at the factory.",
    },
    {
      src: "/totaltex/loom-spools-detail.jpg",
      alt: "Close detail of loom spools loaded with coloured thread.",
    },
    {
      src: "/totaltex/sewing-thread-cones.jpg",
      alt: "Cones of sewing thread arranged on a factory shelf.",
    },
    {
      src: "/totaltex/trims-range-flatlay.jpg",
      alt: "A flatlay of the full range of garment trims the factory produces.",
    },
  ],
  fittrack: [
    {
      src: "/fittrack/fittrack-home-dashboard.png",
      alt: "FitTrack's home dashboard, showing a day's logged workouts and stats.",
    },
    {
      src: "/fittrack/fittrack-nutrition-water.png",
      alt: "FitTrack's nutrition and water intake tracking screen.",
    },
  ],
};

export function Work() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]"
    >
      <SectionHeading id="work-heading">Selected work</SectionHeading>

      <ul className="mt-[var(--space-12)] flex flex-col">
        {WORK.map((project, i) => {
          const images = PROJECT_IMAGES[project.id] ?? [];
          const hasMedia = images.length > 0;
          return (
            <li key={project.id} className={i > 0 ? "border-t border-hairline pt-[var(--space-16)]" : ""}>
              {/* Staggered by index so the rows arrive in sequence rather
                  than as a block, same mechanism Experience uses. */}
              <Reveal delay={i * 80}>
                <article
                  className={`grid gap-[var(--space-8)] pb-[var(--space-16)] ${
                    hasMedia ? "lg:grid-cols-2 lg:items-center" : ""
                  }`}
                >
                  {hasMedia && (
                    <div className="order-1">
                      <MediaCarousel images={images} label={`${project.name} project media`} />
                    </div>
                  )}

                  <div className={hasMedia ? "order-2" : ""}>
                    <div className="flex items-baseline justify-between gap-[var(--space-4)]">
                      <span className="text-[length:var(--step-1)] font-semibold">{project.name}</span>
                      <span className="data text-ink-subtle">
                        {project.kind} / {project.year}
                      </span>
                    </div>

                    <h3 className="mt-[var(--space-3)] text-[length:var(--step-2)] font-semibold">
                      {project.headline}
                    </h3>
                    <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-ink-muted">
                      {project.body}
                    </p>

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
                      <p className="data mt-[var(--space-6)] text-ink-subtle">{project.note}</p>
                    )}
                  </div>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
