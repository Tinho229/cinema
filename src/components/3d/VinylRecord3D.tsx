"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface VinylRecord3DProps {
  speed?: number;
  autoRotate?: boolean;
  heightFill?: number;
  /** Décale le disque pour que son centre soit sur le bord gauche : seule la moitié droite est visible */
  halfVisible?: boolean;
  className?: string;
}

interface VinylSceneContentProps {
  speed: number;
  autoRotate: boolean;
  radius: number;
  holeRadius: number;
  heightFill: number;
  halfVisible: boolean;
}

/* =========================================
   1. TEXTURE DU DISQUE (TOURNE AVEC LE VINYLE)
========================================= */

function createVinylGroovesTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2;
  const labelOuterR = 670;

  // Fond sombre du disque
  ctx.fillStyle = "#060606";
  ctx.fillRect(0, 0, size, size);

  const baseGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, maxR);
  baseGrad.addColorStop(0.0, "#050505");
  baseGrad.addColorStop(0.32, "#070707");
  baseGrad.addColorStop(0.34, "#242424");
  baseGrad.addColorStop(0.65, "#111111");
  baseGrad.addColorStop(0.95, "#191919");
  baseGrad.addColorStop(0.985, "#4a4a4a");
  baseGrad.addColorStop(1.0, "#080808");

  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  ctx.fillStyle = baseGrad;
  ctx.fill();

  // Sillons concentriques et plages
  for (let i = 0; i < 720; i++) {
    const t = i / 720;
    const r = labelOuterR + 14 + t * (maxR - labelOuterR - 36);

    const trackPulse =
      0.5 +
      0.5 * Math.sin(t * Math.PI * 18) * Math.cos(t * Math.PI * 7);
    const alpha = 0.03 + trackPulse * 0.085;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle =
      i % 5 === 0
        ? `rgba(220, 220, 220, ${alpha * 1.45})`
        : `rgba(165, 165, 165, ${alpha})`;
    ctx.lineWidth = i % 5 === 0 ? 1.5 : 0.85;
    ctx.stroke();
  }

  // Label central noir mat
  ctx.beginPath();
  ctx.arc(cx, cy, labelOuterR, 0, Math.PI * 2);
  ctx.fillStyle = "#040404";
  ctx.fill();

  // Double anneau fin autour du label
  ctx.beginPath();
  ctx.arc(cx, cy, labelOuterR - 14, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(225, 225, 225, 0.55)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, labelOuterR - 135, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(215, 215, 215, 0.42)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Bordure fine extérieure
  ctx.beginPath();
  ctx.arc(cx, cy, maxR - 10, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(210, 210, 210, 0.35)";
  ctx.lineWidth = 4;
  ctx.stroke();

  /* -----------------------------------------
     REPÈRES ASYMÉTRIQUES
     Sans eux, la texture est symétrique de
     révolution : le disque tourne mais rien
     ne bouge visuellement.
  ----------------------------------------- */

  // Point décentré sur le label
  ctx.beginPath();
  ctx.arc(cx + 420, cy, 28, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(230, 230, 230, 0.85)";
  ctx.fill();

  // Trait radial sur le label
  ctx.beginPath();
  ctx.moveTo(cx + 150, cy);
  ctx.lineTo(cx + 330, cy);
  ctx.strokeStyle = "rgba(230, 230, 230, 0.6)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.stroke();

  // Petit arc clair dans le label (second repère, angle différent)
  ctx.beginPath();
  ctx.arc(cx, cy, labelOuterR - 70, Math.PI * 0.9, Math.PI * 1.15);
  ctx.strokeStyle = "rgba(230, 230, 230, 0.5)";
  ctx.lineWidth = 8;
  ctx.stroke();

  // Arcs partiels dans la zone des sillons (angles fixes, pas de random)
  const arcs: Array<[number, number, number]> = [
    [820, 0.4, 0.55],
    [870, 2.1, 0.45],
    [930, 3.6, 0.6],
    [985, 5.0, 0.4],
    [900, 4.3, 0.35],
  ];
  for (const [r, start, len] of arcs) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, start + len);
    ctx.strokeStyle = "rgba(200, 200, 200, 0.14)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

/* =========================================
   2. TEXTURE DE REFLETS (RESTE FIXE)
========================================= */

function createFixedReflectionTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context unavailable");
  }

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2;
  const labelOuterR = 670;

  ctx.clearRect(0, 0, size, size);

  // Reflets uniquement sur la zone des sillons (pas sur le label central)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, maxR - 14, 0, Math.PI * 2);
  ctx.arc(cx, cy, labelOuterR + 4, 0, Math.PI * 2, true);
  ctx.clip();

  ctx.translate(cx, cy);
  ctx.rotate((142 * Math.PI) / 180); // reflet principal sur la moitié droite

  // Reflet principal diagonal
  const mainSheen = ctx.createLinearGradient(-520, 0, 120, 0);
  mainSheen.addColorStop(0.0, "rgba(255, 255, 255, 0)");
  mainSheen.addColorStop(0.28, "rgba(255, 255, 255, 0.04)");
  mainSheen.addColorStop(0.52, "rgba(245, 245, 245, 0.24)");
  mainSheen.addColorStop(0.64, "rgba(255, 255, 255, 0.34)");
  mainSheen.addColorStop(0.76, "rgba(230, 230, 230, 0.12)");
  mainSheen.addColorStop(1.0, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = mainSheen;
  ctx.fillRect(-maxR, -maxR, maxR * 2, maxR * 2);

  // Reflet secondaire opposé plus doux
  const secSheen = ctx.createLinearGradient(260, 0, 720, 0);
  secSheen.addColorStop(0.0, "rgba(255, 255, 255, 0)");
  secSheen.addColorStop(0.45, "rgba(235, 235, 235, 0.14)");
  secSheen.addColorStop(0.65, "rgba(255, 255, 255, 0.22)");
  secSheen.addColorStop(1.0, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = secSheen;
  ctx.fillRect(-maxR, -maxR, maxR * 2, maxR * 2);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

function createPlanarRingGeometry(
  innerRadius: number,
  outerRadius: number,
  thetaSegments: number
): THREE.RingGeometry {
  const geometry = new THREE.RingGeometry(
    innerRadius,
    outerRadius,
    thetaSegments
  );
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv.setXY(i, x / (outerRadius * 2) + 0.5, y / (outerRadius * 2) + 0.5);
  }

  uv.needsUpdate = true;
  return geometry;
}

/* =========================================
   SCENE + ROTATION DISQUE / REFLET FIXE
========================================= */

function VinylSceneContent({
  speed,
  autoRotate,
  radius,
  holeRadius,
  heightFill,
  halfVisible,
}: VinylSceneContentProps) {
  const discSpinRef = useRef<THREE.Group>(null);
  const { camera, size } = useThree();

  const [textures, setTextures] = useState<{
    grooves: THREE.CanvasTexture;
    reflection: THREE.CanvasTexture;
  } | null>(null);

  // Zoom orthographique + décalage de la caméra
  useEffect(() => {
    if (
      !(camera instanceof THREE.OrthographicCamera) ||
      size.height <= 0 ||
      size.width <= 0
    ) {
      return;
    }

    // Demi-disque : le diamètre est calé sur la hauteur de la section.
    // Disque entier : il doit tenir en hauteur ET en largeur.
    const availablePx = halfVisible
      ? size.height
      : Math.min(size.height, size.width);

    camera.zoom = (availablePx * heightFill) / (radius * 2);

    // Caméra décalée vers la droite = scène décalée vers la gauche :
    // le centre du disque (x = 0) tombe pile sur le bord gauche du canvas.
    camera.position.x = halfVisible ? size.width / 2 / camera.zoom : 0;

    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width, radius, heightFill, halfVisible]);

  useEffect(() => {
    const grooves = createVinylGroovesTexture();
    const reflection = createFixedReflectionTexture();
    setTextures({ grooves, reflection });

    return () => {
      grooves.dispose();
      reflection.dispose();
    };
  }, []);

  const ringGeometry = useMemo(
    () => createPlanarRingGeometry(holeRadius, radius, 256),
    [holeRadius, radius]
  );

  useEffect(() => {
    return () => {
      ringGeometry.dispose();
    };
  }, [ringGeometry]);

  const discMaterial = useMemo(() => {
    if (!textures) return null;
    return new THREE.MeshBasicMaterial({
      map: textures.grooves,
      side: THREE.FrontSide,
    });
  }, [textures]);

  const reflectionMaterial = useMemo(() => {
    if (!textures) return null;
    return new THREE.MeshBasicMaterial({
      map: textures.reflection,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, [textures]);

  const edgeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#090909",
        roughness: 0.35,
        metalness: 0.6,
      }),
    []
  );

  useEffect(() => {
    return () => {
      discMaterial?.dispose();
    };
  }, [discMaterial]);

  useEffect(() => {
    return () => {
      reflectionMaterial?.dispose();
    };
  }, [reflectionMaterial]);

  useEffect(() => {
    return () => {
      edgeMaterial.dispose();
    };
  }, [edgeMaterial]);

  // Seul le disque tourne ; la couche reflet reste immobile
  useFrame((_, delta) => {
    if (!discSpinRef.current || !autoRotate) return;
    discSpinRef.current.rotation.z += Math.min(delta, 0.05) * speed;
  });

  if (!textures || !discMaterial || !reflectionMaterial) return null;

  const thickness = 0.08;

  return (
    <group>
      {/* Groupe qui tourne : sillons, label, anneaux et tranche */}
      <group ref={discSpinRef}>
        <mesh
          position={[0, 0, thickness / 2]}
          geometry={ringGeometry}
          material={discMaterial}
        />

        <mesh
          position={[0, 0, -thickness / 2]}
          rotation={[Math.PI, 0, 0]}
          geometry={ringGeometry}
          material={edgeMaterial}
        />

        <mesh rotation={[Math.PI / 2, 0, 0]} material={edgeMaterial}>
          <cylinderGeometry args={[radius, radius, thickness, 256, 1, true]} />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]} material={edgeMaterial}>
          <cylinderGeometry
            args={[holeRadius, holeRadius, thickness, 64, 1, true]}
          />
        </mesh>
      </group>

      {/* Couche de reflets fixe au-dessus de la face avant */}
      <mesh
        position={[0, 0, thickness / 2 + 0.002]}
        geometry={ringGeometry}
        material={reflectionMaterial}
      />
    </group>
  );
}

export default function VinylRecord3D({
  speed = 0.22,
  autoRotate = true,
  heightFill = 0.94,
  halfVisible = true,
  className = "",
}: VinylRecord3DProps) {
  const radius = 2;
  const holeRadius = 0.075;

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 10],
          zoom: 100,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[-4, 5, 8]} intensity={1.4} />
        <VinylSceneContent
          speed={speed}
          autoRotate={autoRotate}
          radius={radius}
          holeRadius={holeRadius}
          heightFill={heightFill}
          halfVisible={halfVisible}
        />
      </Canvas>
    </div>
  );
}