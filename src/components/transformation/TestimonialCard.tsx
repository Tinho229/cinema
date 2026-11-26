import type { CSSProperties } from "react";
import { RevealText } from "@/components/text/RevealText";
import type { Testimonial } from "./testimonials";

/* Une carte = le panneau texte ET son image. Elles sont dans le même élément :
   quand GSAP fait monter la carte, texte et image montent exactement ensemble.
   Les textes sont en <RevealText /> : galleryTimeline.ts les révèle mot par mot. */
export function TestimonialCard({ item, index }: { item: Testimonial; index: number }) {
  return (
    <article className="tg-card" style={{ "--i": index } as CSSProperties}>
      <div className="tg-card__text">
        <div>
          <p className="tg-name">
            <RevealText text={item.name} />
            <RevealText text="–" />
            <RevealText text={String(item.age)} />
          </p>
          <p className="tg-quote">
            <RevealText text={item.quote} />
          </p>
        </div>

        <dl className="tg-meta">
          <div>
            <dt>
              <RevealText text="Focus:" />
            </dt>
            <dd>
              <RevealText text={item.program} />
            </dd>
          </div>
          <div>
            <dt>
              <RevealText text="Impact:" />
            </dt>
            <dd>
              <RevealText text={item.result} />
            </dd>
          </div>
          <div>
            <dt>
              <RevealText text="Initiative:" />
            </dt>
            <dd>
              <RevealText text={item.duration} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="tg-card__media">
        <img src={item.image} alt={item.alt} decoding="async" />
      </div>
    </article>
  );
}