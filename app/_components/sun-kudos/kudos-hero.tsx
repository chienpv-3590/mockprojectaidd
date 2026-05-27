import Image from "next/image";

const FM = "var(--font-montserrat), system-ui, sans-serif";

/**
 * KudosHero — top banner for /sun-kudos.
 *
 * Design (node 2940:13437 A_KV Kudos, 1152×160 at x=144):
 *   - Full-bleed keyvisual background (same /home/keyvisual-bg.jpg as award hero)
 *   - Cover overlay gradient: dark-to-transparent bottom-up
 *   - Title text: "Hệ thống ghi nhận và cảm ơn" 36px yellow Montserrat 700
 *   - Kudos wordmark logo (MM_MEDIA_Kudos logo, node 2940:13440)
 *   - Overall section height ~184px including 96px top padding from Bìa frame
 */
export function KudosHero() {
  return (
    <section
      className="relative isolate flex min-h-[280px] flex-col justify-end text-white lg:min-h-[360px]"
      aria-labelledby="kudos-hero-heading"
    >
      {/* Keyvisual background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: "url(/home/keyvisual-bg.jpg)",
          backgroundSize: "101.245% 367.889%",
          backgroundPosition: "-0.163px -858.967px",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Cover gradient — per design node I2940:13432;1210:12612:
          linear-gradient(25deg, #00101A 14.74%, rgba(0,19,32,0) 47.8%).
          Diagonal angle makes bottom-LEFT dark (where heading/logo sit) while
          upper-RIGHT keeps the colorful keyvisual visible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(25deg, #00101A 14.74%, rgba(0,19,32,0) 47.8%)",
        }}
      />
      {/* Gold tint overlay — brand accent warm wash, matches spotlight container */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(0deg, rgba(255,234,158,0.08), rgba(255,234,158,0.08))",
        }}
      />

      {/* Content row: title + Kudos logo — max-width 1152px centered at 144px margins */}
      <div className="px-6 pb-10 sm:px-10 lg:px-36 lg:pb-14">
        <div className="mx-auto flex max-w-[1152px] flex-col items-start gap-2">
          {/* "Hệ thống ghi nhận và cảm ơn" — node 2940:13439: 36px yellow 700 */}
          <h1
            id="kudos-hero-heading"
            style={{
              fontFamily: FM,
              fontWeight: 700,
              fontSize: "clamp(22px, 2.5vw, 36px)",
              lineHeight: "44px",
              color: "#FFEA9E",
              letterSpacing: "0px",
            }}
          >
            Hệ thống ghi nhận và cảm ơn
          </h1>

          {/* Kudos wordmark — MM_MEDIA_Kudos logo (593×104 in design) */}
          <Image
            src="/home/logo-kudos.svg"
            alt="KUDOS"
            width={593}
            height={104}
            unoptimized
            priority
            className="h-auto w-[260px] sm:w-[360px] lg:w-[480px] max-w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
