/* Look de l'image du hero pendant la section images.
   Une seule source de vérité : le CSS (.hero-bg) et le verre WebGL (GlassSlot)
   restent ainsi à la même luminosité. */
export const HERO_DIM = {
  brightness: 0.6, // 1 = intact, plus bas = plus sombre
  blur: 5, //         px
  scale: 1.03, //     léger zoom : cache les bords du flou
};

/* brightness CSS (espace sRGB) -> facteur linéaire utilisé par les shaders */
export const HERO_DIM_LINEAR = HERO_DIM.brightness ** 2.2;