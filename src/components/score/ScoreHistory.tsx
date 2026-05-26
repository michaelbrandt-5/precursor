import type { UserScoreRow } from "@/lib/supabase/types";
import { bandColor, scoreBand } from "@/lib/supabase/types";

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const VB_W = 600;
const VB_H = 88;
const PAD_X = 12;
const PAD_Y = 14;

export function ScoreHistory({ history }: { history: UserScoreRow[] }) {
  if (history.length === 0) {
    return (
      <section className="mt-16 border-t border-hairline pt-8">
        <p className="eyebrow mb-3">Score history</p>
        <p className="text-[14px] text-dark-gray max-w-[560px]">
          No snapshots yet. Your first one lands the next time the weekly
          recompute runs.
        </p>
      </section>
    );
  }

  if (history.length === 1) {
    const only = history[0];
    return (
      <section className="mt-16 border-t border-hairline pt-8">
        <p className="eyebrow mb-3">Score history</p>
        <h2 className="font-display text-[24px] leading-tight text-ink">
          One snapshot so far
        </h2>
        <p className="mt-2 text-[14px] text-mid-gray max-w-[600px]">
          Your first score was recorded on{" "}
          <span className="text-dark-gray">
            {formatShortDate(only.computed_at)}
          </span>{" "}
          at{" "}
          <span className="font-mono text-dark-gray">
            {only.personal_score}
          </span>
          . New snapshots land every Monday — drift will show here when a
          profession baseline shifts or you update your profile.
        </p>
      </section>
    );
  }

  // 2+ snapshots — sparkline
  const values = history.map((h) => h.personal_score ?? 0);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const rangeV = maxV - minV || 1; // avoid div-by-zero on flat line
  const innerW = VB_W - 2 * PAD_X;
  const innerH = VB_H - 2 * PAD_Y;

  const points = history.map((h, i) => {
    const x = PAD_X + (i / (history.length - 1)) * innerW;
    const y =
      PAD_Y +
      (1 - ((h.personal_score ?? 0) - minV) / rangeV) * innerH;
    return { x, y, value: h.personal_score ?? 0, date: h.computed_at };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const areaPath =
    `M${points[0].x},${VB_H - PAD_Y} ` +
    points.map((p) => `L${p.x},${p.y}`).join(" ") +
    ` L${points[points.length - 1].x},${VB_H - PAD_Y} Z`;

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const delta = (latest.personal_score ?? 0) - (previous.personal_score ?? 0);
  const deltaColor =
    delta < 0
      ? "var(--color-score-low)"
      : delta > 0
        ? "var(--color-score-high)"
        : "var(--color-mid-gray)";

  const band = scoreBand(latest.personal_score);
  const lineColor = bandColor(band);

  return (
    <section className="mt-16 border-t border-hairline pt-8">
      <p className="eyebrow mb-3">Score history</p>
      <h2 className="font-display text-[24px] leading-tight text-ink">
        Your AI Exposure over time
      </h2>
      <p className="mt-2 text-[14px] text-mid-gray max-w-[620px]">
        Each dot is a weekly snapshot. Steps in the line happen when a
        profession&apos;s baseline is revised as AI capabilities shift, or when
        you update your own profile inputs.
      </p>

      <div className="mt-6 flex items-baseline justify-between flex-wrap gap-2">
        <span className="text-[12px] uppercase tracking-[0.08em] text-mid-gray font-mono">
          {formatShortDate(history[0].computed_at)} →{" "}
          {formatShortDate(latest.computed_at)} · {history.length} snapshots
        </span>
        <span
          className="font-mono text-[13px]"
          style={{ color: deltaColor }}
        >
          {delta === 0
            ? "no change since last"
            : `${delta > 0 ? "+" : ""}${delta} since last snapshot`}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full mt-3"
        preserveAspectRatio="none"
        style={{ height: "auto", maxHeight: "120px" }}
        aria-label="Personal score history sparkline"
      >
        {/* faint fill under the line */}
        <path
          d={areaPath}
          fill={lineColor}
          fillOpacity="0.08"
        />
        {/* baseline (min) and peak (max) reference lines */}
        <line
          x1={PAD_X}
          x2={VB_W - PAD_X}
          y1={PAD_Y}
          y2={PAD_Y}
          stroke="var(--color-hairline)"
          strokeWidth="0.5"
          strokeDasharray="2 3"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={PAD_X}
          x2={VB_W - PAD_X}
          y1={VB_H - PAD_Y}
          y2={VB_H - PAD_Y}
          stroke="var(--color-hairline)"
          strokeWidth="0.5"
          strokeDasharray="2 3"
          vectorEffect="non-scaling-stroke"
        />
        {/* the line */}
        <path
          d={linePath}
          stroke={lineColor}
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* dots at each snapshot */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill="var(--color-white)"
            stroke={lineColor}
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* min / max numerals at the right edge */}
        <text
          x={VB_W - PAD_X + 2}
          y={PAD_Y + 3}
          fontSize="9"
          fill="var(--color-mid-gray)"
          fontFamily="monospace"
          textAnchor="start"
        >
          {maxV}
        </text>
        <text
          x={VB_W - PAD_X + 2}
          y={VB_H - PAD_Y + 3}
          fontSize="9"
          fill="var(--color-mid-gray)"
          fontFamily="monospace"
          textAnchor="start"
        >
          {minV}
        </text>
      </svg>
    </section>
  );
}
