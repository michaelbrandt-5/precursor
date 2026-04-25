import type { ProfessionCapabilityWithName } from "@/lib/data/user";
import { ScoreBadge, ScoreBar } from "@/components/score/ScoreNumber";

const HIGH_EXPOSURE_THRESHOLD = 61; // band boundary: >=61 is "High" or "Critical"

export function CapabilityHeatMap({
  professionTitle,
  capabilities,
}: {
  professionTitle: string;
  capabilities: ProfessionCapabilityWithName[];
}) {
  if (capabilities.length === 0) return null;

  // Already sorted by exposure_score desc in the data fetch, but be defensive.
  const sorted = [...capabilities].sort(
    (a, b) => (b.exposure_score ?? 0) - (a.exposure_score ?? 0),
  );
  const exposed = sorted.filter(
    (c) => (c.exposure_score ?? 0) >= HIGH_EXPOSURE_THRESHOLD,
  );
  const moat = sorted.filter(
    (c) => (c.exposure_score ?? 0) < HIGH_EXPOSURE_THRESHOLD,
  );

  return (
    <section className="mt-12 border-t border-hairline pt-10">
      <p className="eyebrow mb-3">How AI intersects with your role</p>
      <h2 className="font-display text-[24px] leading-tight text-ink">
        Your role&apos;s capabilities, ranked
      </h2>
      <p className="mt-2 text-[14px] text-mid-gray max-w-[600px]">
        Each capability of a {professionTitle.toLowerCase()} has its own
        exposure score. Top half is where AI is already doing the work — lean
        in. Bottom half is where you stay essential — defend and deepen.
      </p>

      {exposed.length > 0 && (
        <div className="mt-10">
          <p
            className="text-[11px] uppercase tracking-[0.12em] mb-5"
            style={{ color: "var(--color-score-high)" }}
          >
            Most exposed — embrace AI here
          </p>
          <ul className="space-y-7">
            {exposed.map((cap) => (
              <CapabilityRow key={cap.capability_id} cap={cap} />
            ))}
          </ul>
        </div>
      )}

      {moat.length > 0 && (
        <div className="mt-10">
          <p
            className="text-[11px] uppercase tracking-[0.12em] mb-5"
            style={{ color: "var(--color-score-low)" }}
          >
            Where you stay essential — your moat
          </p>
          <ul className="space-y-7">
            {moat.map((cap) => (
              <CapabilityRow key={cap.capability_id} cap={cap} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function CapabilityRow({ cap }: { cap: ProfessionCapabilityWithName }) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h3 className="font-sans font-medium text-[15px] text-ink">
          {cap.capability.name}
        </h3>
        <div className="flex items-center gap-3">
          <ScoreBadge value={cap.exposure_score} />
          <span className="text-[11px] text-mid-gray font-mono">
            weight {cap.weight}
          </span>
        </div>
      </div>
      <ScoreBar value={cap.exposure_score} className="mt-2.5" />
      {cap.narrative_md && (
        <p className="mt-3 text-[13px] text-dark-gray leading-[1.55] max-w-[680px]">
          {cap.narrative_md}
        </p>
      )}
    </li>
  );
}
