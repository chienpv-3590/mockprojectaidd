"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { UserProfile } from "@/lib/data/types";
import { UserAvatar } from "./user-avatar";

const FM = "var(--font-montserrat), system-ui, sans-serif";

type SunnerSearchInputProps = {
  placeholder?: string;
  /** Search all Sunners by name / employee code (debounced). */
  onSearch: (q: string) => Promise<UserProfile[]>;
  /** Called when a result is picked — navigate to that Sunner's profile. */
  onSelect: (user: UserProfile) => void;
};

/**
 * SunnerSearchInput — "Tìm kiếm Sunner" pill + results dropdown (node 2940:13450,
 * design A.1 "Tìm kiếm profile Sunner").
 *
 * Behaviour (per clarifications 2026-06-03): typing runs a debounced search over
 * ALL Sunners (not just spotlight nodes); the dropdown lists matches with avatar
 * + name + department; selecting one navigates to /sun-kudos/profile/{id} via the
 * `onSelect` callback. Closes on select / outside click / Escape.
 *
 * Pill style (unchanged): height 72px, radius 68px, border #998C5F,
 * bg rgba(255,234,158,0.10), magnifier icon left, maxLength 100.
 */
export function SunnerSearchInput({
  placeholder = "Tìm kiếm sunner",
  onSearch,
  onSelect,
}: SunnerSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guard against a slow response overwriting results from a newer query.
  const reqIdRef = useRef(0);
  const listboxId = useId();

  // Debounced search whenever the query changes. All state writes happen inside
  // the async timeout callback (never synchronously in the effect body) to avoid
  // cascading renders (react-hooks/set-state-in-effect).
  useEffect(() => {
    const term = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const reqId = ++reqIdRef.current;
    debounceRef.current = setTimeout(async () => {
      if (!term) {
        if (reqIdRef.current === reqId) {
          setResults([]);
          setLoading(false);
        }
        return;
      }
      if (reqIdRef.current === reqId) setLoading(true);
      try {
        const rows = await onSearch(term);
        if (reqIdRef.current === reqId) {
          setResults(rows);
          setOpen(true);
        }
      } catch {
        if (reqIdRef.current === reqId) setResults([]);
      } finally {
        if (reqIdRef.current === reqId) setLoading(false);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, onSearch]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSelect = useCallback(
    (user: UserProfile) => {
      onSelect(user);
      setQuery("");
      setResults([]);
      setOpen(false);
    },
    [onSelect]
  );

  // Double-guard: gating on a non-empty query means that after a selection
  // (handleSelect sets query="") the dropdown stays hidden even if a slow,
  // now-stale onSearch response lands and flips `open`/`results`.
  const showDropdown = open && query.trim().length > 0;

  // TODO(a11y): add ArrowUp/Down + Enter keyboard navigation with
  // aria-activedescendant for full WCAG 2.1 AA combobox support (mouse-only today).

  return (
    <div ref={containerRef} className="relative shrink-0" style={{ width: "clamp(200px, 32vw, 381px)" }}>
      <label
        className="relative flex items-center gap-3 transition focus-within:ring-2 focus-within:ring-[#FFEA9E]"
        style={{
          height: "72px",
          width: "100%",
          borderRadius: "68px",
          border: "1px solid #998C5F",
          background: "rgba(255,234,158,0.10)",
          padding: "24px 16px",
        }}
      >
        <span className="shrink-0 text-white/70" aria-hidden>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="white" strokeWidth="2" strokeOpacity="0.85" />
            <path d="M15.5 15.5L20 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
          </svg>
        </span>

        <input
          type="search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          maxLength={100}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/60"
          style={{
            fontFamily: FM,
            fontWeight: 700,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0.15px",
            color: "white",
          }}
        />
      </label>

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Kết quả tìm kiếm Sunner"
          className="absolute left-0 right-0 z-50 mt-2 flex flex-col overflow-y-auto"
          style={{
            maxHeight: "360px",
            padding: "6px",
            background: "#00070C",
            border: "1px solid #998C5F",
            borderRadius: "16px",
          }}
        >
          {loading && results.length === 0 ? (
            <li style={{ padding: "16px", fontFamily: FM, fontSize: "14px", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              Đang tìm…
            </li>
          ) : results.length === 0 ? (
            <li style={{ padding: "16px", fontFamily: FM, fontSize: "14px", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              Không tìm thấy Sunner
            </li>
          ) : (
            results.map((user) => {
              const sub = user.department_name_vi ?? user.title ?? user.employee_code ?? "";
              return (
                <li key={user.user_id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => handleSelect(user)}
                    className="flex w-full items-center gap-3 rounded-xl text-left transition hover:bg-[rgba(255,234,158,0.08)]"
                    style={{ padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer" }}
                  >
                    <UserAvatar user={user} size={36} />
                    <span className="flex min-w-0 flex-col">
                      <span style={{ fontFamily: FM, fontWeight: 700, fontSize: "14px", lineHeight: "20px", color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {user.full_name_vi}
                      </span>
                      {sub && (
                        <span style={{ fontFamily: FM, fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {sub}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
