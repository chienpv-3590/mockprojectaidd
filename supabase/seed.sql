-- SAA 2025 — Homepage mock data seed
-- Idempotent. Safe to re-run.

-- ============================================================================
-- AWARDS — 6 categories per MoMorph spec C2.1 – C2.6
-- ============================================================================
insert into public.awards (code, title_vi, description_vi, thumbnail_path, display_order)
values
  ('top-talent',         'Top Talent',                'Vinh danh top cá nhân xuất sắc trên mọi phương diện',                       '/home/awards/top-talent.png',             1),
  ('top-project',        'Top Project',               'Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật', '/home/awards/top-project.png',            2),
  ('top-project-leader', 'Top Project Leader',        'Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá',          '/home/awards/top-project-leader.png',     3),
  ('best-manager',       'Best Manager',              'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',         '/home/awards/best-manager.png',           4),
  ('signature-creator',  'Signature 2025 - Creator',  'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',         '/home/awards/signature-2025-creator.png', 5),
  ('mvp',                'MVP (Most Valuable Person)','Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',         '/home/awards/mvp.png',                    6)
on conflict (code) do update set
  title_vi       = excluded.title_vi,
  description_vi = excluded.description_vi,
  thumbnail_path = excluded.thumbnail_path,
  display_order  = excluded.display_order;

-- ============================================================================
-- EVENT_SETTINGS — countdown target date (Vietnam timezone)
-- ============================================================================
insert into public.event_settings (key, value)
values ('saa_event_date', '2026-12-31T19:00:00+07:00')
on conflict (key) do update set value = excluded.value;

-- ============================================================================
-- Per-user demo data — call after first login to seed notifications + kudos
-- for the currently authenticated user. SECURITY DEFINER so it can write to
-- RLS-protected tables, but only ever for the caller's own auth.uid().
-- ============================================================================
create or replace function public.seed_demo_data_for_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No authenticated user — call this after signing in.';
  end if;

  -- Notifications (5 sample rows). Skip if user already has any.
  if not exists (select 1 from public.notifications where user_id = uid) then
    insert into public.notifications (user_id, title, body) values
      (uid, 'Chào mừng bạn đến với SAA 2025!', 'Khám phá các hạng mục giải thưởng năm nay.'),
      (uid, 'Đề cử của bạn đã được gửi',       'Cảm ơn bạn đã tham gia.'),
      (uid, 'Top Talent: bình chọn đang diễn ra', 'Hãy bình chọn cho ứng viên yêu thích!'),
      (uid, 'Sự kiện sắp diễn ra',              'Đếm ngược 30 ngày đến SAA 2025.'),
      (uid, 'Bạn vừa nhận được một lời khen',  'Một đồng nghiệp vừa gửi Kudos cho bạn.');
  end if;

  -- Kudos (3 sample rows, self-referencing for demo simplicity).
  if not exists (select 1 from public.kudos where to_user = uid) then
    insert into public.kudos (from_user, to_user, message) values
      (uid, uid, 'Tự cảm ơn bản thân!'),
      (uid, uid, 'Hoàn thành xuất sắc tuần này.'),
      (uid, uid, 'Cảm ơn vì sự nhiệt tình.');
  end if;
end;
$$;

grant execute on function public.seed_demo_data_for_current_user() to authenticated;
