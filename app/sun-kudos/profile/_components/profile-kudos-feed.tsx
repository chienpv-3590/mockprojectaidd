"use client";

/**
 * ProfileKudosFeed — Section D (mms_D_Post all)
 * Vertical list of KudosCard (feed variant) + infinite-scroll sentinel.
 *
 * Design: node 362:5091 — gap 24px column feed.
 *
 * The received/sent switch is NOT part of this list — per the design it lives
 * in the Section C header as the "Đã gửi (N)" dropdown (ProfileFeedSelector,
 * node 362:5089). This component only renders the resulting cards.
 */

import { useEffect, useRef } from "react";
import { KudosCard } from "@/app/_components/sun-kudos/kudos-card";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

const FM = "var(--font-montserrat), system-ui, sans-serif";

export type ProfileKudosFeedProps = {
  rows: KudosCardData[];
  onLoadMore: () => void;
  hasMore: boolean;
};

export function ProfileKudosFeed({ rows, onLoadMore, hasMore }: ProfileKudosFeedProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Infinite-scroll observer */
  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <section
      aria-label="Danh sách Kudos"
      className="flex flex-col"
      style={{ gap: "24px" }}
    >
      {/* Card list */}
      <div className="flex flex-col" style={{ gap: "24px" }}>
        {rows.length === 0 ? (
          <p
            style={{
              fontFamily: FM,
              fontSize: "15px",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Hiện tại chưa có Kudos nào.
          </p>
        ) : (
          rows.map((card) => (
            <KudosCard key={card.id} data={card} variant="feed" />
          ))
        )}
      </div>

      {/* Infinite-scroll sentinel */}
      <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
    </section>
  );
}
