/**
 * Adapters between DB-layer types (lib/data/types.ts) and
 * UI-layer types (app/_components/sun-kudos/types.ts).
 *
 * The UI was built in Phase 04 with legacy flat shapes.
 * Phase 08 adds real data without touching component internals.
 */

import type { KudosCardData as DbKudosCard, UserProfile } from "@/lib/data/types";
import type { KudosCardData as UIKudosCard, KudosUser, SecretBoxRecipient } from "../types";

/**
 * Format ISO timestamp → "HH:MM - DD/MM/YYYY" in Vietnam time (UTC+7).
 *
 * The formatter pins an explicit `timeZone` so the output is byte-identical on
 * the server and in the browser. This adapter runs inside client components
 * (initial `useState` + realtime updates), so timezone-local getters
 * (getHours/getDate/…) would format UTC during SSR but local time during
 * hydration — a React hydration mismatch that surfaces as
 * "Failed to execute 'measure' on 'Performance': '<Component>' cannot have a
 * negative time stamp" via React's dev performance track. A fixed `timeZone`
 * keeps both render passes deterministic and shows the intended local time.
 */
const createdAtFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  hourCycle: "h23",
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const parts: Record<string, string> = {};
  for (const p of createdAtFormatter.formatToParts(d)) parts[p.type] = p.value;
  return `${parts.hour}:${parts.minute} - ${parts.day}/${parts.month}/${parts.year}`;
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
