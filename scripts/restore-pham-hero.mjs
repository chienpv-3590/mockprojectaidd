// Restore Pham's recipient profile (hero rank + stars) which was lost when the
// kudos table was wiped. Hero rank = distinct senders to Pham (1-4 => New Hero);
// star tier = total received (>=10 => 1 star). Seed 4 senders x 3 kudos = 12
// received => "New Hero" + 1 star. Plain text. Run: node scripts/restore-pham-hero.mjs
import { runSQL } from "./inspect-kudos-data.mjs";
const PHAM = "d1e91610-447e-46df-af01-4f1765a0ff72";

await runSQL(`
do $$
declare
  v_me      uuid := '${PHAM}';
  v_feature uuid := (select id from public.hashtags where kind='feature' limit 1);
  v_tags    uuid[] := (select array_agg(id) from (select id from public.hashtags where kind='small' limit 4) s);
  v_senders uuid[] := (select array_agg(user_id) from (
                         select user_id from public.user_profiles
                         where user_id <> v_me order by full_name_vi limit 4) s);
  v_titles text[] := array['Người đồng đội tuyệt vời','Cảm ơn anh rất nhiều',
                           'Luôn hỗ trợ hết mình','Tấm gương cho cả team'];
  v_msgs   text[] := array[
    'Cảm ơn anh đã luôn dẫn dắt và hỗ trợ team!',
    'Anh review code rất tâm huyết, học được nhiều điều.',
    'Nhờ anh mà dự án về đích đúng hạn. Cảm ơn anh!',
    'Tinh thần trách nhiệm của anh truyền cảm hứng cho em.'];
  v_id uuid; s uuid; i int := 0; j int;
begin
  foreach s in array v_senders loop
    for j in 1 .. 3 loop          -- 3 kudos from each of the 4 senders => 12 total
      i := i + 1;
      v_id := public.submit_kudos_atomic(
        s, v_me, v_msgs[1 + (i % 4)], v_feature,
        v_tags[1:1 + (i % 3)], array[]::text[], v_titles[1 + (i % 4)]);
      update public.kudos set created_at = now() - interval '30 minutes' - i * interval '4 minutes' where id = v_id;
    end loop;
  end loop;
  raise notice 'seeded % kudos to Pham', i;
end $$;
`);

const r = await runSQL(`
  select
    (select count(*)::int from public.kudos where to_user='${PHAM}') as pham_received,
    (select count(distinct from_user)::int from public.kudos where to_user='${PHAM}') as distinct_senders,
    (select count(*)::int from public.kudos) as total,
    (select count(*)::int from public.kudos where from_user <> '${PHAM}') as heartable_by_pham;
`);
const x = r[0];
const rank = x.distinct_senders<=0?"none":x.distinct_senders<=4?"New Hero":x.distinct_senders<=9?"Rising Hero":x.distinct_senders<=20?"Super Hero":"Legend Hero";
const stars = x.pham_received>=50?3:x.pham_received>=20?2:x.pham_received>=10?1:0;
console.log({ ...x, hero_rank: rank, stars });
