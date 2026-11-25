import type { CSSProperties } from "react";
import type { Testimonial } from "./testimonials";

/* Une carte = le panneau texte ET son image. Elles sont dans le même élément :
   quand GSAP fait monter la carte, texte et image montent exactement ensemble. */
export function TestimonialCard({ item, index }: { item: Testimonial; index: number }) {
  return (
    <article className="tg-card" style={{ "--i": index } as CSSProperties}>
      <div className="tg-card__text">
        <div>
          <p className="tg-name">
            <span>{item.name}</span>
            <span aria-hidden="true">–</span>
            <span>{item.age}</span>
          </p>
          <p className="tg-quote">{item.quote}</p>
        </div>

        <dl className="tg-meta">
          <div>
            <dt>Program:</dt>
            <dd>{item.program}</dd>
          </div>
          <div>
            <dt>Result:</dt>
            <dd>{item.result}</dd>
          </div>
          <div>
            <dt>Duration:</dt>
            <dd>{item.duration}</dd>
          </div>
        </dl>
      </div>

      <div className="tg-card__media">
        <img src={item.image} alt={item.alt} decoding="async" />
      </div>
    </article>
  );
}