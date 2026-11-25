"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { introState } from "@/lib/introState";

/* ---------- Dimensions (unités Three) ---------- */
const W = 3.2; // largeur planche
const H = 2.0; // hauteur planche
const D = 0.16; // épaisseur
const STICK_H = 0.34; // hauteur des bâtons
const OPEN_MAX = 0.22; // angle d'ouverture max (rad) ≈ 12.5° comme sur l'image
// En haut du fichier, avec les autres constantes
const SIZE = 0.7; // 1 = taille actuelle, 0.5 = moitié

/* ---------- Texture des bâtons (rayures toutes dans le même sens) ---------- */
function makeStripes() {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 220;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#2b2c2e";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "#f2f2f0";
  const period = c.width / 6;
  const whiteW = period * 0.46;
  const slant = 110;

  for (let i = -1; i < 8; i++) {
    const x = i * period;
    ctx.beginPath();
    ctx.moveTo(x, c.height); // bas gauche
    ctx.lineTo(x + whiteW, c.height); // bas droite
    ctx.lineTo(x + whiteW + slant, 0); // haut droite
    ctx.lineTo(x + slant, 0); // haut gauche
    ctx.closePath();
    ctx.fill();
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------- Texture de la planche (STUDIO / SCENE / TAKE / ROLL...) ---------- */
function makeBoard() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640; // ratio 1.6 = W / H
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#2c2d30";
  ctx.fillRect(0, 0, c.width, c.height);

  const white = "#f2f2f0";
  ctx.fillStyle = white;
  ctx.strokeStyle = white;
  ctx.lineCap = "butt";

  // STUDIO
  ctx.textAlign = "center";
  ctx.font = "italic 800 92px Arial, Helvetica, sans-serif";
  ctx.fillText("STUDIO", 512, 118);

  // Ligne sous le titre + cadre SCENE/TAKE/ROLL
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(40, 150);
  ctx.lineTo(984, 150);
  ctx.moveTo(40, 290);
  ctx.lineTo(984, 290);
  ctx.stroke();

  // Séparateurs verticaux
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(400, 150);
  ctx.lineTo(400, 290);
  ctx.moveTo(660, 150);
  ctx.lineTo(660, 290);
  ctx.stroke();

  // SCENE / TAKE / ROLL
  ctx.textAlign = "left";
  ctx.font = "italic 700 54px Arial, Helvetica, sans-serif";
  ctx.fillText("SCENE", 70, 250);
  ctx.fillText("TAKE", 430, 235);
  ctx.fillText("ROLL", 700, 220);

  // Lignes d'info
  const rows = ["DATE", "PROD.CO", "DIRECTOR", "CAMERAMAN"];
  ctx.font = "italic 700 38px Arial, Helvetica, sans-serif";
  rows.forEach((label, i) => {
    const base = 345 + i * 85;
    ctx.fillText(label, 50, base);
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(40, base + 17);
    ctx.lineTo(984, base + 17);
    ctx.stroke();
  });

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ---------- Bâton rayé (réutilisé haut + bas) ---------- */
function Stick({ map }: { map: THREE.Texture }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[W, STICK_H, D]} />
        <meshStandardMaterial color="#2b2c2e" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* face rayée */}
      <mesh position={[0, 0, D / 2 + 0.001]}>
        <planeGeometry args={[W, STICK_H]} />
        <meshStandardMaterial map={map} roughness={0.38} />
      </mesh>
      {/* embout doré à droite */}
      <mesh position={[W / 2 + 0.02, 0, 0]}>
        <boxGeometry args={[0.04, STICK_H, D]} />
        <meshStandardMaterial color="#b89a5a" roughness={0.45} metalness={0.3} />
      </mesh>
    </group>
  );
}

export function Clapperboard() {
  const root = useRef<THREE.Group>(null);
  const arm = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);

  const stripes = useMemo(() => makeStripes(), []);
  const board = useMemo(() => makeBoard(), []);

  useFrame((state) => {
    const g = root.current;
    const a = arm.current;
    if (!g || !a) return;

    // Responsive + animation d'intro (GSAP via introState)
    const fit = Math.min(1.05, viewport.width * 0.24, viewport.height * 0.23) * SIZE;
    const s = Math.max(introState.scale * fit, 0.0001);
    g.visible = introState.scale > 0.01;
    g.scale.setScalar(s);

    // Ouverture du bâton du haut (pivot = charnière à gauche)
    a.rotation.z = introState.open * OPEN_MAX;

    // Centré, de face, aucune inclinaison
    g.rotation.set(0, 0, 0);
    g.position.set(0, viewport.width < 4 ? -0.14 : -0.35, 0);
    g.position.y += Math.sin(state.clock.elapsedTime * 1.05) * 0.008;
  });

  const stickY = H / 2 + STICK_H / 2; // bâton fixe posé sur la planche
  const pivotY = H / 2 + STICK_H; // charnière = coin haut-gauche du bâton fixe

  return (
    <group ref={root}>
      {/* Lumières */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 7]} intensity={2.2} />
      <pointLight position={[-3, 1, 4]} intensity={3} color="#ffd9b0" />

      {/* Planche */}
      <mesh>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#2c2d30" roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, D / 2 + 0.001]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={board} roughness={0.5} />
      </mesh>

      {/* Bâton fixe (bas) */}
      <group position={[0, stickY, 0]}>
        <Stick map={stripes} />
      </group>

      {/* Bâton mobile (haut) : pivote autour de la charnière à gauche */}
      <group ref={arm} position={[-W / 2, pivotY + 0.015, 0]}>
        <group position={[W / 2, STICK_H / 2, 0]}>
          <Stick map={stripes} />
        </group>
      </group>

      {/* Charnière métal + 2 vis */}
      <group position={[-W / 2 + 0.17, pivotY - 0.02, D / 2 + 0.03]}>
        <mesh>
          <boxGeometry args={[0.34, 0.5, 0.05]} />
          <meshStandardMaterial color="#8a8d92" roughness={0.3} metalness={0.8} />
        </mesh>
        {[0.12, -0.12].map((y) => (
          <mesh key={y} position={[-0.05, y, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 20]} />
            <meshStandardMaterial color="#c9ccd1" roughness={0.25} metalness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  );
}