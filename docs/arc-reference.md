# Great-circle arc: reference implementation

**Status: UNVERIFIED third party output. Do not paste into the build without
checking it.** Produced by Gemini 3.1 Pro on 2026-09-01 via the `agy` CLI, in
response to its own review finding that this task is harder than the original
spec assumed (native `GL_LINES` is locked to one device pixel, so it looks
broken on high DPI screens).

Before using any of this:

- confirm the `three/addons` import paths against the version actually installed
  in `package.json`, they move between releases
- confirm the axis convention matches whatever `lib/world/formations.ts` uses for
  the sphere formation, a mismatch here puts the cities in the wrong place and it
  is hard to see by eye
- typecheck it, then verify the two endpoints land at the right coordinates
  numerically rather than by looking

Context: `docs/phase-2-world.md` section 2. The arc is chapter 6 of the world and
is budgeted as its own task, not as a detail of the engine.

---

Here is the implementation of the animated great-circle arc.

### Interpolation Approach
Linear interpolation is incorrect here because it calculates a straight line segment that cuts directly through the interior of the planet volume, creating a chord. We must use spherical linear interpolation (slerp) so the points travel along the curved surface of the sphere at a constant radius.

### Animation Comparison
Between the two animation approaches, using `LineMaterial` dashed mode driven by `dashOffset` is significantly cheaper and is the recommended approach. Rebuilding or masking the geometry per frame requires expensive CPU overhead and continuous buffer uploads to the GPU. Dashed mode uploads the geometry exactly once and performs the animation purely on the GPU in the fragment shader by updating a single material uniform per frame.

### TypeScript Reference Implementation

```typescript
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

// Axis convention used here:
// Y axis is North (Latitude +90).
// X axis is Longitude +90 (East).
// Z axis is Longitude 0 (Prime Meridian).
function latLonToVector(lat: number, lon: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = lon * (Math.PI / 180);

    return new THREE.Vector3(
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.cos(theta)
    );
}

export function createAnimatedGreatCircle(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    const radius = 1;

    // Dhaka (23.8103 N, 90.4125 E) and Calgary (51.0447 N, 114.0719 W)
    const p1 = latLonToVector(23.8103, 90.4125, radius);
    const p2 = latLonToVector(51.0447, -114.0719, radius);

    const v1Norm = p1.clone().normalize();
    const v2Norm = p2.clone().normalize();
    const dot = v1Norm.dot(v2Norm);

    const qStart = new THREE.Quaternion();
    const qEnd = new THREE.Quaternion();

    // Safely handle identical and antipodal points to prevent NaN errors
    if (dot > 0.999999) {
        // Points are identical, qEnd remains the identity quaternion
    } else if (dot < -0.999999) {
        // Points are antipodal. We must manufacture an orthogonal axis to define the circle.
        const orthogonal = Math.abs(v1Norm.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const axis = new THREE.Vector3().crossVectors(v1Norm, orthogonal).normalize();
        qEnd.setFromAxisAngle(axis, Math.PI);
    } else {
        qEnd.setFromUnitVectors(v1Norm, v2Norm);
    }

    const angularDistance = Math.acos(Math.max(-1, Math.min(1, dot)));
    const points: number[] = [];
    const segments = 64;
    
    let totalLength = 0;
    const currentPoint = new THREE.Vector3();
    const previousPoint = new THREE.Vector3();

    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const q = qStart.clone().slerp(qEnd, t);
        
        currentPoint.copy(p1).applyQuaternion(q);

        // Lift the arc. Height peaks at the midpoint (t=0.5) and scales with angular distance.
        const lift = Math.sin(t * Math.PI) * (angularDistance * 0.15);
        currentPoint.normalize().multiplyScalar(radius + lift);

        points.push(currentPoint.x, currentPoint.y, currentPoint.z);

        if (i > 0) {
            totalLength += currentPoint.distanceTo(previousPoint);
        }
        previousPoint.copy(currentPoint);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(points);

    // The LineMaterial resolution property must be set to the viewport dimensions. 
    // If you forget to set it, the shader cannot convert line widths to Normalized Device Coordinates, 
    // causing the line to vanish entirely or explode in size to fill the screen.
    const material = new LineMaterial({
        color: 0xff4444,
        linewidth: 4, // defined in pixels
        dashed: true,
        dashSize: totalLength,
        gapSize: totalLength,
        dashOffset: totalLength,
        blending: THREE.NormalBlending, // Explicitly enforce standard blending, no additive
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    });

    const line = new Line2(geometry, material);
    
    // Required to populate distance buffer attributes for the dashed shader
    line.computeLineDistances();
    scene.add(line);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        material.dashOffset = 0;
    }

    // Handle viewport resizes to keep the line width accurate
    window.addEventListener('resize', () => {
        material.resolution.set(window.innerWidth, window.innerHeight);
    });

    // Return a function that drives the animation based on scroll progress (0 to 1)
    return function updateProgress(progress: number) {
        if (prefersReducedMotion) return;
        const clamped = Math.max(0, Math.min(1, progress));
        material.dashOffset = totalLength * (1 - clamped);
    };
}
```
