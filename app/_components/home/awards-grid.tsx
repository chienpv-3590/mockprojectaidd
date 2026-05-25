import type { Award } from "@/lib/data/types";
import { AwardCard } from "./award-card";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

export function AwardsGrid({ awards }: { awards: Award[] }) {
  return (
    <section className="bg-[#00101A] px-6 py-20 text-white sm:px-10">
      <div className="mx-auto max-w-6xl">
        <p
          className="text-center text-xs uppercase tracking-[0.3em] text-white/60"
          style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}
        >
          Sun* annual awards 2025
        </p>
        <h2
          className="mt-3 text-center text-3xl text-white sm:text-4xl"
          style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 700 }}
        >
          Hệ thống giải thưởng
        </h2>

        {awards.length === 0 ? (
          <p className="mt-10 text-center text-white/70" style={{ fontFamily: FONT_MONTSERRAT }}>
            Chưa có hạng mục giải thưởng.
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {awards.map((award) => (
              <AwardCard key={award.id} award={award} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
