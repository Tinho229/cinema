/* Contenu du carrousel : séparé de la disposition (showcaseLayout.ts)
   pour pouvoir changer un texte ou une image sans toucher à la grille. */

export type Project = {
  title: string;
  sub: string;
  src: string;
};

/** Texte d'un verre. Dessiné dans un canvas (voir glassText.ts), donc il suit
    la déformation de la lentille comme les images. */
export type Note = {
  eyebrow: string;
  title: string;
  body: string;
  foot: string;
};

/* Une entrée par projet. L'ordre est celui de l'ancien rendu à 5 cartes. */
export const PROJECTS: readonly Project[] = [
  { title: "Projet Cinq", sub: "Direction artistique", src: "/images/projects/p5.jpg" },
  { title: "Rimma", sub: "Identité visuelle", src: "/images/projects/p1.jpg" },
  { title: "Liverpool House", sub: "Résidentiel complexe", src: "/images/projects/p2.jpg" },
  { title: "Yantos", sub: "Site web", src: "/images/projects/p3.jpg" },
  { title: "Projet Quatre", sub: "Motion design", src: "/images/projects/p4.jpg" },
];

/* Textes provisoires : à remplacer par le vrai synopsis.
   \u00a0 = espace insécable (évite qu'un « : » tombe en début de ligne). */
export const NOTES: readonly Note[] = [
  {
    eyebrow: "SYNOPSIS",
    title: "Ligne de fuite",
    body: "Là où les lignes se rejoignent, l’image commence. Un studio, une caméra, un seul point de mire\u00a0: le fond du plan.",
    foot: "Scène 01 — Prise 01",
  },
  {
    eyebrow: "NOTE D’INTENTION",
    title: "Faire image",
    body: "Chaque projet naît d’un regard, puis d’une lumière. Nous travaillons le cadre jusqu’à ce qu’il respire.",
    foot: "Scène 02 — Prise 01",
  },
];
