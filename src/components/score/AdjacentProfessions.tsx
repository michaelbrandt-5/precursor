import Link from "next/link";
import type { ProfessionRow } from "@/lib/supabase/types";
import { ScoreNumber, ScoreBandLabel } from "@/components/score/ScoreNumber";

export function AdjacentProfessions({
  currentProfession,
  candidates,
}: {
  currentProfession: ProfessionRow;
  candidates: ProfessionRow[];
}) {
  const currentBaseline = currentProfession.baseline_score ?? 50;

  return (
    <section className="mt-12 border-t border-hairline pt-10">
      <p className="eyebrow mb-3">Lateral moves to consider</p>
      <h2 className="font-display text-[24px] leading-tight text-ink">
        Lower-exposure roles your skills already touch
      </h2>

      {candidates.length === 0 ? (
        <p className="mt-3 text-[14px] text-dark-gray max-w-[560px]">
          {currentProfession.title} is already among the least-exposed roles in
          our index. The play here is to deepen what makes you essential, not
          pivot — your moat is the role itself.
        </p>
      ) : (
        <>
          <p className="mt-2 text-[14px] text-mid-gray max-w-[600px]">
            Curated adjacents that share core skills with{" "}
            {currentProfession.title.toLowerCase()}, ranked by exposure (lowest
            first). Click any to see the full breakdown.
          </p>

          <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidates.map((p) => {
              const baseline = p.baseline_score ?? 50;
              const delta = baseline - currentBaseline;
              return (
                <li key={p.id}>
                  <Link
                    href={`/profession/${p.slug}`}
                    className="group block bg-parchment border border-hairline rounded-[var(--radius-brand-sm)] p-5 hover:border-cobalt transition-colors h-full"
                  >
                    <p className="text-[11px] uppercase tracking-[0.08em] text-mid-gray">
                      {p.sector}
                      {p.category ? ` · ${p.category}` : ""}
                    </p>
                    <h3 className="mt-1 font-display text-[20px] leading-tight text-ink group-hover:text-cobalt transition-colors">
                      {p.title}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-3">
                      <ScoreNumber
                        value={baseline}
                        size="md"
                        showDenominator={false}
                      />
                      <span className="text-[12px] font-mono text-score-low">
                        {delta} pts
                      </span>
                    </div>
                    <div className="mt-1">
                      <ScoreBandLabel value={baseline} />
                    </div>
                    {p.summary && (
                      <p className="mt-3 text-[13px] text-dark-gray leading-[1.55]">
                        {p.summary}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
