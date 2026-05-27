/** Shared data shapes for Sun* Kudos Live Board components.
 *  Phase 08 will replace mock arrays with real Supabase rows.
 */

export type KudosUser = {
  id: string;
  name: string;
  email?: string;
  department?: string;
  avatarUrl?: string | null;
  /** Danh hiệu Hero badge — "New/Rising/Super/Legend Hero" (null when none). */
  heroRank?: string | null;
};

export type KudosHashtag = {
  id: string;
  label: string;
};

export type KudosImage = {
  id: string;
  url: string;
  alt?: string;
};

/** One kudos card datum — shared by highlight, feed, and detail variants. */
export type KudosCardData = {
  id: string;
  sender: KudosUser;
  receiver: KudosUser;
  /** Primary (big-label) hashtag — yellow featured tag */
  featureHashtag: string;
  /** Additional small hashtags */
  hashtags: string[];
  content: string;
  /** ISO datetime or display string */
  createdAt: string;
  heartCount: number;
  /** Has current user hearted this card */
  isHearted?: boolean;
  /** Whether the current user may heart this kudos. False for own kudos / when
   *  signed out (spec C.4.1 — the sender's heart button is disabled). */
  canLike?: boolean;
  images?: KudosImage[];
};

export type SidebarStats = {
  kudosReceived: number;
  kudosSent: number;
  hearts: number;
  secretBoxOpened: number;
  secretBoxPending: number;
};

export type SecretBoxRecipient = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  rewardLabel: string;
};
