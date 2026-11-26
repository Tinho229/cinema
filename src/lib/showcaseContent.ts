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
      body: `Sènan, riche héritière, choisit d’épouser Ola, un mécanicien dont elle est profondément amoureuse.
Convaincue que l’amour peut dépasser les différences sociales, elle construit avec lui une famille
et donne naissance à deux enfants : Fèmi et Kossi.`,
      foot: "Synopsis  — Prise 01",
    },
  },
  {
    title: "Liverpool House",
    sub: "Résidentiel complexe",
    src: "/images/projects/p2.jpg",
    note: {
      eyebrow: "NOTE D’INTENTION",
      title: "Faire image",
      body: `Peu à peu, Ola révèle un visage violent et dominateur. Les disputes deviennent des scènes de peur,
les humiliations se multiplient et les enfants assistent, impuissants, aux souffrances de leur mère.
Ola finit par s’approprier les biens de Sènan, puis la chasse du domicile familial avec les enfants. La rue devient leur refuge.`,
      foot: "Synopsis  — Prise 02",
    },
  },
  {
    title: "Yantos",
    sub: "Site web",
    src: "/images/projects/p3.jpg",
    note: {
      eyebrow: "REPÉRAGES",
      title: "Écrire à l’écran",
      body: `Sènan doit affronter la faim, l’exclusion et l’incertitude du lendemain, tout en protégeant ses enfants. Fèmi, alors âgée de onze ans, observe les sacrifices de sa mère.
               `,
      foot: "Synopsie — Prise 03",
    },
  },

    {
    title: "Atelier Nord",
    sub: "Direction artistique",
    src: "/images/projects/p4.jpg",
    note: {
      eyebrow: "MONTAGE",
      title: "Couper juste",
      body: `Elle décide de retrouver son père et de lui demander des comptes. Son objectif est de récupérer les biens dont sa mère a été privée et de rétablir une justice longtemps refusée.`,
      foot: "Scène 04 — Prise 04",
    },

    
  },

  {
    title: "Atelier O",
    sub: "Direction artistique",
    src: "/images/projects/p5.jpg",
    note: {
      eyebrow: "MONTAGE",
      title: "Couper juste",
      body: `Cette confrontation fait remonter les blessures du
passé et pose une question essentielle : la réparation matérielle peut-elle effacer les
conséquences de la violence ? FÈMI raconte le courage d’une mère qui refuse de se laisser détruire et la détermination d’une fille
qui transforme les blessures de son enfance en une force de reconquête`,
     foot: "Synopsis  — Prise 05",
    },
  }
];