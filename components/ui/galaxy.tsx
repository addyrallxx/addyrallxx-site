"use client";

import { useEffect, useRef, useState } from "react";

export type GalaxyProps = {
  /** Rendered size behaviour. "fill" fills its positioned parent. Default "fill". */
  variant?: "fill";
  /** 0 to 1. Scales overall brightness. Default 1. */
  intensity?: number;
  /** Camera framing: three quarter view or straight down. */
  view?: "oblique" | "face";
  className?: string;
};

type Three = typeof import("three");
type Mount = { host: HTMLDivElement; view: "oblique" | "face"; intensity: number;
  ratio: number; fail: () => void };
type Engine = { wake: () => void; dispose: () => void };

// Sibling intro and hero hosts lend their space to ONE renderer and canvas.
// Transferring that canvas preserves GPU resources and accumulated galaxy time.
const mounts = new Set<Mount>();
let engine: Engine | undefined;
let loading: Promise<void> | undefined;
let unavailable = false;
const CAPACITY = 12000;
const TAU = Math.PI * 2;

const vertexShader = `
  attribute float aSize;
  attribute float aPhase;
  attribute float aHaze;
  uniform float uTime;
  uniform float uPixelScale;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float radius = length(position.xy);
    // Inner stars gain about 0.8 radians on the rim over fifteen seconds.
    float orbit = uTime * (0.012 + 0.105 / (0.45 + radius));
    float c = cos(orbit), s = sin(orbit);
    vec3 p = vec3(c * position.x - s * position.y,
                  s * position.x + c * position.y, position.z);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float pulse = sin(uTime * (0.65 + fract(aPhase * 7.13) * 1.5) + aPhase);
    gl_PointSize = clamp(aSize * uPixelScale / -mv.z, 1.0, 160.0);
    vAlpha = mix(0.84 + 0.16 * pulse, 0.032, aHaze);
    vColor = color;
  }
`;
const fragmentShader = `
  uniform sampler2D uSprite;
  uniform float uIntensity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float alpha = texture2D(uSprite, gl_PointCoord).a * vAlpha * uIntensity;
    if (alpha < 0.001) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function createEngine(three: Three): Engine {
  const canvas = document.createElement("canvas");
  canvas.className = "galaxy-canvas";
  canvas.setAttribute("aria-hidden", "true");
  let renderer: InstanceType<Three["WebGLRenderer"]> | undefined;
  let geometry: InstanceType<Three["BufferGeometry"]> | undefined;
  let material: InstanceType<Three["ShaderMaterial"]> | undefined;
  let texture: InstanceType<Three["CanvasTexture"]> | undefined;
  const removers: (() => void)[] = [];
  let frame = 0, previous = 0, elapsed = 0;
  let dead = false;
  let active: Mount | undefined;
  const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
  const dispose = () => {
    if (dead) return;
    dead = true;
    stop();
    removers.forEach((remove) => remove());
    geometry?.dispose();
    material?.dispose();
    texture?.dispose();
    renderer?.dispose();
    renderer?.forceContextLoss();
    canvas.remove();
  };
  const fail = () => {
    dispose();
    unavailable = true;
    mounts.forEach((mount) => mount.fail());
  };

  try {
    renderer = new three.WebGLRenderer({ canvas, alpha: true, antialias: false,
      depth: false, stencil: false, powerPreference: "low-power" });
    renderer.setClearColor(0x000000, 0);
    const scene = new three.Scene();
    const camera = new three.PerspectiveCamera(43, 1, 0.1, 60);
    camera.position.z = 12;
    const positions = new Float32Array(CAPACITY * 3);
    const colors = new Float32Array(CAPACITY * 3);
    const sizes = new Float32Array(CAPACITY);
    const phases = new Float32Array(CAPACITY);
    const haze = new Float32Array(CAPACITY);
    let seed = 74129;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const scatter = () => random() + random() + random() - 1.5;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 128;
    const context = sprite.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    // Canvas resolves modern CSS color syntax before passing RGB to Three.
    context.fillStyle = "#d9bd8d";
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#d9bd8d";
    context.fillRect(0, 0, 1, 1);
    const tint = context.getImageData(0, 0, 1, 1).data;
    const accent = new three.Color().setRGB(tint[0] / 255, tint[1] / 255, tint[2] / 255);
    context.clearRect(0, 0, 128, 128);
    const glow = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(0.065, "rgba(255,255,255,1)");
    glow.addColorStop(0.14, "rgba(255,255,255,0.62)");
    glow.addColorStop(0.3, "rgba(255,255,255,0.13)");
    glow.addColorStop(0.6, "rgba(255,255,255,0.025)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, 128, 128);
    texture = new three.CanvasTexture(sprite);
    const color = new three.Color();
    for (let i = 0; i < CAPACITY; i++) {
      const core = random() < 0.17;
      const radius = core ? Math.pow(random(), 0.65) * 0.7 : 0.3 + Math.pow(random(), 0.72) * 3.8;
      const angle = 3.7 * Math.log(1 + radius * 3.3) + (i % 3) * TAU / 3;
      const spread = core ? 0.22 : 0.055 + radius * 0.11;
      const fog = random() < 0.035;
      const scatterScale = fog ? 2.5 : 1;
      positions[i * 3] = Math.cos(angle) * radius + scatter() * spread * scatterScale;
      positions[i * 3 + 1] = Math.sin(angle) * radius + scatter() * spread * scatterScale;
      positions[i * 3 + 2] = scatter() * (0.075 + radius * 0.045) * scatterScale;
      const warmth = random();
      if (warmth < 1 / 7 && !core) {
        color.setRGB(1, 0.57 + random() * 0.28, 0.32 + random() * 0.24);
        if (warmth < 0.003) color.lerp(accent, 0.4);
      } else {
        const cool = radius / 4.2;
        color.setRGB(0.88 - cool * 0.34, 0.94 - cool * 0.17, 1);
      }
      if (fog) color.setRGB(0.3, 0.52, 0.63);
      color.toArray(colors, i * 3);
      const bright = random();
      sizes[i] = fog ? 70 + random() * 65 : (2.1 + random() * 3.3 + (bright > 0.965 ? 7 : 0)) * (core ? 1.12 : 1);
      phases[i] = random() * TAU;
      haze[i] = fog ? 1 : 0;
    }
    geometry = new three.BufferGeometry();
    geometry.setAttribute("position", new three.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new three.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new three.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new three.BufferAttribute(phases, 1));
    geometry.setAttribute("aHaze", new three.BufferAttribute(haze, 1));
    material = new three.ShaderMaterial({ vertexShader, fragmentShader,
      vertexColors: true, transparent: true, blending: three.AdditiveBlending,
      depthWrite: false, depthTest: false,
      uniforms: { uSprite: { value: texture }, uTime: { value: 0 },
        uPixelScale: { value: 12 }, uIntensity: { value: 1 } },
    });
    const galaxy = new three.Points(geometry, material);
    galaxy.frustumCulled = false;
    scene.add(galaxy);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let pointerX = 0, pointerY = 0, leanX = 0, leanY = 0;
    let ratio = 1, tilt = 0.62, brightness = 1;
    let width = 0, height = 0;
    let dirty = true;
    const choose = () => {
      let candidate: Mount | undefined;
      for (const mount of mounts) {
        if (mount.ratio > 0 && (!candidate || mount.view === "face")) candidate = mount;
      }
      return candidate;
    };
    const resize = () => {
      if (!active) return;
      const nextWidth = active.host.clientWidth, nextHeight = active.host.clientHeight;
      if (nextWidth === width && nextHeight === height && !dirty) return;
      width = nextWidth; height = nextHeight; dirty = false;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, coarse.matches ? 1.5 : 2);
      renderer!.setPixelRatio(dpr);
      renderer!.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      // Portrait framing pulls the camera back to fit the disc's width.
      // Compensate the sprites so their bright centres do not become subpixel.
      material!.uniforms.uPixelScale.value = dpr * Math.min(width, height) / (52 * Math.min(1, camera.aspect));
      const count = Math.min(CAPACITY, Math.max(1800,
        Math.round(10000 * Math.pow(window.innerWidth * window.innerHeight / 1296000, 0.65))));
      geometry!.setDrawRange(0, count);
      canvas.dataset.pointCount = String(count);
    };
    const draw = (now: number) => {
      frame = 0;
      if (dead || document.hidden || !active || active.ratio <= 0) { stop(); return; }
      const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
      previous = now;
      const reduced = motion.matches;
      if (!reduced) elapsed += dt;
      const damping = reduced ? 1 : 1 - Math.exp(-dt * 3.5);
      leanX += (pointerY * 0.085 - leanX) * damping;
      leanY += (pointerX * 0.12 - leanY) * damping;
      ratio += (active.ratio - ratio) * damping;
      tilt += ((active.view === "face" ? 0.13 : 0.62) - tilt) * damping;
      brightness += (active.intensity - brightness) * damping;
      const visible = reduced ? 1 : ratio;
      galaxy.rotation.set(reduced ? (active.view === "face" ? 0.13 : 0.62) : tilt + leanX + (1 - visible) * 0.62 + Math.sin(elapsed * 0.17) * 0.035,
        reduced ? 0 : leanY + Math.sin(elapsed * 0.12) * 0.025,
        reduced ? -0.25 : -0.25 + elapsed * 0.014);
      const framing = active.view === "face" ? 10.9 : 11.8;
      camera.position.z = (framing + (1 - visible) * 3.6) / Math.min(1, camera.aspect);
      material!.uniforms.uTime.value = reduced ? 0 : elapsed;
      material!.uniforms.uIntensity.value = brightness * visible * visible;
      try { renderer!.render(scene, camera); } catch { fail(); return; }
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (dead) return;
      const next = choose();
      if (next !== active) {
        active = next;
        if (active) { active.host.appendChild(canvas); canvas.dataset.view = active.view; dirty = true; }
      }
      if (!active || document.hidden) { stop(); return; }
      resize();
      if (!width || !height) { stop(); return; }
      if (!frame) {
        if (motion.matches) draw(performance.now());
        else frame = requestAnimationFrame(draw);
      }
    };
    const resized = () => { dirty = true; wake(); };
    const observer = new ResizeObserver(resized);
    observer.observe(document.documentElement);
    observer.observe(canvas);
    const pointer = (event: PointerEvent) => {
      if (motion.matches || coarse.matches) return;
      pointerX = event.clientX / window.innerWidth * 2 - 1;
      pointerY = event.clientY / window.innerHeight * 2 - 1;
    };
    const resetPointer = () => { pointerX = pointerY = 0; };
    const changeMotion = () => { stop(); wake(); };
    canvas.addEventListener("webglcontextlost", fail);
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("blur", resetPointer);
    window.addEventListener("resize", resized, { passive: true });
    document.addEventListener("visibilitychange", wake);
    motion.addEventListener("change", changeMotion);
    coarse.addEventListener("change", resized);
    removers.push(() => {
      observer.disconnect();
      canvas.removeEventListener("webglcontextlost", fail);
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("blur", resetPointer);
      window.removeEventListener("resize", resized);
      document.removeEventListener("visibilitychange", wake);
      motion.removeEventListener("change", changeMotion);
      coarse.removeEventListener("change", resized);
    });
    return { wake, dispose };
  } catch (error) { dispose(); throw error; }
}

export function Galaxy({ variant = "fill", intensity = 1, view = "oblique", className = "" }: GalaxyProps): React.JSX.Element | null {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const mount: Mount = { host: host.current, intensity: Math.max(0, Math.min(1, intensity)),
      view, ratio: 0, fail: () => setFailed(true) };
    mounts.add(mount);
    const observer = new IntersectionObserver(([entry]) => {
      // A tall phone hero and the oversized intro are fully visible at rest.
      // Normalize against the viewport rather than dimming them from frame one.
      mount.ratio = view === "face" ? Number(entry.isIntersecting) :
        Math.min(1, entry.intersectionRect.height / Math.max(1, Math.min(entry.boundingClientRect.height, window.innerHeight)));
      engine?.wake();
    }, { threshold: Array.from({ length: 51 }, (_, i) => i / 50) });
    observer.observe(view === "oblique" ? mount.host.closest("section") || mount.host : mount.host);
    if (!loading) {
      loading = import("three").then((three) => {
        if (mounts.size && !engine && !unavailable) engine = createEngine(three);
        engine?.wake();
      }).catch(() => {
        unavailable = true;
        mounts.forEach((item) => item.fail());
      }).finally(() => { loading = undefined; });
    }
    if (unavailable) queueMicrotask(mount.fail);
    return () => {
      observer.disconnect();
      mounts.delete(mount);
      if (mounts.size) engine?.wake();
      else { engine?.dispose(); engine = undefined; unavailable = false; }
    };
  }, [intensity, view]);

  if (failed) return null;
  return <div ref={host} className={`galaxy ${className}`} data-galaxy={variant} aria-hidden="true" />;
}
