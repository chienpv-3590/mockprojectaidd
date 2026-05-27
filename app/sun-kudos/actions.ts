"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getKudosById, getHighlightKudos, getAllKudos } from "@/lib/data/kudos-feed";
import type { KudosCardData, KudosFilters, UserProfile } from "@/lib/data/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubmitKudosInput = {
  to_user: string;
  message: string;
  feature_hashtag_id: string;
  small_hashtag_ids: string[]; // 0..5
  image_paths: string[]; // 0..5 already uploaded storage paths
};

// ---------------------------------------------------------------------------
// Reward pool for secret boxes
// ---------------------------------------------------------------------------

const REWARDS = [
  "1 áo phông SAA",
  "Voucher cafe 100k",
  "Mũ SAA 2025",
  "Sticker pack",
  "Voucher lunch 200k",
];

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Submit a kudos from the current authenticated user to another user.
 * Calls the atomic Postgres RPC to insert kudos + hashtags + images
 * in a single transaction and awards secret_boxes at milestones.
 */
export async function submitKudos(
  input: SubmitKudosInput,
): Promise<{ id: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  // Validate inputs
  if (input.to_user === user.id) throw new Error("cannot_send_to_self");
  if (!input.message || input.message.length < 1 || input.message.length > 2000)
    throw new Error("invalid_message_length");
  if (input.small_hashtag_ids.length > 5) throw new Error("too_many_hashtags");
  if (input.image_paths.length > 5) throw new Error("too_many_images");

  const { data, error } = await supabase.rpc("submit_kudos_atomic", {
    p_from_user: user.id,
    p_to_user: input.to_user,
    p_message: input.message,
    p_hashtag_id: input.feature_hashtag_id,
    p_small_tags: input.small_hashtag_ids,
    p_image_paths: input.image_paths,
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
 * Open a secret box owned by the current user.
 * Picks a random reward from the hardcoded pool and marks the box as opened.
 */
export async function openSecretBox(input: {
  box_id: string;
}): Promise<{ reward_label_vi: string }> {
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

  // Pick a random reward
  const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];

  const { error: updateErr } = await supabase
    .from("secret_boxes")
    .update({
      status: "opened",
      reward_label_vi: reward,
      opened_at: new Date().toISOString(),
    })
    .eq("id", input.box_id);

  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/sun-kudos");
  return { reward_label_vi: reward };
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
 * Search user profiles by name or employee_code.
 * Used by the submit-kudos dialog recipient picker.
 */
export async function searchSunners(q: string): Promise<UserProfile[]> {
  if (!q || q.trim().length === 0) return [];
  const supabase = await createClient();

  const term = q.trim();
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
