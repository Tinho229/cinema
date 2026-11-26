/* Contenu de la section « Transformation gallery ».
   L'ordre = l'ordre d'arrivée : la 1re carte est celle du fond, la dernière
   arrive par-dessus. Les images sont des placeholders : remplace-les par
   les tiennes (ex. /images/transformation/daniel.png). */

export type Testimonial = {
  name: string;
  age: number;
  quote: string;
  program: string;
  result: string;
  duration: string;
  image: string;
  imagePosition?: string;
  alt: string;
};

export const GALLERY_EYEBROW = "La Personnalité de Fèmi";
export const GALLERY_TITLE = ["Les traits, qui font de", "Fèmi ce qu'elle est."] as const;

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    name: "Michelle OBAMA",
    age: 62 ,
    quote: "Il n'y a aucune limite à ce que nous, les femmes, pouvons accomplir. Chaque rêve mérite d'être poursuivi.",
    program: "Girls' Education",
    result: "62 million girls out of school",
    duration: "Let Girls Learn · 2015",
    image: "/images/projects/c3.png",
    imagePosition: "50% 18%",
    alt: "Daniel F. à l’entraînement",
  },
  
  {
    name: "Serena Williams",
    age: 45,
    quote: "Une femme qui croit en elle peut déplacer les limites que le monde lui impose.",
    program: "Inner Strength",
    result: "Breaking Barriers",
    duration: "Believe & Rise",
    image: "/images/projects/c2.png",
    imagePosition: "34% 20%",
    alt: "Samuel K. à l’entraînement",
  },

  {
    name: "Michelle Obama",
    age: 62 ,
    quote: "Elle n'a pas besoin de permission pour devenir celle qu'elle rêve d'être. Elle a le droit de voir grand, de faire entendre sa voix .",
    program: "Self-Determination",
    result: "Confidence & Independence",
    duration: "Own Your Future",
    image: "/images/projects/c1.png",
    imagePosition: "53% 22%",
    alt: "Nadia O. à la salle",
  },
];