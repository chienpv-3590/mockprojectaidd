import type { Award } from "@/lib/data/types";
import { AwardCard } from "./award-card";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

export function AwardsGrid({ awards }: { awards: Award[] }) {
  return (
    <section className="bg-[#00101A] px-6 py-20 text-white sm:px-10 lg:px-36">
      <div className="mx-auto max-w-[1224px]">
        <div className="flex flex-col items-start gap-4">
          <p
            className="uppercase text-white/85"
            style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600, fontSize: "14px", letterSpacing: "0.15em" }}
          >
            Sun* annual awards 2025
          </p>
          <hr aria-hidden className="h-px w-full border-0 bg-[#2E3940]" />
          <h2
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "57px",
              lineHeight: "64px",
              letterSpacing: "-0.25px",
              color: "#FFEA9E",
            }}
          >
            Hệ thống giải thưởng
          </h2>
        </div>

        {awards.length === 0 ? (
          <p className="mt-10 text-center text-white/70" style={{ fontFamily: FONT_MONTSERRAT }}>
            Chưa có hạng mục giải thưởng.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-x-20 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((award) => (
              <AwardCard key={award.id} award={award} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
