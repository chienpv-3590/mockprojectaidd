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
        className="h-auto w-64 sm:w-80 lg:w-[28rem]"
      />

      <p
        className="mt-6 text-sm text-white/80"
        style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 500 }}
      >
        Coming soon
      </p>

      <div className="mt-4">{countdownSlot}</div>

      <p className="mt-6 max-w-xl text-sm text-white/80 sm:text-base" style={{ fontFamily: FONT_MONTSERRAT }}>
        <span className="font-semibold">Thời gian: </span>20:00 - 22:30, 28/02/2026 ·
        <span className="font-semibold"> Địa điểm: </span>SAA Theater (TBD)
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="#"
          className="rounded-md bg-[#FFD24C] px-7 py-3 text-[#00101A] shadow-md transition hover:bg-[#FFDD70] hover:shadow-lg"
          style={CTA_LABEL_STYLE}
        >
          ABOUT AWARDS
        </Link>
        <Link
          href="#"
          className="rounded-md border border-white/40 px-7 py-3 text-white transition hover:bg-white/10"
          style={CTA_LABEL_STYLE}
        >
          ABOUT KUDOS
        </Link>
      </div>
    </section>
  );
}
