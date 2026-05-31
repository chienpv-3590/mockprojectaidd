-- SAA 2025 — Secret Box collectible icon reward
-- Adds the collectible icon id (1..6) won when a Secret Box is opened. Nullable:
-- unopened boxes have no icon yet. Drives the profile "Bộ sưu tập icon của tôi"
-- collection + the openSecretBox reward action.
-- Source of truth for ids/labels: lib/sun-kudos/secret-box-icons.ts
-- Idempotent. Depends on: 0003_kudos_live_board.sql (secret_boxes table).
--
-- RLS: the existing "owner updates secret_boxes" UPDATE policy
-- (using auth.uid() = owner) already authorises openSecretBox — no new policy.

alter table public.secret_boxes
  add column if not exists reward_icon smallint;

comment on column public.secret_boxes.reward_icon is
  'Collectible SAA icon id (1..6) won on open; null until opened. See lib/sun-kudos/secret-box-icons.ts';
