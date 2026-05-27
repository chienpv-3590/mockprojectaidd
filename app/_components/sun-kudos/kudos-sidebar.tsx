import Image from "next/image";
import type { SidebarStats, SecretBoxRecipient } from "./types";
import { OpenGiftIcon } from "./kudos-gift-icon";

const FM = "var(--font-montserrat), system-ui, sans-serif";
/** Details-Border / Details-Container-2 tokens from the Figma design system. */
const BOX_BORDER = "1px solid #998C5F";
const BOX_BG = "#00070C";

/** Label (left) — white, Montserrat 700 22/28 (node I2940:13491;256:6735). */
const LABEL_STYLE = {
  fontFamily: FM,
  fontWeight: 700,
  fontSize: "22px",
  lineHeight: "28px",
  color: "#FFFFFF",
} as const;

/** Value (right) — gold, Montserrat 700 32/40 (node "Highlight Số"). */
const VALUE_STYLE = {
  fontFamily: FM,
  fontWeight: 700,
  fontSize: "32px",
  lineHeight: "40px",
  color: "#FFEA9E",
} as const;

type KudosSidebarProps = {
  stats: SidebarStats;
  recipients: SecretBoxRecipient[];
  onOpenSecretBox?: () => void;
};

/** Last-two-words initials fallback when a recipient has no avatar. */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** One stat line — "label:" on the left, big gold number on the right. */
function StatRow({
  label,
  value,
  withHeart,
}: {
  label: string;
  value: number;
  withHeart?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-2"
      style={{ minHeight: "40px" }}
    >
      <span style={LABEL_STYLE}>{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        {withHeart && (
          <span aria-hidden style={{ fontSize: "20px", lineHeight: 1 }}>
            ❤️
          </span>
        )}
        <span style={VALUE_STYLE}>{value.toLocaleString("vi-VN")}</span>
      </span>
    </div>
  );
}

/** One recipient — 64px round avatar · gold name · white reward label. */
function RecipientRow({ r }: { r: SecretBoxRecipient }) {
  return (
    <div className="flex items-center gap-2" style={{ minHeight: "64px" }}>
      {/* Avatar ring goes white → gold on hover (design "Hover Avatar info
          user": A_Avatar gốc #FFF → B_Avatar khi hover #FFEA9E). */}
      <div
        className="relative shrink-0 cursor-pointer overflow-hidden rounded-full border-[1.869px] border-white transition-colors duration-150 hover:border-[#FFEA9E]"
        style={{
          width: 64,
          height: 64,
          background: "#2E3940",
        }}
      >
        {r.avatarUrl ? (
          <Image
            src={r.avatarUrl}
            alt={r.name}
            fill
            sizes="64px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center text-white"
            style={{ fontFamily: FM, fontWeight: 700, fontSize: "16px" }}
          >
            {initials(r.name)}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: "2px" }}>
        <span
          className="truncate"
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "22px",
            lineHeight: "28px",
            color: "#FFEA9E",
          }}
        >
          {r.name}
        </span>
        <span
          className="truncate"
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: "#FFFFFF",
          }}
        >
          {r.rewardLabel}
        </span>
      </div>
    </div>
  );
}

/**
 * KudosSidebar — sticky right column "D_Thống menu phải" (node 2940:13488).
 * Two bordered boxes: stat rows + "Mở Secret Box" CTA, then a recipient list.
 */
export function KudosSidebar({
  stats,
  recipients,
  onOpenSecretBox,
}: KudosSidebarProps) {
  return (
    <aside
      className="flex w-full flex-col gap-6 lg:sticky lg:top-28 lg:w-[422px] lg:shrink-0 lg:self-start"
      aria-label="Thống kê và phần thưởng"
    >
      {/* ── Box 1 · Thống kê tổng quát (D.1) ─────────────────────────── */}
      <div
        className="flex flex-col gap-4"
        style={{
          border: BOX_BORDER,
          background: BOX_BG,
          borderRadius: "17px",
          padding: "24px",
        }}
      >
        <StatRow label="Số Kudos bạn nhận được:" value={stats.kudosReceived} />
        <StatRow label="Số Kudos bạn đã gửi:" value={stats.kudosSent} />
        <StatRow label="Số tim bạn nhận được:" value={stats.hearts} withHeart />

        {/* divider D.1.5 */}
        <div style={{ height: "1px", background: "#2E3940" }} />

        <StatRow
          label="Số Secret Box bạn đã mở:"
          value={stats.secretBoxOpened}
        />
        <StatRow
          label="Số Secret Box chưa mở:"
          value={stats.secretBoxPending}
        />

        {/* Mở Secret Box CTA (D.1.8) — text + Open Gift icon, inside the stats box */}
        <button
          type="button"
          onClick={onOpenSecretBox}
          className="flex w-full items-center justify-center gap-2 transition hover:brightness-105 active:scale-[0.99]"
          style={{
            height: "60px",
            borderRadius: "8px",
            background: "#FFEA9E",
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "22px",
            lineHeight: "28px",
            color: "#00101A",
          }}
        >
          Mở Secret Box
          <OpenGiftIcon />
        </button>
      </div>

      {/* ── Box 2 · 10 Sunner nhận quà mới nhất (D.3) ────────────────── */}
      <div
        className="flex flex-col gap-4"
        style={{
          border: BOX_BORDER,
          background: BOX_BG,
          borderRadius: "17px",
          padding: "24px 16px 24px 24px",
        }}
      >
        <h3
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "22px",
            lineHeight: "28px",
            color: "#FFEA9E",
            textAlign: "center",
          }}
        >
          10 SUNNER NHẬN QUÀ MỚI NHẤT
        </h3>

        {/* Fixed-height scroll area — ~5 of 10 visible, scrolls to reveal the
            rest (design D.3: title says 10 but the box only shows ~5). */}
        <div
          className="kudos-scroll flex flex-col gap-4 overflow-y-auto pr-1"
          style={{ maxHeight: "384px" }}
        >
          {recipients.slice(0, 10).map((r) => (
            <RecipientRow key={r.id} r={r} />
          ))}
        </div>
      </div>
    </aside>
  );
}
