/**
 * KudosSectionHeader — reusable section header pattern shared across the
 * Live Board page sections (Highlight, Spotlight, All Kudos).
 *
 * Design pattern (nodes 2940:13453 / 2940:13476 / 2940:14221):
 *   - "Sun* Annual Awards 2025" subtitle (24px white 700)
 *   - 1px #2E3940 divider
 *   - Section title (57px yellow 700 Montserrat) + optional right slot
 */

const FM = "var(--font-montserrat), system-ui, sans-serif";

type KudosSectionHeaderProps = {
  title: string;
  id?: string;
  rightSlot?: React.ReactNode;
};

export function KudosSectionHeader({
  title,
  id,
  rightSlot,
}: KudosSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <p
        style={{
          fontFamily: FM,
          fontWeight: 700,
          fontSize: "clamp(16px, 1.7vw, 24px)",
          lineHeight: "32px",
          color: "rgba(255,255,255,1)",
        }}
      >
        Sun* Annual Awards 2025
      </p>
      <div className="h-px w-full" style={{ background: "#2E3940" }} aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2
          id={id}
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "clamp(28px, 4vw, 57px)",
            lineHeight: "64px",
            letterSpacing: "-0.25px",
            color: "#FFEA9E",
          }}
        >
          {title}
        </h2>
        {rightSlot}
      </div>
    </div>
  );
}
