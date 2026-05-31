"use client";

/**
 * ProfilePublicClient — interactive shell for ANOTHER user's profile (read-only).
 *
 * Fixed direction = "received" (no tab toggle).
 * State: year + paginated feed rows.
 * Calls refetchUserKudos("received", cursor?, year?, targetUserId) (Phase B1 arg).
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
  years: number[];
  initialYear: number;
};

export function ProfilePublicClient({
  targetUserId,
  initialStats,
  initialRows,
  initialNextCursor,
  years,
  initialYear,
}: ProfilePublicClientProps) {
  const [year, setYear] = useState<number>(initialYear);
  const [rows, setRows] = useState<KudosCardData[]>(() => adaptKudosCards(initialRows));
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isPending, startTransition] = useTransition();

  /** Reload received kudos for the target user when year changes. */
  const reload = useCallback(
    (yr: number) => {
      startTransition(async () => {
        try {
          const res = await refetchUserKudos("received", undefined, yr, targetUserId);
          setRows(adaptKudosCards(res.rows));
          setNextCursor(res.nextCursor);
        } catch {
          // Silent: feed stays at previous state; no toast on public profile
        }
      });
    },
    [targetUserId]
  );

  const handleYearChange = useCallback(
    (yr: number) => {
      setYear(yr);
      reload(yr);
    },
    [reload]
  );

  const handleLoadMore = useCallback(() => {
    if (!nextCursor || isPending) return;
    startTransition(async () => {
      try {
        const res = await refetchUserKudos("received", nextCursor, year, targetUserId);
        setRows((prev) => [...prev, ...adaptKudosCards(res.rows)]);
        setNextCursor(res.nextCursor);
      } catch {
        // Silent: keep existing rows
      }
    });
  }, [nextCursor, isPending, year, targetUserId]);

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
        <ProfileAwardsHeader years={years} year={year} onYearChange={handleYearChange} />
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
