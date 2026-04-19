/**
 * Sample profession data used on the public landing page only.
 * These are teaser previews with locked/blurred scores.
 * Real data will come from the professions table once the admin CMS is built.
 */

export type ScoreBand = "low" | "medium" | "high" | "critical";

export type PreviewProfession = {
  slug: string;
  title: string;
  sector: string;
  band: ScoreBand;
};

export const PREVIEW_PROFESSIONS: PreviewProfession[] = [
  { slug: "software-engineer", title: "Software Engineer", sector: "Technology", band: "high" },
  { slug: "financial-analyst", title: "Financial Analyst", sector: "Finance", band: "critical" },
  { slug: "marketer", title: "Marketer", sector: "Marketing", band: "high" },
  { slug: "lawyer", title: "Lawyer", sector: "Legal", band: "medium" },
  { slug: "designer", title: "Designer", sector: "Creative", band: "high" },
];

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
