# Precursor

> The **AI Exposure Index™** — a structured 0–100 measure of how exposed every profession is to artificial intelligence.

**Company:** Precursor  ·  **Product:** AI Exposure Index™  ·  **Domain:** [precursorindex.com](https://precursorindex.com)

---

## What this is

Precursor is a gated research platform where professionals sign in, see their profession's AI Exposure Score, and track how it changes weekly. Scores are generated from a structured capability model (O*NET-sourced) mapped against a curated library of AI tools, with human editorial review.

This repository is the Next.js web application. iOS follows.

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **Styling:** Tailwind CSS v4 with Precursor design tokens (see `src/app/globals.css`)
- **Auth + DB:** Supabase (Postgres + Auth + RLS) — *not yet wired*
- **AI:** Anthropic SDK (resume parsing, score drafting) — *not yet wired*
- **Email:** Resend — *not yet wired*
- **Hosting:** Vercel — *not yet wired*

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

```
src/
├── app/
│   ├── layout.tsx          # root: fonts, metadata
│   ├── page.tsx            # public landing
│   ├── globals.css         # Tailwind v4 + Precursor tokens
│   ├── sign-in/            # auth entry (placeholder)
│   ├── methodology/
│   ├── privacy/            # placeholder
│   └── terms/              # placeholder
├── components/
│   ├── brand/Logo.tsx      # cursor mark + wordmark
│   ├── layout/Nav.tsx, Footer.tsx
│   └── ui/Button.tsx
└── lib/
    └── previewData.ts      # teaser data for locked landing preview
docs/                       # brand spec, plan, reference HTML
public/                     # logo SVGs
```

## Brand

See [`docs/PRECURSOR-BRAND.md`](./docs/PRECURSOR-BRAND.md) for the full brand system. All colors, typography, and component patterns are tokenized in `src/app/globals.css` via Tailwind v4's `@theme` directive.

Logo assets are in `public/`:
- `precursor-logo-mark.svg` — cobalt cursor mark
- `precursor-logo-white.svg` — white (for dark backgrounds)
- `precursor-logo-ink.svg` — black (print, monochrome)
- `precursor-wordmark.svg` — horizontal lockup

## Build plan

See [`docs/PLAN.md`](./docs/PLAN.md) for the full MVP roadmap. Current status: **Phase 1 — Foundation** (public landing page).

---

*© Precursor · AI Exposure Index™*
