import { scoreBand, bandColor, bandLabel } from "@/lib/supabase/types";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, string> = {
  sm: "text-[14px]",
  md: "text-[24px]",
  lg: "text-[48px]",
  xl: "text-[96px]",
};

export function ScoreNumber({
  value,
  size = "md",
  showDenominator = true,
  className = "",
}: {
  value: number | null | undefined;
  size?: Size;
  showDenominator?: boolean;
  className?: string;
}) {
  const band = scoreBand(value);
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span
        className={`font-mono font-medium leading-none ${SIZE[size]}`}
        style={{ color: bandColor(band) }}
      >
        {value ?? "—"}
      </span>
      {showDenominator && (
        <span className="font-sans font-light text-[16px] text-light-gray">
          /100
        </span>
      )}
    </span>
  );
}

export function ScoreBadge({
  value,
  className = "",
}: {
  value: number | null | undefined;
  className?: string;
}) {
  const band = scoreBand(value);
  return (
    <span
      className={`inline-flex items-center font-mono font-medium text-[13px] px-[6px] py-[2px] rounded-[var(--radius-brand-md)] ${className}`}
      style={{
        color: bandColor(band),
        background: `color-mix(in srgb, ${bandColor(band)} 10%, transparent)`,
      }}
    >
      {value ?? "—"}
    </span>
  );
}

export function ScoreBar({
  value,
  className = "",
}: {
  value: number | null | undefined;
  className?: string;
}) {
  const band = scoreBand(value);
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      className={`h-1 w-full bg-hairline rounded-[2px] overflow-hidden ${className}`}
    >
      <div
        className="h-full rounded-[2px]"
        style={{
          width: `${pct}%`,
          background: bandColor(band),
        }}
      />
    </div>
  );
}

export function ScoreBandLabel({
  value,
  className = "",
}: {
  value: number | null | undefined;
  className?: string;
}) {
  const band = scoreBand(value);
  return (
    <span
      className={`text-[13px] ${className}`}
      style={{ color: bandColor(band) }}
    >
      {bandLabel(band)}
    </span>
  );
}
