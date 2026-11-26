"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Scroll fluide (Lenis) branché sur ScrollTrigger.
 * Le scroll reste bloqué tant que l'intro n'a pas envoyé l'événement "intro:done".
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.14 });
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const unlock = () => lenis.start();
    window.addEventListener("intro:done", unlock);
    // Sécurité : on ne laisse jamais la page bloquée
    const failsafe = window.setTimeout(unlock, 16000);

    return () => {
      window.clearTimeout(failsafe);
      window.removeEventListener("intro:done", unlock);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}