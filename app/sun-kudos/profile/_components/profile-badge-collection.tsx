"use client";

/**
 * ProfileBadgeCollection — Section A.3 "Bộ sưu tập icon của tôi" (node 362:5064).
 *
 * A horizontal row of 6 circular slots, one per exclusive SAA collectible icon.
 * Icons the user has WON from Secret Boxes render in full colour; icons not yet
 * won (or the reserved slot with no artwork) render as a locked dark slot.
 *
 * Each slot: 64px circle, 2px white border (design nodes 362:5066 / B2.1, fill
 * #323231). The icon catalog is the single source of truth (see
 * lib/sun-kudos/secret-box-icons).
 */

import Image from "next/image";
import { SECRET_BOX_ICONS } from "@/lib/sun-kudos/secret-box-icons";

type Props = {
  /** Icon ids (1..6) the user owns (won from opened Secret Boxes). */
  ownedIcons: number[];
};

export function ProfileBadgeCollection({ ownedIcons }: Props) {
  const owned = new Set(ownedIcons);

  return (
    <div
      className="flex w-full items-center justify-center"
      aria-label="Bộ sưu tập icon của tôi"
      style={{ gap: "16px" }}
    >
      {SECRET_BOX_ICONS.map((icon) => (
        <IconSlot
          key={icon.id}
          src={icon.src}
          label={icon.label}
          owned={icon.src !== null && owned.has(icon.id)}
        />
      ))}
    </div>
  );
}

function IconSlot({
  src,
  label,
  owned,
}: {
  src: string | null;
  label: string;
  owned: boolean;
}) {
  // Locked slot: not yet won, or artwork pending (src === null).
  if (!owned || !src) {
    return (
      <div
        title={src ? `${label} (chưa mở khóa)` : label}
        aria-label={src ? `${label} — chưa mở khóa` : `${label} — sắp ra mắt`}
        style={{
          width: 64,
          height: 64,
          borderRadius: "100px",
          border: "2px solid rgba(255,255,255,0.5)",
          background: "#323231",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* Lock glyph */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect x="5" y="11" width="14" height="9" rx="2" stroke="rgba(255,234,158,0.45)" strokeWidth="1.5" />
          <path
            d="M8 11V7a4 4 0 0 1 8 0v4"
            stroke="rgba(255,234,158,0.45)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // Owned: full-colour icon inside the circular frame.
  return (
    <div
      title={label}
      style={{
        width: 64,
        height: 64,
        borderRadius: "100px",
        border: "2px solid #FFF",
        overflow: "hidden",
        flexShrink: 0,
        background: "#323231",
      }}
    >
      <Image
        src={src}
        alt={label}
        width={64}
        height={64}
        unoptimized
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}
