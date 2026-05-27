"use client";

import type { Toast } from "./use-toast";

const FM = "var(--font-montserrat), system-ui, sans-serif";

type ToastContainerProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
};

/**
 * Fixed top-right toast stack. Renders at most 4 visible toasts.
 * No third-party library — matches project constraint.
 */
export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2"
      style={{ maxWidth: "360px" }}
    >
      {toasts.slice(-4).map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg"
          style={{
            background: t.variant === "error" ? "#3B0A0A" : "#0A2B1A",
            border: `1px solid ${t.variant === "error" ? "#8B1A1A" : "#1A6640"}`,
            color: t.variant === "error" ? "#FCA5A5" : "#86EFAC",
          }}
        >
          {/* Icon */}
          <span className="mt-0.5 shrink-0" aria-hidden>
            {t.variant === "error" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>

          <span
            className="flex-1 text-sm leading-5"
            style={{ fontFamily: FM, fontWeight: 500 }}
          >
            {t.message}
          </span>

          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => onDismiss(t.id)}
            className="shrink-0 opacity-60 transition hover:opacity-100"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
