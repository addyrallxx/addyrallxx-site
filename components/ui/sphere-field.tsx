"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./sphere-field.css";

// Reference B clips 4 and 15: a cursor-bent, slowly drifting surface, without bloom.
const fragment = `
precision highp float;
uniform vec2 uSize;
uniform vec2 uPointer;
uniform float uTime;
uniform float uScroll;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);
}
float height(vec2 p) {
  vec2 warp=vec2(noise(p*.85+uTime*.055),noise(p*.85+3.7-uTime*.04));
  return noise(p+warp*1.8+vec2(uTime*.035,-uTime*.025));
}
void main() {
  vec2 uv=vUv;
  vec2 p=(uv-.5)*vec2(uSize.x/uSize.y,1.)*3.;
  vec2 pointer=(uPointer-.5)*vec2(uSize.x/uSize.y,1.)*3.;
  vec2 d=p-pointer;
  p-=d*exp(-dot(d,d)*1.4)*.32;
  p+=vec2(uScroll*.5,uScroll*.32);
  float h=height(p);
  vec3 normal=normalize(vec3((h-height(p+vec2(.015,0)))*9.,(h-height(p+vec2(0,.015)))*9.,.42));
  float light=max(0.,dot(normal,normalize(vec3(-.5,.65,1.))));
  float spec=pow(max(0.,dot(reflect(-normalize(vec3(-.5,.65,1.)),normal),vec3(0,0,1))),20.);
  vec3 paper=vec3(.953,.941,.910);
  vec3 blue=vec3(.35,.47,.80), mineral=vec3(.65,.80,.82), pearl=vec3(.92,.86,.75);
  vec3 color=mix(blue,mineral,smoothstep(.18,.66,h));
  color=mix(color,pearl,smoothstep(.58,.86,h));
  color*=.86+light*.2; color+=spec*.055;
  float edge=smoothstep(0.,.19,uv.y)*smoothstep(0.,.19,1.-uv.y);
  float field=exp(-dot((uv-vec2(.28,.52))*vec2(1.35,1.),(uv-vec2(.28,.52))*vec2(1.35,1.))*6.);
  color=mix(paper,color,edge*field*.72);
  color+=(hash(gl_FragCoord.xy)-.5)/255.;
  gl_FragColor=vec4(color,1.);
}`;

export function SphereField() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current!, section = el.closest<HTMLElement>(".tools")!;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let renderer: THREE.WebGLRenderer | undefined;
    let geometry: THREE.BufferGeometry | undefined;
    let material: THREE.ShaderMaterial | undefined;
    let stop: (() => void) | undefined;
    try {
      gsap.registerPlugin(ScrollTrigger);
      renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
      const gpu = renderer;
      const uniforms = { uSize: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2(.3, .5) }, uTime: { value: 0 }, uScroll: { value: 0 } };
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1,-1,0, 3,-1,0, -1,3,0], 3));
      material = new THREE.ShaderMaterial({ uniforms, vertexShader: "varying vec2 vUv; void main(){vUv=position.xy*.5+.5;gl_Position=vec4(position,1.);}", fragmentShader: fragment, depthTest: false, depthWrite: false });
      const scene = new THREE.Scene(), camera = new THREE.Camera();
      scene.add(new THREE.Mesh(geometry, material));
      let bounds = section.getBoundingClientRect(), measuredScroll = window.scrollY, visible = false, disposed = false, last = 0;
      const target = new THREE.Vector2(.3, .5);
      const render = () => { gpu.render(scene, camera); el.dataset.paints = String(++paints); };
      let paints = 0;
      const resize = () => {
        bounds = section.getBoundingClientRect();
        measuredScroll = window.scrollY;
        gpu.setPixelRatio(.5); gpu.setSize(bounds.width, bounds.height);
        uniforms.uSize.value.set(bounds.width, bounds.height);
        if (!document.hidden) render();
      };
      const tick = (time: number) => {
        const dt = Math.min(time - last, .05); last = time;
        uniforms.uTime.value += dt;
        uniforms.uPointer.value.lerp(target, 1 - Math.exp(-dt * 3));
        render();
      };
      const sync = () => {
        gsap.ticker.remove(tick);
        el.dataset.running = String(visible && !document.hidden && !motion.matches && !disposed);
        if (disposed || document.hidden || !visible) return;
        if (motion.matches) { uniforms.uTime.value = 0; uniforms.uPointer.value.set(.3, .5); render(); }
        else { last = gsap.ticker.time; gsap.ticker.add(tick); }
      };
      const observer = new IntersectionObserver(entries => { visible = entries.some(entry => entry.isIntersecting); sync(); });
      const resizeObserver = new ResizeObserver(resize);
      const trigger = ScrollTrigger.create({ trigger: section, start: "top bottom", end: "bottom top", onUpdate: self => { uniforms.uScroll.value = motion.matches ? .5 : self.progress; } });
      const pointer = (event: PointerEvent) => {
        if (!visible || document.hidden || motion.matches) return;
        const scroll = window.__lenis?.animatedScroll ?? window.scrollY;
        target.set((event.clientX - bounds.left) / bounds.width, 1 - (event.clientY - bounds.top + scroll - measuredScroll) / bounds.height);
      };
      const measure = () => { bounds = section.getBoundingClientRect(); measuredScroll = window.scrollY; };
      const leave = () => { target.set(.3, .5); };
      stop = () => {
        if (disposed) return;
        disposed = true; gsap.ticker.remove(tick); observer.disconnect(); resizeObserver.disconnect(); trigger.kill();
        section.removeEventListener("pointerenter", measure); section.removeEventListener("pointermove", pointer); section.removeEventListener("pointerleave", leave);
        document.removeEventListener("visibilitychange", sync); motion.removeEventListener("change", sync);
        gpu.domElement.removeEventListener("webglcontextlost", lost);
        geometry?.dispose(); material?.dispose(); gpu.dispose(); gpu.forceContextLoss(); gpu.domElement.remove();
        el.dataset.running = "false"; delete el.dataset.ready;
      };
      const lost = (event: Event) => { event.preventDefault(); stop?.(); };
      let failed = false;
      gpu.debug.onShaderError = () => { failed = true; };
      resize(); gpu.compile(scene, camera);
      if (failed) throw new Error("Sphere field shader failed");
      el.appendChild(gpu.domElement); el.dataset.ready = "true";
      observer.observe(section); resizeObserver.observe(section);
      section.addEventListener("pointerenter", measure); section.addEventListener("pointermove", pointer, { passive: true }); section.addEventListener("pointerleave", leave);
      document.addEventListener("visibilitychange", sync); motion.addEventListener("change", sync);
      gpu.domElement.addEventListener("webglcontextlost", lost);
    } catch {
      if (stop) stop(); else { geometry?.dispose(); material?.dispose(); renderer?.dispose(); renderer?.forceContextLoss(); }
    }
    return () => stop?.();
  }, []);
  return <div ref={host} className="sphere-field" aria-hidden="true" />;
}
