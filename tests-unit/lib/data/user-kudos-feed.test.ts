import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getUserKudos,
  getUserKudosYears,
} from "@/lib/data/kudos-feed";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

// ---------------------------------------------------------------------------
// Helpers — build a raw PostgREST kudos row
// ---------------------------------------------------------------------------
function rawRow(opts: {
  id: string;
  weights?: number[];
  createdAt?: string;
  fromUser?: string;
  toUser?: string;
}) {
  const {
    id,
    weights = [],
    createdAt = "2026-05-01T00:00:00Z",
    fromUser = `from-${id}`,
    toUser = `to-${id}`,
  } = opts;
  return {
    id,
    message: `msg-${id}`,
    created_at: createdAt,
    from_user: fromUser,
    to_user: toUser,
    feature_hashtag: null,
    small_hashtags: [],
    images: [],
    hearts: weights.map((w, i) => ({ weight: w, user_id: `u-${id}-${i}` })),
  };
}

const asClient = (s: unknown) => s as unknown as SupabaseClient;

// ===========================================================================
// getUserKudos — "received" vs "sent" direction + year/cursor filters
// ===========================================================================
describe("getUserKudos()", () => {
  it('direction="received" filters by to_user column', async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("kudos", {
      data: [
        rawRow({ id: "r1", toUser: "user-123", fromUser: "sender-a" }),
        rawRow({ id: "r2", toUser: "user-123", fromUser: "sender-b" }),
      ],
      error: null,
    });
    queueResponse("user_profiles", { data: [], error: null });

    await getUserKudos(asClient(supabase), "user-123", "received");

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const eqOp = kudosCall!.ops.find((o) => o.method === "eq");
    expect(eqOp!.args).toEqual(["to_user", "user-123"]);
  });

  it('direction="sent" filters by from_user column', async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("kudos", {
      data: [
        rawRow({ id: "s1", fromUser: "user-456", toUser: "receiver-x" }),
        rawRow({ id: "s2", fromUser: "user-456", toUser: "receiver-y" }),
      ],
      error: null,
    });
    queueResponse("user_profiles", { data: [], error: null });

    await getUserKudos(asClient(supabase), "user-456", "sent");

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const eqOp = kudosCall!.ops.find((o) => o.method === "eq");
    expect(eqOp!.args).toEqual(["from_user", "user-456"]);
  });

  it("year filter applies created_at gte and lt bounds", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("kudos", {
      data: [rawRow({ id: "k1", createdAt: "2025-06-15T10:00:00Z" })],
      error: null,
    });
    queueResponse("user_profiles", { data: [], error: null });

    await getUserKudos(asClient(supabase), "user-789", "received", { year: 2025 });

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const gteOp = kudosCall!.ops.find((o) => o.method === "gte");
    const ltOp = kudosCall!.ops.find((o) => o.method === "lt");

    expect(gteOp!.args).toEqual(["created_at", "2025-01-01T00:00:00.000Z"]);
    expect(ltOp!.args).toEqual(["created_at", "2026-01-01T00:00:00.000Z"]);
  });

  it("cursor pagination: limit+1 fetched, nextCursor set when hasMore", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    // Fetch limit+1 (default limit=10 → fetch 11) to detect if more pages exist.
    // Return 11 rows → hasMore=true → return only 10, nextCursor = created_at of 10th row.
    queueResponse("kudos", {
      data: Array.from({ length: 11 }, (_, i) => {
        const d = new Date("2026-05-01T00:00:00Z");
        d.setDate(d.getDate() - i); // Descending by date
        return rawRow({
          id: `r${i}`,
          createdAt: d.toISOString(),
          toUser: "user-xyz",
        });
      }),
      error: null,
    });
    queueResponse("user_profiles", { data: [], error: null });

    const { rows, nextCursor } = await getUserKudos(
      asClient(supabase),
      "user-xyz",
      "received",
      { limit: 10 }
    );

    expect(rows).toHaveLength(10);
    expect(nextCursor).not.toBeNull();
    // nextCursor should be the created_at of the last row returned (10th row)
    expect(nextCursor).toBe(rows[9].created_at);
  });

  it("cursor pagination: null nextCursor on the last page", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    // Only 5 rows returned when limit=10 → no more pages.
    queueResponse("kudos", {
      data: Array.from({ length: 5 }, (_, i) =>
        rawRow({ id: `r${i}`, toUser: "user-abc" })
      ),
      error: null,
    });
    queueResponse("user_profiles", { data: [], error: null });

    const { rows, nextCursor } = await getUserKudos(
      asClient(supabase),
      "user-abc",
      "received",
      { limit: 10 }
    );

    expect(rows).toHaveLength(5);
    expect(nextCursor).toBeNull();
  });

  it("cursor: passes cursor as lt('created_at', cursor) clause", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("kudos", { data: [], error: null });

    await getUserKudos(asClient(supabase), "user-id", "received", {
      cursor: "2026-05-10T00:00:00Z",
    });

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const ltOp = kudosCall!.ops.find((o) => o.method === "lt");
    expect(ltOp!.args).toEqual(["created_at", "2026-05-10T00:00:00Z"]);
  });

  it("missing-table error returns { rows: [], nextCursor: null }", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: { code: "PGRST205" } });

    const result = await getUserKudos(
      asClient(supabase),
      "user-id",
      "received"
    );

    expect(result).toEqual({ rows: [], nextCursor: null });
  });

  it("throws on a generic (non-missing-table) error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      getUserKudos(asClient(supabase), "user-id", "received")
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("year and cursor combined: filters both created_at range and cursor", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("kudos", { data: [], error: null });

    await getUserKudos(asClient(supabase), "user-id", "received", {
      year: 2025,
      cursor: "2025-06-15T00:00:00Z",
    });

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const gteOp = kudosCall!.ops.find((o) => o.method === "gte");
    const ltOps = kudosCall!.ops.filter((o) => o.method === "lt");

    // Should have TWO lt calls: one for year range, one for cursor
    expect(ltOps.length).toBe(2);
    expect(gteOp!.args).toEqual(["created_at", "2025-01-01T00:00:00.000Z"]);
    // One of the lt calls is the year bound, one is the cursor
    expect(ltOps).toContainEqual({ method: "lt", args: ["created_at", "2026-01-01T00:00:00.000Z"] });
    expect(ltOps).toContainEqual({ method: "lt", args: ["created_at", "2025-06-15T00:00:00Z"] });
  });

  it("default limit is 10 when not specified", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("kudos", {
      data: Array.from({ length: 5 }, (_, i) =>
        rawRow({ id: `r${i}`, toUser: "user-id" })
      ),
      error: null,
    });
    queueResponse("user_profiles", { data: [], error: null });

    await getUserKudos(asClient(supabase), "user-id", "received");

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const limitOp = kudosCall!.ops.find((o) => o.method === "limit");
    // limit + 1 = 11 (to check for hasMore)
    expect(limitOp!.args[0]).toBe(11);
  });

  it("custom limit is respected", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("kudos", { data: [], error: null });

    await getUserKudos(asClient(supabase), "user-id", "received", { limit: 25 });

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const limitOp = kudosCall!.ops.find((o) => o.method === "limit");
    // limit + 1 = 26
    expect(limitOp!.args[0]).toBe(26);
  });
});

// ===========================================================================
// getUserKudosYears — distinct years descending
// ===========================================================================
describe("getUserKudosYears()", () => {
  it("returns distinct years in descending order when user received kudos", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: [
        { created_at: "2026-05-01T00:00:00Z" },
        { created_at: "2026-03-15T00:00:00Z" },
        { created_at: "2025-11-20T00:00:00Z" },
        { created_at: "2025-02-10T00:00:00Z" },
        { created_at: "2024-12-31T00:00:00Z" },
      ],
      error: null,
    });

    const years = await getUserKudosYears(asClient(supabase), "user-123");

    expect(years).toEqual([2026, 2025, 2024]);
  });

  it("returns distinct years when user sent kudos (or(to_user, from_user))", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    queueResponse("kudos", {
      data: [
        { created_at: "2025-06-01T00:00:00Z" },
        { created_at: "2024-03-01T00:00:00Z" },
      ],
      error: null,
    });

    await getUserKudosYears(asClient(supabase), "user-456");

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const orOp = kudosCall!.ops.find((o) => o.method === "or");
    // The or clause should filter for to_user OR from_user matching the userId
    expect(orOp!.args[0]).toContain("to_user");
    expect(orOp!.args[0]).toContain("from_user");
    expect(orOp!.args[0]).toContain("user-456");
  });

  it("returns empty array when the kudos table is missing", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: { code: "PGRST205" } });

    const years = await getUserKudosYears(asClient(supabase), "user-789");

    expect(years).toEqual([]);
  });

  it("throws on a generic (non-missing-table) error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      getUserKudosYears(asClient(supabase), "user-id")
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("deduplicates years from the same year with different dates", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    // Use mid-day UTC times to avoid timezone boundary issues
    queueResponse("kudos", {
      data: [
        { created_at: "2024-01-15T12:00:00Z" },
        { created_at: "2024-05-20T12:00:00Z" },
        { created_at: "2024-12-15T12:00:00Z" },
        { created_at: "2023-06-01T12:00:00Z" },
      ],
      error: null,
    });

    const years = await getUserKudosYears(asClient(supabase), "user-id");

    // Should return distinct years only
    const uniqueYears = Array.from(new Set(years));
    expect(uniqueYears).toEqual(years); // No duplicates
    expect(years.length).toBeGreaterThanOrEqual(2);
  });

  it("handles invalid date strings gracefully (NaN year excluded)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: [
        { created_at: "2026-05-01T00:00:00Z" },
        { created_at: "invalid-date" },
        { created_at: "2025-01-01T00:00:00Z" },
      ],
      error: null,
    });

    const years = await getUserKudosYears(asClient(supabase), "user-id");

    // Invalid date should be skipped (NaN year not added to Set)
    expect(years).toEqual([2026, 2025]);
  });

  it("returns empty array when user has no kudos", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: [], error: null });

    const years = await getUserKudosYears(asClient(supabase), "user-id");

    expect(years).toEqual([]);
  });
});
