import * as THREE from "three";
import { fluidFragment, vertex } from "./shaders";

export function triangle() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([-1,-1,0, 3,-1,0, -1,3,0], 3));
  return geometry;
}

function target(size: number) {
  return new THREE.WebGLRenderTarget(size, size, {
    type: THREE.HalfFloatType, format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    depthBuffer: false, stencilBuffer: false,
  });
}
function pair(size: number) {
  return {
    read: target(size), write: target(size),
    swap() { const old = this.read; this.read = this.write; this.write = old; },
    dispose() { this.read.dispose(); this.write.dispose(); },
  };
}

export class Fluid {
  readonly velocity = pair(128);
  readonly dye = pair(512);
  readonly pressure = pair(128);
  readonly divergence = target(128);
  readonly camera = new THREE.Camera();
  readonly scene = new THREE.Scene();
  readonly geometry = triangle();
  readonly uniforms = {
    uSource: { value: this.dye.read.texture },
    uVelocity: { value: this.velocity.read.texture },
    uPressure: { value: this.pressure.read.texture },
    uDivergence: { value: this.divergence.texture },
    uTexel: { value: new THREE.Vector2(1/128, 1/128) },
    uPoint: { value: new THREE.Vector2() },
    uSplat: { value: new THREE.Vector3() },
    uDt: { value: 0 }, uDissipation: { value: .74 },
    uRadius: { value: .01 }, uAspect: { value: 1 }, uPass: { value: 0 },
  };
  readonly material = new THREE.ShaderMaterial({
    uniforms: this.uniforms, vertexShader: vertex, fragmentShader: fluidFragment,
    depthTest: false, depthWrite: false,
  });
  constructor(readonly renderer: THREE.WebGLRenderer) {
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
    const targets = [this.velocity.read,this.velocity.write,this.dye.read,this.dye.write,
      this.pressure.read,this.pressure.write,this.divergence];
    for (const buffer of targets) { renderer.setRenderTarget(buffer); renderer.clear(); }
    renderer.setRenderTarget(null);
  }
  setResolutionScale(scale: number) {
    const sim = Math.round(128 * scale), dye = Math.round(512 * scale);
    for (const buffer of [this.velocity, this.pressure]) {
      buffer.read.setSize(sim, sim); buffer.write.setSize(sim, sim);
    }
    this.divergence.setSize(sim, sim);
    this.dye.read.setSize(dye, dye); this.dye.write.setSize(dye, dye);
    this.uniforms.uTexel.value.set(1 / sim, 1 / sim);
  }
  private draw(pass: number, destination: THREE.WebGLRenderTarget) {
    this.uniforms.uPass.value = pass;
    this.renderer.setRenderTarget(destination);
    this.renderer.render(this.scene, this.camera);
  }
  splat(x: number, y: number, dx: number, dy: number, speed: number, night: boolean, aspect: number) {
    const u = this.uniforms;
    u.uAspect.value = aspect;
    u.uPoint.value.set(x,y);
    // Tuned 2026-10-10 (Adnan: too much area, stays too long): narrow brush, short life.
    u.uRadius.value = Math.min(speed,night ? 6 : 2.5)*.01;
    u.uSource.value = this.velocity.read.texture;
    u.uSplat.value.set(dx*3,-dy*3,0);
    this.draw(1,this.velocity.write);
    this.velocity.swap();
    u.uSource.value = this.dye.read.texture;
    u.uSplat.value.set(.012,.012,.012);
    this.draw(1,this.dye.write);
    this.dye.swap();
  }
  step(dt: number, night: boolean) {
    const u = this.uniforms;
    u.uDt.value = dt;
    u.uVelocity.value = this.velocity.read.texture;
    u.uSource.value = this.velocity.read.texture;
    u.uDissipation.value = 1;
    this.draw(0,this.velocity.write);
    this.velocity.swap();
    u.uVelocity.value = this.velocity.read.texture;
    this.draw(2,this.divergence);
    u.uSource.value = this.pressure.read.texture;
    this.draw(5,this.pressure.write);
    this.pressure.swap();
    for (let i=0; i<12; i++) {
      u.uPressure.value = this.pressure.read.texture;
      this.draw(3,this.pressure.write);
      this.pressure.swap();
    }
    u.uPressure.value = this.pressure.read.texture;
    this.draw(4,this.velocity.write);
    this.velocity.swap();
    u.uVelocity.value = this.velocity.read.texture;
    u.uSource.value = this.dye.read.texture;
    u.uDissipation.value = night ? 2.2 : 2.8;
    this.draw(0,this.dye.write);
    this.dye.swap();
  }
  dispose() {
    this.velocity.dispose(); this.dye.dispose(); this.pressure.dispose();
    this.divergence.dispose(); this.material.dispose(); this.geometry.dispose();
    this.scene.clear();
  }
}
