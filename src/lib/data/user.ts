import { createClient } from "@/lib/supabase/server";
import type {
  UserRow,
  UserProfileRow,
  UserScoreRow,
  ProfessionRow,
  ProfessionCapabilityRow,
  CapabilityRow,
  AiToolRow,
} from "@/lib/supabase/types";
import { ADJACENCIES } from "./adjacencies";

const HIGH_EXPOSURE_THRESHOLD = 61;
const MAX_TOOLS = 4;

export type ProfessionCapabilityWithName = ProfessionCapabilityRow & {
  capability: CapabilityRow;
};

export type DashboardData = {
  user: UserRow;
  profile: UserProfileRow | null;
  profession: ProfessionRow | null;
  latestScore: UserScoreRow | null;
  capabilities: ProfessionCapabilityWithName[];
  /**
   * Lateral-move candidates: editorially-curated adjacent professions
   * filtered to those with a strictly lower baseline_score than the user's
   * current profession. Empty when the user is already in a low-exposure
   * role with no lower-scoring adjacents.
   */
  lowerExposureAdjacents: ProfessionRow[];
  /**
   * AI tools shaping the user's high-exposure capabilities, ranked by how
   * many of those capabilities the tool affects. Each tool also carries
   * `relevance` — the count of overlapping capabilities — so the UI can
   * communicate "covers 3 of your 6 capabilities."
   */
  relevantTools: (AiToolRow & {
    relevance: number;
    matchedSlugs: string[];
  })[];
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

  const profession = (professionResult.data as ProfessionRow | null) ?? null;

  // Capabilities are only loaded if the user has a profession assigned.
  // New professions added without capability mappings will return [] —
  // callers can hide the heat map section in that case.
  // Adjacency lookup uses the editorial map in ./adjacencies, then
  // filters to lower-baseline candidates only.
  const adjacencySlugs = profession
    ? (ADJACENCIES[profession.slug] ?? [])
    : [];
  const [capabilitiesResult, adjacentsResult] = await Promise.all([
    profession
      ? supabase
          .from("profession_capabilities")
          .select("*, capability:capabilities(*)")
          .eq("profession_id", profession.id)
          .order("exposure_score", { ascending: false })
      : Promise.resolve({ data: [] as ProfessionCapabilityWithName[] }),
    profession && adjacencySlugs.length > 0 && profession.baseline_score != null
      ? supabase
          .from("professions")
          .select("*")
          .eq("published", true)
          .in("slug", [...adjacencySlugs])
          .lt("baseline_score", profession.baseline_score)
          .order("baseline_score", { ascending: true })
      : Promise.resolve({ data: [] as ProfessionRow[] }),
  ]);

  const capabilities =
    (capabilitiesResult.data as ProfessionCapabilityWithName[] | null) ?? [];

  // Tools relevant to the user's role: any tool whose `capabilities_affected`
  // overlaps the user's high-exposure capability slugs. Ranked by overlap
  // count so the most-leverage tools surface first.
  const highExposureSlugs = capabilities
    .filter((c) => (c.exposure_score ?? 0) >= HIGH_EXPOSURE_THRESHOLD)
    .map((c) => c.capability.slug);

  let relevantTools: DashboardData["relevantTools"] = [];
  if (highExposureSlugs.length > 0) {
    const toolsResult = await supabase
      .from("ai_tools")
      .select("*")
      .overlaps("capabilities_affected", highExposureSlugs);

    const tools = (toolsResult.data as AiToolRow[] | null) ?? [];
    relevantTools = tools
      .map((t) => {
        const affected = t.capabilities_affected ?? [];
        const matched = affected.filter((s) => highExposureSlugs.includes(s));
        return { ...t, relevance: matched.length, matchedSlugs: matched };
      })
      .filter((t) => t.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, MAX_TOOLS);
  }

  return {
    user: user as UserRow,
    profile: (profileResult.data as UserProfileRow | null) ?? null,
    profession,
    latestScore: (scoreResult.data as UserScoreRow | null) ?? null,
    capabilities,
    lowerExposureAdjacents:
      (adjacentsResult.data as ProfessionRow[] | null) ?? [],
    relevantTools,
  };
}
