/**
 * Precursor · Database row types
 *
 * Hand-maintained to match `supabase/migrations/*.sql`.
 * If you change the schema, update this file.
 * (Long-term: replace with `supabase gen types typescript`.)
 */

export type UserRole = "user" | "admin";
export type Seniority = "ic" | "manager" | "director" | "exec";

export interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  primary_profession_id: string | null;
  organization_id: string | null;
  created_at: string;
  onboarded_at: string | null;
}

export interface UserProfileRow {
  user_id: string;
  years_experience: number | null;
  seniority: Seniority | null;
  execution_time_pct: number | null;
  industry_vertical: string | null;
  skill_inputs: Record<string, unknown>;
  updated_at: string;
}

export interface ProfessionRow {
  id: string;
  slug: string;
  title: string;
  sector: string | null;
  category: string | null;
  summary: string | null;
  body_md: string | null;
  baseline_score: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CapabilityRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  created_at: string;
}

export interface ProfessionCapabilityRow {
  profession_id: string;
  capability_id: string;
  weight: number | null;
  exposure_score: number | null;
  narrative_md: string | null;
  created_at: string;
}

export interface AiToolRow {
  id: string;
  name: string;
  vendor: string | null;
  url: string | null;
  description: string | null;
  capabilities_affected: string[] | null;
  first_seen: string | null;
  created_at: string;
}

export interface CapabilityAiToolRow {
  capability_id: string;
  ai_tool_id: string;
  impact_level: number | null;
}

export interface UserScoreRow {
  id: string;
  user_id: string;
  profession_id: string;
  personal_score: number | null;
  baseline_score: number | null;
  delta: number | null;
  computed_at: string;
}

export interface UserFavoriteRow {
  user_id: string;
  profession_id: string;
  created_at: string;
}

// ─── Derived / view types ────────────────────────────────────────

export type ScoreBand = "low" | "medium" | "high" | "critical";

/** Score 0–30 low, 31–60 medium, 61–84 high, 85–100 critical */
export function scoreBand(score: number | null | undefined): ScoreBand {
  if (score == null) return "low";
  if (score >= 85) return "critical";
  if (score >= 61) return "high";
  if (score >= 31) return "medium";
  return "low";
}

export function bandColor(band: ScoreBand): string {
  return {
    low: "var(--color-score-low)",
    medium: "var(--color-score-medium)",
    high: "var(--color-score-high)",
    critical: "var(--color-score-critical)",
  }[band];
}

export function bandLabel(band: ScoreBand): string {
  return {
    low: "Low exposure",
    medium: "Moderate exposure",
    high: "High exposure",
    critical: "Critical exposure",
  }[band];
}
