import Image from "next/image";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

/**
 * Award System hero section — reduced banner per design.
 * Contains: Cover top band (bg), ROOT FURTHER keyvisual logo strip (top-left),
 * then white sub-title + large yellow heading.
 * No countdown, no CTA buttons (those belong to the home hero only).
 */
export function AwardHero() {
  return (
    <section
      className="relative flex min-h-[360px] flex-col justify-end px-6 pb-14 pt-20 text-white sm:px-10 lg:px-36"
      aria-labelledby="award-hero-heading"
    >
      {/* Dark keyvisual background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${ASSETS}/keyvisual-bg.jpg)` }}
      />
      {/* Overlay for readability */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[#00101A]/60" />

      <div className="mx-auto flex w-full max-w-[1224px] flex-col items-start gap-6">
        {/* ROOT FURTHER keyvisual logo */}
        <Image
          src={`${ASSETS}/root-further-logo.png`}
          alt="ROOT FURTHER"
          width={300}
          height={133}
          priority
          className="h-auto w-full max-w-[300px]"
        />

        {/* Title block */}
        <div className="flex flex-col items-start gap-2">
          <p
            className="text-white"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Sun* Annual Awards 2025
          </p>
          <h1
            id="award-hero-heading"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 57px)",
              lineHeight: "1.12",
              letterSpacing: "-0.25px",
              color: "#FFEA9E",
            }}
          >
            Hệ thống giải thưởng SAA 2025
          </h1>
        </div>
      </div>
    </section>
  );
}
