"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getKudosById, getHighlightKudos, getAllKudos, getUserKudos } from "@/lib/data/kudos-feed";
import { sanitizeKudosHtml, kudosHtmlPlainTextLength } from "@/lib/sanitize/kudos-html";
import type { KudosCardData, KudosFilters, UserProfile, SubmitKudosInput } from "@/lib/data/types";
import { pickRandomRewardIcon, getSecretBoxIcon } from "@/lib/sun-kudos/secret-box-icons";
import { getProfile, getProfileStats, getUserHeroRank } from "@/lib/data/profile";

// NOTE: A "use server" module may ONLY export async functions (Next.js 16).
// `SubmitKudosInput` is a type — import it from "@/lib/data/types" directly.
// Re-exporting it here previously caused: ReferenceError: SubmitKudosInput is
// not defined (the directive transform emitted a runtime server reference).

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Submit a kudos from the current authenticated user to another user.
 *
 * Validation error codes (thrown as Error messages):
 *   cannot_send_to_self   — to_user === auth.uid()
 *   invalid_title         — title empty or > 120 chars after trim
 *   invalid_message_length — plain-text content outside 1–1000 chars
 *   hashtag_required      — small_hashtag_ids is empty
 *   too_many_hashtags     — small_hashtag_ids.length > 5
 *   too_many_images       — image_paths.length > 5
 *   nickname_required     — is_anonymous=true but anonymous_nickname missing/empty or > 40 chars
 */
export async function submitKudos(
  input: SubmitKudosInput,
): Promise<{ id: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  // --- self-send guard ---
  if (input.to_user === user.id) throw new Error("cannot_send_to_self");

  // --- title validation (1–120 chars) ---
  const trimmedTitle = (input.title ?? "").trim();
  if (trimmedTitle.length < 1 || trimmedTitle.length > 120)
    throw new Error("invalid_title");

  // --- message: sanitize then validate plain-text length (1–1000) ---
  const sanitizedMessage = sanitizeKudosHtml(input.message ?? "");
  const plainTextLen = kudosHtmlPlainTextLength(sanitizedMessage);
  if (plainTextLen < 1 || plainTextLen > 1000)
    throw new Error("invalid_message_length");

  // --- small hashtags: required ≥1, max 5 ---
  if (!input.small_hashtag_ids || input.small_hashtag_ids.length === 0)
    throw new Error("hashtag_required");
  if (input.small_hashtag_ids.length > 5)
    throw new Error("too_many_hashtags");

  // --- images: max 5 ---
  if ((input.image_paths ?? []).length > 5)
    throw new Error("too_many_images");

  // --- anonymous nickname ---
  let resolvedNickname: string | null = null;
  if (input.is_anonymous) {
    const trimmedNickname = (input.anonymous_nickname ?? "").trim();
    if (trimmedNickname.length < 1 || trimmedNickname.length > 40)
      throw new Error("nickname_required");
    resolvedNickname = trimmedNickname;
  }

  // --- mentions: dedupe, drop self, cap at 20 ---
  const mentionIds = Array.from(
    new Set((input.mention_user_ids ?? []).filter((id) => id !== user.id))
  ).slice(0, 20);

  const { data, error } = await supabase.rpc("submit_kudos_atomic", {
    p_from_user:          user.id,
    p_to_user:            input.to_user,
    p_message:            sanitizedMessage,
    p_hashtag_id:         input.feature_hashtag_id ?? null,
    p_small_tags:         input.small_hashtag_ids,
    p_image_paths:        input.image_paths ?? [],
    p_title:              trimmedTitle,
    p_is_anonymous:       input.is_anonymous,
    p_anonymous_nickname: resolvedNickname,
    p_mention_ids:        mentionIds,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("submit_failed");

  revalidatePath("/sun-kudos");
  return { id: data as string };
}

/**
 * Toggle heart on a kudos card.
 * - Un-hearting reuses the stored weight from the original insert (not today's multiplier).
 * - Hearting uses the current special-day multiplier (default 1).
 * - A user cannot heart their own kudos.
 */
export async function toggleHeart(input: {
  kudos_id: string;
}): Promise<{ liked: boolean; heart_count: number; weight_applied: 1 | 2 }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  // Fetch kudos to verify sender
  const { data: kudosRow, error: kudosErr } = await supabase
    .from("kudos")
    .select("id, from_user")
    .eq("id", input.kudos_id)
    .maybeSingle();

  if (kudosErr) throw new Error(kudosErr.message);
  if (!kudosRow) throw new Error("kudos_not_found");
  if (kudosRow.from_user === user.id) throw new Error("cannot_like_own_kudos");

  // Check for existing heart
  const { data: existingHeart, error: heartFetchErr } = await supabase
    .from("kudos_hearts")
    .select("weight")
    .eq("kudos_id", input.kudos_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (heartFetchErr) throw new Error(heartFetchErr.message);

  let liked: boolean;
  let weightApplied: 1 | 2;

  if (existingHeart) {
    // Un-heart: use the stored weight for correctness, not today's multiplier
    weightApplied = (existingHeart.weight as 1 | 2) ?? 1;

    const { error: deleteErr } = await supabase
      .from("kudos_hearts")
      .delete()
      .eq("kudos_id", input.kudos_id)
      .eq("user_id", user.id);

    if (deleteErr) throw new Error(deleteErr.message);
    liked = false;
  } else {
    // Heart: get today's special-day multiplier
    const { data: specialDay } = await supabase
      .from("special_days")
      .select("multiplier")
      .lte("date_from", new Date().toISOString().slice(0, 10))
      .gte("date_to", new Date().toISOString().slice(0, 10))
      .order("multiplier", { ascending: false })
      .limit(1)
      .maybeSingle();

    const multiplier: 1 | 2 = (specialDay?.multiplier as 1 | 2) ?? 1;
    weightApplied = multiplier;

    const { error: insertErr } = await supabase.from("kudos_hearts").insert({
      kudos_id: input.kudos_id,
      user_id: user.id,
      weight: multiplier,
    });

    if (insertErr) throw new Error(insertErr.message);
    liked = true;
  }

  // Recompute total heart count from stored weights
  const { data: sumRow, error: sumErr } = await supabase
    .from("kudos_hearts")
    .select("weight")
    .eq("kudos_id", input.kudos_id);

  if (sumErr) throw new Error(sumErr.message);

  const heartCount = (sumRow ?? []).reduce(
    (acc, row) => acc + (row.weight as number),
    0,
  );

  revalidatePath("/sun-kudos");
  return { liked, heart_count: heartCount, weight_applied: weightApplied };
}

/**
 * Open a secret box owned by the current user. Awards a random one of the
 * exclusive SAA collectible icons and marks the box as opened. The won icon is
 * persisted (reward_icon) so it appears in the profile "Bộ sưu tập icon" row.
 */
export async function openSecretBox(input: {
  box_id: string;
}): Promise<{ reward_icon: number; reward_label_vi: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  // Fetch box and verify ownership
  const { data: box, error: boxErr } = await supabase
    .from("secret_boxes")
    .select("id, owner, status")
    .eq("id", input.box_id)
    .maybeSingle();

  if (boxErr) throw new Error(boxErr.message);
  if (!box || box.owner !== user.id) throw new Error("box_not_found");
  if (box.status !== "unopened") throw new Error("box_already_opened");

  // Award a random collectible icon using the weighted distribution from
  // SECRET_BOX_REWARD_WEIGHTS (spec C of MoMorph screen J3-4YFIpMM).
  const rewardIcon = pickRandomRewardIcon();
  const rewardLabel = getSecretBoxIcon(rewardIcon)?.label ?? `Icon ${rewardIcon}`;

  // .eq("status","unopened") guards against the SELECT-then-UPDATE race:
  // a concurrent second open (second tab, network retry) would otherwise
  // overwrite reward_icon silently. PostgREST returns the affected rows;
  // an empty array means another caller already opened this box.
  const { data: updated, error: updateErr } = await supabase
    .from("secret_boxes")
    .update({
      status: "opened",
      reward_icon: rewardIcon,
      reward_label_vi: rewardLabel,
      opened_at: new Date().toISOString(),
    })
    .eq("id", input.box_id)
    .eq("status", "unopened")
    .select("id");

  if (updateErr) throw new Error(updateErr.message);
  if (!updated || updated.length === 0) throw new Error("box_already_opened");

  revalidatePath("/sun-kudos");
  revalidatePath("/sun-kudos/profile");
  revalidatePath(`/sun-kudos/profile/${user.id}`);
  return { reward_icon: rewardIcon, reward_label_vi: rewardLabel };
}

// ---------------------------------------------------------------------------
// Phase 08 helper actions — used by LiveBoardClient for realtime + pagination
// ---------------------------------------------------------------------------

/**
 * Fetch a single kudos card by id (server-side, RLS-safe).
 * Called from the realtime INSERT callback so the full card
 * (including signed image URLs) is fetched before prepending to state.
 */
export async function fetchKudosCard(id: string): Promise<KudosCardData | null> {
  const supabase = await createClient();
  return getKudosById(supabase, id);
}

/**
 * Re-fetch the top-5 highlight kudos, optionally filtered.
 * Called after filter changes and after realtime inserts.
 */
export async function refetchHighlight(
  filters?: KudosFilters
): Promise<KudosCardData[]> {
  const supabase = await createClient();
  return getHighlightKudos(supabase, filters);
}

/**
 * Fetch a page of the kudos feed, optionally filtered and cursor-paginated.
 */
export async function refetchFeed(
  cursor?: string,
  filters?: KudosFilters
): Promise<{ rows: KudosCardData[]; nextCursor: string | null }> {
  const supabase = await createClient();
  return getAllKudos(supabase, cursor, 10, filters);
}

/**
 * Fetch a page of kudos — received or sent — optionally narrowed by year and
 * cursor-paginated. Powers the profile feed tabs.
 *
 * Authentication is always required. When `targetUserId` is a valid UUID it
 * selects that user's feed (public data, same as the live board). Any other
 * value — including undefined — falls back to the logged-in user's feed,
 * preserving full back-compat with existing self-profile callers.
 */
export async function refetchUserKudos(
  direction: "received" | "sent",
  cursor?: string,
  year?: number,
  targetUserId?: string
): Promise<{ rows: KudosCardData[]; nextCursor: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { rows: [], nextCursor: null };

  const isUuid = (s: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  const userId =
    targetUserId && isUuid(targetUserId) ? targetUserId : user.id;

  return getUserKudos(supabase, userId, direction, { cursor, year });
}

/**
 * Search user profiles by name or employee_code.
 * Used by the submit-kudos dialog recipient picker.
 */
export async function searchSunners(q: string): Promise<UserProfile[]> {
  if (!q || q.trim().length === 0) return [];
  const supabase = await createClient();

  // Auth gate — the user directory is searchable by signed-in users only.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // PostgREST parses the `.or()` argument as a comma-separated predicate list
  // (and percent-decodes the value before parsing it), so structural
  // metacharacters in user input can break out of the ilike filter and inject
  // extra predicates. Strip them before interpolation.
  const term = q.trim().replace(/[,()*%\\]/g, "");
  if (!term) return [];

  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      `user_id, full_name_vi, employee_code, title, avatar_url,
       department_code,
       department:departments(name_vi)`
    )
    .or(
      `full_name_vi.ilike.%${term}%,employee_code.ilike.%${term}%`
    )
    .limit(8);

  if (error) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: any): UserProfile => ({
    user_id: row.user_id,
    full_name_vi: row.full_name_vi ?? "",
    department_code: row.department_code ?? null,
    department_name_vi: row.department?.name_vi ?? null,
    employee_code: row.employee_code ?? null,
    title: row.title ?? null,
    avatar_url: row.avatar_url ?? null,
    tier: 0,
  }));
}

/**
 * Hover-card payload for an avatar — name/dept/title + Hero rank + counts.
 * Returns null when the userId is invalid or the profile cannot be read.
 */
export type AvatarHoverData = {
  profile: UserProfile;
  received: number;
  sent: number;
  hero_rank: string | null;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getAvatarHoverData(
  userId: string
): Promise<AvatarHoverData | null> {
  if (!userId || !UUID_REGEX.test(userId)) return null;
  const supabase = await createClient();
  // Auth gate — hover data is only available to signed-in users.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, stats, heroRank] = await Promise.all([
    getProfile(supabase, userId),
    getProfileStats(supabase, userId),
    getUserHeroRank(supabase, userId),
  ]);
  if (!profile) return null;
  return {
    profile,
    received: stats.received,
    sent: stats.sent,
    hero_rank: heroRank,
  };
}

/**
 * Fetch the first unopened secret box for the current user.
 * Returns null if none found.
 */
export async function getNextUnopenedBox(): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("secret_boxes")
    .select("id")
    .eq("owner", user.id)
    .eq("status", "unopened")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data ? { id: data.id as string } : null;
}
