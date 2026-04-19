-- ═══════════════════════════════════════════════════════════════════
-- Precursor · AI Exposure Index™ — Initial schema
-- Migration 20260419000001
-- ═══════════════════════════════════════════════════════════════════
--
-- This migration is idempotent: safe to run once, safe to re-run.
-- Apply via Supabase dashboard → SQL Editor → paste entire file → Run.
--
-- Tables:
--   users                     identity mirror of auth.users
--   user_profile              personalization inputs
--   professions               the AI Exposure Index entries
--   capabilities              canonical capability taxonomy
--   profession_capabilities   per-profession capability scores
--   ai_tools                  citation library
--   capability_ai_tools       which tools impact which capabilities
--   user_scores               weekly snapshots (personal vs baseline)
--   user_favorites            user-saved professions
--   email_log                 transactional email audit trail
-- ═══════════════════════════════════════════════════════════════════


-- ─── Tables ────────────────────────────────────────────────────────

create table if not exists public.users (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text not null,
  display_name           text,
  avatar_url             text,
  role                   text not null default 'user' check (role in ('user', 'admin')),
  primary_profession_id  uuid,
  organization_id        uuid,
  created_at             timestamptz not null default now(),
  onboarded_at           timestamptz
);

create table if not exists public.user_profile (
  user_id             uuid primary key references public.users(id) on delete cascade,
  years_experience    int,
  seniority           text check (seniority in ('ic', 'manager', 'director', 'exec')),
  execution_time_pct  int check (execution_time_pct between 0 and 100),
  industry_vertical   text,
  skill_inputs        jsonb not null default '{}'::jsonb,
  updated_at          timestamptz not null default now()
);

create table if not exists public.professions (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  sector          text,
  category        text,
  summary         text,
  body_md         text,
  baseline_score  int check (baseline_score between 0 and 100),
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists professions_published_idx on public.professions(published);
create index if not exists professions_sector_idx on public.professions(sector);

create table if not exists public.capabilities (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  category    text,
  created_at  timestamptz not null default now()
);

create table if not exists public.profession_capabilities (
  profession_id    uuid not null references public.professions(id) on delete cascade,
  capability_id    uuid not null references public.capabilities(id) on delete cascade,
  weight           int check (weight between 0 and 100),
  exposure_score   int check (exposure_score between 0 and 100),
  narrative_md     text,
  created_at       timestamptz not null default now(),
  primary key (profession_id, capability_id)
);

create table if not exists public.ai_tools (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  vendor                text,
  url                   text,
  description           text,
  capabilities_affected text[],
  first_seen            date,
  created_at            timestamptz not null default now()
);

create table if not exists public.capability_ai_tools (
  capability_id uuid not null references public.capabilities(id) on delete cascade,
  ai_tool_id    uuid not null references public.ai_tools(id) on delete cascade,
  impact_level  int check (impact_level between 0 and 100),
  primary key (capability_id, ai_tool_id)
);

-- Add FK for users.primary_profession_id now that professions exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_primary_profession_id_fkey'
  ) then
    alter table public.users
      add constraint users_primary_profession_id_fkey
      foreign key (primary_profession_id) references public.professions(id) on delete set null;
  end if;
end $$;

create table if not exists public.user_scores (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  profession_id   uuid not null references public.professions(id),
  personal_score  int check (personal_score between 0 and 100),
  baseline_score  int check (baseline_score between 0 and 100),
  delta           int,
  computed_at     timestamptz not null default now()
);

create index if not exists user_scores_user_id_computed_at_idx
  on public.user_scores(user_id, computed_at desc);

create table if not exists public.user_favorites (
  user_id        uuid not null references public.users(id) on delete cascade,
  profession_id  uuid not null references public.professions(id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (user_id, profession_id)
);

create index if not exists user_favorites_user_id_idx on public.user_favorites(user_id);

create table if not exists public.email_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.users(id) on delete cascade,
  type       text not null,
  subject    text,
  sent_at    timestamptz not null default now(),
  resend_id  text,
  status     text
);


-- ─── Helper functions ──────────────────────────────────────────────

-- is_admin() — SECURITY DEFINER so it can read public.users bypassing RLS,
-- avoids recursive RLS evaluation in policies that reference users.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select role = 'admin' from public.users where id = uid),
    false
  );
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated, service_role;

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists professions_updated_at on public.professions;
create trigger professions_updated_at
  before update on public.professions
  for each row
  execute function public.set_updated_at();

drop trigger if exists user_profile_updated_at on public.user_profile;
create trigger user_profile_updated_at
  before update on public.user_profile
  for each row
  execute function public.set_updated_at();


-- ─── Auth signup trigger ───────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_founder boolean;
begin
  is_founder := new.email in ('michaelbrandt@gmail.com', 'apham10@gmail.com');

  insert into public.users (id, email, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    case when is_founder then 'admin' else 'user' end
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.users.display_name),
        avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill public.users from any existing auth.users (e.g. accounts that
-- signed in before this migration ran).
insert into public.users (id, email, display_name, avatar_url, role)
select
  id,
  coalesce(email, ''),
  coalesce(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(coalesce(email, ''), '@', 1)
  ),
  raw_user_meta_data->>'avatar_url',
  case when email in ('michaelbrandt@gmail.com', 'apham10@gmail.com')
       then 'admin'
       else 'user'
  end
from auth.users
on conflict (id) do nothing;


-- ─── RLS policies ──────────────────────────────────────────────────
-- Note: automatic RLS is enabled on this project, so RLS is already ON
-- for every table in the public schema. We just need policies.
-- Policies are dropped-and-recreated for idempotency.

-- users
drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users
  for select using (auth.uid() = id);

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- user_profile
drop policy if exists user_profile_self_all on public.user_profile;
create policy user_profile_self_all on public.user_profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_scores (reads only for user; inserts happen via service_role in cron)
drop policy if exists user_scores_self_select on public.user_scores;
create policy user_scores_self_select on public.user_scores
  for select using (auth.uid() = user_id);

-- user_favorites
drop policy if exists user_favorites_self_all on public.user_favorites;
create policy user_favorites_self_all on public.user_favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- professions — authed users read published; admins full access
drop policy if exists professions_authed_select_published on public.professions;
create policy professions_authed_select_published on public.professions
  for select to authenticated using (published = true);

drop policy if exists professions_admin_all on public.professions;
create policy professions_admin_all on public.professions
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- capabilities
drop policy if exists capabilities_authed_select on public.capabilities;
create policy capabilities_authed_select on public.capabilities
  for select to authenticated using (true);

drop policy if exists capabilities_admin_all on public.capabilities;
create policy capabilities_admin_all on public.capabilities
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- profession_capabilities — visible where profession is published
drop policy if exists pc_authed_select_published on public.profession_capabilities;
create policy pc_authed_select_published on public.profession_capabilities
  for select to authenticated using (
    exists (
      select 1 from public.professions p
      where p.id = profession_capabilities.profession_id
        and p.published = true
    )
  );

drop policy if exists pc_admin_all on public.profession_capabilities;
create policy pc_admin_all on public.profession_capabilities
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ai_tools
drop policy if exists ai_tools_authed_select on public.ai_tools;
create policy ai_tools_authed_select on public.ai_tools
  for select to authenticated using (true);

drop policy if exists ai_tools_admin_all on public.ai_tools;
create policy ai_tools_admin_all on public.ai_tools
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- capability_ai_tools
drop policy if exists cat_authed_select on public.capability_ai_tools;
create policy cat_authed_select on public.capability_ai_tools
  for select to authenticated using (true);

drop policy if exists cat_admin_all on public.capability_ai_tools;
create policy cat_admin_all on public.capability_ai_tools
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- email_log — no policies: service_role bypasses RLS, authed users have no access
