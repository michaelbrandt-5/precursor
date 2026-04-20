"use client";

import { useState, useTransition } from "react";
import type { ProfessionRow } from "@/lib/supabase/types";
import type { ParsedProfile } from "@/lib/anthropic/parseResume";
import {
  parseResumeAction,
  completeOnboarding,
  type CompleteOnboardingInput,
} from "@/lib/actions/onboarding";
import { Button } from "@/components/ui/Button";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Marketing",
  "Consulting",
  "Media",
  "Creative",
  "Retail",
  "Legal",
  "Real Estate",
  "Manufacturing",
  "Energy",
  "Education",
  "Healthcare",
  "Government",
  "Non-profit",
  "Other",
];

type FormState = {
  profession_slug: string;
  years_experience: string;
  seniority: "" | "ic" | "manager" | "director" | "exec";
  execution_time_pct: string; // stored as string to allow empty
  industry_vertical: string;
  ai_familiarity: "" | "never" | "occasional" | "daily_power";
};

const EMPTY: FormState = {
  profession_slug: "",
  years_experience: "",
  seniority: "",
  execution_time_pct: "50",
  industry_vertical: "",
  ai_familiarity: "",
};

export function OnboardingFlow({
  professions,
}: {
  professions: ProfessionRow[];
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [pasteText, setPasteText] = useState("");
  const [pasteStatus, setPasteStatus] = useState<
    | { kind: "idle" }
    | { kind: "pending" }
    | { kind: "error"; message: string }
    | { kind: "filled"; confidence: ParsedProfile["confidence"]; summary: string }
  >({ kind: "idle" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleAutofill = async () => {
    if (!pasteText.trim()) return;
    setPasteStatus({ kind: "pending" });
    const result = await parseResumeAction(pasteText);
    if (!result.ok) {
      setPasteStatus({ kind: "error", message: result.error });
      return;
    }
    const p = result.profile;
    setForm({
      profession_slug: p.profession_slug ?? "",
      years_experience: p.years_experience?.toString() ?? "",
      seniority: p.seniority ?? "",
      execution_time_pct: "50", // not extractable from resume text
      industry_vertical: p.industry_vertical ?? "",
      ai_familiarity: p.ai_familiarity ?? "",
    });
    setPasteStatus({
      kind: "filled",
      confidence: p.confidence,
      summary: p.summary,
    });
  };

  const canSubmit =
    form.profession_slug &&
    form.years_experience !== "" &&
    form.seniority &&
    form.execution_time_pct !== "" &&
    form.industry_vertical &&
    form.ai_familiarity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!canSubmit) return;
    const payload: CompleteOnboardingInput = {
      profession_slug: form.profession_slug,
      years_experience: parseInt(form.years_experience, 10),
      seniority: form.seniority as CompleteOnboardingInput["seniority"],
      execution_time_pct: parseInt(form.execution_time_pct, 10),
      industry_vertical: form.industry_vertical,
      ai_familiarity: form.ai_familiarity as CompleteOnboardingInput["ai_familiarity"],
    };
    startTransition(async () => {
      const res = await completeOnboarding(payload);
      if (res && "ok" in res && !res.ok) {
        setSubmitError(res.error);
      }
    });
  };

  return (
    <div className="mt-10 space-y-10">
      {/* Autofill section */}
      <section className="border border-hairline bg-white rounded-[var(--radius-brand-sm)] p-6">
        <p className="eyebrow mb-2">Autofill (optional)</p>
        <h2 className="font-display text-[22px] text-ink">
          Paste your LinkedIn or resume
        </h2>
        <p className="mt-2 text-[14px] text-mid-gray">
          We&apos;ll use Claude to extract your profession, experience, and
          skills. You&apos;ll review and edit everything before saving.
        </p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste your LinkedIn About + experience, or a plain-text resume..."
          className="mt-4 w-full min-h-[160px] p-3 text-[14px] font-sans border border-hairline rounded-[var(--radius-brand-sm)] focus:outline-none focus:border-cobalt resize-y"
        />
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleAutofill}
            disabled={pasteStatus.kind === "pending" || !pasteText.trim()}
          >
            {pasteStatus.kind === "pending"
              ? "Analyzing..."
              : "Autofill from text"}
          </Button>
          {pasteStatus.kind === "filled" && (
            <span className="text-[13px] text-dark-gray">
              <span
                className="inline-block px-2 py-0.5 rounded-[2px] mr-2 text-[11px] font-medium"
                style={{
                  background:
                    pasteStatus.confidence === "high"
                      ? "var(--color-score-low-bg)"
                      : pasteStatus.confidence === "medium"
                        ? "var(--color-score-medium-bg)"
                        : "var(--color-score-high-bg)",
                  color:
                    pasteStatus.confidence === "high"
                      ? "var(--color-score-low)"
                      : pasteStatus.confidence === "medium"
                        ? "var(--color-score-medium)"
                        : "var(--color-score-high)",
                }}
              >
                {pasteStatus.confidence} confidence
              </span>
              {pasteStatus.summary}
            </span>
          )}
          {pasteStatus.kind === "error" && (
            <span className="text-[13px] text-score-high">
              {pasteStatus.message}
            </span>
          )}
        </div>
      </section>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profession */}
        <Field
          label="Your profession"
          hint="Pick the closest match — you can change this later."
        >
          <select
            required
            value={form.profession_slug}
            onChange={(e) => update("profession_slug", e.target.value)}
            className="w-full h-11 px-3 border border-hairline rounded-[var(--radius-brand-sm)] bg-white text-[15px] focus:outline-none focus:border-cobalt"
          >
            <option value="">Select a profession…</option>
            {professions.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>

        {/* Years experience */}
        <Field label="Years of experience">
          <input
            type="number"
            min={0}
            max={60}
            required
            value={form.years_experience}
            onChange={(e) => update("years_experience", e.target.value)}
            className="w-full h-11 px-3 border border-hairline rounded-[var(--radius-brand-sm)] bg-white text-[15px] focus:outline-none focus:border-cobalt"
          />
        </Field>

        {/* Seniority */}
        <Field label="Seniority">
          <RadioGroup
            name="seniority"
            value={form.seniority}
            onChange={(v) => update("seniority", v as FormState["seniority"])}
            options={[
              { value: "ic", label: "Individual Contributor" },
              { value: "manager", label: "Manager" },
              { value: "director", label: "Director" },
              { value: "exec", label: "VP / C-suite / Founder" },
            ]}
          />
        </Field>

        {/* Execution time */}
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
              value={form.execution_time_pct}
              onChange={(e) => update("execution_time_pct", e.target.value)}
              className="flex-1"
            />
            <span className="font-mono text-[14px] w-20 text-right">
              {form.execution_time_pct}% execution
            </span>
          </div>
        </Field>

        {/* Industry */}
        <Field label="Industry">
          <select
            required
            value={form.industry_vertical}
            onChange={(e) => update("industry_vertical", e.target.value)}
            className="w-full h-11 px-3 border border-hairline rounded-[var(--radius-brand-sm)] bg-white text-[15px] focus:outline-none focus:border-cobalt"
          >
            <option value="">Select an industry…</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>

        {/* AI familiarity */}
        <Field label="How often do you use AI tools in your work?">
          <RadioGroup
            name="ai_familiarity"
            value={form.ai_familiarity}
            onChange={(v) =>
              update("ai_familiarity", v as FormState["ai_familiarity"])
            }
            options={[
              { value: "never", label: "Rarely or never" },
              { value: "occasional", label: "Occasionally" },
              {
                value: "daily_power",
                label: "Daily — it's core to how I work",
              },
            ]}
          />
        </Field>

        {submitError && (
          <p
            role="alert"
            className="text-[13px] text-score-high bg-score-high-bg px-3 py-2 rounded-[2px]"
          >
            {submitError}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!canSubmit || isPending}
          >
            {isPending ? "Computing your score…" : "Compute my score"}
          </Button>
          {!canSubmit && (
            <span className="text-[13px] text-mid-gray">
              Complete all fields to continue.
            </span>
          )}
        </div>
      </form>
    </div>
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

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
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
