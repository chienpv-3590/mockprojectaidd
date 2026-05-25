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
    <article className="group flex flex-col gap-4">
      <Link
        href={`#${award.code}`}
        className="relative block aspect-square w-full overflow-hidden rounded-lg transition group-hover:-translate-y-1"
      >
        <Image
          src={`${ASSETS}/awards/award-bg.png`}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {award.thumbnail_path && (
          <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
            <Image
              src={award.thumbnail_path}
              alt={award.title_vi}
              width={280}
              height={80}
              className="h-auto max-h-[55%] w-auto max-w-[78%] object-contain"
            />
          </div>
        )}
      </Link>
      <div className="flex flex-col gap-2 text-white">
        <Link href={`#${award.code}`} className="text-white transition hover:text-[#FFEA9E]" style={TITLE_STYLE}>
          {award.title_vi}
        </Link>
        <p className="line-clamp-2 text-white/70" style={DESC_STYLE}>
          {award.description_vi}
        </p>
        <Link
          href={`#${award.code}`}
          aria-label={`Chi tiết — ${award.title_vi}`}
          className="mt-1 inline-flex w-fit items-center gap-1.5 text-[#FFEA9E] transition hover:text-[#FFDD70]"
          style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600, fontSize: "14px" }}
        >
          Chi tiết
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M3 11L11 3M11 3H5M11 3V9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
