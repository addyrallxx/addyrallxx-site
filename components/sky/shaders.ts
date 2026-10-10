// Independently written stable-fluid passes using Pavel Dobryakov's MIT
// WebGL-Fluid-Simulation approach: advection, divergence, Jacobi pressure,
// gradient subtraction, splats. Curl is deliberately zero.
// Reference: https://github.com/PavelDoGreat/WebGL-Fluid-Simulation
export const vertex = `
varying vec2 vUv;
void main() {
  vUv = position.xy * .5 + .5;
  gl_Position = vec4(position.xy, 0., 1.);
}
`;

export const fluidFragment = `
varying vec2 vUv;
uniform sampler2D uSource, uVelocity, uPressure, uDivergence;
uniform vec2 uTexel, uPoint;
uniform vec3 uSplat;
uniform float uDt, uDissipation, uRadius, uAspect;
uniform int uPass;
void main() {
  vec2 uv = vUv;
  vec2 L = uv - vec2(uTexel.x, 0.);
  vec2 R = uv + vec2(uTexel.x, 0.);
  vec2 B = uv - vec2(0., uTexel.y);
  vec2 T = uv + vec2(0., uTexel.y);
  if (uPass == 0) {
    vec2 velocity = texture2D(uVelocity, uv).xy;
    gl_FragColor = texture2D(uSource, uv - uDt * velocity * uTexel) / (1. + uDissipation * uDt);
  } else if (uPass == 1) {
    vec2 p = uv - uPoint;
    p.x *= uAspect;
    vec3 splat = exp(-dot(p,p) / max(uRadius * uRadius, .000001)) * uSplat;
    gl_FragColor = vec4(texture2D(uSource, uv).xyz + splat, 1.);
  } else if (uPass == 2) {
    float l = texture2D(uVelocity, L).x;
    float r = texture2D(uVelocity, R).x;
    float b = texture2D(uVelocity, B).y;
    float t = texture2D(uVelocity, T).y;
    vec2 center = texture2D(uVelocity, uv).xy;
    if (L.x < 0.) l = -center.x;
    if (R.x > 1.) r = -center.x;
    if (B.y < 0.) b = -center.y;
    if (T.y > 1.) t = -center.y;
    gl_FragColor = vec4(.5 * (r-l+t-b), 0., 0., 1.);
  } else if (uPass == 3) {
    float l = texture2D(uPressure, L).x;
    float r = texture2D(uPressure, R).x;
    float b = texture2D(uPressure, B).x;
    float t = texture2D(uPressure, T).x;
    float divergence = texture2D(uDivergence, uv).x;
    gl_FragColor = vec4((l+r+b+t-divergence) * .25, 0., 0., 1.);
  } else if (uPass == 4) {
    float l = texture2D(uPressure, L).x;
    float r = texture2D(uPressure, R).x;
    float b = texture2D(uPressure, B).x;
    float t = texture2D(uPressure, T).x;
    vec2 velocity = texture2D(uVelocity, uv).xy - .5 * vec2(r-l,t-b);
    gl_FragColor = vec4(velocity, 0., 1.);
  } else {
    gl_FragColor = texture2D(uSource, uv) * .8;
  }
}
`;

// Shader-only palette from REDESIGN 2 and 6.2, in display RGB.
// Paper F3F0E8, ink 0A0F2C, night 030817, horizon 08143A,
// band 9DB4FF / F2D6B3, aurora 2BD49A / 7A5CFF.
export const skyFragment = `
varying vec2 vUv;
uniform vec2 uResolution;
uniform sampler2D uDye;
uniform float uTime, uScroll, uMode, uTarget, uSweep, uTransition, uIntro;
const vec3 PAPER = vec3(243.,240.,232.) / 255.;
const vec3 INK = vec3(10.,15.,44.) / 255.;
const vec3 NIGHT = vec3(3.,8.,23.) / 255.;
const vec3 HORIZON = vec3(8.,20.,58.) / 255.;
const vec3 BAND_COOL = vec3(157.,180.,255.) / 255.;
const vec3 BAND_WARM = vec3(242.,214.,179.) / 255.;
const vec3 AURORA_GREEN = vec3(43.,212.,154.) / 255.;
const vec3 AURORA_VIOLET = vec3(122.,92.,255.) / 255.;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  float sum = 0., amp = .5;
  for (int i=0; i<4; i++) { sum += amp*noise(p); p = p*2.03+vec2(8.1,3.7); amp *= .5; }
  return sum;
}
mat2 rotation(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }
vec3 stars(vec2 p, float scale, float threshold, float parallax, float layer) {
  p.y += uScroll / uResolution.y * parallax;
  p = rotation(uTime*.004) * (p-vec2(-.25,1.3)) + vec2(-.25,1.3);
  if (layer == 2.) p = rotation(.29670597)*p;
  vec2 grid = p*scale;
  vec2 cell = floor(grid);
  float h = hash(cell+layer*83.);
  if (h < threshold) return vec3(0);
  vec2 center = vec2(hash(cell+13.7),hash(cell+93.4))*.6+.2;
  vec2 q = fract(grid)-center;
  float size = mix(.025,.095,hash(cell+7.1));
  float d = length(q);
  float core = 1.-smoothstep(0.,size,d);
  float halo = .25*exp(-d*d/(size*size*5.));
  float light = core+halo;
  if (layer < 3.) light *= .75+.25*sin(uTime*(1.5+3.*h)+6.28*h);
  else {
    float glint = exp(-abs(q.x)/(.08*size))*max(0.,1.-abs(q.y)/(6.*size));
    glint += exp(-abs(q.y)/(.08*size))*max(0.,1.-abs(q.x)/(6.*size));
    light += .35*glint;
  }
  return mix(vec3(1.,.86,.68),vec3(.62,.74,1.),hash(cell+26.))*light;
}
vec3 day(vec2 uv) {
  float grain = (hash(floor(uv*uResolution))-.5)*.025;
  float vignette = smoothstep(.2,.85,length(uv-.5))*.018;
  return PAPER + grain - vignette*vec3(.2,.55,1.);
}
vec3 night(vec2 uv, float trail) {
  vec2 p = vec2(uv.x*uResolution.x/uResolution.y,uv.y);
  vec3 sky = mix(NIGHT,HORIZON,1.-smoothstep(0.,.30,uv.y));
  vec2 w = p;
  // Two octaves of domain warping before the diagonal band density.
  for (int i=0; i<2; i++) w += vec2(fbm(w*2.+float(i)*17.),fbm(w*2.+5.+float(i)*19.))*.15;
  float diagonal = w.y-.55*w.x-.1;
  float band = exp(-diagonal*diagonal/.018)*fbm(w*7.);
  sky += min(.16,band*.22)*mix(BAND_COOL,BAND_WARM,noise(w*2.));
  sky += stars(p,240.,.86,.02,1.);
  sky += stars(p,160.,.975,.05,2.);
  sky += stars(p,90.,.995,.09,3.);
  float curtain = fbm(vec2(p.x*8.+uTime*.02,p.y*1.5));
  float ripples = pow(max(0.,sin(p.x*22.+curtain*12.)),2.);
  float horizon = 1.-smoothstep(0.,.18,uv.y);
  vec3 aurora = mix(AURORA_GREEN,AURORA_VIOLET,curtain);
  float auroraAlpha = mix(.10,.55,trail)*horizon*curtain*ripples;
  sky = mix(sky,aurora,auroraAlpha);
  float block = floor(uTime/1.2);
  float phase = mod(uTime,1.2);
  if (uIntro > .5 && hash(vec2(block,72.)) < .22 && phase < .8) {
    vec2 origin = vec2(hash(vec2(block,13.))*1.6,.55+hash(vec2(block,29.))*.4);
    vec2 direction = normalize(vec2(.8,-.45));
    vec2 delta = p - (origin+direction*phase*.8);
    float along = dot(delta,direction);
    float across = abs(dot(delta,vec2(-direction.y,direction.x)));
    float tail = smoothstep(-.30,0.,along)*(1.-smoothstep(0.,.015,along));
    float streak = exp(-across*across/.000002)*tail*sin(phase/.8*3.14159);
    sky += vec3(1.,.86,.68)*streak;
  }
  return sky;
}
vec3 world(vec2 uv, float mode) {
  float m = 1.-smoothstep(.001,.004,length(texture2D(uDye,uv).rgb));
  vec3 n = night(uv, (1.-m)*mode);
  return mix(mix(n,day(uv),m),n,mode);
}
void main() {
  vec2 uv = vUv;
  vec3 color;
  if (uTransition > .5) {
    float coordinate = uTarget > .5 ? uv.y : 1.-uv.y;
    float warped = coordinate + noise(uv*3.+uTime)*.06;
    float edge = smoothstep(uSweep-.03,uSweep+.01,warped);
    float revealed = 1.-edge;
    color = mix(world(uv,uMode),world(uv,uTarget),revealed);
    float fringe = edge*(1.-edge)*4.;
    color.r = mix(color.r,world(uv+vec2(.015,0),uTarget).r,fringe*.5);
    color.b = mix(color.b,world(uv-vec2(.015,0),uTarget).b,fringe*.5);
  } else color = world(uv,uMode);
  gl_FragColor = vec4(color,1.);
}
`;
