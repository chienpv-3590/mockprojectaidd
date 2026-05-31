import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSecretBoxCounts, listRecentRecipients } from "@/lib/data/secret-boxes";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

describe("getSecretBoxCounts()", () => {
  it("counts opened+claimed as opened, unopened separately", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("secret_boxes", {
      data: [
        { status: "opened" },
        { status: "opened" },
        { status: "claimed" },
        { status: "unopened" },
      ],
      error: null,
    });

    const counts = await getSecretBoxCounts(
      supabase as unknown as SupabaseClient,
      "user-1"
    );
    expect(counts).toEqual({ opened: 3, unopened: 1, total: 4 });
  });

  it("returns zero counts when table missing", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("secret_boxes", { data: null, error: { code: "PGRST205" } });
    const counts = await getSecretBoxCounts(
      supabase as unknown as SupabaseClient,
      "user-1"
    );
    expect(counts).toEqual({ opened: 0, unopened: 0, total: 0 });
  });

  it("handles empty data set", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("secret_boxes", { data: [], error: null });
    const counts = await getSecretBoxCounts(
      supabase as unknown as SupabaseClient,
      "user-1"
    );
    expect(counts).toEqual({ opened: 0, unopened: 0, total: 0 });
  });

  it("throws on non-missing-table error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("secret_boxes", { data: null, error: { code: "42501" } });
    await expect(
      getSecretBoxCounts(supabase as unknown as SupabaseClient, "user-1")
    ).rejects.toBeDefined();
  });
});

describe("listRecentRecipients()", () => {
  it("maps joined rows to {user, reward_label_vi, opened_at}", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("secret_boxes", {
      data: [
        {
          reward_label_vi: "Coffee voucher",
          opened_at: "2026-05-20T10:00:00Z",
          owner: "u1",
        },
      ],
      error: null,
    });
    queueResponse("user_profiles", {
      data: [
        {
          user_id: "u1",
          full_name_vi: "Nguyễn Văn A",
          employee_code: "EMP01",
          title: "Engineer",
          avatar_url: null,
          department_code: "ENG",
        },
      ],
      error: null,
    });
    queueResponse("departments", {
      data: [{ code: "ENG", name_vi: "Kỹ thuật" }],
      error: null,
    });

    const recipients = await listRecentRecipients(
      supabase as unknown as SupabaseClient,
      5
    );
    expect(recipients).toHaveLength(1);
    expect(recipients[0].reward_label_vi).toBe("Coffee voucher");
    expect(recipients[0].user.user_id).toBe("u1");
    expect(recipients[0].user.department_name_vi).toBe("Kỹ thuật");
    expect(recipients[0].user.tier).toBe(0);
  });

  it("fills empty strings for null owner fields", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("secret_boxes", {
      data: [{ reward_label_vi: null, opened_at: null, owner: "u-missing" }],
      error: null,
    });
    // user_profiles query returns no matches (orphan owner id)
    queueResponse("user_profiles", { data: [], error: null });
    const recipients = await listRecentRecipients(
      supabase as unknown as SupabaseClient
    );
    expect(recipients[0].reward_label_vi).toBe("");
    expect(recipients[0].opened_at).toBe("");
    expect(recipients[0].user.full_name_vi).toBe("");
  });

  it("returns [] when table missing", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("secret_boxes", { data: null, error: { code: "PGRST205" } });
    const recipients = await listRecentRecipients(
      supabase as unknown as SupabaseClient
    );
    expect(recipients).toEqual([]);
  });

  it("dedupes by owner — keeps the most recent box per recipient (regression: duplicate React key when one user opens several boxes)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("secret_boxes", {
      data: [
        { reward_label_vi: "Stay Gold",          opened_at: "2026-05-28T10:00:00Z", owner: "u1" },
        { reward_label_vi: "Flow to Horizon",    opened_at: "2026-05-27T10:00:00Z", owner: "u1" },
        { reward_label_vi: "Touch of Light",     opened_at: "2026-05-26T10:00:00Z", owner: "u1" },
        { reward_label_vi: "Beyond the Boundary", opened_at: "2026-05-25T10:00:00Z", owner: "u2" },
      ],
      error: null,
    });
    queueResponse("user_profiles", {
      data: [
        { user_id: "u1", full_name_vi: "A", employee_code: "E1", title: null, avatar_url: null, department_code: null },
        { user_id: "u2", full_name_vi: "B", employee_code: "E2", title: null, avatar_url: null, department_code: null },
      ],
      error: null,
    });

    const recipients = await listRecentRecipients(
      supabase as unknown as SupabaseClient,
      10
    );

    const ids = recipients.map((r) => r.user.user_id);
    expect(ids).toEqual(["u1", "u2"]); // distinct, most-recent-first
    expect(recipients[0].reward_label_vi).toBe("Stay Gold"); // u1's newest box kept
    expect(new Set(ids).size).toBe(ids.length); // unique React keys downstream
  });
});
