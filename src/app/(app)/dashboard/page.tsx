import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "there";

  return (
    <div className="mx-auto max-w-[var(--container-app)] px-6 md:px-10 py-20">
      <p className="eyebrow eyebrow-cobalt mb-4">Dashboard</p>
      <h1 className="font-display text-[40px] leading-[1.1] text-ink">
        Welcome, {name}.
      </h1>
      <p className="mt-6 text-[16px] text-dark-gray max-w-[600px] leading-[1.65]">
        You&apos;re signed in. Onboarding, your AI Exposure Score, and the full
        index arrive in the next build step. For now, this page is the proof
        that auth works end-to-end.
      </p>

      <section className="mt-12 border border-hairline bg-white rounded-[var(--radius-brand-sm)] p-6">
        <p className="eyebrow mb-3">Session</p>
        <dl className="text-[14px] space-y-2">
          <div className="flex gap-4">
            <dt className="w-32 text-mid-gray">User ID</dt>
            <dd className="font-mono text-ink">{user?.id}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-32 text-mid-gray">Email</dt>
            <dd className="text-ink">{user?.email}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-32 text-mid-gray">Provider</dt>
            <dd className="text-ink">
              {(user?.app_metadata?.provider as string) ?? "—"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
