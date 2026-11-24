/* Contenu du carrousel : séparé de la disposition (showcaseLayout.ts)
   pour pouvoir changer un texte ou une image sans toucher à la grille. */

/** Texte d'un verre. Dessiné dans un canvas (voir glassText.ts), donc il suit
    la déformation de la lentille comme les images. */
export type Note = {
  eyebrow: string;
  title: string;
  body: string;
  foot: string;
};

/** Un projet = une image + le verre qui lui est associé. */
export type Project = {
  title: string;
  sub: string;
  src: string;
  note: Note;
};

/* \u00a0 = espace insécable (évite qu'un « : » tombe en début de ligne).
   Textes provisoires : à remplacer par le vrai synopsis. */
export const PROJECTS: readonly Project[] = [
  {
    title: "Rimma",
    sub: "Identité visuelle",
    src: "/images/projects/p1.jpg",
    note: {
      eyebrow: "SYNOPSIS",
      title: "Ligne de fuite",
      body: "Là où les lignes se rejoignent, l’image commence. Un studio, une caméra, un seul point de mire\u00a0: le fond du plan.",
      foot: "Scène 01 — Prise 01",
    },
  },
  {
    title: "Liverpool House",
    sub: "Résidentiel complexe",
    src: "/images/projects/p2.jpg",
    note: {
      eyebrow: "NOTE D’INTENTION",
      title: "Faire image",
      body: "Chaque projet naît d’un regard, puis d’une lumière. Nous travaillons le cadre jusqu’à ce qu’il respire.",
      foot: "Scène 02 — Prise 01",
    },
  },
  {
    title: "Yantos",
    sub: "Site web",
    src: "/images/projects/p3.jpg",
    note: {
      eyebrow: "REPÉRAGES",
      title: "Écrire à l’écran",
      body: "Une interface se lit comme un plan\u00a0: on y entre par un détail, on y reste pour le rythme.",
      foot: "Scène 03 — Prise 01",
    },
  },

    {
    title: "Atelier Nord",
    sub: "Direction artistique",
    src: "/images/projects/p4.jpg",
    note: {
      eyebrow: "MONTAGE",
      title: "Couper juste",
      body: "Le rythme se décide au montage\u00a0: on garde ce qui respire, on retire ce qui explique.",
      foot: "Scène 04 — Prise 01",
    },
  },
];