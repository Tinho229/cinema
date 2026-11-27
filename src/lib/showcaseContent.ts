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

/* \u00a0 = espace insécable (évite qu'un « : » tombe en début de ligne). */
export const PROJECTS: readonly Project[] = [
  {
    title: "Rimma",
    sub: "Identité visuelle",
    src: "/images/projects/p1.webp",
    note: {
      eyebrow: "SYNOPSIS",
      title: "Un cœur sans prix",
      body: "Sènan, riche héritière, épouse Ola, un mécanicien dont elle est profondément amoureuse. Convaincue que l’amour dépasse les différences sociales, elle fonde avec lui une famille et met au monde deux enfants\u00a0: Fèmi et Kossi.",
      foot: "Synopsis — Prise 01",
    },
  },
  {
    title: "Liverpool House",
    sub: "Résidentiel complexe",
    src: "/images/projects/p2.webp",
    note: {
      eyebrow: "SYNOPSIS",
      title: "La fracture",
      body: "Peu à peu, Ola révèle un visage violent et dominateur. Les disputes deviennent des scènes de peur, les humiliations se multiplient et les enfants assistent, impuissants, aux souffrances de leur mère.",
      foot: "Synopsis — Prise 02",
    },
  },
  {
    title: "Yantos",
    sub: "Site web",
    src: "/images/projects/p3.webp",
    note: {
      eyebrow: "SYNOPSIS",
      title: "La rue pour refuge",
      body: "Ola finit par s’approprier les biens de Sènan et la chasse du foyer avec les enfants. Sènan affronte la faim, l’exclusion et l’incertitude du lendemain sous les yeux de Fèmi, alors âgée de onze ans.",
      foot: "Synopsis — Prise 03",
    },
  },
  {
    title: "Atelier Nord",
    sub: "Direction artistique",
    src: "/images/projects/p4.webp",
    note: {
      eyebrow: "SYNOPSIS",
      title: "Demander des comptes",
      body: "Témoin des sacrifices de sa mère, Fèmi décide de retrouver son père. Son objectif\u00a0: récupérer les biens dont Sènan a été privée et rétablir une justice longtemps refusée.",
      foot: "Synopsis — Prise 04",
    },
  },
  {
    title: "Atelier O",
    sub: "Direction artistique",
    src: "/images/projects/p5.webp",
    note: {
      eyebrow: "NOTE D’INTENTION",
      title: "Force de reconquête",
      body: "La réparation matérielle peut-elle effacer la violence\u00a0? FÈMI raconte le courage d’une mère qui refuse de se laisser détruire et la détermination d’une fille qui transforme ses blessures en reconquête.",
      foot: "Synopsis — Prise 05",
    },
  },
];
