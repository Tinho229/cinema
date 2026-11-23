// Conservé pour rester aligné avec ton arbre.
// La révélation actuelle est faite en CSS (damiers + GSAP), pas en shader.

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  }
`;