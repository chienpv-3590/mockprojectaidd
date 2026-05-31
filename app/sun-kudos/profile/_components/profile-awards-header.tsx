"use client";

/**
 * ProfileAwardsHeader — Section C (mms_C_Header Giải thưởng)
 * "Sun* Annual Awards 2025" eyebrow (24px white 700)
 * + 1px divider (#2E3940)
 * + large "KUDOS" title (57px gold 700) left + year dropdown right (C.3_Button)
 *
 * Design values from MoMorph nodes:
 *   362:5084 — section container (padding 0 144px)
 *   362:5085 — C.1 title text
 *   362:5088 — C.2 KUDOS title
 *   362:5089 — C.3 dropdown button (border #998C5F, bg rgba(255,234,158,0.10))
 */

const FM = "var(--font-montserrat), system-ui, sans-serif";

export type ProfileAwardsHeaderProps = {
  years: number[];
  year: number;
  onYearChange: (year: number) => void;
};

export function ProfileAwardsHeader({
  years,
  year,
  onYearChange,
}: ProfileAwardsHeaderProps) {
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

      {/* C.2 "KUDOS" + C.3 dropdown row */}
      <div
        className="flex items-center justify-between"
        style={{ gap: "16px", flexWrap: "wrap" }}
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

        {/* C.3 — Year/edition dropdown button
            border 1px #998C5F, bg rgba(255,234,158,0.10), radius 4px, padding 16px 24px */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            aria-label="Chọn đợt giải thưởng"
            style={{
              fontFamily: FM,
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "24px",
              letterSpacing: "0.15px",
              color: "#FFFFFF",
              background: "rgba(255, 234, 158, 0.10)",
              border: "1px solid #998C5F",
              borderRadius: "4px",
              padding: "16px 48px 16px 24px",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
              outline: "none",
            }}
          >
            {years.map((y) => (
              <option
                key={y}
                value={y}
                style={{ background: "#00101A", color: "#FFFFFF" }}
              >
                Năm {y}
              </option>
            ))}
          </select>

          {/* Chevron-down icon */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "#FFFFFF",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
