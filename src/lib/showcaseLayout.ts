/* Disposition du carrousel, partagée par la scène WebGL (Showcase3D),
   les verres (GlassSlot) et le calque HTML (ShowcaseLayer : cadre, légende).

   Desktop / paysage : une rangée centrée sur l'écran (images à gauche, verres à droite).
   Mobile portrait : rangée d'images en haut, rangée de verres en bas, carte active centrée. */
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
  wMobile: 0.86, //  idem sur mobile portrait (carte active lisible et centrée)
  gap: 0.07, //      espace entre cartes, en largeur de carte
  mid: 0.03, //      espace entre la dernière image et le premier verre, en largeur d'écran
  ky: 0.06, //       hauteur supplémentaire vers les côtés (lentille)
  start: 0.9, //     la courbure ne démarre qu'à 90 % de la demi-largeur
} as const;

export type Kind = "image" | "glass";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function isStackedViewport(W: number, H = 900) {
  return W < 560 || (W < 768 && H >= W * 0.9);
}

function metrics(W: number, H = 900) {
  const stacked = isStackedViewport(W, H);
  let w: number;
  if (stacked) {
    // Sur mobile portrait : carte large (~86 % largeur) bornée par la hauteur disponible
    // pour loger les titres, la rangée images, la rangée verres et la barre de progression.
    const maxByHeight = Math.max(160, (H - 165) * 0.42 * CARD_ASPECT);
    w = Math.min(W * LAYOUT.wMobile, maxByHeight);
  } else if (W < 1200) {
    // Tablette / petit écran / mobile paysage : agrandit la carte proportionnellement
    // pour préserver la lisibilité des textes dans les verres, borné par la hauteur.
    const t = Math.max(0, Math.min(1, (W - 768) / (1200 - 768)));
    const ratio = W < 768 ? 0.34 : lerp(0.33, LAYOUT.w, t);
    const maxByHeight = Math.max(160, H * 0.56 * CARD_ASPECT);
    w = Math.min(W * ratio, maxByHeight);
  } else {
    const maxByHeight = Math.max(240, H * 0.62 * CARD_ASPECT);
    w = Math.min(W * LAYOUT.w, maxByHeight);
  }
  const h = w / CARD_ASPECT;
  const g = w * LAYOUT.gap;
  const rowGap = stacked ? Math.min(Math.max(H * 0.095, 72), 92) : 0;
  return { stacked, w, h, g, pitch: w + g, rowGap };
}

/** Zone d'un côté, en px, origine au centre de l'écran, y vers le haut.
    Sert à centrer la légende et les filtres : desktop = moitié d'écran
    visible, mobile portrait = une rangée pleine largeur. */
export function blockRect(kind: Kind, W: number, H = 900) {
  const m = metrics(W, H);
  if (!m.stacked) {
    return { x: (kind === "image" ? -1 : 1) * W * 0.25, y: 0, w: W * 0.45, h: m.h };
  }
  const off = m.h / 2 + m.rowGap / 2;
  return { x: 0, y: (kind === "image" ? 1 : -1) * off, w: W * 0.9, h: m.h };
}

/** Place et taille (px, origine au centre, y vers le haut) de la carte `index`
    d'un côté. `spread` : 0 = rassemblées vers le centre, 1 = en place. */
export function slotRect(kind: Kind, index: number, W: number, spread = 1, H = 900) {
  const m = metrics(W, H);
  let x: number;
  let y = 0;
  if (m.stacked) {
    // La carte active (index 0) est centrée ; la suivante amorce la file à droite
    x = index * m.pitch;
    y = blockRect(kind, W, H).y;
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
