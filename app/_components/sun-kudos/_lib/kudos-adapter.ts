/**
 * Adapters between DB-layer types (lib/data/types.ts) and
 * UI-layer types (app/_components/sun-kudos/types.ts).
 *
 * The UI was built in Phase 04 with legacy flat shapes.
 * Phase 08 adds real data without touching component internals.
 */

import type { KudosCardData as DbKudosCard, UserProfile } from "@/lib/data/types";
import type { KudosCardData as UIKudosCard, KudosUser, SecretBoxRecipient } from "../types";

/** Format ISO timestamp → "HH:MM - DD/MM/YYYY" for display. */
function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${hh}:${mm} - ${dd}/${mo}/${yyyy}`;
  } catch {
    return iso;
  }
}

function toKudosUser(profile: UserProfile): KudosUser {
  return {
    id: profile.user_id,
    name: profile.full_name_vi,
    // Spec B.3.2 shows the department CODE (e.g. "CEVC1"), not the full name.
    department: profile.department_code ?? profile.department_name_vi ?? undefined,
    avatarUrl: profile.avatar_url ?? null,
    heroRank: profile.hero_rank ?? null,
  };
}

/** Convert DB KudosCardData → UI KudosCardData. */
export function adaptKudosCard(db: DbKudosCard): UIKudosCard {
  return {
    id: db.id,
    sender: toKudosUser(db.sender),
    receiver: toKudosUser(db.receiver),
    featureHashtag: db.feature_hashtag?.label_vi ?? "",
    hashtags: db.small_hashtags.map((h) => h.label_vi),
    content: db.message,
    createdAt: formatCreatedAt(db.created_at),
    heartCount: db.heart_count,
    isHearted: db.liked_by_me,
    canLike: db.can_like,
    images: db.images.map((img, i) => ({
      id: `${db.id}-img-${i}`,
      url: img.signed_url,
      alt: "",
    })),
  };
}

/** Convert an array of DB cards to UI cards. */
export function adaptKudosCards(rows: DbKudosCard[]): UIKudosCard[] {
  return rows.map(adaptKudosCard);
}

/** Convert secret box recipient from DB shape to UI shape. */
export function adaptSecretBoxRecipient(
  r: { user: UserProfile; reward_label_vi: string; opened_at: string }
): SecretBoxRecipient {
  return {
    id: r.user.user_id,
    name: r.user.full_name_vi,
    avatarUrl: r.user.avatar_url ?? null,
    rewardLabel: r.reward_label_vi,
  };
}
