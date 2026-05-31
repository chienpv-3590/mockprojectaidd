const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

type CommunitySlice = {
  title: string;
  intro: string;
  warning: string;
  /** Exactly 10 items per MoMorph spec — guarded by unit test. */
  criteria: readonly string[];
};

type SecurityLabelled = { label: string; text: string };

type SecuritySlice = {
  title: string;
  lead: string;
  infoSecurity: SecurityLabelled;
  sharingScope: SecurityLabelled;
  support: string;
};

export type StandardsContentProps = {
  community: CommunitySlice;
  security: SecuritySlice;
};

/**
 * Static editorial content for the General Standards page.
 *
 * Content is supplied as plain dict slices (server-passed) so the component
 * stays presentational, server-renderable, and locale-agnostic — it just
 * renders the props it gets. The 10-criteria count is enforced by a unit test
 * (and by the dict shape) rather than by the component itself.
 *
 * Source of truth for text: `lib/i18n/dictionaries/{vi,en}.json` → `standards`.
 * Verbatim VI from MoMorph iOS spec `xms7csmDhD` (frame "[iOS] Sun*Kudos_Tiêu
 * chuẩn cộng đồng", design items B + C). EN is project-authored.
 */
export function StandardsContent({ community, security }: StandardsContentProps) {
  return (
    <div
      className="bg-[#00101A] px-6 py-12 text-white sm:px-10 lg:px-36 lg:py-20"
    >
      <div
        className="mx-auto flex w-full max-w-[1152px] flex-col gap-12"
        style={{ fontFamily: FONT_MONTSERRAT }}
      >
        {/* ─── Community Standards ─── */}
        <section
          aria-labelledby="standards-community-heading"
          className="flex flex-col gap-5"
        >
          <h2
            id="standards-community-heading"
            style={{
              fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 36px)",
              lineHeight: "1.25",
              color: "#FFEA9E",
            }}
          >
            {community.title}
          </h2>
          <p
            className="text-white"
            style={{ fontSize: "16px", lineHeight: "26px", fontWeight: 600 }}
          >
            {community.intro}
          </p>
          <p
            className="text-white/85"
            style={{ fontSize: "15px", lineHeight: "24px" }}
          >
            {community.warning}
          </p>
          <ol
            className="mt-2 list-decimal space-y-2 pl-6 text-white/90 marker:text-white/70"
            style={{ fontSize: "15px", lineHeight: "24px" }}
          >
            {community.criteria.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        </section>

        <hr
          aria-hidden
          className="h-px border-0"
          style={{ backgroundColor: "#2E3940" }}
        />

        {/* ─── Security Standards ─── */}
        <section
          aria-labelledby="standards-security-heading"
          className="flex flex-col gap-5"
        >
          <h2
            id="standards-security-heading"
            style={{
              fontWeight: 700,
              fontSize: "clamp(24px, 3vw, 36px)",
              lineHeight: "1.25",
              color: "#FFEA9E",
            }}
          >
            {security.title}
          </h2>
          <p
            className="text-white"
            style={{ fontSize: "16px", lineHeight: "26px", fontWeight: 700 }}
          >
            {security.lead}
          </p>
          <ul
            className="list-disc space-y-2 pl-6 text-white/90 marker:text-white/70"
            style={{ fontSize: "15px", lineHeight: "24px" }}
          >
            <li>
              <span className="font-semibold text-white">
                {security.infoSecurity.label}:
              </span>{" "}
              {security.infoSecurity.text}
            </li>
            <li>
              <span className="font-semibold text-white">
                {security.sharingScope.label}:
              </span>{" "}
              {security.sharingScope.text}
            </li>
          </ul>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "26px",
              fontWeight: 700,
              color: "#FFEA9E",
            }}
          >
            {security.support}
          </p>
        </section>
      </div>
    </div>
  );
}
