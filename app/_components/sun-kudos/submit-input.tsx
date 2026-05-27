"use client";

const FM = "var(--font-montserrat), system-ui, sans-serif";

type SubmitInputProps = {
  placeholder?: string;
  onOpenDialog?: () => void;
};

/**
 * SubmitInput — A.1_Button ghi nhận (node 2940:13449).
 *
 * Design specs:
 *   - Width 738px, height 72px, border-radius 68px
 *   - Border: 1px solid #998C5F
 *   - Background: rgba(255, 234, 158, 0.10)
 *   - Pen icon (MM_MEDIA_Pen 24×24) on the left
 *   - Placeholder text: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?"
 *     16px white Montserrat 700
 *   - Entire pill is a click target that opens the kudos submit dialog
 */
export function SubmitInput({
  placeholder = "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
  onOpenDialog,
}: SubmitInputProps) {
  return (
    <button
      type="button"
      aria-label={placeholder}
      onClick={onOpenDialog}
      className="flex flex-1 items-center gap-4 transition hover:bg-[rgba(255,234,158,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]"
      style={{
        height: "72px",
        borderRadius: "68px",
        border: "1px solid #998C5F",
        background: "rgba(255,234,158,0.10)",
        padding: "24px 16px",
        cursor: "text",
        minWidth: 0,
      }}
    >
      {/* Pen icon (inline SVG — matches MM_MEDIA_Pen, 24×24) */}
      <span className="shrink-0" aria-hidden>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
            fill="white"
          />
        </svg>
      </span>

      {/* Placeholder text */}
      <span
        className="truncate text-left"
        style={{
          fontFamily: FM,
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "24px",
          letterSpacing: "0.15px",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        {placeholder}
      </span>
    </button>
  );
}
