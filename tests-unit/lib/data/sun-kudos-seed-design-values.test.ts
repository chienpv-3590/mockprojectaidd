import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Regression guard: the curated department + hashtag lists in supabase/seed.sql
 * MUST stay faithful to the MoMorph design, not invented values.
 *
 * Sources (authoritative spec text, not the placeholder English chips drawn on
 * the card mockups):
 *  - Departments → "Dropdown Phòng ban" (screen WXK5AYB_rG)
 *  - Hashtags    → "Dropdown Hashtag filter" (JWpsISMAaM) +
 *                  "Dropdown list hashtag" (p9zO-c4a4x)
 */
const seed = readFileSync(
  resolve(__dirname, "../../../supabase/seed.sql"),
  "utf8"
);

// Visible department codes from the design dropdown.
const DESIGN_DEPARTMENTS = ["CEVC1", "CEVC2", "CEVC3", "CEVC4", "OPD", "Infra"];

// Codes that earlier (incorrect) seeds used — must no longer be present.
const OBSOLETE_DEPARTMENTS = ["CEVC10", "CEVC19", "CEDN", "CESG", "CEQA", "CORP"];

// The authoritative 13-item Sun* value hashtag list (label_vi).
const DESIGN_HASHTAGS = [
  "Toàn diện",
  "Giỏi chuyên môn",
  "Hiệu suất cao",
  "Truyền cảm hứng",
  "Cống hiến",
  "Aim High",
  "Be Agile",
  "Wasshoi",
  "Hướng mục tiêu",
  "Hướng khách hàng",
  "Chuẩn quy trình",
  "Giải pháp sáng tạo",
  "Quản lý xuất sắc",
];

// Placeholder English chips that must not be seeded as real hashtags.
const OBSOLETE_HASHTAGS = ["Dedicated", "Inspiring", "Creator", "Team Player"];

describe("sun-kudos seed — departments match MoMorph design", () => {
  it.each(DESIGN_DEPARTMENTS)("seeds department %s (code shown verbatim)", (code) => {
    // name_vi mirrors the code; alignment uses variable whitespace.
    expect(seed).toMatch(new RegExp(`\\('${code}',\\s+'${code}',`));
  });

  it.each(OBSOLETE_DEPARTMENTS)("does not seed obsolete department %s", (code) => {
    expect(seed).not.toContain(`('${code}',`);
  });
});

describe("sun-kudos seed — small hashtags match MoMorph design", () => {
  it("seeds exactly the 13 authoritative Vietnamese labels", () => {
    for (const label of DESIGN_HASHTAGS) {
      expect(seed).toContain(`'${label}',`);
    }
  });

  it("keeps the feature hashtag (danh hiệu sample) IDOL GIỚI TRẺ", () => {
    expect(seed).toMatch(/'IDOL GIỚI TRẺ',\s+'feature'/);
  });

  it.each(OBSOLETE_HASHTAGS)("does not seed placeholder hashtag %s", (label) => {
    expect(seed).not.toMatch(new RegExp(`'${label}',\\s+'small'`));
  });
});
