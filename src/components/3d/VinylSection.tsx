"use client";

import dynamic from "next/dynamic";

const VinylRecord3D = dynamic(() => import("./VinylRecord3D"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-black" />,
});

export default function VinylSection() {
  return (
    <section
      className="
        relative
        w-full
        h-screen
        min-h-[600px]
        overflow-hidden
        bg-black
      "
    >
      {/* Vinyle à gauche (prend toute la hauteur de la section) */}
      <div
        className="
          absolute
          left-0
          top-0
          h-full
          w-1/2
          max-md:w-full
        "
      >
        <VinylRecord3D autoRotate speed={0.22} heightFill={0.96} halfVisible />
      </div>

      {/* Espace réservé au contenu à droite */}
      <div
        className="
          absolute
          right-0
          top-0
          h-full
          w-1/2
          max-md:hidden
        "
      >
        {/* Ajouter ici ton contenu */}
      </div>
    </section>
  );
}