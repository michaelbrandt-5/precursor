import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/data/user";
import { computePersonalScore } from "@/lib/scoring";
import {
  ScoreNumber,
  ScoreBandLabel,
} from "@/components/score/ScoreNumber";
import { ScoreScale } from "@/components/score/ScoreScale";
import { ScoreCounterfactual } from "@/components/score/ScoreCounterfactual";
import { CapabilityHeatMap } from "@/components/score/CapabilityHeatMap";
import { AdjacentProfessions } from "@/components/score/AdjacentProfessions";
import { AiToolsToLearn } from "@/components/score/AiToolsToLearn";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/sign-in");

  const {
    user,
    profile,
    profession,
    latestScore,
    capabilities,
    lowerExposureAdjacents,
    relevantTools,
  } = data;

  // Not onboarded yet → send them to onboarding
  if (!user.onboarded_at || !profession || !profile) redirect("/onboarding");

  const firstName =
    (user.display_name ?? "").split(" ")[0] || "there";

  // Re-derive the score rationale (not stored — small, deterministic)
  const scoreDetail = computePersonalScore({
    baseline: profession.baseline_score ?? 50,
    seniority: profile.seniority,
    executionTimePct: profile.execution_time_pct,
    aiFamiliarity:
      (profile.skill_inputs as { ai_familiarity?: string })?.ai_familiarity ??
      null,
    industryVertical: profile.industry_vertical,
  });

  const personalScore = latestScore?.personal_score ?? scoreDetail.personal;
  const baselineScore = profession.baseline_score ?? 50;
  const delta = personalScore - baselineScore;

  return (
    <div className="mx-auto max-w-[var(--container-app)] px-6 md:px-10 py-12">
      <p className="eyebrow eyebrow-cobalt mb-3">Dashboard</p>
      <h1 className="font-display text-[36px] md:text-[44px] leading-[1.1] text-ink">
        Welcome back, {firstName}.
      </h1>

      {/* Score hero */}
      <section className="mt-10 grid md:grid-cols-[1fr_1fr] gap-8">
        {/* Personal score */}
        <div className="bg-white border border-hairline rounded-[var(--radius-brand-sm)] p-8">
          <p className="eyebrow mb-3">Your AI Exposure Score™</p>
          <ScoreNumber value={personalScore} size="xl" showDenominator />
          <div className="mt-3">
            <ScoreBandLabel value={personalScore} />
          </div>
          <p className="mt-4 text-[14px] text-dark-gray">
            {delta === 0
              ? "Your score matches the profession baseline."
              : delta > 0
                ? `Your role is ${delta} point${delta === 1 ? "" : "s"} more exposed than the ${profession.title} average.`
                : `Your role is ${Math.abs(delta)} point${Math.abs(delta) === 1 ? "" : "s"} less exposed than the ${profession.title} average.`}
          </p>
        </div>

        {/* Baseline + delta */}
        <div className="bg-parchment border border-hairline rounded-[var(--radius-brand-sm)] p-8">
          <p className="eyebrow mb-3">Profession baseline</p>
          <Link
            href={`/profession/${profession.slug}`}
            className="inline-block font-display text-[20px] text-ink hover:text-cobalt transition-colors"
          >
            {profession.title} →
          </Link>
          <div className="mt-4">
            <ScoreNumber value={baselineScore} size="lg" showDenominator />
          </div>
          <div className="mt-2">
            <ScoreBandLabel value={baselineScore} />
          </div>
          <p className="mt-4 text-[13px] text-mid-gray">
            The average for all {profession.title}s. Your personal score
            adjusts from this based on your situation.
          </p>
        </div>
      </section>

      {/* Exposure scale */}
      <section className="mt-12 bg-white border border-hairline rounded-[var(--radius-brand-sm)] px-8 pt-6 pb-8">
        <p className="eyebrow mb-6">Where you fall on the exposure scale</p>
        <ScoreScale
          value={personalScore}
          baseline={baselineScore}
          baselineLabel={`${profession.title} avg`}
        />
      </section>

      {/* Why your score differs */}
      {scoreDetail.rationale.length > 0 && (
        <section className="mt-12">
          <p className="eyebrow mb-3">Why your score differs</p>
          <h2 className="font-display text-[24px] text-ink mb-4">
            The adjustments behind your number
          </h2>
          <ul className="space-y-3">
            {scoreDetail.rationale.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[15px] text-dark-gray"
              >
                <span className="mt-1 w-1 h-1 rounded-full bg-cobalt flex-shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Capability heat map — where AI intersects your role */}
      <CapabilityHeatMap
        professionTitle={profession.title}
        capabilities={capabilities}
      />

      {/* Counterfactual — what-if sliders */}
      <ScoreCounterfactual
        baseline={baselineScore}
        industryVertical={profile.industry_vertical}
        current={{
          seniority:
            (profile.seniority as
              | "ic"
              | "manager"
              | "director"
              | "exec"
              | null) ?? "ic",
          executionTimePct: profile.execution_time_pct ?? 50,
          aiFamiliarity:
            (((profile.skill_inputs as { ai_familiarity?: string })
              ?.ai_familiarity as
              | "never"
              | "occasional"
              | "daily_power"
              | undefined) ?? "occasional"),
        }}
      />

      {/* Tools to ramp up on, ranked by relevance to high-exposure capabilities */}
      <AiToolsToLearn
        tools={relevantTools}
        totalHighExposureCapabilities={
          capabilities.filter((c) => (c.exposure_score ?? 0) >= 61).length
        }
        aiFamiliarity={
          ((profile.skill_inputs as { ai_familiarity?: string })
            ?.ai_familiarity as
            | "never"
            | "occasional"
            | "daily_power"
            | undefined) ?? null
        }
      />

      {/* Adjacent professions — lateral moves with lower exposure */}
      <AdjacentProfessions
        currentProfession={profession}
        candidates={lowerExposureAdjacents}
      />

      {/* History placeholder */}
      <section className="mt-16 border-t border-hairline pt-8">
        <p className="eyebrow mb-3">Score history</p>
        <p className="text-[14px] text-dark-gray max-w-[520px]">
          Scores update weekly as new AI capabilities emerge and the profession
          model is revised. Your first update will arrive next week — a chart
          appears here once you have multiple data points.
        </p>
      </section>
    </div>
  );
}
