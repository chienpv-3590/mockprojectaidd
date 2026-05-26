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
