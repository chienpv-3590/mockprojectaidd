export type AwardValueBreakdown = {
  label: string | null;
  amount_text: string;
};

export type Award = {
  id: string;
  code: string;
  title_vi: string;
  description_vi: string;
  thumbnail_path: string | null;
  display_order: number;
  // Detail-page fields (populated by migration 0002_extend_awards). Nullable
  // so legacy rows / home page query path stays safe.
  long_description_vi: string | null;
  quantity_text: string | null;
  unit_text: string | null;
  value_text: string | null;
  value_breakdown: AwardValueBreakdown[] | null;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};

export type Department = { code: string; name_vi: string; display_order: number };

export type Hashtag = {
  id: string;
  code: string;
  label_vi: string;
  kind: "feature" | "small";
  display_order: number;
};

export type UserProfile = {
  user_id: string;
  full_name_vi: string;
  department_code: string | null;
  department_name_vi: string | null;
  employee_code: string | null;
  title: string | null;
  /** Danh hiệu Hero derived from distinct senders (null when none). */
  hero_rank?: string | null;
  avatar_url: string | null;
  tier: 0 | 1 | 2 | 3;
};

export type KudosCardData = {
  id: string;
  message: string;
  created_at: string;
  sender: UserProfile;
  receiver: UserProfile;
  feature_hashtag: Hashtag | null;
  small_hashtags: Hashtag[];
  images: { storage_path: string; signed_url: string }[];
  heart_count: number;
  liked_by_me: boolean;
  can_like: boolean;
};

export type KudosFilters = {
  hashtag_id?: string;
  department_code?: string;
};

export type SecretBoxCounts = { opened: number; unopened: number; total: number };

export type SecretBox = {
  id: string;
  status: "unopened" | "opened" | "claimed";
  reward_label_vi: string | null;
  opened_at: string | null;
};

export type SpotlightNode = {
  user_id: string;
  name: string;
  received_count: number;
  last_received_at: string;
  // Kudos mới nhất user này nhận — dùng để click node mở Kudos detail.
  // Null khi user chưa có kudos nào (degenerate; current query loại bỏ).
  latest_kudos_id: string | null;
};
