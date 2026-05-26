import type { SupabaseClient } from "@supabase/supabase-js";
import type { Award } from "./types";
import { isMissingTable } from "./errors";

export async function getAwards(supabase: SupabaseClient): Promise<Award[]> {
  const { data, error } = await supabase
    .from("awards")
    .select(
      "id, code, title_vi, description_vi, thumbnail_path, display_order, long_description_vi, quantity_text, unit_text, value_text, value_breakdown"
    )
    .order("display_order", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as Award[];
}
