"use client";

/**
 * submit-kudos-dialog-chrome.tsx
 * Dialog header and action buttons row for <SubmitKudosDialog>.
 */

import { FM } from "./submit-kudos-dialog-fields";

export function DialogHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between"
      style={{ padding: "20px 24px", borderBottom: "1px solid #2E3940" }}>
      <h2 id="dialog-title" style={{ fontFamily: FM, fontWeight: 700, fontSize: "20px",
        lineHeight: "28px", color: "#FFEA9E", margin: 0 }}>
        Gửi lời cảm ơn
      </h2>
      <button type="button" onClick={onClose} aria-label="Đóng"
        className="flex items-center justify-center rounded-full transition hover:bg-[rgba(255,255,255,0.08)]"
        style={{ width: 36, height: 36, color: "rgba(255,255,255,0.6)", fontSize: "18px" }}>
        ✕
      </button>
    </div>
  );
}

export function DialogActions({ onClose, submitting, canSubmit }: {
  onClose: () => void; submitting: boolean; canSubmit: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-2">
      <button type="button" onClick={onClose} disabled={submitting}
        className="transition hover:bg-[rgba(255,255,255,0.08)]"
        style={{ padding: "10px 24px", border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: "8px", fontFamily: FM, fontWeight: 600, fontSize: "15px",
          color: "rgba(255,255,255,0.75)", background: "transparent",
          cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.5 : 1 }}>
        Hủy
      </button>
      <button type="submit" disabled={!canSubmit}
        className="flex items-center gap-2 transition hover:brightness-105"
        style={{ padding: "10px 28px", borderRadius: "8px", fontFamily: FM,
          fontWeight: 700, fontSize: "15px", color: "#00101A", border: "none",
          background: canSubmit ? "#FFEA9E" : "rgba(255,234,158,0.35)",
          cursor: canSubmit ? "pointer" : "not-allowed" }}>
        {submitting ? (
          <>
            <span className="inline-block animate-spin" aria-hidden
              style={{ width: 16, height: 16, border: "2px solid #00101A",
                borderTopColor: "transparent", borderRadius: "50%" }} />
            Đang gửi...
          </>
        ) : "Gửi"}
      </button>
    </div>
  );
}
