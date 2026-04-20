import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/data/user";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const data = await getDashboardData();
  if (!data) redirect("/sign-in");

  const { user, profile, profession } = data;

  return (
    <div className="mx-auto max-w-[720px] px-6 md:px-10 py-12">
      <p className="eyebrow eyebrow-cobalt mb-3">Settings</p>
      <h1 className="font-display text-[36px] leading-[1.1] text-ink">
        Your account
      </h1>

      <section className="mt-10 bg-white border border-hairline rounded-[var(--radius-brand-sm)] p-6">
        <p className="eyebrow mb-4">Profile</p>
        <dl className="text-[14px] space-y-3">
          <Row label="Name" value={user.display_name ?? "—"} />
          <Row label="Email" value={user.email} />
          <Row label="Role" value={user.role} />
          <Row
            label="Primary profession"
            value={profession?.title ?? "Not set"}
          />
        </dl>
      </section>

      {profile && (
        <section className="mt-6 bg-white border border-hairline rounded-[var(--radius-brand-sm)] p-6">
          <p className="eyebrow mb-4">Personalization inputs</p>
          <dl className="text-[14px] space-y-3">
            <Row
              label="Years of experience"
              value={String(profile.years_experience ?? "—")}
            />
            <Row label="Seniority" value={profile.seniority ?? "—"} />
            <Row
              label="Execution time"
              value={`${profile.execution_time_pct ?? "—"}%`}
            />
            <Row label="Industry" value={profile.industry_vertical ?? "—"} />
            <Row
              label="AI familiarity"
              value={
                (profile.skill_inputs as { ai_familiarity?: string })
                  ?.ai_familiarity ?? "—"
              }
            />
          </dl>
          <p className="mt-4 text-[13px] text-mid-gray">
            Editing these inputs (and a full data-export / delete-account flow)
            lands in the next slice.
          </p>
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-6 items-baseline">
      <dt className="w-40 text-mid-gray">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
