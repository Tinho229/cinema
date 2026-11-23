"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const ACTIVE = 2; // index de la carte centrale

const projects = [
  { title: "Projet Cinq", sub: "Direction artistique", src: "/images/projects/p5.jpg" },
  { title: "Rimma", sub: "Identité visuelle", src: "/images/projects/p1.jpg" },
  { title: "Liverpool House", sub: "Résidentiel complexe", src: "/images/projects/p2.jpg" },
  { title: "Yantos", sub: "Site web", src: "/images/projects/p3.jpg" },
  { title: "Projet Quatre", sub: "Motion design", src: "/images/projects/p4.jpg" },
];

export function ProjectsShowcase() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".sc-card");
      const spacing = () => cards[0].offsetWidth * 1.17;

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=250%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Le fond (même image que le hero) se floute et s'assombrit
      tl.fromTo(
        ".sc-bg",
        { scale: 1, filter: "blur(0px) brightness(1)" },
        { scale: 1.12, filter: "blur(12px) brightness(0.5)", duration: 3 },
        0
      );

      // 2. Le titre du hero se dissout
      tl.to(
        ".sc-hero-title",
        { opacity: 0, y: -24, filter: "blur(8px)", duration: 1.4 },
        0
      );

      // 3. Les cartes
      cards.forEach((card, i) => {
        const off = i - ACTIVE;

        if (off === 0) {
          // Carte centrale : énorme + floue -> taille normale + nette
          tl.fromTo(
            card,
            { scale: 4, rotation: -4, filter: "blur(22px)" },
            { scale: 1.12, rotation: 0, filter: "blur(0px)", duration: 3.2, ease: "power3.out" },
            0.5
          );
          tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "none" }, 0.5);
        } else {
          // Cartes voisines : glissent depuis les côtés, incurvées
          const at = 1.4 + Math.abs(off) * 0.25;
          tl.fromTo(
            card,
            {
              x: () => off * spacing() * 2.6,
              scale: 0.85,
              rotationY: -off * 30,
              z: 0,
              filter: "blur(12px)",
            },
            {
              x: () => off * spacing(),
              scale: 1,
              rotationY: -off * 9,
              z: -Math.abs(off) * 40,
              filter: "blur(0px)",
              duration: 3,
              ease: "power3.out",
            },
            at
          );
          tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "none" }, at);
        }
      });

      // 4. Aberration chromatique : pic pendant la transition, trace légère ensuite
      tl.fromTo(".sc-aberration", { opacity: 0 }, { opacity: 1, duration: 1.2 }, 1)
        .to(".sc-aberration", { opacity: 0.4, duration: 2 }, 3);

      // 5. Repères « + », légende, filtres
      tl.fromTo(
        ".sc-focus",
        { opacity: 0, scale: 1.25 },
        { opacity: 1, scale: 1, duration: 1, ease: "power3.out" },
        4
      );
      tl.fromTo(
        ".sc-caption",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
        4.2
      );
      tl.fromTo(".sc-filters", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 4.4);

      // Temps de pause à la fin pour laisser respirer la scène
      tl.to({}, { duration: 1.5 });
    },
    { scope: root }
  );

  const center = projects[ACTIVE];

  return (
    <section
      ref={root}
      className="showcase relative h-dvh w-full overflow-hidden bg-[#0a0a0a] text-[#f4f1ea]"
    >
      {/* Fond : identique au hero pour un raccord invisible */}
      <div className="sc-bg absolute inset-0 will-change-transform">
        <img src="/images/hero.jpg" alt="" className="h-full w-full object-cover" />
      </div>

      {/* Titre du hero (même position que .title-end) */}
      <div className="sc-hero-title pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-center">
        <p className="text-3xl font-semibold tracking-tight md:text-5xl">Ligne de fuite</p>
        <p className="mt-2 text-[10px] tracking-[0.28em] text-[#c8c4bc] uppercase">
          Scène 01 — Prise 01
        </p>
      </div>

      {/* Filtres */}
      <nav className="sc-filters absolute top-[14%] left-1/2 z-30 flex -translate-x-1/2 gap-4 text-[11px] opacity-0">
        <span>All</span>
        <span className="opacity-60">Web</span>
        <span className="opacity-60">Motion</span>
        <span className="opacity-60">({String(projects.length).padStart(2, "0")})</span>
      </nav>

      {/* Scène des cartes */}
      <div className="sc-stage">
        {projects.map((p) => (
          <article key={p.title} className="sc-card" style={{ opacity: 0 }}>
            <img src={p.src} alt={p.title} />
          </article>
        ))}

        {/* Repères en croix autour de la carte active */}
        <div className="sc-focus">
          <i className="sc-cross tl" />
          <i className="sc-cross tr" />
          <i className="sc-cross bl" />
          <i className="sc-cross br" />
        </div>
      </div>

      {/* Légende */}
      <div className="sc-caption pointer-events-none absolute bottom-[12%] left-1/2 z-30 -translate-x-1/2 text-center opacity-0">
        <p className="text-sm font-medium">{center.title}</p>
        <p className="mt-1 text-[10px] text-[#c8c4bc]">{center.sub}</p>
      </div>

      {/* Finitions optiques */}
      <div className="sc-aberration" />
      <div className="sc-vignette" />
      <div className="sc-grain" />
    </section>
  );
}