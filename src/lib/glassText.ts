import { CARD_ASPECT } from "./showcaseLayout";
import type { Note } from "./showcaseContent";

/* Le texte d'un verre est dessiné dans un canvas, puis posé comme texture sur
   la carte WebGL : il passe ainsi dans la lentille (courbure, aberration,
   grain) exactement comme les images.

   Styles alignés sur le projet : titre Frigg Café (--font-display), surtitre et
   corps en crème très contrasté (--font-body).

   Canvas haute définition (ratio 1.6) pour préserver la finesse des lettres. */
export const GLASS_TEXT_W = 1408;
export const GLASS_TEXT_H = Math.round(GLASS_TEXT_W / CARD_ASPECT);

const PAD = 72;
const INK = "250, 248, 243";
const MUTED = 0.86;
const BODY_ALPHA = 0.97;

type Fit = { size: number; lines: string[] };

/* Piles de polices : corps = celle du site, titre = Frigg Café (variable CSS). */
function families() {
  const style = getComputedStyle(document.body);
  const body = style.fontFamily || "system-ui, sans-serif";
  const v = style.getPropertyValue("--font-display").trim();
  const display = `${v ? `${v}, ` : ""}Georgia, serif`;
  return { body, display };
}

/** À attendre avant de (re)dessiner : s'assure que Frigg Café et le corps sont chargés. */
export function loadGlassFonts(): Promise<unknown> {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  const { body, display } = families();
  return Promise.all([
    document.fonts.load(`400 84px ${display}`).catch(() => []),
    document.fonts.load(`400 46px ${body}`).catch(() => []),
    document.fonts.load(`500 42px ${body}`).catch(() => []),
    document.fonts.ready,
  ]);
}

/* Coupe en lignes de largeur ≤ maxW. On normalise les retours à la ligne
   des chaînes multi-lignes tout en préservant les espaces insécables (\u00a0). */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const clean = text.replace(/\s*\n\s*/g, " ").trim();
  const lines: string[] = [];
  let line = "";
  for (const word of clean.split(" ").filter(Boolean)) {
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

/* « NOTE D’INTENTION » -> « Note d’intention » */
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
  // ombre portée fine : sépare nettement les lettres sans bavure autour des traits
  ctx.shadowColor = "rgba(0, 0, 0, 0.82)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  const eyebrowSize = 44;
  const footSize = 40;
  let y = PAD;

  // Surtitre
  ctx.font = `500 ${eyebrowSize}px ${bodyFamily}`;
  ctx.fillStyle = `rgba(${INK}, ${MUTED})`;
  ctx.fillText(sentenceCase(note.eyebrow), PAD, y + eyebrowSize * 0.85);
  y += eyebrowSize * 0.85 + 26;

  // Titre : Frigg Café, jusqu'à 2 lignes, la taille s'adapte
  const titleLineHeight = 1.08;
  const title = fit(ctx, note.title, 400, display, maxW, 250, 2, titleLineHeight, 132, 78);
  ctx.font = `400 ${title.size}px ${display}`;
  ctx.fillStyle = `rgb(${INK})`;
  title.lines.forEach((line, n) => {
    ctx.fillText(line, PAD, y + title.size * 0.92 + n * title.size * titleLineHeight);
  });
  y += title.lines.length * title.size * titleLineHeight;

  // Filet
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.fillRect(PAD, y + 18, 92, 3);
  y += 18 + 3 + 30;
  ctx.shadowColor = "rgba(0, 0, 0, 0.82)";

  // Pied de carte, calé en bas
  const footY = H - PAD;
  ctx.font = `500 ${footSize}px ${bodyFamily}`;
  ctx.fillStyle = `rgba(${INK}, ${MUTED})`;
  ctx.fillText(note.foot, PAD, footY);

  // Corps : prend la place restante entre le filet et le pied
  const bodyBottom = footY - footSize - 30;
  const bodyLineHeight = 1.26;
  const body = fit(ctx, note.body, 400, bodyFamily, maxW, bodyBottom - y, 7, bodyLineHeight, 56, 36);
  ctx.font = `400 ${body.size}px ${bodyFamily}`;
  ctx.fillStyle = `rgba(${INK}, ${BODY_ALPHA})`;
  body.lines.forEach((line, n) => {
    ctx.fillText(line, PAD, y + body.size * 0.95 + n * body.size * bodyLineHeight);
  });
}
