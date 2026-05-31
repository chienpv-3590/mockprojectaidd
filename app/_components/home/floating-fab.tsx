"use client";

/**
 * floating-fab.tsx — Interactive Floating Action Button.
 *
 * MoMorph refs:
 *   - Collapsed: screen `_hphd32jN2` (yellow pill `pen | logo` bottom-right).
 *   - Expanded:  screen `Sv7DFwBw1h` (Thể lệ pill + Viết KUDOS pill + red X).
 *
 * Architecture: ONE always-mounted trigger button toggles between two
 * visual modes (yellow pill ↔ red X circle). When expanded, an action
 * stack (Thể lệ + Viết KUDOS pills) renders above the trigger. Keeping a
 * single button preserves `aria-expanded` state for assistive tech and
 * keeps focus stable across the toggle.
 *
 * Emits `onOpenRules` / `onOpenCompose` to the orchestrator
 * (`global-kudos-fab.tsx`) which owns the rules drawer and the compose
 * dialog.
 *
 * a11y: trigger has dynamic `aria-label` (Mở/Đóng menu) + `aria-expanded`
 * + `aria-controls` pointing at the action stack id. Esc and click-outside
 * collapse the stack; focus moves into the first action on expand.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/locale-context";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const STACK_ID = "floating-fab-stack";

const PILL_BASE_CLASS =
  "flex h-16 w-[149px] items-center justify-center gap-2 rounded-full bg-[#FFEA9E] px-4 text-[#00101A] transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";
const PILL_STYLE = {
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "20px",
};

const TRIGGER_COLLAPSED_CLASS =
  "flex h-16 w-[105px] items-center justify-center gap-1 rounded-full bg-[#FFEA9E] px-3 text-[#00101A] transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";
const TRIGGER_COLLAPSED_STYLE = {
  boxShadow: "0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287",
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "20px",
};

const TRIGGER_EXPANDED_CLASS =
  "flex h-14 w-14 items-center justify-center rounded-full bg-[#E46060] text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white";
const TRIGGER_EXPANDED_STYLE = { boxShadow: "0 4px 12px rgba(0,0,0,0.25)" };

export type FloatingFabProps = {
  onOpenRules: () => void;
  onOpenCompose: () => void;
};

export function FloatingFab({ onOpenRules, onOpenCompose }: FloatingFabProps) {
  const { dict } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);

  const collapse = useCallback(() => setExpanded(false), []);

  // Esc + click-outside while expanded.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") collapse();
    };
    const onPointer = (e: MouseEvent) => {
      const root = containerRef.current;
      if (root && !root.contains(e.target as Node)) collapse();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [expanded, collapse]);

  // Move focus to the first action when the stack opens.
  useEffect(() => {
    if (expanded) firstActionRef.current?.focus();
  }, [expanded]);

  const handleRules = () => {
    onOpenRules();
    setExpanded(false);
  };
  const handleCompose = () => {
    onOpenCompose();
    setExpanded(false);
  };

  return (
    <div
      ref={containerRef}
      id="floating-fab-root"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3"
    >
      {expanded ? (
        <div
          id={STACK_ID}
          role="group"
          aria-label={dict.fab.openMenu}
          className="flex flex-col items-end gap-3"
        >
          <button
            ref={firstActionRef}
            type="button"
            onClick={handleRules}
            className={PILL_BASE_CLASS}
            style={PILL_STYLE}
          >
            <Image
              src={`${ASSETS}/logo.png`}
              alt=""
              width={24}
              height={24}
              className="h-6 w-auto"
            />
            {dict.fab.rules}
          </button>

          <button
            type="button"
            onClick={handleCompose}
            className={PILL_BASE_CLASS}
            style={PILL_STYLE}
          >
            <Image
              src={`${ASSETS}/pen.svg`}
              alt=""
              width={20}
              height={20}
              unoptimized
              className="h-5 w-5"
            />
            {dict.fab.writeKudos}
          </button>
        </div>
      ) : null}

      {/* Always-mounted trigger — toggles open/closed. Its visual mode
          (yellow pill / red X circle) switches with `expanded`, but the
          single DOM node lets `aria-expanded` actually flip true/false. */}
      <button
        type="button"
        aria-label={expanded ? dict.fab.closeMenu : dict.fab.openMenu}
        aria-expanded={expanded}
        aria-controls={STACK_ID}
        onClick={() => setExpanded((prev) => !prev)}
        className={expanded ? TRIGGER_EXPANDED_CLASS : TRIGGER_COLLAPSED_CLASS}
        style={expanded ? TRIGGER_EXPANDED_STYLE : TRIGGER_COLLAPSED_STYLE}
      >
        {expanded ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
          >
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <>
            <Image
              src={`${ASSETS}/pen.svg`}
              alt=""
              width={24}
              height={24}
              unoptimized
              className="h-6 w-6"
            />
            <span className="text-[#00101A]/70">/</span>
            <Image
              src={`${ASSETS}/logo.png`}
              alt=""
              width={28}
              height={28}
              className="h-7 w-auto"
            />
          </>
        )}
      </button>
    </div>
  );
}
