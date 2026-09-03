"use client";

import { useEffect, useRef } from "react";

// Ambient starfield background. Three parallax depth layers, per star
// twinkle, slow horizontal drift, scroll parallax, and rare shooting stars.
// Fades to zero opacity behind the warm #about section. See
// components/ui/starfield.tsx callers for mount site: this component does
// not mount itself.

type Layer = "far" | "mid" | "near";

interface Star {
  layer: Layer;
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
  colour: string;
  phase: number;
  period: number;
  driftDir: 1 | -1;
}

interface ShootingStar {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  start: number;
  duration: number;
  tailLength: number;
}

const LAYER_CONFIG: Record<
  Layer,
  { share: number; radius: [number, number]; opacity: [number, number]; drift: number; scroll: number }
> = {
  // Drift rates were 1.2, 2.4 and 4.0. Codex measured that the near layer at
  // 4 px/s carries its largest, brightest stars 20 pixels in the first five
  // seconds, which contradicts the brief those numbers came with: a visitor
  // should not consciously register the background early. Slowed so the
  // parallax still separates the layers over a scroll without the top layer
  // reading as drift.
  far: { share: 0.55, radius: [0.5, 0.9], opacity: [0.18, 0.38], drift: 0.6, scroll: 0.02 },
  mid: { share: 0.32, radius: [0.8, 1.3], opacity: [0.3, 0.55], drift: 1.4, scroll: 0.05 },
  near: { share: 0.13, radius: [1.2, 1.8], opacity: [0.45, 0.8], drift: 2.4, scroll: 0.1 },
};

const COLOURS: { colour: string; weight: number }[] = [
  { colour: "241, 242, 244", weight: 0.84 },
  { colour: "159, 196, 232", weight: 0.12 },
  { colour: "232, 201, 160", weight: 0.04 },
];

function pickColour(): string {
  const r = Math.random();
  let acc = 0;
  for (const c of COLOURS) {
    acc += c.weight;
    if (r <= acc) return c.colour;
  }
  return COLOURS[0].colour;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function buildStars(width: number, height: number): Star[] {
  const area = width * height;
  // The floor was 90, which is a desktop safety number that over-applies on a
  // phone: 390x844 asks the ratio for 37 stars and the old floor forced 90,
  // making the mobile sky roughly two and a half times denser than the
  // desktop one. A floor of 40 keeps a small viewport from looking empty
  // without turning it into a snowstorm.
  const total = Math.max(40, Math.min(260, Math.round(area / 9000)));
  const stars: Star[] = [];
  (Object.keys(LAYER_CONFIG) as Layer[]).forEach((layer) => {
    const cfg = LAYER_CONFIG[layer];
    const count = Math.round(total * cfg.share);
    for (let i = 0; i < count; i++) {
      stars.push({
        layer,
        x: Math.random() * width,
        y: Math.random() * height,
        radius: lerp(cfg.radius[0], cfg.radius[1], Math.random()),
        baseOpacity: lerp(cfg.opacity[0], cfg.opacity[1], Math.random()),
        colour: pickColour(),
        phase: Math.random() * Math.PI * 2,
        period: lerp(3, 8, Math.random()),
        driftDir: Math.random() < 0.5 ? 1 : -1,
      });
    }
  });
  return stars;
}

function getScrollY(): number {
  const lenis = (window as unknown as { __lenis?: { scroll?: number } }).__lenis;
  if (lenis && typeof lenis.scroll === "number") return lenis.scroll;
  return window.scrollY;
}

function paintStatic(ctx: CanvasRenderingContext2D, stars: Star[], width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  for (const s of stars) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(${s.colour}, ${s.baseOpacity})`;
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function Starfield(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars = buildStars(width, height);
    let raf = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let hidden = document.hidden;
    let shooting: ShootingStar | null = null;
    let faded = false;
    let nextShootingAt = performance.now() + lerp(5000, 14000, Math.random());

    function sizeCanvas() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      // setTransform replaces the current transform rather than compounding
      // onto whatever scale a previous resize already applied.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeCanvas();
        stars = buildStars(width, height);
        if (reducedMotionQuery.matches) paintStatic(ctx!, stars, width, height);
      }, 150);
    }

    function onVisibility() {
      hidden = document.hidden;
      if (!hidden && !reducedMotionQuery.matches && raf === 0) {
        // Reschedule before restarting. performance.now() keeps advancing
        // while the tab is hidden, so a tab backgrounded for longer than the
        // pending interval comes back with now already past nextShootingAt
        // and fires a shooting star on the first frame. That reads as a
        // glitch triggered by switching tabs rather than as something that
        // happened to cross the sky.
        nextShootingAt = performance.now() + lerp(5000, 14000, Math.random());
        raf = requestAnimationFrame(loop);
      }
    }

    function maybeScheduleShootingStar(now: number) {
      if (shooting || now < nextShootingAt) return;
      const angle = lerp(20, 50, Math.random()) * (Math.random() < 0.5 ? 1 : -1);
      const rad = (angle * Math.PI) / 180;
      const goLeftToRight = Math.random() < 0.5;
      const travel = Math.max(width, height) * 0.9;
      const dirX = (goLeftToRight ? 1 : -1) * Math.cos(rad);
      const dirY = Math.sin(Math.abs(rad));
      const x0 = goLeftToRight ? -50 : width + 50;
      const y0 = Math.random() * height * 0.6;
      shooting = {
        x0,
        y0,
        x1: x0 + dirX * travel,
        y1: y0 + dirY * travel,
        start: now,
        duration: lerp(700, 1100, Math.random()),
        tailLength: lerp(60, 140, Math.random()),
      };
    }

    function drawShootingStar(now: number) {
      if (!shooting || !ctx) return;
      const t = (now - shooting.start) / shooting.duration;
      if (t >= 1) {
        shooting = null;
        nextShootingAt = now + lerp(5000, 14000, Math.random());
        return;
      }
      // Was a cubic ease out, which is backwards for this object. Ease out
      // crosses most of the screen instantly and then visibly decelerates,
      // and nothing entering an atmosphere slows down like that. Near linear
      // with a slight acceleration reads as a meteor. The tail fade, not the
      // velocity, is what ends it.
      const eased = t * (0.85 + 0.15 * t);
      const headX = lerp(shooting.x0, shooting.x1, eased);
      const headY = lerp(shooting.y0, shooting.y1, eased);
      const dx = shooting.x1 - shooting.x0;
      const dy = shooting.y1 - shooting.y0;
      const len = Math.hypot(dx, dy) || 1;
      const tailX = headX - (dx / len) * shooting.tailLength;
      const tailY = headY - (dy / len) * shooting.tailLength;
      const fadeIn = Math.min(1, t * 6);
      const fadeOut = 1 - Math.max(0, t - 0.7) / 0.3;
      const alpha = Math.min(fadeIn, fadeOut);

      const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
      gradient.addColorStop(0, "rgba(241, 242, 244, 0)");
      gradient.addColorStop(1, `rgba(200, 224, 245, ${0.9 * alpha})`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = `rgba(241, 242, 244, ${alpha})`;
      ctx.arc(headX, headY, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    function loop(now: number) {
      if (!ctx || hidden) {
        raf = 0;
        return;
      }
      // Skip every draw call while the canvas is fully transparent behind the
      // warm section, but keep the frame callback alive. Painting 144 arcs
      // into something at opacity 0 is pure waste, and it is a meaningful
      // share of a phone battery over a long section. The callback itself
      // costs almost nothing and keeping it means there is no restart path
      // that can get stuck with a dead loop and a visible canvas.
      //
      // Freezing mid fade is invisible: the element is transitioning to zero
      // opacity anyway, so a held frame and a live one look the same.
      if (faded) {
        raf = requestAnimationFrame(loop);
        return;
      }
      ctx.clearRect(0, 0, width, height);
      const scrollY = getScrollY();
      const t = now / 1000;

      for (const s of stars) {
        const cfg = LAYER_CONFIG[s.layer];
        const driftX = ((s.x + t * cfg.drift * s.driftDir) % width + width) % width;
        const parallaxY = scrollY * cfg.scroll;
        const y = ((s.y - parallaxY) % height + height) % height;
        const twinkle = Math.sin((t / s.period) * Math.PI * 2 + s.phase) * 0.25;
        const opacity = Math.max(0, Math.min(1, s.baseOpacity * (1 + twinkle)));

        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.colour}, ${opacity})`;
        ctx.arc(driftX, y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      maybeScheduleShootingStar(now);
      drawShootingStar(now);

      raf = requestAnimationFrame(loop);
    }

    sizeCanvas();

    let observer: IntersectionObserver | undefined;
    const aboutEl = document.getElementById("about");
    if (aboutEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          canvas.style.opacity = entry.isIntersecting ? "0" : "1";
          faded = entry.isIntersecting;
        },
        { rootMargin: "-20% 0px -20% 0px" },
      );
      observer.observe(aboutEl);
    }

    function applyReducedMotionState() {
      if (reducedMotionQuery.matches) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        paintStatic(ctx!, stars, width, height);
      } else if (!hidden && raf === 0) {
        raf = requestAnimationFrame(loop);
      }
    }

    applyReducedMotionState();
    reducedMotionQuery.addEventListener("change", applyReducedMotionState);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (resizeTimer) clearTimeout(resizeTimer);
      reducedMotionQuery.removeEventListener("change", applyReducedMotionState);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        transition: "opacity var(--dur-slow) var(--ease)",
      }}
    />
  );
}
