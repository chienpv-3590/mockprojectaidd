"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subscribeToKudos, subscribeToHearts } from "@/lib/realtime/kudos-channel";
import type { KudosCardData } from "../types";

type UseRealtimeSubscriptionsParams = {
  supabase: SupabaseClient;
  currentUserId: string;
  /** Called with a fetched full card when a new kudos INSERT arrives. */
  onNewKudos: (card: KudosCardData) => void;
  /** Called when a heart INSERT or DELETE arrives. */
  onHeartChange: (kudosId: string, delta: number, byCurrentUser: boolean) => void;
};

/**
 * Mounts Supabase Realtime subscriptions for kudos INSERT and
 * kudos_hearts INSERT/DELETE. Unsubscribes on unmount.
 *
 * The caller is responsible for fetching the full card via fetchKudosCard
 * and passing it to onNewKudos. This hook only wires the channel plumbing.
 */
export function useRealtimeSubscriptions({
  supabase,
  currentUserId,
  onNewKudos,
  onHeartChange,
}: UseRealtimeSubscriptionsParams): void {
  // Use refs so callbacks don't cause channel re-subscription on every render.
  // Mutations go inside useLayoutEffect to satisfy react-compiler constraints.
  const onNewKudosRef = useRef(onNewKudos);
  const onHeartChangeRef = useRef(onHeartChange);
  useLayoutEffect(() => { onNewKudosRef.current = onNewKudos; });
  useLayoutEffect(() => { onHeartChangeRef.current = onHeartChange; });

  // Debounce map: kudos_id → timer handle — coalesces rapid heart updates
  const heartDebounceMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const kudosChannel = subscribeToKudos(supabase, (row) => {
      // The caller wires fetchKudosCard and calls onNewKudos; we pass the raw id
      // through a synthetic card so the parent can fetch the full shape.
      const syntheticId = row.id as string;
      // Signal via onNewKudos with a placeholder — parent checks id and fetches real card
      onNewKudosRef.current({ __rawId: syntheticId } as unknown as KudosCardData);
    });

    const heartsChannel = subscribeToHearts(supabase, ({ kudos_id, user_id, weight, deleted }) => {
      const existing = heartDebounceMap.current.get(kudos_id);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        heartDebounceMap.current.delete(kudos_id);
        const delta = deleted ? -(weight ?? 1) : (weight ?? 1);
        const byCurrentUser = user_id === currentUserId;
        onHeartChangeRef.current(kudos_id, delta, byCurrentUser);
      }, 80); // 80ms debounce — coalesces bursts

      heartDebounceMap.current.set(kudos_id, timer);
    });

    // Capture the map reference at effect-mount time for safe cleanup
    const debounceMap = heartDebounceMap.current;
    return () => {
      kudosChannel.unsubscribe();
      heartsChannel.unsubscribe();
      // Clear all pending debounce timers
      for (const t of debounceMap.values()) clearTimeout(t);
      debounceMap.clear();
    };
  }, [supabase, currentUserId]);
}
