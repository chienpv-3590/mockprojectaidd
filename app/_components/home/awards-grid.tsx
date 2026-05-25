import type { Award } from "@/lib/data/types";
import { AwardCard } from "./award-card";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

export function AwardsGrid({ awards }: { awards: Award[] }) {
  return (
    <section className="bg-[#00101A] px-6 py-24 text-white sm:px-10 lg:py-32">
      <div className="mx-auto max-w-6xl rounded-lg lg:px-16">
        <p
          className="text-center text-xs uppercase tracking-[0.3em] text-white/60"
          style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}
        >
          Sun* annual awards 2025
        </p>
        <h2
          className="mt-4 text-center text-3xl text-white sm:text-4xl lg:text-5xl"
          style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 700 }}
        >
          Hệ thống giải thưởng
        </h2>

        {awards.length === 0 ? (
          <p className="mt-10 text-center text-white/70" style={{ fontFamily: FONT_MONTSERRAT }}>
            Chưa có hạng mục giải thưởng.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((award) => (
              <AwardCard key={award.id} award={award} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
