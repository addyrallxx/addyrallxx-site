import assert from "node:assert/strict";

import {
  ARC_RADIUS,
  ARC_SEGMENT_COUNT,
  createGreatCircleArcData,
} from "./arc.ts";
import { latLonToSphere } from "./formations.ts";

const EPSILON = 1e-6;
const arc = createGreatCircleArcData();
const expectedDhaka = latLonToSphere(23.8103, 90.4125, ARC_RADIUS);
const expectedCalgary = latLonToSphere(51.0447, -114.0719, ARC_RADIUS);

assert.ok(arc.positions instanceof Float32Array, "arc positions must be a Float32Array");
assert.equal(
  arc.positions.length,
  (ARC_SEGMENT_COUNT + 1) * 3,
  "arc position buffer length",
);

function pointAt(index) {
  const offset = index * 3;
  return arc.positions.slice(offset, offset + 3);
}

function pointError(actual, expected) {
  return Math.hypot(
    actual[0] - expected[0],
    actual[1] - expected[1],
    actual[2] - expected[2],
  );
}

const first = pointAt(0);
const last = pointAt(ARC_SEGMENT_COUNT);
const dhakaError = pointError(first, expectedDhaka);
const calgaryError = pointError(last, expectedCalgary);
assert.ok(dhakaError <= EPSILON, `Dhaka endpoint error ${dhakaError}`);
assert.ok(calgaryError <= EPSILON, `Calgary endpoint error ${calgaryError}`);

for (let index = 0; index < arc.positions.length; index += 1) {
  assert.ok(Number.isFinite(arc.positions[index]), `finite coordinate at buffer index ${index}`);
}

let minimumInteriorRadius = Infinity;
let maximumInteriorRadius = -Infinity;
for (let index = 1; index < ARC_SEGMENT_COUNT; index += 1) {
  const point = pointAt(index);
  const radius = Math.hypot(point[0], point[1], point[2]);
  minimumInteriorRadius = Math.min(minimumInteriorRadius, radius);
  maximumInteriorRadius = Math.max(maximumInteriorRadius, radius);
  assert.ok(radius >= ARC_RADIUS, `point ${index} radius ${radius} fell below sphere`);
  assert.ok(
    radius <= ARC_RADIUS + arc.maxLift + EPSILON,
    `point ${index} radius ${radius} exceeded maximum lift`,
  );
}

const midpoint = pointAt(ARC_SEGMENT_COUNT / 2);
const midpointRadius = Math.hypot(midpoint[0], midpoint[1], midpoint[2]);
assert.ok(midpointRadius > ARC_RADIUS, "midpoint must lift above the sphere");
assert.ok(
  Math.abs(midpointRadius - (ARC_RADIUS + arc.maxLift)) <= EPSILON,
  "midpoint must reach the configured maximum lift",
);


// Every assertion above passed while the arc was completely invisible. The
// Dhaka to Calgary great circle runs close to the north pole, so before the
// globe orientation was applied all 65 points sat at z between -1.09 and
// -0.03 while the globe front surface is at z = +4. The camera is on +z, so
// the arc rendered behind the particle sphere and depth tested away.
// Correct geometry pointing away from the viewer is still a broken feature.
let pointsFacingCamera = 0;
let maximumZ = -Infinity;
for (let index = 0; index <= ARC_SEGMENT_COUNT; index += 1) {
  const point = pointAt(index);
  maximumZ = Math.max(maximumZ, point[2]);
  if (point[2] > 0) pointsFacingCamera += 1;
}
assert.ok(
  maximumZ > ARC_RADIUS * 0.8,
  'arc must reach toward the camera, max z was ' + maximumZ,
);
assert.ok(
  pointsFacingCamera > ARC_SEGMENT_COUNT * 0.6,
  'most of the arc must face the camera, only ' + pointsFacingCamera + ' points had z > 0',
);
console.log('facing: maxZ=' + maximumZ.toFixed(6) + ' pointsWithPositiveZ=' + pointsFacingCamera + '/' + (ARC_SEGMENT_COUNT + 1));
console.log(`arc: points=${ARC_SEGMENT_COUNT + 1} segments=${ARC_SEGMENT_COUNT}`);
console.log(
  `endpoints: dhakaError=${dhakaError.toExponential(3)} calgaryError=${calgaryError.toExponential(3)}`,
);
console.log(
  `radii: minInterior=${minimumInteriorRadius.toFixed(6)} maxInterior=${maximumInteriorRadius.toFixed(6)} maxAllowed=${(ARC_RADIUS + arc.maxLift).toFixed(6)}`,
);
console.log(
  `route: angularDistance=${arc.angularDistance.toFixed(6)} maxLift=${arc.maxLift.toFixed(6)} length=${arc.totalLength.toFixed(6)}`,
);
console.log("PASS great-circle arc endpoints, surface clearance, lift bound, camera facing, and finite buffer");
