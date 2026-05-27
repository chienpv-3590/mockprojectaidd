import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserProfile } from "./types";
import { isMissingTable } from "./errors";

// "Số hoa thị" tier from Kudos received — spec B.3.2 hover: 10 Kudos = 1 hoa thị,
// 20 = 2, 50 = 3.
function tierFromCount(received: number): 0 | 1 | 2 | 3 {
  if (received >= 50) return 3;
  if (received >= 20) return 2;
  if (received >= 10) return 1;
  return 0;
}

/**
 * Fetch a user profile joined with department info.
 */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      `
      user_id,
      full_name_vi,
      employee_code,
      title,
      avatar_url,
      department_code,
      department:departments(name_vi)
      `
    )
    .eq("user_id", userId)
    .single();

  if (error) {
    if (isMissingTable(error)) return null;
    if (error.code === "PGRST116") return null;
    throw error;
  }
  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data as any;
  const stats = await getProfileStats(supabase, userId);

  return {
    user_id: row.user_id,
    full_name_vi: row.full_name_vi,
    department_code: row.department_code ?? null,
    department_name_vi: row.department?.name_vi ?? null,
    employee_code: row.employee_code ?? null,
    title: row.title ?? null,
    avatar_url: row.avatar_url ?? null,
    tier: tierFromCount(stats.received),
  };
}

/**
 * Returns received/sent counts, total heart weight received, and tier level.
 */
export async function getProfileStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{ received: number; sent: number; hearts: number; tier: 0 | 1 | 2 | 3 }> {
  const [receivedRes, sentRes, heartsRes] = await Promise.all([
    supabase
      .from("kudos")
      .select("id", { count: "exact", head: true })
      .eq("to_user", userId),
    supabase
      .from("kudos")
      .select("id", { count: "exact", head: true })
      .eq("from_user", userId),
    // Sum heart weights received: join kudos (to_user=userId) → kudos_hearts
    supabase
      .from("kudos_hearts")
      .select("weight, kudos!inner(to_user)")
      .eq("kudos.to_user", userId),
  ]);

  if (receivedRes.error && !isMissingTable(receivedRes.error)) throw receivedRes.error;
  if (sentRes.error && !isMissingTable(sentRes.error)) throw sentRes.error;

  const received = receivedRes.count ?? 0;
  const sent = sentRes.count ?? 0;

  let hearts = 0;
  if (!heartsRes.error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hearts = (heartsRes.data ?? []).reduce((sum: number, row: any) => sum + (row.weight ?? 0), 0);
  }

  return { received, sent, hearts, tier: tierFromCount(received) };
}
