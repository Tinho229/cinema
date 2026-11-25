import { gsap } from "@/lib/gsap";

/* Durées en unités de timeline (1 unité = SCROLL_PER_UNIT % d'écran de scroll,
   voir ShowcaseLayer.tsx). Plus grand = plus de scroll pour la même animation. */
export const GALLERY_TIMING = {
  enter: 2, //   la section monte du bas, avec sa 1re carte (texte + image ensemble)
  hold: 0.8, //  pause entre deux événements
  rise: 1.6, //  chaque carte suivante monte du bas, texte + image ensemble
  exit: 2, //    la section repart vers le haut
  overlap: 0.45, // part de la sortie après laquelle ShowcaseLayer démarre
} as const;

/**
 * Ajoute à la timeline principale (celle de ShowcaseLayer) :
 *   1. la section qui monte du bas vers le haut (1re carte incluse)
 *   2. les cartes suivantes, une par une, du bas vers le haut
 *   3. la sortie de la section vers le haut
 * et renvoie l'instant où la scène des images doit démarrer.
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
    return { showcaseAt: 0 };
  }

  const { enter, hold, rise, exit, overlap } = GALLERY_TIMING;
  const cards = gsap.utils.toArray<HTMLElement>(".tg-card", layer);

  // 1. la section (fond, titre, 1re carte) monte d'un seul bloc
  tl.fromTo(layer, { yPercent: 100 }, { yPercent: 0, duration: enter, ease: "power3.out" }, 0);

  // Le CSS cache la section (visibility: hidden) pour qu'elle ne couvre pas l'intro.
  // On la rend visible ici, au tout début de la timeline : elle est alors hors écran
  // (yPercent 100) et monte avec le scroll.
  tl.set(layer, { visibility: "visible" }, 0);

  // 2. chaque carte suivante : texte et image dans le même élément, donc ensemble
  let t = enter + hold;
  cards.slice(1).forEach((card) => {
    tl.fromTo(card, { yPercent: 115 }, { yPercent: 0, duration: rise, ease: "power2.inOut" }, t);
    t += rise + hold;
  });

  // 3. la section repart vers le haut, puis on la recache (plus rien à dessiner)
  tl.to(layer, { yPercent: -100, duration: exit, ease: "power2.inOut" }, t);
  tl.set(layer, { visibility: "hidden" }, t + exit);

  return { showcaseAt: t + exit * overlap };
}