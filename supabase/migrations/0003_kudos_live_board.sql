-- SAA 2025 — Sun Kudos Live Board: full schema extension
-- Idempotent: all CREATE use IF NOT EXISTS; all ALTER columns guarded.
-- Run order: departments → user_profiles → hashtags → alter kudos
--            → kudos_hashtags → kudos_images → kudos_hearts
--            → special_days → secret_boxes → RLS → functions/views
--            → storage bucket + policies

-- ============================================================================
-- EXTENSION
-- ============================================================================
create extension if not exists pgcrypto;

-- ============================================================================
-- DEPARTMENTS — lookup table
-- ============================================================================
create table if not exists public.departments (
  code          text primary key,
  name_vi       text not null,
  display_order int  not null default 0
);

-- ============================================================================
-- USER_PROFILES — extends auth.users with department/title/avatar
-- ============================================================================
create table if not exists public.user_profiles (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  full_name_vi    text not null,
  department_code text references public.departments(code) on delete set null,
  employee_code   text,
  title           text,
  avatar_url      text,
  updated_at      timestamptz not null default now()
);

-- ============================================================================
-- HASHTAGS — curated list of large labels and small tags
-- ============================================================================
create table if not exists public.hashtags (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  label_vi      text not null,
  kind          text not null check (kind in ('feature','small')),
  display_order int  not null default 0
);

-- ============================================================================
-- EXTEND KUDOS — add hashtag_id + updated_at (idempotent)
-- ============================================================================
alter table public.kudos
  add column if not exists hashtag_id uuid references public.hashtags(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists kudos_created_idx      on public.kudos (created_at desc);
create index if not exists kudos_from_user_idx    on public.kudos (from_user, created_at desc);

-- ============================================================================
-- KUDOS_HASHTAGS — small tag join (multiple per kudos)
-- ============================================================================
create table if not exists public.kudos_hashtags (
  kudos_id   uuid references public.kudos(id)    on delete cascade,
  hashtag_id uuid references public.hashtags(id) on delete cascade,
  primary key (kudos_id, hashtag_id)
);

-- ============================================================================
-- KUDOS_IMAGES — up to 5 per kudos
-- ============================================================================
create table if not exists public.kudos_images (
  id            uuid     primary key default gen_random_uuid(),
  kudos_id      uuid     not null references public.kudos(id) on delete cascade,
  storage_path  text     not null,
  display_order smallint not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists kudos_images_kudos_idx on public.kudos_images (kudos_id, display_order);

-- ============================================================================
-- KUDOS_HEARTS — 1 per (kudos, user). Weight = 1 normally, 2 on special day.
-- ============================================================================
create table if not exists public.kudos_hearts (
  kudos_id   uuid     references public.kudos(id)   on delete cascade,
  user_id    uuid     references auth.users(id)      on delete cascade,
  weight     smallint not null check (weight in (1,2)),
  created_at timestamptz not null default now(),
  primary key (kudos_id, user_id)
);
create index if not exists kudos_hearts_kudos_idx on public.kudos_hearts (kudos_id);

-- ============================================================================
-- SPECIAL_DAYS — admin-seeded date ranges; 2× hearts apply
-- ============================================================================
create table if not exists public.special_days (
  id         uuid     primary key default gen_random_uuid(),
  date_from  date     not null,
  date_to    date     not null,
  multiplier smallint not null default 2 check (multiplier in (1,2)),
  note       text
);

-- ============================================================================
-- SECRET_BOXES — earned per N kudos received
-- ============================================================================
create table if not exists public.secret_boxes (
  id              uuid primary key default gen_random_uuid(),
  owner           uuid not null references auth.users(id) on delete cascade,
  status          text not null check (status in ('unopened','opened','claimed')),
  reward_label_vi text,
  opened_at       timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists secret_boxes_owner_idx on public.secret_boxes (owner, status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.departments    enable row level security;
alter table public.user_profiles  enable row level security;
alter table public.hashtags       enable row level security;
alter table public.kudos_hashtags enable row level security;
alter table public.kudos_images   enable row level security;
alter table public.kudos_hearts   enable row level security;
alter table public.special_days   enable row level security;
alter table public.secret_boxes   enable row level security;

-- Public read for catalog tables (idempotent)
drop policy if exists "all read departments"    on public.departments;
create policy "all read departments"            on public.departments    for select using (true);

drop policy if exists "all read hashtags"       on public.hashtags;
create policy "all read hashtags"               on public.hashtags       for select using (true);

drop policy if exists "all read special_days"   on public.special_days;
create policy "all read special_days"           on public.special_days   for select using (true);

drop policy if exists "all read user_profiles"  on public.user_profiles;
create policy "all read user_profiles"          on public.user_profiles  for select using (true);

-- Replace existing kudos SELECT policy — Live Board needs ALL authenticated reads
drop policy if exists "users see kudos they received" on public.kudos;
drop policy if exists "auth read all kudos"           on public.kudos;
create policy "auth read all kudos" on public.kudos
  for select using (auth.role() = 'authenticated');

-- Hearts: auth read all
drop policy if exists "auth read all kudos_hearts"    on public.kudos_hearts;
create policy "auth read all kudos_hearts" on public.kudos_hearts
  for select using (auth.role() = 'authenticated');

-- Hearts: insert/delete match auth.uid()
drop policy if exists "user manages own hearts insert" on public.kudos_hearts;
create policy "user manages own hearts insert" on public.kudos_hearts
  for insert with check (auth.uid() = user_id);

drop policy if exists "user manages own hearts delete" on public.kudos_hearts;
create policy "user manages own hearts delete" on public.kudos_hearts
  for delete using (auth.uid() = user_id);

-- Images + hashtags: auth read all
drop policy if exists "auth read kudos_images"    on public.kudos_images;
create policy "auth read kudos_images" on public.kudos_images
  for select using (auth.role() = 'authenticated');

drop policy if exists "auth read kudos_hashtags"  on public.kudos_hashtags;
create policy "auth read kudos_hashtags" on public.kudos_hashtags
  for select using (auth.role() = 'authenticated');

-- Kudos: submitter writes own
drop policy if exists "user inserts own kudos"           on public.kudos;
create policy "user inserts own kudos" on public.kudos
  for insert with check (auth.uid() = from_user);

drop policy if exists "user inserts own kudos_images"    on public.kudos_images;
create policy "user inserts own kudos_images" on public.kudos_images
  for insert with check (
    exists (select 1 from public.kudos k where k.id = kudos_id and k.from_user = auth.uid())
  );

drop policy if exists "user inserts own kudos_hashtags"  on public.kudos_hashtags;
create policy "user inserts own kudos_hashtags" on public.kudos_hashtags
  for insert with check (
    exists (select 1 from public.kudos k where k.id = kudos_id and k.from_user = auth.uid())
  );

-- Secret boxes: owner manages their own boxes (incl. pending/unopened)…
drop policy if exists "owner reads secret_boxes"   on public.secret_boxes;
create policy "owner reads secret_boxes" on public.secret_boxes
  for select using (auth.uid() = owner);

-- …and the "10 Sunner nhận quà mới nhất" leaderboard (D.3) is company-wide,
-- so any authenticated user may read boxes that have already been received
-- (opened/claimed). Pending (unopened) boxes stay private to their owner.
drop policy if exists "anyone reads received secret_boxes" on public.secret_boxes;
create policy "anyone reads received secret_boxes" on public.secret_boxes
  for select to authenticated
  using (status in ('opened', 'claimed'));

drop policy if exists "owner updates secret_boxes" on public.secret_boxes;
create policy "owner updates secret_boxes" on public.secret_boxes
  for update using (auth.uid() = owner);

-- ============================================================================
-- HELPER FUNCTION: kudos_tier
-- ============================================================================
create or replace function public.kudos_tier(received int)
returns smallint
language sql immutable
as $$
  select case
    when received >= 50 then 3
    when received >= 20 then 2
    when received >= 10 then 1
    else 0
  end::smallint
$$;

-- ============================================================================
-- VIEW: user_heart_totals
-- ============================================================================
create or replace view public.user_heart_totals as
select
  k.to_user                              as user_id,
  coalesce(sum(h.weight), 0)::int        as total_hearts
from public.kudos k
left join public.kudos_hearts h on h.kudos_id = k.id
group by k.to_user;

-- ============================================================================
-- VIEW: user_kudos_received_counts
-- ============================================================================
create or replace view public.user_kudos_received_counts as
select
  to_user          as user_id,
  count(*)::int    as received_count
from public.kudos
group by to_user;

-- ============================================================================
-- VIEW: kudos_card_view — join kudos + sender profile + receiver profile +
--       hashtag + heart count.  Images and small hashtag tags are joined via
--       PostgREST nested selects in Phase 02 — not duplicated here.
-- ============================================================================
create or replace view public.kudos_card_view as
select
  k.id,
  k.created_at,
  k.updated_at,
  k.message,
  k.from_user,
  k.to_user,
  k.hashtag_id,

  -- sender profile (nullable if not yet created)
  sp.full_name_vi    as sender_name,
  sp.avatar_url      as sender_avatar,
  sp.department_code as sender_department,
  sp.title           as sender_title,

  -- receiver profile (nullable if not yet created)
  rp.full_name_vi    as receiver_name,
  rp.avatar_url      as receiver_avatar,
  rp.department_code as receiver_department,
  rp.title           as receiver_title,

  -- feature hashtag label
  h.label_vi         as hashtag_label,
  h.code             as hashtag_code,

  -- aggregate heart count (weighted)
  coalesce(hc.total_weight, 0)::int as heart_count

from public.kudos k
left join public.user_profiles   sp on sp.user_id = k.from_user
left join public.user_profiles   rp on rp.user_id = k.to_user
left join public.hashtags        h  on h.id       = k.hashtag_id
left join (
  select kudos_id, sum(weight)::int as total_weight
  from public.kudos_hearts
  group by kudos_id
) hc on hc.kudos_id = k.id;

-- ============================================================================
-- ATOMIC SUBMIT FUNCTION (Phase 03 dependency)
-- Inserts kudos + images + small hashtags in a single transaction.
-- Called from Next.js server action via service_role or RPC.
-- ============================================================================
create or replace function public.submit_kudos_atomic(
  p_from_user    uuid,
  p_to_user      uuid,
  p_message      text,
  p_hashtag_id   uuid,              -- feature hashtag (nullable)
  p_small_tags   uuid[],            -- array of small hashtag IDs
  p_image_paths  text[]             -- array of storage paths (up to 5)
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kudos_id uuid;
  v_path     text;
  v_tag      uuid;
  v_order    smallint := 0;
begin
  -- Insert the kudos row
  insert into public.kudos (from_user, to_user, message, hashtag_id)
  values (p_from_user, p_to_user, p_message, p_hashtag_id)
  returning id into v_kudos_id;

  -- Insert images (up to 5)
  if p_image_paths is not null then
    foreach v_path in array p_image_paths loop
      insert into public.kudos_images (kudos_id, storage_path, display_order)
      values (v_kudos_id, v_path, v_order);
      v_order := v_order + 1;
      exit when v_order >= 5;
    end loop;
  end if;

  -- Insert small hashtag joins
  if p_small_tags is not null then
    foreach v_tag in array p_small_tags loop
      insert into public.kudos_hashtags (kudos_id, hashtag_id)
      values (v_kudos_id, v_tag)
      on conflict do nothing;
    end loop;
  end if;

  return v_kudos_id;
end;
$$;

grant execute on function public.submit_kudos_atomic(uuid, uuid, text, uuid, uuid[], text[]) to authenticated;

-- ============================================================================
-- STORAGE BUCKET: kudos-images (idempotent)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('kudos-images', 'kudos-images', false)
on conflict do nothing;

-- Storage policy: authenticated users can read any kudos image
drop policy if exists "auth read kudos images" on storage.objects;
create policy "auth read kudos images"
  on storage.objects for select
  using (
    bucket_id = 'kudos-images'
    and auth.role() = 'authenticated'
  );

-- Storage policy: owner can insert only under their own path prefix
-- Path convention: kudos-images/{user_id}/{filename}
drop policy if exists "owner inserts own kudos images" on storage.objects;
create policy "owner inserts own kudos images"
  on storage.objects for insert
  with check (
    bucket_id = 'kudos-images'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
