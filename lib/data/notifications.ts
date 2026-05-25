import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppNotification } from "./types";
import { isMissingTable } from "./errors";

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 10,
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as AppNotification[];
}

export async function getUnreadCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) {
    if (isMissingTable(error)) return 0;
    throw error;
  }
  return count ?? 0;
}

export async function markAllReadForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) {
    if (isMissingTable(error)) return; // nothing to mark — table doesn't exist yet
    throw error;
  }
}
