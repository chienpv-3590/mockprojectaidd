/**
 * Hero rank (danh hiệu) for Kudos recipients — spec "Thể lệ" screen (b1Filzi9i6).
 *
 * The rank is derived from the number of DISTINCT teammates who have sent the
 * user a Kudos ("số lượng đồng đội gửi trao Kudos"):
 *   1–4  senders → New Hero
 *   5–9  senders → Rising Hero
 *   10–20 senders → Super Hero
 *   >20  senders → Legend Hero
 *   0    senders → no badge (null)
 */
export type HeroRank = "New Hero" | "Rising Hero" | "Super Hero" | "Legend Hero";

export function heroRankFromSenderCount(distinctSenders: number): HeroRank | null {
  if (distinctSenders <= 0) return null;
  if (distinctSenders <= 4) return "New Hero";
  if (distinctSenders <= 9) return "Rising Hero";
  if (distinctSenders <= 20) return "Super Hero";
  return "Legend Hero";
}
