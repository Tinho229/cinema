"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import {
  CanvasTexture,
  MathUtils,
  SRGBColorSpace,
  type Mesh,
  type MeshBasicMaterial,
  type Texture,
} from "three";
import { showcaseState } from "@/lib/showcaseState";
import { ACTIVE, CARD_ASPECT, COUNT, GAP, LAYOUT } from "@/lib/showcaseLayout";
import { LensEffect } from "./LensEffect";

/* Une image par projet, dans l'ordre des légendes de ShowcaseLayer.
   Avec 6 cartes, la liste boucle : la 6e carte reprend la 1re. */
const IMAGES = [
  "/images/projects/p5.jpg",
  "/images/projects/p1.jpg",
  "/images/projects/p2.jpg",
  "/images/projects/p3.jpg",
  "/images/projects/p4.jpg",
];
const SRC = Array.from({ length: COUNT }, (_, i) => IMAGES[i % IMAGES.length]);

/* Position (en pas) de la carte i par rapport au centre de l'écran :
   -2 … +2 pour 5 cartes, -2.5 … +2.5 pour 6. */
const slotOf = (i: number) => i - (COUNT - 1) / 2;

/* Ajuste une image à la carte comme `object-fit: cover`
   (sans ça, l'image 1080×626 est écrasée dans un rectangle d'autre ratio). */
function coverTexture(base: Texture): Texture {
  const t = base.clone();
  const img = base.image as { width: number; height: number };
  const imgAspect = img.width / img.height;
  if (imgAspect > CARD_ASPECT) {
    t.repeat.set(CARD_ASPECT / imgAspect, 1);
    t.offset.set((1 - t.repeat.x) / 2, 0);
  } else {
    t.repeat.set(1, imgAspect / CARD_ASPECT);
    t.offset.set(0, (1 - t.repeat.y) / 2);
  }
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
}

/* Fond : même image que le hero, floutée, dessinée DANS la scène
   pour que la lentille la déforme aussi. */
function Background() {
  const tex = useTexture("/images/hero.jpg");
  const { size } = useThree();
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshBasicMaterial>(null);

  const blurred = useMemo(() => {
    const img = tex.image as HTMLImageElement;
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width / 8));
    c.height = Math.max(1, Math.round(img.height / 8));
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.filter = "blur(2px)"; // ≈ 16 px à pleine taille (ignoré si non supporté : le /8 adoucit déjà)
      ctx.drawImage(img, 0, 0, c.width, c.height);
    }
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [tex]);

  useFrame(() => {
    const m = mesh.current;
    const mt = mat.current;
    if (!m || !mt) return;
    const img = tex.image as HTMLImageElement;
    const imgRatio = img.width / img.height;
    const viewRatio = size.width / size.height;
    // équivalent object-fit: cover
    const w = viewRatio > imgRatio ? size.width : size.height * imgRatio;
    const h = viewRatio > imgRatio ? size.width / imgRatio : size.height;
    m.scale.set(w * 1.02, h * 1.02, 1);
    mt.opacity = showcaseState.bg;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -1]} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={mat}
        map={blurred}
        color="#777777"
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Card({ i, src }: { i: number; src: string }) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshBasicMaterial>(null);
  const base = useTexture(src);
  const map = useMemo(() => coverTexture(base), [base]);
  const { size } = useThree();

  useFrame(() => {
    const m = mesh.current;
    const mt = mat.current;
    if (!m || !mt) return;
    const w = size.width * (size.width < 768 ? LAYOUT.wMobile : LAYOUT.w);
    const h = w / CARD_ASPECT;
    const gap = w * GAP;
    const { zoom, spread } = showcaseState;

    m.scale.set(w, h, 1);
    if (i === ACTIVE) {
      m.scale.multiplyScalar(zoom);
      mt.opacity = MathUtils.clamp((3.2 - zoom) * 1.5, 0, 1);
      // part du centre de l'écran, glisse vers sa place pendant l'ouverture
      m.position.x = slotOf(i) * gap * spread;
    } else {
      m.position.x = slotOf(i) * gap * MathUtils.lerp(2.6, 1, spread);
      m.scale.multiplyScalar(MathUtils.lerp(0.85, 1, spread));
      mt.opacity = spread;
    }
  });

  return (
    <mesh ref={mesh} renderOrder={i === ACTIVE ? 2 : 1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={mat}
        map={map}
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
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], zoom: 1 }}
      gl={{ alpha: true, antialias: false }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Background />
      {SRC.map((s, i) => (
        <Card key={`${i}-${s}`} i={i} src={s} />
      ))}
      <EffectComposer multisampling={0}>
        <primitive object={lens} />
      </EffectComposer>
    </Canvas>
  );
}