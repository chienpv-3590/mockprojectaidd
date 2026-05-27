"use client";

import Image from "next/image";
import type { UserProfile } from "@/lib/data/types";

const FM = "var(--font-montserrat), system-ui, sans-serif";

/** Circular avatar for a UserProfile — falls back to initials on missing url. */
export function UserAvatar({ user, size }: { user: UserProfile; size: number }) {
  const initials = user.full_name_vi
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  if (user.avatar_url) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <Image
          src={user.avatar_url}
          alt={user.full_name_vi}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "#2E3940",
        fontFamily: FM,
        fontWeight: 700,
        fontSize: Math.floor(size * 0.38),
        color: "#FFEA9E",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
