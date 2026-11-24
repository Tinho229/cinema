import { Effect } from "postprocessing";
import { Uniform } from "three";
import { showcaseState } from "@/lib/showcaseState";

/* ------------------------------------------------------------------
   Rendu « écran incurvé » de la référence (section après le scroll)

   1. Cadre arrondi : la compression HORIZONTALE grandit avec la distance
      verticale au centre -> les coins sortent de l'image et deviennent
      noirs, avec un arrondi (visible sur la capture du hero).
   2. Cartes plus hautes vers les côtés : l'échelle VERTICALE grandit
      avec la distance horizontale au centre -> les bords haut/bas des
      cartes latérales se relèvent. L'axe horizontal médian n'est pas
      déformé : espacement régulier, carte centrale parfaitement plane.
   3. Aberration chromatique horizontale, nulle au centre, max. sur les
      bords (franges rouge / bleu).
   4. Vignettage + grain animé, appliqués après la déformation.
------------------------------------------------------------------- */
const frag = /* glsl */ `
uniform float uKx;      // arrondi du cadre (coins noirs)
uniform float uKy;      // hauteur croissante vers les côtés
uniform float uCa;      // aberration chromatique
uniform float uGrain;   // intensité du grain
uniform float uTime;

vec2 curve(vec2 uv) {
  vec2 c = uv - 0.5;
  vec2 n = c * 2.0;                         // -1 .. 1
  float fx = 1.0 + uKx * n.y * n.y;         // > 1 : compresse vers le centre
  float fy = 1.0 - uKy * n.x * n.x;         // < 1 : agrandit vers les côtés
  return 0.5 + vec2(c.x * fx, c.y * fy);
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 base = curve(uv);

  float cx = uv.x - 0.5;
  vec2 d = vec2(cx * abs(cx), 0.0) * uCa * 4.0;

  vec4 r = texture2D(inputBuffer, base + d);
  vec4 g = texture2D(inputBuffer, base);
  vec4 b = texture2D(inputBuffer, base - d);

  vec3 col = vec3(r.r, g.g, b.b);
  float a = max(r.a, max(g.a, b.a));

  // vignettage
  float v = 1.0 - smoothstep(0.3, 0.95, length((uv - 0.5) * vec2(1.0, 1.15)));
  col *= mix(0.3, 1.0, v);

  // grain animé (24 images/s), ajouté en espace « perceptuel »
  float n = hash(gl_FragCoord.xy + floor(uTime * 24.0) * 17.0) - 0.5;
  vec3 s = max(sqrt(max(col, 0.0)) + n * uGrain * a, 0.0);
  col = s * s;

  // hors de l'image (coins arrondis) : noir opaque, bord légèrement adouci
  float inside = smoothstep(0.0, 0.003, min(min(base.x, 1.0 - base.x), min(base.y, 1.0 - base.y)));
  inside = mix(1.0, inside, clamp((uKx + uKy) * 40.0, 0.0, 1.0)); // lentille éteinte : aucun bord noir
  col *= inside;
  a = mix(1.0, a, inside);

  outputColor = vec4(col, a);
}
`;

type Options = {
  /** arrondi du cadre / coins noirs */
  kx?: number;
  /** hauteur croissante des cartes vers les côtés */
  ky?: number;
  /** aberration chromatique sur les bords */
  ca?: number;
  /** intensité du grain */
  grain?: number;
};

export class LensEffect extends Effect {
  private kx: number;
  private ky: number;
  private ca: number;
  private time = 0;

  constructor({ kx = 0.025, ky = 0.12, ca = 0.012, grain = 0.1 }: Options = {}) {
    super("LensEffect", frag, {
      uniforms: new Map<string, Uniform>([
        ["uKx", new Uniform(0)],
        ["uKy", new Uniform(0)],
        ["uCa", new Uniform(0)],
        ["uGrain", new Uniform(grain)],
        ["uTime", new Uniform(0)],
      ]),
    });
    this.kx = kx;
    this.ky = ky;
    this.ca = ca;
  }

  update(_renderer: unknown, _inputBuffer: unknown, deltaTime = 0) {
    this.time += deltaTime;
    // la lentille monte avec le scroll (showcaseState.lens : 0 -> 1)
    const l = showcaseState.lens;
    this.uniforms.get("uKx")!.value = this.kx * l;
    this.uniforms.get("uKy")!.value = this.ky * l;
    this.uniforms.get("uCa")!.value = this.ca * l;
    this.uniforms.get("uTime")!.value = this.time;
  }
}