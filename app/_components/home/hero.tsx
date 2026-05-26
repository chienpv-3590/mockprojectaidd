import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

const CTA_YELLOW = "#FFEA9E";
const CTA_OUTLINE_BORDER = "#998C5F";
const CTA_LABEL_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "16px",
  letterSpacing: "0.5px",
};

type HeroProps = {
  countdownSlot?: ReactNode;
};

function ArrowIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 14L14 4M14 4H6.5M14 4V11.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero({ countdownSlot }: HeroProps) {
  return (
    <section className="relative flex min-h-[700px] flex-col justify-center px-6 py-20 text-white sm:px-10 lg:px-36">
      <div className="mx-auto flex w-full max-w-[1224px] flex-col items-start gap-10 text-left">
        <Image
          src={`${ASSETS}/root-further-logo.png`}
          alt="ROOT FURTHER"
          width={451}
          height={200}
          priority
          className="h-auto w-full max-w-[451px]"
        />

        <div className="flex flex-col items-start gap-4">
          <p
            className="text-white"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "24px",
              lineHeight: "32px",
            }}
          >
            Comming soon
          </p>
          {countdownSlot}
          <div
            className="mt-2 flex flex-wrap items-center gap-x-12 gap-y-1 text-white/90"
            style={{ fontFamily: FONT_MONTSERRAT, fontSize: "16px", lineHeight: "24px", fontWeight: 500 }}
          >
            <span>
              <span className="text-white">Thời gian: </span>
              <span style={{ fontWeight: 700, color: CTA_YELLOW }}>26/12/2025</span>
            </span>
            <span>
              <span className="text-white">Địa điểm: </span>
              <span style={{ fontWeight: 700, color: CTA_YELLOW }}>Âu Cơ Art Center</span>
            </span>
          </div>
          <p
            className="text-white/80"
            style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 500, fontSize: "14px", lineHeight: "20px" }}
          >
            Tường thuật trực tiếp qua sóng Livestream
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <Link
            href="/he-thong-giai"
            className="inline-flex h-[60px] min-w-[276px] items-center justify-between rounded-lg px-6 py-4 text-[#00101A] shadow-md transition hover:brightness-105 hover:shadow-lg"
            style={{ ...CTA_LABEL_STYLE, backgroundColor: CTA_YELLOW }}
          >
            ABOUT AWARDS
            <ArrowIcon color="#00101A" />
          </Link>
          <Link
            href="/sun-kudos"
            className="inline-flex h-[60px] min-w-[276px] items-center justify-between rounded-lg px-6 py-4 transition hover:bg-white/5"
            style={{
              ...CTA_LABEL_STYLE,
              border: `1px solid ${CTA_OUTLINE_BORDER}`,
              color: CTA_YELLOW,
            }}
          >
            ABOUT KUDOS
            <ArrowIcon color={CTA_YELLOW} />
          </Link>
        </div>
      </div>
    </section>
  );
}
