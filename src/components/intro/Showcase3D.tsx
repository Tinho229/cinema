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
} from "three";
import { showcaseState } from "@/lib/showcaseState";
import { LensEffect } from "./LensEffect";

const ACTIVE = 2;
const SRC = [
  "/images/projects/p5.jpg",
  "/images/projects/p1.jpg",
  "/images/projects/p2.jpg",
  "/images/projects/p3.jpg",
  "/images/projects/p4.jpg",
];

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
    c.width = Math.max(1, Math.round(img.width / 4));
    c.height = Math.max(1, Math.round(img.height / 4));
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.filter = "blur(4px)"; // ≈ 16 px à pleine taille
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
    // équivalent object-fit: cover, avec 12 % de marge pour la lentille
    const w = viewRatio > imgRatio ? size.width : size.height * imgRatio;
    const h = viewRatio > imgRatio ? size.width / imgRatio : size.height;
    m.scale.set(w * 1.12, h * 1.12, 1);
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
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Card({ i, src }: { i: number; src: string }) {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<MeshBasicMaterial>(null);
  const tex = useTexture(src);
  const { size } = useThree();

  useFrame(() => {
    const m = mesh.current;
    const mt = mat.current;
    if (!m || !mt) return;
    const off = i - ACTIVE;
    const w = size.width * 0.269;
    const h = w / 1.35;
    const gap = w * 1.07;
    const { zoom, spread } = showcaseState;

    m.scale.set(w, h, 1);
    if (off === 0) {
      m.scale.multiplyScalar(zoom);
      mt.opacity = MathUtils.clamp((3.2 - zoom) * 1.5, 0, 1);
      m.position.x = 0;
    } else {
      m.position.x = off * gap * MathUtils.lerp(2.6, 1, spread);
      m.scale.multiplyScalar(MathUtils.lerp(0.85, 1, spread));
      mt.opacity = spread;
    }
  });

  return (
    <mesh ref={mesh} renderOrder={1}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={mat} map={tex} transparent toneMapped={false} />
    </mesh>
  );
}

export function Showcase3D() {
  const lens = useMemo(() => new LensEffect({ k: 0.5, ab: 0.1 }), []);
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10], zoom: 1 }}
      gl={{ alpha: true, antialias: false }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Background />
      {SRC.map((s, i) => (
        <Card key={s} i={i} src={s} />
      ))}
      <EffectComposer multisampling={0}>
        <primitive object={lens} />
      </EffectComposer>
    </Canvas>
  );
}