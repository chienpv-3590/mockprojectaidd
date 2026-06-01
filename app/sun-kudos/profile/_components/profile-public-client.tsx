"use client";

/**
 * ProfilePublicClient — interactive shell for ANOTHER user's profile (read-only).
 *
 * Fixed direction = "received" (no tab toggle).
 * State: paginated feed rows (all years).
 * Calls refetchUserKudos("received", cursor?, targetUserId) (Phase B1 arg).
 */

import { useCallback, useState, useTransition } from "react";
import { ProfileStatsPanel } from "./profile-stats-panel";
import { ProfileAwardsHeader } from "./profile-awards-header";
import { ProfileKudosFeed } from "./profile-kudos-feed";
import { adaptKudosCards } from "@/app/_components/sun-kudos/_lib/kudos-adapter";
import { refetchUserKudos } from "@/app/_actions/sun-kudos";
import type { KudosCardData as DbCard } from "@/lib/data/types";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

export type ProfilePublicClientProps = {
  targetUserId: string;
  initialStats: {
    received: number;
    sent: number;
    hearts: number;
  };
  initialRows: DbCard[];
  initialNextCursor: string | null;
};

export function ProfilePublicClient({
  targetUserId,
  initialStats,
  initialRows,
  initialNextCursor,
}: ProfilePublicClientProps) {
  const [rows, setRows] = useState<KudosCardData[]>(() => adaptKudosCards(initialRows));
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isPending, startTransition] = useTransition();

  const handleLoadMore = useCallback(() => {
    if (!nextCursor || isPending) return;
    startTransition(async () => {
      try {
        const res = await refetchUserKudos("received", nextCursor, targetUserId);
        setRows((prev) => [...prev, ...adaptKudosCards(res.rows)]);
        setNextCursor(res.nextCursor);
      } catch {
        // Silent: keep existing rows
      }
    });
  }, [nextCursor, isPending, targetUserId]);

  return (
    <>
      {/* Section B — Stats panel (3 rows only, no secret box) */}
      <ProfileStatsPanel
        received={initialStats.received}
        sent={initialStats.sent}
        hearts={initialStats.hearts}
      />

      {/* Section C + D — Awards header + received feed */}
      <div className="flex flex-col" style={{ gap: "24px" }}>
        <ProfileAwardsHeader />
        <ProfileKudosFeed
          showTabs={false}
          activeTab="received"
          onTabChange={() => {
            /* no-op: public profile is received-only */
          }}
          rows={rows}
          onLoadMore={handleLoadMore}
          hasMore={!!nextCursor}
        />
      </div>
    </>
  );
}
