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
  /** Clears both filters (Hashtag + Phòng ban) at once. */
  onClearFilters?: () => void;
  onHeartToggle?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onViewDetail?: (id: string) => void;
};

/**
 * HighlightCarousel — B_Highlight section (node 2940:13451, 786px tall).
 *
 * - B.1_header: section title "HIGHLIGHT KUDOS" (57px yellow) + filter chips
 * - B.2_HIGHLIGHT KUDOS: horizontal snap carousel, center card prominent,
 *   sides faded (opacity 0.5). Prev/Next arrow buttons on edges.
 * - B.5_slide: dot indicators + "n/total" counter.
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
  onClearFilters,
  onHeartToggle,
  onCopyLink,
  onViewDetail,
}: HighlightCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(Math.floor(kudos.length / 2));
  // Only one filter dropdown open at a time.
  const [openFilter, setOpenFilter] = useState<"hashtag" | "department" | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = kudos.length;
  const hasActiveFilter = Boolean(selectedHashtagId || selectedDepartmentCode);

  // Re-center the carousel whenever the result set changes (e.g. after a filter
  // is applied — spec B.1: "đặt pagination về 1").
  useEffect(() => {
    setActiveIndex(Math.floor(kudos.length / 2));
  }, [kudos]);

  const scrollToIndex = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(total - 1, idx));
      setActiveIndex(clamped);
      const track = trackRef.current;
      if (!track) return;
      const card = track.children[clamped] as HTMLElement | undefined;
      if (!card) return;
      track.scrollBy({
        left:
          card.getBoundingClientRect().left -
          track.getBoundingClientRect().left -
          (track.offsetWidth - card.offsetWidth) / 2,
        behavior: "smooth",
      });
    },
    [total]
  );

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
      {/* Clear both filters — sits to the right of the Phòng ban dropdown.
          Disabled until at least one filter is active. */}
      <button
        type="button"
        onClick={() => onClearFilters?.()}
        disabled={!hasActiveFilter}
        aria-label="Xoá bộ lọc"
        className="flex items-center gap-1.5 transition hover:bg-[rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          height: "56px",
          padding: "16px",
          border: "1px solid rgba(255,255,255,0.25)",
          background: "transparent",
          fontFamily: FM,
          fontWeight: 700,
          fontSize: "14px",
          color: "rgba(255,255,255,0.85)",
          borderRadius: "4px",
          whiteSpace: "nowrap",
        }}
      >
        Xoá bộ lọc
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" />
        </svg>
      </button>
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

      {/* Carousel track — full-bleed with arrow buttons */}
      <div className="relative mt-10">
        {/* Prev arrow */}
        <button type="button" aria-label="Slide trước"
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 transition hover:bg-white/10 disabled:opacity-30 lg:left-16"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M17 21l-7-7 7-7" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Scrollable card track */}
        <div ref={trackRef}
          className="flex items-center gap-6 overflow-x-auto px-6 pb-4 sm:px-10 lg:px-36"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {kudos.map((card, idx) => {
            const dist = Math.abs(idx - activeIndex);
            return (
              <div key={card.id}
                className="shrink-0 transition-all duration-300"
                style={{
                  width: "clamp(300px, 36vw, 528px)",
                  opacity: dist === 0 ? 1 : dist === 1 ? 0.5 : 0.25,
                  transform: `scale(${idx === activeIndex ? 1 : 0.96})`,
                  transformOrigin: "center",
                }}>
                <KudosCard data={card} variant="highlight"
                  onHeartToggle={onHeartToggle}
                  onCopyLink={onCopyLink}
                  onViewDetail={onViewDetail} />
              </div>
            );
          })}
        </div>

        {/* Next arrow */}
        <button type="button" aria-label="Slide tiếp theo"
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex >= total - 1}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 transition hover:bg-white/10 disabled:opacity-30 lg:right-16"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M11 7l7 7-7 7" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* B.5_slide — dot indicators + n/total counter */}
      <div className="mt-8 flex items-center justify-center gap-8 px-6">
        <div className="flex items-center gap-3">
          {kudos.map((_, idx) => (
            <button key={idx} type="button" aria-label={`Slide ${idx + 1}`}
              onClick={() => scrollToIndex(idx)}
              className="rounded-full transition-all duration-200"
              style={{
                width: idx === activeIndex ? "24px" : "8px",
                height: "8px",
                background: idx === activeIndex ? "#FFEA9E" : "rgba(255,255,255,0.3)",
              }} />
          ))}
        </div>
        <span style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px",
          lineHeight: "24px", color: "rgba(255,255,255,0.7)" }}>
          {activeIndex + 1}/{total}
        </span>
      </div>
    </section>
  );
}
