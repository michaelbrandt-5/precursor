import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { computePersonalScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Weekly score recompute. Runs every Monday at 13:00 UTC (see vercel.json).
 *
 * For each onboarded user, reads their CURRENT profile + their profession's
 * CURRENT baseline_score, runs `computePersonalScore`, and inserts a fresh
 * row into `user_scores`. The "current baseline" read is the key behavior:
 * when an admin updates a profession's baseline_score (e.g. bumping
 * Software Engineer from 72 → 75 after a major model release), every user
 * with that profession sees a step in their chart on the next cron run.
 *
 * Admins can force a recompute immediately after a baseline edit by
 * curling this endpoint with the Authorization Bearer header.
 *
 * Always inserts a snapshot per user, even when the score is unchanged
 * from last week — the flat line is itself information ("we checked, no
 * drift"), and keeps the chart cadence honest.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } },
  );

  // Fetch all onboarded users with their profession + profile in one round-trip.
  const { data: users, error: usersErr } = await supabase
    .from("users")
    .select(
      `
        id,
        primary_profession_id,
        user_profile (
          seniority,
          execution_time_pct,
          industry_vertical,
          skill_inputs
        ),
        professions:professions!users_primary_profession_id_fkey (
          id,
          baseline_score
        )
      `,
    )
    .not("onboarded_at", "is", null)
    .not("primary_profession_id", "is", null);

  if (usersErr) {
    return NextResponse.json(
      { ok: false, error: usersErr.message },
      { status: 500 },
    );
  }

  type Row = {
    userId: string;
    score?: number;
    skipped?: string;
    error?: string;
  };
  const results: Row[] = [];

  type UserShape = {
    id: string;
    primary_profession_id: string | null;
    user_profile:
      | {
          seniority: string | null;
          execution_time_pct: number | null;
          industry_vertical: string | null;
          skill_inputs: Record<string, unknown> | null;
        }
      | {
          seniority: string | null;
          execution_time_pct: number | null;
          industry_vertical: string | null;
          skill_inputs: Record<string, unknown> | null;
        }[]
      | null;
    professions:
      | { id: string; baseline_score: number | null }
      | { id: string; baseline_score: number | null }[]
      | null;
  };

  for (const raw of (users ?? []) as UserShape[]) {
    const profile = Array.isArray(raw.user_profile)
      ? raw.user_profile[0]
      : raw.user_profile;
    const profession = Array.isArray(raw.professions)
      ? raw.professions[0]
      : raw.professions;

    if (!profile || !profession || profession.baseline_score == null) {
      results.push({ userId: raw.id, skipped: "missing profile or baseline" });
      continue;
    }

    const aiFamiliarity =
      (profile.skill_inputs as { ai_familiarity?: string } | null)
        ?.ai_familiarity ?? null;

    const score = computePersonalScore({
      baseline: profession.baseline_score,
      seniority: profile.seniority,
      executionTimePct: profile.execution_time_pct,
      aiFamiliarity,
      industryVertical: profile.industry_vertical,
    });

    const { error: insertErr } = await supabase.from("user_scores").insert({
      user_id: raw.id,
      profession_id: profession.id,
      personal_score: score.personal,
      baseline_score: score.baseline,
      delta: score.delta,
    });

    if (insertErr) {
      results.push({ userId: raw.id, error: insertErr.message });
    } else {
      results.push({ userId: raw.id, score: score.personal });
    }
  }

  return NextResponse.json({
    ok: true,
    usersProcessed: results.length,
    successes: results.filter((r) => r.score !== undefined).length,
    skipped: results.filter((r) => r.skipped).length,
    errors: results.filter((r) => r.error).length,
    details: results,
    timestamp: new Date().toISOString(),
  });
}
