import type { SupabaseClient } from "@supabase/supabase-js";

export async function getEventDate(supabase: SupabaseClient): Promise<Date | null> {
  const { data, error } = await supabase
    .from("event_settings")
    .select("value")
    .eq("key", "saa_event_date")
    .maybeSingle();
  if (error) throw error;
  if (!data?.value) return null;
  const d = new Date(data.value);
  return isNaN(d.getTime()) ? null : d;
}
