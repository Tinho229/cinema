import { CARD_ASPECT } from "./showcaseLayout";
import type { Note } from "./showcaseContent";

/* Le texte d'un verre est dessiné dans un canvas, puis posé comme texture sur
   la carte WebGL : il passe ainsi dans la lentille (courbure, aberration,
   grain) exactement comme les images, ce qu'un texte HTML ne ferait pas.

   Le canvas a le ratio d'une carte (1.6). Toutes les tailles ci-dessous sont
   en pixels de canvas : à 1920 px d'écran une carte fait ~345 px, soit ~0.34
   px d'écran par px de canvas (un corps de 44 donne donc ~15 px à l'écran). */
export const GLASS_TEXT_W = 1024;
export const GLASS_TEXT_H = Math.round(GLASS_TEXT_W / CARD_ASPECT);

const PAD = 64;
const CREAM = "244, 241, 234";

type Fit = { size: number; lines: string[] };

/* Coupe en lignes de largeur ≤ maxW. On ne sépare que sur l'espace normal :
   les espaces insécables du texte restent collés au mot. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (!line || ctx.measureText(test).width <= maxW) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* Cherche la plus grande taille (de `max` à `min`) pour laquelle le texte tient
   dans maxLines lignes et maxH de hauteur. Si même `min` déborde, la dernière
   ligne autorisée est tronquée avec « … ». */
function fit(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  family: string,
  maxW: number,
  maxH: number,
  maxLines: number,
  lineHeight: number,
  max: number,
  min: number
): Fit {
  let lines: string[] = [];
  let size = max;
  for (; size >= min; size -= 2) {
    ctx.font = `${weight} ${size}px ${family}`;
    lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines && lines.length * size * lineHeight <= maxH) {
      return { size, lines };
    }
  }
  size = min;
  ctx.font = `${weight} ${size}px ${family}`;
  const allowed = Math.max(1, Math.min(maxLines, Math.floor(maxH / (size * lineHeight))));
  lines = lines.slice(0, allowed);
  let last = lines[lines.length - 1] ?? "";
  while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
  lines[lines.length - 1] = `${last.trimEnd()}…`;
  return { size, lines };
}

/* Capitales espacées (letterSpacing du canvas n'est pas supporté partout). */
function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

/**
 * Dessine le contenu d'un verre (texte seul, fond transparent : le verre
 * lui-même est rendu par le shader de GlassSlot).
 */
export function drawGlassText(canvas: HTMLCanvasElement, note: Note) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const maxW = W - PAD * 2;
  // même police que le reste du site (Tailwind : pile système)
  const family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";

  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  // petite ombre portée : garde le texte lisible sur les zones claires du verre
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;

  const eyebrowSize = 30;
  const footSize = 28;
  let y = PAD;

  // Surtitre
  ctx.font = `700 ${eyebrowSize}px ${family}`;
  ctx.fillStyle = `rgba(${CREAM}, 0.92)`;
  spaced(ctx, note.eyebrow, PAD, y + eyebrowSize * 0.8, eyebrowSize * 0.16);
  y += eyebrowSize * 0.8 + 30;

  // Titre : jusqu'à 2 lignes, la taille s'adapte
  const title = fit(ctx, note.title, 600, family, maxW, 170, 2, 1.12, 68, 44);
  ctx.font = `600 ${title.size}px ${family}`;
  ctx.fillStyle = `rgb(${CREAM})`;
  title.lines.forEach((line, n) => {
    ctx.fillText(line, PAD, y + title.size * 0.92 + n * title.size * 1.12);
  });
  y += title.lines.length * title.size * 1.12;

  // Filet
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillRect(PAD, y + 16, 72, 2);
  y += 16 + 2 + 34;
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";

  // Pied de carte, calé en bas
  const footY = H - PAD;
  ctx.font = `500 ${footSize}px ${family}`;
  ctx.fillStyle = `rgba(${CREAM}, 0.78)`;
  ctx.fillText(note.foot, PAD, footY);

  // Corps : prend la place restante entre le filet et le pied
  const bodyBottom = footY - footSize - 28;
  const body = fit(ctx, note.body, 400, family, maxW, bodyBottom - y, 6, 1.4, 44, 26);
  ctx.font = `400 ${body.size}px ${family}`;
  ctx.fillStyle = `rgba(${CREAM}, 0.84)`;
  body.lines.forEach((line, n) => {
    ctx.fillText(line, PAD, y + body.size * 0.95 + n * body.size * 1.4);
  });
}
