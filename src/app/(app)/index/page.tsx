import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedProfessions } from "@/lib/data/professions";
import { ScoreNumber, ScoreBandLabel } from "@/components/score/ScoreNumber";

export const metadata: Metadata = {
  title: "The AI Exposure Index",
};

export default async function IndexPage() {
  const professions = await listPublishedProfessions();

  return (
    <div className="mx-auto max-w-[var(--container-app)] px-6 md:px-10 py-16">
      <header className="mb-12">
        <p className="eyebrow eyebrow-cobalt mb-3">The AI Exposure Index™</p>
        <h1 className="font-display text-[40px] md:text-[56px] leading-[1.1] text-ink">
          Every profession, scored.
        </h1>
        <p className="mt-6 text-[16px] text-dark-gray max-w-[620px] leading-[1.65]">
          Each occupation&apos;s AI Exposure Score is the weighted share of its
          core capabilities that can be automated or significantly augmented by
          current AI. Click any row for the full breakdown.
        </p>
      </header>

      {professions.length === 0 ? (
        <p className="text-[14px] text-mid-gray">
          No professions published yet. Run the seed migration to populate.
        </p>
      ) : (
        <div className="bg-white border border-hairline rounded-[var(--radius-brand-sm)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hairline">
                <th className="eyebrow p-4">Occupation</th>
                <th className="eyebrow p-4 hidden sm:table-cell">Sector</th>
                <th className="eyebrow p-4 text-right">Score</th>
                <th className="eyebrow p-4 hidden md:table-cell">Exposure</th>
              </tr>
            </thead>
            <tbody>
              {professions.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-hairline last:border-b-0 hover:bg-parchment transition-colors"
                >
                  <td className="p-4">
                    <Link
                      href={`/profession/${p.slug}`}
                      className="font-medium text-ink hover:text-cobalt transition-colors"
                    >
                      {p.title}
                    </Link>
                    {p.summary && (
                      <p className="mt-1 text-[13px] text-mid-gray max-w-[520px]">
                        {p.summary}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-[14px] text-dark-gray hidden sm:table-cell">
                    {p.sector}
                  </td>
                  <td className="p-4 text-right">
                    <ScoreNumber
                      value={p.baseline_score}
                      size="md"
                      showDenominator={false}
                    />
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <ScoreBandLabel value={p.baseline_score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
