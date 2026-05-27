import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

type HeartChange = {
  kudos_id: string;
  user_id: string;
  weight: number;
  deleted: boolean;
};

/**
 * Subscribe to new kudos INSERT events.
 * Returns the channel so callers can call `.unsubscribe()` on unmount.
 *
 * NOTE: Realtime must be enabled in the Supabase Dashboard for `public.kudos`.
 * Go to Database → Replication → Tables and toggle `kudos` on.
 */
export function subscribeToKudos(
  supabase: SupabaseClient,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInsert: (row: Record<string, any>) => void
): RealtimeChannel {
  return supabase
    .channel("realtime:kudos")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "kudos" },
      (payload) => onInsert(payload.new)
    )
    .subscribe();
}

/**
 * Subscribe to kudos_hearts INSERT and DELETE events.
 * Returns the channel so callers can call `.unsubscribe()` on unmount.
 *
 * NOTE: Realtime must be enabled in the Supabase Dashboard for `public.kudos_hearts`.
 * Go to Database → Replication → Tables and toggle `kudos_hearts` on.
 */
export function subscribeToHearts(
  supabase: SupabaseClient,
  onChange: (row: HeartChange) => void
): RealtimeChannel {
  return supabase
    .channel("realtime:kudos_hearts")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "kudos_hearts" },
      (payload) => onChange({ ...(payload.new as Omit<HeartChange, "deleted">), deleted: false })
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "kudos_hearts" },
      (payload) => onChange({ ...(payload.old as Omit<HeartChange, "deleted">), deleted: true })
    )
    .subscribe();
}
