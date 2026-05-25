import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

const CTA_LABEL_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "16px",
  letterSpacing: "0.5px",
};

type HeroProps = {
  countdownSlot?: ReactNode;
};

// Layout follows MoMorph Frame 487 (2167:9031):
//   flex-col, items-start, gap 40px, max-width 1224px (centered on viewport)
// 3 stacked groups, each LEFT-aligned:
//   1. Headline    (Frame 482, 2167:9032) — ROOT FURTHER image + "Coming soon"
//   2. Countdown   (Frame 523, 2167:9034) — countdown timer + event info
//   3. CTA pair    (mms_B3_Call-To-Action, 2167:9062) — 2 buttons flex-row
export function Hero({ countdownSlot }: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[80vh] flex-col justify-center overflow-hidden px-6 py-24 text-white sm:px-10 lg:px-20">
      {/* Background painterly artwork (full-bleed) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-95"
        style={{ backgroundImage: `url(${ASSETS}/keyvisual-bg.jpg)` }}
      />
      {/* Dark overlay for contrast */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(120deg, rgba(0,16,26,0.85) 0%, rgba(0,16,26,0.55) 60%, rgba(0,16,26,0.35) 100%)",
        }}
      />

      {/* Frame 487 wrapper — centered 1224px column with left-aligned content */}
      <div className="mx-auto flex w-full max-w-[1224px] flex-col items-start gap-10 text-left">
        {/* Group 1 — Frame 482: headline (ROOT FURTHER + COMING SOON) */}
        <div className="flex flex-col items-start gap-3">
          <Image
            src={`${ASSETS}/root-further-logo.png`}
            alt="ROOT FURTHER"
            width={520}
            height={230}
            priority
            className="h-auto w-72 sm:w-96 lg:w-[32rem] xl:w-[40rem]"
          />
          <p
            className="text-white/80"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 500,
              fontSize: "16px",
              letterSpacing: "0.25em",
            }}
          >
            COMING SOON
          </p>
        </div>

        {/* Group 2 — Frame 523: countdown + event info */}
        <div className="flex flex-col items-start gap-5">
          {countdownSlot}
          <p
            className="max-w-2xl text-white/85"
            style={{ fontFamily: FONT_MONTSERRAT, fontSize: "16px", lineHeight: "26px" }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-white/55">Thời gian: </span>
            <span style={{ fontWeight: 600 }}>20:00 - 22:30, 28/02/2026</span>
            <span className="mx-3 text-white/30">·</span>
            <span className="text-xs uppercase tracking-[0.2em] text-white/55">Địa điểm: </span>
            <span style={{ fontWeight: 600 }}>SAA Theater (TBD)</span>
          </p>
        </div>

        {/* Group 3 — mms_B3_Call-To-Action: 2 buttons flex-row gap-40px */}
        <div className="flex flex-wrap items-start gap-10">
          <Link
            href="#"
            className="rounded-md bg-[#FFD24C] px-9 py-3.5 text-[#00101A] shadow-md transition hover:bg-[#FFDD70] hover:shadow-lg"
            style={CTA_LABEL_STYLE}
          >
            ABOUT AWARDS
          </Link>
          <Link
            href="#"
            className="rounded-md border border-white/40 px-9 py-3.5 text-white transition hover:bg-white/10"
            style={CTA_LABEL_STYLE}
          >
            ABOUT KUDOS
          </Link>
        </div>
      </div>
    </section>
  );
}
