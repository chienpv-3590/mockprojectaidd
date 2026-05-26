import type { Award } from "@/lib/data/types";
import { AwardHero } from "./award-hero";
import { AwardMenu } from "./award-menu";
import { AwardDetailCard } from "./award-detail-card";
import { KudosBanner } from "./kudos-banner";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

/**
 * Award System page container.
 *
 * Integration contract (Phase 05):
 *   - Accepts Award[] from server (Supabase query in page.tsx).
 *   - Award type already includes extended fields: long_description_vi,
 *     quantity_text, unit_text, value_text, value_breakdown.
 *   - activeCode prop wired to IntersectionObserver state in Phase 05.
 *
 * For local visual validation, import MOCK_AWARDS from ./mock-awards.ts.
 */
export function AwardSystem({ awards }: { awards: Award[] }) {
  const sorted = [...awards].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="min-h-screen bg-[#00101A] text-white">
      {/* Hero — reduced banner, no countdown/CTA */}
      <AwardHero />

      {/* Main content: sticky left menu + award detail cards */}
      <section
        aria-label="Danh sách giải thưởng"
        className="bg-[#00101A] px-6 py-16 sm:px-10 lg:px-36"
      >
        <div className="mx-auto max-w-[1224px]">
          {/* Section header */}
          <div className="mb-12 flex flex-col items-start gap-3">
            <p
              className="uppercase text-white/70"
              style={{
                fontFamily: FONT_MONTSERRAT,
                fontWeight: 600,
                fontSize: "13px",
                letterSpacing: "0.15em",
              }}
            >
              Sun* Annual Awards 2025
            </p>
            <hr aria-hidden={true} className="h-px w-full border-0 bg-[#2E3940]" />
          </div>

          {sorted.length === 0 ? (
            <p
              className="text-center text-white/60"
              style={{ fontFamily: FONT_MONTSERRAT, fontSize: "15px" }}
            >
              Chưa có hạng mục giải thưởng.
            </p>
          ) : (
            <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
              {/* Left sticky menu — hidden on mobile (rendered above cards as pill row) */}
              <aside className="lg:w-[220px] lg:shrink-0">
                {/* Mobile pill row */}
                <div className="mb-8 lg:hidden">
                  <AwardMenu awards={sorted} />
                </div>
                {/* Desktop sticky list */}
                <div className="hidden lg:block">
                  <AwardMenu awards={sorted} />
                </div>
              </aside>

              {/* Award detail cards — alternating image-left / image-right */}
              <div className="flex flex-1 flex-col gap-20">
                {sorted.map((award, index) => (
                  <AwardDetailCard
                    key={award.id}
                    award={award}
                    imageLeft={index % 2 === 0}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Kudos promotional banner */}
      <KudosBanner />
    </div>
  );
}
