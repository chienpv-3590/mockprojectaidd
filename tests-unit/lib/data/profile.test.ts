import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfile, getProfileStats } from "@/lib/data/profile";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

describe("getProfileStats()", () => {
  it("sums heart weights and computes tier", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: null, count: 25 }); // received
    queueResponse("kudos", { data: null, error: null, count: 7 }); // sent
    queueResponse("kudos_hearts", {
      data: [{ weight: 1 }, { weight: 2 }, { weight: 1 }],
      error: null,
    });

    const stats = await getProfileStats(
      supabase as unknown as SupabaseClient,
      "user-1"
    );
    expect(stats).toEqual({ received: 25, sent: 7, hearts: 4, tier: 2 });
  });

  it("returns tier=0 for received<10 (spec B.3.2: 10 Kudos = 1 hoa thị)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: null, count: 9 });
    queueResponse("kudos", { data: null, error: null, count: 0 });
    queueResponse("kudos_hearts", { data: [], error: null });

    const stats = await getProfileStats(
      supabase as unknown as SupabaseClient,
      "user-1"
    );
    expect(stats.tier).toBe(0);
  });

  it("returns tier=1 for 10..19", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: null, count: 10 });
    queueResponse("kudos", { data: null, error: null, count: 0 });
    queueResponse("kudos_hearts", { data: [], error: null });
    const stats = await getProfileStats(
      supabase as unknown as SupabaseClient,
      "user-1"
    );
    expect(stats.tier).toBe(1);
  });

  it("returns tier=3 for received>=50", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: null, count: 100 });
    queueResponse("kudos", { data: null, error: null, count: 0 });
    queueResponse("kudos_hearts", { data: [], error: null });
    const stats = await getProfileStats(
      supabase as unknown as SupabaseClient,
      "user-1"
    );
    expect(stats.tier).toBe(3);
  });
});

describe("getProfile()", () => {
  it("returns null when row missing (PGRST116)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("user_profiles", { data: null, error: { code: "PGRST116" } });
    const result = await getProfile(
      supabase as unknown as SupabaseClient,
      "ghost-user"
    );
    expect(result).toBeNull();
  });

  it("returns null when table missing", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("user_profiles", { data: null, error: { code: "PGRST205" } });
    const result = await getProfile(
      supabase as unknown as SupabaseClient,
      "u1"
    );
    expect(result).toBeNull();
  });

  it("hydrates department_name_vi and tier from stats", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("user_profiles", {
      data: {
        user_id: "u1",
        full_name_vi: "Alice",
        employee_code: "E01",
        title: "Eng",
        avatar_url: null,
        department_code: "ENG",
        department: { name_vi: "Kỹ thuật" },
      },
      error: null,
    });
    queueResponse("kudos", { data: null, error: null, count: 20 }); // tier=2
    queueResponse("kudos", { data: null, error: null, count: 3 });
    queueResponse("kudos_hearts", { data: [], error: null });

    const result = await getProfile(
      supabase as unknown as SupabaseClient,
      "u1"
    );
    expect(result).not.toBeNull();
    expect(result!.full_name_vi).toBe("Alice");
    expect(result!.department_name_vi).toBe("Kỹ thuật");
    expect(result!.tier).toBe(2);
  });
});
