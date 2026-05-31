-- SAA 2025 — Sun Kudos Create Form: schema extension
-- Idempotent: all ALTER use IF NOT EXISTS; drop-before-create for changed RPC + view.
-- Depends on: 0003_kudos_live_board.sql (kudos, kudos_hashtags, kudos_images, hashtags)

-- ============================================================================
-- EXTEND KUDOS TABLE — new create-form columns
-- ============================================================================

alter table public.kudos
  add column if not exists title              text,
  add column if not exists is_anonymous       boolean not null default false,
  add column if not exists anonymous_nickname text;

-- ============================================================================
-- KUDOS_MENTIONS — @-mention join table
-- ============================================================================

create table if not exists public.kudos_mentions (
  kudos_id          uuid not null references public.kudos(id) on delete cascade,
  mentioned_user_id uuid not null references auth.users(id)   on delete cascade,
  primary key (kudos_id, mentioned_user_id)
);

create index if not exists kudos_mentions_user_idx
  on public.kudos_mentions (mentioned_user_id);

-- ============================================================================
-- RLS — kudos_mentions
-- ============================================================================

alter table public.kudos_mentions enable row level security;

-- Authenticated users may read all mention rows (for notification pipelines etc.)
drop policy if exists "auth read kudos_mentions" on public.kudos_mentions;
create policy "auth read kudos_mentions" on public.kudos_mentions
  for select using (auth.role() = 'authenticated');
-- No client INSERT policy: writes happen only through the security-definer RPC.

-- ============================================================================
-- REWRITE submit_kudos_atomic
-- Drop the OLD signature first (arg list changed; Postgres won't replace it).
-- ============================================================================

drop function if exists public.submit_kudos_atomic(uuid, uuid, text, uuid, uuid[], text[]);

create or replace function public.submit_kudos_atomic(
  p_from_user           uuid,
  p_to_user             uuid,
  p_message             text,
  p_hashtag_id          uuid,              -- feature hashtag (nullable)
  p_small_tags          uuid[],            -- array of small hashtag IDs
  p_image_paths         text[],            -- array of storage paths (up to 5)
  p_title               text      default null,
  p_is_anonymous        boolean   default false,
  p_anonymous_nickname  text      default null,
  p_mention_ids         uuid[]    default '{}'::uuid[]
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
  v_user     uuid;
  v_order    smallint := 0;
begin
  -- Insert the kudos row (including new columns)
  insert into public.kudos (
    from_user, to_user, message, hashtag_id,
    title, is_anonymous, anonymous_nickname
  )
  values (
    p_from_user, p_to_user, p_message, p_hashtag_id,
    p_title, coalesce(p_is_anonymous, false), p_anonymous_nickname
  )
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

  -- Insert mention rows
  if p_mention_ids is not null then
    foreach v_user in array p_mention_ids loop
      insert into public.kudos_mentions (kudos_id, mentioned_user_id)
      values (v_kudos_id, v_user)
      on conflict do nothing;
    end loop;
  end if;

  return v_kudos_id;
end;
$$;

grant execute on function public.submit_kudos_atomic(
  uuid, uuid, text, uuid, uuid[], text[], text, boolean, text, uuid[]
) to authenticated;

-- ============================================================================
-- REWRITE kudos_card_view — title + is_anonymous + masked sender identity.
-- Column SHAPE/ORDER below intentionally matches the already-deployed view so
-- `create or replace` applies cleanly (Postgres forbids dropping/reordering
-- existing view columns).
--
-- Masking strategy: `from_user` stays raw (used only server-side for joins),
-- while the CLIENT-FACING sender identity is `sender_user_id`, which is NULL
-- for anonymous rows. The actual read path (lib/data/kudos-feed.ts) reads the
-- `kudos` table directly and masks in the normalizer; this view masking is
-- defense-in-depth for any direct consumer.
-- ============================================================================

create or replace view public.kudos_card_view as
select
  k.id,
  k.created_at,
  k.updated_at,
  k.message,
  k.title,
  k.is_anonymous,
  k.from_user,
  k.to_user,
  k.hashtag_id,

  -- Sender profile: mask every identity field when is_anonymous = true
  case when k.is_anonymous then k.anonymous_nickname else sp.full_name_vi    end as sender_name,
  case when k.is_anonymous then null                 else sp.avatar_url      end as sender_avatar,
  case when k.is_anonymous then null                 else k.from_user        end as sender_user_id,
  case when k.is_anonymous then null                 else sp.title           end as sender_title,
  case when k.is_anonymous then null                 else sp.department_code end as sender_department,

  -- Receiver profile (never masked)
  rp.full_name_vi    as receiver_name,
  rp.avatar_url      as receiver_avatar,
  rp.department_code as receiver_department,
  rp.title           as receiver_title,

  -- Feature hashtag label
  h.label_vi         as hashtag_label,
  h.code             as hashtag_code,

  -- Aggregate heart count (weighted)
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
-- SEED small hashtags (idempotent — skip if any small tags already exist)
-- ============================================================================

insert into public.hashtags (code, label_vi, kind, display_order)
select code, label_vi, 'small', display_order
from (values
  ('BE_OPTIMISTIC',   '#BE OPTIMISTIC',  10),
  ('WASSHOI',         '#WASSHOI',        20),
  ('BE_A_TEAM',       '#BE A TEAM',      30),
  ('HIGH_PERFORMING', 'High-performing', 40)
) v(code, label_vi, display_order)
where not exists (select 1 from public.hashtags where kind = 'small')
on conflict (code) do nothing;
