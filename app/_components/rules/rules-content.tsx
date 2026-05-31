import type { Dictionary } from "@/lib/i18n/dictionaries";
import { RulesHeroTiers } from "./rules-hero-tiers";
import { RulesSecretIcons } from "./rules-secret-icons";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const ACCENT_YELLOW = "#FFEA9E";

export type RulesContentProps = {
  /** The `rules` slice from the active i18n dictionary. */
  rules: Dictionary["rules"];
};

/**
 * Body content of the Thể lệ drawer — three stacked sections (Receivers /
 * Senders / National). Pure presentational; renders whatever dict slice
 * it's handed, so the same component serves both VI and EN.
 */
export function RulesContent({ rules }: RulesContentProps) {
  return (
    <div
      className="flex flex-col gap-10"
      style={{ fontFamily: FONT_MONTSERRAT }}
    >
      {/* ─── Receivers (Hero tiers) ─── */}
      <section
        aria-labelledby="rules-receivers-heading"
        className="flex flex-col gap-4"
      >
        <h3
          id="rules-receivers-heading"
          className="uppercase"
          style={{
            color: ACCENT_YELLOW,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            lineHeight: "20px",
          }}
        >
          {rules.receivers.heading}
        </h3>
        <p
          className="text-white/90"
          style={{ fontSize: "14px", lineHeight: "22px" }}
        >
          {rules.receivers.intro}
        </p>
        <RulesHeroTiers tiers={rules.receivers.tiers} />
      </section>

      {/* ─── Senders (6 secret-box icons) ─── */}
      <section
        aria-labelledby="rules-senders-heading"
        className="flex flex-col gap-4"
      >
        <h3
          id="rules-senders-heading"
          className="uppercase"
          style={{
            color: ACCENT_YELLOW,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            lineHeight: "20px",
          }}
        >
          {rules.senders.heading}
        </h3>
        <p
          className="text-white/90"
          style={{ fontSize: "14px", lineHeight: "22px" }}
        >
          {rules.senders.body}
        </p>
        <RulesSecretIcons labels={rules.senders.iconLabels} />
        <p
          className="text-white"
          style={{ fontSize: "14px", lineHeight: "22px", fontWeight: 700 }}
        >
          {rules.senders.footnote}
        </p>
      </section>

      {/* ─── National Kudos ─── */}
      <section
        aria-labelledby="rules-national-heading"
        className="flex flex-col gap-3"
      >
        <h3
          id="rules-national-heading"
          className="uppercase"
          style={{
            color: ACCENT_YELLOW,
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            lineHeight: "22px",
          }}
        >
          {rules.national.heading}
        </h3>
        <p
          className="text-white/90"
          style={{ fontSize: "14px", lineHeight: "22px" }}
        >
          {rules.national.body}
        </p>
      </section>
    </div>
  );
}
