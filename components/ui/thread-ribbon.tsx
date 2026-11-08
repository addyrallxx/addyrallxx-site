"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

const lengthSegments = 160, widthSegments = 8, columnIndices = widthSegments * 6;

// A woven strip, not a tube. The width bends around the curve's tangent.
export function ThreadRibbon() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current!, section = el.closest<HTMLElement>(".journey")!;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
    catch { return; }
    el.append(renderer.domElement);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, 0, 15);
    const points = [new THREE.Vector3(-6,-1.2,0),new THREE.Vector3(-3.7,1.3,.4),new THREE.Vector3(-1.5,.4,1),new THREE.Vector3(0,-1.2,0),new THREE.Vector3(1.5,.7,-.6),new THREE.Vector3(3.6,1.25,.6),new THREE.Vector3(6,-.8,0)];
    const homes = points.map(p => p.clone()), velocities = points.map(() => new THREE.Vector3());
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array((lengthSegments + 1) * (widthSegments + 1) * 3);
    const colours = new Float32Array(positions.length);
    const indices = [];
    const blue = new THREE.Color("#2340FF"), mineral = new THREE.Color("#8BC4E8"), colour = new THREE.Color();
    for (let i = 0; i <= lengthSegments; i++) for (let j = 0; j <= widthSegments; j++) {
      const offset = (i * (widthSegments + 1) + j) * 3;
      colour.copy(blue).lerp(mineral, j / widthSegments * .7 + .15 * Math.sin(i / lengthSegments * Math.PI));
      colour.toArray(colours, offset);
      if (i < lengthSegments && j < widthSegments) {
        const a = i * (widthSegments + 1) + j, b = a + widthSegments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    geometry.setIndex(indices);
    const material = new THREE.MeshPhysicalMaterial({ vertexColors: true, side: THREE.DoubleSide, metalness: .18, roughness: .3, sheen: .8, sheenColor: new THREE.Color("#DCEBFF"), sheenRoughness: .4, clearcoat: .45, clearcoatRoughness: .25 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh, new THREE.HemisphereLight(0xF3F0E8, 0x2340FF, 2));
    for (const [hex, power, x, y, z] of [[0xFFF8E4,4,2,6,5],[0x8BC4E8,3,-5,1,3],[0xFFFFFF,5,3,-2,-4]]) {
      const light = new THREE.DirectionalLight(hex, power); light.position.set(x,y,z); scene.add(light);
    }
    const center = new THREE.Vector3(), tangent = new THREE.Vector3(), side = new THREE.Vector3(), normal = new THREE.Vector3(), axis = new THREE.Vector3(0,0,1);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, ready = false, lost = false, disposed = false, running = false, last = 0, time = 0, progress = .1;
    let pointerX = 0, pointerY = 0, pointerOn = false;
    let bounds = el.getBoundingClientRect();
    const shape = (dt: number) => {
      let nearest = 0, distance = Infinity;
      homes.forEach((p, i) => { const d = (p.x - pointerX) ** 2 + (p.y - pointerY) ** 2; if (d < distance) { distance = d; nearest = i; } });
      points.forEach((point, i) => {
        const influence = pointerOn && !motion.matches ? Math.exp(-((i - nearest) ** 2) / 1.4) : 0;
        const targetY = homes[i].y + (motion.matches ? 0 : Math.sin(time * .65 + i) * .12) + (pointerY - homes[i].y) * influence * .24;
        velocities[i].y += ((targetY - point.y) * 42 - velocities[i].y * 12) * dt;
        point.y += velocities[i].y * dt;
        point.z = homes[i].z + (motion.matches ? 0 : Math.sin(time * .45 + i) * .12);
      });
      for (let i = 0; i <= lengthSegments; i++) {
        const t = i / lengthSegments;
        curve.getPoint(t, center); curve.getTangent(t, tangent);
        side.crossVectors(tangent, axis).normalize().applyAxisAngle(tangent, t * Math.PI * 3.8 + .25 * Math.sin(time * .3));
        normal.crossVectors(tangent, side).normalize();
        for (let j = 0; j <= widthSegments; j++) {
          const w = (j / widthSegments - .5) * .72, bend = .09 * (1 - (w / .36) ** 2), o = (i * (widthSegments + 1) + j) * 3;
          positions[o] = center.x + side.x * w + normal.x * bend;
          positions[o + 1] = center.y + side.y * w + normal.y * bend;
          positions[o + 2] = center.z + side.z * w + normal.z * bend;
        }
      }
      geometry.attributes.position.needsUpdate = true; geometry.computeVertexNormals();
      const columns = motion.matches ? lengthSegments : Math.min(lengthSegments, Math.max(12, Math.round((.15 + progress * 1.45) * lengthSegments)));
      geometry.setDrawRange(0, columns * columnIndices);
      el.dataset.indices = String(geometry.drawRange.count);
    };
    const paint = () => { renderer.render(scene, camera); el.dataset.paints = String(Number(el.dataset.paints || 0) + 1); };
    const tick = () => {
      const now = performance.now(), dt = last ? Math.min((now - last) / 1000, .033) : 1 / 60;
      last = now; time += dt;
      const journey = ScrollTrigger.getById("journey");
      if (journey) progress = journey.progress * .65;
      shape(dt); paint();
    };
    const sync = () => {
      const run = ready && visible && !document.hidden && !motion.matches && !lost;
      if (run !== running) { running = run; last = 0; if (run) gsap.ticker.add(tick); else gsap.ticker.remove(tick); }
      el.dataset.running = String(run);
      if (ready && !lost && !run && visible) { shape(1 / 60); paint(); }
    };
    const resize = () => {
      bounds = el.getBoundingClientRect(); renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / Math.max(bounds.height, 1); camera.position.z = camera.aspect < 1 ? 24 : 15; camera.updateProjectionMatrix();
      if (ready && !lost) paint();
    };
    const pointer = (e: PointerEvent) => { pointerX = ((e.clientX - bounds.left) / bounds.width - .5) * 14; pointerY = (.5 - e.clientY / innerHeight) * 7; pointerOn = true; };
    const enter = () => { bounds = el.getBoundingClientRect(); };
    const leave = () => { pointerOn = false; };
    const contextLost = (e: Event) => { e.preventDefault(); lost = true; el.dataset.ready = "false"; sync(); };
    const contextRestored = () => { lost = false; el.dataset.ready = "true"; resize(); sync(); };
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({ trigger: section, start: "top bottom", end: "bottom top", onUpdate: self => { progress = self.progress; } });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }); observer.observe(el);
    const resizer = new ResizeObserver(resize); resizer.observe(el);
    section.addEventListener("pointerenter", enter); section.addEventListener("pointermove", pointer, { passive: true }); section.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync); motion.addEventListener("change", sync);
    renderer.domElement.addEventListener("webglcontextlost", contextLost); renderer.domElement.addEventListener("webglcontextrestored", contextRestored);
    resize(); shape(1 / 60);
    renderer.compileAsync(scene, camera).then(() => { if (!disposed) { ready = true; el.dataset.ready = "true"; paint(); sync(); } }).catch(() => { if (!disposed) el.dataset.ready = "false"; });
    return () => {
      disposed = true; gsap.ticker.remove(tick); trigger.kill(); observer.disconnect(); resizer.disconnect();
      section.removeEventListener("pointerenter", enter); section.removeEventListener("pointermove", pointer); section.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost); renderer.domElement.removeEventListener("webglcontextrestored", contextRestored);
      geometry.dispose(); material.dispose(); renderer.dispose(); if (!renderer.getContext().isContextLost()) renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} className="thread-ribbon" aria-hidden="true"><svg viewBox="0 0 1000 400" className="ribbon-fallback"><path d="M-20 280C200 0 280 80 420 240S680 60 1020 200" fill="none" stroke="#8BC4E8" strokeWidth="20" /></svg></div>;
}
