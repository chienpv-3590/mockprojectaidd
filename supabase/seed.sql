-- SAA 2025 — Homepage + Award System seed data
-- Idempotent. Safe to re-run.

-- ============================================================================
-- AWARDS — 6 categories per MoMorph specs (home page + /he-thong-giai)
-- New detail-page fields (long_description_vi, quantity_text, unit_text,
-- value_text, value_breakdown) per migration 0002_extend_awards.
-- ============================================================================
insert into public.awards (
  code, title_vi, description_vi, thumbnail_path, display_order,
  long_description_vi, quantity_text, unit_text, value_text, value_breakdown
)
values
  (
    'top-talent',
    'Top Talent',
    'Vinh danh top cá nhân xuất sắc trên mọi phương diện',
    '/home/awards/top-talent.png',
    1,
    'Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng. Được đánh giá cao bởi khách hàng và đồng đội, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể.',
    '10', 'Cá nhân', null,
    '[{"label": "cho mỗi giải thưởng", "amount_text": "7.000.000 VNĐ"}]'::jsonb
  ),
  (
    'top-project',
    'Top Project',
    'Vinh danh dự án xuất sắc trên mọi phương diện, dự án có doanh thu nổi bật',
    '/home/awards/top-project.png',
    2,
    'Giải thưởng Top Project vinh danh các tập thể dự án xuất sắc với kết quả kinh doanh vượt kỳ vọng, hiệu quả vận hành tối ưu và tinh thần làm việc tận tâm. Đây là các dự án có độ phức tạp kỹ thuật cao, hiệu quả tối ưu hóa nguồn lực và chi phí tốt, mang lại giá trị cho khách hàng, đem lại lợi nhuận vượt trội và nhận được phản hồi tích cực từ khách hàng. Các thành viên tuân thủ nghiêm ngặt các tiêu chuẩn phát triển nội bộ, tạo nên một hình mẫu về sự xuất sắc và chuyên nghiệp.',
    '02', 'Tập thể', null,
    '[{"label": "cho mỗi giải thưởng", "amount_text": "15.000.000 VNĐ"}]'::jsonb
  ),
  (
    'top-project-leader',
    'Top Project Leader',
    'Vinh danh người quản lý truyền cảm hứng và dẫn dắt dự án bứt phá',
    '/home/awards/top-project-leader.png',
    3,
    'Giải thưởng Top Project Leader vinh danh những nhà quản lý dự án xuất sắc – những người hội tụ năng lực quản lý vững vàng, khả năng truyền cảm hứng mạnh mẽ và tư duy "Aim High – Be Agile" trong mọi bài toán và bối cảnh. Dưới sự dẫn dắt của họ, các thành viên không chỉ cùng nhau vượt qua thử thách và đạt được mục tiêu đề ra, mà còn giữ vững ngọn lửa nhiệt huyết, tinh thần Wasshoi, và trưởng thành để trở thành phiên bản tốt hơn — hạnh phúc hơn của chính mình.',
    '03', 'Cá nhân', null,
    '[{"label": "cho mỗi giải thưởng", "amount_text": "7.000.000 VNĐ"}]'::jsonb
  ),
  (
    'best-manager',
    'Best Manager',
    'Vinh danh người quản lý có năng lực quản lý tốt, dẫn dắt đội nhóm',
    '/home/awards/best-manager.png',
    4,
    'Giải thưởng Best Manager vinh danh những nhà lãnh đạo tiêu biểu — người đã dẫn dắt đội ngũ của mình tạo ra kết quả vượt kỳ vọng, tác động trực tiếp tới hiệu quả kinh doanh và sự phát triển bền vững của tổ chức. Dưới sự lãnh đạo của họ, đội ngũ luôn chinh phục mọi thử thách và phát huy hết tinh thần trách nhiệm, khả năng phối hợp hiệu quả, và tư duy ứng dụng công nghệ trong công việc. Họ truyền cảm hứng để tập thể trở nên tự tin, tràn đầy năng lượng, sẵn sàng đón nhận, thậm chí dẫn dắt tạo ra những thay đổi có tính cách mạng.',
    '01', 'Cá nhân', null,
    '[{"label": null, "amount_text": "10.000.000 VNĐ"}]'::jsonb
  ),
  (
    'signature-creator',
    'Signature 2025 - Creator',
    'Vinh danh cá nhân hoặc tập thể mang tinh thần Creator của Sun*',
    '/home/awards/signature-2025-creator.png',
    5,
    'Giải thưởng Signature vinh danh cá nhân hoặc tập thể đã thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ. Trong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, không chùng chân mà tích cực thực thi giải pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy "Creator" đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cái mới, góp phần định hình những chuẩn mực mới cho cách mà người Sun* tạo giá trị.',
    '01', 'Cá nhân hoặc Tập thể', null,
    '[{"label": "cho giải cá nhân", "amount_text": "5.000.000 VNĐ"}, {"label": "cho giải tập thể", "amount_text": "8.000.000 VNĐ"}]'::jsonb
  ),
  (
    'mvp',
    'MVP (Most Valuable Person)',
    'Vinh danh cá nhân xuất sắc nhất, gương mặt tiêu biểu đại diện toàn Sun*',
    '/home/awards/mvp.png',
    6,
    'Giải thưởng MVP vinh danh cá nhân xuất sắc nhất năm — gương mặt tiêu biểu đại diện cho toàn bộ tập thể Sun*. Họ là người đã thể hiện năng lực vượt trội, tinh thần cống hiến bền bỉ, và tầm ảnh hưởng sâu rộng, để lại dấu ấn đậm nét trong hành trình của Sun* suốt năm qua. Không chỉ nổi bật bởi hiệu suất và kết quả công việc, họ còn là nguồn cảm hứng lan tỏa – thông qua suy nghĩ, hành động và ảnh hưởng tích cực của cá nhân đối với tập thể. MVP là người hội tụ đầy đủ phẩm chất của một người Sun*: vai trò, đóng góp mạnh trên mọi trạng thái, lan tỏa trở thành hình mẫu đại diện cho con người và văn hóa Sun*, góp phần dẫn dắt tập thể vươn tới những đỉnh cao mới.',
    '01', 'Cá nhân', null,
    '[{"label": null, "amount_text": "15.000.000 VNĐ"}]'::jsonb
  )
on conflict (code) do update set
  title_vi            = excluded.title_vi,
  description_vi      = excluded.description_vi,
  thumbnail_path      = excluded.thumbnail_path,
  display_order       = excluded.display_order,
  long_description_vi = excluded.long_description_vi,
  quantity_text       = excluded.quantity_text,
  unit_text           = excluded.unit_text,
  value_text          = excluded.value_text,
  value_breakdown     = excluded.value_breakdown;

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

-- ============================================================================
-- DEPARTMENTS — 6 Sun* org units per MoMorph "Dropdown Phòng ban" (WXK5AYB_rG).
-- Codes are shown verbatim in the filter dropdown and under each card name,
-- so name_vi mirrors the code (the design has no separate department label).
-- ============================================================================
insert into public.departments (code, name_vi, display_order) values
  ('CEVC1', 'CEVC1', 1),
  ('CEVC2', 'CEVC2', 2),
  ('CEVC3', 'CEVC3', 3),
  ('CEVC4', 'CEVC4', 4),
  ('OPD',   'OPD',   5),
  ('Infra', 'Infra', 6)
on conflict (code) do update set
  name_vi       = excluded.name_vi,
  display_order = excluded.display_order;

-- Drop any stale departments from earlier seeds (FK is ON DELETE SET NULL).
delete from public.departments
where code not in ('CEVC1', 'CEVC2', 'CEVC3', 'CEVC4', 'OPD', 'Infra');

-- ============================================================================
-- HASHTAGS — 1 feature (sample "danh hiệu") + 13 small Sun* value tags.
-- Small tags are the authoritative 13-item list from MoMorph specs
-- "Dropdown Hashtag filter" (JWpsISMAaM) + "Dropdown list hashtag" (p9zO-c4a4x);
-- the English chips drawn on the card mockups are placeholders only.
-- ============================================================================
insert into public.hashtags (code, label_vi, kind, display_order) values
  ('idol-gioi-tre',      'IDOL GIỚI TRẺ',      'feature', 1),
  ('toan-dien',          'Toàn diện',          'small',   1),
  ('gioi-chuyen-mon',    'Giỏi chuyên môn',    'small',   2),
  ('hieu-suat-cao',      'Hiệu suất cao',      'small',   3),
  ('truyen-cam-hung',    'Truyền cảm hứng',    'small',   4),
  ('cong-hien',          'Cống hiến',          'small',   5),
  ('aim-high',           'Aim High',           'small',   6),
  ('be-agile',           'Be Agile',           'small',   7),
  ('wasshoi',            'Wasshoi',            'small',   8),
  ('huong-muc-tieu',     'Hướng mục tiêu',     'small',   9),
  ('huong-khach-hang',   'Hướng khách hàng',   'small',   10),
  ('chuan-quy-trinh',    'Chuẩn quy trình',    'small',   11),
  ('giai-phap-sang-tao', 'Giải pháp sáng tạo', 'small',   12),
  ('quan-ly-xuat-sac',   'Quản lý xuất sắc',   'small',   13)
on conflict (code) do update set
  label_vi      = excluded.label_vi,
  kind          = excluded.kind,
  display_order = excluded.display_order;

-- Drop any stale small hashtags from earlier seeds (joins cascade, kudos.hashtag_id
-- is ON DELETE SET NULL).
delete from public.hashtags
where kind = 'small'
  and code not in (
    'toan-dien', 'gioi-chuyen-mon', 'hieu-suat-cao', 'truyen-cam-hung', 'cong-hien',
    'aim-high', 'be-agile', 'wasshoi', 'huong-muc-tieu', 'huong-khach-hang',
    'chuan-quy-trinh', 'giai-phap-sang-tao', 'quan-ly-xuat-sac'
  );

-- ============================================================================
-- SPECIAL_DAYS — 1 sample row (2026-10-30 → 2026-10-31, 2× hearts)
-- ============================================================================
insert into public.special_days (date_from, date_to, multiplier, note)
select '2026-10-30'::date, '2026-10-31'::date, 2, 'SAA 2026 Event Days'
where not exists (
  select 1 from public.special_days
  where date_from = '2026-10-30' and date_to = '2026-10-31'
);

-- ============================================================================
-- DEMO FUNCTION — populates 8 demo profiles + 12 kudos + 30 hearts +
-- 3 secret boxes for the currently authenticated user.
-- Follows the same SECURITY DEFINER pattern as seed_demo_data_for_current_user.
-- ============================================================================
create or replace function public.seed_kudos_demo_for_current_user()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid          uuid := auth.uid();
  -- Fixed demo UUIDs so the function is idempotent (re-run safe)
  demo1        uuid := 'a0000001-0000-0000-0000-000000000001'::uuid;
  demo2        uuid := 'a0000001-0000-0000-0000-000000000002'::uuid;
  demo3        uuid := 'a0000001-0000-0000-0000-000000000003'::uuid;
  demo4        uuid := 'a0000001-0000-0000-0000-000000000004'::uuid;
  demo5        uuid := 'a0000001-0000-0000-0000-000000000005'::uuid;
  demo6        uuid := 'a0000001-0000-0000-0000-000000000006'::uuid;
  demo7        uuid := 'a0000001-0000-0000-0000-000000000007'::uuid;
  demo8        uuid := 'a0000001-0000-0000-0000-000000000008'::uuid;
  feat_tag_id  uuid;
  small_tag1   uuid;
  small_tag2   uuid;
  k1 uuid; k2 uuid; k3 uuid; k4 uuid; k5 uuid;
  k6 uuid; k7 uuid; k8 uuid; k9 uuid; k10 uuid;
  k11 uuid; k12 uuid;
begin
  if uid is null then
    raise exception 'No authenticated user — call this after signing in.';
  end if;

  -- Fetch hashtag IDs
  select id into feat_tag_id from public.hashtags where code = 'idol-gioi-tre';
  select id into small_tag1  from public.hashtags where code = 'cong-hien';
  select id into small_tag2  from public.hashtags where code = 'truyen-cam-hung';

  -- Upsert caller's own profile. NOTE: `title` is a JOB title — the Hero rank
  -- ("danh hiệu") is DERIVED from distinct senders at read time (lib/data/hero-rank.ts),
  -- never stored here.
  insert into public.user_profiles (user_id, full_name_vi, department_code, employee_code, title)
  values (uid, 'Bạn (Demo)', 'CEVC1', 'DM000', 'Software Engineer')
  on conflict (user_id) do nothing;

  -- The 8 demo identities are referenced by FK from user_profiles.user_id,
  -- kudos.from_user/to_user and kudos_hearts.user_id — all → auth.users(id).
  -- Without backing auth.users rows every insert below raises
  -- foreign_key_violation and the whole block rolls back. This SECURITY DEFINER
  -- function runs as the schema owner, so it may insert the minimal auth.users
  -- rows needed (display-only; these accounts never authenticate).
  insert into auth.users (
    id, instance_id, aud, role, email,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values
    (demo1, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo1@saa.local', '{"provider":"seed","providers":["seed"]}'::jsonb, '{}'::jsonb, now(), now()),
    (demo2, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo2@saa.local', '{"provider":"seed","providers":["seed"]}'::jsonb, '{}'::jsonb, now(), now()),
    (demo3, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo3@saa.local', '{"provider":"seed","providers":["seed"]}'::jsonb, '{}'::jsonb, now(), now()),
    (demo4, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo4@saa.local', '{"provider":"seed","providers":["seed"]}'::jsonb, '{}'::jsonb, now(), now()),
    (demo5, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo5@saa.local', '{"provider":"seed","providers":["seed"]}'::jsonb, '{}'::jsonb, now(), now()),
    (demo6, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo6@saa.local', '{"provider":"seed","providers":["seed"]}'::jsonb, '{}'::jsonb, now(), now()),
    (demo7, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo7@saa.local', '{"provider":"seed","providers":["seed"]}'::jsonb, '{}'::jsonb, now(), now()),
    (demo8, '00000000-0000-0000-0000-000000000000'::uuid, 'authenticated', 'authenticated', 'demo8@saa.local', '{"provider":"seed","providers":["seed"]}'::jsonb, '{}'::jsonb, now(), now())
  on conflict (id) do nothing;

  -- Insert 8 demo profiles (fixed UUIDs, backed by the auth.users rows above)
  insert into public.user_profiles (user_id, full_name_vi, department_code, employee_code, title) values
    (demo1, 'Nguyễn Văn An',    'CEVC1', 'DM001', 'Backend Engineer'),
    (demo2, 'Trần Thị Bình',    'CEVC2', 'DM002', 'QA Engineer'),
    (demo3, 'Lê Hoàng Cường',   'CEVC3', 'DM003', 'Tech Lead'),
    (demo4, 'Phạm Thị Dung',    'CEVC4', 'DM004', 'Frontend Engineer'),
    (demo5, 'Hoàng Văn Em',     'OPD',   'DM005', 'DevOps Engineer'),
    (demo6, 'Vũ Thị Phương',    'Infra', 'DM006', 'Product Manager'),
    (demo7, 'Đặng Văn Giang',   'CEVC2', 'DM007', 'Data Engineer'),
    (demo8, 'Bùi Thị Hương',    'CEVC3', 'DM008', 'Product Designer')
  on conflict (user_id) do nothing;

  -- Insert 12 demo kudos (skip if caller already has demo kudos)
  if not exists (select 1 from public.kudos where from_user = uid limit 1) then
    insert into public.kudos (id, from_user, to_user, message, hashtag_id) values
      (gen_random_uuid(), uid,   demo1, 'Cảm ơn bạn đã hỗ trợ deploy lúc nửa đêm!', feat_tag_id),
      (gen_random_uuid(), uid,   demo2, 'Review code rất kỹ, nhờ bạn mà sprint này không có bug nào!', feat_tag_id),
      (gen_random_uuid(), uid,   demo3, 'Luôn dẫn dắt team vượt qua mọi thử thách.', feat_tag_id),
      (gen_random_uuid(), uid,   demo4, 'Viết test coverage đạt 90%+ — tuyệt vời!', null),
      (gen_random_uuid(), uid,   demo5, 'Phát hiện bug nghiêm trọng trước khi release.', null),
      (gen_random_uuid(), demo1, uid,   'Cảm ơn bạn đã mentoring tôi trong dự án này!', feat_tag_id),
      (gen_random_uuid(), demo2, uid,   'Bạn luôn trả lời câu hỏi rất tận tình.', null),
      (gen_random_uuid(), demo3, uid,   'Tinh thần Wasshoi trong từng commit!', feat_tag_id),
      (gen_random_uuid(), demo4, uid,   'Cảm ơn đã chia sẻ kiến thức rất hay!', null),
      (gen_random_uuid(), demo5, uid,   'Bạn là người truyền cảm hứng của team.', feat_tag_id),
      (gen_random_uuid(), demo6, uid,   'Fix bug trong 10 phút — siêu tốc!', null),
      (gen_random_uuid(), demo7, uid,   'Tài liệu bạn viết rất rõ ràng và dễ hiểu.', null)
    returning id into k1;

    -- Collect kudos IDs for hearts
    select id into k1  from public.kudos where from_user = uid   and to_user = demo1 limit 1;
    select id into k2  from public.kudos where from_user = uid   and to_user = demo2 limit 1;
    select id into k3  from public.kudos where from_user = uid   and to_user = demo3 limit 1;
    select id into k4  from public.kudos where from_user = uid   and to_user = demo4 limit 1;
    select id into k5  from public.kudos where from_user = uid   and to_user = demo5 limit 1;
    select id into k6  from public.kudos where from_user = demo1 and to_user = uid   limit 1;
    select id into k7  from public.kudos where from_user = demo2 and to_user = uid   limit 1;
    select id into k8  from public.kudos where from_user = demo3 and to_user = uid   limit 1;
    select id into k9  from public.kudos where from_user = demo4 and to_user = uid   limit 1;
    select id into k10 from public.kudos where from_user = demo5 and to_user = uid   limit 1;
    select id into k11 from public.kudos where from_user = demo6 and to_user = uid   limit 1;
    select id into k12 from public.kudos where from_user = demo7 and to_user = uid   limit 1;

    -- Insert small hashtag joins
    if small_tag1 is not null then
      insert into public.kudos_hashtags (kudos_id, hashtag_id) values
        (k1, small_tag1), (k3, small_tag1), (k6, small_tag1), (k8, small_tag1)
      on conflict do nothing;
    end if;
    if small_tag2 is not null then
      insert into public.kudos_hashtags (kudos_id, hashtag_id) values
        (k2, small_tag2), (k5, small_tag2), (k7, small_tag2), (k10, small_tag2)
      on conflict do nothing;
    end if;

    -- Insert ~30 hearts across the 12 kudos (demo1-demo8 + uid as heart givers)
    insert into public.kudos_hearts (kudos_id, user_id, weight) values
      -- hearts on kudos the caller sent
      (k1, demo2, 1), (k1, demo3, 1), (k1, demo4, 1),
      (k2, demo1, 1), (k2, demo5, 1),
      (k3, demo1, 2), (k3, demo2, 2),  -- special day weight
      (k4, demo3, 1), (k4, demo5, 1),
      (k5, demo1, 1), (k5, demo4, 1),
      -- hearts on kudos the caller received
      (k6,  demo2, 1), (k6,  demo3, 1), (k6,  demo5, 1),
      (k7,  demo1, 1), (k7,  demo4, 1),
      (k8,  demo2, 1), (k8,  demo5, 1), (k8,  demo6, 1),
      (k9,  demo1, 1), (k9,  demo3, 1),
      (k10, demo2, 1), (k10, demo4, 1), (k10, demo7, 1),
      (k11, demo1, 1), (k11, demo3, 1), (k11, demo5, 1),
      (k12, demo2, 1), (k12, demo4, 1), (k12, demo8, 1)
    on conflict do nothing;
  end if;

  -- Insert 3 secret boxes (mix of statuses)
  if not exists (select 1 from public.secret_boxes where owner = uid) then
    insert into public.secret_boxes (owner, status, reward_label_vi, opened_at) values
      (uid, 'unopened', null, null),
      (uid, 'opened',   'Áo phông SAA 2026', now() - interval '2 days'),
      (uid, 'claimed',  'Cốc giữ nhiệt Sun*', now() - interval '5 days');
  end if;
end;
$$;

grant execute on function public.seed_kudos_demo_for_current_user() to authenticated;

-- ============================================================================
-- SECRET BOXES — cross-user "10 Sunner nhận quà mới nhất" leaderboard (D.3)
-- The per-user functions above only seed the caller's own boxes; the sidebar
-- leaderboard is company-wide, so seed recent opened boxes for existing demo
-- Sunners. Idempotent: skips once any opened box exists.
-- ============================================================================
do $$
begin
  if not exists (select 1 from public.secret_boxes where status = 'opened') then
    insert into public.secret_boxes (owner, status, reward_label_vi, opened_at)
    select
      p.user_id,
      'opened',
      (array[
        'Áo phông SAA 2025', 'Cốc giữ nhiệt Sun*', 'Voucher ăn trưa 100k',
        'Túi tote SAA 2025', 'Sổ tay Sun*', 'Bình giữ nhiệt Sun*',
        'Sticker pack SAA', 'Voucher cà phê 50k', 'Mũ lưỡi trai Sun*', 'Áo hoodie SAA'
      ])[p.rn],
      now() - (p.rn * interval '37 minutes')
    from (
      select pr.user_id, row_number() over (order by pr.full_name_vi) as rn
      from public.user_profiles pr
      join auth.users au on au.id = pr.user_id
      limit 10
    ) p;
  end if;
end;
$$;
