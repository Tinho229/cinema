/* Disposition du carrousel, partagée par la scène WebGL (Showcase3D),
   les verres (GlassSlot) et le calque HTML (ShowcaseLayer : cadre, légende).

   3 paires (image + verre) sur 6 emplacements, en miroir :

       0 verre   1 image  |  2 image   3 verre  |  4 verre   5 image
       └──── paire 0 ─────┘  └──── paire 1 ────┘  └──── paire 2 ────┘
                             (active au départ)

   Le défilement (showcaseState.step) décale la ligne d'une paire (2 emplacements)
   par étape. Les cartes bouclent : une carte qui sort à gauche réapparaît à droite
   pendant qu'elle est invisible (fondu sur les bords).

   Pour changer l'ordre ou le miroir : modifie seulement PAIRS. */
export const COUNT = 6;
export const PAIR_SPAN = 2;

export type Pair = {
  /** index dans PROJECTS : l'image ET le verre de la paire en dépendent */
  project: number;
  /** true : le verre est à gauche de l'image */
  glassFirst: boolean;
};

export const PAIRS: readonly Pair[] = [
  { project: 0, glassFirst: true },
  { project: 1, glassFirst: false },
  { project: 2, glassFirst: true },
];

/** Paire dont l'image est zoomée à l'ouverture puis cadrée (step = 0). */
export const INTRO_PAIR = 1;

/** Nombre d'étapes de défilement (3 paires → 2 transitions). */
export const MAX_STEP = PAIRS.length - 1;

export type Slot =
  | { kind: "image"; project: number }
  | { kind: "glass"; project: number };

/** La rangée à plat, dans l'ordre d'affichage (step = 0). */
export const SLOTS: readonly Slot[] = PAIRS.flatMap((p): Slot[] => {
  const img: Slot = { kind: "image", project: p.project };
  const gl: Slot = { kind: "glass", project: p.project };
  return p.glassFirst ? [gl, img] : [img, gl];
});

/** Indice (dans SLOTS) de l'image d'une paire. */
export const imageRow = (pair: number) => pair * PAIR_SPAN + (PAIRS[pair].glassFirst ? 1 : 0);

/** Indice de l'image zoomée à l'ouverture. */
export const INTRO_ROW = imageRow(INTRO_PAIR);

/** Pas entre deux cartes, en largeurs de carte. */
export const GAP = 1.085;

/** Largeur / hauteur d'une carte. */
export const CARD_ASPECT = 1.6;

export const LAYOUT = {
  w: 0.18, //       largeur de carte / largeur d'écran (desktop)
  wMobile: 0.46, // idem sur mobile
  ky: 0.3, //       hauteur supplémentaire vers les côtés
  start: 0.68, //   la courbure ne démarre qu'à 68 % de la demi-largeur
} as const;

const HALF = COUNT / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Position (en pas, 0 = centre de l'écran) de l'emplacement i au défilement `step`.
    Bouclée dans [-3, 3) : -2.5 … +2.5 au repos. */
export function slotPos(i: number, step: number) {
  const s = i - (COUNT - 1) / 2 - step * PAIR_SPAN;
  return ((((s + HALF) % COUNT) + COUNT) % COUNT) - HALF;
}

/** Fondu aux bords de la boucle : 1 jusqu'à |pos| = 2.5, 0 à |pos| = 3. */
export const edgeFade = (pos: number) => Math.min(1, Math.max(0, (HALF - Math.abs(pos)) / 0.5));

/** Place et taille (en px, origine au centre de l'écran) d'une carte
    à la position `pos` (en pas). `spread` : 0 = empilées au centre, 1 = alignées.
    Partagé par les images et les verres pour qu'ils restent calés. */
export function restingSlot(pos: number, screenW: number, spread: number) {
  const w = screenW * (screenW < 768 ? LAYOUT.wMobile : LAYOUT.w);
  const k = lerp(0.85, 1, spread);
  return {
    x: pos * w * GAP * lerp(2.6, 1, spread),
    w: w * k,
    h: (w / CARD_ASPECT) * k,
  };
}

/** Projet actif (légende) au défilement `step`. */
export const activeProject = (step: number) =>
  PAIRS[(INTRO_PAIR + Math.round(step)) % PAIRS.length].project;

/** Position (en pas) de l'image active : -0.5 ou +0.5 selon le miroir de la paire.
    Interpolée entre deux étapes pour que le cadre glisse avec les cartes. */
export function frameX(step: number) {
  const k = Math.min(Math.floor(step), MAX_STEP);
  const k2 = Math.min(k + 1, MAX_STEP);
  const at = (n: number) => slotPos(imageRow((INTRO_PAIR + n) % PAIRS.length), n);
  return lerp(at(k), at(k2), k2 === k ? 0 : step - k);
}