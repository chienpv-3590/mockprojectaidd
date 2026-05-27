import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "kudos-images";
const DEFAULT_EXPIRES_IN = 3600;

function extFromContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[contentType.toLowerCase()] ?? "jpg";
}

/**
 * Upload a kudos image to the kudos-images bucket.
 * Path: `${kudosId}/${index}.${ext}` — index is epoch ms to keep ordering.
 */
export async function uploadKudosImage(
  supabase: SupabaseClient,
  kudosId: string,
  fileBuffer: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<{ path: string }> {
  const ext = extFromContentType(contentType);
  const path = `${kudosId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) throw error;
  return { path };
}

/**
 * Get a signed URL for a single storage path.
 */
export async function getKudosImageSignedUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn = DEFAULT_EXPIRES_IN
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  if (!data?.signedUrl) throw new Error(`No signed URL returned for path: ${path}`);
  return data.signedUrl;
}

/**
 * Batch-sign multiple storage paths in one round-trip.
 * Returns signed URLs in the same order as the input paths.
 * Missing or errored entries fall back to an empty string.
 */
export async function createSignedUrlsBatch(
  supabase: SupabaseClient,
  paths: string[],
  expiresIn = DEFAULT_EXPIRES_IN
): Promise<string[]> {
  if (paths.length === 0) return [];

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, expiresIn);

  if (error) throw error;

  // `data` is an array of { path, signedUrl, error } — keep original order
  const urlByPath = new Map<string, string>();
  for (const item of data ?? []) {
    if (item.signedUrl && item.path != null) urlByPath.set(item.path, item.signedUrl);
  }

  return paths.map((p) => urlByPath.get(p) ?? "");
}
