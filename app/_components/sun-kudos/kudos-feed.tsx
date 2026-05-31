"use client";

import { useEffect, useRef } from "react";
import type { KudosCardData } from "./types";
import { KudosCard } from "./kudos-card";
import { KudosSectionHeader } from "./kudos-section-header";

type KudosFeedProps = {
  initialKudos: KudosCardData[];
  /** Called when the infinite-scroll sentinel enters the viewport.
   *  Phase 08 wires this to load the next page from Supabase. */
  onLoadMore?: () => void;
  onHeartToggle?: (id: string) => void;
  /** Copy-link handler (shows the shared success toast — same as Highlight). */
  onCopyLink?: (id: string) => void;
  /** Open the kudos detail popup (no page navigation). */
  onViewDetail?: (id: string) => void;
};

/**
 * KudosFeed — C_All kudos left column (node 2940:13482).
 *
 * Design (C.1_Header Giải thưởng, node 2940:14221):
 *   - Same section header pattern: "Sun* Annual Awards 2025" + divider +
 *     "ALL KUDOS" (57px yellow)
 *   - Vertical list of feed-variant KudosCard components
 *   - Infinite-scroll sentinel div at the bottom (IntersectionObserver).
 *     No actual fetch in Phase 04 — sentinel fires onLoadMore which is a no-op
 *     until Phase 08 provides a real handler.
 *
 * Empty state: "Hiện tại chưa có Kudos nào." (per clarifications.md)
 */
export function KudosFeed({
  initialKudos,
  onLoadMore,
  onHeartToggle,
  onCopyLink,
  onViewDetail,
}: KudosFeedProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite-scroll observer — fires onLoadMore when sentinel enters viewport.
  useEffect(() => {
    if (!onLoadMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onLoadMore]);

  return (
    <section aria-labelledby="all-kudos-heading" className="flex flex-col gap-6">
      {/* Section header */}
      <KudosSectionHeader title="ALL KUDOS" id="all-kudos-heading" />

      {/* Card list */}
      {initialKudos.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-montserrat), system-ui, sans-serif",
            fontSize: "15px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Hiện tại chưa có Kudos nào.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {initialKudos.map((card) => (
            <KudosCard
              key={card.id}
              data={card}
              variant="feed"
              onHeartToggle={onHeartToggle}
              onCopyLink={onCopyLink}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      )}

      {/* Infinite-scroll sentinel */}
      <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
    </section>
  );
}
