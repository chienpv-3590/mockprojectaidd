"use client";

/**
 * secret-box-open-dialog.tsx
 * Modal matching MoMorph screen J3-4YFIpMM ("Open Secret Box - chưa mở").
 *
 * Two states:
 *   - closed   (revealedIconId === null) → shows closed-box illustration; click → onBoxClick
 *   - revealed (revealedIconId !== null) → swaps title + image to the won badge; click rolls again
 *
 * Pure presentation — parent owns the unopened count, server actions, and the
 * decision to roll again. Click is disabled when `unopened === 0` or `isPending`.
 * Instructional text is hidden once `unopened === 0` per spec C / TC d9d6e01a.
 */
import { useEffect, useRef } from "react";
import Image from "next/image";
import { getSecretBoxIcon } from "@/lib/sun-kudos/secret-box-icons";

const TITLE_CLOSED = "KHÁM PHÁ SECRET BOX CỦA BẠN";
const TITLE_REVEALED = "MỞ SECRET BOX THÀNH CÔNG";
const INSTRUCTION = "Click vào box để tiếp tục mở";
const COUNTER_LABEL = "Secretbox chưa mở";
const CLOSED_BOX_SRC = "/sun-kudos/secret-box-closed.png";

const GOLD = "#F0C24A";
const GOLD_BRIGHT = "#FFD96B";

export type SecretBoxOpenDialogProps = {
  open: boolean;
  unopened: number;
  revealedIconId: number | null;
  isPending: boolean;
  onBoxClick: () => void;
  onClose: () => void;
};

export function SecretBoxOpenDialog({
  open,
  unopened,
  revealedIconId,
  isPending,
  onBoxClick,
  onClose,
}: SecretBoxOpenDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  const isRevealed = revealedIconId !== null;
  const clickDisabled = unopened === 0 || isPending;
  const icon = getSecretBoxIcon(revealedIconId);
  const counterStr = unopened.toString().padStart(2, "0");

  return (
    <div
      data-testid="secret-box-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="secret-box-dialog-title"
        tabIndex={-1}
        className="relative flex w-full flex-col items-center outline-none"
        style={{
          maxWidth: 560,
          background: "linear-gradient(180deg, #0F1A2E 0%, #050912 100%)",
          border: `1px solid ${GOLD}`,
          borderRadius: 16,
          padding: "32px 28px 24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
        }}
      >
        {/* X close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute flex items-center justify-center rounded-full transition hover:bg-white/10"
          style={{
            top: 14, right: 14, width: 34, height: 34,
            background: "transparent", border: "none",
            color: "#FFF", fontSize: 20, cursor: "pointer", lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Title */}
        <h2
          id="secret-box-dialog-title"
          style={{
            margin: 0,
            color: GOLD_BRIGHT,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: "1px",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {isRevealed ? TITLE_REVEALED : TITLE_CLOSED}
        </h2>

        {/* Instructional */}
        {unopened > 0 && (
          <p
            data-testid="secret-box-instruction"
            style={{
              margin: "10px 0 0",
              color: "rgba(255,255,255,0.85)",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {INSTRUCTION}
          </p>
        )}

        {/* Box / badge image */}
        <button
          type="button"
          data-testid="secret-box-image"
          onClick={() => { if (!clickDisabled) onBoxClick(); }}
          disabled={clickDisabled}
          aria-label={isRevealed ? "Mở Secret Box tiếp" : "Mở Secret Box"}
          className="mt-4 flex items-center justify-center transition-transform"
          style={{
            width: "100%", maxWidth: 420, aspectRatio: "1 / 1",
            background: "transparent", border: "none", padding: 0,
            cursor: clickDisabled ? "not-allowed" : "pointer",
            opacity: clickDisabled ? 0.6 : 1,
          }}
          onMouseEnter={(e) => { if (!clickDisabled) (e.currentTarget.style.transform = "scale(1.02)"); }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isRevealed && icon?.src ? (
            <div className="flex flex-col items-center" style={{ gap: 12 }}>
              <Image
                src={icon.src}
                alt={icon.label}
                width={260}
                height={260}
                priority
                style={{ objectFit: "contain" }}
              />
              <span
                data-testid="secret-box-reward-label"
                style={{ color: GOLD_BRIGHT, fontWeight: 700, fontSize: 18 }}
              >
                {icon.label}
              </span>
            </div>
          ) : (
            <Image
              src={CLOSED_BOX_SRC}
              alt="Secret Box chưa mở"
              width={420}
              height={420}
              priority
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </button>

        {/* Counter */}
        <div className="mt-4 flex items-baseline justify-center" style={{ gap: 12 }}>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
            {COUNTER_LABEL}
          </span>
          <span
            data-testid="secret-box-counter"
            style={{ color: GOLD_BRIGHT, fontWeight: 800, fontSize: 36, lineHeight: 1 }}
          >
            {counterStr}
          </span>
        </div>
      </div>
    </div>
  );
}
