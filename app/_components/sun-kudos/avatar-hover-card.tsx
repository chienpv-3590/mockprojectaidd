"use client";

/**
 * AvatarHoverCard — popup shown on desktop hover (`Infor - HoverAvatar` design).
 *
 * Layout (top → bottom):
 *   1. Full name (white, 18px/700)
 *   2. "Tên đơn vị: {department_name_vi}"
 *   3. {title}            ← job title (smaller, dimmed)
 *   4. Hero rank badge    ← TitleBadge from Figma artwork (only when rank ≠ null)
 *   5. "Số Kudos nhận được: N"
 *   6. "Số Kudos đã gửi: N"
 *   7. "Gửi KUDO" CTA — opens compose dialog pre-filled with this recipient.
 *
 * Data is fetched lazily via getAvatarHoverData() the first time `open` flips
 * to true; the result is cached for the component's lifetime. The trigger
 * (avatar-hover-trigger.tsx) owns positioning and open-state.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAvatarHoverData, type AvatarHoverData } from "@/app/_actions/sun-kudos";
import { TitleBadge } from "./kudos-title-badge";
import { useOptionalComposeKudos } from "./compose-kudos-context";

const FM = "var(--font-montserrat), system-ui, sans-serif";

type AvatarHoverCardProps = {
  userId: string;
  /** Hide CTA only when the viewer has no way to send kudos (kept for future
   *  policy switches — current product spec keeps "Gửi KUDO" visible even on
   *  the viewer's own avatar). */
  hideSendButton?: boolean;
  /** Called after the user clicks "Gửi KUDO" — lets the trigger close itself. */
  onAction?: () => void;
};

export function AvatarHoverCard({ userId, hideSendButton, onAction }: AvatarHoverCardProps) {
  const router = useRouter();
  const openCompose = useOptionalComposeKudos();

  const [data, setData] = useState<AvatarHoverData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getAvatarHoverData(userId)
      .then((result) => {
        if (cancelled) return;
        if (!result) { setStatus("error"); return; }
        setData(result);
        setStatus("ready");
      })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [userId]);

  const handleSend = useCallback(() => {
    if (!data) return;
    onAction?.();
    if (openCompose) {
      openCompose(data.profile);
      return;
    }
    // Fallback: deep-link to the live board page with ?compose=<uid>.
    router.push(`/sun-kudos?compose=${data.profile.user_id}`);
  }, [data, onAction, openCompose, router]);

  return (
    <div
      role="dialog"
      aria-label="Thông tin người dùng"
      style={{
        background: "#00101A",
        border: "1px solid rgba(255,234,158,0.25)",
        borderRadius: 16,
        padding: "20px 22px",
        width: 320,
        boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
        fontFamily: FM,
        color: "#FFFFFF",
      }}
    >
      {status === "loading" && (
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Đang tải…</p>
      )}
      {status === "error" && (
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
          Không thể tải thông tin người dùng.
        </p>
      )}
      {status === "ready" && data && (
        <HoverCardBody
          data={data}
          hideSendButton={hideSendButton}
          onSend={handleSend}
        />
      )}
    </div>
  );
}

function HoverCardBody({
  data,
  hideSendButton,
  onSend,
}: {
  data: AvatarHoverData;
  hideSendButton?: boolean;
  onSend: () => void;
}) {
  const { profile, received, sent, hero_rank } = data;

  return (
    <div className="flex flex-col gap-3">
      <h3
        style={{
          fontFamily: FM,
          fontWeight: 800,
          fontSize: 20,
          lineHeight: "28px",
          margin: 0,
          color: "#FFFFFF",
        }}
      >
        {profile.full_name_vi}
      </h3>

      {(profile.department_name_vi || profile.title) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {profile.department_name_vi && (
            <p
              style={{
                fontFamily: FM,
                fontWeight: 700,
                fontSize: 13,
                lineHeight: "20px",
                margin: 0,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Tên đơn vị: {profile.department_name_vi}
            </p>
          )}
          {profile.title && (
            <p
              style={{
                fontFamily: FM,
                fontWeight: 600,
                fontSize: 12,
                lineHeight: "18px",
                margin: 0,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {profile.title}
            </p>
          )}
        </div>
      )}

      {hero_rank && (
        <div>
          <TitleBadge title={hero_rank} />
        </div>
      )}

      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.12)",
          margin: "4px 0",
        }}
        aria-hidden
      />

      <StatRow label="Số Kudos nhận được:" value={received} />
      <StatRow label="Số Kudos đã gửi:" value={sent} />

      {!hideSendButton && (
        <button
          type="button"
          onClick={onSend}
          aria-label={`Gửi KUDO cho ${profile.full_name_vi}`}
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "#FFEA9E",
            color: "#00101A",
            border: "none",
            borderRadius: 12,
            padding: "10px 16px",
            fontFamily: FM,
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: "0.5px",
            cursor: "pointer",
            transition: "filter .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.95)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        >
          <PencilIcon />
          Gửi KUDO
        </button>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <p
      style={{
        fontFamily: FM,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: "20px",
        margin: 0,
        color: "rgba(255,255,255,0.85)",
      }}
    >
      {label}{" "}
      <span style={{ color: "#FFFFFF", fontWeight: 800 }}>{value}</span>
    </p>
  );
}

function PencilIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M11.333 2.667a1.886 1.886 0 0 1 2.667 2.667L5.333 14H2.667v-2.667l8.666-8.666Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
