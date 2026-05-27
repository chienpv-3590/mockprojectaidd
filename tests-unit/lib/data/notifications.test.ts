import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getNotifications,
  getUnreadCount,
  markAllReadForUser,
} from "@/lib/data/notifications";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

const NOTIF_ROW = {
  id: "notif-1",
  title: "You got a kudos!",
  body: "Alice sent you a kudos.",
  read: false,
  created_at: "2026-05-20T10:00:00Z",
};

// ---------------------------------------------------------------------------
// getNotifications()
// ---------------------------------------------------------------------------

describe("getNotifications()", () => {
  it("returns rows ordered by created_at descending, limited to default 10", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("notifications", { data: [NOTIF_ROW], error: null });

    const result = await getNotifications(
      supabase as unknown as SupabaseClient,
      "user-1"
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(NOTIF_ROW);

    const call = fromCalls.find((c) => c.table === "notifications");
    expect(call).toBeDefined();

    const eqOp = call!.ops.find((o) => o.method === "eq");
    expect(eqOp).toBeDefined();
    expect(eqOp!.args[0]).toBe("user_id");
    expect(eqOp!.args[1]).toBe("user-1");

    const orderOp = call!.ops.find((o) => o.method === "order");
    expect(orderOp).toBeDefined();
    expect(orderOp!.args[0]).toBe("created_at");
    expect(orderOp!.args[1]).toEqual({ ascending: false });

    const limitOp = call!.ops.find((o) => o.method === "limit");
    expect(limitOp).toBeDefined();
    expect(limitOp!.args[0]).toBe(10);
  });

  it("respects a custom limit argument", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("notifications", { data: [], error: null });

    await getNotifications(supabase as unknown as SupabaseClient, "user-1", 25);

    const call = fromCalls.find((c) => c.table === "notifications");
    const limitOp = call!.ops.find((o) => o.method === "limit");
    expect(limitOp!.args[0]).toBe(25);
  });

  it("returns [] when supabase returns null data", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", { data: null, error: null });

    const result = await getNotifications(
      supabase as unknown as SupabaseClient,
      "user-1"
    );

    expect(result).toEqual([]);
  });

  it("returns [] when table missing (PGRST205)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", { data: null, error: { code: "PGRST205" } });

    const result = await getNotifications(
      supabase as unknown as SupabaseClient,
      "user-1"
    );

    expect(result).toEqual([]);
  });

  it("throws on a generic (non-missing-table) error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      getNotifications(supabase as unknown as SupabaseClient, "user-1")
    ).rejects.toEqual({ code: "42501", message: "permission denied" });
  });
});

// ---------------------------------------------------------------------------
// getUnreadCount()
// ---------------------------------------------------------------------------

describe("getUnreadCount()", () => {
  it("returns the unread count from a head-only query", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("notifications", { data: null, error: null, count: 7 });

    const result = await getUnreadCount(
      supabase as unknown as SupabaseClient,
      "user-1"
    );

    expect(result).toBe(7);

    const call = fromCalls.find((c) => c.table === "notifications");
    expect(call).toBeDefined();

    const selectOp = call!.ops.find((o) => o.method === "select");
    expect(selectOp!.args[1]).toEqual({ count: "exact", head: true });

    const eqOps = call!.ops.filter((o) => o.method === "eq");
    expect(eqOps).toHaveLength(2);
    expect(eqOps[0].args).toEqual(["user_id", "user-1"]);
    expect(eqOps[1].args).toEqual(["read", false]);
  });

  it("returns 0 when count is null", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", { data: null, error: null, count: null });

    const result = await getUnreadCount(
      supabase as unknown as SupabaseClient,
      "user-1"
    );

    expect(result).toBe(0);
  });

  it("returns 0 when count is 0", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", { data: null, error: null, count: 0 });

    const result = await getUnreadCount(
      supabase as unknown as SupabaseClient,
      "user-1"
    );

    expect(result).toBe(0);
  });

  it("returns 0 when table missing (PGRST205)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", {
      data: null,
      error: { code: "PGRST205" },
    });

    const result = await getUnreadCount(
      supabase as unknown as SupabaseClient,
      "user-1"
    );

    expect(result).toBe(0);
  });

  it("throws on a generic (non-missing-table) error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      getUnreadCount(supabase as unknown as SupabaseClient, "user-1")
    ).rejects.toEqual({ code: "42501", message: "permission denied" });
  });
});

// ---------------------------------------------------------------------------
// markAllReadForUser()
// ---------------------------------------------------------------------------

describe("markAllReadForUser()", () => {
  it("issues update with read:true filtered by user_id and read:false", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("notifications", { data: null, error: null });

    await markAllReadForUser(supabase as unknown as SupabaseClient, "user-1");

    const call = fromCalls.find((c) => c.table === "notifications");
    expect(call).toBeDefined();

    const updateOp = call!.ops.find((o) => o.method === "update");
    expect(updateOp).toBeDefined();
    expect(updateOp!.args[0]).toEqual({ read: true });

    const eqOps = call!.ops.filter((o) => o.method === "eq");
    expect(eqOps).toHaveLength(2);
    expect(eqOps[0].args).toEqual(["user_id", "user-1"]);
    expect(eqOps[1].args).toEqual(["read", false]);
  });

  it("resolves without throwing when there are no unread rows (empty success)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", { data: null, error: null });

    await expect(
      markAllReadForUser(supabase as unknown as SupabaseClient, "user-1")
    ).resolves.toBeUndefined();
  });

  it("returns void (no throw) when table missing (PGRST205)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", {
      data: null,
      error: { code: "PGRST205" },
    });

    await expect(
      markAllReadForUser(supabase as unknown as SupabaseClient, "user-1")
    ).resolves.toBeUndefined();
  });

  it("throws on a generic (non-missing-table) error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("notifications", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      markAllReadForUser(supabase as unknown as SupabaseClient, "user-1")
    ).rejects.toEqual({ code: "42501", message: "permission denied" });
  });
});
