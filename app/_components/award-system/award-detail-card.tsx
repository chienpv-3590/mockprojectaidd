import Image from "next/image";
import type { Award, AwardValueBreakdown } from "@/lib/data/types";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

/**
 * Maps award.code to its image filename.
 * The `signature-creator` code maps to `signature-2025-creator.png` per spec.
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

/** Trophy/quantity icon */
function TrophyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden={true}
      className="mt-0.5 shrink-0"
    >
      <path
        d="M10 13.5V16M7 18h6M5 3H3a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h.17M15 3h2a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-.17M5 3h10v6a5 5 0 0 1-10 0V3Z"
        stroke="#FFEA9E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Value/currency icon */
function ValueIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden={true}
      className="mt-0.5 shrink-0"
    >
      <circle cx="10" cy="10" r="8" stroke="#FFEA9E" strokeWidth="1.5" />
      <path
        d="M10 6v8M7.5 8.5a2.5 2.5 0 0 1 5 0c0 1.38-1.12 2.5-2.5 2.5s-2.5 1.12-2.5 2.5a2.5 2.5 0 0 0 5 0"
        stroke="#FFEA9E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type AwardDetailCardProps = {
  award: Award;
  /** If true, image is on the LEFT; if false, image is on the RIGHT. */
  imageLeft: boolean;
};

/**
 * Full-detail award card for the Award System page.
 * Layout alternates image-LEFT / image-RIGHT per design spec:
 *   D.1, D.3, D.5 → imageLeft=true
 *   D.2, D.4, D.6 → imageLeft=false
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
      {/* Award image */}
      <div className="shrink-0 lg:w-[336px]">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl lg:h-[336px] lg:w-[336px]">
          <Image
            src={imageSrc}
            alt={award.title_vi}
            fill
            sizes="(max-width: 1024px) 100vw, 336px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Award content */}
      <div className="flex flex-1 flex-col gap-5">
        {/* Title */}
        <h2
          style={{
            fontFamily: FONT_MONTSERRAT,
            fontWeight: 700,
            fontSize: "clamp(24px, 3vw, 36px)",
            lineHeight: "1.2",
            color: "#FFEA9E",
          }}
        >
          {award.title_vi}
        </h2>

        {/* Quantity row */}
        {(award.quantity_text || award.unit_text) && (
          <div className="flex items-start gap-3">
            <TrophyIcon />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span
                style={{
                  fontFamily: FONT_MONTSERRAT,
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Số lượng giải thưởng:
              </span>
              {award.quantity_text && (
                <span
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    fontWeight: 700,
                    fontSize: "20px",
                    color: "#FFEA9E",
                    lineHeight: "1.2",
                  }}
                >
                  {award.quantity_text}
                </span>
              )}
              {award.unit_text && (
                <span
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    fontWeight: 400,
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {award.unit_text}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Value row(s) */}
        {award.value_breakdown && award.value_breakdown.length > 0 ? (
          <div className="flex flex-col gap-3">
            {award.value_breakdown.map((entry: AwardValueBreakdown, i: number) => (
              <div key={i} className="flex items-start gap-3">
                <ValueIcon />
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span
                    style={{
                      fontFamily: FONT_MONTSERRAT,
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    Giá trị giải thưởng:
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_MONTSERRAT,
                      fontWeight: 700,
                      fontSize: "20px",
                      color: "#FFEA9E",
                      lineHeight: "1.2",
                    }}
                  >
                    {entry.amount_text}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_MONTSERRAT,
                      fontWeight: 400,
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    {entry.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : award.value_text ? (
          <div className="flex items-start gap-3">
            <ValueIcon />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span
                style={{
                  fontFamily: FONT_MONTSERRAT,
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Giá trị giải thưởng:
              </span>
              <span
                style={{
                  fontFamily: FONT_MONTSERRAT,
                  fontWeight: 700,
                  fontSize: "20px",
                  color: "#FFEA9E",
                  lineHeight: "1.2",
                }}
              >
                {award.value_text}
              </span>
            </div>
          </div>
        ) : null}

        {/* Long description */}
        {award.long_description_vi && (
          <p
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: "26px",
              color: "rgba(255,255,255,0.85)",
              whiteSpace: "pre-line",
            }}
          >
            {award.long_description_vi}
          </p>
        )}

        {/* Fallback to short description if long_description_vi is absent */}
        {!award.long_description_vi && award.description_vi && (
          <p
            style={{
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: "26px",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {award.description_vi}
          </p>
        )}
      </div>
    </article>
  );
}
