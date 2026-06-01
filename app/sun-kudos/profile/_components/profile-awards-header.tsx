/**
 * ProfileAwardsHeader — Section C (mms_C_Header Giải thưởng)
 * "Sun* Annual Awards 2025" eyebrow (24px white 700)
 * + 1px divider (#2E3940)
 * + large "KUDOS" title (57px gold 700) left.
 *
 * Design values from MoMorph nodes:
 *   362:5084 — section container (padding 0 144px)
 *   362:5085 — C.1 title text
 *   362:5088 — C.2 KUDOS title
 *
 * Note: the C.3 year/edition dropdown was removed — the feed now shows kudos
 * across all years, so there is no year selector to render.
 */

const FM = "var(--font-montserrat), system-ui, sans-serif";

export function ProfileAwardsHeader() {
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
    </div>
  );
}
