import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAwards } from "@/lib/data/awards";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

const AWARD_ROW = {
  id: "award-1",
  code: "GOLD",
  title_vi: "Giải vàng",
  description_vi: "Mô tả giải vàng",
  thumbnail_path: "awards/gold.png",
  display_order: 1,
  long_description_vi: "Mô tả dài",
  quantity_text: "1",
  unit_text: "giải",
  value_text: "10.000.000đ",
  value_breakdown: [{ label: "Tiền mặt", amount_text: "10tr" }],
};

describe("getAwards()", () => {
  it("returns rows ordered by display_order ascending", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    const row2 = { ...AWARD_ROW, id: "award-2", code: "SILVER", display_order: 2 };
    queueResponse("awards", { data: [AWARD_ROW, row2], error: null });

    const result = await getAwards(supabase as unknown as SupabaseClient);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(AWARD_ROW);
    expect(result[1]).toEqual(row2);

    const call = fromCalls.find((c) => c.table === "awards");
    expect(call).toBeDefined();

    const selectOp = call!.ops.find((o) => o.method === "select");
    expect(selectOp).toBeDefined();
    expect(typeof selectOp!.args[0]).toBe("string");
    expect((selectOp!.args[0] as string)).toContain("id");
    expect((selectOp!.args[0] as string)).toContain("display_order");

    const orderOp = call!.ops.find((o) => o.method === "order");
    expect(orderOp).toBeDefined();
    expect(orderOp!.args[0]).toBe("display_order");
    expect(orderOp!.args[1]).toEqual({ ascending: true });
  });

  it("returns [] when supabase returns null data", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("awards", { data: null, error: null });

    const result = await getAwards(supabase as unknown as SupabaseClient);

    expect(result).toEqual([]);
  });

  it("returns [] when table missing (PGRST205)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("awards", { data: null, error: { code: "PGRST205" } });

    const result = await getAwards(supabase as unknown as SupabaseClient);

    expect(result).toEqual([]);
  });

  it("throws on a generic (non-missing-table) error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("awards", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      getAwards(supabase as unknown as SupabaseClient)
    ).rejects.toEqual({ code: "42501", message: "permission denied" });
  });

  it("preserves all Award fields including nullable detail-page fields", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    const minimalRow = {
      id: "award-3",
      code: "BRONZE",
      title_vi: "Giải đồng",
      description_vi: "Mô tả",
      thumbnail_path: null,
      display_order: 3,
      long_description_vi: null,
      quantity_text: null,
      unit_text: null,
      value_text: null,
      value_breakdown: null,
    };
    queueResponse("awards", { data: [minimalRow], error: null });

    const result = await getAwards(supabase as unknown as SupabaseClient);

    expect(result[0]).toEqual(minimalRow);
    expect(result[0].thumbnail_path).toBeNull();
    expect(result[0].value_breakdown).toBeNull();
  });
});
