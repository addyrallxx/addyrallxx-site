"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";

const DWELL_MS = 5000;

// Shortest signed ring distance. Exact half turns follow the requested direction.
function coverflowOffset(index: number, position: number, count: number, direction = 1): number {
  if (count < 2) return 0;
  const offset = ((index - position) % count + count) % count;
  return offset > count / 2 || (offset === count / 2 && direction < 0) ? offset - count : offset;
}

// Geometry adapted from stash 25480 and 23997, all from one signed offset.
function coverflowStyle(offset: number): CSSProperties {
  const distance = Math.abs(offset);
  const ramp = Math.pow(distance, 0.7);
  return {
    "--cover-x": `${offset * 64}%`,
    "--cover-z": `${-100 * ramp}px`,
    "--cover-yaw": `${-Math.sign(offset) * Math.min(50, 34 * ramp)}deg`,
    "--cover-scale": 1 - Math.min(0.24, distance * 0.08),
    "--cover-dim": Math.min(0.65, distance * 0.3),
    "--cover-visible": Math.max(0, Math.min(1, 2 - distance)),
  } as CSSProperties;
}

export function MediaCarousel({ images, label, priority = false }: {
  images: { src: string; alt: string }[];
  label: string;
  priority?: boolean;
}): React.JSX.Element | null {
  const root = useRef<HTMLDivElement>(null);
  const loaded = useRef(new Set<string>());
  const failed = useRef(new Set<string>());
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const position = useRef(0);
  const settleFrame = useRef(0);
  const pending = useRef<{ index: number; direction: number } | null>(null);
  const dwell = useRef({ index: 0, remaining: DWELL_MS });
  const drag = useRef<{ id: number; x: number; y: number; lastX: number; time: number; velocity: number; pitch: number; index: number; offset: number; horizontal: boolean } | null>(null);
  const [slide, setSlide] = useState({ current: 0, previous: -1, direction: 1 });
  const [requested, setRequested] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const reduced = usePrefersReducedMotion();
  const current = images.length ? slide.current % images.length : 0;
  const paused = hovered || focused || stopped || !visible || dragging || reduced || requested !== null;

  const paint = useCallback((value: number) => {
    position.current = value;
    cards.current.forEach((card, slot) => {
      if (!card) return;
      // Three ring copies keep the two-image case symmetric without pretending
      // there are extra slides. Copies are decorative and never in the tab order.
      const logical = slot - images.length;
      const offset = coverflowOffset(logical, value, images.length * 3);
      const style = coverflowStyle(offset);
      for (const [property, entry] of Object.entries(style)) card.style.setProperty(property, String(entry));
      card.style.pointerEvents = Math.abs(offset) < 1.95 ? "auto" : "none";
    });
  }, [images.length]);

  const settle = useCallback((target: number) => {
    cancelAnimationFrame(settleFrame.current);
    if (reduced || !visible) { paint(target); return; }
    let previous = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(50, now - previous);
      previous = now;
      const remaining = target - position.current;
      if (Math.abs(remaining) < 0.001) {
        paint(((target % images.length) + images.length) % images.length);
        settleFrame.current = 0;
        return;
      }
      // 23997's exponential settle, time-based. 1529's flick carries into the
      // target without copying its overdamped spring or adding any overshoot.
      paint(position.current + remaining * (1 - Math.exp(-delta / 85)));
      settleFrame.current = requestAnimationFrame(tick);
    };
    settleFrame.current = requestAnimationFrame(tick);
  }, [images.length, paint, reduced, visible]);

  const commit = useCallback((index: number, direction: number) => {
    pending.current = null;
    setRequested(null);
    setSlide((old) => ({ current: index, previous: old.current, direction }));
  }, []);

  const goTo = useCallback((index: number, direction: number) => {
    if (images.length < 2) return;
    const next = ((index % images.length) + images.length) % images.length;
    if (next === current) return;
    if (failed.current.has(images[next].src)) {
      pending.current = null;
      setRequested(null);
      setStopped(true);
      return;
    }
    if (loaded.current.has(images[next].src)) commit(next, direction);
    else {
      pending.current = { index: next, direction };
      setRequested(next);
    }
  }, [commit, current, images]);

  useEffect(() => {
    if (!images.length) return;
    const target = position.current + coverflowOffset(current, position.current, images.length, slide.direction);
    settle(target);
    return () => cancelAnimationFrame(settleFrame.current);
  }, [current, images.length, settle, slide.direction]);

  useEffect(() => {
    dwell.current = { index: current, remaining: DWELL_MS };
  }, [current]);

  useEffect(() => {
    const sources = new Set(images.map((image) => image.src));
    for (const src of loaded.current) {
      if (!sources.has(src)) loaded.current.delete(src);
    }
    for (const src of failed.current) {
      if (!sources.has(src)) failed.current.delete(src);
    }
  }, [images]);

  useEffect(() => {
    if (paused || images.length < 2) return;
    const started = performance.now();
    const timer = window.setTimeout(() => goTo(current + 1, 1), dwell.current.remaining);
    return () => {
      clearTimeout(timer);
      dwell.current.remaining = Math.max(0, dwell.current.remaining - (performance.now() - started));
    };
  }, [current, goTo, images.length, paused]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let intersecting = true;
    const visibility = () => setVisible(intersecting && !document.hidden);
    const fallback = !CSS.supports("animation-timeline", "view()");
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      visibility();
      if (fallback) {
        el.style.setProperty("--frame-scale", String(0.975 + entry.intersectionRatio * 0.025));
      }
    }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    observer?.observe(el);
    document.addEventListener("visibilitychange", visibility);
    visibility();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [images.length]);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced || !visible) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    const tick = () => {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      el.style.setProperty("--pointer-x", `${x.toFixed(2)}px`);
      el.style.setProperty("--pointer-y", `${y.toFixed(2)}px`);
      frame = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.05 ? requestAnimationFrame(tick) : 0;
    };
    const move = (event: globalThis.PointerEvent) => {
      if (!fine.matches || event.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      targetX = Math.max(-5, Math.min(5, (0.5 - (event.clientX - rect.left) / rect.width) * 10));
      targetY = Math.max(-5, Math.min(5, (0.5 - (event.clientY - rect.top) / rect.height) * 10));
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const reset = () => {
      targetX = targetY = 0;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    fine.addEventListener("change", reset);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      fine.removeEventListener("change", reset);
      el.style.removeProperty("--pointer-x");
      el.style.removeProperty("--pointer-y");
    };
  }, [reduced, visible]);

  if (!images.length) return null;

  const finishDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const velocity = performance.now() - start.time < 100 ? start.velocity : 0;
    const throwOffset = -dx / start.pitch - Math.max(-0.45, Math.min(0.45, velocity * 120 / start.pitch));
    // Always return to the loaded image while a requested source is pending.
    settle(current);
    if (!cancelled && Math.abs(dx) > Math.abs(dy) * 1.25 &&
        (Math.abs(dx) >= 48 || (Math.abs(dx) > 8 && Math.abs(throwOffset) > 0.3))) {
      const direction = throwOffset > 0 ? 1 : -1;
      goTo(current + direction, direction);
    } else if (!cancelled && Math.abs(dx) < 8 && Math.abs(dy) < 8 && start.index >= 0) {
      goTo(start.index, Math.sign(start.offset) || 1);
    }
  };

  return (
    <div ref={root} className="media-carousel" role="region" aria-roledescription="carousel"
      aria-label={label} tabIndex={0} data-paused={paused} data-dragging={dragging} data-single={images.length === 1}
      style={{ "--carousel-dwell": `${DWELL_MS}ms`, "--slide-direction": slide.direction } as CSSProperties}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          goTo(current + (event.key === "ArrowRight" ? 1 : -1), event.key === "ArrowRight" ? 1 : -1);
        }
      }}>
      <div className="media-carousel-frame"
        onPointerDown={(event) => {
          if (images.length < 2 || !event.isPrimary || event.button !== 0 || (event.target as Element).closest("button")) return;
          cancelAnimationFrame(settleFrame.current);
          paint(current);
          const card = (event.target as Element).closest<HTMLElement>("[data-image-index]");
          drag.current = {
            id: event.pointerId, x: event.clientX, y: event.clientY,
            lastX: event.clientX, time: performance.now(), velocity: 0,
            pitch: event.currentTarget.clientWidth * 0.74 * 0.64,
            index: card ? Number(card.dataset.imageIndex) : -1,
            offset: card ? coverflowOffset(Number(card.dataset.logicalIndex), current, images.length * 3) : 0,
            horizontal: false,
          };
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || start.id !== event.pointerId) return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (!start.horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.25) {
            start.horizontal = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          if (!start.horizontal) return;
          const now = performance.now();
          start.velocity = (event.clientX - start.lastX) / Math.max(1, now - start.time);
          start.time = now;
          start.lastX = event.clientX;
          const direction = dx < 0 ? 1 : -1;
          const next = (current + direction + images.length) % images.length;
          const limit = loaded.current.has(images[next].src) ? 0.95 : 0.3;
          if (!reduced) paint(current + Math.max(-limit, Math.min(limit, -dx / start.pitch)));
        }}
        onPointerUp={(event) => finishDrag(event)}
        onPointerLeave={(event) => { if (!drag.current?.horizontal) finishDrag(event, true); }}
        onPointerCancel={(event) => finishDrag(event, true)}
        onLostPointerCapture={(event) => finishDrag(event, true)}>
        <div className="carousel-track">
        {[-1, 0, 1].flatMap((copy) => images.map((image, index) => {
          const logical = index + copy * images.length;
          const original = copy === 0;
          return (
          <div key={`${copy}:${index}:${image.src}`} ref={(node) => { cards.current[(copy + 1) * images.length + index] = node; }}
            className={`carousel-slide${original && index === current ? " is-active" : original && index === slide.previous ? " is-outgoing" : ""}`}
            style={coverflowStyle(coverflowOffset(logical, 0, images.length * 3))}
            data-image-index={index} data-logical-index={logical} data-copy={!original}
            role={original ? "group" : undefined} aria-roledescription={original ? "slide" : undefined}
            aria-label={original ? `${index + 1} of ${images.length}` : undefined} aria-hidden={!original || index !== current}>
            <div className="carousel-image-plane">
              <Image src={image.src} alt={original ? image.alt : ""} fill sizes="(min-width: 1024px) 34vw, 74vw"
                priority={priority && original && index === 0}
                loading={priority && original && index === 0 ? undefined : index === current || Math.abs(coverflowOffset(index, current, images.length)) <= 1 || index === requested ? "eager" : "lazy"}
                className="carousel-slide-img" draggable={false}
                onLoad={() => {
                  loaded.current.add(image.src);
                  failed.current.delete(image.src);
                  if (pending.current?.index === index) commit(index, pending.current.direction);
                }}
                onError={() => {
                  failed.current.add(image.src);
                  loaded.current.delete(image.src);
                  if (pending.current?.index === index) {
                    pending.current = null;
                    setRequested(null);
                    setStopped(true);
                  }
                }} />
            </div>
          </div>
        ); }))}
        </div>
        {images.length > 1 && (
          <div className="carousel-controls">
            <button type="button" className="carousel-control" aria-label={`Previous image in ${label}`} onClick={() => goTo(current - 1, -1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m14 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" className="carousel-control" aria-label={`${stopped ? "Play" : "Pause"} slideshow in ${label}`} onClick={() => setStopped(!stopped)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                {stopped ? <path d="m9 5 10 7-10 7Z" strokeLinejoin="round" /> : <path d="M9 6v12M15 6v12" strokeLinecap="round" />}
              </svg>
            </button>
            <button type="button" className="carousel-control" aria-label={`Next image in ${label}`} onClick={() => goTo(current + 1, 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m10 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
      </div>
      <div className="carousel-caption">
        <p>{images[current].alt}</p>
        <span className="data carousel-counter" aria-hidden="true">{String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
      </div>
      {images.length > 1 && (
        <div className="carousel-indicators" aria-label={`Choose image in ${label}`}>
          {images.map((image, index) => (
            <button key={`${index}:${image.src}`} type="button" className="carousel-indicator" aria-label={`Show image ${index + 1} of ${images.length} in ${label}`}
              aria-current={index === current ? "true" : undefined} onClick={() => goTo(index, index > current ? 1 : -1)}>
              <span className="carousel-segment"><span key={index === current ? "active" : "idle"} className={index === current ? "carousel-segment-fill is-active" : "carousel-segment-fill"} /></span>
            </button>
          ))}
        </div>
      )}
      <span className="sr-only" aria-live={focused || stopped || reduced ? "polite" : "off"} aria-atomic="true">{current + 1} of {images.length}: {images[current].alt}</span>
    </div>
  );
}
