"use client";

import { useEffect, useRef, useState } from "react";
import "./hero-object.css";

type Three = typeof import("three");

export function HeroObject(): React.JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [three, setThree] = useState<Three | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    let generation = 0;
    let disposed = false;
    const load = () => {
      if (disposed) return;
      const current = ++generation;
      if (!desktop.matches) {
        setThree(null);
        return;
      }
      void import("three").then(
        (module) => {
          if (current === generation) setThree(module);
        },
        () => {
          if (current === generation) setFailed(true);
        },
      );
    };
    // Defer the initial state update, including the narrow viewport branch.
    queueMicrotask(load);
    desktop.addEventListener("change", load);
    return () => {
      disposed = true;
      generation++;
      desktop.removeEventListener("change", load);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!three || !canvas || !parent || failed) return;

    let cancelled = false;
    let dispose = () => {};
    // Keep initialization failures asynchronous and outside React's render.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      let renderer: InstanceType<Three["WebGLRenderer"]> | undefined;
      const geometries: InstanceType<Three["BufferGeometry"]>[] = [];
      const materials: InstanceType<Three["LineBasicMaterial"]>[] = [];
      const removeListeners: (() => void)[] = [];
      let frame = 0;
      let previousTime = 0;
      let dead = false;

      const stop = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      };
      dispose = () => {
        if (dead) return;
        dead = true;
        stop();
        canvas.style.opacity = "0";
        removeListeners.forEach((remove) => remove());
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
        renderer?.dispose();
        renderer?.forceContextLoss();
      };
      const failOpen = () => {
        dispose();
        if (!cancelled) setFailed(true);
      };

      try {
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const coarse = window.matchMedia("(pointer: coarse)");
        renderer = new three.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          depth: false,
          stencil: false,
          powerPreference: "low-power",
          failIfMajorPerformanceCaveat: true,
        });
        renderer.setClearColor(0x000000, 0);
        const scene = new three.Scene();
        const camera = new three.OrthographicCamera(-2, 2, 2, -2, 0.1, 20);
        camera.position.z = 6;
        const lean = new three.Group();
        const rotor = new three.Group();
        lean.rotation.set(0.23, -0.48, -0.16);
        lean.add(rotor);
        scene.add(lean);

        const tokens = getComputedStyle(document.documentElement);
        const ink = new three.Color(tokens.getPropertyValue("--ink").trim() || "#f1f2f4");
        const accent = new three.Color(tokens.getPropertyValue("--accent").trim() || "#e5484d");
        const edges: number[] = [];
        const rim: number[] = [];
        const segment = (out: number[], r1: number, a1: number, z1: number, r2: number, a2: number, z2: number) => {
          out.push(r1 * Math.cos(a1), r1 * Math.sin(a1), z1,
            r2 * Math.cos(a2), r2 * Math.sin(a2), z2);
        };
        const ring = (radius: number, z: number) => {
          for (let i = 0; i < 96; i++) {
            segment(edges, radius, i * Math.PI / 48, z, radius, (i + 1) * Math.PI / 48, z);
          }
        };
        // A single vented rotor: two disc faces, raised hub and sparse vanes.
        for (const z of [-0.11, 0.11]) {
          for (const radius of [0.55, 1.24, 1.4]) ring(radius, z);
        }
        ring(0.32, 0.25);
        ring(0.49, 0.25);
        for (let i = 0; i < 24; i++) {
          const angle = i * Math.PI / 12;
          segment(edges, 1.4, angle, -0.11, 1.4, angle, 0.11);
          segment(edges, 0.55, angle, -0.11, 1.24, angle + 0.11, -0.11);
          segment(edges, 0.55, angle, 0.11, 1.24, angle + 0.11, 0.11);
          if (i % 4 === 0) segment(edges, 0.49, angle, 0.25, 0.55, angle, 0.11);
        }
        for (let hole = 0; hole < 5; hole++) {
          const angle = hole * Math.PI * 2 / 5;
          const x = 0.405 * Math.cos(angle);
          const y = 0.405 * Math.sin(angle);
          for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6;
            const b = (i + 1) * Math.PI / 6;
            edges.push(x + 0.035 * Math.cos(a), y + 0.035 * Math.sin(a), 0.25,
              x + 0.035 * Math.cos(b), y + 0.035 * Math.sin(b), 0.25);
          }
        }
        for (let i = 0; i < 24; i++) {
          segment(rim, 1.4, 0.5 + i * 0.04, 0.112, 1.4, 0.5 + (i + 1) * 0.04, 0.112);
        }
        for (const [positions, color, opacity] of [[edges, ink, 0.14], [rim, accent, 0.3]] as const) {
          const geometry = new three.BufferGeometry();
          geometries.push(geometry);
          geometry.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
          const material = new three.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, depthTest: false });
          materials.push(material);
          rotor.add(new three.LineSegments(geometry, material));
        }

        let visible = false;
        let sized = false;
        let ratio = 0;
        let pointerX = 0;
        let pointerY = 0;
        let tiltX = 0;
        let tiltY = 0;
        let spin = 0;
        const canRender = () => !dead && sized && visible && ratio > 0 && !document.hidden && window.innerWidth >= 768;
        const draw = (time: number) => {
          frame = 0;
          if (!canRender()) return;
          const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
          previousTime = time;
          if (!motion.matches) {
            spin += dt * 0.006;
            const damping = 1 - Math.exp(-dt * 3);
            tiltX += (pointerY * 0.045 - tiltX) * damping;
            tiltY += (pointerX * 0.06 - tiltY) * damping;
          }
          lean.rotation.x = 0.23 + (motion.matches ? 0 : tiltX);
          lean.rotation.y = -0.48 + (motion.matches ? 0 : tiltY);
          rotor.rotation.z = motion.matches ? 0 : spin;
          lean.position.y = motion.matches ? 0 : (1 - ratio) * 0.3;
          try {
            renderer!.render(scene, camera);
            canvas.style.opacity = String(ratio * ratio);
          } catch {
            failOpen();
            return;
          }
          if (!motion.matches) frame = requestAnimationFrame(draw);
        };
        const wake = () => {
          if (!canRender()) {
            stop();
            canvas.style.opacity = "0";
          } else if (!frame) {
            if (motion.matches) draw(performance.now());
            else frame = requestAnimationFrame(draw);
          }
        };
        const resize = () => {
          if (dead) return;
          const { width, height } = canvas.getBoundingClientRect();
          sized = width > 0 && height > 0 && window.innerWidth >= 768;
          if (sized) {
            const aspect = width / height;
            const halfHeight = 1.95 / Math.min(aspect, 1);
            camera.left = -halfHeight * aspect;
            camera.right = halfHeight * aspect;
            camera.top = halfHeight;
            camera.bottom = -halfHeight;
            camera.updateProjectionMatrix();
            renderer!.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse.matches ? 1.5 : 2));
            renderer!.setSize(width, height, false);
          }
          wake();
        };
        const hero = canvas.closest("section") || parent;
        const observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.target === canvas) visible = entry.isIntersecting && entry.intersectionRatio > 0;
            if (entry.target === hero) ratio = entry.intersectionRatio;
          }
          wake();
        }, { threshold: Array.from({ length: 101 }, (_, i) => i / 100) });
        observer.observe(canvas);
        observer.observe(hero);
        removeListeners.push(() => observer.disconnect());
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(parent);
        removeListeners.push(() => resizeObserver.disconnect());
        const pointer = (event: PointerEvent) => {
          if (!canRender() || motion.matches || coarse.matches) return;
          pointerX = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
          pointerY = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
        };
        const resetPointer = () => { pointerX = 0; pointerY = 0; };
        const changeMotion = () => { stop(); wake(); };
        canvas.addEventListener("webglcontextlost", failOpen);
        window.addEventListener("pointermove", pointer, { passive: true });
        window.addEventListener("blur", resetPointer);
        window.addEventListener("resize", resize, { passive: true });
        document.addEventListener("visibilitychange", wake);
        motion.addEventListener("change", changeMotion);
        coarse.addEventListener("change", resize);
        removeListeners.push(() => {
          canvas.removeEventListener("webglcontextlost", failOpen);
          window.removeEventListener("pointermove", pointer);
          window.removeEventListener("blur", resetPointer);
          window.removeEventListener("resize", resize);
          document.removeEventListener("visibilitychange", wake);
          motion.removeEventListener("change", changeMotion);
          coarse.removeEventListener("change", resize);
        });
        resize();
      } catch {
        failOpen();
      }
    });
    return () => {
      cancelled = true;
      dispose();
      // React removes its canvas on failure, breakpoint changes and unmount.
    };
  }, [three, failed]);

  if (!three || failed) return null;
  return <canvas ref={canvasRef} className="hero-object" aria-hidden="true" />;
}
