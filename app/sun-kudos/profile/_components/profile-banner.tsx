"use client";

/**
 * ProfileBanner — Section A (mms_A_Info)
 * Avatar (200px circular, white border 4px) + name (36px yellow) +
 * title/dept (22px white) + badge collection row (mms_A.3_Huy Hiệu).
 *
 * Layout: centered column over the keyvisual banner.
 * Design values from MoMorph node 362:5052.
 */

import Image from "next/image";
import { ProfileBadgeCollection } from "./profile-badge-collection";

const FM = "var(--font-montserrat), system-ui, sans-serif";

export type ProfileBannerProps = {
  name: string;
  /** Employee code / title e.g. "CEVC3" */
  employeeCode: string;
  avatarUrl: string | null;
  heroRank: string | null;
  /** Collectible icon ids (1..6) the user owns — fills the A.3 icon row. */
  ownedIcons: number[];
};

export function ProfileBanner({
  name,
  employeeCode,
  avatarUrl,
  heroRank,
  ownedIcons,
}: ProfileBannerProps) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    /* mms_A_Info — absolute fill of banner area, centered column, gap 32px */
    <div
      className="relative z-10 flex w-full flex-col items-center"
      style={{ gap: "32px", paddingTop: "40px", paddingBottom: "40px" }}
    >
      {/* A.1 — Avatar 200x200, white border 4px, circle */}
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "4px solid #FFF",
          overflow: "hidden",
          flexShrink: 0,
          background: "rgba(255,234,158,0.2)",
          position: "relative",
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              fontFamily: FM,
              fontWeight: 700,
              fontSize: 72,
              color: "#FFEA9E",
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* A.2 — Name + dept/title row */}
      <div
        className="flex flex-col items-center"
        style={{ gap: "8px" }}
      >
        {/* A.2.1 Name — 36px gold 700 */}
        <h1
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "clamp(24px, 2.5vw, 36px)",
            lineHeight: "44px",
            color: "#FFEA9E",
            textAlign: "center",
          }}
        >
          {name}
        </h1>

        {/* A.2.2 — dept + title row: 22px white 700 */}
        <div
          className="flex items-center"
          style={{ gap: "10px" }}
        >
          <span
            style={{
              fontFamily: FM,
              fontWeight: 700,
              fontSize: "22px",
              lineHeight: "28px",
              color: "#FFFFFF",
            }}
          >
            {employeeCode}
          </span>

          {heroRank && (
            <>
              {/* separator dot */}
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.5)",
                  flexShrink: 0,
                }}
              />
              <Image
                src={heroRankSrc(heroRank)}
                alt={heroRank}
                width={110}
                height={20}
                unoptimized
                style={{ height: 20, width: "auto" }}
              />
            </>
          )}
        </div>
      </div>

      {/* A.3 — "Bộ sưu tập icon của tôi": 6 icon slots + label (node 362:5064 + 3053:10052) */}
      <div className="flex w-full flex-col items-center" style={{ gap: "8px" }}>
        <ProfileBadgeCollection ownedIcons={ownedIcons} />
        <span
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "22px",
            lineHeight: "28px",
            color: "#FFFFFF",
          }}
        >
          Bộ sưu tập icon của tôi
        </span>
      </div>
    </div>
  );
}

function heroRankSrc(rank: string): string {
  const map: Record<string, string> = {
    "new hero": "/sun-kudos/hero-badges/new-hero.png",
    "rising hero": "/sun-kudos/hero-badges/rising-hero.png",
    "super hero": "/sun-kudos/hero-badges/super-hero.png",
    "legend hero": "/sun-kudos/hero-badges/legend-hero.png",
  };
  return map[rank.toLowerCase()] ?? map["new hero"];
}
