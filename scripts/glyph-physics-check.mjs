import assert from 'node:assert/strict';
import { createGlyphBodies, stepGlyphBodies, GLYPH_STEP } from '../lib/glyph-physics.ts';
for (const width of [350, 960, 1368]) for (let seed = 1; seed <= 30; seed++) {
  let state = seed;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32; };
  const boxes = [120,84,150,96,110,136,124,86,64,104].map(size => ({width:size * width / 1440,height:size * width / 1440}));
  const bodies = createGlyphBodies(boxes, width, random);
  let asleep = false, bounce = false, previous = bodies.map(b => b.y), fell = bodies.map(() => false);
  for (let time = 0; time < 4; time += GLYPH_STEP) {
    asleep = stepGlyphBodies(bodies, width, 360, time);
    bodies.forEach((b,i) => { if (b.y > previous[i]) fell[i] = true; if (fell[i] && b.y < previous[i]) bounce = true; previous[i] = b.y; });
    if (asleep) break;
  }
  assert.ok(bounce, 'at least one glyph bounces');
  assert.ok(asleep, `all sleep in 4s, width ${width}, seed ${seed}: ${JSON.stringify(bodies.filter(b=>!b.asleep))}`);
  assert.ok(bodies.every(b => {
    const angle = b.angle * Math.PI / 180, c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle));
    const hx = (c*b.width+s*b.height)/2, hy = (s*b.width+c*b.height)/2;
    return b.x >= hx-.001 && b.x <= width-hx+.001 && b.y >= hy-.001 && b.y <= 360-hy+.001;
  }), `settled rotated glyph boxes stay inside the pit, width ${width}, seed ${seed}`);
}
console.log('90 seeded glyph drops pass bounce, bounds and 4s sleep checks.');
const pair = createGlyphBodies([{width:40,height:40},{width:40,height:40}], 500, () => .5);
Object.assign(pair[0], {x:200,y:200,vx:30,release:0,spin:0});
Object.assign(pair[1], {x:240,y:200,vx:-30,release:0,spin:0});
stepGlyphBodies(pair, 500, 360, 1);
assert.ok(Math.abs(pair[0].vx + 7.2) < .001 && Math.abs(pair[1].vx - 7.2) < .001, 'circle collision uses .3 restitution and .8 horizontal bounce damping');
assert.ok(Math.hypot(pair[1].x-pair[0].x,pair[1].y-pair[0].y) >= pair[0].radius+pair[1].radius-.001, 'overlap is corrected');
console.log('Circle collision restitution and positional correction pass.');
