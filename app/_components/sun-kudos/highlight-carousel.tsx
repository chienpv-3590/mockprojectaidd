"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Department, Hashtag } from "@/lib/data/types";
import type { KudosCardData } from "./types";
import { KudosCard } from "./kudos-card";
import { KudosSectionHeader } from "./kudos-section-header";
import { FilterDropdown } from "./filter-dropdown";

const FM = "var(--font-montserrat), system-ui, sans-serif";

type HighlightCarouselProps = {
  kudos: KudosCardData[];
  /** Options for the Hashtag filter dropdown (the curated small hashtags). */
  hashtags?: Hashtag[];
  /** Options for the Phòng ban filter dropdown. */
  departments?: Department[];
  selectedHashtagId?: string;
  selectedDepartmentCode?: string;
  onSelectHashtag?: (id: string | null) => void;
  onSelectDepartment?: (code: string | null) => void;
  onHeartToggle?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onViewDetail?: (id: string) => void;
};

/**
 * HighlightCarousel — B_Highlight section (node 2940:13451).
 *
 * - B.1_header: section title "HIGHLIGHT KUDOS" + Hashtag + Phòng ban dropdowns.
 * - B.2_HIGHLIGHT KUDOS: horizontal carousel. ALL cards stay at scale 1.0 (no
 *   resize) — only opacity differentiates: center 1.0, dist 1 = 0.55, dist 2 =
 *   0.25. The dim cards on each side serve as preview slots ("2 bên để mờ").
 *   B.2.1 + B.2.2: large round chevron buttons overlaid on the dim side cards.
 * - B.5_slide: compact pagination row below: `‹ 2/5 ›` (small chevrons,
 *   bold-gold current page + light "/total"). Same function as the edge
 *   arrows; both stay disabled at their respective boundaries.
 *
 * Section header markup delegated to KudosSectionHeader (shared component).
 */
export function HighlightCarousel({
  kudos,
  hashtags = [],
  departments = [],
  selectedHashtagId,
  selectedDepartmentCode,
  onSelectHashtag,
  onSelectDepartment,
  onHeartToggle,
  onCopyLink,
  onViewDetail,
}: HighlightCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(Math.floor(kudos.length / 2));
  // Pause auto-advance while the user hovers the carousel.
  const [paused, setPaused] = useState(false);
  // Only one filter dropdown open at a time.
  const [openFilter, setOpenFilter] = useState<"hashtag" | "department" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = kudos.length;

  // Re-center the carousel whenever the result-set SIZE changes (filter applied
  // — spec B.1: "đặt pagination về 1"). Keying on `kudos.length` instead of the
  // array reference avoids a snap-back when a realtime INSERT or heart update
  // produces a same-size new array while the user is browsing.
  useEffect(() => {
    setActiveIndex(Math.floor(kudos.length / 2));
  }, [kudos.length]);

  // Keep the scroll position aligned with the active card. Runs on first mount
  // (so the initial center card sits visually centered) and on every index
  // change from clicks/auto-advance.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[activeIndex] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({
      left: card.offsetLeft - (track.offsetWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [activeIndex, total]);

  // Auto-advance every 5s; pauses on hover and when there is ≤1 card.
  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % total);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, total]);

  const scrollToIndex = useCallback(
    (idx: number) => setActiveIndex(Math.max(0, Math.min(total - 1, idx))),
    [total]
  );

  // B.1 spec lists exactly Hashtag (B.1.1) + Phòng ban (B.1.2). A standalone
  // "clear filters" chip from the previous iteration was removed — re-clicking
  // the active dropdown option already clears the filter (see FilterDropdown).
  const filterChipsSlot = (
    <div className="flex items-center gap-2">
      <FilterDropdown
        label="Hashtag"
        prefix="#"
        align="left"
        options={hashtags.map((h) => ({ value: h.id, label: h.label_vi }))}
        selectedValue={selectedHashtagId}
        open={openFilter === "hashtag"}
        onOpenChange={(o) => setOpenFilter(o ? "hashtag" : null)}
        onSelect={(v) => onSelectHashtag?.(v)}
      />
      <FilterDropdown
        label="Phòng ban"
        align="center"
        options={departments.map((d) => ({ value: d.code, label: d.name_vi }))}
        selectedValue={selectedDepartmentCode}
        open={openFilter === "department"}
        onOpenChange={(o) => setOpenFilter(o ? "department" : null)}
        onSelect={(v) => onSelectDepartment?.(v)}
      />
    </div>
  );

  return (
    <section aria-labelledby="highlight-kudos-heading" className="w-full">
      {/* Section header — px-36 at lg+ */}
      <div className="px-6 sm:px-10 lg:px-36">
        <div className="mx-auto max-w-[1152px]">
          <KudosSectionHeader
            title="HIGHLIGHT KUDOS"
            id="highlight-kudos-heading"
            rightSlot={filterChipsSlot}
          />
        </div>
      </div>

      {/* Carousel track — full-bleed. Hover/focus pauses the auto-advance so
          the user can read the active card. Navigation controls now live in
          the B.5 bar below; edge-floating arrows have been removed. */}
      <div
        className="relative mt-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* Scrollable card track. Up to two dim cards are visible per side
            (dist 1 + 2). `items-stretch` makes every visible card take the
            height of the tallest one so a short-content card ("Hay" + 3 tags)
            doesn't appear smaller than its neighbours. */}
        <div ref={trackRef}
          className="flex items-stretch gap-6 overflow-x-auto px-6 pb-4 sm:px-10 lg:px-36"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {kudos.map((card, idx) => {
            const dist = Math.abs(idx - activeIndex);
            const isActive = dist === 0;
            // Design B.2: all cards render at the SAME native size (no scaling)
            // so the active card doesn't look smaller than it should. Only
            // opacity differentiates: dist 1 → 0.55, dist 2 → 0.25. Cards
            // farther than dist 2 use `display: none` so they don't reserve
            // flex-track width.
            const isFar = dist > 2;
            const opacity = isActive ? 1 : dist === 1 ? 0.55 : 0.25;
            return (
              <div key={card.id}
                aria-hidden={!isActive}
                // `flex` on the wrapper lets the inner <article> stretch to
                // the wrapper height that `items-stretch` on the track gives it.
                className="flex shrink-0 transition-opacity duration-300 [&>article]:h-full [&>article]:w-full"
                style={{
                  display: isFar ? "none" : undefined,
                  width: "clamp(360px, 42vw, 600px)",
                  opacity,
                  pointerEvents: isActive ? "auto" : "none",
                }}>
                <KudosCard data={card} variant="highlight"
                  onHeartToggle={onHeartToggle}
                  onCopyLink={onCopyLink}
                  onViewDetail={onViewDetail} />
              </div>
            );
          })}
        </div>

        {/* Dark gradient overlays (design nodes 2940:13469 left + 2940:13467
            right): fade #00101A → transparent so dim side cards blend into the
            page background. pointer-events:none keeps the center card
            interactive. Sits below the edge arrows (z-[5] vs z-10). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-[25%] max-w-[300px]"
          style={{ background: "linear-gradient(90deg, #00101A 60%, rgba(0,16,26,0) 100%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-[25%] max-w-[300px]"
          style={{ background: "linear-gradient(270deg, #00101A 60%, rgba(0,16,26,0) 100%)" }}
        />

        {/* B.2.1 — prev arrow overlaid on the LEFT dim card area. Same nav
            function as B.5.1 but sits at the carousel edge per design. Hidden
            when there is only one card. */}
        {total > 1 && (
          <button type="button" aria-label="Slide trước"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex items-center justify-center rounded-full transition hover:bg-white/10 disabled:cursor-default disabled:opacity-30 lg:left-16"
            style={{
              width: 48, height: 48,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path d="M17 21l-7-7 7-7" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* B.2.2 — next arrow overlaid on the RIGHT dim card area. */}
        {total > 1 && (
          <button type="button" aria-label="Slide tiếp theo"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex >= total - 1}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex items-center justify-center rounded-full transition hover:bg-white/10 disabled:cursor-default disabled:opacity-30 lg:right-16"
            style={{
              width: 48, height: 48,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <path d="M11 7l7 7-7 7" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* B.5_slide — compact pagination row: ‹ 2/5 ›. Smaller chevrons than
          B.2.1/B.2.2 (which are the primary edge arrows); current page in
          bold gold, "/total" in light white. Hidden when ≤1 card. */}
      {total > 1 && (
      <div className="mt-8 flex items-center justify-center gap-4 px-6">
        <button type="button" aria-label="Trang trước"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="flex items-center justify-center rounded-full transition hover:bg-white/10 disabled:cursor-default disabled:opacity-30"
          style={{
            width: 28, height: 28,
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.85)", cursor: "pointer",
          }}>
          <svg width="14" height="14" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M17 21l-7-7 7-7" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span style={{ fontFamily: FM, lineHeight: "28px", minWidth: 48,
          textAlign: "center" }}>
          <span style={{ color: "#FFEA9E", fontWeight: 800, fontSize: "22px" }}>
            {activeIndex + 1}
          </span>
          <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500,
            fontSize: "16px" }}>/{total}</span>
        </span>

        <button type="button" aria-label="Trang sau"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= total - 1}
          className="flex items-center justify-center rounded-full transition hover:bg-white/10 disabled:cursor-default disabled:opacity-30"
          style={{
            width: 28, height: 28,
            background: "transparent", border: "none",
            color: "rgba(255,255,255,0.85)", cursor: "pointer",
          }}>
          <svg width="14" height="14" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M11 7l7 7-7 7" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      )}
    </section>
  );
}
