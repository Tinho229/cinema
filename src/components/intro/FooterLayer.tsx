import ContactFooter from "@/components/ContactFooter/ContactFooter";
import { HERO_DIM } from "@/lib/showcaseState";

/* Flou du fond du footer, en px. 0 = image nette (seule la luminosité baisse). */
const FOOTER_BLUR = 0;

/* Même cadrage que l'image derrière la section des images (.hero-media finit
   à 1.06 × le scale de .hero-soft, 1.08), pour que le fond ne « saute » pas. */
const MATCH_SCALE = 1.06 * 1.08;

/* Le CSS de ContactFooter n'est dans aucune @layer : il l'emporte sur Tailwind.
   Règle « sans couche » pour garantir un fond transparent. */
const FOOTER_BG_OVERRIDE = ".footer-layer .contact-footer { background: transparent; }";

/* Le footer vit DANS la section épinglée du hero, au-dessus de tout (z-70).
   Invisible au départ ; ShowcaseLayer le révèle colonne par colonne.

   - .footer-layer : cadre plein écran, masqué par colonnes (mask CSS), SANS fond
   - .footer-bg    : l'image du hero, assombrie (HERO_DIM), c'est le seul fond
   - .footer-slide : le footer, qui défile dans le cadre si l'écran est court */
export function FooterLayer() {
  return (
    // fond noir de secours si l'image hero met du temps à charger
    <div className="footer-layer invisible pointer-events-none absolute inset-0 z-[70] overflow-hidden bg-black [&_iframe]:pointer-events-none">
      <style>{FOOTER_BG_OVERRIDE}</style>

      <div className="footer-bg absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src="/images/hero.webp"
          alt=""
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: FOOTER_BLUR > 0 ? `blur(${FOOTER_BLUR}px)` : undefined,
            transform: `scale(${MATCH_SCALE.toFixed(4)})`,
          }}
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: 1 - HERO_DIM }} />
      </div>

      <div className="footer-slide absolute inset-x-0 top-0">
        <ContactFooter />
      </div>
    </div>
  );
}