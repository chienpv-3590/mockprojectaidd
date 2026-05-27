import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getEventDate } from "@/lib/data/event-settings";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

describe("getEventDate()", () => {
  it("returns a Date when value is a valid ISO string", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("event_settings", {
      data: { value: "2026-06-15T09:00:00Z" },
      error: null,
    });

    const result = await getEventDate(supabase as unknown as SupabaseClient);

    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString()).toBe("2026-06-15T09:00:00.000Z");

    const call = fromCalls.find((c) => c.table === "event_settings");
    expect(call).toBeDefined();

    const eqOp = call!.ops.find((o) => o.method === "eq");
    expect(eqOp).toBeDefined();
    expect(eqOp!.args[0]).toBe("key");
    expect(eqOp!.args[1]).toBe("saa_event_date");

    const terminal = call!.ops.find((o) => o.method === "maybeSingle");
    expect(terminal).toBeDefined();
  });

  it("returns null when data is null (key not found)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("event_settings", { data: null, error: null });

    const result = await getEventDate(supabase as unknown as SupabaseClient);

    expect(result).toBeNull();
  });

  it("returns null when data.value is an empty string", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("event_settings", { data: { value: "" }, error: null });

    const result = await getEventDate(supabase as unknown as SupabaseClient);

    expect(result).toBeNull();
  });

  it("returns null when data.value is null", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("event_settings", { data: { value: null }, error: null });

    const result = await getEventDate(supabase as unknown as SupabaseClient);

    expect(result).toBeNull();
  });

  it("returns null for an invalid date string (not NaN-safe parseable)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("event_settings", {
      data: { value: "not-a-date" },
      error: null,
    });

    const result = await getEventDate(supabase as unknown as SupabaseClient);

    expect(result).toBeNull();
  });

  it("returns null when table missing (PGRST205)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("event_settings", { data: null, error: { code: "PGRST205" } });

    const result = await getEventDate(supabase as unknown as SupabaseClient);

    expect(result).toBeNull();
  });

  it("throws on a generic (non-missing-table) error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("event_settings", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      getEventDate(supabase as unknown as SupabaseClient)
    ).rejects.toEqual({ code: "42501", message: "permission denied" });
  });
});
