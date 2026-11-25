/* Contenu de la section « Transformation gallery ».
   L'ordre = l'ordre d'arrivée : la 1re carte est celle du fond, la dernière
   arrive par-dessus. Les images sont des placeholders : remplace-les par
   les tiennes (ex. /images/transformation/daniel.jpg). */

export type Testimonial = {
  name: string;
  age: number;
  quote: string;
  program: string;
  result: string;
  duration: string;
  image: string;
  alt: string;
};

export const GALLERY_EYEBROW = "Transformation gallery";
export const GALLERY_TITLE = ["Real results.", "Real people."] as const;

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    name: "Daniel F.",
    age: 52,
    quote: "Fifteen years off the gym. Back in week one.",
    program: "Foundation",
    result: "−12kg",
    duration: "10 weeks",
    image: "/images/projects/p1.jpg",
    alt: "Daniel F. à l’entraînement",
  },
  {
    name: "Nadia O.",
    age: 31,
    quote: "Two kids, one hour a week. Still showing up.",
    program: "Starter",
    result: "−9kg",
    duration: "6 weeks",
    image: "/images/projects/p2.jpg",
    alt: "Nadia O. à la salle",
  },
  {
    name: "Samuel K.",
    age: 38,
    quote: "I stopped counting days and started counting wins.",
    program: "Strength",
    result: "+6kg muscle",
    duration: "12 weeks",
    image: "/images/projects/p3.jpg",
    alt: "Samuel K. à l’entraînement",
  },
];