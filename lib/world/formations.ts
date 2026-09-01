import { orientGlobePoint } from "./arc.ts";

/** Packed particle data uses x, y, z, signed point size for every particle. */
export const PARTICLE_STRIDE = 4;

/** The audited Puzzled description count. Keep this number tied to the case study. */
export const PUZZLED_MEANINGFUL_POINTS = 1069;
export const PUZZLED_SIGNAL_POINTS = 2;

export type FormationGenerator = (particleCount: number) => Float32Array;

type Point3 = readonly [number, number, number];

const SIGNAL_PERIOD = 50;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function assertParticleCount(particleCount: number): void {
  if (!Number.isInteger(particleCount) || particleCount <= 0) {
    throw new RangeError("particleCount must be a positive integer");
  }
}

function createBuffer(particleCount: number): Float32Array {
  assertParticleCount(particleCount);
  return new Float32Array(particleCount * PARTICLE_STRIDE);
}

function writePoint(
  target: Float32Array,
  index: number,
  x: number,
  y: number,
  z: number,
  size: number,
): void {
  const offset = index * PARTICLE_STRIDE;
  target[offset] = x;
  target[offset + 1] = y;
  target[offset + 2] = z;
  target[offset + 3] = size;
}

function signalSize(size: number, index: number): number {
  return index % SIGNAL_PERIOD === 0 ? -size : size;
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function hash2d(x: number, z: number, seed: number): number {
  let value = Math.imul(x, 374761393) ^ Math.imul(z, 668265263) ^ seed;
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function valueNoise2d(x: number, z: number, seed: number): number {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const tx = smoothstep(x - x0);
  const tz = smoothstep(z - z0);
  const a = hash2d(x0, z0, seed);
  const b = hash2d(x0 + 1, z0, seed);
  const c = hash2d(x0, z0 + 1, seed);
  const d = hash2d(x0 + 1, z0 + 1, seed);
  const ab = a + (b - a) * tx;
  const cd = c + (d - c) * tx;
  return ab + (cd - ab) * tz;
}

function ridgedNoise(x: number, z: number): number {
  const broad = 1 - Math.abs(valueNoise2d(x * 0.7, z * 0.7, 11) * 2 - 1);
  const middle = 1 - Math.abs(valueNoise2d(x * 1.45, z * 1.45, 23) * 2 - 1);
  const fine = 1 - Math.abs(valueNoise2d(x * 3.1, z * 3.1, 37) * 2 - 1);
  return broad * 0.58 + middle * 0.3 + fine * 0.12;
}

/** A wide, unresolved cloud used as the opening state. */
export const createArrivalFormation: FormationGenerator = (particleCount) => {
  const target = createBuffer(particleCount);
  const random = seeded(0xa771ca1);

  for (let index = 0; index < particleCount; index += 1) {
    const depth = 0.5 + random() * 0.9;
    const x = (random() * 2 - 1) * 6.5 * depth;
    const y = (random() * 2 - 1) * 3.25 * depth;
    const z = (random() * 2 - 1) * 4.5 * depth;
    const size = 0.035 + random() * 0.075;
    writePoint(target, index, x, y, z, signalSize(size, index));
  }

  return target;
};

/** A deterministic ridged value-noise foothill field. */
export const createGroundFormation: FormationGenerator = (particleCount) => {
  const target = createBuffer(particleCount);
  const side = Math.ceil(Math.sqrt(particleCount));

  for (let index = 0; index < particleCount; index += 1) {
    const column = index % side;
    const row = Math.floor(index / side);
    const u = side === 1 ? 0.5 : column / (side - 1);
    const v = side === 1 ? 0.5 : row / (side - 1);
    const x = (u - 0.5) * 11;
    const z = (v - 0.5) * 7;
    const ridge = ridgedNoise(x * 0.32 + 4, z * 0.32 - 3);
    const foothill = Math.sin((x + z) * 0.42) * 0.14;
    const y = -1.55 + ridge * 3.05 + foothill;
    const size = 0.035 + ridge * 0.045;
    writePoint(target, index, x, y, z, signalSize(size, index));
  }

  return target;
};

/** Ordered stages: order, job, proforma, production, challan, bill. */
const TOTALTEX_NODE_CENTERS: readonly Point3[] = [
  [-5.1, -0.55, 0.1],
  [-3.05, -0.15, 0.32],
  [-1.02, 0.18, -0.16],
  [1.02, 0.34, 0.18],
  [3.06, 0.62, -0.22],
  [5.1, 0.84, 0.08],
];

/** Six ordered operational stages, each surrounded by a local particle cluster. */
export const createTotaltexFormation: FormationGenerator = (particleCount) => {
  const target = createBuffer(particleCount);
  const random = seeded(0x70a17e5);

  for (let index = 0; index < particleCount; index += 1) {
    if (index < TOTALTEX_NODE_CENTERS.length) {
      const [x, y, z] = TOTALTEX_NODE_CENTERS[index];
      writePoint(target, index, x, y, z, signalSize(0.18, index));
      continue;
    }

    const nodeIndex = (index - TOTALTEX_NODE_CENTERS.length) % TOTALTEX_NODE_CENTERS.length;
    const [centerX, centerY, centerZ] = TOTALTEX_NODE_CENTERS[nodeIndex];
    const angle = random() * Math.PI * 2;
    const radius = 0.22 + random() * 0.8;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + (random() * 2 - 1) * 0.55;
    const z = centerZ + Math.sin(angle) * radius * 0.7;
    const size = 0.04 + random() * 0.055;
    writePoint(target, index, x, y, z, signalSize(size, index));
  }

  return target;
};

/** The real audited record field, with two marked records and zeroed surplus. */
export const createPuzzledFormation: FormationGenerator = (particleCount) => {
  assertParticleCount(particleCount);
  if (particleCount < PUZZLED_MEANINGFUL_POINTS) {
    throw new RangeError(
      `puzzled formation requires at least ${PUZZLED_MEANINGFUL_POINTS} particles`,
    );
  }

  const target = new Float32Array(particleCount * PARTICLE_STRIDE);
  const random = seeded(0x9221ed);
  const signalIndexes = new Set([137, 811]);

  for (let index = 0; index < PUZZLED_MEANINGFUL_POINTS; index += 1) {
    const radius = Math.sqrt((index + 0.5) / PUZZLED_MEANINGFUL_POINTS);
    const angle = index * GOLDEN_ANGLE;
    const x = Math.cos(angle) * radius * 5.4 + (random() - 0.5) * 0.25;
    const z = Math.sin(angle) * radius * 3.1 + (random() - 0.5) * 0.25;
    const y = (random() - 0.5) * 2.2 + Math.sin(angle * 0.35) * 0.18;
    const size = 0.028 + random() * 0.04;
    writePoint(target, index, x, y, z, signalIndexes.has(index) ? -size : size);
  }

  return target;
};

const FIELD_NOTE_CENTERS: readonly Point3[] = [
  [-3.65, 0.35, 0.1],
  [0, -0.45, 0.2],
  [3.65, 0.55, -0.15],
];

/** Three distinct project clusters: the web, the tracker, and the working vault. */
export const createFieldNotesFormation: FormationGenerator = (particleCount) => {
  const target = createBuffer(particleCount);
  const random = seeded(0xf13d0e5);

  for (let index = 0; index < particleCount; index += 1) {
    const clusterIndex = index % FIELD_NOTE_CENTERS.length;
    const [centerX, centerY, centerZ] = FIELD_NOTE_CENTERS[clusterIndex];
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 1.25;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + (random() * 2 - 1) * 0.6;
    const z = centerZ + Math.sin(angle) * radius * 0.75;
    const size = 0.04 + random() * 0.05;
    writePoint(target, index, x, y, z, signalSize(size, index));
  }

  return target;
};

export function latLonToSphere(latitude: number, longitude: number, radius: number): Point3 {
  const latitudeRadians = (latitude * Math.PI) / 180;
  const longitudeRadians = (longitude * Math.PI) / 180;
  const northSouthRadius = Math.cos(latitudeRadians) * radius;
  // Shared with the arc. Both must carry the same globe orientation or the two
  // city markers drift off the ends of the line they are supposed to join.
  return orientGlobePoint(
    northSouthRadius * Math.sin(longitudeRadians),
    Math.sin(latitudeRadians) * radius,
    northSouthRadius * Math.cos(longitudeRadians),
  );
}

// Seam: the great-circle arc is separate and must match this axis convention.
// Y is North, X is East at longitude +90, and Z is the prime meridian.
export const createContactFormation: FormationGenerator = (particleCount) => {
  const target = createBuffer(particleCount);
  const radius = 4;
  const dhaka = latLonToSphere(23.8103, 90.4125, radius);
  const calgary = latLonToSphere(51.0447, -114.0719, radius);

  if (particleCount >= 1) {
    writePoint(target, 0, dhaka[0], dhaka[1], dhaka[2], -0.16);
  }
  if (particleCount >= 2) {
    writePoint(target, 1, calgary[0], calgary[1], calgary[2], -0.16);
  }

  for (let index = 2; index < particleCount; index += 1) {
    const sphereIndex = index - 1;
    const sphereCount = Math.max(1, particleCount - 2);
    const y = 1 - (sphereIndex / sphereCount) * 2;
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = sphereIndex * GOLDEN_ANGLE;
    const size = 0.038 + (sphereIndex % 7) * 0.004;
    const shell = orientGlobePoint(
      Math.cos(angle) * ringRadius * radius,
      y * radius,
      Math.sin(angle) * ringRadius * radius,
    );
    writePoint(target, index, shell[0], shell[1], shell[2], size);
  }

  return target;
};

export const FORMATION_GENERATORS: readonly FormationGenerator[] = [
  createArrivalFormation,
  createGroundFormation,
  createTotaltexFormation,
  createPuzzledFormation,
  createFieldNotesFormation,
  createContactFormation,
];

export interface TotaltexEdgeData {
  readonly positions: Float32Array;
  readonly indices: Uint16Array;
  readonly edgeEnds: Float32Array;
}

/** Five directed links use duplicated vertices so each endpoint has a 0 or 1 marker. */
export function createTotaltexEdgeData(): TotaltexEdgeData {
  const segmentCount = TOTALTEX_NODE_CENTERS.length - 1;
  const positions = new Float32Array(segmentCount * 2 * 3);
  const indices = new Uint16Array(segmentCount * 2);
  const edgeEnds = new Float32Array(segmentCount * 2);

  for (let segment = 0; segment < segmentCount; segment += 1) {
    const start = TOTALTEX_NODE_CENTERS[segment];
    const end = TOTALTEX_NODE_CENTERS[segment + 1];
    const vertex = segment * 2;
    const positionOffset = vertex * 3;
    positions[positionOffset] = start[0];
    positions[positionOffset + 1] = start[1];
    positions[positionOffset + 2] = start[2];
    positions[positionOffset + 3] = end[0];
    positions[positionOffset + 4] = end[1];
    positions[positionOffset + 5] = end[2];
    indices[vertex] = vertex;
    indices[vertex + 1] = vertex + 1;
    edgeEnds[vertex] = 0;
    edgeEnds[vertex + 1] = 1;
  }

  return { positions, indices, edgeEnds };
}
