Use this DesignMD document as the source of truth. Preserve its structure, hierarchy, and formatting unless explicitly instructed otherwise.

---
version: alpha
name: Pivenilya
description: |
  Piven Ilya's design system embodies a dark, minimalist aesthetic with an air
  of sophisticated restraint. The palette is dominated by deep charcoal and pure
  white, creating stark contrast and visual drama. Accents of burnt orange and
  warm brown punctuate the neutral foundation, suggesting depth and artisanal
  craft. The typography is bold and confident, with generous negative tracking
  that creates breathing room on display scales. This is a system designed for
  portfolio work and motion design—spare, intentional, and uncompromising. Every
  element serves the content; decoration is minimal, hierarchy is absolute, and
  silence is as valued as presence.
source:
  url: "https://pivenilya.com/portfolio"
  pagesAnalyzed: 1
  extractedAt: 2026-11-23
  tokensMeasured: true
colors:
  primary: "#FFFFFF"
  canvas: "#252525"
  ink: "#FFFFFF"
  accent-1: "#1D1915"
  accent-2: "#B5401E"
typography:
  display:
    fontFamily: "TT Norms Pro"
    fontSize: 86.9999px
    fontWeight: 600
    lineHeight: 1.28
    letterSpacing: -7.83px
  body:
    fontFamily: "TT Norms Pro"
    fontSize: 7.5px
    fontWeight: 450
    letterSpacing: 0px
rounded:
  none: 0px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 36px
  section: 48px
  band: 60px
borderWidths:
  thin: 2px
elevationStrategy: color-blocking
themes:
  derived: light   # the other theme is the site's measured palette
  light:
    bg: "#FBFBFB"
    surface: "#F1F1F1"
    surfaceRaised: "#E9E9E9"
    text: "#1D1D1D"
    textMuted: "#707070"
    border: "#D8D8D8"
    accent: "#707070"
    accentFg: "#FFFFFF"
    focusRing: "#8F8F8F"
    elevation: shadow
  dark:
    bg: "#252525"
    surface: "#242424"
    surfaceRaised: "#363636"
    text: "#FFFFFF"
    textMuted: "#B3B3B3"
    border: "#3F3F3F"
    accent: "#FFFFFF"
    accentFg: "#0B0B0C"
    focusRing: "#FFFFFF"
    elevation: "border+surface"
components:
  navigation:
    textColor: "{colors.ink}"
    height: 17.25px
    fontSize: 13.5px
    fontFamily: "TT Norms Pro"
    fontWeight: 500
    lineHeight: 1.28
  link:
    typography: "{typography.body}"
    textColor: "{colors.ink}"
  link-2:
    textColor: "{colors.ink}"
    fontSize: 13.5px
    fontFamily: "TT Norms Pro"
    fontWeight: 500
    lineHeight: 1.28
states:
  other-focus-visible:
    target: other
    state: focus-visible
    opacity: 1
    transform: "scale(1)"
  other-hover:
    target: other
    state: hover
    opacity: 1
    transform: "scale(1)"
  other-focus:
    target: other
    state: focus
    outline: none
breakpoints:
  - width: 375
    containerWidth: 1920
    gridColumns: 0
    navLinksVisible: 0
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 10
    sectionPaddingX: 0
  - width: 768
    containerWidth: 1920
    gridColumns: 0
    navLinksVisible: 0
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 11
    sectionPaddingX: 0
  - width: 1024
    containerWidth: 1920
    gridColumns: 0
    navLinksVisible: 0
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 5
    sectionPaddingX: 0
  - width: 1280
    containerWidth: 1920
    gridColumns: 0
    navLinksVisible: 0
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 7
    sectionPaddingX: 0
  - width: 1440
    containerWidth: 1920
    gridColumns: 0
    navLinksVisible: 0
    menuToggleVisible: false
    headingPx: 0
    bodyPx: 8
    sectionPaddingX: 0
coverage:
  statesFound: 21
  gradientsFound: 0
  rolesUnassigned: 2
  archetypesUnnamed: 0
  archetypesDetected: 0
  responsiveMeasured: true
  stylesheetsBlocked: false
  semanticRampDeclared: false
---

# Design System Inspired by Piven Ilya

## 1. Visual Theme & Atmosphere

Piven Ilya's design system embodies a **dark, minimalist aesthetic** with an air of sophisticated restraint. The palette is dominated by deep charcoal and pure white, creating stark contrast and visual drama. Accents of burnt orange and warm brown punctuate the neutral foundation, suggesting depth and artisanal craft. The typography is bold and confident, with generous negative tracking that creates breathing room on display scales. This is a system designed for **portfolio work and motion design**—spare, intentional, and uncompromising. Every element serves the content; decoration is minimal, hierarchy is absolute, and silence is as valued as presence.

**Key Characteristics**
- Dark-first palette with white as primary text and accent
- Sharp, rectilinear geometry (no rounded corners)
- Bold display typography with tight negative letter-spacing
- Minimal elevation; color-blocking for depth
- Generous spacing and high contrast for legibility
- Fits a creative portfolio aesthetic with motion-ready foundations

## 2. Color Palette & Roles

### Primary
- **Primary / Brand / Ink** (`#FFFFFF`): Primary call-to-action fills, brand mark, active states, headings, and primary text throughout. The defining accent and highest-contrast element.

### Accent Colors
- **Decorative Accent** (`#B5401E`): Warm burnt orange used as a secondary decorative element; no primary functional role assigned.
- **Decorative Accent** (`#1D1915`): Deep warm brown; decorative use only, no primary functional role assigned.

### Neutral Scale
- **Canvas** (`#252525`): Default page background; a near-black surface that anchors the entire interface.

## 3. Typography Rules

### Font Family
**Primary:** TT Norms Pro (sans-serif)  
**Fallback:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---|---|---|---|---|
| Display | TT Norms Pro | 86.9999px | 600 | 1.28 | -7.83px | Hero/largest headings; aggressive negative tracking |
| Navigation | TT Norms Pro | 13.5px | 500 | 17.25px | 0px | Top-level navigation links |
| Body | TT Norms Pro | 7.5px | 450 | normal | 0px | Small descriptive text, footnotes, captions |
| Link | TT Norms Pro | 7.5px | 450 | normal | 0px | Inline links and secondary actions |

### Principles
- **Display sizes employ aggressive negative tracking** (-7.83px) to tighten letterforms and create visual density, reinforcing the bold, deliberate brand voice.
- **Hierarchy is tightly constrained**; only three functional sizes exist (display, navigation, body/link).
- **Weight variation is minimal** (450–600), with bold reserved for headings and navigation.
- **Line height expands for larger sizes** (1.28 on display) to prevent crowding, while body text uses `normal` for efficiency.

## 4. Component Stylings

### Navigation
**Default state:**
- Font: TT Norms Pro, 13.5px, weight 500
- Line Height: 17.25px
- Color: `#FFFFFF`
- Background: transparent (rgba(0, 0, 0, 0))
- Border: none
- Border Radius: 0px
- Padding: 0px
- Box Shadow: none

### Links
**Default state (small):**
- Font: TT Norms Pro, 7.5px, weight 450
- Color: `#FFFFFF`
- Background: transparent
- Border: none
- Border Radius: 0px
- Padding: 0px
- Text Decoration: underline (implicit for links)

**Default state (medium / navigation-linked):**
- Font: TT Norms Pro, 13.5px, weight 500
- Line Height: 17.25px
- Color: `#FFFFFF`
- Background: transparent
- Border: none
- Border Radius: 0px
- Padding: 0px

**Hover State:**
- Color: `#FFFFFF` (inverted or brightened contextually)

**Focus-Visible State:**
- Outline: 1px solid `#FFFFFF` (or dim variant per context)

### Inputs & Forms
**Default state:**
- Border: 2px solid `#FFFFFF` (thin border width)
- Border Radius: 0px
- Background: transparent or `#252525`
- Text Color: `#FFFFFF`
- Font: TT Norms Pro, 7.5px–13.5px depending on context

## 5. Layout Principles

### Spacing System
Base unit: **4px**

Scale:
- `{spacing.xxs}` = 4px — micro-spacing between adjacent elements
- `{spacing.xs}` = 8px — tight intra-component spacing
- `{spacing.sm}` = 12px — compact section spacing
- `{spacing.md}` = 16px — standard rhythm spacing
- `{spacing.lg}` = 20px — loose component spacing
- `{spacing.xl}` = 24px — section heading/block spacing
- `{spacing.xxl}` = 32px — major section breaks
- `{spacing.xxxl}` = 36px — large vertical breathing room
- `{spacing.section}` = 48px — section-to-section gap
- `{spacing.band}` = 60px — full-width band padding and major vertical divisions

### Grid & Container
- **Content column width:** 1920px (fixed, non-responsive; layout does not adapt column width across breakpoints)
- **Strategy:** Single-column, full-width layout with consistent max-width container
- **Section patterns:** Vertical stacking with `{spacing.band}` (60px) gaps between major content regions

### Whitespace Philosophy
Whitespace is deliberate and functional. The system uses generous gaps (`{spacing.section}` and `{spacing.band}`) to separate portfolio pieces and create visual breathing room. Within components, padding is minimal to tight, enforcing a no-nonsense aesthetic. Negative space is as important as content—silence punctuates the work.

### Border Radius Scale
- `{rounded.none}` = 0px — applied to all interactive elements (buttons, images, badges, inputs). The system is entirely **rectilinear**; no rounded corners anywhere.

## 6. Depth & Elevation

**Elevation Strategy:** Color-blocking (depth through surface color changes, not shadows).

| Level | Treatment | Use |
|---|---|---|
| Flat (Base) | No shadow, background = `#252525` or transparent | Default surfaces, text, inputs |
| Accent Overlay | Background shifts to `#FFFFFF` or decorative accent; no shadow | Highlighted sections, active states, brands |

**Shadow Philosophy:**  
The system does not employ box-shadows for elevation. All depth is achieved through **color contrast and background shifts**. This creates a graphic, almost print-like aesthetic where layers are defined by hue rather than atmospheric perspective.

## 7. Do's and Don'ts

### Do
- Use `#FFFFFF` as the dominant accent and CTA color; it is the brand's primary signal.
- Maintain sharp corners (0px radius) on all interactive and decorative elements.
- Apply negative letter-spacing (-7.83px) on display-sized headings to reinforce the bold, compressed aesthetic.
- Separate major content sections with `{spacing.band}` (60px) to establish clear visual hierarchy.
- Prioritize high contrast; pair `#252525` backgrounds with `#FFFFFF` text for maximum legibility.
- Use decorative accents (`#B5401E`, `#1D1915`) sparingly and intentionally, never as primary CTAs.

### Don't
- Round any corners; maintain rectilinear geometry throughout.
- Add box-shadows or blur effects for elevation; rely on color shifts instead.
- Increase the content column width beyond 1920px or introduce responsive column changes.
- Soften the typography; maintain aggressive tracking and bold weights on headings.
- Use semantic color roles (error red, success green) beyond the brand palette; they are not defined in the system.
- Add decoration or ornament beyond the core palette; restraint is the aesthetic principle.

## 8. Responsive Behavior

### Breakpoints
Based on measured extraction data, the site maintains a **fixed 1920px content width** across all breakpoints. No layout changes, column redistribution, or nav collapsing is observed. The design is **not responsive** in the traditional sense; it adapts only through viewport scrolling.

| Viewport | Content Width | Layout Columns | Nav Visible | Largest Heading Size | Notes |
|---|---|---|---|---|---|
| 375px (mobile) | 1920px | n/a | n/a | 86.9999px | Fixed-width design; overflow handled via scroll |
| 768px (tablet) | 1920px | n/a | n/a | 86.9999px | No breakpoint change |
| 1024px (desktop) | 1920px | n/a | n/a | 86.9999px | No breakpoint change |
| 1440px+ (large desktop) | 1920px | n/a | n/a | 86.9999px | No layout shift; content maintains scale |

### Touch Targets
No explicit touch-target sizing was extracted. Buttons and interactive elements use the minimum font size (7.5px for links, 13.5px for navigation), which may fall below mobile accessibility standards (48px × 48px minimum). Consider expanding padding or hit areas on touch devices.

### Collapsing Strategy
**No adaptive collapsing is implemented.** The layout is fixed-width at 1920px regardless of viewport. Navigation does not collapse into a menu; content does not reflow into fewer columns. Mobile users experience horizontal scroll. If responsive behavior is desired, it is not part of the current extracted design.

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA:** White (`#FFFFFF`)
- **Background:** Canvas (`#252525`)
- **Heading Text:** White (`#FFFFFF`)
- **Decorative Accent (warm):** Burnt Orange (`#B5401E`)
- **Decorative Accent (brown):** Deep Brown (`#1D1915`)

### Iteration Guide
1. **All text begins white (`#FFFFFF`) on dark canvas (`#252525`).** This is the only high-contrast pair; maintain it.
2. **Display headings use TT Norms Pro 86.9999px, weight 600, with -7.83px letter-spacing.** Do not round the negative tracking; it is a defining visual trait.
3. **All corners are sharp (0px radius).** No rounded buttons, inputs, or containers anywhere.
4. **Separate major content sections with 60px gaps (`{spacing.band}`).** Never collapse this or use shorter breaks.
5. **Decorative accents (`#B5401E`, `#1D1915`) are secondary and minimal.** Use them only in backgrounds or highlights, never as primary text or interactive fills.
6. **Navigation and links are unstyled (no border, transparent background, tight padding).** Text color only.
7. **Inputs have a 2px border in the foreground color.** No shadow, no background tint.
8. **No elevation via shadows; all depth comes from color blocking.** If a region needs to feel "raised," shift its background hue, not its shadow.

## 10. Known Gaps

- **No semantic status colors.** The site does not expose error, warning, success, or info states. Do not invent a semantic ramp; none was measured.
- **No hover, active, or disabled states explicitly defined per component.** Interaction states appear in the stylesheet data but are ambiguous (generic `:hover`, `:focus-visible` rules without clear component binding). Use these as reference only; clarify desired states with the team.
- **No gradient or decorative mesh patterns.** Surfaces are flat single-color fills. Any animation or particle effects (visible in the brand hero) are CSS/JS driven, not part of the token system.
- **Two accent colors (`#1D1915`, `#B5401E`) lack assigned functional roles.** They appear to be decorative only. Their exact usage context was not extracted.
- **No dark/light theme variant.** This system is dark-only; a light mode (if desired) is not documented.
- **Typography hierarchy is severely limited.** Only three functional sizes exist (display, navigation, body/link). No caption, label, or fine-print variants were measured.
- **Fixed-width layout (1920px) does not adapt across breakpoints.** Mobile experience may require viewport-width adjustment; not extracted.
- **No z-index scale documented.** Layering values (1–50) were listed but their component mapping was not fully decoded; treat as reference only.
- **Input focus and disabled states not measured.** Only a 2px border style was extracted for the input default state.
- **Coverage:** One page (portfolio) analyzed. Surfaces behind authentication, internal dashboards, or interaction patterns on other routes were not visited.