import { CARD_ASPECT } from "./showcaseLayout";
import type { Note } from "./showcaseContent";

/* Le texte d'un verre est dessiné dans un canvas, puis posé comme texture sur
   la carte WebGL : il passe ainsi dans la lentille (courbure, aberration,
   grain) exactement comme les images.

   Styles alignés sur la galerie : titre Anton (--font-display), surtitre et
   corps en crème atténué, interlettrage normal.

   Le canvas a le ratio d'une carte (1.6). Toutes les tailles sont en pixels de
   canvas : à 1920 px d'écran une carte fait ~345 px, soit ~0.34 px d'écran par
   px de canvas. */
export const GLASS_TEXT_W = 1024;
export const GLASS_TEXT_H = Math.round(GLASS_TEXT_W / CARD_ASPECT);

const PAD = 64;
const INK = "244, 241, 234";
const MUTED = 0.64; // un peu plus lisible que 0.58 : le texte est sur un verre clair

type Fit = { size: number; lines: string[] };

/* Piles de polices : corps = celle du site, titre = Anton (variable CSS). */
function families() {
  const style = getComputedStyle(document.body);
  const body = style.fontFamily || "system-ui, sans-serif";
  const v = style.getPropertyValue("--font-display").trim();
  const display = `${v ? `${v}, ` : ""}Impact, "Arial Narrow Bold", sans-serif`;
  return { body, display };
}

/** À attendre avant de (re)dessiner : Anton n'est chargée que si on la demande. */
export function loadGlassFonts(): Promise<unknown> {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  const { display } = families();
  return Promise.all([
    document.fonts.load(`400 64px ${display}`).catch(() => []),
    document.fonts.ready,
  ]);
}

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

/* « NOTE D’INTENTION » -> « Note d’intention » (comme l'eyebrow de la galerie) */
const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

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
  const { body: bodyFamily, display } = families();

  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  // petite ombre portée : garde le texte lisible sur les zones claires du verre
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;

  const eyebrowSize = 32;
  const footSize = 28;
  let y = PAD;

  // Surtitre : atténué, casse normale, sans espacement
  ctx.font = `400 ${eyebrowSize}px ${bodyFamily}`;
  ctx.fillStyle = `rgba(${INK}, ${MUTED})`;
  ctx.fillText(sentenceCase(note.eyebrow), PAD, y + eyebrowSize * 0.8);
  y += eyebrowSize * 0.8 + 26;

  // Titre : Anton, jusqu'à 2 lignes, la taille s'adapte
  const title = fit(ctx, note.title, 400, display, maxW, 190, 2, 1, 96, 56);
  ctx.font = `400 ${title.size}px ${display}`;
  ctx.fillStyle = `rgb(${INK})`;
  title.lines.forEach((line, n) => {
    ctx.fillText(line, PAD, y + title.size * 0.92 + n * title.size);
  });
  y += title.lines.length * title.size;

  // Filet
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillRect(PAD, y + 16, 72, 2);
  y += 16 + 2 + 30;
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";

  // Pied de carte, calé en bas
  const footY = H - PAD;
  ctx.font = `500 ${footSize}px ${bodyFamily}`;
  ctx.fillStyle = `rgba(${INK}, ${MUTED})`;
  ctx.fillText(note.foot, PAD, footY);

  // Corps : prend la place restante entre le filet et le pied
  const bodyBottom = footY - footSize - 28;
  const body = fit(ctx, note.body, 400, bodyFamily, maxW, bodyBottom - y, 6, 1.25, 44, 26);
  ctx.font = `400 ${body.size}px ${bodyFamily}`;
  ctx.fillStyle = `rgba(${INK}, ${MUTED + 0.1})`;
  body.lines.forEach((line, n) => {
    ctx.fillText(line, PAD, y + body.size * 0.95 + n * body.size * 1.25);
  });
}