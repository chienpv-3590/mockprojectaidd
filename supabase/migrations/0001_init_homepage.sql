-- SAA 2025 — Homepage backend schema
-- Tables: awards, event_settings, notifications, kudos
-- All tables have RLS enabled. Read policies are scoped appropriately.

create extension if not exists pgcrypto;

-- ============================================================================
-- AWARDS — public-readable catalog of award categories
-- ============================================================================
create table if not exists public.awards (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,            -- 'top-talent', 'top-project', ...
  title_vi       text not null,
  description_vi text not null,
  thumbnail_path text,                            -- e.g. '/home/awards/top-talent.png'
  display_order  smallint not null
);

alter table public.awards enable row level security;

drop policy if exists "awards readable by anyone" on public.awards;
create policy "awards readable by anyone"
  on public.awards for select
  using (true);

-- ============================================================================
-- EVENT_SETTINGS — single-row config (e.g. event date)
-- ============================================================================
create table if not exists public.event_settings (
  key   text primary key,
  value text not null
);

alter table public.event_settings enable row level security;

drop policy if exists "event_settings readable by anyone" on public.event_settings;
create policy "event_settings readable by anyone"
  on public.event_settings for select
  using (true);

-- ============================================================================
-- NOTIFICATIONS — per-user, RLS-scoped
-- ============================================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_read_created_idx
  on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "users see own notifications" on public.notifications;
create policy "users see own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- KUDOS — peer recognition, recipient reads own
-- ============================================================================
create table if not exists public.kudos (
  id         uuid primary key default gen_random_uuid(),
  from_user  uuid not null references auth.users(id) on delete cascade,
  to_user    uuid not null references auth.users(id) on delete cascade,
  message    text,
  created_at timestamptz not null default now()
);

create index if not exists kudos_to_user_created_idx
  on public.kudos (to_user, created_at desc);

alter table public.kudos enable row level security;

drop policy if exists "users see kudos they received" on public.kudos;
create policy "users see kudos they received"
  on public.kudos for select
  using (auth.uid() = to_user);
