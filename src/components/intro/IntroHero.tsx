"use client";
import { FooterLayer } from "./FooterLayer";
import { ShowcaseLayer } from "./ShowcaseLayer";
import { TransformationGallery } from "@/components/transformation/TransformationGallery";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { resetIntro, introState } from "@/lib/introState";
import { HERO_BLUR, HERO_DIM } from "@/lib/showcaseState";
import { RevealText } from "@/components/text/RevealText";
import { addTextReveal } from "@/lib/textReveal";

import dynamic from "next/dynamic";

const Scene3D = dynamic(
  () => import("./ClapScene").then((m) => ({ default: m.ClapScene })),
  { ssr: false }
);

const COLS = 14;
const ROWS = 9;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTiles() {
  const rand = mulberry32(11);
  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cx = (x + 0.5) / COLS - 0.5;
      const cy = (y + 0.5) / ROWS - 0.5;
      const dist = Math.hypot(cx * 1.35, cy);
      const noise = rand();
      const centerBias = 1 - Math.min(dist / 0.78, 1);
      cells.push({
        id: `${x}-${y}`,
        x,
        y,
        checker: (x + y) % 2 === 0,
        order: centerBias * 0.7 + noise * 0.3,
      });
    }
  }
  const max = Math.max(...cells.map((c) => c.order));
  return cells.map((c) => ({ ...c, delay: (c.order / max) * 2.4 }));
}

function Line({ text, className = "" }: { text: string; className?: string }) {
  return (
    <p className={`overflow-hidden leading-relaxed ${className}`}>
      {text.split("").map((ch, i) => (
        <span key={`${text}-${i}`} className="char">
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
    </p>
  );
}

export function IntroHero() {
  const root = useRef<HTMLElement>(null);
  const titleEndRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [run] = useState(0);
  const [webgl, setWebgl] = useState(false);
  const tiles = useMemo(() => buildTiles(), []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(true);
  }, []);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;

    resetIntro();
    setDone(false);

    const ctx = gsap.context(() => {
      gsap.set(".char", { yPercent: 120 });
      gsap.set(".glass-tr", { clipPath: "inset(0% 0% 100% 100%)" });
      gsap.set(".glass-bl", { clipPath: "inset(100% 100% 0% 0%)" });
      gsap.set(".frost-tile", { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(".trait", { scaleX: 1, opacity: 0 });
      gsap.set(".title-end", { opacity: 0, y: 18 });
      gsap.set(".title-end__line", { scaleX: 0, opacity: 0 });
      gsap.set(".flash", { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          setDone(true);
          // Débloque le scroll (écouté par <SmoothScroll />)
          window.dispatchEvent(new Event("intro:done"));
        },
      });

      tl.to(introState, { scale: 1, duration: 1.15, ease: "back.out(1.5)" }, 0.2);
      tl.to(
        ".glass-tr",
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "power4.inOut" },
        0.4
      );
      tl.to(
        ".glass-bl",
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "power4.inOut" },
        0.65
      );
      tl.to(".char", { yPercent: 0, stagger: 0.01, duration: 0.65 }, 1.05);

      tl.addLabel("clap", 7);
      tl.to(introState, { open: 0, duration: 0.16, ease: "power4.in" }, "clap")
        .to(introState, { open: 0.1, duration: 0.07, ease: "power2.out" })
        .to(introState, { open: 0, duration: 0.08, ease: "power3.in" });

      tl.fromTo(
        introState,
        { shake: 1 },
        { shake: 0, duration: 0.5, ease: "power2.out", immediateRender: false },
        "clap+=0.16"
      );
      // immediateRender: false -> le flash ne s'affiche PAS dès le début
      tl.fromTo(
        ".flash",
        { opacity: 0.82 },
        { opacity: 0, duration: 0.42, immediateRender: false },
        "clap+=0.16"
      );
      tl.to(
        introState,
        { scale: 0, spin: Math.PI * 0.7, duration: 0.7, ease: "back.in(1.5)" },
        "clap+=0.75"
      );

      tl.to(".trait", { opacity: 0.95, duration: 0.18 }, "clap+=1.05");
      tl.to(".trait", { scaleX: 0, duration: 2.6, ease: "power2.inOut" }, "clap+=1.12");

      tiles.forEach((tile) => {
        tl.to(
          `[data-tile="${tile.id}"]`,
          { clipPath: "inset(50% 50% 50% 50%)", duration: 0.38, ease: "power3.in" },
          `clap+=${(1.15 + tile.delay).toFixed(3)}`
        );
      });

      const after = "clap+=4.15";
      tl.to(
        ".glass-tr",
        { clipPath: "inset(0% 0% 100% 100%)", duration: 0.85, ease: "power4.inOut" },
        after
      );
      tl.to(
        ".glass-bl",
        { clipPath: "inset(100% 100% 0% 0%)", duration: 0.85, ease: "power4.inOut" },
        after
      );
      tl.to(".trait", { opacity: 0, duration: 0.25 }, after);
      tl.to(".title-end", { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }, "-=0.25");
      tl.to(".title-end__line", { scaleX: 1, opacity: 1, duration: 0.9, ease: "power3.inOut" }, "<+=0.08");
      addTextReveal(tl, titleEndRef.current, "<+=0.06", {
        duration: 0.85,
        amount: 0.95,
        ease: "power3.out",
      });
    }, scope);

    return () => ctx.revert();
  }, [run, tiles]);

  return (
    <section
      ref={root}
      className="hero-section-full relative h-dvh w-full overflow-hidden bg-black text-[#f4f1ea]"
    >
      {/* Image du hero : elle RESTE affichée pendant tout le scroll (plus de fondu
          vers le noir). Quand on arrive sur les images, .hero-soft (la même image,
          floutée et assombrie) apparaît par-dessus en fondu : l'effet « luminosité
          baissée ». C'est un calque DOM sous le canvas WebGL : il n'a aucun effet
          sur les images. Réglages : HERO_DIM / HERO_BLUR dans lib/showcaseState.ts */}
      <div className="hero-media absolute inset-0">
        <img
          src="/images/hero.webp"
          alt="Blond"
          className="hero-bg absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="hero-soft pointer-events-none absolute inset-0 overflow-hidden opacity-0"
          aria-hidden="true"
        >
          <img
            src="/images/hero.webp"
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            // scale : cache le bord transparent que crée le flou
            style={{ filter: `blur(${HERO_BLUR}px)`, transform: "scale(1.08)" }}
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: 1 - HERO_DIM }} />
        </div>
      </div>

      {/* Damier (sans flou), sous le clap */}
      <div className="pointer-events-none absolute inset-0 z-[5]">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            data-tile={tile.id}
            className="frost-tile"
            style={{
              left: `${(tile.x / COLS) * 100}%`,
              top: `${(tile.y / ROWS) * 100}%`,
              width: `${100 / COLS + 0.15}%`,
              height: `${100 / ROWS + 0.15}%`,
              background: tile.checker
                ? "color-mix(in srgb, white 22%, transparent)"
                : "color-mix(in srgb, #0a0a0a 28%, transparent)",
            }}
          />
        ))}
      </div>

      {/* Trait de lumière (animé par la timeline, style dans globals.css) */}
      <div className="trait" />

      {/* Clap 3D au-dessus du damier. Démonté une fois l'intro finie : libère un contexte WebGL */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {webgl && !done && <Scene3D />}
      </div>

      <aside className="glass-panel glass-tr top-3 right-3 w-[min(86vw,290px)] p-4 sm:top-5 sm:right-5 md:top-8 md:right-8 md:w-[min(86vw,320px)] md:p-6">
        <div className="space-y-3">
          <div>
            <Line
              text="Technique production"
              className="text-xs font-medium text-[#f4f1ea]/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] md:text-[13px]"
            />
            <Line
              text="AZAH PRODUCTION"
              className="tx-display mt-1 text-[15px] leading-snug text-[#f4f1ea] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] md:text-base"
            />
          </div>
          <div>
            <Line
              text="Co-réalisation"
              className="text-xs font-medium text-[#f4f1ea]/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] md:text-[13px]"
            />
            <Line
              text="AGOÏ Ingrid/ AGOÏ Godthanks"
              className="tx-display mt-1 text-[15px] leading-snug text-[#f4f1ea] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] md:text-base"
            />
          </div>
          <div>
            <Line
              text="Directeur technique"
              className="text-xs font-medium text-[#f4f1ea]/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] md:text-[13px]"
            />
            <Line
              text="Mahougnon Jean de Dieu"
              className="tx-display mt-1 text-[15px] leading-snug text-[#f4f1ea] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] md:text-base"
            />
          </div>
        </div>
      </aside>

      <aside className="glass-panel glass-bl bottom-3 left-3 w-[min(82vw,280px)] p-4 sm:bottom-5 sm:left-5 md:bottom-8 md:left-8 md:p-6">
        <Line
          text="Acteurs principaux"
          className="text-xs font-medium text-[#f4f1ea]/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] md:text-[13px]"
        />
        <ul className="mt-2.5 space-y-1.5 md:mt-3 md:space-y-2">
          {["AGOSSADOU Houefa", "HESSOU Rufin - LAFIA Jacob", "TOFFOHOUSSOU GLORIA", "AGOÏ Godthanks", "HESSOU Destinol", "FIDEGNON Séverine",].map((name, i) => (
            <li key={i}>
              <Line
                text={name}
                className="tx-display text-base leading-snug text-[#f4f1ea] drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] md:text-lg"
              />
            </li>
          ))}
        </ul>
      </aside>

      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-5 sm:px-8">
        <div
          ref={titleEndRef}
          className="title-end relative mx-auto max-w-3xl px-4 py-6 text-center sm:px-10 sm:py-8"
        >
          {/* Halo sombre progressif pour garantir la lisibilité sur le centre lumineux */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(5,5,5,0.78)_0%,rgba(5,5,5,0.48)_48%,transparent_76%)] blur-xl"
          />

          <div
            aria-hidden="true"
            className="title-end__line mx-auto mb-4 h-px w-16 bg-gradient-to-r from-transparent via-[#f4f1ea]/80 to-transparent sm:mb-5 sm:w-24"
          />

          <p className="tx-display text-[clamp(21px,3.3vw,44px)] leading-[1.2] text-[#f4f1ea] [text-shadow:0_2px_24px_rgba(0,0,0,0.95),0_1px_6px_rgba(0,0,0,0.95)] [@media(max-height:480px)]:text-[clamp(18px,2.8vw,28px)]">
            <RevealText text="Le 22 décembre, ta fille mérite de voir à quoi ressemble une femme qui ose, qui agit et qui inspire." />
          </p>

          <div
            aria-hidden="true"
            className="title-end__line mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-[#f4f1ea]/80 to-transparent sm:mt-5 sm:w-24"
          />
        </div>
      </div>

      {/* Invite à défiler, visible quand l'intro est terminée */}
      {done && (
        <div className="scroll-hint pointer-events-none absolute inset-x-0 bottom-4 z-20 flex items-center justify-center md:inset-x-auto md:right-8 md:bottom-8 md:justify-end">
          <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/50 px-3.5 py-1.5 text-xs font-medium text-[#f4f1ea] backdrop-blur-sm">
            <span>Faites défiler</span>
            <span className="h-px w-8 animate-pulse bg-[#f4f1ea]/85 md:w-10" />
          </div>
        </div>
      )}

      <div className="flash pointer-events-none absolute inset-0 z-50 bg-[#f4f1ea]" />
      <ShowcaseLayer />

      {/* Section « Transformation gallery » : monte du bas vers le haut au premier
          scroll, AVANT la scène des images (la timeline est dans ShowcaseLayer).
          z-65 : au-dessus des images, sous le footer. */}
      <TransformationGallery />

      {/* Footer : au-dessus de tout, révélé par colonnes à la fin du scroll
          (la timeline est dans ShowcaseLayer). */}
      <FooterLayer />
    </section>
  );
}