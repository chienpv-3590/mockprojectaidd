import Image from "next/image";
import type { Award, AwardValueBreakdown } from "@/lib/data/types";
import { TargetIcon, DiamondIcon, LicenseIcon } from "./award-icons";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const YELLOW = "#FFEA9E";
const RULE_COLOR = "#2E3940";

/**
 * Maps award.code to its image filename. `signature-creator` maps to
 * `signature-2025-creator.png` per spec.
 */
const CODE_TO_IMAGE: Record<string, string> = {
  "top-talent": "top-talent.png",
  "top-project": "top-project.png",
  "top-project-leader": "top-project-leader.png",
  "best-manager": "best-manager.png",
  "signature-creator": "signature-2025-creator.png",
  mvp: "mvp.png",
};

function getAwardImage(code: string, thumbnail_path: string | null): string {
  if (thumbnail_path) return thumbnail_path;
  const filename = CODE_TO_IMAGE[code];
  return filename ? `/home/awards/${filename}` : "/home/awards/award-bg.png";
}

const LABEL_YELLOW_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "20px",
  lineHeight: "28px",
  color: YELLOW,
};

const VALUE_NUMBER_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "32px",
  lineHeight: "40px",
  color: "#FFFFFF",
};

const UNIT_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 700 as const,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "0.1px",
  color: "rgba(255,255,255,0.9)",
};

type AwardDetailCardProps = {
  award: Award;
  /** If true, image is on the LEFT; if false, image is on the RIGHT. */
  imageLeft: boolean;
};

/**
 * Full-detail award card matching MoMorph design (mms_D.1_Top talent etc.).
 * Composition per child node ids `I313:8467;214:25xx`:
 *   - Title row (Frame 442): Target icon + title (24px yellow)
 *   - Description (justified, 16px white)
 *   - Quantity row (Frame 443): Diamond icon + "Số lượng giải thưởng:" (yellow)
 *     + N (32px white) + unit (14px white)
 *   - HR rule (#2E3940, 1px) — separates quantity from value
 *   - Value row(s) (Frame 444 → Frame 497): License icon + "Giá trị giải
 *     thưởng:" (yellow), then large amount + sub-label
 *
 * Card root carries id={award.code} for menu anchor targeting.
 */
export function AwardDetailCard({ award, imageLeft }: AwardDetailCardProps) {
  const imageSrc = getAwardImage(award.code, award.thumbnail_path);

  return (
    <article
      id={award.code}
      className={`flex scroll-mt-32 flex-col gap-8 lg:flex-row lg:items-start lg:gap-14 ${
        imageLeft ? "" : "lg:flex-row-reverse"
      }`}
    >
      {/* Circular medallion — award-bg.png + per-award wordmark layered. */}
      <div className="shrink-0 lg:w-[336px]">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl lg:h-[336px] lg:w-[336px]">
          <Image
            src="/home/awards/award-bg.png"
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 336px"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <Image
              src={imageSrc}
              alt={award.title_vi}
              width={280}
              height={80}
              className="h-auto max-h-[55%] w-auto max-w-[78%] object-contain"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Title row — Target icon + heading */}
        <div className="flex items-center gap-4">
          <TargetIcon />
          <h2
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 700,
              fontSize: "clamp(20px, 2vw, 24px)",
              lineHeight: "32px",
              color: YELLOW,
            }}
          >
            {award.title_vi}
          </h2>
        </div>

        {/* Description */}
        {award.long_description_vi && (
          <p
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: "24px",
              color: "rgba(255,255,255,0.85)",
              textAlign: "justify",
              whiteSpace: "pre-line",
            }}
          >
            {award.long_description_vi}
          </p>
        )}
        {!award.long_description_vi && award.description_vi && (
          <p
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: "24px",
              color: "rgba(255,255,255,0.85)",
              textAlign: "justify",
            }}
          >
            {award.description_vi}
          </p>
        )}

        {/* Quantity row — Diamond icon + yellow label + big white number + unit */}
        {(award.quantity_text || award.unit_text) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <DiamondIcon />
            <span style={LABEL_YELLOW_STYLE}>Số lượng giải thưởng:</span>
            {award.quantity_text && (
              <span style={VALUE_NUMBER_STYLE}>{award.quantity_text}</span>
            )}
            {award.unit_text && (
              <span style={UNIT_STYLE}>{award.unit_text}</span>
            )}
          </div>
        )}

        {/* In-card HR (design content/214:2539, 1px #2E3940) */}
        <hr
          aria-hidden
          className="h-px w-full border-0"
          style={{ backgroundColor: RULE_COLOR }}
        />

        {/* Value block(s) — one block per breakdown entry; "Hoặc" divider
            between entries (per Signature 2025 design). Each block:
              [License] Giá trị giải thưởng:
              <big amount>
              <sub-label, e.g. "cho mỗi giải thưởng">
        */}
        {award.value_breakdown && award.value_breakdown.length > 0
          ? award.value_breakdown.map((entry: AwardValueBreakdown, i: number) => (
              <div key={i} className="flex flex-col gap-3">
                {i > 0 && (
                  <div
                    aria-hidden
                    className="flex items-center gap-3"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    <span
                      style={{
                        fontFamily: FONT_MONTSERRAT,
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      Hoặc
                    </span>
                    <div className="h-px flex-1" style={{ backgroundColor: RULE_COLOR }} />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <LicenseIcon />
                  <span style={LABEL_YELLOW_STYLE}>Giá trị giải thưởng:</span>
                </div>
                <div style={VALUE_NUMBER_STYLE}>{entry.amount_text}</div>
                {entry.label && <div style={UNIT_STYLE}>{entry.label}</div>}
              </div>
            ))
          : award.value_text && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <LicenseIcon />
                  <span style={LABEL_YELLOW_STYLE}>Giá trị giải thưởng:</span>
                </div>
                <div style={VALUE_NUMBER_STYLE}>{award.value_text}</div>
              </div>
            )}
      </div>
    </article>
  );
}
