/* Disposition du carrousel, partagée par la scène WebGL (Showcase3D)
   et le calque HTML (ShowcaseLayer : cadre, légende).

   COUNT = 5 : rendu précédent (une carte centrale + 2 + 2, courbure douce).
   COUNT = 6 : 6 images sur une ligne. Les 4 du milieu restent planes,
               les 2 des extrémités sont fortement courbées.
   Si tu changes COUNT, change aussi data-count dans ShowcaseLayer (automatique)
   et les tailles --sc-w dans globals.css (déjà prévues pour 5 et 6). */
export const COUNT: 5 | 6 = 6;

/** Index de la carte cadrée (liseré + croix) et légendée. */
export const ACTIVE = 2;

/** Pas entre deux cartes, en largeurs de carte. */
export const GAP = 1.085;

/** Largeur / hauteur d'une carte. */
export const CARD_ASPECT = 1.6;

const PRESETS = {
  5: {
    w: 0.269, //      largeur de carte / largeur d'écran (desktop)
    wMobile: 0.62, // idem sur mobile
    ky: 0.12, //      hauteur supplémentaire vers les côtés
    start: 0, //      0 = la courbure démarre dès le centre
  },
  6: {
    w: 0.18,
    wMobile: 0.46,
    ky: 0.3,
    start: 0.68, //   la courbure ne démarre qu'à 68 % de la demi-largeur : seules les 2 cartes d'extrémité se courbent
  },
} as const;

export const LAYOUT = PRESETS[COUNT];