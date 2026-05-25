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

export function Hero({ countdownSlot }: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center text-white">
      {/* Background painterly artwork (full-bleed). Pinned behind everything. */}
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
            "linear-gradient(180deg, rgba(0,16,26,0.55) 0%, rgba(0,16,26,0.85) 100%)",
        }}
      />

      <Image
        src={`${ASSETS}/root-further-logo.png`}
        alt="ROOT FURTHER"
        width={520}
        height={230}
        priority
        className="h-auto w-80 sm:w-[26rem] lg:w-[36rem] xl:w-[42rem]"
      />

      <p
        className="mt-8 text-base text-white/80 sm:text-lg"
        style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 500, letterSpacing: "0.2em" }}
      >
        COMING SOON
      </p>

      <div className="mt-6">{countdownSlot}</div>

      <p
        className="mt-10 max-w-2xl text-white/85"
        style={{ fontFamily: FONT_MONTSERRAT, fontSize: "16px", lineHeight: "26px" }}
      >
        <span className="text-xs uppercase tracking-[0.2em] text-white/55">Thời gian: </span>
        <span style={{ fontWeight: 600 }}>20:00 - 22:30, 28/02/2026</span>
        <span className="mx-3 text-white/30">·</span>
        <span className="text-xs uppercase tracking-[0.2em] text-white/55">Địa điểm: </span>
        <span style={{ fontWeight: 600 }}>SAA Theater (TBD)</span>
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-10">
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
    </section>
  );
}
