/**
 * TitleBadge — "danh hiệu" Hero badge shown under a person's name on Kudos cards.
 * Spec B.3.2/B.3.6 + "Thể lệ" screen (b1Filzi9i6).
 *
 * The badge is the actual Figma artwork (component set 3007:17505), NOT a flat
 * gradient pill: a dark-teal pill with a #FFEA9E border and a copper feather,
 * where only the FIRST word is rank-coloured (New=white, Rising=green,
 * Super=red, Legend=all gold on a brighter ground). We render the exported PNG
 * per rank so it matches pixel-for-pixel. Four ranks by distinct-sender count:
 *   New (1-4) · Rising (5-9) · Super (10-20) · Legend (>20).
 */
import Image from "next/image";

// Native artwork size from Figma (≈109×19, exported at 110×20). The pill has
// transparent rounded corners so it sits cleanly on both card variants.
const BADGE_W = 110;
const BADGE_H = 20;

// Keyed by lower-cased rank label. Fallback → New Hero.
const RANK_BADGES: Record<string, string> = {
  "new hero": "/sun-kudos/hero-badges/new-hero.png",
  "rising hero": "/sun-kudos/hero-badges/rising-hero.png",
  "super hero": "/sun-kudos/hero-badges/super-hero.png",
  "legend hero": "/sun-kudos/hero-badges/legend-hero.png",
};

export function TitleBadge({ title }: { title: string }) {
  const src = RANK_BADGES[title.trim().toLowerCase()] ?? RANK_BADGES["new hero"];
  return (
    <Image
      src={src}
      alt={title}
      width={BADGE_W}
      height={BADGE_H}
      unoptimized
      style={{ height: BADGE_H, width: "auto", display: "inline-block" }}
    />
  );
}
