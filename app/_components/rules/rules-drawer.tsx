"use client";

/**
 * rules-drawer.tsx — right-side drawer hosting the Thể lệ ("Rules") panel.
 *
 * MoMorph ref: `b1Filzi9i6` ("Thể lệ UPDATE"). The drawer slides in from the
 * right over a dimmed backdrop. Content comes from the active i18n dict's
 * `rules` slice (bilingual VI/EN). Footer offers Đóng / Viết KUDOS.
 *
 * Owns its open-state hooks (Esc, body scroll lock, focus on open). The
 * parent (`global-kudos-fab.tsx`) supplies open/close/write-kudos handlers.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/locale-context";
import { RulesContent } from "./rules-content";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

export type RulesDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Fired when the footer primary "Viết KUDOS" button is clicked. */
  onWriteKudos: () => void;
};

export function RulesDrawer({ open, onClose, onWriteKudos }: RulesDrawerProps) {
  const { dict } = useI18n();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Esc to close + body scroll lock + initial focus on the Đóng button.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop — click to close. Rendered as a button for native
          keyboard activation; tabIndex=-1 keeps it out of the tab order
          since the drawer already provides a visible Đóng button. */}
      <button
        type="button"
        aria-label={dict.rules.close}
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 bg-black/50"
      />

      {/* Drawer surface — slides in from the right. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[640px] flex-col bg-[#00101A] text-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-10 pb-6">
          <h2
            id="rules-drawer-title"
            style={{
              color: "#FFEA9E",
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "32px",
              lineHeight: "40px",
            }}
          >
            {dict.rules.title}
          </h2>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-8 pb-6">
          <RulesContent rules={dict.rules} />
        </div>

        {/* Sticky footer */}
        <div className="flex items-center gap-3 border-t border-white/10 bg-[#00101A] px-8 py-5">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="flex h-12 items-center gap-2 rounded-lg border border-white/30 px-5 text-white transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 4l8 8M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {dict.rules.close}
          </button>

          <button
            type="button"
            onClick={onWriteKudos}
            className="ml-auto flex h-12 items-center gap-2 rounded-lg bg-[#FFEA9E] px-5 text-[#00101A] transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            <Image
              src="/home/pen.svg"
              alt=""
              width={16}
              height={16}
              unoptimized
              className="h-4 w-4"
            />
            {dict.fab.writeKudos}
          </button>
        </div>
      </div>
    </div>
  );
}
