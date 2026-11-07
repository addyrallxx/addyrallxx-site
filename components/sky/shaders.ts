export const vertex = `
varying vec2 vUv;
void main() {
  vUv = position.xy * .5 + .5;
  gl_Position = vec4(position.xy, 0., 1.);
}
`;

export const skyFragment = `
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime, uScroll;
const vec3 PAPER = vec3(243.,240.,232.) / 255.;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) {
  return .666667 * noise(p) + .333333 * noise(p * 2.03 + vec2(8.1,3.7));
}
void main() {
  vec2 uv = vUv;
  // Translate the light field by .08 CSS pixels per scroll pixel.
  vec2 p = vec2(uv.x * uResolution.x, uv.y * uResolution.y + uScroll * .08) / uResolution.y;
  float field = fbm(p * 1.8 + vec2(uTime * .004, uTime * .002));
  float bands = .5 + .5 * sin((p.y - p.x * .3 + field * .18) * 8.);
  float grain = (hash(floor(uv * uResolution * .5) + vec2(uTime * .025, 0.)) - .5) * .012;
  float vignette = smoothstep(.2,.85,length(uv-.5)) * .018;
  vec3 color = PAPER + grain - vignette * vec3(.2,.55,1.);
  color -= (1. - bands) * vec3(.012,.014,.018);
  gl_FragColor = vec4(color,1.);
}
`;
