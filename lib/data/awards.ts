import type { SupabaseClient } from "@supabase/supabase-js";
import type { Award } from "./types";

export async function getAwards(supabase: SupabaseClient): Promise<Award[]> {
  const { data, error } = await supabase
    .from("awards")
    .select("id, code, title_vi, description_vi, thumbnail_path, display_order")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Award[];
}
