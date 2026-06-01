"use client";

/**
 * ProfileSelfClient — interactive half of /sun-kudos/profile (Phase 03).
 *
 * Holds the client state the static Track-A components need wired:
 *   - stats (secret-box counts mutate after opening a box)
 *   - feed rows + cursor (received/sent tab, infinite scroll)
 *
 * Server data arrives as DB-shape rows; we adapt to the UI card shape with the
 * SAME adapter the live board uses (DRY). Server actions resolve the user
 * server-side — no client-supplied id is trusted.
 */

import { useCallback, useState, useTransition } from "react";
import { ProfileStatsPanel } from "./profile-stats-panel";
import { ProfileAwardsHeader } from "./profile-awards-header";
import { ProfileKudosFeed } from "./profile-kudos-feed";
import { SecretBoxOpenDialog } from "@/app/_components/sun-kudos/secret-box-open-dialog";
import { useToast } from "@/app/_components/sun-kudos/_lib/use-toast";
import { ToastContainer } from "@/app/_components/sun-kudos/_lib/toast-container";
import { adaptKudosCards } from "@/app/_components/sun-kudos/_lib/kudos-adapter";
import {
  refetchUserKudos,
  getNextUnopenedBox,
  openSecretBox,
} from "@/app/_actions/sun-kudos";
import type { KudosCardData as DbCard } from "@/lib/data/types";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

type Stats = {
  received: number;
  sent: number;
  hearts: number;
  boxOpened: number;
  boxUnopened: number;
};

export type ProfileSelfClientProps = {
  initialStats: Stats;
  initialRows: DbCard[];
  initialNextCursor: string | null;
};

export function ProfileSelfClient({
  initialStats,
  initialRows,
  initialNextCursor,
}: ProfileSelfClientProps) {
  const { toasts, show: showToast, dismiss: dismissToast } = useToast();
  const [stats, setStats] = useState<Stats>(initialStats);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [rows, setRows] = useState<KudosCardData[]>(() => adaptKudosCards(initialRows));
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isPending, startTransition] = useTransition();
  const [isBoxDialogOpen, setIsBoxDialogOpen] = useState(false);
  const [revealedIconId, setRevealedIconId] = useState<number | null>(null);
  const [isBoxRolling, setIsBoxRolling] = useState(false);

  /** Reset the feed for a given tab. */
  const reload = useCallback(
    (tab: "received" | "sent") => {
      startTransition(async () => {
        try {
          const res = await refetchUserKudos(tab);
          setRows(adaptKudosCards(res.rows));
          setNextCursor(res.nextCursor);
        } catch {
          showToast("Không thể tải Kudos, vui lòng thử lại.", "error");
        }
      });
    },
    [showToast]
  );

  const handleTabChange = useCallback(
    (tab: "received" | "sent") => {
      setActiveTab(tab);
      reload(tab);
    },
    [reload]
  );

  const handleLoadMore = useCallback(() => {
    // Guard against the IntersectionObserver firing again before the in-flight
    // page resolves — otherwise the same cursor appends duplicate cards.
    if (!nextCursor || isPending) return;
    startTransition(async () => {
      try {
        const res = await refetchUserKudos(activeTab, nextCursor);
        setRows((prev) => [...prev, ...adaptKudosCards(res.rows)]);
        setNextCursor(res.nextCursor);
      } catch {
        showToast("Không thể tải thêm Kudos.", "error");
      }
    });
  }, [nextCursor, isPending, activeTab, showToast]);

  /** Open the modal in closed state — no roll yet; user clicks the box image to roll. */
  const handleOpenSecretBox = useCallback(() => {
    if (stats.boxUnopened === 0) {
      showToast("Bạn không có Secret Box chưa mở.", "error");
      return;
    }
    setRevealedIconId(null);
    setIsBoxDialogOpen(true);
  }, [stats.boxUnopened, showToast]);

  /** Click on the closed (or revealed) box inside the dialog → roll next box. */
  const handleBoxClick = useCallback(async () => {
    if (stats.boxUnopened === 0 || isBoxRolling) return;
    setIsBoxRolling(true);
    try {
      const box = await getNextUnopenedBox();
      if (!box) {
        showToast("Không tìm thấy Secret Box.", "error");
        setIsBoxDialogOpen(false);
        return;
      }
      const result = await openSecretBox({ box_id: box.id });
      setStats((prev) => ({
        ...prev,
        boxUnopened: Math.max(0, prev.boxUnopened - 1),
        boxOpened: prev.boxOpened + 1,
      }));
      setRevealedIconId(result.reward_icon);
    } catch {
      showToast("Không thể mở Secret Box, vui lòng thử lại.", "error");
      setIsBoxDialogOpen(false);
    } finally {
      setIsBoxRolling(false);
    }
  }, [stats.boxUnopened, isBoxRolling, showToast]);

  const handleBoxDialogClose = useCallback(() => {
    setIsBoxDialogOpen(false);
    setRevealedIconId(null);
  }, []);

  return (
    <>
      <ProfileStatsPanel
        received={stats.received}
        sent={stats.sent}
        hearts={stats.hearts}
        boxOpened={stats.boxOpened}
        boxUnopened={stats.boxUnopened}
        onOpenSecretBox={handleOpenSecretBox}
      />

      <div className="flex flex-col" style={{ gap: "24px" }}>
        <ProfileAwardsHeader />
        <ProfileKudosFeed
          activeTab={activeTab}
          onTabChange={handleTabChange}
          rows={rows}
          onLoadMore={handleLoadMore}
          hasMore={!!nextCursor}
        />
      </div>

      <SecretBoxOpenDialog
        open={isBoxDialogOpen}
        unopened={stats.boxUnopened}
        revealedIconId={revealedIconId}
        isPending={isBoxRolling}
        onBoxClick={handleBoxClick}
        onClose={handleBoxDialogClose}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
