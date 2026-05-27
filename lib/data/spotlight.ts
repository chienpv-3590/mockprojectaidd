import type { SupabaseClient } from "@supabase/supabase-js";
import type { SpotlightNode } from "./types";
import { isMissingTable } from "./errors";

/**
 * Returns spotlight recipients from the user_kudos_received_counts view,
 * enriched with the most recent kudos received timestamp per user.
 * Ordered by received_count descending.
 */
export async function getSpotlightRecipients(
  supabase: SupabaseClient
): Promise<SpotlightNode[]> {
  // user_kudos_received_counts is a VIEW (no fk constraints). PostgREST
  // cannot embed user_profiles via a relationship hint. Fetch counts first,
  // then user_profiles separately, then merge in-code.
  // B.7 design shows hundreds of names densely packed in the word cloud.
  // Pull up to 200 recipients so the cloud renders with enough density.
  const { data, error } = await supabase
    .from("user_kudos_received_counts")
    .select("user_id, received_count")
    .order("received_count", { ascending: false })
    .limit(200);

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  if (!data || data.length === 0) return [];

  const userIds = (data as { user_id: string }[]).map((r) => r.user_id);

  // Fetch display names and last-received timestamps in parallel.
  const [profilesRes, kudosRes] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("user_id, full_name_vi")
      .in("user_id", userIds),
    supabase
      .from("kudos")
      .select("id, to_user, created_at")
      .in("to_user", userIds)
      .order("created_at", { ascending: false }),
  ]);

  if (profilesRes.error && !isMissingTable(profilesRes.error)) {
    throw profilesRes.error;
  }
  if (kudosRes.error && !isMissingTable(kudosRes.error)) {
    throw kudosRes.error;
  }

  // Build lookup maps
  const nameMap = new Map<string, string>();
  for (const p of (profilesRes.data ?? []) as { user_id: string; full_name_vi: string }[]) {
    nameMap.set(p.user_id, p.full_name_vi);
  }
  // First hit per to_user from the desc-sorted query is both newest kudos id
  // and newest received timestamp — captured together to avoid double scan.
  const lastReceivedMap = new Map<string, string>();
  const latestKudosIdMap = new Map<string, string>();
  for (const k of (kudosRes.data ?? []) as {
    id: string;
    to_user: string;
    created_at: string;
  }[]) {
    if (!lastReceivedMap.has(k.to_user)) {
      lastReceivedMap.set(k.to_user, k.created_at);
      latestKudosIdMap.set(k.to_user, k.id);
    }
  }

  // Per Spotlight B.7 spec: nodes display recipient NAMES. Drop users without
  // a profile row (or with an empty full_name_vi) — never leak raw user_id
  // (UUID) into the UI as a fallback name.
  return (data as { user_id: string; received_count: number | null }[])
    .map((row): SpotlightNode | null => {
      const name = nameMap.get(row.user_id);
      if (!name) return null;
      return {
        user_id: row.user_id,
        name,
        received_count: row.received_count ?? 0,
        last_received_at: lastReceivedMap.get(row.user_id) ?? "",
        latest_kudos_id: latestKudosIdMap.get(row.user_id) ?? null,
      };
    })
    .filter((n): n is SpotlightNode => n !== null);
}

/**
 * Global count of kudos rows. Used by Spotlight B.7.1 ("388 KUDOS" label).
 * Returns 0 if table missing — graceful for fresh DBs.
 */
export async function getTotalKudosCount(
  supabase: SupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from("kudos")
    .select("id", { count: "exact", head: true });
  if (error) {
    if (isMissingTable(error)) return 0;
    throw error;
  }
  return count ?? 0;
}
