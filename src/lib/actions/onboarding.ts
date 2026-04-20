"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseResume, type ParsedProfile } from "@/lib/anthropic/parseResume";
import { computePersonalScore } from "@/lib/scoring";

export type ParseResumeResult =
  | { ok: true; profile: ParsedProfile }
  | { ok: false; error: string };

export async function parseResumeAction(
  text: string,
): Promise<ParseResumeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  try {
    const profile = await parseResume(text);
    return { ok: true, profile };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to parse resume. Try again.";
    return { ok: false, error: message };
  }
}

export type CompleteOnboardingInput = {
  profession_slug: string;
  years_experience: number;
  seniority: "ic" | "manager" | "director" | "exec";
  execution_time_pct: number;
  industry_vertical: string;
  ai_familiarity: "never" | "occasional" | "daily_power";
};

export async function completeOnboarding(input: CompleteOnboardingInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profession, error: pErr } = await supabase
    .from("professions")
    .select("id, baseline_score")
    .eq("slug", input.profession_slug)
    .eq("published", true)
    .maybeSingle();

  if (pErr || !profession || profession.baseline_score === null) {
    return { ok: false as const, error: "Selected profession is unavailable." };
  }

  const score = computePersonalScore({
    baseline: profession.baseline_score,
    seniority: input.seniority,
    executionTimePct: input.execution_time_pct,
    aiFamiliarity: input.ai_familiarity,
    industryVertical: input.industry_vertical,
  });

  const { error: profErr } = await supabase.from("user_profile").upsert({
    user_id: user.id,
    years_experience: input.years_experience,
    seniority: input.seniority,
    execution_time_pct: input.execution_time_pct,
    industry_vertical: input.industry_vertical,
    skill_inputs: { ai_familiarity: input.ai_familiarity },
  });

  if (profErr) return { ok: false as const, error: profErr.message };

  const { error: userErr } = await supabase
    .from("users")
    .update({
      primary_profession_id: profession.id,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (userErr) return { ok: false as const, error: userErr.message };

  const { error: scoreErr } = await supabase.from("user_scores").insert({
    user_id: user.id,
    profession_id: profession.id,
    personal_score: score.personal,
    baseline_score: score.baseline,
    delta: score.delta,
  });

  if (scoreErr) return { ok: false as const, error: scoreErr.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
