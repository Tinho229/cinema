import { HERO_BLUR, HERO_DIM } from "@/lib/showcaseState";
import { TestimonialCard } from "./TestimonialCard";
import {
  GALLERY_EYEBROW,
  GALLERY_TITLE,
  TESTIMONIALS,
} from "./testimonials";
import "./TransformationGallery.css";

export function TransformationGallery() {
  return (
    <div className="tg-layer">
      <div className="tg-bg" aria-hidden="true">
        <img
          src="/images/hero.webp"
          alt=""
          decoding="async"
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
            Le 22 Décembre, découvre avec 
            <br />
             Nous le <strong>retour glorieux de Fèmi </strong>.
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