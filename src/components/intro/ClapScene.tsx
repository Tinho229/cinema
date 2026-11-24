"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Clapperboard } from "./Clapperboard";

export function ClapScene() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 7.5],
        fov: 35,
        near: 0.1,
        far: 100,
      }}
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        alpha: true,
        premultipliedAlpha: false,
      }}
      style={{
        background: "transparent",
        pointerEvents: "none",
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        scene.background = null;
      }}
    >
      <Suspense fallback={null}>
        <Clapperboard />
      </Suspense>
    </Canvas>
  );
}

export default ClapScene;