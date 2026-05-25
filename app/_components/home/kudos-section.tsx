import Image from "next/image";
import Link from "next/link";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

const CTA_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "16px",
  letterSpacing: "0.5px",
};

type KudosSectionProps = {
  receivedCount?: number;
};

export function KudosSection({ receivedCount = 0 }: KudosSectionProps) {
  return (
    <section className="relative isolate overflow-hidden bg-[#00101A] px-6 py-20 text-white sm:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${ASSETS}/kudos-background.png)` }}
      />
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <p
          className="text-xs uppercase tracking-[0.3em] text-white/60"
          style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}
        >
          Phong trào ghi nhận
        </p>
        <Image
          src={`${ASSETS}/logo-kudos.svg`}
          alt="Sun* Kudos"
          width={364}
          height={72}
          unoptimized
          className="mt-4 h-16 w-auto"
        />
        <p
          className="mt-6 max-w-2xl text-white/80"
          style={{ fontFamily: FONT_MONTSERRAT, fontSize: "16px", lineHeight: "26px" }}
        >
          Gửi lời cảm ơn và ghi nhận đồng nghiệp đã đồng hành cùng bạn trong hành trình này.
          {receivedCount > 0 && (
            <>
              <br />
              <span className="text-[#FFD24C]">
                Bạn đã nhận được <strong>{receivedCount}</strong> lời khen.
              </span>
            </>
          )}
        </p>
        <Link
          href="#"
          className="mt-8 rounded-md bg-[#FFD24C] px-7 py-3 text-[#00101A] shadow-md transition hover:bg-[#FFDD70] hover:shadow-lg"
          style={CTA_STYLE}
        >
          Chi tiết
        </Link>
      </div>
    </section>
  );
}
