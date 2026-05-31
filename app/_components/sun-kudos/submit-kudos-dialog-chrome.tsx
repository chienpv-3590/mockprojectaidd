"use client";

/**
 * submit-kudos-dialog-chrome.tsx
 * Dialog header and action buttons for <SubmitKudosDialog>.
 * Light/cream theme — MoMorph screen JsTvi8KVQA.
 *
 * Design tokens from Figma node 1612:5057 (root card):
 *   background: rgba(255,248,225,1)  border: 1px solid #998C5F  radius: 24px
 *   padding: 40px
 *
 * Title (I1612:5057;520:9870):
 *   Montserrat 32px 700, color rgba(0,16,26,1), text-align center
 *   "Gửi lời cám ơn và ghi nhận đến đồng đội"
 *
 * Hủy (I1612:5057;520:9906):
 *   border 1px #998C5F, bg rgba(255,234,158,0.10), pad 16px 40px, radius 4px
 *
 * Gửi (I1612:5057;520:9907):
 *   bg rgba(255,234,158,1), pad 16px, radius 8px, flex 1, text #00101A
 */

export const FM = "var(--font-montserrat), system-ui, sans-serif";

/** Light/cream palette — shared with all dialog sub-components. */
export const C = {
  cardBg:     "rgba(255,248,225,1)",
  border:     "#998C5F",
  textPrimary:"rgba(0,16,26,1)",
  textMuted:  "rgba(153,153,153,1)",
  fieldBg:    "#FFF",
  goldSolid:  "rgba(255,234,158,1)",
  goldAlpha10:"rgba(255,234,158,0.10)",
  goldAlpha35:"rgba(255,234,158,0.35)",
  errorRed:   "rgba(228,96,96,1)",
} as const;

/* ------------------------------------------------------------------ */
/* Dialog header                                                        */
/* Title text from node I1612:5057;520:9870:                           */
/*   "Gửi lời cám ơn và ghi nhận đến đồng đội"                        */
/*   Montserrat 32px 700, centered, color #00101A                      */
/* ------------------------------------------------------------------ */

export function DialogHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="flex shrink-0 items-start justify-between"
      style={{ padding: "20px 40px", borderBottom: `1px solid ${C.border}` }}
    >
      <div style={{ flex: 1 }} /> {/* spacer to center title */}
      <h2
        id="dialog-title"
        style={{
          fontFamily: FM, fontWeight: 700, fontSize: "32px", lineHeight: "40px",
          color: C.textPrimary, margin: 0, textAlign: "center",
        }}
      >
        Gửi lời cám ơn và ghi nhận đến đồng đội
      </h2>
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog actions                                                       */
/* Hủy: secondary — gold-alpha-10 bg, #998C5F border, × icon         */
/* Gửi: primary  — gold solid bg, flex-1, ▷ send icon                */
/* ------------------------------------------------------------------ */

export function DialogActions({
  onClose, submitting, canSubmit,
}: {
  onClose: () => void; submitting: boolean; canSubmit: boolean;
}) {
  return (
    <div className="flex items-stretch gap-6" style={{ paddingTop: "8px" }}>
      {/* Hủy — border radius 4px per Figma node I1612:5057;520:9906 */}
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="flex items-center justify-center gap-2 transition hover:brightness-95"
        style={{
          padding: "16px 40px",
          border: `1px solid ${C.border}`,
          borderRadius: "4px",
          fontFamily: FM, fontWeight: 700, fontSize: "16px", lineHeight: "24px",
          letterSpacing: "0.15px",
          color: C.textPrimary,
          background: C.goldAlpha10,
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.5 : 1,
          whiteSpace: "nowrap",
        }}
      >
        Hủy
        <span aria-hidden style={{ fontSize: "14px" }}>✕</span>
      </button>

      {/* Gửi — flex-1, radius 8px per node I1612:5057;520:9907 */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="flex flex-1 items-center justify-center gap-2 transition hover:brightness-105"
        style={{
          padding: "16px",
          borderRadius: "8px",
          fontFamily: FM, fontWeight: 700, fontSize: "16px", lineHeight: "24px",
          letterSpacing: "0.15px",
          color: C.textPrimary,
          border: "none",
          background: canSubmit ? C.goldSolid : C.goldAlpha35,
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? (
          <>
            <span
              className="inline-block animate-spin"
              aria-hidden
              style={{
                width: 16, height: 16,
                border: `2px solid ${C.textPrimary}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
              }}
            />
            Đang gửi...
          </>
        ) : (
          <>
            Gửi
            {/* Send arrow icon matching Figma ▷ */}
            <span aria-hidden style={{ fontSize: "14px" }}>▷</span>
          </>
        )}
      </button>
    </div>
  );
}
