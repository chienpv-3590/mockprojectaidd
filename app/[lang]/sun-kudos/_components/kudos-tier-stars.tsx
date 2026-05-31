/**
 * Tier star rating display for Sun Kudos detail and profile pages.
 * Renders filled/empty stars up to MAX_TIER based on the tier value (0–3).
 */

const STAR_FULL = "★";
const STAR_EMPTY = "☆";
const MAX_TIER = 3;

type Props = { tier: number; size?: number };

export function KudosTierStars({ tier, size = 14 }: Props) {
  return (
    <span aria-label={`Tier ${tier}`} style={{ color: "#FFEA9E", fontSize: size }}>
      {Array.from({ length: MAX_TIER }, (_, i) =>
        i < tier ? STAR_FULL : STAR_EMPTY
      ).join("")}
    </span>
  );
}
