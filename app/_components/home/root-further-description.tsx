import Image from "next/image";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

// Spec B4 (mms_B4_content): "Root Further" theme description.
// Decorative ROOT + FURTHER background typography (faded), Vietnamese body
// paragraphs, English proverb quote. Server component — no client state.
export function RootFurtherDescription() {
  return (
    <section className="relative isolate overflow-hidden bg-[#00101A] px-6 py-24 text-white sm:px-10 sm:py-32">
      {/* Decorative ROOT (top-left) — faded background type */}
      <div aria-hidden className="pointer-events-none absolute -left-10 -top-6 -z-10 opacity-[0.07] sm:opacity-[0.1]">
        <Image
          src={`${ASSETS}/root-text.png`}
          alt=""
          width={189}
          height={67}
          className="h-auto w-[60vw] max-w-[700px]"
        />
      </div>
      {/* Decorative FURTHER (bottom-right) — faded background type */}
      <div aria-hidden className="pointer-events-none absolute -bottom-6 -right-10 -z-10 opacity-[0.07] sm:opacity-[0.1]">
        <Image
          src={`${ASSETS}/further-text.png`}
          alt=""
          width={290}
          height={67}
          className="h-auto w-[70vw] max-w-[900px]"
        />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-8 text-center">
        <p
          className="text-xs uppercase tracking-[0.3em] text-white/60"
          style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}
        >
          ROOT FURTHER · SAA 2025
        </p>

        <div
          className="flex flex-col gap-6 text-white/85"
          style={{ fontFamily: FONT_MONTSERRAT, fontSize: "17px", lineHeight: "30px", fontWeight: 400 }}
        >
          <p>
            Đứng giữa thế giới đầy biến chuyển, chúng ta vẫn tìm được điểm tựa nơi gốc rễ — nơi những giá trị mà mỗi cá nhân và đội nhóm Sun*
            không ngừng vun đắp qua thời gian.
          </p>
          <p>
            ROOT FURTHER là lời nhắc về hành trình của chúng ta: bám rễ vững chắc vào nền tảng văn hóa, kỹ năng và sự tử tế, để vươn xa hơn nữa
            trong từng dự án và từng cơ hội.
          </p>
          <p>
            SAA 2025 vinh danh những con người, những đội nhóm và những câu chuyện đã sống đúng tinh thần ấy — kiên định với gốc rễ, dũng cảm với
            tương lai.
          </p>
        </div>

        <blockquote
          className="mt-4 border-t border-white/10 pt-8 text-white/95"
          style={{ fontFamily: FONT_MONTSERRAT, fontSize: "24px", lineHeight: "36px", fontStyle: "italic", fontWeight: 500 }}
        >
          “A tree with deep roots fears no storm.”
          <footer
            className="mt-3 text-white/60"
            style={{ fontFamily: FONT_MONTSERRAT, fontSize: "14px", fontStyle: "normal", fontWeight: 500 }}
          >
            — English proverb
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
