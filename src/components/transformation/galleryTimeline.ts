import { gsap } from "@/lib/gsap";
import { showcaseState } from "@/lib/showcaseState";

/* Durées de scroll en unités de timeline (1 unité = SCROLL_PER_UNIT % d'écran de
   scroll, voir ShowcaseLayer.tsx). L'apparition automatique est en secondes. */
export const GALLERY_TIMING = {
  autoDelay: 2, //    secondes entre la fin de l'intro et l'arrivée de la section
  autoDuration: 1.4, // secondes que dure sa montée automatique
  hold: 0.8, //       pause (scroll) entre deux événements
  rise: 1.6, //       (scroll) chaque carte suivante monte du bas, texte + image ensemble
  exit: 2, //         (scroll) la section repart vers le haut
  overlap: 0, //      part de la sortie après laquelle les images démarrent (0 = dès le début)
} as const;

/**
 * 1. AUTOMATIQUE : 2 s après la fin de l'intro, la section monte du bas vers le haut
 *    toute seule (sans scroll). Le fond assombri se met en place dessous à ce moment-là.
 *    Si l'utilisateur scrolle avant, la montée s'accélère au lieu d'attendre.
 * 2. SCROLL (timeline principale de ShowcaseLayer) : les cartes suivantes arrivent une
 *    à une, puis la section repart vers le haut.
 *
 * Renvoie l'instant où la scène des images démarre, et stopAutoplay() à appeler dès
 * que le scroll commence.
 * À appeler dans le gsap.context de ShowcaseLayer, AVANT les autres tweens.
 */
export function addGalleryTimeline(tl: gsap.core.Timeline, root: HTMLElement) {
  const layer = root.querySelector<HTMLElement>(".tg-layer");
  if (!layer) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[ShowcaseLayer] .tg-layer introuvable : <TransformationGallery /> doit être rendu dans la <section> d'IntroHero. La section est ignorée."
      );
    }
    return { showcaseAt: 0, stopAutoplay: () => {} };
  }

  const { autoDelay, autoDuration, hold, rise, exit, overlap } = GALLERY_TIMING;
  const cards = gsap.utils.toArray<HTMLElement>(".tg-card", layer);
  const soft = root.querySelector<HTMLElement>(".hero-soft");

  /* ---- 1. Apparition automatique (hors scroll) ---- */
  const entrance = gsap.timeline({ paused: true });
  entrance.set(layer, { visibility: "visible" }, 0);
  entrance.fromTo(layer, { yPercent: 100 }, { yPercent: 0, duration: autoDuration, ease: "power3.out" }, 0);
  // La section couvre tout l'écran : on met en place, dessous, le fond assombri
  // (image du hero floutée + luminosité vue à travers les verres). On ne le voit pas.
  if (soft) entrance.set(soft, { opacity: 1 });
  entrance.set(showcaseState, { bg: 1 });

  const call = gsap.delayedCall(autoDelay, () => {
    entrance.play();
  });

  let skipped = false;
  const stopAutoplay = () => {
    if (skipped) return;
    skipped = true;
    call.kill();
    // le scroll a commencé : on finit la montée vite plutôt que d'attendre les 2 s
    if (entrance.progress() < 1) entrance.timeScale(5).play();
  };

  /* ---- 2. Au scroll : cartes suivantes, puis sortie ---- */
  let t = 0;
  cards.slice(1).forEach((card) => {
    tl.fromTo(card, { yPercent: 115 }, { yPercent: 0, duration: rise, ease: "power2.inOut" }, t);
    t += rise + hold;
  });

  // immediateRender: false -> la timeline de scroll ne touche pas à la section avant
  // d'arriver ici (sinon elle écraserait la montée automatique)
  tl.fromTo(
    layer,
    { yPercent: 0 },
    { yPercent: -100, duration: exit, ease: "power2.inOut", immediateRender: false },
    t
  );
  tl.set(layer, { visibility: "hidden" }, t + exit);

  return { showcaseAt: t + exit * overlap, stopAutoplay };
}