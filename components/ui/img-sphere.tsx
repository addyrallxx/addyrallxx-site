"use client";

/*
  Adapted from the 21st.dev "Img Sphere" component (tonyzebastian), pulled
  into wiki/resources/21st-components/9464-img-sphere.md. The Fibonacci
  sphere distribution, the rotation matrices, the Z-depth fade and the
  collision pass are real math worth keeping unchanged; this file only
  changes what the vault write up flagged plus what this project needs
  instead of a demo:

  - "use client" added, missing entirely in the pulled source.
  - autoRotate and momentum both gate on prefers-reduced-motion.
  - Vendored SVG artwork is inlined, with no icon network requests.
  - Photos and the click-to-enlarge modal are gone. This sphere carries
    skill icons, not a gallery, and enlarging an SVG logo has no purpose.
    Dropping the modal also drops the only reason the original needed
    lucide-react, which this repo does not have installed.
  - Every icon renders next to a permanent, visible text label (item.name).
    Decorative SVGs are hidden from screen readers to avoid duplicate labels.
    Unknown slugs fall back to initials; null slugs remain full text tiles.
*/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsClient } from "@/components/ui/use-is-client";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";
import { ICONS } from "@/lib/icon-data";

export interface SkillIcon {
  id: string;
  slug: string | null;
  name: string;
}

interface Position3D {
  x: number;
  y: number;
  z: number;
}

interface SphericalPosition {
  theta: number;
  phi: number;
  radius: number;
}

interface WorldPosition extends Position3D {
  scale: number;
  zIndex: number;
  isVisible: boolean;
  fadeOpacity: number;
}

interface RotationState {
  x: number;
  y: number;
  z: number;
}

interface VelocityState {
  x: number;
  y: number;
}

const INITIAL_ROTATION: RotationState = { x: 15, y: 15, z: 0 };

interface ImgSphereProps {
  items: SkillIcon[];
  containerSize?: number;
  sphereRadius?: number;
  dragSensitivity?: number;
  momentumDecay?: number;
  maxRotationSpeed?: number;
  baseImageScale?: number;
  hoverScale?: number;
  perspective?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  className?: string;
}

// Deterministic pseudo-random in [0, 1), seeded by a number. The original
// component reached for Math.random() here to keep the sphere from looking
// too mechanically even; this does the same job but stays a pure function
// of its input, since React's purity rule forbids calling an impure
// function like Math.random() from render (a useMemo callback included) and
// this runs inside one below.
function seededJitter(seed: number): number {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

const SPHERE_MATH = {
  degreesToRadians: (degrees: number): number => degrees * (Math.PI / 180),

  normalizeAngle: (angle: number): number => {
    let a = angle;
    while (a > 180) a -= 360;
    while (a < -180) a += 360;
    return a;
  },
};

export function ImgSphere({
  items,
  containerSize = 420,
  sphereRadius = 170,
  dragSensitivity = 0.45,
  momentumDecay = 0.97,
  maxRotationSpeed = 5,
  baseImageScale = 0.24,
  hoverScale = 1.25,
  perspective = 1000,
  autoRotate = true,
  autoRotateSpeed = 0.12,
  className = "",
}: ImgSphereProps) {
  const isMounted = useIsClient();
  const reducedMotion = usePrefersReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotation = useRef<RotationState>(INITIAL_ROTATION);
  const velocity = useRef<VelocityState>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  const actualRadius = sphereRadius || containerSize * 0.5;
  const baseSize = containerSize * baseImageScale;
  // Reduced motion disables auto-rotate and stops momentum from coasting
  // after a drag; the drag itself stays, since a user-initiated rotation is
  // not the kind of motion that preference is about.
  const effectiveAutoRotate = autoRotate && !reducedMotion;
  const effectiveMomentumDecay = reducedMotion ? 0 : momentumDecay;

  // Fibonacci sphere distribution: even coverage without the poles bunching
  // up. A derived value from items/actualRadius, not state to synchronise:
  // useMemo instead of the original's useEffect+useState. Seeded jitter
  // gives SSR and hydration the same visible icons without a mount gate.
  const positions = useMemo<SphericalPosition[]>(() => {
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = (2 * Math.PI) / goldenRatio;
    return items.map((_, i) => {
      const t = i / items.length;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;
      let phi = inclination * (180 / Math.PI);
      let theta = (azimuth * (180 / Math.PI)) % 360;
      const poleBonus = Math.pow(Math.abs(phi - 90) / 90, 0.6) * 35;
      phi = phi < 90 ? Math.max(5, phi - poleBonus) : Math.min(175, phi + poleBonus);
      phi = 15 + (phi / 180) * 150;
      const jitter = (seededJitter(i * 12.9898 + 1) - 0.5) * 20;
      theta = (theta + jitter) % 360;
      phi = Math.max(0, Math.min(180, phi + (seededJitter(i * 78.233 + 2) - 0.5) * 10));
      return { theta, phi, radius: actualRadius };
    });
  }, [items, actualRadius]);

  const clampSpeed = useCallback(
    (speed: number) => Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, speed)),
    [maxRotationSpeed]
  );

  const worldPositions = useCallback((currentRotation: RotationState): WorldPosition[] => {
    const raw = positions.map((pos) => {
      const thetaRad = SPHERE_MATH.degreesToRadians(pos.theta);
      const phiRad = SPHERE_MATH.degreesToRadians(pos.phi);
      const rotXRad = SPHERE_MATH.degreesToRadians(currentRotation.x);
      const rotYRad = SPHERE_MATH.degreesToRadians(currentRotation.y);

      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad);
      let y = pos.radius * Math.cos(phiRad);
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad);

      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad);
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad);
      x = x1;
      z = z1;

      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad);
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad);
      y = y2;
      z = z2;

      const fadeStart = -10;
      const fadeEnd = -30;
      const isVisible = z > fadeEnd;
      const fadeOpacity = z <= fadeStart ? Math.max(0, (z - fadeEnd) / (fadeStart - fadeEnd)) : 1;

      const distanceFromCenter = Math.sqrt(x * x + y * y);
      const distanceRatio = Math.min(distanceFromCenter / actualRadius, 1);
      const centerScale = Math.max(0.3, 1 - distanceRatio * 0.6);
      const depthScale = (z + actualRadius) / (2 * actualRadius);
      const scale = centerScale * Math.max(0.5, 0.8 + depthScale * 0.3);

      return { x, y, z, scale, zIndex: Math.round(1000 + z), isVisible, fadeOpacity };
    });

    // Collision pass: nudge overlapping icons apart by shrinking them.
    // O(n^2) over the visible set. Fine at 14 items; would need spatial
    // partitioning well before it got to the original demo's 60.
    const adjusted = [...raw];
    for (let i = 0; i < adjusted.length; i++) {
      const a = adjusted[i];
      if (!a.isVisible) continue;
      let scale = a.scale;
      const sizeA = baseSize * scale;
      for (let j = 0; j < adjusted.length; j++) {
        if (i === j) continue;
        const b = adjusted[j];
        if (!b.isVisible) continue;
        const sizeB = baseSize * b.scale;
        const dist = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        const minDist = (sizeA + sizeB) / 2 + 25;
        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const reduction = Math.max(0.4, 1 - (overlap / minDist) * 0.6);
          scale = Math.min(scale, scale * reduction);
        }
      }
      adjusted[i] = { ...a, scale: Math.max(0.25, scale) };
    }
    return adjusted;
  }, [positions, actualRadius, baseSize]);

  const applyWorldPositions = useCallback(
    (isMoving: boolean) => {
      const nextWorld = worldPositions(rotation.current);
      const nextStyles = nextWorld.map((position) => ({
        transform: `translate3d(${position.x.toFixed(2)}px, ${position.y.toFixed(2)}px, 0) translate3d(-50%, -50%, 0) scale(${position.scale.toFixed(2)})`,
        opacity: position.fadeOpacity.toFixed(2),
        visibility: position.isVisible ? "visible" : "hidden",
        zIndex: String(position.zIndex),
      }));

      nextStyles.forEach((style, index) => {
        const tile = tileRefs.current[index];
        if (!tile) return;
        tile.style.transform = style.transform;
        tile.style.opacity = style.opacity;
        tile.style.visibility = style.visibility;
        tile.style.zIndex = style.zIndex;
        tile.style.willChange = isMoving ? "transform" : "";
      });
    },
    [worldPositions]
  );

  const hasMomentum = useCallback(
    () => Math.abs(velocity.current.x) >= 0.01 || Math.abs(velocity.current.y) >= 0.01,
    []
  );

  const updateMomentum = useCallback(() => {
    if (isDraggingRef.current) return;
    const nextVelocity = {
      x: velocity.current.x * effectiveMomentumDecay,
      y: velocity.current.y * effectiveMomentumDecay,
    };
    velocity.current = {
      x: Math.abs(nextVelocity.x) < 0.01 ? 0 : nextVelocity.x,
      y: Math.abs(nextVelocity.y) < 0.01 ? 0 : nextVelocity.y,
    };
    rotation.current = {
      x: SPHERE_MATH.normalizeAngle(rotation.current.x + clampSpeed(velocity.current.x)),
      y: SPHERE_MATH.normalizeAngle(
        rotation.current.y + clampSpeed(velocity.current.y) + (effectiveAutoRotate ? autoRotateSpeed : 0)
      ),
      z: rotation.current.z,
    };
  }, [effectiveMomentumDecay, clampSpeed, effectiveAutoRotate, autoRotateSpeed]);

  const onPointerDelta = useCallback(
    (dx: number, dy: number) => {
      const delta = { x: -dy * dragSensitivity, y: dx * dragSensitivity };
      rotation.current = {
        x: SPHERE_MATH.normalizeAngle(rotation.current.x + clampSpeed(delta.x)),
        y: SPHERE_MATH.normalizeAngle(rotation.current.y + clampSpeed(delta.y)),
        z: rotation.current.z,
      };
      velocity.current = { x: clampSpeed(delta.x), y: clampSpeed(delta.y) };
    },
    [dragSensitivity, clampSpeed]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    velocity.current = { x: 0, y: 0 };
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      onPointerDelta(e.clientX - lastPointer.current.x, e.clientY - lastPointer.current.y);
      lastPointer.current = { x: e.clientX, y: e.clientY };
    },
    [isDragging, onPointerDelta]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    isDraggingRef.current = true;
    setIsDragging(true);
    velocity.current = { x: 0, y: 0 };
    lastPointer.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      onPointerDelta(touch.clientX - lastPointer.current.x, touch.clientY - lastPointer.current.y);
      lastPointer.current = { x: touch.clientX, y: touch.clientY };
    },
    [isDragging, onPointerDelta]
  );

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    /*
      Only run a frame loop when there is something for it to advance.

      This used to reschedule unconditionally for as long as the component was
      mounted. Under prefers-reduced-motion that meant roughly sixty wasted
      callbacks a second forever: auto rotation is already disabled, a settled
      velocity is exactly zero, so updateMomentum ran and changed nothing while
      still holding the main thread and the device awake. It was measured at
      482 requestAnimationFrame calls in one second across the page, and the
      sphere was the bulk of it.

      The three states that genuinely need a frame are auto rotation, an
      in-progress drag, and momentum still decaying after one. updateMomentum
      snaps velocity to exactly zero once a coast falls below its threshold,
      which re-runs this effect and lets the loop stop on its own.
    */
    const needsFrame = () => effectiveAutoRotate || isDraggingRef.current || hasMomentum();
    if (!needsFrame()) {
      applyWorldPositions(false);
      return;
    }

    const animate = () => {
      updateMomentum();
      const isMoving = needsFrame();
      applyWorldPositions(isMoving);
      frame.current = isMoving ? requestAnimationFrame(animate) : null;
    };
    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [
    isMounted,
    updateMomentum,
    effectiveAutoRotate,
    isDragging,
    hasMomentum,
    applyWorldPositions,
  ]);

  useEffect(() => {
    if (!isMounted) return;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMounted, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const initialWorld = worldPositions(INITIAL_ROTATION);

  return (
    <div
      ref={containerRef}
      data-sphere
      className={`relative select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"} ${className}`}
      style={{ width: containerSize, height: containerSize, perspective: `${perspective}px` }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/*
        Static wireframe, not tied to the drag rotation. A geodesic sphere
        that actually turns needs true per-ring 3D transforms; a flat SVG
        spun with a single CSS rotate would just distort out of sync with
        the icons' own math above. Latitude and longitude rings drawn once,
        at a fixed tilt, are enough for the shape to read as a sphere behind
        the icons rather than syncing motion with them.
      */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0.18 }}
      >
        <g fill="none" stroke="var(--accent)" strokeWidth="0.6">
          <circle cx="100" cy="100" r="90" />
          <ellipse cx="100" cy="100" rx="90" ry="55" />
          <ellipse cx="100" cy="100" rx="90" ry="22" />
          <ellipse cx="100" cy="100" rx="55" ry="90" />
          <ellipse cx="100" cy="100" rx="22" ry="90" />
        </g>
      </svg>

      <div className="relative h-full w-full" style={{ zIndex: 10 }}>
        {items.map((item, index) => {
          const pos = initialWorld[index];
          if (!pos) return null;
          const size = baseSize;
          const isHovered = hovered === item.id;
          const entry = item.slug && Object.hasOwn(ICONS, item.slug) ? ICONS[item.slug] : undefined;
          // A null slug (Codex, LLMs, RAG) has no logo to fetch at all: no
          // OpenAI mark exists post-trademark-removal, and the other two are
          // categories, not products. Render the full name as a text tile
          // instead of ever hitting the network for it.
          const isTextTile = item.slug === null;
          const tileFontSize = Math.min(size * 0.26, (size * 0.85) / Math.max(item.name.length * 0.58, 1));

          return (
            <div
              key={item.id}
              data-sphere-item
              ref={(element) => {
                tileRefs.current[index] = element;
              }}
              className="absolute flex flex-col items-center gap-[var(--space-1)]"
              style={{
                left: "50%",
                top: "50%",
                opacity: pos.fadeOpacity.toFixed(2),
                transform: `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0) translate3d(-50%, -50%, 0) scale(${pos.scale.toFixed(2)})`,
                zIndex: pos.zIndex,
                visibility: pos.isVisible ? "visible" : "hidden",
              }}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="transition-transform duration-200 ease-out"
                style={{ transform: `scale(${isHovered ? hoverScale : 1})` }}
              >
                <div
                  className="flex items-center justify-center overflow-hidden rounded-full border border-hairline bg-surface-1 p-[var(--space-2)]"
                  style={{ width: size, height: size }}
                >
                {isTextTile ? (
                  // Deliberate text tile, same circular surface as every
                  // image tile, full name (not one letter, that would read
                  // as a failure state rather than a choice) in the mono
                  // face used for data elsewhere on this site.
                  <span
                    aria-hidden="true"
                    className="font-mono text-ink-muted"
                    style={{ fontSize: Math.round(tileFontSize) }}
                  >
                    {item.name}
                  </span>
                ) : !entry ? (
                  // A missing icon degrades to the first letter of its name,
                  // not to an empty ring. Failing open is a rule on this
                  // project: a hidden element over correct markup reads as a
                  // broken build, and there is no way for a visitor to tell
                  // the difference.
                  <span
                    aria-hidden="true"
                    className="font-display text-ink-muted"
                    style={{ fontSize: Math.round(size * 0.42) }}
                  >
                    {item.name.charAt(0)}
                  </span>
                ) : (
                  // Trusted generated markup from our vendored MIT Simple
                  // Icons, never user input. The generated group keeps brand fills.
                  <svg
                    viewBox={entry.viewBox}
                    aria-hidden="true"
                    focusable="false"
                    className="h-full w-full"
                    dangerouslySetInnerHTML={{ __html: entry.path }}
                  />
                )}
                </div>
              </div>
              <span className="data whitespace-nowrap text-ink-subtle">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
