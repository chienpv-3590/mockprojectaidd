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
