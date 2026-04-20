import { scoreBand, bandColor } from "@/lib/supabase/types";

type Band = {
  key: string;
  label: string;
  min: number;
  max: number;
  color: string;
  bg: string;
};

const BANDS: Band[] = [
  {
    key: "low",
    label: "Low",
    min: 0,
    max: 30,
    color: "var(--color-score-low)",
    bg: "var(--color-score-low-bg)",
  },
  {
    key: "medium",
    label: "Moderate",
    min: 30,
    max: 60,
    color: "var(--color-score-medium)",
    bg: "var(--color-score-medium-bg)",
  },
  {
    key: "high",
    label: "High",
    min: 60,
    max: 85,
    color: "var(--color-score-high)",
    bg: "var(--color-score-high-bg)",
  },
  {
    key: "critical",
    label: "Critical",
    min: 85,
    max: 100,
    color: "var(--color-score-critical)",
    bg: "var(--color-score-critical-bg)",
  },
];

const BREAKPOINTS = [0, 30, 60, 85, 100];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function ScoreScale({
  value,
  baseline,
  baselineLabel,
}: {
  value: number;
  baseline?: number | null;
  baselineLabel?: string;
}) {
  const v = clamp(value);
  const b =
    baseline !== undefined && baseline !== null ? clamp(baseline) : null;
  const vBand = scoreBand(v);

  return (
    <div className="w-full">
      {/* YOU callout above the bar */}
      <div className="relative h-16">
        <div
          className="absolute -translate-x-1/2 flex flex-col items-center bottom-0"
          style={{ left: `${v}%` }}
        >
          <span className="text-[10px] uppercase tracking-[0.14em] text-mid-gray">
            You
          </span>
          <span
            className="font-mono text-[24px] leading-none mt-1"
            style={{ color: bandColor(vBand) }}
          >
            {v}
          </span>
          <span
            className="w-px h-3 mt-2"
            style={{ background: bandColor(vBand) }}
          />
        </div>
      </div>

      {/* Band strip */}
      <div className="relative flex w-full h-3 rounded-[2px] overflow-hidden">
        {BANDS.map((band) => (
          <div
            key={band.key}
            style={{
              width: `${band.max - band.min}%`,
              background: band.bg,
            }}
          />
        ))}
        {BREAKPOINTS.slice(1, -1).map((bp) => (
          <div
            key={bp}
            className="absolute top-0 h-full w-px"
            style={{ left: `${bp}%`, background: "var(--color-white)" }}
          />
        ))}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${v}%`,
            width: 14,
            height: 14,
            background: bandColor(vBand),
            boxShadow: "0 0 0 2px var(--color-white)",
          }}
          aria-label={`Your score ${v}`}
        />
        {b !== null && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{
              left: `${b}%`,
              width: 12,
              height: 12,
              background: "var(--color-white)",
              borderColor: "var(--color-mid-gray)",
            }}
            aria-label={`Profession baseline ${b}`}
          />
        )}
      </div>

      {/* Breakpoint numerals under the bar */}
      <div className="relative h-5 mt-2">
        {BREAKPOINTS.map((bp) => (
          <span
            key={bp}
            className="absolute -translate-x-1/2 font-mono text-[11px] text-mid-gray leading-none"
            style={{ left: `${bp}%` }}
          >
            {bp}
          </span>
        ))}
      </div>

      {/* Band labels */}
      <div className="flex w-full mt-1">
        {BANDS.map((band) => (
          <div
            key={band.key}
            className="text-center text-[10px] uppercase tracking-[0.12em] leading-tight"
            style={{
              width: `${band.max - band.min}%`,
              color: band.color,
            }}
          >
            {band.label}
          </div>
        ))}
      </div>

      {/* Baseline callout beneath */}
      {b !== null && baselineLabel && (
        <div className="relative h-6 mt-4">
          <div
            className="absolute -translate-x-1/2 flex flex-col items-center top-0"
            style={{ left: `${b}%` }}
          >
            <span
              className="w-px h-3"
              style={{ background: "var(--color-mid-gray)" }}
            />
            <span className="text-[11px] text-mid-gray whitespace-nowrap mt-1">
              {baselineLabel}{" "}
              <span className="font-mono">{b}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
