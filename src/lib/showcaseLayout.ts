/* Disposition du carrousel, partagée par la scène WebGL (Showcase3D)
   et le calque HTML (ShowcaseLayer : cadre, légende).

   COUNT = 5 : rendu précédent (une carte centrale + 2 + 2, courbure douce).
   COUNT = 6 : une rangée de 6 emplacements. Les 4 du milieu restent plans,
               les 2 des extrémités sont fortement courbées par la lentille :

       0 image    1 verre    2 image    3 image    4 verre    5 image
      (arrondie)             (active)                        (arrondie)

   Pour réorganiser la rangée, modifie seulement ROWS ci-dessous.
   Si tu changes COUNT, change aussi data-count dans ShowcaseLayer (automatique)
   et les tailles --sc-w dans globals.css (déjà prévues pour 5 et 6). */
export const COUNT: 5 | 6 = 6;

/** Un emplacement de la rangée : une image (index dans PROJECTS)
    ou un verre (index dans NOTES), cf. showcaseContent.ts. */
export type Slot =
  | { kind: "image"; project: number }
  | { kind: "glass"; note: number };

const image = (project: number): Slot => ({ kind: "image", project });
const glass = (note: number): Slot => ({ kind: "glass", note });

const ROWS: Record<5 | 6, readonly Slot[]> = {
  5: [image(0), image(1), image(2), image(3), image(4)],
  6: [image(1), glass(0), image(2), image(3), glass(1), image(4)],
};

export const SLOTS: readonly Slot[] = ROWS[COUNT];

/** Index de la carte cadrée (liseré + croix) et légendée.
    Doit pointer sur une image, pas sur un verre. */
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

/** Position (en pas) de l'emplacement i par rapport au centre de l'écran :
    -2 … +2 pour 5 cartes, -2.5 … +2.5 pour 6. */
export const slotOf = (i: number) => i - (COUNT - 1) / 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Place et taille (en px, origine au centre de l'écran) d'un emplacement
    non actif. `spread` : 0 = cartes empilées au centre, 1 = alignées.
    Partagé par les images et les verres pour qu'ils restent calés. */
export function restingSlot(i: number, screenW: number, spread: number) {
  const w = screenW * (screenW < 768 ? LAYOUT.wMobile : LAYOUT.w);
  const k = lerp(0.85, 1, spread);
  return {
    x: slotOf(i) * w * GAP * lerp(2.6, 1, spread),
    w: w * k,
    h: (w / CARD_ASPECT) * k,
  };
}
