// Rebuild Pham Van Chien's sent kudos (the original 68 were unrecoverable — no
// backup/PITR). Adds ~40 plain-text kudos FROM Pham to named sunners, WITHOUT
// wiping the existing 30 heartable (sunner->sunner) kudos. Plain text only, so
// no literal <p> tags; all recipients have profiles, so no broken cards.
// Run: node scripts/restore-pham-kudos.mjs
import { runSQL } from "./inspect-kudos-data.mjs";

const PHAM = "d1e91610-447e-46df-af01-4f1765a0ff72";

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
  v_msgs text[] := array[
    'Cảm ơn bạn đã hỗ trợ deploy lúc nửa đêm!',
    'Review code rất kỹ, nhờ bạn mà sprint này không có bug nào!',
    'Luôn dẫn dắt team vượt qua mọi thử thách.',
    'Viết test coverage đạt 90%+ — tuyệt vời!',
    'Phát hiện bug nghiêm trọng trước khi release.',
    'Cảm ơn bạn đã mentoring mình trong dự án này!',
    'Tinh thần Wasshoi trong từng commit!',
    'Tài liệu bạn viết rất rõ ràng và dễ hiểu.'];
  v_id uuid; i int; r uuid; cnt int := 40;
begin
  for i in 1 .. cnt loop
    r := v_users[1 + (i % n)];   -- Pham -> a named sunner
    v_id := public.submit_kudos_atomic(
      v_me, r, v_msgs[1 + (i % 8)], v_feature,
      v_tags[1:1 + (i % 4)], array[]::text[], v_titles[1 + (i % 8)]);
    -- older than the heartable batch so heartable cards stay near the top
    update public.kudos set created_at = now() - interval '3 hours' - (cnt - i) * interval '11 minutes' where id = v_id;
  end loop;
  raise notice 'restored % Pham kudos', cnt;
end $$;
`);

const r = await runSQL(`
  select
    (select count(*)::int from public.kudos) as total,
    (select count(*)::int from public.kudos where from_user='${PHAM}') as pham_sent,
    (select count(*)::int from public.kudos where from_user<>'${PHAM}') as heartable_by_pham,
    (select count(*)::int from public.kudos where message like '%<%>%') as with_html_tags,
    (select count(*)::int from public.kudos k left join public.user_profiles p on p.user_id=k.to_user where p.user_id is null) as null_recipient;
`);
console.log("After restore:", r[0]);
