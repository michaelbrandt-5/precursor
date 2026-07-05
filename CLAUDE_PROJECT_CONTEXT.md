# Precursor — Claude Project Context

> **Handoff document.** Written for a Claude Code instance opening this repository for the first time. Everything a new session needs to be immediately useful — product, architecture, decisions, gaps, and next moves.
>
> **Snapshot date:** 2026-07-03 · **Branch:** `main` @ `0d2503c` · **Last commit:** ~6 weeks ago (2026-05-25)

---

## Project Overview

### What this is

**Precursor** ships the **AI Exposure Index™** — a gated web app that scores 20–30 white-collar professions on how exposed they are to artificial intelligence, then gives each authenticated user a **personalized score** that diverges from the profession's baseline by seniority, execution/strategic split, industry, and AI-tool familiarity.

- **Company:** Precursor
- **Product:** AI Exposure Index™ (trademarked term — always render with the ™)
- **Domain:** [precursorindex.com](https://precursorindex.com)
- **Tagline:** *Precision over prediction.*
- **Voice:** editorial-authority, not SaaS-marketing. Closer to *The Economist* than to a typical dashboard product.

### Goals

- **v1 (this repo):** web-first MVP that a real user can sign up for, complete onboarding on, and receive a weekly-updated personal score. Fully gated except for a public marketing landing with 3–5 blurred profession previews.
- **v2:** iOS app. Explicitly deferred until web is dialed in — schema and OAuth boundaries are already positioned to support it.

### Current status

- **Phases 1–3 complete**, dashboard is unusually deep.
- **Phase 4 partial**: two Vercel Crons live (keepalive + weekly score recompute), but Resend, PostHog, admin UI, account export/delete, favorites, and compare page are **not shipped**.
- Repo has been quiet for ~6 weeks; the last commit shipped the score-history sparkline. Natural pause before pushing on launch-blockers.

### Important business context

- **Founder:** Michael Brandt ([michaelbrandt@gmail.com](mailto:michaelbrandt@gmail.com))
- **Only other contributor:** co-founder Andrew Pham ([apham10@gmail.com](mailto:apham10@gmail.com)) — full admin
- **Founder admin is DB-enforced.** The `handle_new_user()` trigger auto-promotes both emails to `role = 'admin'` on first sign-in (`supabase/migrations/20260419000001_initial_schema.sql`).
- **Compliance-first launch:** account deletion + data export are in v1 scope (App Store + GDPR readiness). Do **not** defer them as "polish."
- **Trademark discipline:** "AI Exposure Index™" and "AI Exposure Score™" always render with the ™.
- **MVP tradeoffs are OK.** This is a two-person team; propose the smaller, editable change unless a bigger one is clearly justified.

### Important technical context

- **Stack:** Next.js 16.2.4 (App Router) · React 19.2.4 · TypeScript · Tailwind CSS **v4** (CSS-first `@theme`) · Supabase (Postgres + Auth + RLS) · Anthropic SDK (Claude Opus 4.7) · Vercel (host + Cron).
- **Middleware file is `src/proxy.ts`, not `src/middleware.ts`.** This is a Next.js 16 convention shift — don't "fix" it.
- **Not the Next.js in your training data.** `AGENTS.md` at the repo root explicitly says: read `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
- **Every server-side DB call goes through the SSR wrapper** (`src/lib/supabase/server.ts`) so user session cookies flow through automatically. Only cron routes use direct service-role clients.
- **No test suite.** The scoring formula (`src/lib/scoring/index.ts`) says "reviewable and unit-tested" in prose but has no tests.

---

## Architecture

### Route grouping strategy

The App Router is partitioned into four zones, each with a different auth contract:

| Zone | Path | Auth contract |
|---|---|---|
| **Public marketing** | `src/app/page.tsx`, `sign-in/`, `methodology/`, `privacy/`, `terms/` | No auth required; no DB reads |
| **`(app)` gated zone** (route group, no URL segment) | `src/app/(app)/{dashboard,index,profession/[slug],settings,onboarding}` | `layout.tsx` calls `getUser()` + redirects to `/sign-in` if missing. Defense-in-depth on top of middleware. Wraps children in `<AppNav user={user} />` |
| **Auth callback** | `src/app/auth/callback/route.ts` | OAuth code-exchange Route Handler. Sits outside `(app)` on purpose — user hitting this URL doesn't yet have a session |
| **Cron API** | `src/app/api/cron/{keepalive,weekly-scores}/route.ts` | `Authorization: Bearer ${CRON_SECRET}` (auto-attached by Vercel). Uses service-role Supabase client |

### Auth flow (Google OAuth via Supabase)

There is **no NextAuth**. Everything runs through Supabase Auth cookies via `@supabase/ssr`.

1. `sign-in/page.tsx` renders `<form action={signInWithGoogle}>` (server action in `src/lib/actions/auth.ts`).
2. Server action calls `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "${origin}/auth/callback?next=/dashboard", queryParams: { access_type: "offline", prompt: "consent" } } })`, then `redirect(data.url)` to Google.
3. Google redirects to `/auth/callback?code=…&next=/dashboard`.
4. Callback route calls `supabase.auth.exchangeCodeForSession(code)`, which writes session cookies via the `setAll` callback in `src/lib/supabase/server.ts`. Redirects to `next` on success, `/sign-in?error=auth_callback_failed` on failure.
5. **On every subsequent request, `src/proxy.ts` → `updateSession()` runs** — it refreshes the Supabase session, gates routes, and rewrites cookies.

**OAuth redirect URLs must be on Supabase's allowlist**, not the Google Cloud Console. Google Cloud Console only knows about Supabase's `/auth/v1/callback` — Supabase proxies the flow. Site URL is `https://precursorindex.com`; the Supabase redirect allowlist also includes `precursor-vert.vercel.app` and `localhost`.

### Middleware gating (`src/proxy.ts` → `src/lib/supabase/middleware.ts`)

Three lists at the top of `middleware.ts` drive gating:

- **`GATED_PREFIXES`** — `/dashboard`, `/index`, `/profession`, `/compare`, `/settings`, `/admin`, `/onboarding`. Need a user.
- **`AUTH_ONLY_PATHS`** — `/sign-in`. Authed users get bounced to `/dashboard`.
- **`PRE_ONBOARDING_ALLOWED`** — `/onboarding`, `/auth/callback`, `/settings`. Reachable pre-onboarding so users aren't trapped mid-flow.

Rules:
- Unauthed + gated → `/sign-in?next={pathname}`
- Authed + gated + `onboarded_at IS NULL` + not in pre-onboarding-allowed → `/onboarding`
- Authed + `/sign-in` → `/dashboard`

The **"Do not place any code between createServerClient and getUser()"** comment in `middleware.ts` is the standard Supabase SSR requirement — cookies must be re-hydrated before any other logic.

### Data flow: server components + server actions

Every `page.tsx` under `(app)/` is an **async server component** that awaits a data loader from `src/lib/data/`:

| Page | Loader | Notes |
|---|---|---|
| `dashboard/page.tsx` | `getDashboardData()` in `src/lib/data/user.ts` | Composite: user, `user_profile`, primary profession, `user_scores` history (asc), `profession_capabilities` joined to `capabilities`, adjacent lower-exposure professions, relevant `ai_tools` |
| `index/page.tsx` | `listPublishedProfessions()` | All published, sorted by baseline desc |
| `profession/[slug]/page.tsx` | `getProfessionBySlug(slug)` | One profession + its capability rows |
| `settings/page.tsx` | `getDashboardData()` | Same composite loader, reused |
| `onboarding/page.tsx` | inline read of `users.onboarded_at` + `listPublishedProfessions()` | Redirects to `/dashboard` if already onboarded |

Mutations live in `src/lib/actions/`:
- `auth.ts` — `signInWithGoogle`, `signOut`
- `onboarding.ts` — `parseResumeAction`, `parseResumeFileAction`, `completeOnboarding`, `restartOnboarding`

Server actions attached to `<form action={…}>` return `void` or throw. Server actions awaited by client components return a **discriminated union** `{ ok: true, … } | { ok: false, error: string }`.

There are exactly **three client components**:
1. `src/app/(app)/onboarding/OnboardingFlow.tsx` — the multi-region onboarding form.
2. `src/components/score/ScoreCounterfactual.tsx` — what-if sliders that re-run `computePersonalScore()` on state change.
3. `src/components/ui/Button.tsx` — polymorphic (renders `<button>` or `<Link>`); not marked `"use client"` because it works in both contexts.

### File structure

```
src/
├── app/
│   ├── layout.tsx                       # fonts, metadata (no nav/footer)
│   ├── page.tsx                         # public landing
│   ├── globals.css                      # Tailwind v4 @theme — TOKEN SOURCE OF TRUTH
│   ├── (app)/                           # authed route group
│   │   ├── layout.tsx                   # getUser() guard, renders AppNav
│   │   ├── dashboard/page.tsx
│   │   ├── index/page.tsx               # the AI Exposure Index table
│   │   ├── profession/[slug]/page.tsx
│   │   ├── onboarding/{page,OnboardingFlow}.tsx
│   │   └── settings/page.tsx
│   ├── sign-in/, methodology/, privacy/, terms/  # public pages
│   ├── auth/callback/route.ts           # OAuth landing
│   └── api/cron/{keepalive,weekly-scores}/route.ts
├── components/
│   ├── brand/Logo.tsx                   # inline-SVG mark + wordmark, three variants
│   ├── layout/{Nav,AppNav,Footer}.tsx
│   ├── score/                           # 7 dashboard viz components
│   │   ├── ScoreNumber.tsx              # ScoreNumber, ScoreBadge, ScoreBar, ScoreBandLabel
│   │   ├── ScoreScale.tsx               # editorial number-line
│   │   ├── ScoreHistory.tsx             # hand-rolled SVG sparkline
│   │   ├── ScoreCounterfactual.tsx      # CLIENT — what-if sliders
│   │   ├── CapabilityHeatMap.tsx        # exposed vs essential split
│   │   ├── AdjacentProfessions.tsx      # lateral moves
│   │   └── AiToolsToLearn.tsx           # tools ranked by capability overlap
│   └── ui/Button.tsx                    # polymorphic
├── lib/
│   ├── actions/{auth,onboarding}.ts     # "use server"
│   ├── anthropic/{client,parseResume}.ts
│   ├── data/{adjacencies,professions,user}.ts
│   ├── scoring/index.ts                 # computePersonalScore (SHARED by dashboard, cron, counterfactual)
│   ├── supabase/{client,server,middleware,types}.ts
│   └── previewData.ts                   # hard-coded teaser data for landing
└── proxy.ts                             # middleware (Next.js 16 naming)
supabase/
├── migrations/
│   ├── 20260419000001_initial_schema.sql          # tables, RLS, is_admin(), founder-admin trigger
│   └── 20260420000001_user_scores_insert_policy.sql
└── seed.sql                             # 12 capabilities, 8 AI tools, 25 professions
docs/
├── PLAN.md                              # SCOPE TRUTH — check before proposing features
├── PRECURSOR-BRAND.md                   # master brand spec (voice, rules, do/don't)
├── precursor-tokens.css                 # reference-only
├── precursor-tailwind.config.js         # reference-only (v3 artifact)
├── precursor-reference.html             # visual reference deck
└── Precursor-Brand-Identity.pptx
public/
├── precursor-logo-mark.svg              # cobalt I-beam mark
├── precursor-logo-white.svg             # for dark backgrounds
├── precursor-logo-ink.svg               # for print/mono
├── precursor-wordmark.svg               # horizontal lockup
└── precursor-logo-120.png               # 120px raster (untracked at snapshot time)
```

### Data model (Supabase / Postgres)

Nine tables. Full schema in `supabase/migrations/20260419000001_initial_schema.sql`.

- **Identity:** `public.users` (mirror of `auth.users`, plus `role`, `primary_profession_id`, `onboarded_at`), `user_profile` (1:1, `seniority`, `execution_time_pct`, `industry_vertical`, `skill_inputs jsonb`).
- **Content:** `professions` (`slug`, `title`, `sector`, `category`, `baseline_score`, `body_md`, `published`), `capabilities`, `profession_capabilities` (M:N with `weight` + `exposure_score` + `narrative_md`), `ai_tools` (`capabilities_affected text[]`, `first_seen`), `capability_ai_tools` (join — **currently unpopulated**).
- **Per-user state:** `user_scores` (weekly snapshots), `user_favorites` (schema exists, **no UI/writers**), `email_log` (schema exists, **no writers**).

RLS pattern:
- Owner-only for user tables (`auth.uid() = user_id` etc.)
- Authenticated-read-published for content
- Admin-all everywhere, via `is_admin(auth.uid())` — a `SECURITY DEFINER` helper that reads `users.role` while bypassing RLS to avoid recursive policy evaluation
- `email_log` has no policies → service-role only

Score formula (`src/lib/scoring/index.ts`): `clamp(baseline + adjustments, 0, 100)` where `adjustments = seniority_adj + execution_time_adj + skills_adj + industry_adj`. Total adjustments capped at **±15** (the PLAN said ±8 per lever / ±20 total; implementation went with a single ±15 cap). Returns human-readable rationale bullets alongside the number.

### Deployment

- **Host:** Vercel (auto-deploys `main` on push).
- **Repo:** [github.com/michaelbrandt-5/precursor](https://github.com/michaelbrandt-5/precursor)
- **Canonical URL:** [https://precursorindex.com](https://precursorindex.com) (apex; DNS at GoDaddy → A record to Vercel; `www.` → 308 redirect to apex)
- **Backup Vercel URL:** [https://precursor-vert.vercel.app](https://precursor-vert.vercel.app)
- **Vercel Cron** (`vercel.json`):
  - `/api/cron/keepalive` — daily 13:00 UTC. Runs `COUNT` on `professions` to prevent Supabase free-tier auto-pause after 7 days of DB inactivity.
  - `/api/cron/weekly-scores` — Mondays 13:00 UTC. Recomputes every onboarded user's score and inserts a fresh `user_scores` row **even if unchanged** — flat sparkline segments are information.
- **Both crons authenticate via** `Authorization: Bearer ${CRON_SECRET}` — set the env var and Vercel Cron auto-attaches the header. This means an admin can `curl` the endpoint locally with the same header for a manual recompute.

### Build & config

- `next.config.ts` raises `experimental.serverActions.bodySizeLimit` to `5mb` (default 1 MB is too small for LinkedIn PDF exports).
- `tsconfig.json` uses path alias `"@/*": ["./src/*"]`. Strict mode on. Includes `.next/dev/types/**/*.ts` (Next 16 dev types).
- `eslint.config.mjs` uses flat config with `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. No custom rules.
- `postcss.config.mjs` is a one-liner: `{ plugins: { "@tailwindcss/postcss": {} } }`. Tailwind v4 handles autoprefixer.

### Local development

```bash
npm install
cp .env.local.example .env.local        # then fill in real values
npm run dev                              # http://localhost:3000
```

`.claude/launch.json` defines a `next-dev` server config used by the Claude Preview MCP tool.

### Environment variables

All defined in `.env.local.example`, grouped by phase:

| Var | Purpose | Phase |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Metadata + OAuth redirect origin | 0 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | 1 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon key (browser + SSR wrapper) | 1 |
| `SUPABASE_SECRET_KEY` | Service role (crons, server-only) | 1 |
| `ANTHROPIC_API_KEY` | Claude — resume parsing, score drafting | 3 |
| `RESEND_API_KEY` | Transactional + weekly digest | 4 (not yet wired) |
| `RESEND_FROM_EMAIL` | Default `notifications@precursorindex.com` | 4 |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics | 4 (not yet wired) |
| `NEXT_PUBLIC_POSTHOG_HOST` | Default `https://us.i.posthog.com` | 4 |
| `CRON_SECRET` | Bearer for `/api/cron/*` — generate with `openssl rand -hex 32` | 3 |

`.env.local` is gitignored; **all runtime secrets live there**. `.claude/settings.local.json` is also gitignored and holds Michael's personal Bash/MCP allowlist.

---

## Decisions We've Made

### Product & scope decisions (from `docs/PLAN.md`)

The "Confirmed decisions" table at `docs/PLAN.md:9-30` is the scope truth.

**Web first, iOS later** — Chose Next.js as the whole product surface for v1. Alternative was a mobile-first play. Tradeoff: gives up viral install mechanics; gains iteration speed and a shareable URL for a research product.

**Fully gated except public landing** — No public browsing of profession detail. Alternative was public read-only Index. Tradeoff: cuts off SEO / demand-capture; gains a real sign-up funnel and a defensible "your score" hook.

**Google OAuth only for v1** — Apple Sign In explicitly deferred until iOS + Apple Developer account. Password auth was never considered.

**Individual accounts only** — `users.organization_id` is nullable placeholder. Reserved for future team accounts.

**Founder admin auto-grant in DB** — `handle_new_user()` trigger hardcodes `michaelbrandt@gmail.com` and `apham10@gmail.com` → `role = 'admin'`. Alternative was env-var-driven or admin table. Tradeoff: coupled to production emails; gains zero-config admin bootstrap.

**PDF upload as primary onboarding input** — LinkedIn "More → Save to PDF" export or resume PDF, parsed by Claude via document content block. Paste-text is now the collapsed fallback (was co-equal). **Direct LinkedIn URL ingest explicitly rejected** — official API doesn't expose experience/skills, scraping violates ToS, third-party resellers are expensive and ToS-gray. Revisit only if LinkedIn opens a compliant API.

**One primary profession per user, changeable** — Alternative was multi-profession or profession-history. Simpler mental model; you can compare against any profession via the (planned) `/compare` page.

**Individual/personal scoring diverges from baseline by ±15 max** — Keeps personal scores near the cited baseline so the profession's number remains anchoring context. PLAN said ±8/lever, ±20 total; ship went to a single ±15 cap.

**Account deletion + data export are v1 scope, not v2** — Non-negotiable for App Store + GDPR readiness at public launch.

**Placeholder Privacy/Terms until real copy exists** — Pages exist, copy says "Placeholder." Ship-blocker at public launch, deliberate pre-launch tradeoff.

**Editorial adjacencies, not algorithmic** — `src/lib/data/adjacencies.ts` is a hand-curated slug→slugs map. Tradeoff: doesn't scale past ~30 professions, keeps recommendations coherent for launch.

**Every capability mapping cites specific AI tools** — Trust posture. No score without a reason.

### Architecture decisions

**Supabase as single vendor for Auth + DB + RLS + Storage** — Alternative was Auth0 + Postgres + hand-rolled RLS. Tradeoff: vendor lock-in on auth; gains a coherent RLS model and one dashboard.

**Middleware at `src/proxy.ts`** — Next.js 16 convention. Do NOT rename to `middleware.ts` — the framework picks up either, and the project chose the new name deliberately.

**Server components as page components, server actions for mutation** — Only three client components in the whole app. REST-style API routes exist only for cron. This deviates from PLAN.md §7 which lists REST endpoints for onboarding/favorites/export — the implementation is better, but the mismatch will be jarring to whoever builds the iOS app.

**Score formula in `src/lib/scoring/index.ts` is shared between server and client** — Cron, onboarding, dashboard rendering, and the counterfactual sliders all call the same `computePersonalScore()`. Tradeoff: any change ripples everywhere; gains that "what if" always matches "what is."

**`is_admin()` is `SECURITY DEFINER` with fixed `search_path`** — Reads `users.role` bypassing RLS so admin-check policies don't recurse. Load-bearing.

**`onboarded_at` is the commit marker** — Written LAST during `completeOnboarding()`, after `user_profile.upsert` and `user_scores.insert`. If any earlier write fails, middleware redirects the user back to `/onboarding` on retry. This is the whole reason migration 2 exists — to allow the user to insert their own `user_scores` row before the flag is flipped.

**Cron uses service_role and re-reads baseline each run** — Admin edits to `professions.baseline_score` propagate to every affected user's sparkline as a visible step. Deliberate: chart tells the whole story of taxonomy updates, not just personalization changes.

**Snapshots insert even when unchanged** — Flat sparkline segments are information ("we checked, no drift"). Alternative was conditional insert; rejected because absence-of-data is ambiguous.

**Daily keepalive against `professions` COUNT** — Supabase free tier pauses after 7 days of inactivity. Cheap heartbeat + doubles as health check.

**Serve resume parsing through structured outputs + prompt caching** — `parseResume.ts` uses Claude Opus 4.7 with `output_config.format: { type: "json_schema", schema: JSON_SCHEMA }`. System prompt wrapped with `cache_control: { type: "ephemeral" }`. Model choice will switch to Haiku 4.5 for high-volume onboarding later (noted in `client.ts` comment).

**`PROFESSION_SLUGS` is the single source of truth for the taxonomy list** — Duplicated in three places (TS union type, JSON schema enum, prompt system message) with an explicit warning comment. When adding professions, update `parseResume.ts` + `seed.sql` + `adjacencies.ts` in the same PR.

### Design/brand decisions

**Editorial over dashboard aesthetic** — Print/magazine vocabulary, not SaaS-dashboard vocabulary. Concretely:
- DM Serif Display for hero headlines
- JetBrains Mono for every number (scores, percentages, table cells) — precision is non-negotiable
- Uppercase Inter 600 eyebrows (12px, 0.08em tracking) as the primary editorial cue
- Hairline `#E8E8E8` borders instead of shadows (`--shadow-float` reserved for floating overlays only)
- Warm parchment `#F7F6F4` page background (never pure white)
- **Rectangular geometry** — max 4px radius. "This is a data product, not a consumer app."
- No gauges, speedometers, radial charts. Progress = 4px horizontal bar. Score history = hand-rolled SVG sparkline.

When proposing viz for scores/deltas/history/comparisons, an **editorial variant is the default recommendation** and gauges/speedometers come with an explicit "clashes with brand" caveat. **Always show breakpoints and scale context**, not just the raw number.

**Cobalt is for interaction; score colors are for measurement — they never overlap** — Cobalt `#1D4ED8` is CTAs, links, focus rings, active states. Score scale is green `#16A34A` (0–30 Low), amber `#CA8A04` (31–60 Moderate), red `#DC2626` (61–84 High), purple `#7C3AED` (85–100 Critical). Score color applies **only** to the number and its indicator dot; backgrounds stay neutral.

**Tailwind v4 with CSS `@theme`, not v3 with `tailwind.config.js`** — `src/app/globals.css` is the token source of truth. `docs/precursor-tailwind.config.js` is a v3-style artifact retained for external reference only.

---

## Current Work

### What's DONE

- **Phase 1 — Foundation:** Next.js 16 + Tailwind v4 scaffold with Precursor brand tokens; public landing with locked previews; methodology/privacy/terms shells; Supabase Google OAuth wired; middleware guards.
- **Phase 2 — Content layer:** Full schema + RLS + `is_admin()` + founder-admin trigger. `/index` sortable table and `/profession/[slug]` detail pages.
- **Phase 3 — User experience:** Onboarding with PDF upload + text-paste fallback + Claude-parsed autofill. Personal score formula. Rich dashboard with all seven score components (Scale, Number, HeatMap, Counterfactual, AdjacentProfessions, AiToolsToLearn, History). Settings with "Redo my profile."
- **Phase 4 partial:** Two Vercel Crons live (`keepalive` daily, `weekly-scores` Mondays), both bearer-auth via `CRON_SECRET`.

### What's PARTIAL (page/table exists but stubbed or unused)

| Item | State | Where |
|---|---|---|
| `/privacy` and `/terms` | Copy literally says "Placeholder" | `src/app/{privacy,terms}/page.tsx` |
| `/settings` export/delete | UI says "Data export and account deletion land in the next slice." | `src/app/(app)/settings/page.tsx:75` |
| `body_md` rendering on `/profession/[slug]` | Ad-hoc, no markdown renderer | `src/app/(app)/profession/[slug]/page.tsx:147` — "swap for a real MD renderer later" |
| `user_favorites` table | Schema + RLS live, zero UI / server actions / API | `supabase/migrations/…/initial_schema.sql:126` |
| `email_log` table | Schema live, no writers | Same migration |
| `capability_ai_tools` join | Schema exists, seed doesn't populate it | `supabase/seed.sql` |
| **20 of 25 professions lack capability mappings** | Only `software-engineer`, `financial-analyst`, `marketer`, `lawyer`, `designer` have `profession_capabilities` rows. The other 20 render dashboard cleanly but with an empty heat map / no tool citations | `supabase/seed.sql` |
| `README.md` | Actively out of date — says "Current status: Phase 1" and marks Supabase/Anthropic/Resend as "not yet wired" when they are | `README.md:19-22, 68` |

### What's MISSING vs `docs/PLAN.md`

**Pages not built:**
- `/compare?a=x&b=y` — capability-by-capability comparison. No route, no nav entry. Middleware already includes `/compare` in `GATED_PREFIXES`.
- `/admin` and all sub-pages (`/admin/professions`, `/admin/capabilities`, `/admin/ai-tools`). No `(admin)` route group. Content editing today happens by rewriting `supabase/seed.sql` and re-running it in the Supabase SQL Editor.

**API surface not built:**
- Favorites API (`user_favorites` writes/reads)
- `GET /api/user/export` — GDPR data export
- `POST /api/user/delete` — hard-delete cascade
- `POST /api/cron/weekly-digest` — Resend digest

**Integrations not wired:**
- **Resend** — no dependency in `package.json`; no imports; `email_log` writers absent. No welcome email, no weekly digest, no score-change notification.
- **PostHog** — no dependency; no client init.
- **Vercel Analytics** — no `@vercel/analytics` package.

### Recent commit themes (all 13 commits)

- **Foundation burst (2026-04-18 → 2026-04-19):** scaffold, auth wiring, schema + seed, `/index` + `/profession/[slug]`.
- **Phase 3 push (2026-04-19 → 2026-04-20):** onboarding + scoring + dashboard v2 + RLS-fix migration + PDF upload / editorial exposure scale / redo-profile.
- **Content expansion (2026-04-25):** taxonomy 5 → 25 professions.
- **Dashboard depth burst (2026-04-25):** counterfactual sliders → capability heat map → adjacent professions → AI tools to learn (four commits in rapid succession).
- **Ops (2026-05-18 → 2026-05-25):** daily keepalive cron; weekly-scores cron + sparkline UI.
- **~6-week gap since.** Repo is stable at `main @ 0d2503c`.

### Uncommitted / untracked work

- Only untracked file: `public/precursor-logo-120.png` (620 B, dated 2026-04-25). Looks like a favicon-scale raster. **Ask before adding or removing** — it may be intentional-but-forgotten.
- Zero uncommitted edits.

### Known bugs / gaps evident from code

- **Weekly recompute has no observability.** Returns a JSON count but no logging table, no alerting, no Sentry. Silent 500s would flatline every user's sparkline invisibly.
- **`parseResumeAction` has no rate limit.** Public sign-up + Claude API costs = small runaway-cost risk. Low volume today.
- **`user_scores.profession_id` has no `ON DELETE`.** Hard-deleting a profession will fail if any user has history against it. Retire professions via `published = false`.
- **Token name drift:** `docs/precursor-tokens.css` calls the border color `--color-border`; the live theme calls it `--color-hairline` (both `#E8E8E8`). Code wins — anything new uses `hairline`.
- **Named type scale is spec-only.** `docs` describe `text-display-xl`, `text-eyebrow`, `text-score-lg` etc.; the live `@theme` doesn't generate them. Code uses `text-[44px]` arbitrary values instead. Not a bug, but the docs and code disagree.

### Technical debt

- No test suite (no vitest/jest/playwright; no `*.test.ts` anywhere). The scoring formula is a natural first target.
- REST-style API surface described in PLAN.md doesn't exist; server actions replaced it. Fine, but iOS will need REST endpoints.
- Adjacencies hardcoded in `src/lib/data/adjacencies.ts` — the file's own comment flags this ("live alongside the parseResume taxonomy"). Will need to move to DB when taxonomy grows past ~30.
- README is ~3 months out of date. Confusing to new contributors.
- `user_favorites` and `email_log` schema-vs-usage drift.

---

## Code Patterns

### Naming

- **Directories** kebab-case; **components** PascalCase; **hooks** and **utils** camelCase.
- **Route group parens** (`(app)`) for auth-scoped layout inheritance without a URL segment.
- **Import alias:** `@/*` → `src/*` everywhere.
- **Client components co-located** with their page (`OnboardingFlow.tsx` sits next to `onboarding/page.tsx`) using PascalCase.
- **Server-action files** are one-per-domain in `src/lib/actions/` (`auth.ts`, `onboarding.ts`). Every file is `"use server"` at module level.
- **Data-loader files** in `src/lib/data/` — one per broad concern (`user.ts`, `professions.ts`, `adjacencies.ts`).
- The `Nav.tsx` file exports `PublicNav` — the naming asymmetry with `AppNav.tsx` is a minor cleanup candidate.

### Organization

- **Three Supabase client factories, each for a specific runtime** — `server.ts` (RSC/actions/route handlers), `client.ts` (browser components; currently unused), `middleware.ts` (only used by `proxy.ts`). Cron routes bypass all three and use `@supabase/supabase-js` directly with `SUPABASE_SECRET_KEY` for service-role access.
- **Score components live flat in `src/components/score/`** — no sub-folders. Six server, one client. Any new score viz goes here.
- **Data-shape types hand-maintained** in `src/lib/supabase/types.ts` (comment plans a switch to `supabase gen types typescript`). Also exports the derived `ScoreBand` type and `scoreBand()` / `bandColor()` / `bandLabel()` helpers used across the score components.

### Preferred approaches

- **Discriminated unions for status/result.** `AutofillStatus` in `OnboardingFlow.tsx` (`{ kind: "idle" } | { kind: "pending", source } | { kind: "error", message } | { kind: "filled", … }`). Server-action results return `{ ok: true, … } | { ok: false, error: string }`. All conditionals narrow on `.kind` / `.ok`.
- **Polymorphic components via discriminated props.** `<Button>` types are `ButtonAsButton | ButtonAsLink`; passing `href` flips it to `<Link>`. `<Logo>` uses `href={null}` to opt out of the link wrap. Use the same pattern for future primitives (Card, Chip) instead of adding `cva` / `tailwind-variants`.
- **Typed variant + size lookup tables.** `SIZES: Record<Size, string> = { … }` — small enums, class-string tables, no runtime deps.
- **`useTransition` for form submits.** Wrap the server action call; `isPending` becomes the submit-button state ("Computing your score…").
- **`revalidatePath()` after mutations.** After `completeOnboarding` and `restartOnboarding` — `revalidatePath('/dashboard')` (and `/settings` where relevant).
- **Explicit pixel Tailwind arbitrary values** (`text-[14px]`, `leading-[1.05]`, `tracking-[0.14em]`) rather than the theme scale. Signals *editorial print aesthetic*, matches the brand system.
- **Load data server-side; render on server.** Client components exist only when interaction requires them (three total).
- **JSDoc-style leading comments explain *why*, not *what*.** See `lib/anthropic/client.ts`, `lib/data/user.ts`, `lib/scoring/index.ts`, `api/cron/weekly-scores/route.ts`. Inline comments call out invariants (`"IMPORTANT: Do not place any code between createServerClient and getUser()"`, `"flip onboarded_at LAST"`).

### Things to avoid

- **Don't rename `src/proxy.ts` to `src/middleware.ts`.** Next.js 16 convention.
- **Don't put code between `createServerClient()` and `supabase.auth.getUser()` in the middleware.** Standard Supabase SSR requirement — cookies must be re-hydrated first.
- **Don't drop `user_scores` insert policy.** Migration 2 exists specifically so users can insert their own initial snapshot during onboarding.
- **Don't add gauges, speedometers, radial charts, or heavy dashboard aesthetics.** Editorial variant is the default. Present them only with an explicit "clashes with brand" caveat.
- **Don't use pill-shaped or heavily-rounded buttons.** Max 4px radius.
- **Don't use cobalt for score display.** Cobalt = interaction; score colors = measurement. They don't overlap.
- **Don't mix DM Serif Display and Inter in the same sentence.**
- **Don't hardcode taxonomy in one place.** `PROFESSION_SLUGS` in `parseResume.ts` + `seed.sql` + `adjacencies.ts` must stay in sync.
- **Don't `git add -A`** — accidentally sweeps `.env.local` if it's ever missed by `.gitignore`. Add specific files.
- **Don't skip pre-commit hooks or `--no-verify`.** No pre-commit hooks exist here today, but the general rule applies.
- **Don't try to Read Next.js docs from memory.** `AGENTS.md` says: read `node_modules/next/dist/docs/` — Next 16 has breaking changes vs. the version in your training data.

---

## Important Files

Ranked by how load-bearing they are.

| File | Why it matters |
|---|---|
| [`docs/PLAN.md`](docs/PLAN.md) | **Scope truth.** Check before proposing features or rearranging phases. Confirmed-decisions table at lines 9–30. |
| [`docs/PRECURSOR-BRAND.md`](docs/PRECURSOR-BRAND.md) | Master brand spec — voice, color, type, do/don't. Any visual change should cite it. |
| [`src/app/globals.css`](src/app/globals.css) | **Live theme source of truth.** All brand tokens, base layer overrides (default border color = hairline, focus ring = cobalt), and the `.eyebrow` utility class. |
| [`src/proxy.ts`](src/proxy.ts) + [`src/lib/supabase/middleware.ts`](src/lib/supabase/middleware.ts) | Every request passes through these. Route gating lives here — `GATED_PREFIXES`, `AUTH_ONLY_PATHS`, `PRE_ONBOARDING_ALLOWED`. |
| [`src/lib/supabase/server.ts`](src/lib/supabase/server.ts) | Every server-side DB call starts here. `setAll` cookie try/catch is deliberate — RSC can't set cookies; middleware refreshes on next request. |
| [`src/lib/scoring/index.ts`](src/lib/scoring/index.ts) | **The score math.** Single source of truth called from onboarding, dashboard, counterfactual sliders, and the weekly cron. Change here ripples everywhere. |
| [`src/lib/data/user.ts`](src/lib/data/user.ts) | Composite `getDashboardData()` — the dashboard's whole payload in one function. Reused by settings. |
| [`src/lib/anthropic/parseResume.ts`](src/lib/anthropic/parseResume.ts) | Claude Opus 4.7 structured-output resume parser. Owns `PROFESSION_SLUGS` — must stay in sync with `seed.sql` and `adjacencies.ts`. |
| [`src/lib/data/adjacencies.ts`](src/lib/data/adjacencies.ts) | Editorial slug→slugs map for "lateral moves." Not algorithmic. |
| [`supabase/migrations/20260419000001_initial_schema.sql`](supabase/migrations/20260419000001_initial_schema.sql) | Schema, RLS, `is_admin()` helper, `handle_new_user()` founder-admin trigger, backfill. |
| [`supabase/migrations/20260420000001_user_scores_insert_policy.sql`](supabase/migrations/20260420000001_user_scores_insert_policy.sql) | The one follow-up policy that lets users insert their first snapshot. |
| [`supabase/seed.sql`](supabase/seed.sql) | 12 capabilities, 8 AI tools, 25 professions (only 5 with capability depth). |
| [`src/app/api/cron/weekly-scores/route.ts`](src/app/api/cron/weekly-scores/route.ts) | The mechanism behind `ScoreHistory`. Re-reads `baseline_score` at run-time so admin edits show up as visible steps. |
| [`src/app/api/cron/keepalive/route.ts`](src/app/api/cron/keepalive/route.ts) | Daily heartbeat against Supabase free tier's 7-day pause. |
| [`src/app/(app)/layout.tsx`](src/app/(app)/layout.tsx) | Auth boundary + `AppNav` shell for the whole gated zone. |
| [`src/app/(app)/onboarding/OnboardingFlow.tsx`](src/app/(app)/onboarding/OnboardingFlow.tsx) | The one big client component. Discriminated-union status pattern, drag-drop PDF, Claude autofill, `useTransition` submit. |
| [`src/lib/actions/onboarding.ts`](src/lib/actions/onboarding.ts) | `completeOnboarding` write order (`user_profile` → `user_scores` → `users.onboarded_at`) is the transactional heart of the app. |
| [`src/components/score/*.tsx`](src/components/score/) | All seven dashboard viz components. Any new score visualization goes here. |
| [`vercel.json`](vercel.json) | Cron schedules. |
| [`next.config.ts`](next.config.ts) | Only override: `serverActions.bodySizeLimit: "5mb"` for PDF uploads. |
| [`.env.local.example`](.env.local.example) | Enumerates every expected env var with a phase comment. |
| [`AGENTS.md`](AGENTS.md) | "This is NOT the Next.js you know" — read `node_modules/next/dist/docs/` before writing framework code. |
| [`README.md`](README.md) | **Out of date** — treat with skepticism until refreshed. |

---

## Claude Knowledge

Things learned working on this project that aren't obvious from the source.

### Historical context

- **The project started 2026-04-18** with `docs/PLAN.md v1`. Every substantive commit is co-authored `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` — this is an AI-augmented two-person build, not a solo human effort.
- **The dashboard-depth burst (2026-04-25) was four commits in one day**: counterfactual → heat map → adjacencies → tools-to-learn. Michael was iterating fast on "make the dashboard actually useful."
- **The taxonomy expanded 5 → 25 professions before the depth pass finished.** Trade-off was surface breadth for demo-ability at the cost of per-profession capability mapping depth. Only 5 professions have `profession_capabilities` rows.
- **Six-week silence since 2026-05-25.** Natural pause before launch-blockers (privacy/terms, delete/export, admin UI, digest email). Not a project abandonment — Michael is context-switched.

### Failed experiments / rejected alternatives

- **Direct LinkedIn URL ingest** — considered, rejected in `PLAN.md:15` with three specific reasons. Don't propose it.
- **Consumer-app rounded UI** — `PRECURSOR-BRAND.md` explicitly forbids: "This is a data product, not a consumer app."
- **Chart-junk / gauges** — the sparkline is hand-rolled SVG, not Recharts/Chart.js. The exposure scale is a labeled number line, not a bar chart. Don't reach for a chart library.

### Debugging discoveries / hidden invariants

- **`is_admin()` must be `SECURITY DEFINER`** with `SET search_path = public` — without this, the admin-all policies recurse and any query on `professions` for an admin user hangs or errors.
- **`onboarded_at` written LAST** in `completeOnboarding` — if you change the write order, a mid-transaction failure will leave a user permanently locked out of `/onboarding` (middleware sees `onboarded_at` set and redirects to `/dashboard` where the loader returns null and re-redirects).
- **Migration 2 exists because of this ordering** — the user's own client (via SSR wrapper, not service-role) inserts the initial `user_scores` row *before* `onboarded_at` is set, so RLS needs the `user_scores_self_insert` policy.
- **Cron routes re-read `baseline_score` at run-time**, not from the last snapshot — this is why admin baseline edits show up as visible steps in user charts.
- **Snapshots insert every week even when unchanged** — flat line = "we checked, no drift", not "cron broke."
- **Server components' `setAll` cookie writes silently no-op** in `src/lib/supabase/server.ts` (wrapped in try/catch) — RSC can't set cookies. Middleware refreshes on the next request. This is by design.
- **The default border color is overridden globally to hairline** (`globals.css` `@layer base`). That's why component code writes `border-b` without needing `border-hairline`.

### Deployment quirks

- **Supabase free tier pauses after 7 days of DB inactivity** — the whole reason `/api/cron/keepalive` exists. Don't remove it unless the project moves to a paid tier.
- **Vercel Cron auto-attaches `Authorization: Bearer ${CRON_SECRET}`** when the env var is set — no client code needed.
- **OAuth redirect allowlist lives in Supabase**, not Google Cloud Console. Google Cloud only knows about `supabase.co/auth/v1/callback` — Supabase proxies the flow. Adding a new app domain requires updating the Supabase Authentication → URL Configuration allowlist or OAuth silently falls back to Site URL.
- **`www.precursorindex.com` 308-redirects to apex.** DNS at GoDaddy, A record to Vercel.
- **The `.env.local` template is grouped by phase** (`Phase 1 — Supabase`, `Phase 3 — Anthropic`, etc.). Follow the same convention when adding new vars.
- **Local `.claude/settings.local.json` is gitignored** — it holds Michael's personal Bash/MCP allowlist (~35 entries) built up over time. Do not commit it.

### Workflow tips

- **Docs/PLAN.md is the scope truth**, not the README (which lags). Check it before proposing features.
- **Adding a profession** means updating three things: `parseResume.ts` `PROFESSION_SLUGS`, `supabase/seed.sql`, and `src/lib/data/adjacencies.ts` (if it has adjacents). Then re-run `seed.sql` in the Supabase SQL Editor manually — there's no migration tooling for content.
- **To trigger a manual weekly recompute**: `curl -X GET https://precursorindex.com/api/cron/weekly-scores -H "Authorization: Bearer $CRON_SECRET"`.
- **To read the full brand spec live**, open `docs/precursor-reference.html` in a browser.
- **Michael prefers editorial variants as the recommended default** for any score-adjacent viz. Present gauges only with an explicit "clashes with brand" caveat.
- **Always show breakpoints/scale context, not just the value.** The raw number alone doesn't tell the user where they sit.
- **This project has been worked on across many Claude Code chats** — Michael has voiced concern about losing context between sessions. Lean on git history and `docs/PLAN.md` as persistent sources of truth; don't assume prior-chat state carried over.

### Assumptions worth flagging

- The Supabase project ID, Vercel project ID, Google OAuth client ID, and Anthropic API key that were set up during Phase 1 setup are all still valid — verify by running `npm run dev` and completing a sign-in end-to-end.
- The DNS at GoDaddy is unchanged since Phase 1 setup.
- No one has manually edited data in the Supabase dashboard in ways that diverge from `seed.sql` — re-running `seed.sql` would clobber any such edits (all inserts use `on conflict do update`).

### Session context notes

- **Deferred MCP tools:** on this machine's session, several MCP servers require OAuth (atlassian, box, docusign, egnyte, slack). They're irrelevant to this codebase but appear in the tool list. Ignore.
- **Ultracode is on** for this session — the handoff was built by fanning out five parallel research agents.

---

## Common Commands

### Development

```bash
# Install dependencies
npm install

# Copy env template and fill in real values
cp .env.local.example .env.local

# Start dev server on http://localhost:3000
npm run dev

# Build for production
npm run build

# Serve production build locally
npm run start

# Lint (flat config, eslint-config-next)
npm run lint
```

### Working with Supabase

```bash
# Apply the initial schema and follow-up policy migration:
#   1. Open Supabase dashboard → SQL Editor
#   2. Paste supabase/migrations/20260419000001_initial_schema.sql → Run
#   3. Paste supabase/migrations/20260420000001_user_scores_insert_policy.sql → Run
#   4. Paste supabase/seed.sql → Run

# Regenerate CRON_SECRET (paste output into .env.local and Vercel env vars):
openssl rand -hex 32
```

### Cron & operations

```bash
# Manually trigger the weekly score recompute (e.g. after admin baseline edit):
curl -X GET https://precursorindex.com/api/cron/weekly-scores \
  -H "Authorization: Bearer $CRON_SECRET"

# Manually trigger the keepalive (health check):
curl -X GET https://precursorindex.com/api/cron/keepalive \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Git

```bash
git status
git log --oneline -20
git diff HEAD~3 HEAD

# Push to main → auto-deploys via Vercel
git push origin main
```

### Deployment

Deployment is fully automatic on push to `main`. Vercel dashboard is at [vercel.com/michaelbrandts-projects](https://vercel.com/) (Michael's account).

To adjust env vars in prod, use Vercel dashboard → Settings → Environment Variables. Add `CRON_SECRET`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SITE_URL=https://precursorindex.com`.

### Maintenance

```bash
# Update Next.js / React (breaking changes possible in Next 16):
npm outdated
npm update next react react-dom

# Type-check without emitting:
npx tsc --noEmit

# Find TODOs across code:
grep -rn "TODO\|FIXME\|XXX\|HACK" src/ supabase/ docs/
# (Currently returns zero hits — the codebase is unusually TODO-free.)
```

---

## Open Questions

Unresolved decisions worth surfacing next time Michael is in the driver's seat.

- **Admin UI vs. seed-file editing.** Content editing today means rewriting `supabase/seed.sql`. This becomes a scaling problem the moment you want to add professions weekly. Should we build `/admin/professions` next, or is SQL editing acceptable for the two-person team indefinitely?
- **Capability mappings for the other 20 professions.** Heat map, tools-to-learn, and per-capability narrative are hidden on those professions. Do we build the admin UI first and let Michael/Andrew fill mappings via the app, or do we author the SQL manually?
- **`user_favorites` and `email_log` — ship or drop?** Schema exists, no writers. Either wire favorites into the UI or drop the table in a migration so the schema matches usage.
- **REST API surface vs. server actions.** PLAN.md §7 describes REST; implementation is server actions. Fine for web; will need REST for iOS. Decide before the iOS project starts.
- **Rate limiting for `parseResumeAction`.** Unlimited Claude calls on a public sign-up form is a cost risk. Even a naive per-IP throttle would help.
- **Weekly recompute observability.** Silent 500s would flatline every user's sparkline invisibly. Add logging table, or Sentry/PostHog error tracking, or an email-on-failure hook.
- **Score formula ±15 vs. PLAN.md's ±8/lever + ±20 total.** Ship went with a single ±15 cap. Fine, but PLAN.md should be updated or the formula reverted so scope truth stays truthful.
- **Named type scale in Tailwind theme.** The docs describe `text-display-xl`, `text-eyebrow`, etc.; the live theme uses arbitrary values. Add the tokens or drop them from the docs.
- **Dark mode?** `docs/precursor-tokens.css` defines a `[data-theme="dark"]` override block. No app-level dark-mode toggle. Ship or drop.
- **Analytics (Vercel + PostHog).** Env vars exist; SDKs aren't installed. Are they still on the launch path?

---

## Recommended Next Steps

If a fresh Claude Code session opened this project tomorrow, do these in order.

### 1. Verify the working environment (5 minutes)

Before proposing changes, confirm the stack is still alive:

```bash
git status && git log --oneline -5
npm install
cp .env.local.example .env.local     # then fill in real values from the Supabase / Vercel dashboards
npm run dev
```

Complete a Google sign-in end-to-end on `localhost:3000`. If sign-in fails, check the Supabase URL Configuration allowlist includes `http://localhost:3000` and that the OAuth client redirects to Supabase's `/auth/v1/callback` (not the app's).

### 2. Read `docs/PLAN.md` fully

That's the scope truth. `README.md` is out of date; don't rely on it.

### 3. Refresh `README.md`

It's the single most obvious inaccuracy in the repo — says "Current status: Phase 1" when Phases 1–3 are done and Phase 4 is partial. A ~15-minute cleanup, high signal.

### 4. Pick the highest-leverage launch-blocker

Priority order for shipping v1 publicly:

1. **Real Privacy + Terms copy** — the `/privacy` and `/terms` pages literally say "Placeholder." Ship-blocker at public launch. Cheapest to write with legal input.
2. **Account export + delete** — in v1 scope per PLAN.md for App Store + GDPR readiness. Concretely: `GET /api/user/export` returns JSON of the user's rows across `users`, `user_profile`, `user_scores`, `user_favorites`; `POST /api/user/delete` does the ON DELETE CASCADE by removing `auth.users(id)`.
3. **Content depth pass** — write `profession_capabilities` rows for the 20 professions that lack them. Without this, the dashboard heat map + tools-to-learn are empty for 80% of users. Options: bulk SQL authored offline, or build a minimal `/admin/professions/[id]/edit` first.
4. **Weekly digest email (Resend + Phase 4)** — `POST /api/cron/weekly-digest` on Mondays 14:00 UTC (an hour after `weekly-scores`). Verify `notifications@precursorindex.com` in Resend, add `resend` to `package.json`, write a simple React Email or plain HTML template with the user's score + delta + one capability update.

**Recommended first move: refresh README + write real Privacy/Terms copy.** They're the smallest ship-blockers standing between the app as it exists today and public sign-up. Then pick content depth or export/delete depending on Michael's launch calendar.

### 5. When touching taxonomy, remember the tri-file update

`PROFESSION_SLUGS` in `src/lib/anthropic/parseResume.ts`, professions rows in `supabase/seed.sql`, and adjacencies in `src/lib/data/adjacencies.ts`. All three must stay in sync. There's an explicit warning comment in `parseResume.ts` about this.

### 6. When adding a data-viz component, keep the editorial posture

Hairline borders, JetBrains Mono numbers, uppercase Inter 600 eyebrows, warm parchment ground, cobalt only for interaction. Present editorial variants as the default; present gauges/speedometers only with a "clashes with brand" caveat.

---

*Precursor · AI Exposure Index™ · Handoff written 2026-07-03 for the next Claude Code session.*
