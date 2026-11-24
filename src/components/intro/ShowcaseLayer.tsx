"use client";

import { Suspense, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { showcaseState } from "@/lib/showcaseState";
import { FOCUS, MAX_STEP, activeProject, blockRect, slotRect } from "@/lib/showcaseLayout";
import { PROJECTS } from "@/lib/showcaseContent";

const Showcase3D = dynamic(() => import("./Showcase3D").then((m) => ({ default: m.Showcase3D })), {
  ssr: false,
});

/* Défilement par unité de timeline (en % de la hauteur d'écran). Plus d'histoires
   = plus de scroll, sans que chaque transition soit raccourcie. */
const SCROLL_PER_UNIT = 37;

export function ShowcaseLayer() {
  const layer = useRef<HTMLDivElement>(null);
  const capTitle = useRef<HTMLParagraphElement>(null);
  const capSub = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = layer.current;
    const hero = el?.closest("section") as HTMLElement | null;
    if (!el || !hero) return;

    // cadre, légende et filtres suivent la disposition (px, calculés depuis la largeur)
    const place = () => {
      const W = el.clientWidth;
      const H = el.clientHeight;
      const fr = slotRect("image", FOCUS, W);
      const bl = blockRect("image", W);
      const set = (k: string, v: number) => el.style.setProperty(k, `${v}px`);
      set("--sc-fx", fr.x);
      set("--sc-fy", -fr.y);
      set("--sc-fw", fr.w * 1.035);
      set("--sc-fh", fr.h * 1.035);
      set("--sc-bx", bl.x);
      set("--sc-bw", bl.w);
      set("--sc-ctop", H / 2 - bl.y + bl.h / 2 + 22); // légende sous le bloc d'images
      set("--sc-fbot", H / 2 + bl.y + bl.h / 2 + 22); // filtres au-dessus
    };
    place();
    window.addEventListener("resize", place);

    let ctx: gsap.Context | undefined;
    let timer = 0;
    let units = 12; // remplacé par la durée réelle de la timeline

    const build = () => {
      showcaseState.step = 0;
      let shown = activeProject(0);

      // la légende suit le projet de l'image cadrée
      const sync = () => {
        const p = activeProject(showcaseState.step);
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
            end: () => `+=${Math.round(units * SCROLL_PER_UNIT)}%`,
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

        // Une transition par histoire : pause, brisure / changement, pause…
        tl.to({}, { duration: 1 });
        for (let k = 1; k <= MAX_STEP; k++) {
          tl.to(showcaseState, { step: k, duration: 2, ease: "power2.inOut" });
          tl.to({}, { duration: k === MAX_STEP ? 1.5 : 1 });
        }

        units = tl.duration();
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
      window.removeEventListener("resize", place);
      ctx?.revert();
    };
  }, []);

  // légende initiale ; mise à jour ensuite par sync()
  const first = PROJECTS[activeProject(0)];

  return (
    <div
      ref={layer}
      className="showcase pointer-events-none absolute inset-0 z-[60] overflow-hidden text-[#f4f1ea]"
    >
      

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