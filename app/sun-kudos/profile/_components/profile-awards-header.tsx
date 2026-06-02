/**
 * ProfileAwardsHeader — Section C (mms_C_Header Giải thưởng)
 * "Sun* Annual Awards 2025" eyebrow (24px white 700)
 * + 1px divider (#2E3940)
 * + Frame 488 row: large "KUDOS" title (57px gold 700) left + optional
 *   selector slot (the "Đã gửi (N)" dropdown) right, space-between.
 *
 * Design values from MoMorph nodes:
 *   362:5084 — section container (padding 0 144px)
 *   362:5085 — C.1 title text
 *   362:5087 — Frame 488 row (KUDOS title + C.3 dropdown, space-between)
 *   362:5088 — C.2 KUDOS title
 *   362:5089 — C.3 dropdown (rendered by the caller via `rightSlot`)
 */

import type { ReactNode } from "react";

const FM = "var(--font-montserrat), system-ui, sans-serif";

export function ProfileAwardsHeader({ rightSlot }: { rightSlot?: ReactNode }) {
  return (
    <div
      className="flex w-full flex-col"
      style={{ gap: "16px" }}
      aria-label="Giải thưởng KUDOS"
    >
      {/* C.1 — "Sun* Annual Awards 2025" eyebrow — 24px white 700 */}
      <p
        style={{
          fontFamily: FM,
          fontWeight: 700,
          fontSize: "clamp(16px, 1.7vw, 24px)",
          lineHeight: "32px",
          color: "#FFFFFF",
        }}
      >
        Sun* Annual Awards 2025
      </p>

      {/* Divider — 1px #2E3940 (matches Rectangle 26 in design) */}
      <div
        aria-hidden
        style={{ height: 1, width: "100%", background: "#2E3940" }}
      />

      {/* Frame 488 — KUDOS title (left) + selector dropdown (right) */}
      <div
        className="flex w-full items-center justify-between"
        style={{ gap: "32px" }}
      >
        {/* C.2 — KUDOS title — 57px gold 700 letter-spacing -0.25px */}
        <h2
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "clamp(32px, 4vw, 57px)",
            lineHeight: "64px",
            letterSpacing: "-0.25px",
            color: "#FFEA9E",
            margin: 0,
          }}
        >
          KUDOS
        </h2>

        {rightSlot}
      </div>
    </div>
  );
}
