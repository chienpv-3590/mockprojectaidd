/**
 * Internal sub-components for KudosCard.
 * Extracted to keep kudos-card.tsx under 200 LOC.
 */
import Image from "next/image";
import Link from "next/link";
import type { KudosCardData } from "./types";
import { TitleBadge } from "./kudos-title-badge";

export const FM = "var(--font-montserrat), system-ui, sans-serif";

/** Circular avatar with fallback initials. */
export function Avatar({
  url,
  name,
  size = 64,
}: {
  url?: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        border: "1.87px solid #FFF",
        background: "#EEE",
      }}
    >
      {url ? (
        <Image
          src={url}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center bg-[#2E3940] text-white"
          style={{ fontFamily: FM, fontWeight: 700, fontSize: size * 0.3 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

/**
 * Sender or receiver identity block — avatar + name + (department · danh hiệu).
 * Whole block links to the person's profile — spec B.3.2/B.3.5, TC 0952e2f0.
 * Both the Highlight (B.3) and Feed (C.3) cards are cream #FFF8E1, so the
 * identity text is always dark.
 */
export function PersonBlock({
  user,
}: {
  user: KudosCardData["sender"];
}) {
  const nameColor = "#00101A";
  const deptColor = "rgba(0,16,26,0.6)";
  return (
    <Link
      href={`/sun-kudos/profile/${user.id}`}
      aria-label={`Xem hồ sơ của ${user.name}`}
      className="flex flex-col items-center gap-1.5 text-center transition hover:opacity-80"
    >
      <Avatar url={user.avatarUrl} name={user.name} size={64} />
      <span
        style={{
          fontFamily: FM, fontWeight: 700, fontSize: "13px",
          lineHeight: "18px", color: nameColor, maxWidth: "160px",
        }}
        className="line-clamp-2"
      >
        {user.name}
      </span>
      {(user.department || user.heroRank) && (
        <span className="flex items-center justify-center gap-1.5">
          {user.department && (
            <span style={{ fontFamily: FM, fontWeight: 600, fontSize: "11px",
              lineHeight: "16px", color: deptColor }}>
              {user.department}
            </span>
          )}
          {user.department && user.heroRank && (
            <span aria-hidden style={{ width: "4px", height: "4px",
              borderRadius: "50%", background: "rgba(153,153,153,0.6)" }} />
          )}
          {user.heroRank && <TitleBadge title={user.heroRank} />}
        </span>
      )}
    </Link>
  );
}

/**
 * "Send" icon between sender and receiver (spec B.3.4 / C.3.2).
 * Exact design-system glyph (MM_MEDIA_Send) — a filled paper plane, 32×32.
 * Dark fill so it reads on the cream card. The 16px top margin reproduces the
 * C.3.2 frame's `padding: 16px 0`, aligning the icon with the 64px avatars.
 */
export function ArrowIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="mt-4 shrink-0"
    >
      <path
        d="M2.9043 20.4797V4.47974L21.9043 12.4797M4.9043 17.4797L16.7543 12.4797L4.9043 7.47974V10.9797L10.9043 12.4797L4.9043 13.9797M4.9043 17.4797V7.47974V13.9797V17.4797Z"
        fill="#00101A"
      />
    </svg>
  );
}

/**
 * Heart toggle — B.4.4 (node I2940:13465;335:9462).
 * Layout: count first, heart icon to its right. Heart is filled red when
 * liked, otherwise an outline in the card's foreground color.
 */
export function HeartButton({
  count,
  hearted,
  onClick,
  disabled = false,
}: {
  count: number;
  hearted?: boolean;
  onClick?: () => void;
  /** Disable when the viewer is the sender (spec C.4.1 — no self-like). */
  disabled?: boolean;
}) {
  const fg = "#00101A";
  return (
    <button
      type="button"
      aria-label={
        disabled
          ? `${count} tim — không thể thả tim cho kudos của chính bạn`
          : `${count} tim — ${hearted ? "bỏ tim" : "thả tim"}`
      }
      aria-pressed={hearted}
      disabled={disabled}
      title={disabled ? "Không thể thả tim cho kudos của chính bạn" : undefined}
      onClick={disabled ? undefined : onClick}
      className="flex items-center gap-2 transition enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        style={{
          fontFamily: FM,
          fontWeight: 700,
          fontSize: "24px",
          lineHeight: "32px",
          color: fg,
        }}
      >
        {count.toLocaleString("vi-VN")}
      </span>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill={hearted ? "#E53935" : "none"}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M16 27s-12-7.716-12-15.167C4 7.97 6.866 5 10.4 5c2.064 0 3.896 1.046 5.6 3.104C17.704 6.046 19.536 5 21.6 5 25.134 5 28 7.97 28 11.833 28 19.284 16 27 16 27z"
          stroke={hearted ? "#E53935" : fg}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
