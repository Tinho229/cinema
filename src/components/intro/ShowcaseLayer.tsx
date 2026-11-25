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

/* ---- Image du hero : elle reste, puis se floute / s'assombrit ------------------
   Le fondu démarre quand la première image arrive et finit quand la rangée est
   en place. Le même rythme pilote la luminosité du fond vu à travers les verres. */
const DIM_START = 0.4;
const DIM_UNITS = 3.2;

/* ---- Footer : remplace la section des images, colonne par colonne --------------
   Même principe que le changement d'image des cartes : colonnes paires balayées
   du bas vers le haut, impaires du haut vers le bas, avec un départ décalé et
   aléatoire par colonne. */
const WIPE_COLS = 8;
const WIPE_UNITS = 3.2; //   durée du balayage (unités de timeline)
const WIPE_STAGGER = 0.35; // part du balayage utilisée par les décalages de départ
const END_HOLD = 0.4; //      petite pause finale, footer entièrement affiché

// même fonction de hasard que le shader des cartes : mêmes colonnes en avance
const colHash = (n: number) => {
  const v = Math.sin(n * 91.3458) * 47453.5453;
  return v - Math.floor(v);
};
const DELAYS = Array.from({ length: WIPE_COLS }, (_, c) => colHash(c + 1) * WIPE_STAGGER);
const MASK_IMAGE = Array.from({ length: WIPE_COLS }, () => "linear-gradient(#000,#000)").join(",");
const MASK_KEYS = ["mask-image", "mask-repeat", "mask-position", "mask-size"];

function setMask(el: HTMLElement, key: string, value: string | null) {
  for (const prop of [key, `-webkit-${key}`]) {
    if (value === null) el.style.removeProperty(prop);
    else el.style.setProperty(prop, value);
  }
}

function clearMask(el: HTMLElement) {
  MASK_KEYS.forEach((k) => setMask(el, k, null));
}

/* Un calque de masque par colonne : largeur = la colonne, hauteur = sa progression.
   Les colonnes paires sont ancrées en bas, les impaires en haut. Les bords sont
   arrondis au pixel pour qu'aucun filet n'apparaisse entre deux colonnes. */
function paintWipe(el: HTMLElement, t: number, width: number) {
  const sizes: string[] = [];
  const pos: string[] = [];
  let done = true;

  for (let c = 0; c < WIPE_COLS; c++) {
    let p = Math.min(Math.max((t - DELAYS[c]) / (1 - WIPE_STAGGER), 0), 1);
    p = p * p * (3 - 2 * p); // smoothstep, comme le shader
    if (p < 1) done = false;

    const x0 = Math.round((c * width) / WIPE_COLS);
    const x1 = Math.round(((c + 1) * width) / WIPE_COLS);
    sizes.push(`${x1 - x0}px ${(p * 100).toFixed(2)}%`);
    pos.push(`${x0}px ${c % 2 === 0 ? "100%" : "0%"}`);
  }

  // tout est révélé : on retire le masque (plus rien à calculer pour le navigateur)
  if (done) {
    clearMask(el);
    return;
  }
  setMask(el, "mask-image", MASK_IMAGE);
  setMask(el, "mask-repeat", "no-repeat");
  setMask(el, "mask-position", pos.join(","));
  setMask(el, "mask-size", sizes.join(","));
}

export function ShowcaseLayer() {
  const layer = useRef<HTMLDivElement>(null);
  const capTitle = useRef<HTMLParagraphElement>(null);
  const capSub = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = layer.current;
    const hero = el?.closest("section") as HTMLElement | null;
    if (!el || !hero) return;

    // le footer est rendu par IntroHero (<FooterLayer />), dans la même section
    const footer = hero.querySelector<HTMLElement>(".footer-layer");
    const slide = footer?.querySelector<HTMLElement>(".footer-slide") ?? null;
    const wipe = { p: 0 };
    const repaintWipe = () => {
      if (footer) paintWipe(footer, wipe.p, el.clientWidth);
    };

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

      // footer plus court que l'écran : centré ; plus long : calé en haut (il défile ensuite)
      if (footer && slide) slide.style.top = `${Math.max(0, (H - slide.offsetHeight) / 2)}px`;
      repaintWipe();
    };
    place();
    window.addEventListener("resize", place);

    let ctx: gsap.Context | undefined;
    let timer = 0;
    let units = 12; // remplacé par la durée réelle de la timeline

    const build = () => {
      showcaseState.step = 0;
      wipe.p = 0;
      repaintWipe();
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

        // L'image du hero RESTE : plus de fondu vers le noir, juste une légère avancée.
        tl.fromTo(".hero-media", { scale: 1 }, { scale: 1.06, duration: 3, ease: "power2.inOut" }, 0);

        // Quand les images arrivent : version floutée + assombrie en fondu par-dessus.
        // (calque DOM sous le canvas : les images ne sont jamais touchées)
        tl.fromTo(".hero-soft", { opacity: 0 }, { opacity: 1, duration: DIM_UNITS, ease: "none" }, DIM_START);

        tl.to(".title-end, .scroll-hint", { opacity: 0, y: -24, filter: "blur(8px)", duration: 1.4 }, 0);

        // Scène WebGL : tout passe par showcaseState
        // bg suit le même fondu que .hero-soft : les verres voient la même luminosité
        tl.fromTo(showcaseState, { bg: 0 }, { bg: 1, duration: DIM_UNITS, ease: "none" }, DIM_START);
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

        // Le footer remplace la section des images, colonne par colonne.
        if (footer) {
          tl.addLabel("footer");
          tl.set(footer, { visibility: "visible" }, "footer");
          tl.to(
            wipe,
            {
              p: 1,
              duration: WIPE_UNITS,
              ease: "none",
              onUpdate: repaintWipe,
            },
            "footer"
          );

          // balayage terminé : le footer est cliquable, la scène WebGL n'est plus affichée
          tl.addLabel("footerEnd", `footer+=${WIPE_UNITS}`);
          tl.set(footer, { pointerEvents: "auto" }, "footerEnd");
          tl.set(el, { visibility: "hidden" }, "footerEnd");

          // écran plus court que le footer : il défile dans le cadre, toujours épinglé
          if (slide) {
            const over = () => Math.max(0, slide.offsetHeight - el.clientHeight);
            if (over() > 1) {
              tl.to(
                slide,
                {
                  y: () => -over(),
                  duration: over() / ((el.clientHeight * SCROLL_PER_UNIT) / 100),
                  ease: "none",
                },
                "footerEnd"
              );
            }
          }
          tl.to({}, { duration: END_HOLD });
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
      if (footer) clearMask(footer);
      if (slide) slide.style.removeProperty("top");
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