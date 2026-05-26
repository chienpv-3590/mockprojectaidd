"use client";

import { useCallback, useEffect, useState } from "react";
import type { MouseEvent } from "react";
import type { Award } from "@/lib/data/types";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

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

  // Scroll-spy: pick the section closest to the upper third of the viewport.
  // rootMargin biases activation toward the top so the active item changes
  // shortly after a card scrolls into the upper viewport, not at its center.
  useEffect(() => {
    if (typeof window === "undefined" || awards.length === 0) return;

    const elements = awards
      .map((a) => document.getElementById(a.code))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among currently-intersecting entries, choose the one with the
        // smallest top distance to the activation line.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top)
          );
        if (visible[0]?.target.id) {
          setActiveCode(visible[0].target.id);
        }
      },
      {
        root: null,
        // Activation band: 30% from top, 60% from bottom — keeps the
        // currently centered/upper card active.
        rootMargin: "-30% 0px -60% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
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

  return (
    <nav
      aria-label="Danh mục giải thưởng"
      className="lg:sticky lg:top-28 lg:self-start"
    >
      {/* Mobile: horizontal scrollable pill row */}
      <ul
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide lg:hidden"
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
                  fontFamily: FONT_MONTSERRAT,
                  fontWeight: 600,
                  fontSize: "13px",
                  letterSpacing: "0.2px",
                  whiteSpace: "nowrap",
                }}
                className={
                  isActive
                    ? "block rounded-full border border-[#FFEA9E] bg-[#FFEA9E]/10 px-4 py-2 text-[#FFEA9E] transition"
                    : "block rounded-full border border-white/20 px-4 py-2 text-white/70 transition hover:border-white/50 hover:text-white"
                }
              >
                {award.title_vi}
              </a>
            </li>
          );
        })}
      </ul>

      {/* Desktop: vertical list */}
      <ul className="hidden lg:flex lg:flex-col lg:gap-1" role="list">
        {awards.map((award) => {
          const isActive = award.code === activeCode;
          return (
            <li key={award.code}>
              <a
                href={`#${award.code}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => handleClick(e, award.code)}
                style={{
                  fontFamily: FONT_MONTSERRAT,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "14px",
                  lineHeight: "22px",
                  color: isActive ? "#FFEA9E" : undefined,
                }}
                className={
                  isActive
                    ? "block border-b-2 border-[#FFEA9E] pb-1 text-[#FFEA9E] transition"
                    : "block text-white/70 transition hover:text-white"
                }
              >
                {award.title_vi}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
