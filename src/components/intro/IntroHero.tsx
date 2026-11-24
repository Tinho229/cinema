"use client";

import { ShowcaseLayer } from "./ShowcaseLayer";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { resetIntro, introState } from "@/lib/introState";

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
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);
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
      tl.to(".title-end", { opacity: 1, y: 0, duration: 0.8 }, "-=0.25");
    }, scope);

    return () => ctx.revert();
  }, [run, tiles]);

  return (
    <section
      ref={root}
      className="relative h-dvh w-full overflow-hidden bg-[#0a0a0a] text-[#f4f1ea]"
    >
      <img
  src="/images/hero.jpg"
  alt="Blond"
  className="hero-bg absolute inset-0 h-full w-full object-cover"
/>

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

      <aside className="glass-panel glass-tr top-4 right-4 w-[min(82vw,300px)] p-4 md:top-8 md:right-8 md:p-6">
        <div className="space-y-3 text-[10px] md:text-xs">
          <div>
            <Line text="Technique production" className="text-[#c8c4bc]" />
            <Line text="XXX XXX" className="mt-1 font-medium" />
          </div>
          <div>
            <Line text="Co-réalisation" className="text-[#c8c4bc]" />
            <Line text="XXX XXX / XXX XXX" className="mt-1 font-medium" />
          </div>
          <div>
            <Line text="Directeur technique" className="text-[#c8c4bc]" />
            <Line text="XXX XXX" className="mt-1 font-medium" />
          </div>
        </div>
      </aside>

      <aside className="glass-panel glass-bl bottom-4 left-4 w-[min(78vw,250px)] p-4 md:bottom-8 md:left-8 md:p-6">
        <Line text="Acteurs principaux" className="text-[10px] text-[#c8c4bc] md:text-xs" />
        <ul className="mt-3 space-y-2">
          {["XXX XXX", "XXX XXX", "XXX XXX"].map((name, i) => (
            <li key={i}>
              <Line text={name} className="text-xs font-medium md:text-sm" />
            </li>
          ))}
        </ul>
      </aside>

      <div className="title-end pointer-events-none absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-center">
        <p className="text-3xl font-semibold tracking-tight md:text-5xl">
          Ligne de fuite
        </p>
        <p className="mt-2 text-[10px] tracking-[0.28em] text-[#c8c4bc] uppercase">
          Scène 01 — Prise 01
        </p>
      </div>

      {/* Invite à défiler, visible quand l'intro est terminée */}
      {done && (
      <div className="scroll-hint pointer-events-none absolute right-6 bottom-8 z-20 flex items-center gap-3 text-xs text-[#c8c4bc] md:right-8">
        <span>Faites défiler</span>
        <span className="h-px w-10 animate-pulse bg-[#c8c4bc]" />
      </div>
    )}

      <div className="flash pointer-events-none absolute inset-0 z-50 bg-[#f4f1ea]" />
      <ShowcaseLayer />
    </section>
  );
}