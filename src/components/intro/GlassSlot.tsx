"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

import {
  CanvasTexture,
  Color,
  MathUtils,
  SRGBColorSpace,
  Vector2,
  type Mesh,
  type ShaderMaterial,
  type Texture,
} from "three";
import { HERO_DIM, showcaseState } from "@/lib/showcaseState";
import { N_PROJECTS, projectAt, slotRect, transition } from "@/lib/showcaseLayout";
import { PROJECTS, type Note } from "@/lib/showcaseContent";
import { drawGlassText, GLASS_TEXT_H, GLASS_TEXT_W } from "@/lib/glassText";

/* ------------------------------------------------------------------
   Verre dépoli dessiné DANS la scène WebGL (voir la version précédente
   pour le détail du rendu : fond réduit, saturation, arêtes, reflet…).

   Transition « verre brisé ».
   Pendant la transition (uT : 0 -> 1), le verre est découpé en une grille
   de GRID_X × GRID_Y petits carrés. Chaque carré, avec un retard aléatoire :
     1. rétrécit en tournant un peu, son contenu zoome, puis disparaît (u 0 -> .5)
     2. à mi-parcours, passe du texte actuel au texte suivant
     3. se reconstruit (u .5 -> 1) jusqu'à reprendre sa place

   Fond vu à travers le verre : c'est l'image du hero (calque DOM sous le canvas),
   donc sa luminosité suit celle du fond : voir useFrame (HERO_DIM).
------------------------------------------------------------------- */

const GRID_X = 16;
const GRID_Y = 10; // 16 / 10 = 1.6 = ratio d'une carte : carrés parfaits

const VERT = /* glsl */ `
varying vec2 vUv;
varying vec2 vWorld;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xy; // caméra orthographique : 1 unité = 1 px, origine au centre
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAG = /* glsl */ `
uniform sampler2D tBack;   // fond très réduit (donc flou)
uniform sampler2D tTextA;  // texte actuel
uniform sampler2D tTextB;  // texte suivant
uniform vec2  uTexel;
uniform vec2  uBgSize;
uniform vec2  uSize;
uniform vec2  uGrid;       // nombre de carrés (x, y)
uniform float uPad;
uniform vec3  uTint;
uniform float uBgAlpha;
uniform float uOpacity;
uniform float uTextAlpha;
uniform float uTime;
uniform float uT;          // avancement de la transition 0 -> 1
varying vec2 vUv;
varying vec2 vWorld;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 backdrop(vec2 uv) {
  vec3 s = vec3(0.0);
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      float w = (2.0 - abs(float(x))) * (2.0 - abs(float(y)));
      s += texture2D(tBack, uv + vec2(float(x), float(y)) * uTexel * 1.5).rgb * w;
    }
  }
  return s / 16.0;
}

void main() {
  // q : position en px depuis le coin bas-gauche du verre (négatif = marge d'ombre)
  vec2 q = vUv * (uSize + 2.0 * uPad) - uPad;
  vec2 g0 = q / uSize;
  float dEdge = min(min(q.x, q.y), min(uSize.x - q.x, uSize.y - q.y));
  float inside = clamp(dEdge + 0.5, 0.0, 1.0);

  // --- ombre portée
  vec2 qs = q + vec2(0.0, uPad * 0.45);
  vec2 ds = max(vec2(0.0), max(-qs, qs - uSize));
  float sh = 1.0 - smoothstep(0.0, uPad, length(ds));
  float shadow = sh * sh * 0.5;

  // --- brisure : on remplace g (point du verre à dessiner) par le point
  //     d'origine du carré en cours de rétrécissement
  vec2  g = g0;
  float useB = 0.0;      // 1 : texte suivant
  float alphaT = 1.0;    // 0 : carré disparu
  float crack = 0.0;     // éclat sur les arêtes des carrés
  bool inGlass = g0.x >= 0.0 && g0.x <= 1.0 && g0.y >= 0.0 && g0.y <= 1.0;

  if (inGlass && uT > 0.0 && uT < 1.0) {
    vec2 cell = min(floor(g0 * uGrid), uGrid - 1.0);
    vec2 ctr = (cell + 0.5) / uGrid;
    vec2 hc = 0.5 / uGrid;

    float r1 = hash21(cell + 1.7);
    float r2 = hash21(cell + 9.1);

    // retard aléatoire + légère vague en diagonale
    float delay = r1 * 0.3 + 0.1 * ((cell.x / uGrid.x) + (1.0 - cell.y / uGrid.y)) * 0.5;
    float u = clamp((uT - delay) / 0.6, 0.0, 1.0);

    float b = u < 0.5 ? smoothstep(0.0, 0.5, u) : 1.0 - smoothstep(0.5, 1.0, u);
    useB = step(0.5, u);

    float s = max(1.0 - 0.95 * b, 0.05);          // le carré rétrécit
    float ang = (r2 - 0.5) * 1.4 * b;             // et tourne un peu
    mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));

    vec2 lc = (g0 - ctr) / hc;                    // -1..1 dans le carré
    vec2 lp = (R * lc) / s;                       // même point, repère du carré d'origine
    float m = max(abs(lp.x), abs(lp.y));

    alphaT = (1.0 - smoothstep(0.96, 1.0, m)) * (1.0 - smoothstep(0.65, 1.0, b));
    crack = smoothstep(0.7, 1.0, m) * b;

    float z = 1.0 + 0.7 * b;                      // zoom du contenu
    g = ctr + (lp * hc) / z;
  }
  shadow *= inGlass ? alphaT : 1.0;
  shadow *= 1.0 - 0.3 * sin(3.14159265 * uT);

  // --- ce qui est derrière : fond flou, légèrement réfracté
  vec2 c = g - 0.5;
  vec2 shift = -c * 0.05 - normalize(c + 1e-5) * pow(length(c * 2.0), 3.0) * 0.02;
  vec2 bgUv = vWorld / uBgSize + 0.5 + shift * (uSize / uBgSize);
  vec3 col = backdrop(bgUv) * uTint * uBgAlpha;

  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(lum), col, 1.5) * 1.3;
  col += vec3(0.95, 0.97, 1.0) * 0.03;

  // --- profondeur
  float diag = 0.5 * (g.x + (1.0 - g.y));
  col += 0.05 * (1.0 - smoothstep(0.0, 0.55, length(vec2(g.x, 1.0 - g.y) * vec2(0.9, 1.3))));
  col += vec3(0.67, 0.8, 1.0) * 0.03 * smoothstep(0.45, 1.0, diag);
  col *= 1.0 - 0.28 * smoothstep(0.35, 1.0, diag);

  // --- arêtes du verre (calculées sur la vraie position)
  float eTop   = 1.0 - smoothstep(0.0, 1.4, uSize.y - q.y);
  float eLeft  = 1.0 - smoothstep(0.0, 1.4, q.x);
  float eBot   = 1.0 - smoothstep(0.0, 1.4, q.y);
  float eRight = 1.0 - smoothstep(0.0, 1.4, uSize.x - q.x);
  col += vec3(1.0) * (eTop * 0.25 + eLeft * 0.12);
  col *= 1.0 - (eBot * 0.45 + eRight * 0.2);
  float rim = max(max(eTop, eLeft), max(eBot, eRight));
  float spec = 0.9 * (1.0 - smoothstep(0.0, 0.28, diag)) + 0.55 * smoothstep(0.6, 1.0, diag) + 0.06;
  col += vec3(1.0) * rim * spec * 0.4;
  col += 0.025 * (1.0 - smoothstep(0.0, 16.0, dEdge));

  // --- reflet diagonal qui balaie la surface
  float ph = fract(uTime / 9.0);
  float sc = mix(1.6, -0.45, smoothstep(0.15, 0.6, ph));
  float sw = g.x * 0.85 + (1.0 - g.y) * 0.35;
  float d1 = (sw - sc) / 0.13;
  float d2 = (sw - sc - 0.1) / 0.3;
  col += vec3(1.0) * (exp(-d1 * d1) * 0.09 + exp(-d2 * d2) * 0.02);

  // --- arêtes des éclats : lueur claire pendant la brisure
  col += vec3(0.85, 0.92, 1.0) * crack * 0.45;

  // --- texte (actuel ou suivant, carré par carré)
  vec4 t = mix(texture2D(tTextA, g), texture2D(tTextB, g), useB);
  col = mix(col, t.rgb, t.a * uTextAlpha);

  float body = inside * alphaT;
  gl_FragColor = vec4(mix(vec3(0.0), col, body), mix(shadow, 1.0, body) * uOpacity);
}
`;

/* Fond réduit une seule fois pour tous les verres. */
const BACKDROP_W = 160;
const backdrops = new WeakMap<Texture, CanvasTexture>();

function getBackdrop(hero: Texture): CanvasTexture {
  const hit = backdrops.get(hero);
  if (hit) return hit;

  const img = hero.image as HTMLImageElement;
  const ratio = img.height / img.width;
  let cur: CanvasImageSource = img;
  let w = img.width;
  do {
    w = Math.max(BACKDROP_W, Math.floor(w / 2));
    const c = document.createElement("canvas");
    c.width = w;
    c.height = Math.max(1, Math.round(w * ratio));
    c.getContext("2d")?.drawImage(cur, 0, 0, c.width, c.height);
    cur = c;
  } while (w > BACKDROP_W);

  const t = new CanvasTexture(cur as HTMLCanvasElement);
  t.colorSpace = SRGBColorSpace;
  t.generateMipmaps = false;
  backdrops.set(hero, t);
  return t;
}

/* Une texture de texte par note, partagée entre tous les verres :
   chaque verre en affiche successivement plusieurs. Redessinée une fois
   les polices chargées (la mesure des lignes en dépend). */
const noteTextures = new Map<Note, CanvasTexture>();

function getNoteTexture(note: Note): CanvasTexture {
  const hit = noteTextures.get(note);
  if (hit) return hit;

  const canvas = document.createElement("canvas");
  canvas.width = GLASS_TEXT_W;
  canvas.height = GLASS_TEXT_H;
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;

  const paint = () => {
    drawGlassText(canvas, note);
    t.needsUpdate = true;
  };
  paint();
  document.fonts?.ready.then(paint);

  noteTextures.set(note, t);
  return t;
}

type Props = {
  /** emplacement dans la rangée (voir SLOTS) */
  i: number;
  /** projet de base de l'emplacement : le défilement le fait tourner */
  project: number;
  /** décalage du reflet qui balaie, en secondes */
  phase?: number;
};

export function GlassSlot({ i, project, phase = 0 }: Props) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<ShaderMaterial>(null);
  const hero = useTexture("/images/hero.jpg");
  const { size } = useThree();

  const backdrop = useMemo(() => getBackdrop(hero), [hero]);
  const texts = useMemo(() => PROJECTS.map((p) => getNoteTexture(p.note)), []);

  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const args = useMemo(() => {
    const b = backdrop.image as HTMLCanvasElement;
    return {
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        tBack: { value: backdrop },
        tTextA: { value: texts[project % N_PROJECTS] },
        tTextB: { value: texts[project % N_PROJECTS] },
        uTexel: { value: new Vector2(1 / b.width, 1 / b.height) },
        uBgSize: { value: new Vector2(1, 1) },
        uSize: { value: new Vector2(1, 1) },
        uGrid: { value: new Vector2(GRID_X, GRID_Y) },
        uPad: { value: 0 },
        uTint: { value: new Color(1, 1, 1) }, // réglée à chaque frame (luminosité du fond)
        uBgAlpha: { value: 1 },
        uOpacity: { value: 0 },
        uTextAlpha: { value: 0 },
        uTime: { value: 0 },
        uT: { value: 0 },
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdrop, texts]);

  useFrame((state) => {
    const m = mesh.current;
    const mt = mat.current;
    if (!m || !mt) return;

    const { spread, bg, step } = showcaseState;
    m.visible = spread > 0.001;
    if (!m.visible) return;

    const slot = slotRect("glass", i, size.width, spread);
    const pad = slot.h * 0.14;
    m.position.set(slot.x, slot.y, 0);
    m.scale.set(slot.w + pad * 2, slot.h + pad * 2, 1);
    const img = hero.image as HTMLImageElement;
    const imgRatio = img.width / img.height;
    const viewRatio = size.width / size.height;
    const bw = (viewRatio > imgRatio ? size.width : size.height * imgRatio) * 1.02;
    const bh = (viewRatio > imgRatio ? size.width / imgRatio : size.height) * 1.02;

    // textes : actuel (A) et suivant (B)
    const { cur, t } = transition(step);

    const u = mt.uniforms;
    u.tTextA.value = texts[projectAt(project, cur, 0)];
    u.tTextB.value = texts[projectAt(project, cur, 1)];
    u.uT.value = t;
    u.uBgSize.value.set(bw, bh);
    u.uSize.value.set(slot.w, slot.h);
    u.uPad.value = pad;

    // Luminosité du fond derrière le verre = celle de l'image du hero à l'écran :
    // 1 au départ, HERO_DIM une fois le fondu terminé (même courbe que .hero-soft).
    // setRGB(..., SRGBColorSpace) convertit comme le fait le navigateur pour le voile noir.
    const dim = MathUtils.lerp(1, HERO_DIM, bg);
    u.uTint.value.setRGB(dim, dim, dim, SRGBColorSpace);
    u.uBgAlpha.value = 1;

    u.uOpacity.value = spread;
    u.uTextAlpha.value = MathUtils.smoothstep(spread, 0.55, 1);
    u.uTime.value = reduced ? 0 : state.clock.elapsedTime + phase;
  });

  return (
    // renderOrder 0.5 : sous les images (1 et 2), pour que leur bord
    // recouvre l'ombre du verre voisin plutôt que l'inverse
    <mesh ref={mesh} renderOrder={0.5} visible={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={mat}
        args={[args]}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}