# Precursor · Brand System
**AI Exposure Index™** — Design Brief for Engineers

---

## 1. Brand Positioning

**Precursor** is a research platform that measures how exposed any profession is to AI automation, expressed as an **AI Exposure Score™** (0–100).

The brand sits at the intersection of precision data and editorial authority — closer to *The Economist* or *Bloomberg* than to a typical SaaS product. It should feel like something you'd cite, not just use.

**Core brand attributes:** Precise. Authoritative. Legible. Calm.

---

## 2. The Logo

### Primary Mark — The Cursor

The logo mark is a serif I-beam text cursor: the thing that appears before you type. "Precursor" — it lives inside the brand name.

**SVG source (inline-safe, use this in code):**

```svg
<!-- Cobalt (default) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 48" fill="none">
  <rect x="0" y="0" width="32" height="5" rx="0.5" fill="#1D4ED8"/>
  <rect x="13" y="5" width="6" height="38" fill="#1D4ED8"/>
  <rect x="0" y="43" width="32" height="5" rx="0.5" fill="#1D4ED8"/>
</svg>
```

**Logo files:**
- `precursor-logo-mark.svg` — Cobalt mark, transparent bg (default)
- `precursor-logo-white.svg` — White mark (dark/cobalt backgrounds)
- `precursor-logo-ink.svg` — Ink/black mark (print, monochrome)
- `precursor-wordmark.svg` — Horizontal lockup: mark + logotype

### Logo Usage Rules

| Context | Mark to use |
|---|---|
| Light / white background | Cobalt mark (#1D4ED8) |
| Dark / ink background | White mark (#FFFFFF) |
| Cobalt background | White mark (#FFFFFF) |
| Print / single-color | Ink mark (#0A0A0A) |
| Favicon / app icon | Cobalt mark, square crop with padding |

**Minimum size:** 16px height for mark only. 80px width for horizontal wordmark.

**Clear space:** Equal to the width of the stem (≈ 20% of mark width) on all sides.

**Never:** Rotate, skew, recolor to non-brand colors, add drop shadows, place on busy backgrounds.

### Wordmark

Logotype: **"Precursor"** in Inter Light (weight 300), tracking −0.5px, fill Ink (#0A0A0A).

On dark backgrounds: fill White (#FFFFFF).

Lockup spacing: 12px gap between mark and logotype at standard scale.

---

## 3. Color System

### Primary Palette

```css
--color-cobalt:      #1D4ED8;  /* Primary brand. CTAs, marks, links, active states */
--color-cobalt-deep: #1E3A8A;  /* Dark mode primary, pressed states, footers */
--color-cobalt-mid:  #2563EB;  /* Hover states on cobalt elements */
--color-cobalt-light:#DBEAFE;  /* Tinted backgrounds, tag fills, highlights */
--color-cobalt-pale: #EFF6FF;  /* Subtlest background, alternate surface */
```

### Neutral Palette

```css
--color-ink:         #0A0A0A;  /* Primary text, headings */
--color-off-black:   #1A1A1A;  /* Body text */
--color-dark-gray:   #3A3A3A;  /* Secondary text */
--color-mid-gray:    #6B6B6B;  /* Placeholder, disabled, captions */
--color-light-gray:  #C4C4C4;  /* Disabled borders, skeleton */
--color-border:      #E8E8E8;  /* Default dividers and borders */
--color-parchment:   #F7F6F4;  /* Page background (warm off-white) */
--color-white:       #FFFFFF;  /* Cards, panels, reverse type */
```

### Score Color Scale (AI Exposure Score™ 0–100)

```css
--score-low:         #16A34A;  /* 0–30 · Green · Low exposure */
--score-medium:      #CA8A04;  /* 31–60 · Amber · Moderate exposure */
--score-high:        #DC2626;  /* 61–84 · Red · High exposure */
--score-critical:    #7C3AED;  /* 85–100 · Purple · Critical exposure */
```

**Score usage rule:** Score color applies to the score number and its associated dot/indicator only. Backgrounds remain neutral.

### Usage Principles

- **Cobalt (#1D4ED8) on white:** Passes WCAG AA at all sizes.
- **White on Cobalt:** Passes WCAG AA. Primary button text.
- **Never use cobalt as page background for body text** — use ink/off-black text on white/parchment.
- Ink (#0A0A0A) is for headings and display type. Off-Black (#1A1A1A) for body text.

---

## 4. Typography

### Typefaces

| Role | Face | Weights | Use |
|---|---|---|---|
| Display | DM Serif Display | 400 (Regular), 400 Italic | Hero headings, pull quotes, editorial moments |
| UI / Body | Inter | 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold) | Everything else |
| Data / Mono | JetBrains Mono | 400, 500 | Scores, percentages, table numbers, code |

### Loading (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

```css
/* Display */
--text-display-xl: 72px / 1.05 / DM Serif Display;  /* Hero headline */
--text-display-lg: 48px / 1.1  / DM Serif Display;  /* Section headline */
--text-display-md: 36px / 1.15 / DM Serif Display;  /* Card headline */

/* UI */
--text-title-lg:   24px / 1.3  / Inter 600;          /* Page title */
--text-title-md:   18px / 1.4  / Inter 500;          /* Section title */
--text-title-sm:   14px / 1.4  / Inter 600 uppercase letter-spacing 0.08em; /* Eyebrow / label */

/* Body */
--text-body-lg:    18px / 1.6  / Inter 400;          /* Long-form body */
--text-body-md:    16px / 1.55 / Inter 400;          /* Default body */
--text-body-sm:    14px / 1.5  / Inter 400;          /* Secondary, captions */
--text-body-xs:    12px / 1.4  / Inter 400;          /* Meta, legal */

/* Data */
--text-score-xl:   96px / 1.0  / JetBrains Mono 500; /* Hero score display */
--text-score-lg:   48px / 1.0  / JetBrains Mono 500; /* Card score */
--text-score-md:   24px / 1.0  / JetBrains Mono 400; /* Table score */
--text-score-sm:   14px / 1.0  / JetBrains Mono 400; /* Inline score badge */
```

### Typography Rules

- Headlines use **DM Serif Display** — editorial, authoritative, slightly literary.
- Use **italic** of DM Serif Display for brand statements and pull quotes.
- Numbers, scores, and percentages always use **JetBrains Mono** — precision is non-negotiable.
- All-caps labels use Inter 600, 0.08em letter-spacing, 11–13px. Used for: eyebrows, table headers, category tags.
- Body copy: Inter 400, never lighter than 400 for paragraph text.
- Avoid mixing DM Serif and Inter in the same sentence.

---

## 5. Spacing System

8px base unit. All spacing is a multiple of 8.

```css
--space-1:   4px;
--space-2:   8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
```

---

## 6. Component Patterns

### Navigation

```
[Cursor Mark] Precursor          [AI Exposure Index] [About] [Research] [Sign In]
```

- Background: White (#FFFFFF), 1px bottom border (#E8E8E8)
- Logo: Cursor mark (cobalt) + "Precursor" logotype (ink, Inter 300, 18px)
- Nav links: Inter 400, 14px, Dark Gray (#3A3A3A), hover → Cobalt
- CTA button: "Request Access" — Cobalt fill, white text, Inter 500, 14px, 40px height, 16px h-padding, no border radius (or 2px max)
- Sticky on scroll. Height: 64px.

### Score Card

```
┌──────────────────────────────┐
│ OCCUPATION TITLE             │  ← Inter 600, 11px, uppercase, Mid Gray
│                              │
│ Software Engineer            │  ← Inter 500, 20px, Ink
│ Technology · Engineering     │  ← Inter 400, 13px, Mid Gray
│                              │
│         74                   │  ← JetBrains Mono 500, 64px, score color
│         /100                 │  ← Inter 300, 16px, Light Gray
│                              │
│ ████████████░░░░░░░░  74%   │  ← Progress bar, 4px height, cobalt fill
└──────────────────────────────┘
```

- Card: White bg, 1px border (#E8E8E8), 4px border-left in score color
- Padding: 24px
- Score color: Determined by value (see Score Color Scale)
- Do NOT round card corners aggressively — 2px max, or 0.

### Score Badge (inline)

```
[ 74 ]
```

- JetBrains Mono 500, 13px
- Background: score-color at 10% opacity
- Text: score color
- Padding: 2px 6px, border-radius: 2px

### AI Exposure Index Table

```
OCCUPATION            SECTOR          SCORE   TREND
────────────────────────────────────────────────────
Software Engineer     Technology      74      ↑ +3
Data Analyst          Finance         81      → 0
Nurse                 Healthcare      31      ↓ −2
```

- Table: full-width, no outer border
- Header: Inter 600, 11px, uppercase, 0.08em tracking, Mid Gray (#6B6B6B)
- Row separator: 1px solid #E8E8E8
- Row hover: Parchment (#F7F6F4) background
- Score column: JetBrains Mono 400, colored by score value
- Trend: JetBrains Mono 400, 13px; ↑ green, → gray, ↓ red

### Hero Section

```
[eyebrow: PRECURSOR · AI EXPOSURE INDEX™]

How exposed is your
profession to AI?

[body: The AI Exposure Index™ scores every occupation 0–100
based on task automation risk, augmentation potential, and
displacement probability.]

[Search bar: "Search any occupation..."]     [Explore Index →]
```

- Background: White or Parchment
- Eyebrow: Inter 600, 12px, Cobalt, uppercase, 0.1em tracking
- Headline: DM Serif Display, 56–72px, Ink, line-height 1.05
- Body: Inter 400, 18px, Dark Gray (#3A3A3A), max-width 600px
- Search: 48px height, border 1.5px solid #E8E8E8, focus → Cobalt border, Inter 400 16px
- Max content width: 1200px. Hero content centered or left-aligned at 600px.

### Dark Hero (alternate)

- Background: Ink (#0A0A0A)
- All text: White (#FFFFFF)
- Logo: White cursor mark
- Cobalt used for: eyebrow, accent lines, active elements only
- Subtext: Light Gray (#C4C4C4)

### Buttons

```css
/* Primary */
background: #1D4ED8;
color: #FFFFFF;
font: Inter 500 14px;
height: 40px;
padding: 0 20px;
border-radius: 2px;
border: none;

/* Primary hover */
background: #2563EB;

/* Secondary / Ghost */
background: transparent;
color: #1D4ED8;
border: 1.5px solid #1D4ED8;

/* Destructive / tertiary */
background: transparent;
color: #6B6B6B;
border: 1.5px solid #E8E8E8;
```

**Rule:** No large border radii. Buttons are rectangular (0–4px). This is a data product, not a consumer app.

---

## 7. Iconography

- Use **Lucide** icon set (https://lucide.dev) — clean, 1.5px stroke weight.
- Icon size: 16px inline, 20px UI, 24px display.
- Icon color: inherits text color of context.
- The Cursor mark (I-beam) is the ONLY custom icon in the system. All others use Lucide.

---

## 8. Motion

- All transitions: `150ms ease-out` (UI interactions), `300ms ease-out` (page elements).
- Hover states: color/border only. No transform/scale on data components.
- Score counters: count up from 0 on first view, 600ms, ease-out, JetBrains Mono.
- No parallax, no marquees, no attention-seeking animation.

---

## 9. Borders & Elevation

```css
--border-default:  1px solid #E8E8E8;     /* Cards, inputs, dividers */
--border-focus:    1.5px solid #1D4ED8;   /* Focused inputs */
--border-strong:   1px solid #C4C4C4;     /* Stronger dividers */

/* No box shadows on data components. Use borders instead. */
/* Subtle shadow only for floating elements (dropdowns, tooltips): */
--shadow-float: 0 4px 16px rgba(0,0,0,0.08);
```

Border radius: 0–4px maximum. Prefer 2px for cards, 2px for buttons, 4px for badges/tags.

---

## 10. Grid & Layout

- Max container width: **1200px**
- Content column: **720px** (readable body text)
- Gutters: 24px (mobile), 40px (desktop)
- Grid: 12-column
- Sidebar layout (index view): 280px sidebar + fluid content area

```css
.container { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
.content-column { max-width: 720px; }
```

---

## 11. Tone & Voice

- **Data first.** Lead with the number, follow with context. "74 — High exposure."
- **No hyperbole.** Avoid "revolutionary", "disruptive", "groundbreaking".
- **Precise.** "Software Engineers score 74 on the AI Exposure Index™" — not "Software Engineers might be affected."
- **Cite methodology.** Every score has a source. Transparency builds authority.
- **Calm authority.** The platform informs, it doesn't alarm.

---

## 12. Do's and Don'ts

| Do | Don't |
|---|---|
| Use DM Serif Display for headlines | Use DM Serif for body text |
| Use JetBrains Mono for all numbers/scores | Use a sans for score numbers |
| Use Cobalt for interactive elements | Use Cobalt as a page background |
| Use 0–4px border radius | Use pill-shaped or heavily rounded buttons |
| Use border separators for elevation | Use heavy drop shadows |
| Keep score colors semantic (green/amber/red/purple) | Use cobalt for scores |
| Left-align data tables | Center-align table data |
| Animate score counters on enter | Add entrance animations to text/images |

---

## 13. File Reference

| File | Purpose |
|---|---|
| `PRECURSOR-BRAND.md` | This document — master spec for Claude Code |
| `precursor-tokens.css` | CSS custom properties (paste into :root) |
| `precursor-tailwind.config.js` | Tailwind theme extension |
| `precursor-logo-mark.svg` | Cobalt I-beam mark |
| `precursor-logo-white.svg` | White I-beam mark (dark/cobalt bg) |
| `precursor-logo-ink.svg` | Black I-beam mark (print/mono) |
| `precursor-wordmark.svg` | Horizontal lockup |
| `precursor-reference.html` | Visual component reference (open in browser) |

---

*Precursor · AI Exposure Index™ · Brand System v1.0*
