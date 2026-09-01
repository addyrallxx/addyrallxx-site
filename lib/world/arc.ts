export const ARC_RADIUS = 4;
export const ARC_SEGMENT_COUNT = 64;

const LIFT_PER_RADIAN = 0.15;
const DHAKA = { latitude: 23.8103, longitude: 90.4125 } as const;
const CALGARY = { latitude: 51.0447, longitude: -114.0719 } as const;

type Point3 = readonly [number, number, number];

// Kept local so verify-arc.mjs can compare this seam independently against
// formations.ts. Y is North, X is East at +90 longitude, Z is prime meridian.
function latLonToSphere(latitude: number, longitude: number, radius: number): Point3 {
  const latitudeRadians = (latitude * Math.PI) / 180;
  const longitudeRadians = (longitude * Math.PI) / 180;
  const northSouthRadius = Math.cos(latitudeRadians) * radius;
  return [
    northSouthRadius * Math.sin(longitudeRadians),
    Math.sin(latitudeRadians) * radius,
    northSouthRadius * Math.cos(longitudeRadians),
  ];
}

/** Great circle sample points before the globe orientation is applied. */
function rawArcPositions(): Float32Array {
  const start = latLonToSphere(DHAKA.latitude, DHAKA.longitude, ARC_RADIUS);
  const end = latLonToSphere(CALGARY.latitude, CALGARY.longitude, ARC_RADIUS);
  const startUnit: Point3 = [
    start[0] / ARC_RADIUS,
    start[1] / ARC_RADIUS,
    start[2] / ARC_RADIUS,
  ];
  const endUnit: Point3 = [
    end[0] / ARC_RADIUS,
    end[1] / ARC_RADIUS,
    end[2] / ARC_RADIUS,
  ];
  const dot = Math.min(
    1,
    Math.max(
      -1,
      startUnit[0] * endUnit[0] +
        startUnit[1] * endUnit[1] +
        startUnit[2] * endUnit[2],
    ),
  );
  const angularDistance = Math.acos(dot);
  const inverseSinAngle = 1 / Math.sin(angularDistance);
  const maxLift = angularDistance * LIFT_PER_RADIAN;
  const positions = new Float32Array((ARC_SEGMENT_COUNT + 1) * 3);


  for (let index = 0; index <= ARC_SEGMENT_COUNT; index += 1) {
    const t = index / ARC_SEGMENT_COUNT;
    const startWeight = Math.sin((1 - t) * angularDistance) * inverseSinAngle;
    const endWeight = Math.sin(t * angularDistance) * inverseSinAngle;
    let x = startUnit[0] * startWeight + endUnit[0] * endWeight;
    let y = startUnit[1] * startWeight + endUnit[1] * endWeight;
    let z = startUnit[2] * startWeight + endUnit[2] * endWeight;
    const unitScale = 1 / Math.hypot(x, y, z);
    const radius = ARC_RADIUS + Math.sin(Math.PI * t) * maxLift;
    x *= unitScale * radius;
    y *= unitScale * radius;
    z *= unitScale * radius;

    const offset = index * 3;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;

  }

  return positions;
}

// The Dhaka to Calgary great circle passes close to the north pole, so in raw
// world coordinates every point of it lands at z between -1.09 and -0.03 while
// the globe front surface is at z = +4. The camera sits on +z, so the arc
// renders behind the particle sphere and depth tests away entirely. It is
// geometrically correct and completely invisible, which no endpoint assertion
// can catch.
//
// So the globe carries a fixed orientation: one rotation that swings the arc
// apex round to face the viewer. The sphere particles are a Fibonacci
// distribution and therefore isotropic, so rotating them is free visually.
// createContactFormation applies the same rotation, which is why this lives
// here rather than in either caller.
const GLOBE_FACING: Point3 = [0, 0.34, 0.94];

function normalize(v: Point3): Point3 {
  const scale = 1 / Math.hypot(v[0], v[1], v[2]);
  return [v[0] * scale, v[1] * scale, v[2] * scale];
}

function buildOrientation(): { axis: Point3; cos: number; sin: number } {
  const raw = rawArcPositions();
  const middle = (ARC_SEGMENT_COUNT / 2) * 3;
  const from = normalize([raw[middle], raw[middle + 1], raw[middle + 2]]);
  const to = normalize(GLOBE_FACING);
  const dot = Math.min(1, Math.max(-1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2]));
  const cross: Point3 = [
    from[1] * to[2] - from[2] * to[1],
    from[2] * to[0] - from[0] * to[2],
    from[0] * to[1] - from[1] * to[0],
  ];
  const crossLength = Math.hypot(cross[0], cross[1], cross[2]);
  // Already aligned, or exactly antipodal. Neither happens with these two
  // cities, but a zero length axis would produce NaN across the whole buffer.
  const axis: Point3 = crossLength < 1e-9 ? [0, 1, 0] : normalize(cross);
  return { axis, cos: dot, sin: Math.sqrt(Math.max(0, 1 - dot * dot)) };
}

let orientation: { axis: Point3; cos: number; sin: number } | null = null;

/** Rodrigues rotation onto the shared globe orientation. Used by the arc and by createContactFormation. */
export function orientGlobePoint(x: number, y: number, z: number): Point3 {
  orientation ??= buildOrientation();
  const { axis, cos, sin } = orientation;
  const dot = axis[0] * x + axis[1] * y + axis[2] * z;
  return [
    x * cos + (axis[1] * z - axis[2] * y) * sin + axis[0] * dot * (1 - cos),
    y * cos + (axis[2] * x - axis[0] * z) * sin + axis[1] * dot * (1 - cos),
    z * cos + (axis[0] * y - axis[1] * x) * sin + axis[2] * dot * (1 - cos),
  ];
}

/** One immutable Dhaka-to-Calgary polyline, oriented to face the chapter 6 camera. */
export function createGreatCircleArcData() {
  const positions = rawArcPositions();
  const start = latLonToSphere(DHAKA.latitude, DHAKA.longitude, ARC_RADIUS);
  const end = latLonToSphere(CALGARY.latitude, CALGARY.longitude, ARC_RADIUS);
  const dot = Math.min(1, Math.max(-1,
    (start[0] * end[0] + start[1] * end[1] + start[2] * end[2]) / (ARC_RADIUS * ARC_RADIUS)));
  const angularDistance = Math.acos(dot);
  const maxLift = angularDistance * LIFT_PER_RADIAN;

  let totalLength = 0;
  for (let index = 0; index <= ARC_SEGMENT_COUNT; index += 1) {
    const offset = index * 3;
    const rotated = orientGlobePoint(positions[offset], positions[offset + 1], positions[offset + 2]);
    if (index > 0) {
      totalLength += Math.hypot(
        rotated[0] - positions[offset - 3],
        rotated[1] - positions[offset - 2],
        rotated[2] - positions[offset - 1],
      );
    }
    positions[offset] = rotated[0];
    positions[offset + 1] = rotated[1];
    positions[offset + 2] = rotated[2];
  }

  return { positions, totalLength, angularDistance, maxLift };
}
