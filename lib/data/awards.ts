import type { SupabaseClient } from "@supabase/supabase-js";
import type { Award } from "./types";
import { isMissingTable } from "./errors";

export async function getAwards(supabase: SupabaseClient): Promise<Award[]> {
  const { data, error } = await supabase
    .from("awards")
    .select("id, code, title_vi, description_vi, thumbnail_path, display_order")
    .order("display_order", { ascending: true });
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as Award[];
}
