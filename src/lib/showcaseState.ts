export const showcaseState = {
  zoom: 3.2,   // échelle de la carte centrale (3.2 → 1)
  spread: 0,   // 0 = cartes empilées, 1 = alignées
  bg: 0,       // 0 → 1 : avancement de l'assombrissement du hero (lu par les verres)
  lens: 0,     // intensité de la lentille (0 → 1)
  step: 0,     // défilement des paires : 0, 1, 2 (fractionnaire pendant la transition)
};

/* Image du hero derrière la section images.
   Elle reste affichée pendant tout le scroll ; quand les images arrivent, une
   version floutée et assombrie apparaît par-dessus (voir IntroHero.tsx).
   Ces deux réglages ne touchent QUE le fond, jamais les images. */

/** Luminosité finale du fond : 1 = image intacte, 0 = noir. 0.55 ≈ « un peu plus sombre ». */
export const HERO_DIM = 0.55;

/** Flou final du fond, en px. */
export const HERO_BLUR = 12;