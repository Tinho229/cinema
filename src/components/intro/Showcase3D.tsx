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
import { ACTIVE, CARD_ASPECT, GAP, LAYOUT, SLOTS, restingSlot, slotOf } from "@/lib/showcaseLayout";
import { NOTES, PROJECTS } from "@/lib/showcaseContent";
import { LensEffect } from "./LensEffect";
import { GlassSlot } from "./GlassSlot";

/* Part de l'image source rognée en haut / en bas (0 → 1). Les captures actuelles
   ont une bande noire (≈ 15 px en haut, 4 px en bas sur 626) : l'ancienne version
   CSS la masquait par un scale(1.03), perdu au passage en WebGL.
   Mets { top: 0, bottom: 0 } avec des images propres. */
const TRIM = { top: 0.026, bottom: 0.008 };

/* Ajuste une image à la carte comme `object-fit: cover`
   (sans ça, l'image 1080×626 est écrasée dans un rectangle d'autre ratio),
   après avoir rogné TRIM. v = 0 est le bas de l'image (flipY). */
function coverTexture(base: Texture): Texture {
  const t = base.clone();
  const img = base.image as { width: number; height: number };
  const keep = 1 - TRIM.top - TRIM.bottom; // part de hauteur conservée
  const imgAspect = img.width / (img.height * keep);
  if (imgAspect > CARD_ASPECT) {
    t.repeat.set(CARD_ASPECT / imgAspect, keep);
    t.offset.set((1 - t.repeat.x) / 2, TRIM.bottom);
  } else {
    t.repeat.set(1, (keep * imgAspect) / CARD_ASPECT);
    t.offset.set(0, TRIM.bottom + (keep - t.repeat.y) / 2);
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
    const { zoom, spread } = showcaseState;

    if (i === ACTIVE) {
      const w = size.width * (size.width < 768 ? LAYOUT.wMobile : LAYOUT.w);
      m.scale.set(w * zoom, (w / CARD_ASPECT) * zoom, 1);
      mt.opacity = MathUtils.clamp((3.2 - zoom) * 1.5, 0, 1);
      // part du centre de l'écran, glisse vers sa place pendant l'ouverture
      m.position.x = slotOf(i) * w * GAP * spread;
    } else {
      const slot = restingSlot(i, size.width, spread);
      m.position.x = slot.x;
      m.scale.set(slot.w, slot.h, 1);
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
      {/* La rangée : images et verres selon SLOTS (showcaseLayout.ts) */}
      {SLOTS.map((slot, i) =>
        slot.kind === "image" ? (
          <Card key={`slot-${i}`} i={i} src={PROJECTS[slot.project].src} />
        ) : (
          <GlassSlot key={`slot-${i}`} i={i} note={NOTES[slot.note]} phase={slot.note * 4.5} />
        )
      )}
      <EffectComposer multisampling={0}>
        <primitive object={lens} />
      </EffectComposer>
    </Canvas>
  );
}
