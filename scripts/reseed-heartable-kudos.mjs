// Full reset of kudos data: wipe ALL kudos, then seed a fresh, natural-looking
// set of kudos exchanged BETWEEN named sunner profiles only — never involving
// the current login user (Pham, d1e91610...) as sender OR recipient. This means:
//   • no "P" avatar cards (Pham never appears in a card)
//   • every kudos is heartable by Pham (from_user != Pham)
// Run: node scripts/reseed-heartable-kudos.mjs
import { runSQL } from "./inspect-kudos-data.mjs";

const PHAM = "d1e91610-447e-46df-af01-4f1765a0ff72";

// 1. Wipe ALL kudos (cascades to hearts/hashtags/images/mentions).
await runSQL(`delete from public.kudos;`);
console.log("Wiped all kudos.");

// 2. Seed ~30 kudos among named sunners, staggered timestamps for a natural feed.
await runSQL(`
do $$
declare
  v_me      uuid := '${PHAM}';
  v_feature uuid := (select id from public.hashtags where kind='feature' limit 1);
  v_tags    uuid[] := (select array_agg(id) from (select id from public.hashtags where kind='small' limit 5) s);
  v_users   uuid[] := (select array_agg(user_id order by full_name_vi)
                       from public.user_profiles where user_id <> v_me);
  n int := array_length(v_users,1);
  v_titles text[] := array[
    'Cảm ơn sự hỗ trợ tuyệt vời','Người đồng đội đáng tin cậy','Tinh thần trách nhiệm cao',
    'Luôn sẵn sàng giúp đỡ','Đóng góp xuất sắc cho team','Chuyên môn vững vàng',
    'Truyền cảm hứng cho cả nhóm','Cảm ơn vì đã đồng hành'];
  -- Plain text — the card + detail render the message as a text node (matching
  -- seed.sql). HTML here would surface literal p tags in the UI.
  v_msgs text[] := array[
    'Cảm ơn bạn đã luôn hỗ trợ mình trong dự án vừa rồi!',
    'Bạn thật sự là chỗ dựa của cả team. Cảm ơn nhiều!',
    'Tinh thần làm việc của bạn truyền cảm hứng cho mọi người.',
    'Nhờ có bạn mà sprint này về đích đúng hạn. Tuyệt vời!',
    'Cảm ơn vì những đóng góp âm thầm nhưng vô cùng giá trị.',
    'Kiến thức chuyên môn của bạn giúp cả nhóm tiến bộ rất nhiều.',
    'Luôn nhiệt tình và trách nhiệm — cảm ơn bạn rất nhiều!',
    'Rất vui được làm việc cùng bạn. Cảm ơn sự đồng hành!'];
  v_id uuid; i int; s uuid; r uuid; cnt int := 30;
begin
  for i in 1 .. cnt loop
    s := v_users[1 + (i % n)];
    r := v_users[1 + ((i * 3 + 1) % n)];
    if r = s then r := v_users[1 + ((i + 2) % n)]; end if;
    v_id := public.submit_kudos_atomic(
      s, r, v_msgs[1 + (i % 8)], v_feature,
      v_tags[1:1 + (i % 4)], array[]::text[], v_titles[1 + (i % 8)]);
    -- stagger created_at so the feed orders naturally (newest first)
    update public.kudos set created_at = now() - (cnt - i) * interval '7 minutes' where id = v_id;
  end loop;
  raise notice 'seeded % kudos', cnt;
end $$;
`);

// 3. Verify: no card involves Pham, all heartable.
const check = await runSQL(`
  select
    (select count(*)::int from public.kudos) as total,
    (select count(*)::int from public.kudos where from_user = '${PHAM}' or to_user = '${PHAM}') as involves_pham,
    (select count(*)::int from public.kudos where from_user <> '${PHAM}') as heartable_by_pham,
    (select count(*)::int from public.kudos k
       left join public.user_profiles p on p.user_id = k.to_user where p.user_id is null) as null_recipient;
`);
console.log("After full reseed:", check[0]);
