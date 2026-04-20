# Precursor · AI Exposure Index™ — MVP Plan

**Company:** Precursor  ·  **Product:** AI Exposure Index™  ·  **Domain:** precursorindex.com

---

## 1. Confirmed decisions

| Area | Decision |
|---|---|
| **Scope** | Web first (Next.js). iOS to follow once web is dialed in. |
| **Access** | Fully gated. Public demo landing only. |
| **Auth** | Google OAuth (v1). Apple Sign In deferred until iOS / Apple Dev account. |
| **Accounts** | Individual only. Michael + Andrew (apham10@gmail.com) as initial admins. |
| **Onboarding** | Primary: PDF upload (resume, or LinkedIn "More → Save to PDF" export) → Claude extracts via document block. Fallback: paste text, collapsed. Questionnaire form always shown for review/edit. **Rejected:** direct LinkedIn URL ingest — official API doesn't expose experience/skills, scraping violates ToS and gets blocked, third-party resellers are expensive and ToS-gray. Revisit only if LinkedIn opens a compliant API. |
| **Profession** | One primary per user. Changeable. |
| **Profession detail** | Full capability breakdown (per-capability 0–100 score, AI tool citations, narrative). |
| **Launch surface** | 20–30 most popular white-collar professions. |
| **Demo** | Landing with 3–5 blurred/locked profession previews; search prompts sign-in. |
| **Personalization** | Personal score diverges from baseline by: years experience, seniority, execution/strategic split, skills, industry. |
| **Features** | Save/favorites (any profession), compare (full capability), history chart, weekly email digest. |
| **Citations** | Every capability mapping references specific AI tools/models. |
| **Admin** | 2 authors, both full admin. Instant publish. |
| **Email** | Resend from `notifications@precursorindex.com`. |
| **Privacy/Terms** | Placeholder pages; real copy later. |
| **Account deletion & export** | In v1 (App Store & GDPR-ready). |
| **Analytics** | Minimal: Vercel Analytics + Posthog free tier. |
| **Data source** | O*NET taxonomy + curated AI capability list + LLM-assisted drafts + human review. |
| **Score history** | Starts empty; "Your first update arrives [date]." |

---

## 2. Tech stack

- **Framework:** Next.js 15 App Router + TypeScript
- **Styling:** Tailwind CSS + Precursor tokens (`precursor-tokens.css`, `precursor-tailwind.config.js`)
- **Auth + DB:** Supabase (Postgres + Auth + Storage + RLS)
- **Email:** Resend
- **AI:** Anthropic SDK (Claude — for resume parsing and score drafting)
- **Analytics:** Vercel Analytics + Posthog
- **Hosting:** Vercel (+ Vercel Cron for weekly recompute)
- **Repo:** GitHub (private, invite Andrew)

---

## 3. Repo layout

```
precursor/
├── .env.local.example
├── .env.local                      # gitignored
├── .gitignore
├── README.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   ├── favicon.ico
│   ├── precursor-logo-mark.svg
│   ├── precursor-logo-white.svg
│   ├── precursor-logo-ink.svg
│   └── precursor-wordmark.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx              # fonts, tokens, analytics
│   │   ├── page.tsx                # public landing
│   │   ├── (public)/
│   │   │   ├── methodology/
│   │   │   ├── privacy/
│   │   │   └── terms/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   └── auth/callback/
│   │   ├── (app)/                  # gated
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── index/              # the AI Exposure Index table
│   │   │   ├── profession/[slug]/
│   │   │   ├── compare/
│   │   │   ├── settings/
│   │   │   └── onboarding/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── professions/
│   │   │       ├── capabilities/
│   │   │       └── ai-tools/
│   │   └── api/
│   │       ├── onboarding/parse-resume/
│   │       ├── onboarding/complete/
│   │       ├── score/recompute/
│   │       ├── favorites/
│   │       ├── user/export/
│   │       ├── user/delete/
│   │       └── cron/
│   │           ├── weekly-scores/
│   │           └── weekly-digest/
│   ├── components/
│   │   ├── brand/                  # Logo, Wordmark, ScoreDisplay
│   │   ├── ui/                     # Button, Input, Card, Table
│   │   ├── layout/                 # Nav, Footer, Shell
│   │   ├── score/                  # ScoreCard, ScoreBadge, HistoryChart
│   │   ├── profession/             # Header, CapabilityList, ToolCitations
│   │   └── admin/                  # Forms
│   ├── lib/
│   │   ├── supabase/               # server + client
│   │   ├── anthropic/              # resume parsing, score drafting
│   │   ├── resend/                 # templates + send
│   │   ├── scoring/                # personal score formula
│   │   ├── auth/                   # helpers, route guards
│   │   └── types.ts
│   └── styles/
│       ├── globals.css
│       └── tokens.css
├── supabase/
│   ├── migrations/                 # versioned SQL
│   └── seed/                       # O*NET-derived profession seeds
└── scripts/
    ├── seed-onet.ts
    └── generate-scores.ts
```

---

## 4. Data model (Supabase / Postgres)

### Identity
```sql
users (
  id                     uuid primary key references auth.users(id),
  email                  text,
  display_name           text,
  avatar_url             text,
  role                   text default 'user',        -- 'user' | 'admin'
  primary_profession_id  uuid references professions(id),
  organization_id        uuid null,                  -- reserved for future team accounts
  created_at             timestamptz default now(),
  onboarded_at           timestamptz
)

user_profile (
  user_id                uuid primary key references users(id) on delete cascade,
  years_experience       int,
  seniority              text,                       -- 'ic' | 'manager' | 'director' | 'exec'
  execution_time_pct     int,                        -- 0-100 (balance: execution vs. strategic)
  industry_vertical      text,
  skill_inputs           jsonb,                      -- { [skillKey]: value }
  updated_at             timestamptz default now()
)
```

### Content
```sql
professions (
  id               uuid primary key,
  slug             text unique,
  title            text,
  sector           text,                             -- 'Technology', 'Finance', etc.
  category         text,
  summary          text,
  body_md          text,                             -- long-form editorial
  baseline_score   int,                              -- 0-100
  published        boolean default false,
  updated_at       timestamptz default now()
)

capabilities (
  id          uuid primary key,
  slug        text unique,
  name        text,                                  -- "Writing & Communication"
  description text,
  category    text
)

profession_capabilities (
  profession_id    uuid references professions(id) on delete cascade,
  capability_id    uuid references capabilities(id),
  weight           int,                              -- 0-100, importance to profession
  exposure_score   int,                              -- 0-100, AI exposure for this capability
  narrative_md     text,
  primary key (profession_id, capability_id)
)

ai_tools (
  id                    uuid primary key,
  name                  text,                        -- "GPT-5", "Claude Opus 4.7", "Cursor"
  vendor                text,
  url                   text,
  capabilities_affected text[],
  first_seen            date
)

capability_ai_tools (
  capability_id uuid references capabilities(id),
  ai_tool_id    uuid references ai_tools(id),
  impact_level  int,                                 -- 0-100
  primary key (capability_id, ai_tool_id)
)
```

### Per-user state
```sql
user_scores (                                        -- weekly snapshot
  id                uuid primary key,
  user_id           uuid references users(id) on delete cascade,
  profession_id     uuid references professions(id),
  personal_score    int,
  baseline_score    int,
  delta             int,                             -- vs. previous week
  computed_at       timestamptz default now()
)

user_favorites (
  user_id        uuid references users(id) on delete cascade,
  profession_id  uuid references professions(id),
  created_at     timestamptz default now(),
  primary key (user_id, profession_id)
)

email_log (
  id         uuid primary key,
  user_id    uuid references users(id) on delete cascade,
  type       text,                                   -- 'welcome' | 'weekly_digest' | 'score_change'
  sent_at    timestamptz default now(),
  resend_id  text
)
```

### RLS policies
- `users`, `user_profile`, `user_scores`, `user_favorites`, `email_log`: owner read/write only; admin read all
- `professions`, `capabilities`, `ai_tools`, joins: authed users read published; admin read/write all

---

## 5. Personal score formula (v1 — simple, transparent)

```
personal_score = clamp(
  baseline_score + adjustments,
  0, 100
)

adjustments =
    seniority_adj             // +strategic/managerial work = lower exposure
  + execution_time_adj        // more execution = higher exposure
  + skills_adj                // AI-exposed skills raise; uniquely human lower
  + industry_adj              // industry multiplier
```

Each adjustment capped at ±8 points so personal scores stay within ±20 of baseline (prevents wild divergence from the profession's cited score).

Full formula lives in `src/lib/scoring/`, reviewable and unit-tested.

---

## 6. Page inventory

**Public:**
- `/` Landing — hero, methodology teaser, 3–5 blurred profession previews, Sign in with Google CTA
- `/methodology`
- `/privacy` (placeholder)
- `/terms` (placeholder)

**Auth:**
- `/sign-in`
- `/auth/callback`

**Gated:**
- `/onboarding` (multi-step: profession → [skill questions OR resume paste] → confirm)
- `/dashboard` — your score, baseline, delta, weekly trend, favorites summary
- `/index` — searchable/sortable table of all professions
- `/profession/[slug]` — full breakdown + citations
- `/compare?a=x&b=y` — capability-by-capability
- `/settings` — profile, notification prefs, change profession, export, delete account

**Admin:**
- `/admin` — dashboard
- `/admin/professions` — list + edit
- `/admin/professions/new`
- `/admin/professions/[id]/edit`
- `/admin/capabilities`
- `/admin/ai-tools`

---

## 7. API / server actions

| Route | Purpose |
|---|---|
| `POST /api/onboarding/parse-resume` | Claude → profession + skills from pasted text |
| `POST /api/onboarding/complete` | Save profile, compute initial personal score |
| `POST /api/score/recompute` | Recompute on profile/skill change |
| `POST /api/favorites` / `DELETE /api/favorites/:id` | Save/unsave |
| `GET /api/user/export` | Download JSON of user's data |
| `POST /api/user/delete` | Hard-delete user + cascade |
| `POST /api/cron/weekly-scores` | Vercel Cron: recompute all user scores weekly |
| `POST /api/cron/weekly-digest` | Vercel Cron: send Resend digest |

---

## 8. Build phases

**Phase 1 — Foundation**
Next.js init · brand tokens/assets wired · Supabase client · migrations · Google OAuth · middleware guards · base Nav with logo/user menu · public landing page (first visible slice).

**Phase 2 — Content layer**
Seed 20–30 professions from O*NET · capability taxonomy · AI tools table · admin pages.

**Phase 3 — User experience**
Onboarding (both paths) · dashboard · profession detail · index table · compare · settings.

**Phase 4 — Operations**
Vercel Cron weekly recompute · Resend welcome + digest · account export/delete · Posthog + Vercel Analytics.

---

## 9. Setup steps for you (Michael)

In rough order — I'll walk you through each when we get there.

1. **GitHub** — Create empty private repo `precursor` under your account. Share URL. Invite Andrew (`apham10@gmail.com`).
2. **Supabase** — Create project (free tier, us-west-2). Share: project URL, anon key, service_role key.
3. **Google Cloud** — Create OAuth 2.0 Client ID (Web). Authorized redirect URIs to be provided. Share client ID + secret.
4. **Resend** — Create account. Verify `precursorindex.com` (add DNS SPF/DKIM). Share API key.
5. **Anthropic API** — Share your API key (sk-ant-…).
6. **Posthog** — Create project (free tier). Share project API key.
7. **Vercel** — Sign in with GitHub. Import repo once pushed. Connect `precursorindex.com` (DNS CNAME).

---

## 10. Next step

Once you approve this plan, I'll:
1. Scaffold the Next.js project locally with brand tokens + assets
2. Push to your GitHub repo once you create it
3. Wire up Supabase + Google OAuth
4. Ship the public landing page as the first visible slice
5. Continue with Phase 1 items

Target: you're clicking a real sign-in button on a real preview URL by end of Phase 1.

---

*Plan v1 · 2026-04-18*
