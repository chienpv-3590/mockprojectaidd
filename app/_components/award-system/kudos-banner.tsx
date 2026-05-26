import Image from "next/image";
import Link from "next/link";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

/**
 * Sun* Kudos promotional banner for the Award System page.
 * `Chi tiết` navigates to /sun-kudos (placeholder per clarifications.md).
 * Layout: text content left + Kudos logo right (stacks on mobile).
 */
export function KudosBanner() {
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
          aria-hidden={true}
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-90"
          style={{ backgroundImage: `url(${ASSETS}/kudos-background.png)` }}
        />
        {/* Extra darkening overlay for readability */}
        <div
          aria-hidden={true}
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

          <div
            className="text-white/85"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontSize: "14px",
              lineHeight: "22px",
              fontWeight: 400,
            }}
          >
            <p>
              <span style={{ fontWeight: 700 }}>Điểm mới của SAA 2025:</span>{" "}
              Hoạt động ghi nhận và cảm ơn đồng nghiệp - lần đầu tiên được diễn
              ra dành cho tất cả Sunner. Hoạt động sẽ được triển khai vào tháng
              11/2025, khuyến khích người Sun* chia sẻ những lời ghi nhận, cảm
              ơn đồng nghiệp trên hệ thống do BTC công bố. Đây sẽ là chất liệu
              để Hội đồng Heads tham khảo trong quá trình lựa chọn người đạt
              giải.
            </p>
          </div>

          {/* Chi tiết — text_link style with arrow icon */}
          <Link
            href="/sun-kudos"
            className="group mt-2 inline-flex items-center gap-2 text-[#FFEA9E] transition hover:text-[#FFDD70]"
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
              aria-hidden={true}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              <path
                d="M3 11L11 3M11 3H5M11 3V9"
                stroke="currentColor"
                strokeWidth="1.6"
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
