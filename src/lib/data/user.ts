import { createClient } from "@/lib/supabase/server";
import type {
  UserRow,
  UserProfileRow,
  UserScoreRow,
  ProfessionRow,
} from "@/lib/supabase/types";

export type DashboardData = {
  user: UserRow;
  profile: UserProfileRow | null;
  profession: ProfessionRow | null;
  latestScore: UserScoreRow | null;
};

export async function getDashboardData(): Promise<DashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();
  if (!user) return null;

  const [profileResult, scoreResult, professionResult] = await Promise.all([
    supabase
      .from("user_profile")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle(),
    supabase
      .from("user_scores")
      .select("*")
      .eq("user_id", authUser.id)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    user.primary_profession_id
      ? supabase
          .from("professions")
          .select("*")
          .eq("id", user.primary_profession_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    user: user as UserRow,
    profile: (profileResult.data as UserProfileRow | null) ?? null,
    profession: (professionResult.data as ProfessionRow | null) ?? null,
    latestScore: (scoreResult.data as UserScoreRow | null) ?? null,
  };
}
