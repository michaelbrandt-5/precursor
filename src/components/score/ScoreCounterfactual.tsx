"use client";

import { useMemo, useState } from "react";
import { computePersonalScore } from "@/lib/scoring";
import { bandColor, scoreBand } from "@/lib/supabase/types";

type Seniority = "ic" | "manager" | "director" | "exec";
type Familiarity = "never" | "occasional" | "daily_power";

const SENIORITY_OPTIONS: { value: Seniority; label: string }[] = [
  { value: "ic", label: "Individual Contributor" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "exec", label: "VP / C-suite / Founder" },
];

const FAMILIARITY_OPTIONS: { value: Familiarity; label: string }[] = [
  { value: "never", label: "Rarely or never" },
  { value: "occasional", label: "Occasionally" },
  { value: "daily_power", label: "Daily — core to my work" },
];

export function ScoreCounterfactual({
  baseline,
  industryVertical,
  current,
}: {
  baseline: number;
  industryVertical: string | null;
  current: {
    seniority: Seniority;
    executionTimePct: number;
    aiFamiliarity: Familiarity;
  };
}) {
  const [seniority, setSeniority] = useState<Seniority>(current.seniority);
  const [exec, setExec] = useState<number>(current.executionTimePct);
  const [familiarity, setFamiliarity] = useState<Familiarity>(
    current.aiFamiliarity,
  );

  const currentScore = useMemo(
    () =>
      computePersonalScore({
        baseline,
        seniority: current.seniority,
        executionTimePct: current.executionTimePct,
        aiFamiliarity: current.aiFamiliarity,
        industryVertical,
      }).personal,
    [
      baseline,
      industryVertical,
      current.seniority,
      current.executionTimePct,
      current.aiFamiliarity,
    ],
  );

  const hypothetical = useMemo(
    () =>
      computePersonalScore({
        baseline,
        seniority,
        executionTimePct: exec,
        aiFamiliarity: familiarity,
        industryVertical,
      }),
    [baseline, industryVertical, seniority, exec, familiarity],
  );

  const delta = hypothetical.personal - currentScore;
  const changed =
    seniority !== current.seniority ||
    exec !== current.executionTimePct ||
    familiarity !== current.aiFamiliarity;

  const reset = () => {
    setSeniority(current.seniority);
    setExec(current.executionTimePct);
    setFamiliarity(current.aiFamiliarity);
  };

  const band = scoreBand(hypothetical.personal);
  const color = bandColor(band);

  return (
    <section className="mt-12 bg-white border border-hairline rounded-[var(--radius-brand-sm)] px-8 py-7">
      <p className="eyebrow mb-3">What would change your score?</p>
      <h2 className="font-display text-[24px] leading-tight text-ink">
        Try different inputs
      </h2>
      <p className="mt-2 text-[14px] text-mid-gray max-w-[560px]">
        Move these to see how each lever shifts your exposure. This is a what-if
        — your saved profile doesn&apos;t change. Update it on{" "}
        <span className="text-dark-gray">Settings → Redo my profile</span>.
      </p>

      <div className="mt-8 grid md:grid-cols-[1fr_240px] gap-10">
        {/* Controls */}
        <div className="space-y-7">
          <Field label="Seniority">
            <RadioGroup
              name="cf-seniority"
              value={seniority}
              onChange={(v) => setSeniority(v as Seniority)}
              options={SENIORITY_OPTIONS}
            />
          </Field>

          <Field
            label="Time split"
            hint="How much of your week is hands-on execution vs. strategic/managerial work?"
          >
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={exec}
                onChange={(e) => setExec(parseInt(e.target.value, 10))}
                className="flex-1"
              />
              <span className="font-mono text-[13px] w-24 text-right">
                {exec}% execution
              </span>
            </div>
          </Field>

          <Field label="AI tool use">
            <RadioGroup
              name="cf-familiarity"
              value={familiarity}
              onChange={(v) => setFamiliarity(v as Familiarity)}
              options={FAMILIARITY_OPTIONS}
            />
          </Field>
        </div>

        {/* Hypothetical score panel */}
        <div className="bg-parchment border border-hairline rounded-[var(--radius-brand-sm)] p-6 flex flex-col items-center justify-center text-center self-start">
          <p className="eyebrow mb-3">
            {changed ? "Hypothetical" : "Same as current"}
          </p>
          <span
            className="font-mono font-medium text-[64px] leading-none"
            style={{ color }}
          >
            {hypothetical.personal}
          </span>
          <span className="font-sans font-light text-[14px] text-light-gray mt-1">
            /100
          </span>
          {changed ? (
            <p
              className="mt-4 font-mono text-[13px]"
              style={{
                color:
                  delta < 0
                    ? "var(--color-score-low)"
                    : delta > 0
                      ? "var(--color-score-high)"
                      : "var(--color-mid-gray)",
              }}
            >
              {delta > 0 ? `+${delta}` : delta} vs your current ({currentScore})
            </p>
          ) : (
            <p className="mt-4 text-[12px] text-mid-gray">
              No changes yet — move a lever to see what shifts.
            </p>
          )}
          {changed && (
            <button
              type="button"
              onClick={reset}
              className="mt-5 text-[12px] text-mid-gray hover:text-cobalt underline underline-offset-2"
            >
              Reset to current
            </button>
          )}
        </div>
      </div>

      {/* Rationale of new mix */}
      {changed && hypothetical.rationale.length > 0 && (
        <div className="mt-8 border-t border-hairline pt-5">
          <p className="text-[12px] uppercase tracking-[0.08em] text-mid-gray mb-3">
            Adjustments under this scenario
          </p>
          <ul className="space-y-2">
            {hypothetical.rationale.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] text-dark-gray"
              >
                <span className="mt-[7px] w-1 h-1 rounded-full bg-cobalt flex-shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-ink mb-1">
        {label}
      </label>
      {hint && <p className="text-[13px] text-mid-gray mb-3">{hint}</p>}
      {children}
    </div>
  );
}

function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className={`flex items-center gap-3 px-3 py-2.5 border rounded-[var(--radius-brand-sm)] cursor-pointer transition-colors ${
            value === o.value
              ? "border-cobalt bg-cobalt-pale"
              : "border-hairline hover:border-light-gray"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="accent-cobalt"
          />
          <span className="text-[14px] text-ink">{o.label}</span>
        </label>
      ))}
    </div>
  );
}
