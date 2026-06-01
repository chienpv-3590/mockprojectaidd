-- SAA 2025 — Authorization hardening
-- Fixes two DB-level authorization holes found in the codebase audit:
--   C1) submit_kudos_atomic (SECURITY DEFINER) bypassed RLS and never verified
--       p_from_user against auth.uid() → any authenticated caller could forge
--       kudos as another user.
--   C2) the "owner updates secret_boxes" policy had USING but no WITH CHECK →
--       an owner could UPDATE their box and reassign `owner` to another user.
-- Idempotent: create-or-replace fn (unchanged signature) + drop/create policy.
-- Depends on: 0003_kudos_live_board.sql, 0004_kudos_create_form.sql

-- ============================================================================
-- C1 — submit_kudos_atomic: enforce p_from_user = auth.uid()
-- Signature unchanged from 0004, so `create or replace` applies in place.
-- ============================================================================

create or replace function public.submit_kudos_atomic(
  p_from_user           uuid,
  p_to_user             uuid,
  p_message             text,
  p_hashtag_id          uuid,
  p_small_tags          uuid[],
  p_image_paths         text[],
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
  -- SECURITY DEFINER bypasses RLS, so the sender identity MUST be verified
  -- here against the JWT. Without this, a caller can forge kudos as anyone.
  if p_from_user is distinct from auth.uid() then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

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
-- C2 — secret_boxes UPDATE: add WITH CHECK so `owner` cannot be reassigned
-- ============================================================================

drop policy if exists "owner updates secret_boxes" on public.secret_boxes;
create policy "owner updates secret_boxes" on public.secret_boxes
  for update
  using (auth.uid() = owner)
  with check (auth.uid() = owner);
