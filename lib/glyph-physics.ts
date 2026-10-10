export type GlyphBody = {
  x: number; y: number; vx: number; vy: number; angle: number; spin: number;
  width: number; height: number; radius: number; release: number; quiet: number; asleep: boolean; grounded: boolean;
};
export const GLYPH_STEP = 1 / 120;

export function createGlyphBodies(boxes: { width: number; height: number }[], width: number, random = Math.random): GlyphBody[] {
  const slots = boxes.map((_, i) => i);
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  const radii = boxes.map(box => .42 * Math.hypot(box.width, box.height));
  const free = Math.max(0, width - radii.reduce((sum, radius) => sum + radius * 2, 0));
  const gaps = Array.from({ length: boxes.length + 1 }, () => .1 + random());
  const gapTotal = gaps.reduce((sum, gap) => sum + gap, 0);
  const positions = new Array<number>(boxes.length);
  let cursor = free * gaps[0] / gapTotal;
  slots.forEach((index, i) => { positions[index] = cursor + radii[index]; cursor += radii[index] * 2 + free * gaps[i + 1] / gapTotal; });
  return boxes.map((box, i) => {
    const radius = radii[i];
    // Random order and gaps distribute the drop without an initial pile-up.
    const x = Math.max(radius, Math.min(width - radius, positions[i]));
    return { ...box, radius, x, y: -box.height / 2 - random() * 160,
      vx: 0, vy: 0, angle: 0, spin: (random() * 2 - 1) * 35, release: i * .11, quiet: 0, asleep: false, grounded: false };
  });
}

export function stepGlyphBodies(bodies: GlyphBody[], width: number, height: number, time: number) {
  const active = bodies.filter(body => time >= body.release);
  const supported = new Set<GlyphBody>();
  const floorContacts = new Set<GlyphBody>();
  const bounds = (b: GlyphBody) => {
    const angle = b.angle * Math.PI / 180;
    const hx = Math.max(b.radius, (Math.abs(Math.cos(angle)) * b.width + Math.abs(Math.sin(angle)) * b.height) / 2);
    const hy = Math.max(b.radius, (Math.abs(Math.sin(angle)) * b.width + Math.abs(Math.cos(angle)) * b.height) / 2);
    if (b.x < hx || b.x > width - hx) {
      if ((b.x < hx && b.vx < 0) || (b.x > width - hx && b.vx > 0)) b.vx *= -.38 * .8;
      b.x = Math.max(hx, Math.min(width - hx, b.x));
    }
    if (b.y >= height - hy || (b.y >= height - hy - .25 && b.vy >= 0)) {
      b.y = height - hy;
      if (b.vy > 0) { b.vy = -b.vy * .38; b.vx *= .8; if (Math.abs(b.vy) < 12) b.vy = 0; }
      if (!floorContacts.has(b)) { b.vx *= .86; floorContacts.add(b); }
      if (b.vy === 0) supported.add(b);
    }
  };
  for (const b of active) {
    if (b.asleep) continue;
    if (!b.grounded || b.vy !== 0) b.vy += 2600 * GLYPH_STEP;
    b.x += b.vx * GLYPH_STEP; b.y += b.vy * GLYPH_STEP;
    b.angle += b.spin * GLYPH_STEP; b.spin *= .985;
    bounds(b);
  }
  // Four small solver passes keep piled circles from sinking into the floor.
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
      const overlap = a.radius + b.radius - distance;
      if (overlap < -.25) continue;
      const nx = distance > .001 ? dx / distance : 1, ny = distance > .001 ? dy / distance : 0;
      if (ny > .3 && (b.asleep || b.grounded)) supported.add(a);
      if (ny < -.3 && (a.asleep || a.grounded)) supported.add(b);
      if (overlap <= 0) continue;
      const velocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      const wa = a.asleep ? 0 : 1, wb = b.asleep ? 0 : 1, weight = wa + wb;
      if (!weight) continue;
      const correction = overlap / weight;
      a.x -= nx * correction * wa; a.y -= ny * correction * wa;
      b.x += nx * correction * wb; b.y += ny * correction * wb;
      if (velocity < 0) {
        const impulse = velocity * 1.3 / weight;
        a.vx += impulse * nx * wa; a.vy += impulse * ny * wa;
        b.vx -= impulse * nx * wb; b.vy -= impulse * ny * wb;
        if (pass === 0) { a.vx *= .8; b.vx *= .8; }
      }
    }
    for (const b of active) if (!b.asleep) bounds(b);
  }
  for (const b of active) {
    if (b.asleep) continue;
    b.grounded = supported.has(b) && Math.abs(b.vy) < 12;
    if (b.grounded) b.vy = 0;
    b.quiet = Math.hypot(b.vx, b.vy) < 12 ? b.quiet + GLYPH_STEP : 0;
    if (b.quiet >= .25) { b.asleep = true; b.vx = b.vy = b.spin = 0; }
  }
  return bodies.every(body => body.asleep);
}
