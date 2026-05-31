"use client";

/**
 * ProfileKudosFeed — Section D (mms_D_Post all)
 * Received / Sent tab toggle + vertical list of KudosCard (feed variant).
 * Infinite-scroll sentinel fires onLoadMore.
 *
 * Design: node 362:5091 — gap 24px column feed.
 * Tab toggle bar is NOT in the design but required by clarifications.md:
 *   "Feed KUDOS — cả nhận và gửi, có tab/toggle chuyển đổi"
 * (Year filtering lives in ProfileAwardsHeader; this feed only owns the tabs.)
 */

import { useEffect, useRef } from "react";
import { KudosCard } from "@/app/_components/sun-kudos/kudos-card";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

const FM = "var(--font-montserrat), system-ui, sans-serif";

export type ProfileKudosFeedProps = {
  activeTab: "received" | "sent";
  onTabChange: (tab: "received" | "sent") => void;
  rows: KudosCardData[];
  onLoadMore: () => void;
  hasMore: boolean;
  /**
   * When false the received/sent tab toggle row is hidden and a static "Đã nhận"
   * label is shown instead — used on other-user public profiles.
   * Defaults to true (self-profile behavior unchanged).
   */
  showTabs?: boolean;
};

export function ProfileKudosFeed({
  activeTab,
  onTabChange,
  rows,
  onLoadMore,
  hasMore,
  showTabs = true,
}: ProfileKudosFeedProps) {
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
      {/* Tab toggle row — shown on self profile; hidden on public profile */}
      {showTabs ? (
        <div
          role="tablist"
          aria-label="Loại Kudos"
          className="flex items-center"
          style={{
            gap: "0px",
            border: "1px solid #998C5F",
            borderRadius: "8px",
            overflow: "hidden",
            alignSelf: "flex-start",
          }}
        >
          <TabButton
            label="Đã nhận"
            active={activeTab === "received"}
            onClick={() => onTabChange("received")}
            id="tab-received"
            controls="panel-kudos"
          />
          <TabButton
            label="Đã gửi"
            active={activeTab === "sent"}
            onClick={() => onTabChange("sent")}
            id="tab-sent"
            controls="panel-kudos"
          />
        </div>
      ) : (
        /* Static "Đã nhận" label for public/other-user profiles */
        <p
          aria-label="Kudos đã nhận"
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "16px",
            lineHeight: "24px",
            color: "#FFFFFF",
            margin: 0,
          }}
        >
          Đã nhận
        </p>
      )}

      {/* Card list */}
      <div
        id="panel-kudos"
        role="tabpanel"
        aria-labelledby={activeTab === "received" ? "tab-received" : "tab-sent"}
        className="flex flex-col"
        style={{ gap: "24px" }}
      >
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

/* ------------------------------------------------------------------ */
/* Internal: TabButton                                                  */
/* ------------------------------------------------------------------ */
type TabButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  id: string;
  controls: string;
};

function TabButton({ label, active, onClick, id, controls }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      style={{
        fontFamily: FM,
        fontWeight: 700,
        fontSize: "16px",
        lineHeight: "24px",
        letterSpacing: "0.15px",
        color: active ? "#00101A" : "#FFFFFF",
        background: active ? "#FFEA9E" : "rgba(255,234,158,0.10)",
        padding: "12px 24px",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      {label}
    </button>
  );
}
