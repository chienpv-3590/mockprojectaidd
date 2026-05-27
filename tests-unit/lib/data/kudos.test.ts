import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getReceivedCount } from "@/lib/data/kudos";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

describe("getReceivedCount()", () => {
  it("returns the count from a head-only query", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: null, count: 42 });

    const result = await getReceivedCount(
      supabase as unknown as SupabaseClient,
      "user-1"
    );

    expect(result).toBe(42);

    const call = fromCalls.find((c) => c.table === "kudos");
    expect(call).toBeDefined();

    // select with count:exact + head:true
    const selectOp = call!.ops.find((o) => o.method === "select");
    expect(selectOp).toBeDefined();
    expect(selectOp!.args[1]).toEqual({ count: "exact", head: true });

    // filtered by to_user
    const eqOp = call!.ops.find((o) => o.method === "eq");
    expect(eqOp).toBeDefined();
    expect(eqOp!.args[0]).toBe("to_user");
    expect(eqOp!.args[1]).toBe("user-1");
  });

  it("returns 0 when count is null", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: null, count: null });

    const result = await getReceivedCount(
      supabase as unknown as SupabaseClient,
      "user-99"
    );

    expect(result).toBe(0);
  });

  it("returns 0 when count is 0", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: null, count: 0 });

    const result = await getReceivedCount(
      supabase as unknown as SupabaseClient,
      "user-new"
    );

    expect(result).toBe(0);
  });

  it("returns 0 when table missing (PGRST205)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: { code: "PGRST205" } });

    const result = await getReceivedCount(
      supabase as unknown as SupabaseClient,
      "user-1"
    );

    expect(result).toBe(0);
  });

  it("throws on a generic (non-missing-table) error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      getReceivedCount(supabase as unknown as SupabaseClient, "user-1")
    ).rejects.toEqual({ code: "42501", message: "permission denied" });
  });
});
