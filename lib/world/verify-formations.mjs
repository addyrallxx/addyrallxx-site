import assert from "node:assert/strict";

import {
  FORMATION_GENERATORS,
  PARTICLE_STRIDE,
  PUZZLED_MEANINGFUL_POINTS,
  PUZZLED_SIGNAL_POINTS,
  createTotaltexEdgeData,
} from "./formations.ts";

const particleCount = 24_000;
const expectedLength = particleCount * PARTICLE_STRIDE;
const names = ["arrival", "ground", "totaltex", "puzzled", "field-notes", "contact"];
const formations = FORMATION_GENERATORS.map((generate, index) => {
  const formation = generate(particleCount);
  assert.ok(formation instanceof Float32Array, `${names[index]} must be a Float32Array`);
  assert.equal(formation.length, expectedLength, `${names[index]} length`);
  console.log(`${names[index]}: Float32Array length=${formation.length}`);
  return formation;
});

let puzzledActive = 0;
let puzzledSignal = 0;
for (let offset = 3; offset < formations[3].length; offset += PARTICLE_STRIDE) {
  const signedSize = formations[3][offset];
  if (signedSize !== 0) puzzledActive += 1;
  if (signedSize < 0) puzzledSignal += 1;
}

assert.equal(puzzledActive, PUZZLED_MEANINGFUL_POINTS, "puzzled active count");
assert.equal(puzzledSignal, PUZZLED_SIGNAL_POINTS, "puzzled signal count");

const edgeData = createTotaltexEdgeData();
assert.equal(edgeData.indices.length / 2, 5, "totaltex edge segment count");

console.log(
  `puzzled: active=${puzzledActive} signal=${puzzledSignal} padded=${particleCount - puzzledActive}`,
);
console.log(`totaltex: edgeSegments=${edgeData.indices.length / 2}`);
console.log(`PASS formations=${formations.length} expectedLength=${expectedLength}`);
