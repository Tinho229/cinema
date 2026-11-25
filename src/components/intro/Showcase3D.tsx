"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import {
  MathUtils,
  SRGBColorSpace,
  Vector4,
  type Mesh,
  type ShaderMaterial,
} from "three";
import { showcaseState } from "@/lib/showcaseState";
import {
  CARD_ASPECT,
  FOCUS,
  LAYOUT,
  N_PROJECTS,
  projectAt,
  slotRect,
  transition,
} from "@/lib/showcaseLayout";
import { PROJECTS } from "@/lib/showcaseContent";
import { LensEffect } from "./LensEffect";
import { GlassSlot } from "./GlassSlot";

/* Part de l'image source rognée en haut / en bas (0 → 1).
   Mets { top: 0, bottom: 0 } avec des images propres. */
const TRIM = { top: 0.026, bottom: 0.008 };

/* Équivalent de `object-fit: cover` (après rognage TRIM), exprimé en
   (repeat.x, repeat.y, offset.x, offset.y). Le shader applique
   uv * repeat + offset lui-même. v = 0 est le bas de l'image (flipY). */
function coverTransform(image: unknown): [number, number, number, number] {
  const img = image as { width: number; height: number };
  const keep = 1 - TRIM.top - TRIM.bottom;
  const imgAspect = img.width / (img.height * keep);
  if (imgAspect > CARD_ASPECT) {
    const rx = CARD_ASPECT / imgAspect;
    return [rx, keep, (1 - rx) / 2, TRIM.bottom];
  }
  const ry = (keep * imgAspect) / CARD_ASPECT;
  return [1, ry, 0, TRIM.bottom + (keep - ry) / 2];
}

/* Plus de fond dans la scène : l'image du hero est un calque DOM (voir
   IntroHero.tsx) qui reste sous ce canvas, transparent là où il n'y a rien.
   Le flou et l'assombrissement du fond n'ont donc aucune prise sur les images. */

/* Image qui change PAR COLONNES : un front horizontal balaie chaque colonne,
   colonnes paires du bas vers le haut, impaires du haut vers le bas. */
const COLS_FX = 8;

const CARD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const CARD_FRAG = /* glsl */ `
uniform sampler2D tA;
uniform sampler2D tB;
uniform vec4  uTa;
uniform vec4  uTb;
uniform float uT;
uniform float uOpacity;
uniform float uCols;
varying vec2 vUv;

float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }

void main() {
  float c = floor(vUv.x * uCols);
  bool up = mod(c, 2.0) < 0.5;

  float delay = hash(c + 1.0) * 0.35;
  float p = clamp((uT - delay) / (1.0 - 0.35), 0.0, 1.0);
  p = p * p * (3.0 - 2.0 * p);

  float y = up ? vUv.y : 1.0 - vUv.y;
  float edge = 0.05;
  float f = p * (1.0 + edge);
  float m = 1.0 - smoothstep(f - edge, f, y);

  vec3 a = texture2D(tA, vUv * uTa.xy + uTa.zw).rgb;
  vec3 b = texture2D(tB, vUv * uTb.xy + uTb.zw).rgb;
  vec3 col = mix(a, b, m);

  float act = sin(3.14159265 * p);
  float d = (y - (f - edge * 0.5)) / (edge * 0.6);
  col += vec3(0.9, 0.92, 1.0) * exp(-d * d) * 0.28 * act;
  float fx = fract(vUv.x * uCols);
  float seam = 1.0 - smoothstep(0.0, 0.025, min(fx, 1.0 - fx));
  col *= 1.0 - 0.55 * seam * act;

  gl_FragColor = vec4(col, uOpacity);
}
`;

function Card({ i }: { i: number }) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<ShaderMaterial>(null);
  const textures = useTexture(PROJECTS.map((p) => p.src));
  const { size } = useThree();
  const intro = i === FOCUS;

  const xf = useMemo(
    () =>
      textures.map((t) => {
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = 4;
        t.needsUpdate = true;
        return coverTransform(t.image);
      }),
    [textures]
  );

  const args = useMemo(
    () => ({
      vertexShader: CARD_VERT,
      fragmentShader: CARD_FRAG,
      uniforms: {
        tA: { value: textures[i % N_PROJECTS] },
        tB: { value: textures[i % N_PROJECTS] },
        uTa: { value: new Vector4(1, 1, 0, 0) },
        uTb: { value: new Vector4(1, 1, 0, 0) },
        uT: { value: 0 },
        uOpacity: { value: 0 },
        uCols: { value: COLS_FX },
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textures]
  );

  useFrame(() => {
    const m = mesh.current;
    const mt = mat.current;
    if (!m || !mt) return;
    const { zoom, spread, step } = showcaseState;

    const { cur, t } = transition(step);
    const a = projectAt(i, cur, 0);
    const b = projectAt(i, cur, 1);
    const u = mt.uniforms;
    u.tA.value = textures[a];
    u.tB.value = textures[b];
    u.uTa.value.set(...xf[a]);
    u.uTb.value.set(...xf[b]);
    u.uT.value = t;

    if (intro) {
      // image zoomée à l'ouverture : part du centre, glisse vers sa place
      const full = slotRect("image", i, size.width, 1);
      m.scale.set(full.w * zoom, full.h * zoom, 1);
      m.position.set(full.x * spread, full.y * spread, 0);
      u.uOpacity.value = MathUtils.clamp((3.2 - zoom) * 1.5, 0, 1);
    } else {
      const r = slotRect("image", i, size.width, spread);
      m.position.set(r.x, r.y, 0);
      m.scale.set(r.w, r.h, 1);
      u.uOpacity.value = spread;
    }
    m.visible = u.uOpacity.value > 0.001;
  });

  return (
    <mesh ref={mesh} renderOrder={intro ? 2 : 1}>
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

export function Showcase3D() {
  const lens = useMemo(
    () => new LensEffect({ kx: 0.025, ky: LAYOUT.ky, ca: 0.012, grain: 0.1, start: LAYOUT.start }),
    []
  );
  return (
    <Canvas
      orthographic
      // jusqu'à 2 : à 1.5, un écran retina (dpr 2-3) étire le canvas, donc toute
      // l'image, et la rend molle. C'était la principale cause du flou des images.
      dpr={[1, 2]}
      camera={{ position: [0, 0, 10], zoom: 1 }}
      gl={{ alpha: true, antialias: false }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {/* Bloc de gauche : les images. Bloc de droite : les verres. */}
      {PROJECTS.map((_, i) => (
        <Card key={`img-${i}`} i={i} />
      ))}
      {PROJECTS.map((_, i) => (
        <GlassSlot key={`glass-${i}`} i={i} project={i} phase={i * 4.5} />
      ))}
      <EffectComposer multisampling={0}>
        <primitive object={lens} />
      </EffectComposer>
    </Canvas>
  );
}