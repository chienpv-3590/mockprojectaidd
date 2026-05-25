import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

// Design palette for hero CTAs — verified via MoMorph get_node 2167:9063 / 9064.
const CTA_YELLOW = "#FFEA9E"; // primary fill (was #FFD24C — wrong)
const CTA_OUTLINE_BORDER = "#998C5F";
const CTA_OUTLINE_BG = "rgba(255, 234, 158, 0.10)";

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
        {/* Group 1 — Frame 482 (2167:9032): headline (ROOT FURTHER image, 451x200) */}
        <div className="flex flex-col items-start">
          <Image
            src={`${ASSETS}/root-further-logo.png`}
            alt="ROOT FURTHER"
            width={451}
            height={200}
            priority
            className="h-auto w-full max-w-[451px]"
          />
        </div>

        {/* Group 2 — Frame 523 (2167:9034): countdown subgroup + event info, gap 16px */}
        <div className="flex flex-col items-start gap-4">
          {/* Sub-frame 2167:9035 — Coming Soon label + countdown boxes (gap 16) */}
          <div className="flex flex-col items-start gap-4">
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
            {countdownSlot}
          </div>
          {/* Sub-frame 2167:9053 — event info (gap 8) */}
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

        {/* Group 3 — mms_B3_Call-To-Action (2167:9062): 2 buttons flex-row gap-10 */}
        <div className="flex flex-wrap items-start gap-10">
          <Link
            href="#"
            className="inline-flex h-[60px] min-w-[276px] items-center justify-center rounded-lg px-6 py-4 text-[#00101A] shadow-md transition hover:brightness-105 hover:shadow-lg"
            style={{ ...CTA_LABEL_STYLE, backgroundColor: CTA_YELLOW }}
          >
            ABOUT AWARDS
          </Link>
          <Link
            href="#"
            className="inline-flex h-[60px] min-w-[276px] items-center justify-center rounded-lg px-6 py-4 transition hover:brightness-110"
            style={{
              ...CTA_LABEL_STYLE,
              backgroundColor: CTA_OUTLINE_BG,
              border: `1px solid ${CTA_OUTLINE_BORDER}`,
              color: CTA_YELLOW,
            }}
          >
            ABOUT KUDOS
          </Link>
        </div>
      </div>
    </section>
  );
}
