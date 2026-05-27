import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { listFeatureHashtags, listSmallHashtags } from "@/lib/data/hashtags";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

describe("listFeatureHashtags()", () => {
  it("filters by kind='feature' and orders by display_order", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("hashtags", {
      data: [{ id: "h1", code: "IDOL", label_vi: "IDOL GIỚI TRẺ", kind: "feature", display_order: 1 }],
      error: null,
    });

    const result = await listFeatureHashtags(supabase as unknown as SupabaseClient);
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe("feature");

    const call = fromCalls.find((c) => c.table === "hashtags");
    const eqOp = call!.ops.find((o) => o.method === "eq");
    expect(eqOp).toBeDefined();
    expect(eqOp!.args).toEqual(["kind", "feature"]);
  });

  it("falls back to [] when table missing", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("hashtags", { data: null, error: { code: "PGRST205" } });
    const result = await listFeatureHashtags(supabase as unknown as SupabaseClient);
    expect(result).toEqual([]);
  });

  it("throws on unrelated error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("hashtags", { data: null, error: { code: "42P01" } });
    await expect(
      listFeatureHashtags(supabase as unknown as SupabaseClient)
    ).rejects.toBeDefined();
  });
});

describe("listSmallHashtags()", () => {
  it("filters by kind='small'", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("hashtags", { data: [], error: null });

    await listSmallHashtags(supabase as unknown as SupabaseClient);

    const call = fromCalls.find((c) => c.table === "hashtags");
    const eqOp = call!.ops.find((o) => o.method === "eq");
    expect(eqOp!.args).toEqual(["kind", "small"]);
  });

  it("returns [] when data is null", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("hashtags", { data: null, error: null });
    const result = await listSmallHashtags(supabase as unknown as SupabaseClient);
    expect(result).toEqual([]);
  });
});
