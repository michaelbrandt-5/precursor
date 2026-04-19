import { createClient } from "@/lib/supabase/server";
import type {
  ProfessionRow,
  CapabilityRow,
  ProfessionCapabilityRow,
} from "@/lib/supabase/types";

/** Fetch every published profession, ordered by baseline_score desc. */
export async function listPublishedProfessions(): Promise<ProfessionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professions")
    .select("*")
    .eq("published", true)
    .order("baseline_score", { ascending: false });

  if (error) throw new Error(`listPublishedProfessions: ${error.message}`);
  return data ?? [];
}

export type ProfessionDetail = {
  profession: ProfessionRow;
  capabilities: (ProfessionCapabilityRow & { capability: CapabilityRow })[];
};

/** Fetch one profession by slug, with its capability breakdown. */
export async function getProfessionBySlug(
  slug: string,
): Promise<ProfessionDetail | null> {
  const supabase = await createClient();

  const { data: profession, error: pErr } = await supabase
    .from("professions")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (pErr) throw new Error(`getProfessionBySlug: ${pErr.message}`);
  if (!profession) return null;

  const { data: caps, error: cErr } = await supabase
    .from("profession_capabilities")
    .select("*, capability:capabilities(*)")
    .eq("profession_id", profession.id)
    .order("weight", { ascending: false });

  if (cErr) throw new Error(`getProfessionBySlug capabilities: ${cErr.message}`);

  return {
    profession: profession as ProfessionRow,
    capabilities: (caps ?? []) as (ProfessionCapabilityRow & {
      capability: CapabilityRow;
    })[],
  };
}
