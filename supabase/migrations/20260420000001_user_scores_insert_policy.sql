-- Allow authenticated users to insert their own user_scores row.
-- Needed for the initial onboarding snapshot. Weekly recomputes in the
-- cron job will use service_role (which bypasses RLS anyway).

drop policy if exists user_scores_self_insert on public.user_scores;
create policy user_scores_self_insert on public.user_scores
  for insert to authenticated with check (auth.uid() = user_id);
