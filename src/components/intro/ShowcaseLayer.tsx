"use client";

import { Suspense, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { showcaseState } from "@/lib/showcaseState";
import { COUNT, GAP, MAX_STEP, activeProject, frameX } from "@/lib/showcaseLayout";
import { PROJECTS } from "@/lib/showcaseContent";

const Showcase3D = dynamic(() => import("./Showcase3D").then((m) => ({ default: m.Showcase3D })), {
  ssr: false,
});

export function ShowcaseLayer() {
  const layer = useRef<HTMLDivElement>(null);
  const capTitle = useRef<HTMLParagraphElement>(null);
  const capSub = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = layer.current;
    const hero = el?.closest("section") as HTMLElement | null;
    if (!el || !hero) return;

    let ctx: gsap.Context | undefined;
    let timer = 0;

    const build = () => {
      showcaseState.step = 0;
      let shown = activeProject(0);

      // cadre + légende suivent l'image active pendant le défilement des paires
      const sync = () => {
        const step = showcaseState.step;
        el.style.setProperty("--sc-shift", `calc(var(--sc-w) * ${-frameX(step) * GAP})`);
        const p = activeProject(step);
        if (p !== shown) {
          shown = p;
          if (capTitle.current) capTitle.current.textContent = PROJECTS[p].title;
          if (capSub.current) capSub.current.textContent = PROJECTS[p].sub;
        }
      };

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          onUpdate: sync,
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "+=470%", // ouverture (~5 u.) + 2 étapes de paires
            scrub: 1,
            pin: hero,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          ".hero-bg",
          { scale: 1, filter: "blur(0px) brightness(1)" },
          { scale: 1.12, filter: "blur(14px) brightness(0.45)", duration: 3 },
          0
        );

        tl.to(".title-end, .scroll-hint", { opacity: 0, y: -24, filter: "blur(8px)", duration: 1.4 }, 0);

        // Scène WebGL : tout passe par showcaseState
        tl.fromTo(showcaseState, { bg: 0 }, { bg: 1, duration: 3, ease: "none" }, 0);
        tl.fromTo(showcaseState, { lens: 0 }, { lens: 1, duration: 3.5, ease: "power2.out" }, 0.5);
        tl.fromTo(showcaseState, { zoom: 3.2 }, { zoom: 1, duration: 3.2, ease: "power3.out" }, 0.5);
        tl.fromTo(showcaseState, { spread: 0 }, { spread: 1, duration: 3, ease: "power3.out" }, 1.6);

        tl.fromTo(".sc-focus", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }, 4);
        tl.fromTo(".sc-caption", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 4.2);
        tl.fromTo(".sc-filters", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 4.4);
        tl.fromTo(".sc-header", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 4.4);

        // Défilement des paires : pause, glissement d'une paire, pause…
        tl.to({}, { duration: 1 });
        for (let k = 1; k <= MAX_STEP; k++) {
          tl.to(showcaseState, { step: k, duration: 2, ease: "power2.inOut" });
          tl.to({}, { duration: k === MAX_STEP ? 1.5 : 1 });
        }
      }, hero);

      sync();
      ScrollTrigger.refresh();
    };

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

  // légende initiale (step = 0) ; mise à jour ensuite par sync()
  const first = PROJECTS[activeProject(0)];

  return (
    <div
      ref={layer}
      data-count={COUNT}
      className="showcase pointer-events-none absolute inset-0 z-[60] overflow-hidden text-[#f4f1ea]"
    >
      <header className="sc-header absolute inset-x-0 top-0 z-30 flex items-start justify-between px-[1.5vw] pt-[1.6vw] text-[12px] opacity-0">
        <span className="font-medium">Ligne de fuite</span>
        <nav className="flex gap-2">
          <span className="font-medium">Portfolio,</span>
          <span className="opacity-60">About,</span>
          <span className="opacity-60">Contacts</span>
        </nav>
      </header>

      <div className="sc-stage sc-stage--gl">
        <Suspense fallback={null}>
          <Showcase3D />
        </Suspense>

        <div className="sc-focus">
          <i className="sc-cross tl" />
          <i className="sc-cross tr" />
          <i className="sc-cross bl" />
          <i className="sc-cross br" />
        </div>
      </div>

      <nav className="sc-filters z-30 items-center gap-4 text-[11px] opacity-0">
        <span className="opacity-60">All</span>
        <span className="opacity-60">Web</span>
        <span className="font-semibold">Motion</span>
        <span className="ml-5 flex items-center gap-3">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" aria-hidden="true">
            <rect x="4.5" y="1.5" width="9" height="9" />
            <path d="M1.5 3v6M16.5 3v6" />
          </svg>
          <svg className="opacity-50" width="14" height="12" viewBox="0 0 14 12" fill="none" stroke="currentColor" aria-hidden="true">
            <rect x=".5" y=".5" width="5" height="4.5" />
            <rect x="8.5" y=".5" width="5" height="4.5" />
            <rect x=".5" y="7" width="5" height="4.5" />
            <rect x="8.5" y="7" width="5" height="4.5" />
          </svg>
        </span>
      </nav>

      <div className="sc-caption z-30 opacity-0">
        <p ref={capTitle} className="text-[15px] font-semibold">{first.title}</p>
        <p ref={capSub} className="mt-1 text-[12px] text-[#c8c4bc]/70">{first.sub}</p>
      </div>

      {/* textes des verres : dessinés dans un canvas, doublés ici pour les lecteurs d'écran */}
      <div className="sr-only">
        {PROJECTS.map((p) => (
          <section key={p.title}>
            <h2>{p.note.title}</h2>
            <p>{p.note.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}