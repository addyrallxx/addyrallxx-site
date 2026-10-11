export type GlyphBody = {
  x: number; y: number; vx: number; vy: number; angle: number; spin: number;
  width: number; height: number; radius: number; release: number; quiet: number; asleep: boolean; grounded: boolean;
};
export const GLYPH_STEP = 1 / 120;

export function createGlyphBodies(boxes: { width: number; height: number }[], width: number, random = Math.random): GlyphBody[] {
  const radii = boxes.map(box => .42 * Math.hypot(box.width, box.height));
  const columns = Math.max(1, Math.floor(width / Math.max(...boxes.map(box => box.width * 1.3))));
  const loads = new Array<number>(columns).fill(0);
  const order = Array.from({ length: columns }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const positions = new Array<number>(boxes.length);
  const lanes = new Array<number>(boxes.length);
  const releaseTimes = new Array<number>(columns).fill(-1);
  boxes.map((box, i) => ({ box, i })).sort((a,b) => b.box.height - a.box.height).forEach(({ box, i }) => {
    const column = order.reduce((best, candidate) => loads[candidate] < loads[best] ? candidate : best, order[0]);
    positions[i] = (column + .5) * width / columns;
    lanes[i] = column;
    loads[column] += box.height;
  });
  return boxes.map((box, i) => {
    const radius = radii[i];
    // Random columns balance the larger tiles so a narrow pit cannot form one tall clump.
    const x = Math.max(radius, Math.min(width - radius, positions[i]));
    const release = Math.max(i * .11, releaseTimes[lanes[i]] + 1);
    releaseTimes[lanes[i]] = release;
    return { ...box, radius, x, y: -box.height / 2 - random() * 160,
      vx: 0, vy: 0, angle: 0, spin: (random() * 2 - 1) * 35, release, quiet: 0, asleep: false, grounded: false };
  });
}

export function stepGlyphBodies(bodies: GlyphBody[], width: number, height: number, time: number) {
  const active = bodies.filter(body => time >= body.release);
  const supported = new Set<GlyphBody>();
  const floorContacts = new Set<GlyphBody>();
  const bounds = (b: GlyphBody) => {
    const angle = b.angle * Math.PI / 180;
    const hx = (Math.abs(Math.cos(angle)) * b.width + Math.abs(Math.sin(angle)) * b.height) / 2;
    const hy = (Math.abs(Math.sin(angle)) * b.width + Math.abs(Math.cos(angle)) * b.height) / 2;
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
  // Rotated bounding boxes include the entire tile and give stable resting contacts.
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
      const a = active[i], b = active[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const aa = a.angle * Math.PI / 180, ba = b.angle * Math.PI / 180;
      const ac = Math.cos(aa), as = Math.sin(aa), bc = Math.cos(ba), bs = Math.sin(ba);
      const ox = (Math.abs(ac) * a.width + Math.abs(as) * a.height + Math.abs(bc) * b.width + Math.abs(bs) * b.height) / 2 - Math.abs(dx);
      const oy = (Math.abs(as) * a.width + Math.abs(ac) * a.height + Math.abs(bs) * b.width + Math.abs(bc) * b.height) / 2 - Math.abs(dy);
      const overlap = Math.min(ox, oy);
      const nx = ox < oy ? (dx < 0 ? -1 : 1) : 0, ny = ox < oy ? 0 : (dy < 0 ? -1 : 1);
      if (overlap < -.25) continue;
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
