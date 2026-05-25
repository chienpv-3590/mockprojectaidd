import type { SupabaseClient } from "@supabase/supabase-js";

export async function getReceivedCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("kudos")
    .select("id", { count: "exact", head: true })
    .eq("to_user", userId);
  if (error) throw error;
  return count ?? 0;
}
