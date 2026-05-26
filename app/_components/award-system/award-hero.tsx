import Image from "next/image";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

/**
 * Award System hero section — matches MoMorph design (1440×547):
 *   - Full-bleed colorful keyvisual background (mms_3_Keyvisual).
 *   - ROOT FURTHER logo overlay in upper-left (the keyvisual JPG itself is
 *     wave-only, so the wordmark is layered separately).
 *   - Bottom-centered title block (mms_A_Title): subtitle (24px white,
 *     centered) → 1px divider line (#2E3940, full content width) → main
 *     heading (57px yellow, centered).
 *   - 144px horizontal padding at lg+ matches the design's `Bìa` frame.
 */
export function AwardHero() {
  return (
    <section
      className="relative isolate flex min-h-[420px] flex-col text-white lg:min-h-[547px]"
      aria-labelledby="award-hero-heading"
    >
      {/* Keyvisual background — exact match to design image 20 (2167:5138):
          background-size: 101.245% 367.889%, position: -0.163px -858.967px.
          Stretches the JPG vertically ~3.68× and shifts up 859px so the
          most colorful wave band of the source fills the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${ASSETS}/keyvisual-bg.jpg)`,
          backgroundSize: "101.245% 367.889%",
          backgroundPosition: "-0.163px -858.967px",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Cover gradient — exact match to design `Cover` rect 313:8439:
          linear-gradient(0deg, #00101A -4.23%, transparent 52.79%).
          0deg = bottom-to-top. Bottom half stays solid dark navy (where
          title sits), top half is transparent so the keyvisual shows. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(0deg, #00101A -4.23%, rgba(0,19,32,0) 52.79%)",
        }}
      />

      {/* ROOT FURTHER overlay — design `MM_MEDIA_Root Further Logo` 2789:12915:
          338×150 at x=144, y=184. Hero section starts at y=80 (below header),
          Bìa frame adds 96px top padding → logo sits 104px into hero (≈pt-24
          with 16-unit base, or pt-26 for exact). Logo aspect 169/75. */}
      <div className="px-6 pt-12 sm:px-10 sm:pt-16 lg:px-36 lg:pt-[104px]">
        <Image
          src={`${ASSETS}/root-further-logo.png`}
          alt="ROOT FURTHER"
          width={338}
          height={150}
          priority
          className="h-auto w-[200px] sm:w-[260px] lg:w-[338px]"
        />
      </div>

      {/* Centered title block at the bottom of the hero
          (mms_A_Title — y=454–583 in design). */}
      <div className="mt-auto px-6 pb-12 sm:px-10 lg:px-36 lg:pb-16">
        <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-4">
          <p
            className="text-center text-white"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "clamp(16px, 1.7vw, 24px)",
              lineHeight: "1.33",
              letterSpacing: 0,
            }}
          >
            Sun* Annual Awards 2025
          </p>
          <hr
            aria-hidden
            className="h-px w-full border-0"
            style={{ backgroundColor: "#2E3940" }}
          />
          <h1
            id="award-hero-heading"
            className="text-center"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "clamp(28px, 4.5vw, 57px)",
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
