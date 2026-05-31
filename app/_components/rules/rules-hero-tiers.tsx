import Image from "next/image";

/**
 * 4-tier Hero badge list for the Thể lệ drawer. Each row pairs a badge
 * image (sourced from `public/sun-kudos/hero-badges/{key}-hero.png`) with
 * the tier's "X people have sent you Kudos" range + description.
 *
 * `badgeKey` is a stable identifier from the i18n dict; this component
 * holds the key→file mapping. A unit test guards key parity.
 */

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

export const RULES_BADGE_SRC: Readonly<Record<string, string>> = {
  new: "/sun-kudos/hero-badges/new-hero.png",
  rising: "/sun-kudos/hero-badges/rising-hero.png",
  super: "/sun-kudos/hero-badges/super-hero.png",
  legend: "/sun-kudos/hero-badges/legend-hero.png",
};

export type RulesTier = {
  badgeKey: string;
  range: string;
  desc: string;
};

export type RulesHeroTiersProps = {
  tiers: ReadonlyArray<RulesTier>;
};

export function RulesHeroTiers({ tiers }: RulesHeroTiersProps) {
  return (
    <ul className="flex flex-col gap-4" style={{ fontFamily: FONT_MONTSERRAT }}>
      {tiers.map((tier) => {
        const badgeSrc = RULES_BADGE_SRC[tier.badgeKey];
        return (
          <li key={tier.badgeKey} className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              {badgeSrc ? (
                <Image
                  src={badgeSrc}
                  alt=""
                  width={120}
                  height={32}
                  className="h-7 w-auto"
                  unoptimized
                />
              ) : null}
              <span
                className="text-white"
                style={{ fontWeight: 700, fontSize: "14px", lineHeight: "20px" }}
              >
                {tier.range}
              </span>
            </div>
            <p
              className="text-white/85"
              style={{ fontSize: "14px", lineHeight: "22px" }}
            >
              {tier.desc}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
