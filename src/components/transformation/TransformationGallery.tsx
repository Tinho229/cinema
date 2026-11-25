import { Anton } from "next/font/google";
import { HERO_BLUR, HERO_DIM } from "@/lib/showcaseState";
import { TestimonialCard } from "./TestimonialCard";
import {
  GALLERY_EYEBROW,
  GALLERY_TITLE,
  TESTIMONIALS,
} from "./testimonials";
import "./TransformationGallery.css";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-tg-display",
  display: "swap",
});

/* Section rendue DANS la <section> épinglée d'IntroHero, au-dessus de la scène
   des images (z-65) et sous le footer (z-70). Elle est hors écran au départ :
   la timeline de ShowcaseLayer (voir galleryTimeline.ts) la fait monter du bas
   vers le haut, puis fait arriver les cartes une à une.

   Fond : la même image que le hero, à luminosité baissée (HERO_DIM / HERO_BLUR
   dans lib/showcaseState.ts). Le calque est dans .tg-layer, donc il monte avec. */
export function TransformationGallery() {
  return (
    <div className={`tg-layer ${display.variable}`}>
      <div className="tg-bg" aria-hidden="true">
        <img
          src="/images/hero.jpg"
          alt=""
          decoding="async"
          // scale : cache le bord transparent que crée le flou
          style={{ filter: `blur(${HERO_BLUR}px)`, transform: "scale(1.08)" }}
        />
        <div className="tg-bg__dim" style={{ opacity: 1 - HERO_DIM }} />
      </div>

      <div className="tg-inner">
        <div className="tg-left">
          <p className="tg-eyebrow">
            <i aria-hidden="true" />
            {GALLERY_EYEBROW}
          </p>

          <h2 className="tg-title">
            {GALLERY_TITLE.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>

          <p className="tg-lead">
            These aren&rsquo;t before and afters.
            <br />
            They&rsquo;re <strong>beginnings and middles</strong>.
          </p>
        </div>

        <div className="tg-stack">
          {TESTIMONIALS.map((item, i) => (
            <TestimonialCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}