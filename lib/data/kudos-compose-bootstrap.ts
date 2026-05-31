import type { SupabaseClient } from "@supabase/supabase-js";
import type { Department, Hashtag } from "./types";
import { listDepartments } from "./departments";
import { listFeatureHashtags, listSmallHashtags } from "./hashtags";

/**
 * Bootstrap payload for the global Floating Action Button's "Viết KUDOS"
 * popup. Mirrors the four bits of state the live-board page already passes
 * to `<SubmitKudosDialog>` so the FAB-mounted dialog can render anywhere:
 *
 *   - currentUserId    : path-prefix required by the kudos-images storage
 *                        RLS INSERT policy (the bucket enforces auth.uid()
 *                        === first segment of the object name).
 *   - smallHashtags    : chip picker source (≥1 required by the form).
 *   - featureHashtags  : larger "feature" labels (currently optional in the
 *                        dialog UI; kept for forward-compat).
 *   - departments      : recipient-picker department filter.
 *
 * Loaded once at the root layout (only for authed users) and handed to
 * `<GlobalKudosFab>` as a plain serializable prop.
 */
export type KudosComposeBootstrap = {
  currentUserId: string;
  smallHashtags: Hashtag[];
  featureHashtags: Hashtag[];
  departments: Department[];
};

/**
 * Fetch all bootstrap data in parallel. Callers pass an already-authed
 * supabase server client + the resolved user id (so we don't repeat
 * `auth.getUser()` from the layout's earlier check).
 */
export async function loadKudosComposeBootstrap(
  supabase: SupabaseClient,
  userId: string,
): Promise<KudosComposeBootstrap> {
  const [smallHashtags, featureHashtags, departments] = await Promise.all([
    listSmallHashtags(supabase),
    listFeatureHashtags(supabase),
    listDepartments(supabase),
  ]);
  return {
    currentUserId: userId,
    smallHashtags,
    featureHashtags,
    departments,
  };
}
