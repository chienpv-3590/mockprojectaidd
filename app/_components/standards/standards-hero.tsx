import Image from "next/image";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

type StandardsHeroProps = {
  /** Small white subtitle above the divider (e.g. "Sun* Annual Awards 2025"). */
  subtitle: string;
  /** Yellow page-level heading below the divider (e.g. "Tiêu chuẩn chung"). */
  title: string;
};

/**
 * Standards page hero — adapts the AwardHero pattern (ROOT FURTHER keyvisual
 * + centered title block) for the General Standards page.
 *
 * The MoMorph web frame "Tiêu chuẩn cộng đồng" (Dpn7C89--r) carries no specs;
 * this hero deliberately mirrors `award-hero.tsx` so the page sits visually
 * inside the SAA web design system (dark base #00101A, yellow #FFEA9E
 * heading, Montserrat). Reuses `/home/keyvisual-bg.jpg` + `/home/root-further-logo.png`.
 */
export function StandardsHero({ subtitle, title }: StandardsHeroProps) {
  return (
    <section
      className="relative isolate flex min-h-[360px] flex-col text-white lg:min-h-[460px]"
      aria-labelledby="standards-hero-heading"
    >
      {/* Keyvisual wave background — identical transform to AwardHero
          so the colorful wave band fills the hero. */}
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
      {/* Bottom-up dark gradient so the title block reads against the wave. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(0deg, #00101A -4.23%, rgba(0,19,32,0) 52.79%)",
        }}
      />

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

      <div className="mt-auto px-6 pb-12 sm:px-10 lg:px-36 lg:pb-16">
        <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-4">
          <p
            className="text-center text-white"
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "clamp(16px, 1.7vw, 24px)",
              lineHeight: "1.33",
            }}
          >
            {subtitle}
          </p>
          <hr
            aria-hidden
            className="h-px w-full border-0"
            style={{ backgroundColor: "#2E3940" }}
          />
          <h1
            id="standards-hero-heading"
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
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
