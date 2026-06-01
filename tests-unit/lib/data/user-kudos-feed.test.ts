import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserKudos } from "@/lib/data/kudos-feed";
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
// getUserKudos — "received" vs "sent" direction + cursor filters
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
