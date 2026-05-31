"use client";

/**
 * kudos-detail-dialog.tsx
 * Cream popup that shows one Kudos in full — opened from the Live board instead
 * of navigating to /sun-kudos/[id] (the standalone page stays for shared links).
 *
 * Reuses the cream design system: palette/FM from submit-kudos-dialog-chrome and
 * the PersonBlock / ArrowIcon building blocks from kudos-card-parts, so the popup
 * matches the highlight/feed cards exactly.
 *
 * Data: the component-shaped KudosCardData (adapted via adaptKudosCard). `content`
 * is the server-sanitized HTML message, rendered via dangerouslySetInnerHTML.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { KudosCardData } from "./types";
import { FM, PersonBlock, ArrowIcon } from "./kudos-card-parts";
import { C } from "./submit-kudos-dialog-chrome";

const GOLD = "#FFEA9E";
const DARK = "#00101A";

type KudosDetailDialogProps = {
  /** Kudos to show; null = nothing loaded yet. */
  card: KudosCardData | null;
  /** True while the card is being fetched — shows a spinner in the open overlay. */
  loading?: boolean;
  onClose: () => void;
  onCopyLink: (id: string) => void;
};

export function KudosDetailDialog({
  card,
  loading = false,
  onClose,
  onCopyLink,
}: KudosDetailDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = loading || !!card;

  /* Focus the dialog when it opens */
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      {/* Cream card — matches the submit dialog chrome */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết Kudos"
        tabIndex={-1}
        className="flex w-full flex-col overflow-hidden outline-none"
        style={{
          maxWidth: "600px",
          maxHeight: "90vh",
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: "24px",
        }}
      >
        {/* Close button row */}
        <div className="flex shrink-0 items-center justify-end" style={{ padding: "16px 16px 0 16px" }}>
          <button
            type="button"
            onClick={onClose}
            // "Đóng cửa sổ" disambiguates the top-right X from the footer
            // "Đóng" text button (both close the dialog; getByRole needs
            // unique accessible names).
            aria-label="Đóng cửa sổ"
            className="flex items-center justify-center rounded-full transition hover:bg-black/5"
            style={{
              width: 36, height: 36,
              color: C.textMuted, fontSize: "18px",
              background: "transparent", border: "none", cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {loading || !card ? (
          <div className="flex items-center justify-center" style={{ padding: "48px", minHeight: 160 }}>
            <span
              className="inline-block animate-spin"
              aria-label="Đang tải"
              style={{ width: 28, height: 28, border: `3px solid ${DARK}`, borderTopColor: "transparent", borderRadius: "50%" }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto" style={{ padding: "0 40px 32px 40px" }}>
            {/* Sender → Receiver (top of body per design). */}
            <div className="flex items-start justify-between gap-4">
              <PersonBlock user={card.sender} />
              <ArrowIcon />
              <PersonBlock user={card.receiver} />
            </div>

            {/* Timestamp — small gray, sits directly below sender row. */}
            <p style={{ fontFamily: FM, fontWeight: 700, fontSize: "14px", lineHeight: "20px", letterSpacing: "0.5px", color: "#999999" }}>
              {card.createdAt}
            </p>

            {/* Feature hashtag (danh hiệu) — centered dark label between
                timestamp and message per the View Kudo Figma design. */}
            {card.featureHashtag && (
              <p style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px", lineHeight: "24px", letterSpacing: "0.5px", color: DARK, textAlign: "center" }}>
                {card.featureHashtag}
              </p>
            )}

            {/* Message — sanitized HTML in the gold framed box */}
            <div style={{ background: "rgba(255,234,158,0.40)", border: `1px solid ${GOLD}`, borderRadius: "12px", padding: "16px 24px" }}>
              <div
                style={{ fontFamily: FM, fontWeight: 700, fontSize: "18px", lineHeight: "30px", color: DARK, textAlign: "justify", wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: card.content }}
              />
            </div>

            {/* Images — horizontal row of 80×80 square thumbnails per design
                (Figma View Kudo node 520:18779). `auto-fill` grid keeps rows
                visually even when wrapping (e.g. 6+ images), preventing an
                orphan thumbnail on its own row. */}
            {card.images && card.images.length > 0 && (
              <div
                className="gap-2"
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 80px)" }}
              >
                {card.images.map((img) => (
                  <div key={img.id} className="relative overflow-hidden rounded-md" style={{ width: 80, height: 80 }}>
                    <Image src={img.url} alt={img.alt ?? ""} fill sizes="80px" className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            )}

            {/* Small hashtags */}
            {card.hashtags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {card.hashtags.map((tag) => (
                  <span key={tag} style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px", lineHeight: "24px", letterSpacing: "0.5px", color: "#D4271D" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer — heart count (left) + Copy Link + Đóng (right). The
                explicit "Đóng" button is part of the design even though the
                top-right X already closes the dialog. */}
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-2" aria-label={`${card.heartCount} tim`}>
                <span style={{ fontFamily: FM, fontWeight: 700, fontSize: "24px", lineHeight: "32px", color: DARK }}>
                  {card.heartCount.toLocaleString("vi-VN")}
                </span>
                <svg width="28" height="28" viewBox="0 0 32 32" fill={card.isHearted ? "#E53935" : "none"} aria-hidden>
                  <path
                    d="M16 27s-12-7.716-12-15.167C4 7.97 6.866 5 10.4 5c2.064 0 3.896 1.046 5.6 3.104C17.704 6.046 19.536 5 21.6 5 25.134 5 28 7.97 28 11.833 28 19.284 16 27 16 27z"
                    stroke={card.isHearted ? "#E53935" : DARK}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Sao chép liên kết"
                  onClick={() => onCopyLink(card.id)}
                  className="flex items-center gap-2 rounded px-3 py-2 transition hover:bg-black/5"
                  style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px", lineHeight: "24px", letterSpacing: "0.15px", color: DARK, background: "transparent", border: "none", cursor: "pointer" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M6.667 8.667a3.333 3.333 0 0 0 5.04.327l2-2A3.333 3.333 0 1 0 9 2.287L7.84 3.44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.333 7.333a3.333 3.333 0 0 0-5.04-.327l-2 2a3.333 3.333 0 1 0 4.714 4.706L8.16 12.56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Copy Link
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center rounded px-3 py-2 transition hover:bg-black/5"
                  style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px", lineHeight: "24px", letterSpacing: "0.15px", color: DARK, background: "transparent", border: "none", cursor: "pointer" }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
