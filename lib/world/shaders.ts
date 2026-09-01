export const POINT_VERTEX_SHADER = `precision highp float;
precision highp int;

uniform sampler2D uFormations;
uniform vec2 uTextureSize;
uniform float uParticleCount;
uniform float uProgress;
uniform float uPointScale;
uniform float uViewportHeight;
uniform vec3 uFieldColor;
uniform vec3 uSignalColor;
uniform float uOpacity;

in float aIndex;

out vec3 vPointColor;
out float vPointOpacity;

ivec2 formationTexel(int formationIndex, int particleIndex) {
  int width = max(1, int(uTextureSize.x));
  int linearIndex = formationIndex * int(uParticleCount) + particleIndex;
  return ivec2(linearIndex % width, linearIndex / width);
}

vec4 readFormation(int formationIndex, int particleIndex) {
  return texelFetch(uFormations, formationTexel(formationIndex, particleIndex), 0);
}

void main() {
  float progress = clamp(uProgress, 0.0, 5.0);
  int currentIndex;
  int nextIndex;
  float localProgress;

  if (progress >= 5.0) {
    currentIndex = 5;
    nextIndex = 5;
    localProgress = 0.0;
  } else if (progress >= 2.0 && progress < 3.0) {
    currentIndex = 2;
    nextIndex = 3;
    localProgress = progress < 2.22 ? 0.0 : (progress - 2.22) / 0.78;
  } else {
    currentIndex = int(floor(progress));
    nextIndex = min(currentIndex + 1, 5);
    localProgress = fract(progress);
  }

  localProgress = clamp(localProgress, 0.0, 1.0);
  float morph = smoothstep(0.0, 1.0, localProgress);
  int particleIndex = int(aIndex + 0.5);
  vec4 currentTarget = readFormation(currentIndex, particleIndex);
  vec4 nextTarget = readFormation(nextIndex, particleIndex);
  vec3 morphedPosition = mix(currentTarget.xyz, nextTarget.xyz, morph);
  vec4 viewPosition = modelViewMatrix * vec4(morphedPosition, 1.0);

  gl_Position = projectionMatrix * viewPosition;
  float size = mix(abs(currentTarget.w), abs(nextTarget.w), morph);
  float activePoint = max(
    step(0.0001, abs(currentTarget.w)),
    step(0.0001, abs(nextTarget.w))
  );
  gl_PointSize = activePoint * size * uPointScale * uViewportHeight / max(-viewPosition.z, 0.0001);

  float currentSignal = step(0.0001, -currentTarget.w);
  float nextSignal = step(0.0001, -nextTarget.w);
  float signal = mix(currentSignal, nextSignal, morph);
  vPointColor = mix(uFieldColor, uSignalColor, signal);
  vPointOpacity = uOpacity;
}
`;

export const POINT_FRAGMENT_SHADER = `precision highp float;

uniform float uOpacity;

in vec3 vPointColor;
in float vPointOpacity;

out vec4 outColor;

void main() {
  vec2 point = gl_PointCoord * 2.0 - 1.0;
  float alpha = 1.0 - smoothstep(0.82, 1.0, dot(point, point));
  float opacity = alpha * min(uOpacity, vPointOpacity);
  if (opacity < 0.5) discard;
  outColor = vec4(vPointColor, opacity);
  outColor = linearToOutputTexel(outColor);
}
`;

export const EDGE_VERTEX_SHADER = `precision highp float;

uniform float uProgress;

in float aEdgeEnd;

out float vEdgeOpacity;

void main() {
  float fadeIn = smoothstep(1.65, 1.98, uProgress);
  float fadeOut = 1.0 - smoothstep(2.0, 2.18, uProgress);
  float direction = mix(0.35, 1.0, clamp(aEdgeEnd, 0.0, 1.0));
  vEdgeOpacity = fadeIn * fadeOut * direction;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const EDGE_FRAGMENT_SHADER = `precision highp float;

uniform vec3 uSignalColor;
uniform float uOpacity;

in float vEdgeOpacity;

out vec4 outColor;

void main() {
  float opacity = vEdgeOpacity * uOpacity;
  if (opacity < 0.01) discard;
  outColor = vec4(uSignalColor, opacity);
  outColor = linearToOutputTexel(outColor);
}
`;
