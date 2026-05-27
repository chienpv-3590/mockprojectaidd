import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSpotlightRecipients, getTotalKudosCount } from "@/lib/data/spotlight";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

describe("getSpotlightRecipients()", () => {
  it("joins view rows with profile name + last received_at from kudos", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("user_kudos_received_counts", {
      data: [
        { user_id: "u1", received_count: 12 },
        { user_id: "u2", received_count: 5 },
      ],
      error: null,
    });
    queueResponse("user_profiles", {
      data: [
        { user_id: "u1", full_name_vi: "Người A" },
        { user_id: "u2", full_name_vi: "Người B" },
      ],
      error: null,
    });
    queueResponse("kudos", {
      data: [
        { id: "k-u1-latest", to_user: "u1", created_at: "2026-05-25T12:00:00Z" },
        { id: "k-u1-older",  to_user: "u1", created_at: "2026-05-20T08:00:00Z" }, // older — ignored
        { id: "k-u2-latest", to_user: "u2", created_at: "2026-05-24T09:00:00Z" },
      ],
      error: null,
    });

    const result = await getSpotlightRecipients(
      supabase as unknown as SupabaseClient
    );

    expect(result).toEqual([
      {
        user_id: "u1",
        name: "Người A",
        received_count: 12,
        last_received_at: "2026-05-25T12:00:00Z",
        latest_kudos_id: "k-u1-latest",
      },
      {
        user_id: "u2",
        name: "Người B",
        received_count: 5,
        last_received_at: "2026-05-24T09:00:00Z",
        latest_kudos_id: "k-u2-latest",
      },
    ]);
  });

  it("drops users without a profile name (no UUID leak in UI)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("user_kudos_received_counts", {
      data: [
        { user_id: "uX", received_count: 1 }, // no profile — dropped
        { user_id: "uY", received_count: 1 }, // has profile — kept
      ],
      error: null,
    });
    queueResponse("user_profiles", {
      data: [{ user_id: "uY", full_name_vi: "Người Y" }],
      error: null,
    });
    queueResponse("kudos", {
      data: [{ id: "kY", to_user: "uY", created_at: "2026-05-26T00:00:00Z" }],
      error: null,
    });
    const result = await getSpotlightRecipients(
      supabase as unknown as SupabaseClient
    );
    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe("uY");
    expect(result[0].name).toBe("Người Y");
    expect(result[0].latest_kudos_id).toBe("kY");
  });

  it("returns [] when view missing", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("user_kudos_received_counts", { data: null, error: { code: "PGRST205" } });
    const result = await getSpotlightRecipients(
      supabase as unknown as SupabaseClient
    );
    expect(result).toEqual([]);
  });

  it("returns [] when view empty", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("user_kudos_received_counts", { data: [], error: null });
    const result = await getSpotlightRecipients(
      supabase as unknown as SupabaseClient
    );
    expect(result).toEqual([]);
  });
});

describe("getTotalKudosCount()", () => {
  it("returns the count from a head:true query on kudos", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { count: 388, error: null });
    const total = await getTotalKudosCount(supabase as unknown as SupabaseClient);
    expect(total).toBe(388);
  });

  it("returns 0 when count is null", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { count: null, error: null });
    const total = await getTotalKudosCount(supabase as unknown as SupabaseClient);
    expect(total).toBe(0);
  });

  it("returns 0 when table missing", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: { code: "PGRST205" } });
    const total = await getTotalKudosCount(supabase as unknown as SupabaseClient);
    expect(total).toBe(0);
  });

  it("throws on non-missing-table error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: { code: "42501" } });
    await expect(
      getTotalKudosCount(supabase as unknown as SupabaseClient)
    ).rejects.toBeDefined();
  });
});
