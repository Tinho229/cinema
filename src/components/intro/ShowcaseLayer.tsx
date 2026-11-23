"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const ACTIVE = 2;

const projects = [
  { title: "Projet Cinq", sub: "Direction artistique", src: "/images/projects/p5.jpg", bg: "#3a2a22" },
  { title: "Rimma", sub: "Identité visuelle", src: "/images/projects/p1.jpg", bg: "#d9c8b8" },
  { title: "Liverpool House", sub: "Résidentiel complexe", src: "/images/projects/p2.jpg", bg: "#1d2a40" },
  { title: "Yantos", sub: "Site web", src: "/images/projects/p3.jpg", bg: "#e8e8e6" },
  { title: "Projet Quatre", sub: "Motion design", src: "/images/projects/p4.jpg", bg: "#2a3a30" },
];

export function ShowcaseLayer() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current;
    const hero = el?.closest("section") as HTMLElement | null;
    if (!el || !hero) return;

    let ctx: gsap.Context | undefined;
    let timer = 0;

    const build = () => {
      ctx = gsap.context(() => {
        const cards = gsap.utils.toArray<HTMLElement>(".sc-card");
        const spacing = () => cards[0].offsetWidth * 1.17;

        // Centrage géré par GSAP uniquement (plus de translate en CSS)
        gsap.set(cards, { xPercent: -50, yPercent: -50 });
        gsap.set(".sc-focus", { xPercent: -50, yPercent: -50 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=250%",
            scrub: 1,
            pin: hero, // le hero lui-même est épinglé : une seule section
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Le fond du hero (déjà là) se floute et s'assombrit
        tl.fromTo(
          ".hero-bg",
          { scale: 1, filter: "blur(0px) brightness(1)" },
          { scale: 1.12, filter: "blur(12px) brightness(0.5)", duration: 3 },
          0
        );

        // Titre + invite de scroll se dissolvent
        tl.to(
          ".title-end, .scroll-hint",
          { opacity: 0, y: -24, filter: "blur(8px)", duration: 1.4 },
          0
        );

        cards.forEach((card, i) => {
          const off = i - ACTIVE;
          if (off === 0) {
            tl.fromTo(
              card,
              { scale: 4, rotation: -4, filter: "blur(22px)" },
              { scale: 1.12, rotation: 0, filter: "blur(0px)", duration: 3.2, ease: "power3.out" },
              0.5
            );
            tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "none" }, 0.5);
          } else {
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

        tl.fromTo(".sc-aberration", { opacity: 0 }, { opacity: 1, duration: 1.2 }, 1)
          .to(".sc-aberration", { opacity: 0.4, duration: 2 }, 3);

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
        tl.to({}, { duration: 1.5 });
      }, hero);

      ScrollTrigger.refresh();
    };

    // On attend la fin de l'intro : le titre et l'invite existent alors dans leur état final
    const onDone = () => {
      timer = window.setTimeout(build, 80);
    };
    window.addEventListener("intro:done", onDone);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("intro:done", onDone);
      ctx?.revert();
    };
  }, []);

  const center = projects[ACTIVE];

  return (
    <div
      ref={layer}
      className="showcase pointer-events-none absolute inset-0 z-[60] overflow-hidden text-[#f4f1ea]"
    >
      <nav className="sc-filters absolute top-[14%] left-1/2 z-30 flex -translate-x-1/2 gap-4 text-[11px] opacity-0">
        <span>All</span>
        <span className="opacity-60">Web</span>
        <span className="opacity-60">Motion</span>
        <span className="opacity-60">({String(projects.length).padStart(2, "0")})</span>
      </nav>

      <div className="sc-stage">
        {projects.map((p) => (
          <article key={p.title} className="sc-card" style={{ opacity: 0, background: p.bg }}>
            <img
              src={p.src}
              alt=""
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </article>
        ))}

        <div className="sc-focus">
          <i className="sc-cross tl" />
          <i className="sc-cross tr" />
          <i className="sc-cross bl" />
          <i className="sc-cross br" />
        </div>
      </div>

      <div className="sc-caption absolute bottom-[12%] left-1/2 z-30 -translate-x-1/2 text-center opacity-0">
        <p className="text-sm font-medium">{center.title}</p>
        <p className="mt-1 text-[10px] text-[#c8c4bc]">{center.sub}</p>
      </div>

      <div className="sc-aberration" />
      <div className="sc-vignette" />
      <div className="sc-grain" />
    </div>
  );
}