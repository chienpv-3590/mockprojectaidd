import type { Award } from "@/lib/data/types";
import { AwardHero } from "./award-hero";
import { AwardMenu } from "./award-menu";
import { AwardDetailCard } from "./award-detail-card";
import { KudosBanner } from "../shared/kudos-banner";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

/**
 * Award System page container.
 * Composes hero + 2-column layout (sticky menu | award detail cards) +
 * Kudos banner. Cards are separated by a 1px #2E3940 rule (Rectangle 14 in
 * the MoMorph design, node I313:8467;214:2771).
 */
export function AwardSystem({ awards }: { awards: Award[] }) {
  const sorted = [...awards].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="min-h-screen bg-[#00101A] text-white">
      {/* Hero — reduced banner, no countdown/CTA */}
      <AwardHero />

      {/* Main content: sticky left menu + award detail cards.
          Design `mms_B_Hệ thống giải thưởng` (313:8458): no section header
          above this — Sun* Annual Awards label already lives in the hero. */}
      <section
        aria-label="Danh sách giải thưởng"
        className="bg-[#00101A] px-6 py-16 sm:px-10 lg:px-36"
      >
        <div className="mx-auto max-w-[1224px]">
          {sorted.length === 0 ? (
            <p
              className="text-center text-white/60"
              style={{ fontFamily: FONT_MONTSERRAT, fontSize: "15px" }}
            >
              Chưa có hạng mục giải thưởng.
            </p>
          ) : (
            <div className="flex flex-col gap-10 lg:flex-row lg:gap-20">
              {/* Left menu — sticky on desktop, horizontal pill row on mobile.
                  AwardMenu renders both responsive variants internally; we
                  apply `sticky` directly on this aside so the menu's
                  containing block has the full column height (a wrapping div
                  with `height: auto` would collapse and break sticky). */}
              <aside className="lg:sticky lg:top-28 lg:w-[220px] lg:shrink-0 lg:self-start">
                <AwardMenu awards={sorted} />
              </aside>

              {/* Award detail cards — alternating image-left/right with a
                  1px #2E3940 separator between each (design Rectangle 14). */}
              <div className="flex flex-1 flex-col gap-20">
                {sorted.map((award, index) => (
                  <div key={award.id} className="flex flex-col gap-20">
                    <AwardDetailCard
                      award={award}
                      imageLeft={index % 2 === 0}
                    />
                    {index < sorted.length - 1 && (
                      <hr
                        aria-hidden
                        className="h-px w-full border-0"
                        style={{ backgroundColor: "#2E3940" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Kudos promotional banner */}
      <KudosBanner href="/sun-kudos" />
    </div>
  );
}
