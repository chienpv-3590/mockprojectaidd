import Image from "next/image";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

const BODY_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontSize: "16px",
  lineHeight: "26px",
  fontWeight: 400 as const,
};

export function RootFurtherDescription() {
  return (
    <section className="relative px-6 pb-20 pt-8 text-white sm:px-10 lg:px-36">
      <div className="mx-auto max-w-[1224px]">
        <div className="flex items-center justify-center">
          <Image
            src={`${ASSETS}/root-further-logo.png`}
            alt="ROOT FURTHER"
            width={520}
            height={230}
            className="h-auto w-full max-w-[520px]"
          />
        </div>

        <div className="mx-auto mt-12 max-w-[1152px] space-y-6 text-justify text-white/85">
          <p style={BODY_STYLE}>
            Đứng trước bối cảnh thay đổi như vũ bão của thời đại AI và yêu cầu ngày càng cao từ khách hàng,
            Sun* lựa chọn chiến lược đa dạng hóa năng lực để không chỉ nỗ lực trở thành tinh anh trong lĩnh
            vực của mình, mà còn hướng đến một cái đích cao hơn, nơi mọi Sunner đều là “problem-solver” -
            chuyên gia trong việc giải quyết mọi vấn đề, tìm lời giải cho mọi bài toán của dự án, khách hàng
            và xã hội.
          </p>
          <p style={BODY_STYLE}>
            Lấy cảm hứng từ sự đa dạng năng lực, khả năng phát triển linh hoạt cùng tinh thần đào sâu để bứt
            phá trong kỷ nguyên AI, “Root Further” đã được chọn để trở thành chủ đề chính thức của Lễ trao
            giải Sun* Annual Awards 2025.
          </p>
          <p style={BODY_STYLE}>
            Vượt ra khỏi nét nghĩa bề mặt, “Root Further” chính là hành trình chúng ta không ngừng vươn xa
            hơn, cắm rễ mạnh hơn, chạm đến những tầng “địa chất” ẩn sâu để tiếp tục tồn tại, vươn lên và nuôi
            dưỡng đam mê kiến tạo giá trị luôn cháy bỏng của người Sun*. Mượn hình ảnh bộ rễ liên tục đâm sâu
            vào lòng đất, mạnh mẽ len lỏi qua từng lớp “trầm tích” để thẩm thấu những gì tinh tuý nhất, người
            Sun* cũng đang “hấp thụ” dưỡng chất từ thời đại và những thử thách của thị trường để làm mới mình
            mỗi ngày, mở rộng năng lực và mạnh mẽ “bén rễ” vào kỷ nguyên AI - một tầng “địa chất” hoàn toàn
            mới, phức tạp và khó đoán, nhưng cũng hội tụ vô vàn tiềm năng cùng cơ hội.
          </p>
        </div>

        <div className="mx-auto my-10 max-w-[820px] space-y-1 text-center">
          <p
            className="text-white"
            style={{ fontFamily: FONT_MONTSERRAT, fontSize: "20px", lineHeight: "32px", fontWeight: 700 }}
          >
            “A tree with deep roots fears no storm”
          </p>
          <p
            className="text-white/80"
            style={{ fontFamily: FONT_MONTSERRAT, fontSize: "16px", lineHeight: "26px", fontWeight: 500 }}
          >
            (Cây sâu bén rễ, bão giông chẳng nề - Ngạn ngữ Anh)
          </p>
        </div>

        <div className="mx-auto max-w-[1152px] space-y-6 text-justify text-white/85">
          <p style={BODY_STYLE}>
            Trước giông bão, chỉ những tán cây có bộ rễ đủ mạnh mới có thể trụ vững. Một tổ chức với những cá
            nhân tự tin vào năng lực đa dạng, sẵn sàng kiến tạo và đón nhận thử thách, làm chủ sự thay đổi là
            tổ chức không chỉ vững vàng trước biến động, mà còn khai thác được mọi lợi thế, chinh phục các
            thách thức của thời cuộc. Không đơn thuần là tên gọi của chương mới trên hành trình phát triển tổ
            chức, “Root Further” còn như một lời cổ vũ, động viên mỗi chúng ta hãy dám tin vào bản thân, dám
            đào sâu, khai mở mọi tiềm năng, dám phá bỏ giới hạn, dám trở thành phiên bản đa nhiệm và xuất sắc
            nhất của mình. Bởi trong thời đại AI, đa dạng năng lực và tận dụng sức mạnh thời cuộc chính là
            điều kiện tiên quyết để trường tồn.
          </p>
          <p style={BODY_STYLE}>
            Không ai biết trước ẩn sâu trong “lòng đất” của ngành công nghệ và thị trường hiện đại còn biết
            bao tầng “địa chất” bí ẩn. Chỉ biết rằng khi “Root Further” đã trở thành tinh thần cội rễ, chúng
            ta sẽ không sợ hãi, mà càng thấy háo hức trước bất cứ vùng vô định nào trên hành trình tiến về
            phía trước. Vì ta luôn tin rằng, trong chính những miền vô tận đó, là bao điều kỳ diệu và cơ hội
            vươn mình đang chờ ta.
          </p>
        </div>
      </div>
    </section>
  );
}
