import * as THREE from "three";

import {
  FORMATION_GENERATORS,
  PARTICLE_STRIDE,
  PUZZLED_MEANINGFUL_POINTS,
  createTotaltexEdgeData,
} from "./formations";
import { CHAPTER_PACING, mapScrollProgress, snapScrollProgress } from "./pacing";
import {
  EDGE_FRAGMENT_SHADER,
  EDGE_VERTEX_SHADER,
  POINT_FRAGMENT_SHADER,
  POINT_VERTEX_SHADER,
} from "./shaders";
import type { CreateWorld, Tier, WorldHandle, WorldOptions } from "./types";

const FULL_PARTICLE_COUNT = 24_000;
const LITE_PARTICLE_COUNT = 8_000;
const FIELD_COLOR = "#a8aeb8";
const SIGNAL_COLOR = "#f0873d";
const CLEAR_COLOR = "#05070a";
const FORMATION_MAX = FORMATION_GENERATORS.length - 1;

interface DeviceMemoryNavigator extends Navigator {
  readonly deviceMemory?: number;
}

function clampUnit(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

function clampPointer(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(-1, value)) : 0;
}

function detectTier(forced?: Tier): Tier {
  if (forced) return forced;
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "static";
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "static";
  }

  const memory = (navigator as DeviceMemoryNavigator).deviceMemory;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  return coarsePointer || window.innerWidth < 768 || (memory !== undefined && memory <= 4)
    ? "lite"
    : "full";
}

function resolveParticleCount(tier: Tier, options?: WorldOptions): number {
  const fallback = tier === "full" ? FULL_PARTICLE_COUNT : LITE_PARTICLE_COUNT;
  const requested = options?.particleCount;
  if (requested === undefined || !Number.isFinite(requested)) return fallback;
  return Math.max(PUZZLED_MEANINGFUL_POINTS, Math.floor(requested));
}

function createFallback(particleCount: number): WorldHandle {
  return {
    tier: "static",
    particleCount,
    setProgress() {},
    setPointer() {},
    resize() {},
    dispose() {},
    debug: {
      cameraPosition: () => [0, 0, 0] as const,
      isAnimating: () => false,
      frameCount: () => 0,
    },
  };
}

function createFormationTexture(
  renderer: THREE.WebGLRenderer,
  particleCount: number,
): { texture: THREE.DataTexture; size: THREE.Vector2 } {
  const texelCount = particleCount * FORMATION_GENERATORS.length;
  const maxTextureSize = renderer.capabilities.maxTextureSize;
  const width = Math.min(maxTextureSize, Math.ceil(Math.sqrt(texelCount)));
  const height = Math.ceil(texelCount / width);

  if (height > maxTextureSize) {
    throw new RangeError("formation texture exceeds the GPU texture size limit");
  }

  const textureData = new Float32Array(width * height * PARTICLE_STRIDE);
  for (let index = 0; index < FORMATION_GENERATORS.length; index += 1) {
    textureData.set(
      FORMATION_GENERATORS[index](particleCount),
      index * particleCount * PARTICLE_STRIDE,
    );
  }

  const texture = new THREE.DataTexture(
    textureData,
    width,
    height,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  texture.colorSpace = THREE.NoColorSpace;
  texture.generateMipmaps = false;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  return { texture, size: new THREE.Vector2(width, height) };
}

function createRenderedWorld(
  canvas: HTMLCanvasElement,
  tier: Tier,
  particleCount: number,
): WorldHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
    premultipliedAlpha: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(CLEAR_COLOR, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
  const cameraPath = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-0.6, 0.5, 15.5),
      new THREE.Vector3(-0.2, 4.5, 13.5),
      new THREE.Vector3(0, 0.8, 15.5),
      new THREE.Vector3(0.35, 1.1, 16),
      new THREE.Vector3(-0.35, 0.9, 14.5),
      new THREE.Vector3(0, 0.15, 14),
    ],
    false,
    "catmullrom",
    0.35,
  );
  const targetPath = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -0.45, 0),
      new THREE.Vector3(0, 0.15, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0, 0, 0),
    ],
    false,
    "catmullrom",
    0.35,
  );

  let formationTexture: ReturnType<typeof createFormationTexture>;
  try {
    formationTexture = createFormationTexture(renderer, particleCount);
  } catch (error) {
    renderer.dispose();
    throw error;
  }
  const progressUniform = { value: 0 };
  const pointUniforms = {
    uFormations: { value: formationTexture.texture },
    uTextureSize: { value: formationTexture.size },
    uParticleCount: { value: particleCount },
    uProgress: progressUniform,
    uPointScale: { value: 1 },
    uViewportHeight: { value: 1 },
    uFieldColor: { value: new THREE.Color(FIELD_COLOR) },
    uSignalColor: { value: new THREE.Color(SIGNAL_COLOR) },
    uOpacity: { value: 0.84 },
  };

  const pointGeometry = new THREE.BufferGeometry();
  const pointIndexes = new Float32Array(particleCount);
  for (let index = 0; index < particleCount; index += 1) pointIndexes[index] = index;
  pointGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(new Float32Array(particleCount * 3), 3),
  );
  pointGeometry.setAttribute("aIndex", new THREE.Float32BufferAttribute(pointIndexes, 1));
  pointGeometry.setDrawRange(0, particleCount);

  const pointMaterial = new THREE.ShaderMaterial({
    uniforms: pointUniforms,
    vertexShader: POINT_VERTEX_SHADER,
    fragmentShader: POINT_FRAGMENT_SHADER,
    glslVersion: THREE.GLSL3,
    alphaTest: 0.5,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
  });
  const points = new THREE.Points(pointGeometry, pointMaterial);
  points.frustumCulled = false;
  scene.add(points);

  const edgeData = createTotaltexEdgeData();
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(edgeData.positions, 3));
  edgeGeometry.setAttribute("aEdgeEnd", new THREE.Float32BufferAttribute(edgeData.edgeEnds, 1));
  edgeGeometry.setIndex(new THREE.Uint16BufferAttribute(edgeData.indices, 1));
  const edgeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uProgress: progressUniform,
      uSignalColor: { value: new THREE.Color(SIGNAL_COLOR) },
      uOpacity: { value: 0.78 },
    },
    vertexShader: EDGE_VERTEX_SHADER,
    fragmentShader: EDGE_FRAGMENT_SHADER,
    glslVersion: THREE.GLSL3,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
  });
  const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
  edges.frustumCulled = false;
  edges.renderOrder = 1;
  scene.add(edges);

  const cameraBase = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  const pointerTarget = new THREE.Vector2();
  const pointerCurrent = new THREE.Vector2();
  const drawingBufferSize = new THREE.Vector2();
  let cameraDolly = 1;
  let currentProgress = 0;
  let targetProgress = 0;
  let staticChapter = 0;
  let frameCount = 0;
  let animationFrame: number | null = null;
  let disposed = false;
  const pageDocument = typeof document === "undefined" ? null : document;

  function updateCamera(progress: number): void {
    const pathProgress = Math.min(1, Math.max(0, progress / FORMATION_MAX));
    cameraPath.getPointAt(pathProgress, cameraBase);
    targetPath.getPointAt(pathProgress, cameraTarget);
    camera.position.copy(cameraBase);
    camera.position.z *= cameraDolly;

    if (tier === "full") {
      camera.position.x += pointerCurrent.x * 0.38;
      camera.position.y += pointerCurrent.y * 0.24;
    }

    camera.lookAt(cameraTarget);
  }

  function renderScene(progress: number, countFrame = true): void {
    progressUniform.value = progress;
    updateCamera(progress);
    renderer.render(scene, camera);
    if (countFrame) frameCount += 1;
  }

  function resizeRenderer(): void {
    if (disposed) return;
    const width = Math.max(1, canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, canvas.clientHeight || window.innerHeight);
    const aspect = width / height;
    const portraitPressure = Math.max(0, 1 / aspect - 1);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.getDrawingBufferSize(drawingBufferSize);
    pointUniforms.uViewportHeight.value = drawingBufferSize.y;
    pointUniforms.uPointScale.value = width < 768 ? 0.68 : width < 1024 ? 0.86 : 1;
    camera.aspect = aspect;
    camera.fov = 44 + Math.min(18, portraitPressure * 12);
    cameraDolly = 1 + Math.min(0.45, portraitPressure * 0.22);
    camera.updateProjectionMatrix();
    updateCamera(currentProgress);
  }

  function resize(): void {
    if (disposed) return;
    resizeRenderer();
    // Static resize refreshes framing without changing its chapter-driven debug count.
    if (tier === "static") renderScene(currentProgress, false);
  }

  function scheduleFrame(): void {
    if (
      disposed ||
      tier === "static" ||
      animationFrame !== null ||
      pageDocument?.hidden
    ) {
      return;
    }
    animationFrame = window.requestAnimationFrame(animate);
  }

  function animate(): void {
    animationFrame = null;
    if (disposed || pageDocument?.hidden) return;

    const distance = targetProgress - currentProgress;
    currentProgress = Math.abs(distance) < 0.0001
      ? targetProgress
      : currentProgress + distance * 0.05;
    pointerCurrent.lerp(pointerTarget, 0.08);
    renderScene(currentProgress);
    scheduleFrame();
  }

  function handleVisibilityChange(): void {
    if (pageDocument?.hidden) {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
      return;
    }
    scheduleFrame();
  }

  function setProgress(progress: number): void {
    if (disposed) return;
    const normalized = clampUnit(progress);

    if (tier === "static") {
      const chapter = snapScrollProgress(normalized);
      if (chapter === staticChapter) return;
      staticChapter = chapter;
      currentProgress = chapter;
      targetProgress = chapter;
      renderScene(chapter);
      return;
    }

    targetProgress = mapScrollProgress(normalized);
  }

  function setPointer(x: number, y: number): void {
    if (disposed || tier !== "full") return;
    pointerTarget.set(clampPointer(x), clampPointer(y));
  }

  function dispose(): void {
    if (disposed) return;
    disposed = true;
    if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
    pageDocument?.removeEventListener("visibilitychange", handleVisibilityChange);
    pointGeometry.dispose();
    pointMaterial.dispose();
    edgeGeometry.dispose();
    edgeMaterial.dispose();
    formationTexture.texture.dispose();
    renderer.dispose();
    scene.clear();
  }

  resizeRenderer();
  if (tier === "static") {
    renderScene(0);
  } else {
    pageDocument?.addEventListener("visibilitychange", handleVisibilityChange);
    scheduleFrame();
  }

  return {
    tier,
    particleCount,
    setProgress,
    setPointer,
    resize,
    dispose,
    debug: {
      cameraPosition: () => [camera.position.x, camera.position.y, camera.position.z] as const,
      isAnimating: () => animationFrame !== null,
      frameCount: () => frameCount,
    },
  };
}

export const createWorld: CreateWorld = (canvas, options) => {
  let tier: Tier = "static";
  let particleCount = LITE_PARTICLE_COUNT;

  try {
    tier = detectTier(options?.tier);
    particleCount = resolveParticleCount(tier, options);
    if (typeof window === "undefined") {
      return createFallback(resolveParticleCount("static", options));
    }
    return createRenderedWorld(canvas, tier, particleCount);
  } catch {
    return createFallback(resolveParticleCount("static", options));
  }
};

export { CHAPTER_PACING };
export type { ChapterPacing, WorldHandle, WorldOptions } from "./types";
