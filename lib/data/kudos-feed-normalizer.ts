/**
 * Internal normalizer — converts a raw PostgREST kudos row into KudosCardData.
 * Not exported from the public lib/data surface.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { KudosCardData } from "./types";
import { createSignedUrlsBatch } from "@/lib/storage/kudos-images";

export type RawKudosRow = {
  id: string;
  message: string;
  created_at: string;
  from_user: string;
  to_user: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sender: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  receiver: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feature_hashtag: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  small_hashtags: { hashtag: any }[];
  images: { storage_path: string; display_order: number }[];
  hearts: { weight: number; user_id: string }[];
};

type DeptHolder = {
  // Raw FK value on user_profiles — present even when the departments join misses.
  department_code?: string | null;
  department?: { code?: string; name_vi?: string; display_order?: number } | null;
};

function extractDept(profile: DeptHolder) {
  return {
    // Fall back to the raw department_code so the card shows the code (spec B.3.2)
    // even when the departments row isn't joined/resolved.
    department_code: profile?.department?.code ?? profile?.department_code ?? null,
    department_name_vi: profile?.department?.name_vi ?? null,
  };
}

export async function normalizeRow(
  supabase: SupabaseClient,
  row: RawKudosRow,
  authUserId: string | null
): Promise<KudosCardData> {
  const heartCount = (row.hearts ?? []).reduce(
    (sum: number, h: { weight: number }) => sum + (h.weight ?? 0),
    0
  );
  const likedByMe = authUserId
    ? (row.hearts ?? []).some((h: { user_id: string }) => h.user_id === authUserId)
    : false;
  const canLike = authUserId ? authUserId !== row.from_user : false;

  const storagePaths = (row.images ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => img.storage_path);

  let signedUrls: string[] = [];
  if (storagePaths.length > 0) {
    signedUrls = await createSignedUrlsBatch(supabase, storagePaths);
  }

  return {
    id: row.id,
    message: row.message,
    created_at: row.created_at,
    sender: {
      user_id: row.sender?.user_id ?? row.from_user,
      full_name_vi: row.sender?.full_name_vi ?? "",
      employee_code: row.sender?.employee_code ?? null,
      title: row.sender?.title ?? null,
      hero_rank: row.sender?.hero_rank ?? null,
      avatar_url: row.sender?.avatar_url ?? null,
      tier: 0,
      ...extractDept(row.sender ?? {}),
    },
    receiver: {
      user_id: row.receiver?.user_id ?? row.to_user,
      full_name_vi: row.receiver?.full_name_vi ?? "",
      employee_code: row.receiver?.employee_code ?? null,
      title: row.receiver?.title ?? null,
      hero_rank: row.receiver?.hero_rank ?? null,
      avatar_url: row.receiver?.avatar_url ?? null,
      tier: 0,
      ...extractDept(row.receiver ?? {}),
    },
    feature_hashtag: row.feature_hashtag ?? null,
    small_hashtags: (row.small_hashtags ?? []).map((kh) => kh.hashtag).filter(Boolean),
    images: storagePaths.map((path, i) => ({
      storage_path: path,
      signed_url: signedUrls[i] ?? "",
    })),
    heart_count: heartCount,
    liked_by_me: likedByMe,
    can_like: canLike,
  };
}
