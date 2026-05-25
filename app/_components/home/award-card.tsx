import Image from "next/image";
import Link from "next/link";
import type { Award } from "@/lib/data/types";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

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
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5 text-white">
        <p
          className="line-clamp-2 flex-1 text-white/75"
          style={DESC_STYLE}
        >
          {award.description_vi}
        </p>
        <Link
          href={`#${award.code}`}
          aria-label={`Chi tiết — ${award.title_vi}`}
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
