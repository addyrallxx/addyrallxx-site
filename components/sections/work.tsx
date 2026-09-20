"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { MediaCarousel } from "@/components/ui/media-carousel";
import { SectionHeading } from "@/components/ui/section-heading";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";
import { WORK } from "@/lib/content";

// Asset wiring stays independent of the copy contract.
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
  const list = useRef<HTMLUListElement>(null);
  const reduced = usePrefersReducedMotion();
  const firstMedia = WORK.findIndex((project) => PROJECT_IMAGES[project.id]?.length);

  useEffect(() => {
    const el = list.current;
    if (!el || reduced || CSS.supports("animation-timeline", "view()") || typeof IntersectionObserver === "undefined") return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(".work-card"));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const card = entry.target as HTMLElement;
        if (entry.isIntersecting) card.classList.add("is-visible");
        card.style.setProperty("--media-offset", `${(1 - entry.intersectionRatio) * 18}px`);
      }
    }, { threshold: [0, 0.05, 0.2, 0.4, 0.6, 0.8, 1] });
    for (const card of cards) {
      observer.observe(card);
      card.classList.add("work-armed");
    }
    return () => {
      observer.disconnect();
      for (const card of cards) {
        card.classList.remove("work-armed");
        card.style.removeProperty("--media-offset");
      }
    };
  }, [reduced]);

  return (
    <section id="work" aria-labelledby="work-heading"
      className="mx-auto max-w-[var(--content-max)] border-t border-hairline px-[var(--gutter)] py-[var(--space-24)]">
      <SectionHeading id="work-heading">Selected work</SectionHeading>
      <ul ref={list} className="work-list">
        {WORK.map((project, index) => {
          const images = PROJECT_IMAGES[project.id] ?? [];
          const hasMedia = images.length > 0;
          return (
            <li key={project.id}>
              <article className={`work-card${index % 2 ? " work-card-reversed" : ""}${hasMedia ? "" : " work-card-typographic"}`}
                aria-labelledby={`work-${project.id}`} style={{ "--work-stagger": `${Math.min(index, 3) * 60}ms`, "--work-entry": `${Math.min(index, 3) * 3}%` } as CSSProperties}>
                <div className="work-copy">
                  <div className="work-meta">
                    <span className="text-[length:var(--step-1)] font-semibold">{project.name}</span>
                    <span className="data text-ink-subtle">{project.kind} / {project.year}</span>
                  </div>
                  <h3 id={`work-${project.id}`} className="mt-[var(--space-3)] text-[length:var(--step-2)] font-semibold">{project.headline}</h3>
                  <p className="mt-[var(--space-4)] max-w-[var(--measure)] text-ink-muted">{project.body}</p>
                  {hasMedia && (
                    <ul className="work-details">
                      {project.detail.map((detail, detailIndex) => <li key={`${project.id}:detail:${detailIndex}`}>{detail}</li>)}
                    </ul>
                  )}
                  <ul className="mt-[var(--space-6)] flex flex-wrap gap-[var(--space-2)]">
                    {project.tags.map((tag, tagIndex) => (
                      <li key={`${project.id}:tag:${tagIndex}`}><span className="data inline-block rounded-[var(--radius-pill)] border border-hairline px-[var(--space-4)] py-[var(--space-1)] text-ink-subtle">{tag}</span></li>
                    ))}
                  </ul>
                  {project.links.length > 0 && (
                    <ul className="work-links">
                      {project.links.map((link, linkIndex) => (
                        <li key={`${project.id}:link:${linkIndex}`}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></li>
                      ))}
                    </ul>
                  )}
                  {project.note !== "" && <p className="data mt-[var(--space-6)] text-ink-subtle">{project.note}</p>}
                </div>
                <div className={hasMedia ? "work-visual" : "work-proof"}>
                  {hasMedia ? <MediaCarousel images={images} label={`${project.name} project media`} priority={index === firstMedia} /> : (
                    <ul className="work-proof-lines">
                      {project.detail.map((detail, detailIndex) => <li key={`${project.id}:proof:${detailIndex}`}>{detail}</li>)}
                    </ul>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
