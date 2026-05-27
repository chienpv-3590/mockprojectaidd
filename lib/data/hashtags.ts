import type { SupabaseClient } from "@supabase/supabase-js";
import type { Hashtag } from "./types";
import { isMissingTable } from "./errors";

const HASHTAG_SELECT = "id, code, label_vi, kind, display_order";

/**
 * List all feature hashtags ordered by display_order.
 * Feature hashtags are the large labels shown on kudos cards (e.g. "IDOL GIỚI TRẺ").
 */
export async function listFeatureHashtags(supabase: SupabaseClient): Promise<Hashtag[]> {
  const { data, error } = await supabase
    .from("hashtags")
    .select(HASHTAG_SELECT)
    .eq("kind", "feature")
    .order("display_order", { ascending: true });

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as Hashtag[];
}

/**
 * List all small hashtags ordered by display_order.
 * Small hashtags are the tag chips shown on kudos cards (up to 5).
 */
export async function listSmallHashtags(supabase: SupabaseClient): Promise<Hashtag[]> {
  const { data, error } = await supabase
    .from("hashtags")
    .select(HASHTAG_SELECT)
    .eq("kind", "small")
    .order("display_order", { ascending: true });

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as Hashtag[];
}
