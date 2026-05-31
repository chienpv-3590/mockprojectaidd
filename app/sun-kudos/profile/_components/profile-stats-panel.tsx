"use client";

/**
 * ProfileStatsPanel — Section B (mms_B_Thống kê)
 * Dark card (background #00070C, border 1px #998C5F, radius 17px, padding 40px)
 * containing 5 stat rows (B.1–B.5) + divider + gold "Mở Secret Box" button (B.6).
 *
 * Design values from MoMorph nodes:
 *   362:5074 — card container
 *   362:5076..5082 — stat rows + button
 */

const FM = "var(--font-montserrat), system-ui, sans-serif";

export type ProfileStatsPanelProps = {
  received: number;
  sent: number;
  hearts: number;
  /** Optional — only rendered when onOpenSecretBox is provided (self profile). */
  boxOpened?: number;
  /** Optional — only rendered when onOpenSecretBox is provided (self profile). */
  boxUnopened?: number;
  /** When undefined the divider + box rows + "Mở Secret Box" button are hidden. */
  onOpenSecretBox?: () => void;
};

type StatRowProps = {
  label: string;
  value: number;
  /** If true, render a separator line above this row (matches Rectangle 14 in design) */
  withDivider?: boolean;
};

function StatRow({ label, value, withDivider }: StatRowProps) {
  return (
    <>
      {withDivider && (
        <div
          aria-hidden
          style={{
            width: "100%",
            height: 1,
            background: "rgba(153,140,95,0.4)",
            flexShrink: 0,
          }}
        />
      )}
      <div
        className="flex w-full items-center justify-between"
        style={{ gap: "8px", minHeight: "40px" }}
      >
        {/* Label — 22px white 700 */}
        <span
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "clamp(14px, 1.5vw, 22px)",
            lineHeight: "28px",
            color: "#FFFFFF",
          }}
        >
          {label}
        </span>
        {/* Value — 32px gold 700 */}
        <span
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "clamp(20px, 2.2vw, 32px)",
            lineHeight: "40px",
            color: "#FFEA9E",
            flexShrink: 0,
          }}
        >
          {value}
        </span>
      </div>
    </>
  );
}

export function ProfileStatsPanel({
  received,
  sent,
  hearts,
  boxOpened,
  boxUnopened,
  onOpenSecretBox,
}: ProfileStatsPanelProps) {
  const showSecretBox = typeof onOpenSecretBox === "function";

  return (
    /* mms_B_Thống kê outer — dark card */
    <div
      style={{
        background: "var(--Details-Container-2, #00070C)",
        border: "1px solid var(--Details-Border, #998C5F)",
        borderRadius: "17px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
      }}
    >
      {/* B.1 — Số Kudos bạn nhận được */}
      <StatRow label="Số Kudos bạn nhận được:" value={received} />

      {/* B.2 — Số kudos bạn đã gửi */}
      <StatRow label="Số kudos bạn đã gửi:" value={sent} />

      {/* B.3 — Số tim bạn nhận được */}
      <StatRow label="Số tim bạn nhận được:" value={hearts} />

      {/* Secret-box section — only when onOpenSecretBox is provided (self profile) */}
      {showSecretBox && (
        <>
          {/* Rectangle 14 — divider between first 3 rows and secret-box rows */}
          <div
            aria-hidden
            style={{
              width: "100%",
              height: 1,
              background: "rgba(153,140,95,0.4)",
              flexShrink: 0,
            }}
          />

          {/* B.4 — Số Secret Box đã mở */}
          <StatRow label="Số Secret Box đã mở:" value={boxOpened ?? 0} />

          {/* B.5 — Số Secret Box chưa mở */}
          <StatRow label="Số Secret Box chưa mở:" value={boxUnopened ?? 0} />

          {/* B.6 — "Mở Secret Box" button
              Width 600px (design) → 100% here; height 60px; gold bg; radius 8px */}
          <button
            type="button"
            onClick={onOpenSecretBox}
            className="flex w-full items-center justify-center transition hover:brightness-90 active:scale-95"
            style={{
              gap: "8px",
              height: "60px",
              borderRadius: "8px",
              background: "#FFEA9E",
              padding: "16px",
              border: "none",
              cursor: "pointer",
              marginTop: "8px",
            }}
            aria-label="Mở Secret Box"
          >
            {/* Gift icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
                stroke="#00101A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontFamily: FM,
                fontWeight: 700,
                fontSize: "22px",
                lineHeight: "28px",
                color: "#00101A",
              }}
            >
              Mở Secret Box
            </span>
          </button>
        </>
      )}
    </div>
  );
}
