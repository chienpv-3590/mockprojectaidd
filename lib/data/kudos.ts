import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingTable } from "./errors";

export async function getReceivedCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("kudos")
    .select("id", { count: "exact", head: true })
    .eq("to_user", userId);
  if (error) {
    if (isMissingTable(error)) return 0;
    throw error;
  }
  return count ?? 0;
}
