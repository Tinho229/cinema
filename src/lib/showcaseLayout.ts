/* Disposition du carrousel, partagée par la scène WebGL (Showcase3D),
   les verres (GlassSlot) et le calque HTML (ShowcaseLayer : cadre, légende).

   Une seule rangée centrée sur l'écran : les images occupent la moitié
   gauche, les verres la moitié droite. L'indice 0 est collé au centre, les
   suivants s'éloignent vers les bords et finissent par sortir de l'écran
   (la lentille courbe ces cartes de bord) :

       [3] [2] [1] [0]  |  [0] [1] [2] [3]
            IMAGES            VERRES

   L'image j et le verre j montrent toujours le même projet. Rien ne bouge :
   le défilement (showcaseState.step) fait tourner le projet affiché dans
   chaque emplacement. Entre deux entiers, step = k + t, t (0 → 1) pilote la
   transition (verres qui se brisent, images qui changent par colonnes).

   Pour ajouter une histoire : ajoute une entrée dans PROJECTS
   (showcaseContent.ts), tout le reste suit.
   Sur mobile (< 768 px) la rangée d'images passe au-dessus de celle des
   verres ; chaque rangée montre ses deux premières cartes. */
import { PROJECTS } from "./showcaseContent";

export const N_PROJECTS = PROJECTS.length;

/** Nombre d'étapes de défilement (une transition par projet restant). */
export const MAX_STEP = N_PROJECTS - 1;

/** Largeur / hauteur d'une carte. */
export const CARD_ASPECT = 1.6;

/** Image (indice) cadrée, légendée, et zoomée à l'ouverture : la plus proche du centre. */
export const FOCUS = 0;

export const LAYOUT = {
  w: 0.24, //        largeur d'une carte / largeur d'écran (desktop)
  wMobile: 0.42, //  idem sur mobile
  gap: 0.07, //      espace entre cartes, en largeur de carte
  mid: 0.03, //      espace entre la dernière image et le premier verre, en largeur d'écran
  ky: 0.06, //       hauteur supplémentaire vers les côtés (lentille)
  start: 0.9, //     la courbure ne démarre qu'à 90 % de la demi-largeur
} as const;

export type Kind = "image" | "glass";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function metrics(W: number) {
  const mobile = W < 768;
  const w = W * (mobile ? LAYOUT.wMobile : LAYOUT.w);
  const h = w / CARD_ASPECT;
  const g = w * LAYOUT.gap;
  return { mobile, w, h, g, pitch: w + g };
}

/** Zone d'un côté, en px, origine au centre de l'écran, y vers le haut.
    Sert à centrer la légende et les filtres : desktop = moitié d'écran
    visible, mobile = une rangée pleine largeur. */
export function blockRect(kind: Kind, W: number) {
  const m = metrics(W);
  if (!m.mobile) {
    return { x: (kind === "image" ? -1 : 1) * W * 0.25, y: 0, w: W * 0.45, h: m.h };
  }
  const off = m.h / 2 + m.h * 0.55;
  return { x: 0, y: (kind === "image" ? 1 : -1) * off, w: W * 0.9, h: m.h };
}

/** Place et taille (px, origine au centre, y vers le haut) de la carte `index`
    d'un côté. `spread` : 0 = rassemblées vers le centre, 1 = en place. */
export function slotRect(kind: Kind, index: number, W: number, spread = 1) {
  const m = metrics(W);
  let x: number;
  let y = 0;
  if (m.mobile) {
    // les deux premières cartes de part et d'autre du centre, la suite sort à droite
    x = (index - 0.5) * m.pitch;
    y = blockRect(kind, W).y;
  } else {
    const side = kind === "image" ? -1 : 1;
    x = side * (W * LAYOUT.mid * 0.5 + m.w / 2 + index * m.pitch);
  }
  const f = lerp(1.6, 1, spread);
  const k = lerp(0.85, 1, spread);
  return { x: x * f, y: y * f, w: m.w * k, h: m.h * k };
}

/** Décompose step en : projet de départ (cur), projet d'arrivée (cur + 1)
    et avancement t de la transition (0 → 1). */
export function transition(step: number) {
  const s = Math.min(Math.max(step, 0), MAX_STEP);
  const cur = Math.floor(s);
  return { cur, t: s - cur };
}

/** Projet affiché dans un emplacement de base `base`, avant (offset = 0)
    ou après (offset = 1) la transition en cours. */
export const projectAt = (base: number, cur: number, offset = 0) =>
  (base + cur + offset) % N_PROJECTS;

/** Projet de l'image cadrée (légende) : change à mi-transition. */
export const activeProject = (step: number) => projectAt(FOCUS, Math.round(step));