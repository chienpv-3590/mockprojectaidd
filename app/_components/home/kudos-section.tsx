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
    <section className="bg-[#00101A] px-6 py-24 text-white sm:px-10 lg:py-32">
      <div className="relative isolate mx-auto flex max-w-6xl flex-col items-center overflow-hidden rounded-2xl bg-[#0F0F0F] px-6 py-16 text-center sm:px-16 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${ASSETS}/kudos-background.png)` }}
        />
        <p
          className="text-xs uppercase tracking-[0.3em] text-white/70"
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
          className="mt-6 h-20 w-auto sm:h-24"
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
