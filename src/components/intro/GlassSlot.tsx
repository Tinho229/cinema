"use client";

import { useEffect, useMemo, useRef } from "react";
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
import { showcaseState } from "@/lib/showcaseState";
import { edgeFade, restingSlot, slotPos } from "@/lib/showcaseLayout";
import type { Note } from "@/lib/showcaseContent";
import { drawGlassText, GLASS_TEXT_H, GLASS_TEXT_W } from "@/lib/glassText";

/* ------------------------------------------------------------------
   Verre dépoli (glassmorphism) dessiné DANS la scène WebGL.

   Un `backdrop-filter` CSS ne verrait pas la lentille : le verre resterait
   plat et net au milieu d'un décor déformé. Ici le verre est une carte comme
   les autres, donc la lentille le courbe avec le reste.

   Comme WebGL n'a pas de backdrop-filter, le « flou de ce qui est derrière »
   est reconstitué : le verre ne recouvre que le décor (les cartes sont côte
   à côte, sans se chevaucher), on relit donc l'image du fond, très floutée.
   Le shader ajoute ensuite ce que fait .glass-panel en CSS : saturation,
   voile laiteux, reflet haut-gauche, arêtes lumineuses, reflet qui balaie,
   ombre portée. Le texte vient d'un canvas (glassText.ts).
------------------------------------------------------------------- */

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
uniform sampler2D tText;   // texte du verre (canvas)
uniform vec2  uTexel;      // taille d'un texel de tBack, en uv
uniform vec2  uBgSize;     // taille du plan de fond, en px (cf. Background)
uniform vec2  uSize;       // taille du verre, en px
uniform float uPad;        // marge autour du verre pour l'ombre portée, en px
uniform vec3  uTint;       // même teinte que le matériau du fond
uniform float uBgAlpha;
uniform float uOpacity;
uniform float uTextAlpha;
uniform float uTime;
varying vec2 vUv;
varying vec2 vWorld;

// flou 3x3 pondéré par-dessus le fond déjà réduit : adoucit les « losanges »
// de l'interpolation bilinéaire quand la petite texture est agrandie
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
  vec2 g = q / uSize;                       // uv du verre lui-même, 0..1
  float dEdge = min(min(q.x, q.y), min(uSize.x - q.x, uSize.y - q.y));
  float inside = clamp(dEdge + 0.5, 0.0, 1.0);

  // --- ombre portée (décalée vers le bas, comme le box-shadow du CSS)
  vec2 qs = q + vec2(0.0, uPad * 0.45);
  vec2 ds = max(vec2(0.0), max(-qs, qs - uSize));
  float sh = 1.0 - smoothstep(0.0, uPad, length(ds));
  float shadow = sh * sh * 0.5;

  // --- ce qui est derrière : fond flou, légèrement réfracté
  vec2 c = g - 0.5;
  vec2 shift = -c * 0.05 - normalize(c + 1e-5) * pow(length(c * 2.0), 3.0) * 0.02;
  vec2 bgUv = vWorld / uBgSize + 0.5 + shift * (uSize / uBgSize);
  vec3 col = backdrop(bgUv) * uTint * uBgAlpha;

  // saturation + luminosité (≈ saturate(1.7) brightness(1.1) du verre CSS)
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(lum), col, 1.5) * 1.3;
  col += vec3(0.95, 0.97, 1.0) * 0.03;      // voile laiteux

  // --- profondeur : reflet haut-gauche, teinte froide et ombre bas-droite
  float diag = 0.5 * (g.x + (1.0 - g.y));   // 0 en haut à gauche, 1 en bas à droite
  col += 0.05 * (1.0 - smoothstep(0.0, 0.55, length(vec2(g.x, 1.0 - g.y) * vec2(0.9, 1.3))));
  col += vec3(0.67, 0.8, 1.0) * 0.03 * smoothstep(0.45, 1.0, diag);
  col *= 1.0 - 0.28 * smoothstep(0.35, 1.0, diag);

  // --- arêtes (épaisseur du verre) : claires en haut/gauche, sombres en bas/droite
  float eTop   = 1.0 - smoothstep(0.0, 1.4, uSize.y - q.y);
  float eLeft  = 1.0 - smoothstep(0.0, 1.4, q.x);
  float eBot   = 1.0 - smoothstep(0.0, 1.4, q.y);
  float eRight = 1.0 - smoothstep(0.0, 1.4, uSize.x - q.x);
  col += vec3(1.0) * (eTop * 0.25 + eLeft * 0.12);
  col *= 1.0 - (eBot * 0.45 + eRight * 0.2);
  // liseré spéculaire : brillant aux deux coins opposés (comme le ::before du CSS)
  float rim = max(max(eTop, eLeft), max(eBot, eRight));
  float spec = 0.9 * (1.0 - smoothstep(0.0, 0.28, diag)) + 0.55 * smoothstep(0.6, 1.0, diag) + 0.06;
  col += vec3(1.0) * rim * spec * 0.4;
  // lueur interne le long des bords
  col += 0.025 * (1.0 - smoothstep(0.0, 16.0, dEdge));

  // --- reflet diagonal qui balaie la surface (9 s, avec pause)
  float ph = fract(uTime / 9.0);
  float sc = mix(1.6, -0.45, smoothstep(0.15, 0.6, ph));
  float s = g.x * 0.85 + (1.0 - g.y) * 0.35;
  float d1 = (s - sc) / 0.13;
  float d2 = (s - sc - 0.1) / 0.3;
  col += vec3(1.0) * (exp(-d1 * d1) * 0.09 + exp(-d2 * d2) * 0.02);

  // --- texte
  vec4 t = texture2D(tText, g);
  col = mix(col, t.rgb, t.a * uTextAlpha);

  gl_FragColor = vec4(mix(vec3(0.0), col, inside), mix(shadow, 1.0, inside) * uOpacity);
}
`;

/* Fond réduit une seule fois pour tous les verres (le plus gros travail).
   Réduction par moitiés successives : un seul saut 16× crénèlerait l'image. */
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

/* Redessine le canvas du texte et prévient three de renvoyer la texture au GPU. */
function paintGlassText(tex: CanvasTexture, note: Note) {
  drawGlassText(tex.image as HTMLCanvasElement, note);
  tex.needsUpdate = true;
}

type Props = {
  /** emplacement dans la rangée (voir SLOTS) */
  i: number;
  note: Note;
  /** décalage du reflet qui balaie, en secondes, pour que deux verres ne brillent pas ensemble */
  phase?: number;
};

export function GlassSlot({ i, note, phase = 0 }: Props) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<ShaderMaterial>(null);
  const hero = useTexture("/images/hero.jpg"); // déjà en cache : partagé avec Background
  const { size } = useThree();

  const backdrop = useMemo(() => getBackdrop(hero), [hero]);

  const text = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = GLASS_TEXT_W;
    canvas.height = GLASS_TEXT_H;
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);

  // (re)dessine le texte : au montage, quand il change, et une fois les polices
  // chargées (la mesure des lignes en dépend)
  useEffect(() => {
    let alive = true;
    paintGlassText(text, note);
    document.fonts?.ready.then(() => alive && paintGlassText(text, note));
    return () => {
      alive = false;
    };
  }, [text, note]);

  useEffect(() => () => text.dispose(), [text]);

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
        tText: { value: text },
        uTexel: { value: new Vector2(1 / b.width, 1 / b.height) },
        uBgSize: { value: new Vector2(1, 1) },
        uSize: { value: new Vector2(1, 1) },
        uPad: { value: 0 },
        uTint: { value: new Color("#777777") }, // = color du matériau de Background
        uBgAlpha: { value: 0 },
        uOpacity: { value: 0 },
        uTextAlpha: { value: 0 },
        uTime: { value: 0 },
      },
    };
  }, [backdrop, text]);

  useFrame((state) => {
    const m = mesh.current;
    const mt = mat.current;
    if (!m || !mt) return;

    const { spread, bg, step } = showcaseState;
    // même position bouclée et même fondu que les images voisines
    const pos = slotPos(i, step);
    const fade = edgeFade(pos);
    m.visible = spread > 0.001 && fade > 0.001;
    if (!m.visible) return;

    const slot = restingSlot(pos, size.width, spread);
    const pad = slot.h * 0.14;
    m.position.x = slot.x;
    m.scale.set(slot.w + pad * 2, slot.h + pad * 2, 1);

    // plan de fond « cover » : mêmes formules que Background (Showcase3D)
    const img = hero.image as HTMLImageElement;
    const imgRatio = img.width / img.height;
    const viewRatio = size.width / size.height;
    const bw = (viewRatio > imgRatio ? size.width : size.height * imgRatio) * 1.02;
    const bh = (viewRatio > imgRatio ? size.width / imgRatio : size.height) * 1.02;

    const u = mt.uniforms;
    u.uBgSize.value.set(bw, bh);
    u.uSize.value.set(slot.w, slot.h);
    u.uPad.value = pad;
    u.uBgAlpha.value = bg;
    u.uOpacity.value = spread *  fade;
    // le texte apparaît un peu après le verre
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
