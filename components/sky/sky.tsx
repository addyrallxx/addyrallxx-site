"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { Fluid, triangle } from "./fluid";
import { skyFragment, vertex } from "./shaders";

type ModeEvent = CustomEvent<{ mode: "day" | "night" }>;

export function Sky() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const container = host.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let shutdown: (() => void) | undefined;
    let changeMode: ((mode: "day" | "night") => void) | undefined;
    let desired: "day" | "night" = root.dataset.mode === "night" ? "night" : "day";
    const fallback = () => {
      root.dataset.sky = "css";
      root.dataset.mode = desired;
    };
    const start = () => {
      shutdown?.();
      shutdown = undefined;
      changeMode = undefined;
      fallback();
      if (reduced.matches) return;
      let renderer: THREE.WebGLRenderer | undefined;
      let fluid: Fluid | undefined;
      let material: THREE.ShaderMaterial | undefined;
      let geometry: THREE.BufferGeometry | undefined;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" });
        let shaderFailed = false;
        renderer.debug.onShaderError = () => { shaderFailed = true; };
        if (!renderer.extensions.has("EXT_color_buffer_float")) throw new Error("Half-float render targets unavailable");
        renderer.setClearColor(0, 0);
        fluid = new Fluid(renderer);
        geometry = triangle();
        const uniforms = {
          uResolution: { value: new THREE.Vector2() },
          uDye: { value: fluid.dye.read.texture },
          uTime: { value: 0 }, uScroll: { value: window.scrollY },
          uMode: { value: desired === "night" ? 1 : 0 },
          uTarget: { value: desired === "night" ? 1 : 0 },
          uSweep: { value: 0 }, uTransition: { value: 0 },
          uIntro: { value: root.dataset.intro === "done" ? 1 : 0 },
        };
        material = new THREE.ShaderMaterial({
          uniforms, vertexShader: vertex, fragmentShader: skyFragment,
          depthTest: false, depthWrite: false,
        });
        const scene = new THREE.Scene();
        scene.add(new THREE.Mesh(geometry, material));
        const camera = new THREE.Camera();
        const gpu = renderer;
        const simulation = fluid;
        const canvas = renderer.domElement;
        const ticker = () => tick(performance.now());
        let time = 0;
        let last = performance.now();
        let lastFrame = last;
        let paused = document.hidden;
        let disposed = false;
        let sweep: gsap.core.Tween | undefined;
        const progress = { value: 0 };
        let swapped = false;
        let px = -1, py = -1, x = 0, y = 0, dx = 0, dy = 0, speed = 0;
        let width = window.innerWidth, height = window.innerHeight;
        let resolutionScale = 1, frameTotal = 0, budgetStart = last;
        const frameWindow: { at: number; duration: number }[] = [];
        const resize = () => {
          width = window.innerWidth; height = window.innerHeight;
          container.dataset.fluid = coarse.matches || width < 720 ? "off" : "on";
          if (container.dataset.fluid === "off") {
            px = -1; dx = dy = speed = 0;
            for (const buffer of [simulation.dye.read, simulation.dye.write]) { gpu.setRenderTarget(buffer); gpu.clear(); }
            gpu.setRenderTarget(null);
          }
          gpu.setPixelRatio(Math.min(window.devicePixelRatio, coarse.matches ? 1.25 : 1.5) * resolutionScale);
          gpu.setSize(width,height);
          // Screen space remains in CSS pixels so parallax is independent of DPR.
          uniforms.uResolution.value.set(width,height);
        };
        const pointer = (event: PointerEvent) => {
          if (paused || coarse.matches || width < 720 || event.pointerType === "touch") return;
          if (px < 0) { px = event.clientX; py = event.clientY; return; }
          const deltaX = event.clientX-px, deltaY = event.clientY-py;
          const velocity = Math.hypot(deltaX,deltaY);
          px = event.clientX; py = event.clientY;
          if (velocity <= .2) return;
          x = px/width; y = 1-py/height;
          dx += deltaX; dy += deltaY;
          speed = Math.max(speed,velocity);
        };
        // scrollY can synchronously flush pending animated styles and layout.
        const scroll = () => {
          const lenis = window.__lenis;
          uniforms.uScroll.value = lenis?.animatedScroll ?? window.scrollY;
        };
        const intro = () => { uniforms.uIntro.value = 1; };
        const tick = (now: number) => {
          if (disposed || paused) return;
          const duration = now - lastFrame;
          lastFrame = now;
          frameWindow.push({ at: now, duration }); frameTotal += duration;
          while (frameWindow.length > 1 && now - frameWindow[0].at > 2000) frameTotal -= frameWindow.shift()!.duration;
          if (resolutionScale === 1 && now - budgetStart >= 2000 && frameTotal / frameWindow.length > 14) {
            resolutionScale = .75;
            simulation.setResolutionScale(resolutionScale);
            // Stars share the full-screen sky pass, so reduce that pass too.
            resize();
          }
          // Keep the fluid's twenty GPU passes at 60Hz on high-refresh displays.
          if (now - last < 1000 / 60 - .5) return;
          const dt = Math.min((now-last)/1000,1/30);
          last = now; time += dt;
          uniforms.uTime.value = time;
          if (speed > .2) {
            simulation.splat(x,y,dx,dy,speed,desired === "night",width/height);
            dx = 0; dy = 0; speed = 0;
          }
          if (!coarse.matches && width >= 720) simulation.step(dt,desired === "night");
          uniforms.uDye.value = simulation.dye.read.texture;
          gpu.setRenderTarget(null);
          gpu.render(scene,camera);

        };
        const pause = () => {
          gsap.ticker.remove(ticker);
          sweep?.pause();
          px = -1; dx = 0; dy = 0; speed = 0;
        };
        const resume = () => {
          if (paused || disposed) return;
          frameWindow.length = 0; frameTotal = 0;
          last = performance.now();
          lastFrame = last;
          budgetStart = last;
          sweep?.resume();
          gsap.ticker.remove(ticker);
          gsap.ticker.add(ticker);

        };
        const visibility = () => {
          paused = document.hidden;
          if (paused) pause(); else resume();
        };
        // Blur only drops the pointer. Pausing here froze the sky (and any
        // sweep) whenever focus went to another window on a visible screen;
        // document.hidden is the real "nobody can see this" signal.
        const blur = () => { px = -1; dx = 0; dy = 0; speed = 0; };
        const cleanup = () => {
          if (disposed) return;
          disposed = true;
          pause(); sweep?.kill();
          window.removeEventListener("resize",resize);
          coarse.removeEventListener("change",resize);
          window.removeEventListener("pointermove",pointer);
          window.removeEventListener("scroll",scroll);
          window.removeEventListener("intro:done",intro);
          window.removeEventListener("blur",blur);
          document.removeEventListener("visibilitychange",visibility);
          canvas.removeEventListener("webglcontextlost",lost);
          scene.clear();
          simulation.dispose(); geometry!.dispose(); material!.dispose();
          gpu.dispose(); gpu.forceContextLoss();
          canvas.remove();
        };
        const lost = (event: Event) => {
          event.preventDefault();
          changeMode = undefined;
          cleanup();
          fallback();
        };
        changeMode = (mode) => {
          desired = mode;
          const target = mode === "night" ? 1 : 0;
          // Finish the prior direction before reversing an interrupted sweep.
          if (uniforms.uTransition.value) uniforms.uMode.value = uniforms.uTarget.value;
          sweep?.kill();
          uniforms.uTarget.value = target;
          uniforms.uTransition.value = 1;
          progress.value = 0;
          uniforms.uSweep.value = 0;
          swapped = false;
          sweep = gsap.to(progress, {
            value: 1, duration: 1.8, ease: "power4.out",
            onUpdate: () => {
              uniforms.uSweep.value = progress.value;
              if (!swapped && progress.value >= .5) { root.dataset.mode = mode; swapped = true; }
            },
            onComplete: () => {
              uniforms.uMode.value = target; uniforms.uTransition.value = 0;
              root.dataset.mode = mode;
            },
          });
          if (paused) sweep.pause();
        };
        resize();
        // Compile and render once before claiming WebGL owns the mode interface.
        gpu.compile(scene,camera);
        gpu.setRenderTarget(null);
        gpu.render(scene,camera);
        if (shaderFailed) throw new Error("Sky shader compilation failed");
        container.appendChild(canvas);
        root.dataset.sky = "webgl";
        window.addEventListener("resize",resize);
        coarse.addEventListener("change",resize);
        window.addEventListener("pointermove",pointer,{ passive: true });
        window.addEventListener("scroll",scroll,{ passive: true });
        window.addEventListener("intro:done",intro);
        window.addEventListener("blur",blur);
        document.addEventListener("visibilitychange",visibility);
        canvas.addEventListener("webglcontextlost",lost);
        shutdown = cleanup;
        resume();
      } catch {
        changeMode = undefined;
        fluid?.dispose(); geometry?.dispose(); material?.dispose();
        renderer?.dispose(); renderer?.forceContextLoss();
        fallback();
      }
    };
    const mode = (event: Event) => {
      const next = (event as ModeEvent).detail?.mode;
      if (next !== "day" && next !== "night") return;
      desired = next;
      if (changeMode) changeMode(next); else fallback();
    };
    window.addEventListener("sky:mode",mode);
    reduced.addEventListener("change",start);
    start();
    return () => {
      shutdown?.();
      reduced.removeEventListener("change",start);
      window.removeEventListener("sky:mode",mode);
      delete root.dataset.sky;
    };
  }, []);
  return <div className="sky" ref={host} aria-hidden="true" />;
}
