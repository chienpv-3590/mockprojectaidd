import Image from "next/image";
import Link from "next/link";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

type KudosBannerProps = {
  /** Destination for the "Chi tiết" CTA. */
  href: string;
};

/**
 * Sun* Kudos promotional banner — used by both the home page and the
 * /he-thong-giai page. Matches MoMorph design `mms_D2_Content` (335:12023):
 *  - "Phong trào ghi nhận" eyebrow
 *  - "Sun* Kudos" yellow heading
 *  - "ĐIỂM MỚI CỦA SAA 2025" uppercase label (own line)
 *  - Body paragraph
 *  - Filled yellow "Chi tiết" button with arrow icon
 *  - Kudos logo on the right (stacks on mobile)
 */
export function KudosBanner({ href }: KudosBannerProps) {
  return (
    <section
      aria-labelledby="kudos-banner-heading"
      className="bg-[#00101A] px-6 py-16 text-white sm:px-10 lg:px-36"
    >
      <div
        className="relative isolate mx-auto flex max-w-[1224px] flex-col items-stretch gap-8 overflow-hidden rounded-2xl px-8 py-12 sm:px-14 sm:py-16 lg:flex-row lg:items-center lg:gap-12"
        style={{ minHeight: "340px" }}
      >
        {/* Dark gradient background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-90"
          style={{ backgroundImage: `url(${ASSETS}/kudos-background.png)` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#00101A]/80 via-[#00101A]/40 to-transparent"
        />

        {/* Left — text content */}
        <div className="relative z-10 flex max-w-[520px] flex-col items-start gap-4 text-left lg:flex-1">
          <p
            className="uppercase text-white/80"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "0.15em",
            }}
          >
            Phong trào ghi nhận
          </p>

          <h2
            id="kudos-banner-heading"
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
          </h2>

          <p
            className="uppercase text-white"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.12em",
            }}
          >
            Điểm mới của SAA 2025
          </p>

          <p
            className="text-white/85"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontSize: "14px",
              lineHeight: "22px",
              fontWeight: 400,
            }}
          >
            Hoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên được diễn ra
            dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng
            11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm ơn
            đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu để
            Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt giải.
          </p>

          <Link
            href={href}
            className="group mt-2 inline-flex items-center gap-2 rounded-lg bg-[#FFEA9E] px-5 py-2.5 text-[#00101A] transition hover:bg-[#FFDD70]"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.3px",
            }}
          >
            Chi tiết
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path
                d="M3 11L11 3M11 3H5M11 3V9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Right — Kudos logo */}
        <div className="relative z-10 flex items-center justify-center lg:flex-1">
          <Image
            src={`${ASSETS}/logo-kudos.svg`}
            alt="Sun* Kudos"
            width={420}
            height={120}
            unoptimized
            className="h-auto w-full max-w-[320px] object-contain lg:max-w-[420px]"
          />
        </div>
      </div>
    </section>
  );
}
