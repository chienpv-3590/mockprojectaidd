export type Award = {
  id: string;
  code: string;
  title_vi: string;
  description_vi: string;
  thumbnail_path: string | null;
  display_order: number;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
};
