"use client";

import { useEffect, useRef } from "react";

const FM = "var(--font-montserrat), system-ui, sans-serif";

export type FilterDropdownOption = { value: string; label: string };

type FilterDropdownProps = {
  /** Button label, e.g. "Hashtag" / "Phòng ban". */
  label: string;
  options: FilterDropdownOption[];
  /** Currently selected option value (undefined = none). */
  selectedValue?: string;
  /** Whether this dropdown's list is open (parent-controlled so only one opens). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Selecting an option; null when the selected option is toggled off. */
  onSelect: (value: string | null) => void;
  /** Prefix rendered before each option label, e.g. "#" for hashtags. */
  prefix?: string;
  /** Option text alignment — hashtags read left, departments center (design). */
  align?: "left" | "center";
};

/**
 * FilterDropdown — the Hashtag / Phòng ban filter selectbox on the Live Board
 * (MoMorph "Dropdown Hashtag filter" 563:8026 / "Dropdown Phòng ban" 563:8027).
 *
 * Button reuses the yellow filter-chip styling; clicking it opens a dark list
 * (#00070C bg, #998C5F border) of options. Selecting one filters both the
 * Highlight carousel and the All-Kudos feed; clicking the active option clears
 * the filter. Closes on outside click or Escape.
 */
export function FilterDropdown({
  label,
  options,
  selectedValue,
  open,
  onOpenChange,
  onSelect,
  prefix = "",
  align = "left",
}: FilterDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape while open.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) onOpenChange(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  const active = open || Boolean(selectedValue);
  const selectedLabel = options.find((o) => o.value === selectedValue)?.label;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        // Visible text collapses to just the selected value (e.g. "#Truyền cảm
        // hứng"); aria-label keeps the filter name for screen readers.
        aria-label={selectedLabel ? `${label}: ${prefix}${selectedLabel}` : undefined}
        // Stable test/automation hook — survives the text collapse on select.
        data-filter-name={label}
        onClick={() => onOpenChange(!open)}
        className="flex items-center gap-2 transition hover:bg-[rgba(255,234,158,0.16)]"
        style={{
          height: "56px",
          padding: "16px",
          border: "1px solid #998C5F",
          background: active ? "rgba(255,234,158,0.20)" : "rgba(255,234,158,0.10)",
          fontFamily: FM,
          fontWeight: 700,
          fontSize: "14px",
          color: "#FFEA9E",
          borderRadius: "4px",
          whiteSpace: "nowrap",
        }}
      >
        {selectedLabel ? `${prefix}${selectedLabel}` : label}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}
        >
          <path d="M4 6l4 4 4-4" stroke="#FFEA9E" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-50 mt-2 flex flex-col"
          style={{
            minWidth: "100%",
            maxHeight: "min(360px, 60vh)",
            overflowY: "auto",
            padding: "6px",
            background: "#00070C",
            border: "1px solid #998C5F",
            borderRadius: "8px",
            scrollbarWidth: "thin",
          }}
        >
          {options.length === 0 && (
            <li
              style={{ padding: "16px", fontFamily: FM, fontSize: "14px",
                color: "rgba(255,255,255,0.5)", textAlign: "center" }}
            >
              Chưa có dữ liệu
            </li>
          )}
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <li key={opt.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(isSelected ? null : opt.value);
                    onOpenChange(false);
                  }}
                  className="w-full transition hover:bg-[rgba(255,234,158,0.08)]"
                  style={{
                    minHeight: "56px",
                    padding: "16px",
                    borderRadius: "4px",
                    fontFamily: FM,
                    fontWeight: 700,
                    fontSize: "14px",
                    lineHeight: "20px",
                    textAlign: align,
                    color: isSelected ? "#FFEA9E" : "#FFFFFF",
                    background: isSelected ? "rgba(255,234,158,0.10)" : "transparent",
                    whiteSpace: "nowrap",
                  }}
                >
                  {prefix}
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
