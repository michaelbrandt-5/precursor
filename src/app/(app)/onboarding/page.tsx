import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listPublishedProfessions } from "@/lib/data/professions";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata: Metadata = {
  title: "Welcome to Precursor",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // If they already onboarded, don't make them do it again
  const { data: userRow } = await supabase
    .from("users")
    .select("onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  if (userRow?.onboarded_at) redirect("/dashboard");

  const professions = await listPublishedProfessions();

  return (
    <div className="mx-auto max-w-[720px] px-6 md:px-10 py-16">
      <p className="eyebrow eyebrow-cobalt mb-3">Onboarding</p>
      <h1 className="font-display text-[36px] md:text-[44px] leading-[1.1] text-ink">
        Tell us about your role.
      </h1>
      <p className="mt-4 text-[16px] text-dark-gray leading-[1.6] max-w-[580px]">
        We&apos;ll compute your personal AI Exposure Score — how your specific
        situation differs from the profession average. Paste your LinkedIn or
        resume to autofill, or fill the form directly.
      </p>
      <OnboardingFlow professions={professions} />
    </div>
  );
}
