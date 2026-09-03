"use client";

/*
  Immersive project media slideshow: crossfade plus a slow Ken Burns drift
  on the active image, auto advancing on a dwell timer, pausable on hover
  or focus. Returns null for an empty image list (the Puzzled case, no
  imagery because the data is client confidential).

  Motion split between CSS and JS on purpose:
  - Crossfade opacity, the Ken Burns transform and the progress fill are
    all plain CSS (transition/@keyframes in app/media.css), restarted by
    the "is-active" class moving from one slide to the next. Cheap, and
    `prefers-reduced-motion` kills all three with one media query there,
    no JS branching needed for the visual side.
  - Only the auto-advance timer is JS, because "pick a new index after N
    seconds" has no CSS equivalent. It is skipped entirely under reduced
    motion and while paused.
*/

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";

const DWELL_MS = 5000;

export function MediaCarousel({
  images,
  label,
}: {
  images: { src: string; alt: string }[];
  label: string;
}): React.JSX.Element | null {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Derived, not stored: stays in range even if `images` shrinks under an
  // already-mounted carousel, with no extra effect to clamp it.
  const safeCurrent = images.length ? current % images.length : 0;

  useEffect(() => {
    if (prefersReducedMotion || paused || images.length < 2) return;
    // ponytail: pausing clears the timer rather than banking elapsed dwell,
    // so resuming always grants a fresh DWELL_MS. Upgrade to a remaining
    // time tracker if a hover-heavy layout needs exact cadence.
    const id = setTimeout(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, DWELL_MS);
    return () => clearTimeout(id);
  }, [current, paused, prefersReducedMotion, images.length]);

  if (images.length === 0) return null;

  const goTo = (index: number) => setCurrent(((index % images.length) + images.length) % images.length);

  return (
    <div
      className="media-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="media-carousel-frame">
        {images.map((image, i) => (
          <div
            key={image.src}
            className={"carousel-slide" + (i === safeCurrent ? " is-active" : "")}
            aria-hidden={i !== safeCurrent}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="carousel-slide-img"
            />
          </div>
        ))}

        {images.length > 1 && (
          <div className="carousel-controls">
            <button
              type="button"
              className="carousel-control"
              aria-label={`Previous image in ${label}`}
              onClick={() => goTo(safeCurrent - 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="carousel-control"
              aria-label={`Next image in ${label}`}
              onClick={() => goTo(safeCurrent + 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="carousel-progress" aria-hidden="true">
          <div key={safeCurrent} className="carousel-progress-fill" />
        </div>
      )}
    </div>
  );
}
