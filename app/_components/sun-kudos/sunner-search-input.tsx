"use client";

const FM = "var(--font-montserrat), system-ui, sans-serif";

type SunnerSearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

/**
 * SunnerSearchInput — "Tìm kiếm sunner" pill (node 2940:13450).
 *
 * Design specs (B.7.3 in spec, beside A.1 in "Button chuc nang" row):
 *   - Width 381px, height 72px, border-radius 68px
 *   - Border: 1px solid #998C5F
 *   - Background: rgba(255, 234, 158, 0.10)
 *   - Search icon (magnifier) on the left
 *   - Max input length: 100 chars (spec B.7.3 validationNote)
 *   - Sits right of SubmitInput in a flex row (both share the "Button chuc nang"
 *     frame: SubmitInput at x=144 w=738, this at x=914 w=381)
 */
export function SunnerSearchInput({
  placeholder = "Tìm kiếm sunner",
  value,
  onChange,
}: SunnerSearchInputProps) {
  return (
    <label
      className="relative flex shrink-0 items-center gap-3 transition focus-within:ring-2 focus-within:ring-[#FFEA9E]"
      style={{
        height: "72px",
        width: "clamp(200px, 32vw, 381px)",
        borderRadius: "68px",
        border: "1px solid #998C5F",
        background: "rgba(255,234,158,0.10)",
        padding: "24px 16px",
      }}
    >
      {/* Magnifier icon */}
      <span className="shrink-0 text-white/70" aria-hidden>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="10.5"
            cy="10.5"
            r="6.5"
            stroke="white"
            strokeWidth="2"
            strokeOpacity="0.85"
          />
          <path
            d="M15.5 15.5L20 20"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />
        </svg>
      </span>

      <input
        type="search"
        maxLength={100}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/60"
        style={{
          fontFamily: FM,
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "24px",
          letterSpacing: "0.15px",
          color: "white",
        }}
      />
    </label>
  );
}
