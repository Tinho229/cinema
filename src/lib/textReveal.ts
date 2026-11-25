import { gsap } from "@/lib/gsap";
import "@/components/text/text-reveal.css";

/* Animation de texte commune à toutes les sections.
   Les mots (.rt-i, voir <RevealText />) montent dans leur masque, avec un
   décalage entre eux. Tout est ajouté à une timeline existante : comme celle de
   ShowcaseLayer est scrubbée, les textes avancent (et reculent) avec le scroll. */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Opts = {
  /** durée de montée d'un mot (unités de timeline) */
  duration?: number;
  /** durée totale du décalage entre le premier et le dernier mot */
  amount?: number;
  ease?: string;
  /** départ en % de la hauteur du mot (115 = entièrement sous le masque) */
  from?: number;
};

/** Anime tous les mots .rt-i contenus dans `scope`, à l'instant `position`. */
export function addTextReveal(
  tl: gsap.core.Timeline,
  scope: Element | Element[] | null | undefined,
  position: number | string,
  { duration = 0.9, amount = 0.5, ease = "power3.out", from = 115 }: Opts = {}
) {
  if (!scope || prefersReducedMotion()) return;
  const roots = Array.isArray(scope) ? scope : [scope];
  const words = roots.flatMap((r) => Array.from(r.querySelectorAll<HTMLElement>(".rt-i")));
  if (!words.length) return;

  tl.fromTo(
    words,
    { yPercent: from },
    { yPercent: 0, duration, ease, stagger: { amount } },
    position
  );
}

/** Rejoue l'animation d'un texte qui vient de changer (ex. légende du carrousel). */
export function replayPop(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("rt-pop");
  void el.offsetWidth; // relance l'animation CSS
  el.classList.add("rt-pop");
}