import type { SupabaseClient } from "@supabase/supabase-js";
import type { KudosCardData, KudosFilters } from "./types";
import { isMissingTable } from "./errors";
import { normalizeRow, type RawKudosRow } from "./kudos-feed-normalizer";
import { heroRankFromSenderCount } from "./hero-rank";

// Embedded user_profiles via fk hint (`!kudos_from_user_fkey`) doesn't work:
// the fk on kudos.{from,to}_user references auth.users, not user_profiles.
// We fetch profiles + departments in a separate batch and merge in code.
const KUDOS_SELECT = `
  id,
  message,
  title,
  is_anonymous,
  anonymous_nickname,
  created_at,
  from_user,
  to_user,
  feature_hashtag:hashtags!kudos_hashtag_id_fkey(id, code, label_vi, kind, display_order),
  small_hashtags:kudos_hashtags(hashtag:hashtags(id, code, label_vi, kind, display_order)),
  images:kudos_images(storage_path, display_order),
  hearts:kudos_hearts(weight, user_id)
`.trim();

async function getAuthUserId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

/**
 * Kudos ids that carry the given hashtag as one of their small (value) hashtags.
 * The Hashtag filter dropdown lists the curated small hashtags (kudos_hashtags
 * join), NOT the feature/danh-hiệu column — so filtering resolves through here.
 */
async function kudosIdsWithHashtag(
  supabase: SupabaseClient,
  hashtagId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("kudos_hashtags")
    .select("kudos_id")
    .eq("hashtag_id", hashtagId);
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return Array.from(
    new Set((data ?? []).map((r) => (r as { kudos_id: string }).kudos_id))
  );
}

type ProfileShape = {
  user_id: string;
  full_name_vi: string | null;
  employee_code: string | null;
  title: string | null;
  avatar_url: string | null;
  department_code: string | null;
  department: {
    code: string;
    name_vi: string;
    display_order: number;
  } | null;
  /** Danh hiệu Hero — derived from distinct senders (null when 0). */
  hero_rank: string | null;
};

/**
 * Count DISTINCT senders per recipient for the given user ids, then map to a
 * Hero rank label. RLS "auth read all kudos" lets us read the full table.
 */
async function fetchHeroRanks(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<Map<string, string | null>> {
  const ranks = new Map<string, string | null>();
  if (userIds.length === 0) return ranks;

  const { data, error } = await supabase
    .from("kudos")
    .select("from_user, to_user")
    .in("to_user", userIds);
  if (error) {
    if (isMissingTable(error)) return ranks;
    throw error;
  }

  const senderSets = new Map<string, Set<string>>();
  for (const r of (data ?? []) as Array<{ from_user: string; to_user: string }>) {
    if (!r.to_user || !r.from_user) continue;
    let set = senderSets.get(r.to_user);
    if (!set) senderSets.set(r.to_user, (set = new Set()));
    set.add(r.from_user);
  }
  for (const id of userIds) {
    ranks.set(id, heroRankFromSenderCount(senderSets.get(id)?.size ?? 0));
  }
  return ranks;
}

/**
 * Fetch user_profiles + departments for the unique from_user/to_user ids
 * across the given rows. Returns a map keyed by user_id.
 */
async function hydrateProfileMap(
  supabase: SupabaseClient,
  rows: RawKudosRow[]
): Promise<Map<string, ProfileShape>> {
  const userIds = Array.from(
    new Set(
      rows
        .flatMap((r) => [r.from_user, r.to_user])
        .filter((id): id is string => Boolean(id))
    )
  );
  if (userIds.length === 0) return new Map();

  const { data: profilesRaw, error: profilesErr } = await supabase
    .from("user_profiles")
    .select(
      "user_id, full_name_vi, employee_code, title, avatar_url, department_code"
    )
    .in("user_id", userIds);

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
  const deptMap = new Map<string, { code: string; name_vi: string; display_order: number }>();
  if (deptCodes.length > 0) {
    const { data: deptsRaw, error: deptsErr } = await supabase
      .from("departments")
      .select("code, name_vi, display_order")
      .in("code", deptCodes);
    if (deptsErr && !isMissingTable(deptsErr)) throw deptsErr;
    for (const d of (deptsRaw ?? []) as Array<{
      code: string;
      name_vi: string;
      display_order: number;
    }>) {
      deptMap.set(d.code, d);
    }
  }

  const heroRanks = await fetchHeroRanks(supabase, userIds);

  const profileMap = new Map<string, ProfileShape>();
  for (const p of profiles) {
    profileMap.set(p.user_id, {
      ...p,
      department: p.department_code ? deptMap.get(p.department_code) ?? null : null,
      hero_rank: heroRanks.get(p.user_id) ?? null,
    });
  }
  return profileMap;
}

/** Hydrate sender/receiver on a raw row from the profile map. */
function attachProfiles(row: RawKudosRow, profileMap: Map<string, ProfileShape>): RawKudosRow {
  row.sender = profileMap.get(row.from_user) ?? null;
  row.receiver = profileMap.get(row.to_user) ?? null;
  return row;
}

/**
 * Returns the top 5 kudos ordered by heart_count descending.
 * Fetches the 50 most recent rows then sorts client-side by computed heart_count.
 */
export async function getHighlightKudos(
  supabase: SupabaseClient,
  filters?: KudosFilters
): Promise<KudosCardData[]> {
  const authUserId = await getAuthUserId(supabase);

  let query = supabase.from("kudos").select(KUDOS_SELECT);
  if (filters?.hashtag_id) {
    const ids = await kudosIdsWithHashtag(supabase, filters.hashtag_id);
    if (ids.length === 0) return [];
    query = query.in("id", ids);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  const rows = (data ?? []) as unknown as RawKudosRow[];
  const profileMap = await hydrateProfileMap(supabase, rows);
  for (const r of rows) attachProfiles(r, profileMap);

  const filtered = filters?.department_code
    ? rows.filter((r) => r.receiver?.department?.code === filters.department_code)
    : rows;

  const normalized = await Promise.all(
    filtered.map((row) => normalizeRow(supabase, row, authUserId))
  );

  return normalized.sort((a, b) => b.heart_count - a.heart_count).slice(0, 5);
}

/**
 * Cursor-based paginated feed. cursor = created_at ISO string of the last item seen.
 * Returns rows + nextCursor (null when no more pages).
 */
export async function getAllKudos(
  supabase: SupabaseClient,
  cursor?: string,
  limit = 10,
  filters?: KudosFilters
): Promise<{ rows: KudosCardData[]; nextCursor: string | null }> {
  const authUserId = await getAuthUserId(supabase);

  let query = supabase.from("kudos").select(KUDOS_SELECT);
  if (filters?.hashtag_id) {
    const ids = await kudosIdsWithHashtag(supabase, filters.hashtag_id);
    if (ids.length === 0) return { rows: [], nextCursor: null };
    query = query.in("id", ids);
  }
  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (error) {
    if (isMissingTable(error)) return { rows: [], nextCursor: null };
    throw error;
  }

  let rows = (data ?? []) as unknown as RawKudosRow[];
  const profileMap = await hydrateProfileMap(supabase, rows);
  for (const r of rows) attachProfiles(r, profileMap);

  if (filters?.department_code) {
    rows = rows.filter((r) => r.receiver?.department?.code === filters.department_code);
  }

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const normalized = await Promise.all(
    pageRows.map((row) => normalizeRow(supabase, row, authUserId))
  );

  return {
    rows: normalized,
    nextCursor: hasMore ? pageRows[pageRows.length - 1].created_at : null,
  };
}

/**
 * Cursor-based paginated feed scoped to ONE user — kudos they RECEIVED
 * (to_user) or SENT (from_user). Optional `year` narrows by created_at.
 * Same return shape as getAllKudos so KudosCard renders unchanged.
 */
export async function getUserKudos(
  supabase: SupabaseClient,
  userId: string,
  direction: "received" | "sent",
  opts?: { cursor?: string; limit?: number; year?: number }
): Promise<{ rows: KudosCardData[]; nextCursor: string | null }> {
  const { cursor, limit = 10, year } = opts ?? {};
  const authUserId = await getAuthUserId(supabase);
  const col = direction === "received" ? "to_user" : "from_user";

  let query = supabase.from("kudos").select(KUDOS_SELECT).eq(col, userId);
  if (typeof year === "number") {
    query = query
      .gte("created_at", `${year}-01-01T00:00:00.000Z`)
      .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`);
  }
  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (error) {
    if (isMissingTable(error)) return { rows: [], nextCursor: null };
    throw error;
  }

  const rows = (data ?? []) as unknown as RawKudosRow[];
  const profileMap = await hydrateProfileMap(supabase, rows);
  for (const r of rows) attachProfiles(r, profileMap);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  const normalized = await Promise.all(
    pageRows.map((row) => normalizeRow(supabase, row, authUserId))
  );

  return {
    rows: normalized,
    nextCursor: hasMore ? pageRows[pageRows.length - 1].created_at : null,
  };
}

/**
 * Distinct years (desc) in which the user received OR sent kudos — feeds the
 * awards year dropdown. Returns [] when the kudos table is missing.
 */
export async function getUserKudosYears(
  supabase: SupabaseClient,
  userId: string
): Promise<number[]> {
  const { data, error } = await supabase
    .from("kudos")
    .select("created_at")
    .or(`to_user.eq.${userId},from_user.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  const years = new Set<number>();
  for (const r of (data ?? []) as Array<{ created_at: string }>) {
    const y = new Date(r.created_at).getFullYear();
    if (!Number.isNaN(y)) years.add(y);
  }
  return Array.from(years).sort((a, b) => b - a);
}

/**
 * Fetch a single kudos card by id. Returns null when not found.
 */
export async function getKudosById(
  supabase: SupabaseClient,
  id: string
): Promise<KudosCardData | null> {
  const authUserId = await getAuthUserId(supabase);

  const { data, error } = await supabase
    .from("kudos")
    .select(KUDOS_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    if (isMissingTable(error)) return null;
    if (error.code === "PGRST116") return null; // row not found
    throw error;
  }

  if (!data) return null;
  const row = data as unknown as RawKudosRow;
  const profileMap = await hydrateProfileMap(supabase, [row]);
  attachProfiles(row, profileMap);
  return normalizeRow(supabase, row, authUserId);
}
