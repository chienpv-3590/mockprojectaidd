"use client";

import { useCallback, useEffect, useState } from "react";
import type { MouseEvent } from "react";
import type { Award } from "@/lib/data/types";
import { TargetIcon } from "./award-icons";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const YELLOW = "#FFEA9E";

type AwardMenuProps = {
  awards: Award[];
};

/**
 * Left navigation menu for award categories. Two responsive variants render
 * from the same component (CSS-hidden on the inactive breakpoint):
 *   - Desktop (lg+): sticky vertical list pinned below the header.
 *   - Mobile (<lg): horizontal scrollable pill row.
 *
 * Interaction (Phase 05):
 *   - Click → preventDefault, smoothly scroll to #${code} with header offset,
 *     update URL hash via history.replaceState, set local active state.
 *   - IntersectionObserver watches each #${code} card and updates active
 *     based on which section dominates the viewport.
 *   - Invalid section ID (missing DOM target) is a silent no-op (TC ID-13).
 */
export function AwardMenu({ awards }: AwardMenuProps) {
  const [activeCode, setActiveCode] = useState<string>(awards[0]?.code ?? "");

  // Scroll-spy: on every scroll, the active card is the one whose top edge
  // is the closest *above* (or at) the activation line (~30% from viewport
  // top). Falls back to the first card before the user scrolls.
  useEffect(() => {
    if (typeof window === "undefined" || awards.length === 0) return;

    const ACTIVATION_OFFSET = 160; // px from top of viewport (~header + breath)

    function update() {
      let current = awards[0]?.code ?? "";
      for (const award of awards) {
        const el = document.getElementById(award.code);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - ACTIVATION_OFFSET <= 0) current = award.code;
      }
      // Last card stays active once we hit page bottom.
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      ) {
        const last = awards[awards.length - 1]?.code;
        if (last) current = last;
      }
      setActiveCode((prev) => (prev === current ? prev : current));
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [awards]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>, code: string) => {
      const target = document.getElementById(code);
      // Silent no-op for missing targets (TC ID-13). No throw, no error log.
      if (!target) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      // Header is ~80px sticky — offset so the card title isn't hidden.
      const HEADER_OFFSET = 96;
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
      window.history.replaceState(null, "", `#${code}`);
      setActiveCode(code);
    },
    []
  );

  // Per design mms_C.x_*: every menu item shows MM_MEDIA_Target icon + label.
  // Active item: 16px padding, 4px icon-text gap, 1px yellow border-bottom.
  // Inactive: 16px padding, 4px icon-text gap, 4px border-radius (no border).
  const ITEM_LABEL_STYLE = {
    fontFamily: FONT_MONTSERRAT,
    fontWeight: 700 as const,
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: "0.1px",
  };

  return (
    <nav
      aria-label="Danh mục giải thưởng"
      className="lg:sticky lg:top-28 lg:self-start"
    >
      {/* Mobile: horizontal scrollable list (still tap targets, not pills) */}
      <ul
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:hidden"
        role="list"
      >
        {awards.map((award) => {
          const isActive = award.code === activeCode;
          return (
            <li key={award.code} className="shrink-0">
              <a
                href={`#${award.code}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => handleClick(e, award.code)}
                style={{
                  ...ITEM_LABEL_STYLE,
                  color: isActive ? YELLOW : "rgba(255,255,255,0.85)",
                  whiteSpace: "nowrap",
                }}
                className={
                  isActive
                    ? "flex items-center gap-1 border-b border-[#FFEA9E] px-4 py-2 transition"
                    : "flex items-center gap-1 rounded px-4 py-2 transition hover:text-white"
                }
              >
                <TargetIcon size={20} />
                {award.title_vi}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Desktop: vertical list, 16px gap between items (design mms_C_Menu list
          178×448, gap 16). */}
      <ul className="hidden lg:flex lg:flex-col lg:gap-4" role="list">
        {awards.map((award) => {
          const isActive = award.code === activeCode;
          return (
            <li key={award.code}>
              <a
                href={`#${award.code}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => handleClick(e, award.code)}
                style={{
                  ...ITEM_LABEL_STYLE,
                  color: isActive ? YELLOW : "rgba(255,255,255,0.85)",
                }}
                className={
                  isActive
                    ? "flex items-center gap-1 border-b border-[#FFEA9E] p-4 transition"
                    : "flex items-center gap-1 rounded p-4 transition hover:text-white"
                }
              >
                <TargetIcon size={24} />
                {award.title_vi}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
