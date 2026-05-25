import Image from "next/image";
import Link from "next/link";
import type { Award } from "@/lib/data/types";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

const TITLE_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "20px",
  lineHeight: "28px",
};

const DESC_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 400 as const,
  fontSize: "14px",
  lineHeight: "22px",
};

export function AwardCard({ award }: { award: Award }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0b1a26] shadow-md transition hover:border-[#FFD24C]/40 hover:shadow-xl">
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={`${ASSETS}/awards/award-bg.png`}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {award.thumbnail_path && (
          <Image
            src={award.thumbnail_path}
            alt=""
            fill
            sizes="(max-width: 768px) 80vw, 30vw"
            className="object-contain p-12"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 text-white">
        <h3 style={TITLE_STYLE}>{award.title_vi}</h3>
        <p className="flex-1 text-white/75" style={DESC_STYLE}>
          {award.description_vi}
        </p>
        <Link
          href={`#${award.code}`}
          className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm text-[#FFD24C] transition hover:text-[#FFDD70]"
          style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}
        >
          Chi tiết
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
