"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const NEAR = 0.65;
const FAR = 3.4;
const CELL = 160;
const CELL_CAPACITY = 6;
// Near-white dominates. The rare warm stars never read as saturated red.
const COLOURS = ["241, 243, 247", "211, 228, 250", "247, 230, 199", "235, 197, 183"];
const random = (min: number, max: number) => min + Math.random() * (max - min);

interface Star {
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
  brightness: number;
  radius: number;
  opacity: number;
  colour: number;
  phase: number;
  frequency: number;
  glow: boolean;
}

interface Meteor {
  x: number;
  y: number;
  dx: number;
  dy: number;
  bend: number;
  start: number;
  duration: number;
  tail: number;
  bright: boolean;
  colour: number;
}

function buildStars(count: number, width: number, height: number): Star[] {
  const focal = Math.min(width, height) * 0.8;
  const stars = Array.from({ length: count }, (_, index): Star => {
    const colourRoll = Math.random();
    const intensity = Math.random();
    const z = random(NEAR, FAR);
    return {
      x: random(-0.5, 0.5) * width / focal * z,
      y: random(-0.5, 0.5) * height / focal * z,
      z,
      screenX: 0,
      screenY: 0,
      brightness: 0,
      radius: 0.65 + intensity * 0.3,
      opacity: 0.55 + intensity * 0.3,
      colour: colourRoll < 0.8 ? 0 : colourRoll < 0.94 ? 1 : colourRoll < 0.99 ? 2 : 3,
      phase: Math.random() * TAU,
      frequency: TAU / random(4, 10),
      glow: index % 20 === 0,
    };
  });
  return stars;
}

function makeGlow(colour: string): HTMLCanvasElement {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 64;
  const context = sprite.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, `rgba(${colour}, 0.7)`);
    gradient.addColorStop(0.12, `rgba(${colour}, 0.28)`);
    gradient.addColorStop(0.4, `rgba(${colour}, 0.07)`);
    gradient.addColorStop(1, `rgba(${colour}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  return sprite;
}

export function Starfield(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const glows = COLOURS.map(makeGlow);
    const fills = COLOURS.map((colour) => `rgb(${colour})`);
    const warmSections = new Set<Element>();
    let width = Math.max(1, window.innerWidth);
    let height = Math.max(1, window.innerHeight);
    let focal = Math.min(width, height) * 0.8;
    // Fixed pool accommodates screen rotation/resizing. Only the area-based
    // prefix is painted; a small viewport has no minimum star count.
    const extent = Math.max(width, height, window.screen.width, window.screen.height);
    const stars = buildStars(Math.round(extent * extent / 9000), width, height);
    let count = 0;
    let columns = 0;
    let rows = 0;
    let cells = new Int32Array(0);
    let cellSizes = new Uint8Array(0);
    let lineBudget = 12;
    let frameCost = 0;
    let previousScroll = window.scrollY;
    let cameraY = 0;
    let raf = 0;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let inView = true;
    let elapsed = 0;
    let lastFrame = 0;
    let meteor: Meteor | null = null;
    let nextMeteor = random(5000, 14000);
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    function drawMeteor() {
      if (!ctx) return;
      if (!meteor && elapsed >= nextMeteor) {
        const angle = random(18, 42) * Math.PI / 180;
        const direction = Math.random() < 0.5 ? -1 : 1;
        const distance = Math.max(width, height) * random(0.6, 0.95);
        const bright = Math.random() < 1 / 6;
        meteor = {
          x: direction === 1 ? -24 : width + 24,
          y: random(0.04, 0.45) * height,
          dx: direction * Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          bend: random(-0.035, 0.035) * distance,
          start: elapsed,
          duration: random(650, 1000),
          tail: Math.min(random(85, 175), distance * 0.3) / distance,
          bright,
          colour: bright ? (Math.random() < 0.65 ? 1 : 2) : 0,
        };
      }
      if (!meteor) return;
      const age = elapsed - meteor.start;
      const persistence = 240;
      if (age > meteor.duration + persistence) {
        meteor = null;
        nextMeteor = elapsed + random(5000, 14000);
        return;
      }
      const t = Math.min(1, age / meteor.duration);
      // Fast entry with slight acceleration. Only the tail grows with ease-in.
      const head = t * (0.9 + 0.1 * t);
      const tailGrowth = Math.min(1, t / 0.18) ** 2;
      const tail = Math.max(0, head - meteor.tail * tailGrowth);
      const afterglow = Math.max(0, (age - meteor.duration) / persistence);
      const alpha = Math.min(1, t / 0.045) * (1 - 0.7 * t * t) * (1 - afterglow) ** 2;
      const pointX = (p: number) => meteor!.x + meteor!.dx * p;
      const pointY = (p: number) => meteor!.y + meteor!.dy * p + meteor!.bend * p * (1 - p);
      const headX = pointX(head);
      const headY = pointY(head);
      const colour = COLOURS[meteor.colour];
      const gradient = ctx.createLinearGradient(pointX(tail), pointY(tail), headX, headY);
      gradient.addColorStop(0, `rgba(${colour}, 0)`);
      gradient.addColorStop(0.4, `rgba(${colour}, 0.1)`);
      gradient.addColorStop(1, `rgba(${colour}, 0.7)`);
      ctx.globalAlpha = alpha * (meteor.bright ? 0.95 : 0.7);
      ctx.strokeStyle = gradient;
      ctx.lineCap = "round";
      // Eight adjoining quadratic segments give the gradient streak a taper.
      for (let i = 0; i < 8; i++) {
        const a = tail + (head - tail) * i / 8;
        const b = tail + (head - tail) * (i + 1) / 8;
        const step = (b - a) / 2;
        ctx.lineWidth = (meteor.bright ? 2 : 1.3) * (0.15 + 0.85 * (i + 1) / 8);
        ctx.beginPath();
        ctx.moveTo(pointX(a), pointY(a));
        ctx.quadraticCurveTo(
          pointX(a) + meteor.dx * step,
          pointY(a) + (meteor.dy + meteor.bend * (1 - 2 * a)) * step,
          pointX(b), pointY(b),
        );
        ctx.stroke();
      }
      const glowSize = meteor.bright ? 24 : 13;
      ctx.drawImage(glows[meteor.colour], headX - glowSize / 2, headY - glowSize / 2, glowSize, glowSize);
      ctx.fillStyle = fills[0];
      ctx.beginPath();
      ctx.arc(headX, headY, meteor.bright ? 1.6 : 1.05, 0, TAU);
      ctx.fill();
    }

    // 23960's proximity technique, with bounded cells instead of all pairs.
    // Each bright star tests at most 9 * 6 candidates, even if all cluster.
    function drawConstellations() {
      if (!ctx || !lineBudget) return;
      let lines = 0;
      ctx.strokeStyle = fills[0];
      ctx.lineWidth = 0.6;
      for (let i = 0; i < count && lines < lineBudget; i++) {
        const star = stars[i];
        if (star.brightness < 0.3) continue;
        const col = Math.floor(star.screenX / CELL);
        const row = Math.floor(star.screenY / CELL);
        let nearest = -1;
        let distance = CELL * CELL;
        for (let y = Math.max(0, row - 1); y <= Math.min(rows - 1, row + 1); y++) {
          for (let x = Math.max(0, col - 1); x <= Math.min(columns - 1, col + 1); x++) {
            const cell = y * columns + x;
            for (let slot = 0; slot < cellSizes[cell]; slot++) {
              const j = cells[cell * CELL_CAPACITY + slot];
              if (j === i) continue;
              const other = stars[j];
              const dx = star.screenX - other.screenX;
              const dy = star.screenY - other.screenY;
              const d = dx * dx + dy * dy;
              if (d < distance) { distance = d; nearest = j; }
            }
          }
        }
        // One nearest link per star. Suppress reciprocal duplicates.
        if (nearest <= i) continue;
        const other = stars[nearest];
        const brightness = Math.min(star.brightness, other.brightness);
        ctx.globalAlpha = 0.07 * (1 - Math.sqrt(distance) / CELL) * Math.min(1, (brightness - 0.3) / 0.18);
        ctx.beginPath();
        ctx.moveTo(star.screenX, star.screenY);
        ctx.lineTo(other.screenX, other.screenY);
        ctx.stroke();
        lines++;
      }
    }

    function paint(staticFrame = false, advance = 0) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const time = staticFrame ? 0 : elapsed / 1000;
      cellSizes.fill(0);
      for (let i = 0; i < count; i++) {
        const star = stars[i];
        star.z -= advance;
        if (star.z <= NEAR) {
          star.z += FAR - NEAR;
          star.x = random(-0.5, 0.5) * width / focal * FAR;
          star.y = random(-0.5, 0.5) * height / focal * FAR;
        }
        const inverseZ = 1 / star.z;
        const x = width / 2 + (star.x - (staticFrame ? 0 : pointerX * 0.012)) * inverseZ * focal;
        const y = height / 2 + (star.y - (staticFrame ? 0 : cameraY + pointerY * 0.012)) * inverseZ * focal;
        const radius = Math.min(1.7, star.radius * inverseZ);
        const fade = Math.min(1, (star.z - NEAR) / 0.16, (FAR - star.z) / 0.2);
        star.screenX = x;
        star.screenY = y;
        star.brightness = 0;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        star.brightness = Math.min(0.7, star.opacity * inverseZ) * fade *
          (staticFrame ? 1 : 1 + Math.sin(time * star.frequency + star.phase) * 0.18);
        ctx.globalAlpha = star.brightness;
        if (star.brightness >= 0.3 && lineBudget) {
          const cell = Math.floor(y / CELL) * columns + Math.floor(x / CELL);
          const size = cellSizes[cell];
          if (size < CELL_CAPACITY) {
            cells[cell * CELL_CAPACITY + size] = i;
            cellSizes[cell]++;
          }
        }
        if (star.glow) {
          const size = radius * 11;
          ctx.drawImage(glows[star.colour], x - size / 2, y - size / 2, size, size);
        }
        ctx.fillStyle = fills[star.colour];
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, TAU);
        ctx.fill();
      }
      drawConstellations();
      if (!staticFrame) drawMeteor();
      ctx.globalAlpha = 1;
    }

    function loop(now: number) {
      raf = 0;
      const delta = lastFrame ? Math.min(now - lastFrame, 50) : 0;
      lastFrame = now;
      elapsed += delta;
      const damping = 1 - Math.exp(-delta / 240);
      pointerX += (targetX - pointerX) * damping;
      pointerY += (targetY - pointerY) * damping;
      // Read Lenis's applied position in our existing frame, never intercept scroll.
      const scroll = window.scrollY;
      const travel = Math.min(0.008, Math.abs(scroll - previousScroll) * 0.000018);
      previousScroll = scroll;
      cameraY += (Math.tanh(scroll / (height * 3)) * 0.28 - cameraY) * damping;
      const started = performance.now();
      paint(false, delta / 1000 * 0.008 + travel);
      frameCost += (performance.now() - started - frameCost) * 0.05;
      // Sacrifice lines first, never the star density, on a busy main thread.
      if (frameCost > 2 && lineBudget > 0) { lineBudget--; frameCost = 0; }
      raf = requestAnimationFrame(loop);
    }

    function syncPlayback() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastFrame = 0;
      previousScroll = window.scrollY;
      meteor = null;
      nextMeteor = elapsed + random(5000, 14000);
      if (reducedMotion.matches) {
        pointerX = pointerY = targetX = targetY = 0;
        paint(true);
      } else if (!document.hidden && inView && warmSections.size === 0) {
        raf = requestAnimationFrame(loop);
      }
    }

    function sizeCanvas() {
      if (!canvas || !ctx) return;
      const oldWidth = width;
      const oldHeight = height;
      const oldFocal = focal;
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      focal = Math.min(width, height) * 0.8;
      for (const star of stars) {
        star.x *= width / oldWidth * oldFocal / focal;
        star.y *= height / oldHeight * oldFocal / focal;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = Math.min(stars.length, Math.round(width * height / 9000));
      columns = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      cellSizes = new Uint8Array(columns * rows);
      cells = new Int32Array(columns * rows * CELL_CAPACITY);
      lineBudget = 12;
      frameCost = 0;
      if (!reducedMotion.matches) paint(true);
      syncPlayback();
    }

    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sizeCanvas, 150);
    }

    function resetPointer() { targetX = targetY = 0; }
    function onPointer(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !finePointer.matches || reducedMotion.matches) return;
      const x = event.clientX / width * 2 - 1;
      const y = event.clientY / height * 2 - 1;
      const magnitude = Math.max(1, Math.hypot(x, y));
      targetX = x / magnitude;
      targetY = y / magnitude;
    }

    // Match Cosmos. The inset observation band keeps adjacent dark sky visible.
    let warmObserver: IntersectionObserver | undefined;
    let viewportObserver: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      warmObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) warmSections.add(entry.target);
          else warmSections.delete(entry.target);
        }
        canvas.style.opacity = warmSections.size ? "0" : "1";
        syncPlayback();
      }, { rootMargin: "-20% 0px -20% 0px" });
      document.querySelectorAll('[data-tone="warm"]').forEach((section) => warmObserver!.observe(section));
      viewportObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        syncPlayback();
      });
      viewportObserver.observe(canvas);
    }

    sizeCanvas();
    reducedMotion.addEventListener("change", syncPlayback);
    finePointer.addEventListener("change", resetPointer);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", syncPlayback);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      warmObserver?.disconnect();
      viewportObserver?.disconnect();
      reducedMotion.removeEventListener("change", syncPlayback);
      finePointer.removeEventListener("change", resetPointer);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", syncPlayback);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="space-starfield"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}
