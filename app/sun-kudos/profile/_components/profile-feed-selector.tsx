"use client";

/**
 * ProfileFeedSelector — Section C.3 dropdown (node 362:5089 "mms_C.3_Button").
 *
 * Sits on the right of the "KUDOS" title (Frame 488, node 362:5087) and lets
 * the user switch the feed between "Đã nhận" (received) and "Đã gửi" (sent).
 * The trigger always shows the active direction with its count, e.g.
 * "Đã gửi (5)" — matching the design exactly.
 *
 * Design values:
 *   button — border 1px #998C5F, bg rgba(255,234,158,0.10), radius 4px,
 *            padding 16px 24px, gap 8px, label 16px/700 white, chevron 24px.
 *
 * Unlike the live-board FilterDropdown this selection is REQUIRED (never
 * cleared) — there is always exactly one active direction.
 */

import { useEffect, useRef, useState } from "react";

const FM = "var(--font-montserrat), system-ui, sans-serif";

export type FeedDirection = "received" | "sent";

type Props = {
  activeTab: FeedDirection;
  /** Counts shown in the option labels, e.g. received 5 / sent 25. */
  counts: { received: number; sent: number };
  onTabChange: (tab: FeedDirection) => void;
};

const OPTIONS: { value: FeedDirection; label: string }[] = [
  { value: "received", label: "Đã nhận" },
  { value: "sent", label: "Đã gửi" },
];

export function ProfileFeedSelector({ activeTab, counts, onTabChange }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape while open.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const labelFor = (v: FeedDirection) =>
    `${v === "received" ? "Đã nhận" : "Đã gửi"} (${counts[v]})`;

  return (
    <div ref={containerRef} className="relative" style={{ flexShrink: 0 }}>
      {/* C.3 trigger button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        data-testid="feed-selector"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center transition hover:bg-[rgba(255,234,158,0.16)]"
        style={{
          gap: "8px",
          padding: "16px 24px",
          border: "1px solid #998C5F",
          background: open ? "rgba(255,234,158,0.20)" : "rgba(255,234,158,0.10)",
          borderRadius: "4px",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: "#FFFFFF",
          }}
        >
          {labelFor(activeTab)}
        </span>
        {/* Button down — chevron 24px */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Loại Kudos"
          className="absolute right-0 z-50 mt-2 flex flex-col"
          style={{
            minWidth: "100%",
            padding: "6px",
            background: "#00070C",
            border: "1px solid #998C5F",
            borderRadius: "8px",
          }}
        >
          {OPTIONS.map((opt) => {
            const isSelected = opt.value === activeTab;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onTabChange(opt.value);
                  setOpen(false);
                }}
                className="w-full transition hover:bg-[rgba(255,234,158,0.08)]"
                style={{
                  minHeight: "48px",
                  padding: "12px 16px",
                  borderRadius: "4px",
                  fontFamily: FM,
                  fontWeight: 700,
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0.15px",
                  textAlign: "left",
                  color: isSelected ? "#FFEA9E" : "#FFFFFF",
                  background: isSelected ? "rgba(255,234,158,0.10)" : "transparent",
                  whiteSpace: "nowrap",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {opt.label} ({counts[opt.value]})
              </button>
            );
          })}
        </ul>
      )}
    </div>
  );
}
