import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listDepartments } from "@/lib/data/departments";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

describe("listDepartments()", () => {
  it("returns rows in display_order ascending", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("departments", {
      data: [
        { code: "ENG", name_vi: "Kỹ thuật", display_order: 1 },
        { code: "DSG", name_vi: "Thiết kế", display_order: 2 },
      ],
      error: null,
    });

    const result = await listDepartments(supabase as unknown as SupabaseClient);

    expect(result).toEqual([
      { code: "ENG", name_vi: "Kỹ thuật", display_order: 1 },
      { code: "DSG", name_vi: "Thiết kế", display_order: 2 },
    ]);
    const call = fromCalls.find((c) => c.table === "departments");
    expect(call).toBeDefined();
    expect(call!.ops.some((o) => o.method === "select")).toBe(true);
    const orderOp = call!.ops.find((o) => o.method === "order");
    expect(orderOp).toBeDefined();
    expect(orderOp!.args[0]).toBe("display_order");
    expect(orderOp!.args[1]).toEqual({ ascending: true });
  });

  it("returns [] when supabase returns null data", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("departments", { data: null, error: null });
    const result = await listDepartments(supabase as unknown as SupabaseClient);
    expect(result).toEqual([]);
  });

  it("returns [] when table missing (PGRST205)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("departments", { data: null, error: { code: "PGRST205" } });
    const result = await listDepartments(supabase as unknown as SupabaseClient);
    expect(result).toEqual([]);
  });

  it("throws on non-missing-table errors", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("departments", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });
    await expect(
      listDepartments(supabase as unknown as SupabaseClient)
    ).rejects.toEqual({ code: "42501", message: "permission denied" });
  });
});
