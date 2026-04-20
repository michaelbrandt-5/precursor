/**
 * Precursor · Personal AI Exposure Score
 *
 * personal_score = clamp(baseline + adjustments, 0, 100)
 * adjustments = seniority + execution + familiarity + industry
 * Total adjustment capped at ±15 so the personal score stays within a
 * reasonable band of the profession's cited baseline.
 */

export type ScoreInputs = {
  baseline: number;
  seniority: string | null;
  executionTimePct: number | null;
  aiFamiliarity: string | null;
  industryVertical: string | null;
};

export type ScoreResult = {
  personal: number;
  baseline: number;
  delta: number;
  adjustments: {
    seniority: number;
    execution: number;
    familiarity: number;
    industry: number;
  };
  rationale: string[];
};

const SENIORITY_ADJ: Record<string, number> = {
  ic: 5, // hands-on execution is more AI-exposed
  manager: 0,
  director: -4,
  exec: -7, // strategy / judgment work is harder for AI to replace
};

const FAMILIARITY_ADJ: Record<string, number> = {
  never: 4, // hasn't adapted — higher relative exposure
  occasional: 0,
  daily_power: -5, // already leveraging AI — lower relative exposure
};

const INDUSTRY_ADJ: Record<string, number> = {
  Technology: 2,
  Finance: 3,
  Marketing: 1,
  Consulting: 2,
  Media: 2,
  Creative: 1,
  Retail: 0,
  Legal: 0,
  "Real Estate": 0,
  Manufacturing: -1,
  Energy: -1,
  Education: -2,
  Healthcare: -3,
  Government: -4,
  "Non-profit": -2,
  Other: 0,
};

const CAP = 15;

export function computePersonalScore(inputs: ScoreInputs): ScoreResult {
  const baseline = clamp(inputs.baseline, 0, 100);

  const seniority = inputs.seniority
    ? (SENIORITY_ADJ[inputs.seniority] ?? 0)
    : 0;
  const familiarity = inputs.aiFamiliarity
    ? (FAMILIARITY_ADJ[inputs.aiFamiliarity] ?? 0)
    : 0;
  const industry = inputs.industryVertical
    ? (INDUSTRY_ADJ[inputs.industryVertical] ?? 0)
    : 0;

  let execution = 0;
  if (inputs.executionTimePct !== null) {
    if (inputs.executionTimePct >= 70) execution = 5;
    else if (inputs.executionTimePct >= 40) execution = 0;
    else execution = -5;
  }

  const raw = seniority + execution + familiarity + industry;
  const capped = clamp(raw, -CAP, CAP);
  const personal = clamp(baseline + capped, 0, 100);

  const rationale: string[] = [];
  if (seniority > 0) rationale.push(`hands-on execution is more AI-exposed (+${seniority})`);
  else if (seniority < 0) rationale.push(`strategic/managerial work is less AI-exposed (${seniority})`);
  if (execution > 0) rationale.push(`high share of execution time raises exposure (+${execution})`);
  else if (execution < 0) rationale.push(`strategic/managerial time lowers exposure (${execution})`);
  if (familiarity > 0) rationale.push(`limited AI tool adoption raises relative exposure (+${familiarity})`);
  else if (familiarity < 0) rationale.push(`daily AI tool use lowers your relative exposure (${familiarity})`);
  if (industry > 0) rationale.push(`fast-adopting industry raises exposure (+${industry})`);
  else if (industry < 0) rationale.push(`slower-adopting industry lowers exposure (${industry})`);

  return {
    personal,
    baseline,
    delta: personal - baseline,
    adjustments: { seniority, execution, familiarity, industry },
    rationale,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
