import type { SupabaseClient } from "@supabase/supabase-js";
import type { SecretBoxCounts, UserProfile } from "./types";
import { isMissingTable } from "./errors";

/**
 * Count secret boxes for a user grouped by status.
 */
export async function getSecretBoxCounts(
  supabase: SupabaseClient,
  userId: string
): Promise<SecretBoxCounts> {
  const { data, error } = await supabase
    .from("secret_boxes")
    .select("status")
    .eq("owner", userId);

  if (error) {
    if (isMissingTable(error)) return { opened: 0, unopened: 0, total: 0 };
    throw error;
  }

  const rows = (data ?? []) as { status: string }[];
  const opened = rows.filter((r) => r.status === "opened" || r.status === "claimed").length;
  const unopened = rows.filter((r) => r.status === "unopened").length;

  return { opened, unopened, total: rows.length };
}

/**
 * Distinct collectible icon ids (1..6) the user has WON from opened/claimed
 * Secret Boxes. Drives the profile "Bộ sưu tập icon của tôi" collection — an
 * icon shows in colour once owned, otherwise its slot is locked.
 */
export async function getOwnedIcons(
  supabase: SupabaseClient,
  userId: string
): Promise<number[]> {
  const { data, error } = await supabase
    .from("secret_boxes")
    .select("reward_icon")
    .eq("owner", userId)
    .in("status", ["opened", "claimed"])
    .not("reward_icon", "is", null);

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  const ids = new Set<number>();
  for (const row of (data ?? []) as { reward_icon: number | null }[]) {
    if (row.reward_icon != null) ids.add(row.reward_icon);
  }
  return Array.from(ids).sort((a, b) => a - b);
}

/**
 * List the most recent secret box recipients (status = opened), joined with
 * their user profiles, ordered by opened_at descending.
 */
export async function listRecentRecipients(
  supabase: SupabaseClient,
  limit = 10
): Promise<{ user: UserProfile; reward_label_vi: string; opened_at: string }[]> {
  // secret_boxes.owner references auth.users, so PostgREST can't embed
  // user_profiles via a fk hint. Fetch boxes first, then profiles + depts
  // in separate queries and merge in code.
  // Fetch a wider window than `limit` so that, after collapsing multiple boxes
  // opened by the same person, we can still surface up to `limit` DISTINCT
  // recipients (a user may open several boxes).
  const { data: boxesRaw, error } = await supabase
    .from("secret_boxes")
    .select("reward_label_vi, opened_at, owner")
    .eq("status", "opened")
    .order("opened_at", { ascending: false })
    .limit(limit * 4);

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  const allBoxes = (boxesRaw ?? []) as Array<{
    reward_label_vi: string | null;
    opened_at: string | null;
    owner: string;
  }>;

  // Dedupe by owner — keep the most recent box per recipient. This both matches
  // the "recent recipients" intent and guarantees a unique React key downstream
  // (the row is keyed by user_id).
  const seenOwners = new Set<string>();
  const boxes = allBoxes
    .filter((b) => {
      if (!b.owner || seenOwners.has(b.owner)) return false;
      seenOwners.add(b.owner);
      return true;
    })
    .slice(0, limit);
  if (boxes.length === 0) return [];

  const ownerIds = Array.from(new Set(boxes.map((b) => b.owner).filter(Boolean)));

  const { data: profilesRaw, error: profilesErr } = await supabase
    .from("user_profiles")
    .select(
      "user_id, full_name_vi, employee_code, title, avatar_url, department_code"
    )
    .in("user_id", ownerIds);

  if (profilesErr && !isMissingTable(profilesErr)) throw profilesErr;
  const profiles = (profilesRaw ?? []) as Array<{
    user_id: string;
    full_name_vi: string | null;
    employee_code: string | null;
    title: string | null;
    avatar_url: string | null;
    department_code: string | null;
  }>;

  const deptCodes = Array.from(
    new Set(profiles.map((p) => p.department_code).filter((c): c is string => Boolean(c)))
  );
  const deptNameMap = new Map<string, string>();
  if (deptCodes.length > 0) {
    const { data: deptsRaw, error: deptsErr } = await supabase
      .from("departments")
      .select("code, name_vi")
      .in("code", deptCodes);
    if (deptsErr && !isMissingTable(deptsErr)) throw deptsErr;
    for (const d of (deptsRaw ?? []) as Array<{ code: string; name_vi: string }>) {
      deptNameMap.set(d.code, d.name_vi);
    }
  }

  const profileMap = new Map<string, (typeof profiles)[number]>();
  for (const p of profiles) profileMap.set(p.user_id, p);

  return boxes.map((row) => {
    const p = profileMap.get(row.owner);
    return {
      user: {
        user_id: p?.user_id ?? row.owner,
        full_name_vi: p?.full_name_vi ?? "",
        department_code: p?.department_code ?? null,
        department_name_vi: p?.department_code
          ? deptNameMap.get(p.department_code) ?? null
          : null,
        employee_code: p?.employee_code ?? null,
        title: p?.title ?? null,
        avatar_url: p?.avatar_url ?? null,
        tier: 0 as const,
      } satisfies UserProfile,
      reward_label_vi: row.reward_label_vi ?? "",
      opened_at: row.opened_at ?? "",
    };
  });
}
