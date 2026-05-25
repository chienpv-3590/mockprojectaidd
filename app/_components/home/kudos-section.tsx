import Image from "next/image";
import Link from "next/link";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

const CTA_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "14px",
  letterSpacing: "0.5px",
};

export function KudosSection() {
  return (
    <section className="bg-[#00101A] px-6 py-20 text-white sm:px-10 lg:px-36">
      <div
        className="relative isolate mx-auto flex max-w-[1224px] flex-col items-stretch gap-8 overflow-hidden rounded-2xl bg-[#0A0A0A] px-8 py-12 sm:px-14 sm:py-16 lg:flex-row lg:items-center lg:gap-12"
        style={{ minHeight: "360px" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-90"
          style={{ backgroundImage: `url(${ASSETS}/kudos-background.png)` }}
        />

        <div className="relative z-10 flex max-w-[520px] flex-col items-start gap-4 text-left lg:flex-1">
          <p
            className="uppercase text-white/80"
            style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600, fontSize: "13px", letterSpacing: "0.15em" }}
          >
            Phong trào ghi nhận
          </p>
          <h3
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "48px",
              lineHeight: "56px",
              color: "#FFEA9E",
              letterSpacing: "-0.25px",
            }}
          >
            Sun* Kudos
          </h3>
          <div
            className="text-white/85"
            style={{ fontFamily: FONT_MONTSERRAT, fontSize: "14px", lineHeight: "22px", fontWeight: 400 }}
          >
            <p>
              <span style={{ fontWeight: 700 }}>Điểm mới của SAA 2025:</span> Hoạt động ghi nhận và cảm ơn
              đồng nghiệp - lần đầu tiên được diễn ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai
              vào tháng 11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm ơn đồng nghiệp trên
              hệ thống do BTC công bố. Đây sẽ là chất liệu để Hội đồng Heads tham khảo trong quá trình lựa
              chọn người đạt giải.
            </p>
          </div>
          <Link
            href="#"
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-[#FFEA9E] px-6 py-3 text-[#00101A] shadow-md transition hover:bg-[#FFDD70] hover:shadow-lg"
            style={CTA_STYLE}
          >
            Chi tiết
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 11L11 3M11 3H5M11 3V9"
                stroke="#00101A"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className="relative z-10 flex items-center justify-center lg:flex-1">
          <Image
            src={`${ASSETS}/logo-kudos.svg`}
            alt="Sun* Kudos"
            width={420}
            height={120}
            unoptimized
            className="h-auto w-full max-w-[420px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
