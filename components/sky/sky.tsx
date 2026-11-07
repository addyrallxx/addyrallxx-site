"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { skyFragment, vertex } from "./shaders";

export function Sky() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const container = host.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let occluded = false;
    const occlusion = (event: Event) => { occluded = Boolean((event as CustomEvent<boolean>).detail); };
    window.addEventListener("sky:occluded", occlusion);
    let shutdown: (() => void) | undefined;
    const start = () => {
      shutdown?.();
      shutdown = undefined;
      root.dataset.sky = "css";
      if (reduced.matches) return;
      let renderer: THREE.WebGLRenderer | undefined;
      let geometry: THREE.BufferGeometry | undefined;
      let material: THREE.ShaderMaterial | undefined;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" });
        let shaderFailed = false;
        renderer.debug.onShaderError = () => { shaderFailed = true; };
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1,-1,0, 3,-1,0, -1,3,0], 3));
        const uniforms = {
          uResolution: { value: new THREE.Vector2() },
          uTime: { value: 0 },
          uScroll: { value: window.scrollY },
        };
        material = new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: skyFragment, depthTest: false, depthWrite: false });
        const scene = new THREE.Scene();
        scene.add(new THREE.Mesh(geometry, material));
        const camera = new THREE.Camera();
        const gpu = renderer;
        const canvas = gpu.domElement;
        let disposed = false;
        let last = performance.now();
        let lastRender = last;
        let elapsed = 0;
        let samples = 0;
        let slowFor = 0;
        let fastFor = 0;
        let lowQuality = false;
        const resize = () => {
          // Fixed half-CSS-pixel buffer, independent of device pixel ratio.
          gpu.setPixelRatio(.5);
          gpu.setSize(window.innerWidth, window.innerHeight);
          uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        };
        const ticker = () => {
          if (disposed || document.hidden || occluded) { last = performance.now(); return; }
          const now = performance.now();
          const duration = now - last;
          last = now;
          uniforms.uTime.value += Math.min(duration / 1000, .05);
          uniforms.uScroll.value = window.__lenis?.animatedScroll ?? window.scrollY;
          elapsed += duration;
          samples++;
          if (elapsed >= 1000) {
            const average = elapsed / samples;
            slowFor = average > 22 ? slowFor + elapsed : 0;
            fastFor = average < 18 ? fastFor + elapsed : 0;
            // Hysteresis changes cadence, preserving the fixed render resolution.
            if (!lowQuality && slowFor >= 2000) { lowQuality = true; fastFor = 0; }
            else if (lowQuality && fastFor >= 5000) { lowQuality = false; slowFor = 0; }
            container.dataset.quality = lowQuality ? "low" : "full";
            elapsed = samples = 0;
          }
          if (lowQuality && now - lastRender < 1000 / 30 - .5) return;
          lastRender = now;
          gpu.render(scene, camera);
        };
        const visibility = () => {
          gsap.ticker.remove(ticker);
          if (document.hidden || disposed) return;
          last = lastRender = performance.now();
          elapsed = samples = slowFor = fastFor = 0;
          gsap.ticker.add(ticker);
        };
        const cleanup = () => {
          if (disposed) return;
          disposed = true;
          gsap.ticker.remove(ticker);
          window.removeEventListener("resize", resize);
          document.removeEventListener("visibilitychange", visibility);
          canvas.removeEventListener("webglcontextlost", lost);
          scene.clear();
          geometry!.dispose(); material!.dispose();
          gpu.dispose(); gpu.forceContextLoss();
          canvas.remove();
          delete container.dataset.quality;
        };
        const lost = (event: Event) => {
          event.preventDefault();
          cleanup();
          root.dataset.sky = "css";
        };
        resize();
        gpu.compile(scene, camera);
        gpu.render(scene, camera);
        if (shaderFailed) throw new Error("Sky shader compilation failed");
        container.appendChild(canvas);
        root.dataset.sky = "webgl";
        window.addEventListener("resize", resize);
        document.addEventListener("visibilitychange", visibility);
        canvas.addEventListener("webglcontextlost", lost);
        shutdown = cleanup;
        visibility();
      } catch {
        geometry?.dispose(); material?.dispose();
        renderer?.dispose(); renderer?.forceContextLoss();
        root.dataset.sky = "css";
      }
    };
    reduced.addEventListener("change", start);
    start();
    return () => {
      shutdown?.();
      window.removeEventListener("sky:occluded", occlusion);
      reduced.removeEventListener("change", start);
      delete root.dataset.sky;
    };
  }, []);
  return <div className="sky" ref={host} aria-hidden="true" />;
}
