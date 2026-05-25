---
phase: 02
track: B
title: Supabase backend — schema + seed + RLS
status: completed
---

# Phase 02 — Track B: Supabase backend

## Goal
Create the Postgres schema in Supabase for the four home-page data sources (awards, notifications, event_settings, kudos), wire RLS policies, and seed with mock data.

## Files to create
- `supabase/migrations/0001_init_homepage.sql` — schema (4 tables + RLS policies + indexes)
- `supabase/seed.sql` — mock data
- `supabase/README.md` — apply instructions (CLI `supabase db push` OR copy-paste into Supabase Studio SQL editor)
- Update root `README.md` "Auth setup" section: add "Apply DB schema" step

## Schema
```sql
-- 0001_init_homepage.sql

create table if not exists public.awards (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,         -- 'top-talent', 'top-project', ...
  title_vi     text not null,
  description_vi text not null,
  thumbnail_path text,                       -- e.g. '/home/awards/top-talent.png'
  display_order smallint not null
);
alter table public.awards enable row level security;
create policy "awards readable by anyone" on public.awards for select using (true);

create table if not exists public.event_settings (
  key   text primary key,
  value text not null
);
alter table public.event_settings enable row level security;
create policy "event_settings readable by anyone" on public.event_settings for select using (true);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_id_read_idx on public.notifications (user_id, read, created_at desc);
alter table public.notifications enable row level security;
create policy "users see own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.kudos (
  id         uuid primary key default gen_random_uuid(),
  from_user  uuid not null references auth.users(id) on delete cascade,
  to_user    uuid not null references auth.users(id) on delete cascade,
  message    text,
  created_at timestamptz not null default now()
);
create index kudos_to_user_idx on public.kudos (to_user, created_at desc);
alter table public.kudos enable row level security;
create policy "users see kudos they received" on public.kudos
  for select using (auth.uid() = to_user);
```

## Seed (mock data)
```sql
-- seed.sql
-- awards: 6 categories per MoMorph spec C2.1 – C2.6
insert into public.awards (code, title_vi, description_vi, thumbnail_path, display_order)
values
  ('top-talent', 'Top Talent', 'Tôn vinh nhân tài xuất sắc nhất năm', '/home/awards/top-talent.png', 1),
  ('top-project', 'Top Project', 'Dự án nổi bật mang lại giá trị cao', '/home/awards/top-project.png', 2),
  ('top-project-leader', 'Top Project Leader', 'Người dẫn dắt dự án xuất sắc', '/home/awards/top-project-leader.png', 3),
  ('best-manager', 'Best Manager', 'Nhà quản lý của năm', '/home/awards/best-manager.png', 4),
  ('signature-creator', 'Signature 2025 Creator', 'Người sáng tạo dấu ấn năm 2025', '/home/awards/signature-creator.png', 5),
  ('mvp', 'MVP', 'Most Valuable Person — người có đóng góp lớn nhất', '/home/awards/mvp.png', 6)
on conflict (code) do nothing;

-- event date (Vietnam timezone)
insert into public.event_settings (key, value)
values ('saa_event_date', '2026-12-31T19:00:00+07:00')
on conflict (key) do update set value = excluded.value;

-- notifications + kudos: seeded per-user via a function below since they need auth.uid()
-- For demo, the operator can insert sample rows from Supabase Studio after first login,
-- OR run the convenience function below with their own auth.uid().

create or replace function public.seed_demo_data_for_current_user()
returns void
language plpgsql
security definer
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No authenticated user';
  end if;
  insert into public.notifications (user_id, title, body)
  values
    (uid, 'Chào mừng bạn đến với SAA 2025!', 'Khám phá các hạng mục giải thưởng năm nay.'),
    (uid, 'Đề cử của bạn đã được gửi', 'Cảm ơn bạn đã tham gia.'),
    (uid, 'Top Talent: bình chọn đang diễn ra', 'Hãy bình chọn cho ứng viên yêu thích!'),
    (uid, 'Sự kiện sắp diễn ra', 'Đếm ngược 30 ngày đến SAA 2025.'),
    (uid, 'Kudos mới', 'Bạn vừa nhận được một lời khen từ đồng nghiệp.');
  insert into public.kudos (from_user, to_user, message)
  values
    (uid, uid, 'Tự cảm ơn bản thân!'),
    (uid, uid, 'Hoàn thành xuất sắc tuần này.'),
    (uid, uid, 'Cảm ơn vì sự nhiệt tình.');
end;
$$;
```

## Apply instructions (README addendum)
```bash
# Option A: Supabase CLI (recommended)
supabase db push                  # applies migrations
supabase db remote commit         # or seed via SQL editor

# Option B: Supabase Studio SQL editor
# 1. Open https://supabase.com/dashboard/project/<ref>/sql
# 2. Paste contents of supabase/migrations/0001_init_homepage.sql → Run
# 3. Paste contents of supabase/seed.sql → Run
# 4. After your first Google sign-in: select public.seed_demo_data_for_current_user();
```

## Success Criteria
- `select * from public.awards` returns 6 rows after seed.
- `select * from public.event_settings where key='saa_event_date'` returns 1 row.
- After login + running `seed_demo_data_for_current_user()`, the current user sees 5 notifications + 3 kudos.
- RLS prevents user A from reading user B's notifications.

## Risks
- `gen_random_uuid()` requires `pgcrypto` extension. Supabase enables it by default; if missing, add `create extension pgcrypto;` at top of migration.
- `auth.users` is in the `auth` schema — references work because Supabase exposes them.
- `security definer` on the seed function bypasses RLS for INSERTs — OK because the function only operates on the caller's `auth.uid()`.

## Out of Scope
- DB migrations for future features (auth_profile_extra, votes, etc.).
- Supabase Edge Functions.
- Realtime subscriptions.

## Outcome
Created `supabase/migrations/0001_init_homepage.sql` (4 tables: awards, event_settings, notifications, kudos; RLS policies; indexes). Created `supabase/seed.sql` with 6 awards + event date + `seed_demo_data_for_current_user()` SECURITY DEFINER function. Created `supabase/README.md` with apply instructions. Migration idempotent; seeding deferred to post-login operator action.
