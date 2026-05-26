import type { Award } from "@/lib/data/types";

/**
 * Mock award data for local visual validation only.
 * Values extracted directly from MoMorph design spec — no invented data.
 * Replaced by real DB data in Phase 05 integration.
 */
export const MOCK_AWARDS: Award[] = [
  {
    id: "mock-1",
    code: "top-talent",
    title_vi: "Top Talent",
    description_vi:
      "Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng.",
    thumbnail_path: "/home/awards/top-talent.png",
    display_order: 1,
    quantity_text: "10",
    unit_text: "Cá nhân",
    value_text: null,
    value_breakdown: [
      { label: "cho mỗi giải thưởng", amount_text: "7.000.000 VNĐ" },
    ],
    long_description_vi:
      "Giải thưởng Top Talent vinh danh những cá nhân xuất sắc toàn diện – những người không ngừng khẳng định năng lực chuyên môn vững vàng, hiệu suất công việc vượt trội, luôn mang lại giá trị vượt kỳ vọng. Đây là cá nhân đã có bứt phá mạnh mẽ trong công việc và vẫn duy trì những nhiệm vụ tổ chức giao phó, họ luôn là nguồn cảm hứng, thúc đẩy động lực và tạo ảnh hưởng tích cực đến cả tập thể.",
  },
  {
    id: "mock-2",
    code: "top-project",
    title_vi: "Top Project",
    description_vi:
      "Giải thưởng Top Project vinh danh các tập thể dự án xuất sắc với kết quả kinh doanh vượt kỳ vọng.",
    thumbnail_path: "/home/awards/top-project.png",
    display_order: 2,
    quantity_text: "02",
    unit_text: "Tập thể",
    value_text: null,
    value_breakdown: [
      { label: "cho mỗi giải thưởng", amount_text: "15.000.000 VNĐ" },
    ],
    long_description_vi:
      "Giải thưởng Top Project vinh danh các tập thể dự án xuất sắc với kết quả kinh doanh vượt kỳ vọng, hiệu quả vận hành tối ưu và tinh thần làm việc tận tâm. Đây là các dự án có độ phức tạp kỹ thuật cao, hiệu quả tối ưu hóa nguồn lực và chi phí tốt, đa số các ý tưởng có giá trị cho khách hàng, đem lại lợi nhuận vượt trội và nhận được phản hồi tích cực từ khách hàng. Các thành viên tuân thủ nghiêm ngặt các tiêu chuẩn phát triển nội bộ trong phát triển dự án, tạo nên một hình mẫu về sự xuất sắc và chuyên nghiệp.",
  },
  {
    id: "mock-3",
    code: "top-project-leader",
    title_vi: "Top Project Leader",
    description_vi:
      "Giải thưởng Top Project Leader vinh danh những nhà quản lý dự án xuất sắc.",
    thumbnail_path: "/home/awards/top-project-leader.png",
    display_order: 3,
    quantity_text: "03",
    unit_text: "Cá nhân",
    value_text: null,
    value_breakdown: [
      { label: "cho mỗi giải thưởng", amount_text: "7.000.000 VNĐ" },
    ],
    long_description_vi:
      "Giải thưởng Top Project Leader vinh danh những nhà quản lý dự án xuất sắc – những người hội tụ năng lực quản lý vững vàng, khả năng truyền cảm hứng mạnh mẽ và tư duy 'Aim High – Be Agile' trong mọi bài toán và bối cảnh. Dưới sự dẫn dắt của họ, các thành viên không chỉ cùng nhau vượt qua thử thách và đạt được mục tiêu đề ra, mà còn giữ vững ngọn lửa nhiệt huyết, tinh thần Wasshoi, và trưởng thành để trở thành phiên bản tốt hơn — hạnh phúc hơn của chính mình.",
  },
  {
    id: "mock-4",
    code: "best-manager",
    title_vi: "Best Manager",
    description_vi:
      "Giải thưởng Best Manager vinh danh những nhà lãnh đạo tiêu biểu.",
    thumbnail_path: "/home/awards/best-manager.png",
    display_order: 4,
    quantity_text: "01",
    unit_text: "Cá nhân",
    value_text: null,
    value_breakdown: [{ label: null, amount_text: "10.000.000 VNĐ" }],
    long_description_vi:
      "Giải thưởng Best Manager vinh danh những nhà lãnh đạo tiêu biểu — người đã dẫn dắt đội ngũ của mình tạo ra kết quả vượt kỳ vọng, tác động tới bản thân hiệu quả kinh doanh và sự phát triển bền vững của tổ chức. Dưới sự lãnh đạo của họ, đội ngũ luôn chinh phục mọi thử thách và phát huy hết tinh thần trách nhiệm, khả năng phối hợp hiệu quả, và tư duy ứng dụng công nghệ hoạt động trong công việc. Họ truyền cảm hứng để tập thể trở nên tự tin tràn đầy năng lượng, sẵn sàng đón nhận, thậm chí dẫn dắt tạo ra những thay đổi có tính cách mạng.",
  },
  {
    id: "mock-5",
    code: "signature-creator",
    title_vi: "Signature 2025 - Creator",
    description_vi:
      "Giải thưởng Signature vinh danh cá nhân hoặc tập thể đã thể hiện tinh thần đặc trưng mà Sun* hướng tới.",
    thumbnail_path: "/home/awards/signature-2025-creator.png",
    display_order: 5,
    quantity_text: "01",
    unit_text: "Cá nhân/Tập thể",
    value_text: null,
    value_breakdown: [
      { label: "cho giải cá nhân", amount_text: "5.000.000 VNĐ" },
      { label: "cho giải tập thể", amount_text: "8.000.000 VNĐ" },
    ],
    long_description_vi:
      "Giải thưởng Signature vinh danh cá nhân hoặc tập thể đã thể hiện tinh thần đặc trưng mà Sun* hướng tới trong từng thời kỳ. Trong năm 2025, giải thưởng Signature vinh danh Creator - cá nhân/tập thể mang tư duy chủ động và nhạy bén, luôn nhìn thấy cơ hội trong thách thức và tiên phong trong hành động. Họ là những người nhạy bén với vấn đề, không chùng chân mà tích cực phá pháp thực tiễn, mang lại giá trị rõ rệt cho dự án, khách hàng hoặc tổ chức. Với tư duy 'Creator' đặc trưng của Sun*, họ không chỉ phản ứng tích cực trước sự thay đổi mà còn chủ động tạo ra cái tích cực, góp phần định hình nền chuẩn mực mới cho cách mà người Sun* tạo giá trị.",
  },
  {
    id: "mock-6",
    code: "mvp",
    title_vi: "MVP (Most Valuable Person)",
    description_vi:
      "Giải thưởng MVP vinh danh cá nhân xuất sắc nhất năm — gương mặt tiêu biểu đại diện cho toàn bộ tập thể Sun*.",
    thumbnail_path: "/home/awards/mvp.png",
    display_order: 6,
    quantity_text: "01",
    unit_text: "Cá nhân",
    value_text: null,
    value_breakdown: [{ label: null, amount_text: "15.000.000 VNĐ" }],
    long_description_vi:
      "Giải thưởng MVP vinh danh cá nhân xuất sắc nhất năm — gương mặt tiêu biểu đại diện cho toàn bộ tập thể Sun*. Họ là người đã thể hiện năng lực vượt trội, tinh thần cống hiến bền bỉ, và tầm ảnh hưởng sâu rộng, để lại dấu ấn đậm nét trong hành trình của Sun* suốt năm qua. Không chỉ nổi bật bởi hiệu suất và kết quả công việc, họ còn là nguồn cảm hứng lan tỏa – thông qua suy nghĩ, hành động và ảnh hưởng tích cực của cá nhân đối với tập thể. MVP là người hội tụ đầy đủ phẩm chất của một người Sun*: vai trò, đóng góp mạnh trên mọi trạng thái lan tỏa trở thành hình mẫu đại diện cho con người và văn hóa Sun*, góp phần dẫn dắt tập thể vươn tới những đỉnh cao mới.",
  },
];
