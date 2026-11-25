import { Fragment, type CSSProperties, type ElementType } from "react";
import "./text-reveal.css";

/* Découpe un texte en mots, chacun dans un masque (voir text-reveal.css).
   Aucun hook : utilisable dans un composant serveur comme client.

   - \n dans le texte = retour à la ligne
   - auto : le texte s'anime tout seul à l'apparition (pour ce qui est monté après coup)
   - sinon : les mots sont animés par addTextReveal() (lib/textReveal.ts)
   - le texte complet reste lu par les lecteurs d'écran (sr-only) */
type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  auto?: boolean;
  /** décalage de départ en ms (mode auto) */
  delay?: number;
};

export function RevealText({ text, as: Tag = "span", className = "", auto = false, delay = 0 }: Props) {
  let k = 0;

  return (
    <Tag className={`${auto ? "rt--auto " : ""}${className}`.trim() || undefined}>
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      <span aria-hidden="true">
        {text.split("\n").map((line, li) => (
          <Fragment key={li}>
            {li > 0 && <br />}
            {line
              .split(" ")
              .filter(Boolean)
              .map((word, wi) => {
                const style = auto
                  ? ({ "--k": k++, "--d": `${delay}ms` } as CSSProperties)
                  : undefined;
                return (
                  <Fragment key={wi}>
                    {wi > 0 && " "}
                    <span className="rt-w">
                      <span className="rt-i" style={style}>
                        {word}
                      </span>
                    </span>
                  </Fragment>
                );
              })}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}