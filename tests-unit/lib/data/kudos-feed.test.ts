import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getHighlightKudos,
  getAllKudos,
  getKudosById,
} from "@/lib/data/kudos-feed";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

// ---------------------------------------------------------------------------
// Helpers — build a raw PostgREST kudos row (no images → no storage calls,
// so normalizeRow stays self-contained and the feed logic is isolated).
// ---------------------------------------------------------------------------
function rawRow(opts: {
  id: string;
  weights?: number[];
  createdAt?: string;
  toUser?: string;
}) {
  const { id, weights = [], createdAt = "2026-05-01T00:00:00Z", toUser } = opts;
  return {
    id,
    message: `msg-${id}`,
    created_at: createdAt,
    from_user: `from-${id}`,
    to_user: toUser ?? `to-${id}`,
    feature_hashtag: null,
    small_hashtags: [],
    images: [],
    hearts: weights.map((w, i) => ({ weight: w, user_id: `u-${id}-${i}` })),
  };
}

const asClient = (s: unknown) => s as unknown as SupabaseClient;

// ===========================================================================
// getHighlightKudos
// ===========================================================================
describe("getHighlightKudos()", () => {
  it("sorts by heart_count descending and caps the result at 5", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: [
        rawRow({ id: "A", weights: [10] }),
        rawRow({ id: "B", weights: [40, 10] }), // 50
        rawRow({ id: "C", weights: [30] }),
        rawRow({ id: "D", weights: [5] }),
        rawRow({ id: "E", weights: [20, 20] }), // 40
        rawRow({ id: "F", weights: [20] }),
      ],
      error: null,
    });
    // No matching profiles → sender/receiver fall back to defaults.
    queueResponse("user_profiles", { data: [], error: null });

    const result = await getHighlightKudos(asClient(supabase));

    expect(result).toHaveLength(5);
    expect(result.map((r) => r.id)).toEqual(["B", "E", "C", "F", "A"]);
    expect(result.map((r) => r.heart_count)).toEqual([50, 40, 30, 20, 10]);
  });

  it("returns an empty array when the kudos table is missing (PGRST205)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: { code: "PGRST205" } });

    const result = await getHighlightKudos(asClient(supabase));
    expect(result).toEqual([]);
  });

  it("throws on a generic (non-missing-table) error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(getHighlightKudos(asClient(supabase))).rejects.toMatchObject({
      code: "42501",
    });
  });

  it("resolves the hashtag_id filter via kudos_hashtags → kudos.in('id', …)", async () => {
    const { supabase, queueResponse, fromCalls } = createSupabaseMock();
    // The hashtag belongs to these two kudos (small-hashtag join rows).
    queueResponse("kudos_hashtags", {
      data: [{ kudos_id: "k-1" }, { kudos_id: "k-2" }],
      error: null,
    });
    queueResponse("kudos", { data: [], error: null });

    await getHighlightKudos(asClient(supabase), { hashtag_id: "h-7" });

    const joinCall = fromCalls.find((c) => c.table === "kudos_hashtags");
    const eqOp = joinCall!.ops.find((o) => o.method === "eq");
    expect(eqOp!.args).toEqual(["hashtag_id", "h-7"]);

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const inOp = kudosCall!.ops.find((o) => o.method === "in");
    expect(inOp!.args).toEqual(["id", ["k-1", "k-2"]]);
  });

  it("returns [] when no kudos carry the filtered hashtag", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos_hashtags", { data: [], error: null });

    const result = await getHighlightKudos(asClient(supabase), { hashtag_id: "h-x" });
    expect(result).toEqual([]);
  });
});

// ===========================================================================
// getAllKudos — cursor pagination
// ===========================================================================
describe("getAllKudos()", () => {
  it("returns limit rows + a nextCursor when more pages exist (limit+1 probe)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    // limit = 2, three rows returned (limit + 1) → hasMore.
    queueResponse("kudos", {
      data: [
        rawRow({ id: "r1", createdAt: "2026-05-03T00:00:00Z" }),
        rawRow({ id: "r2", createdAt: "2026-05-02T00:00:00Z" }),
        rawRow({ id: "r3", createdAt: "2026-05-01T00:00:00Z" }),
      ],
      error: null,
    });
    queueResponse("user_profiles", { data: [], error: null });

    const { rows, nextCursor } = await getAllKudos(
      asClient(supabase),
      undefined,
      2
    );

    expect(rows.map((r) => r.id)).toEqual(["r1", "r2"]);
    expect(nextCursor).toBe("2026-05-02T00:00:00Z");
  });

  it("returns a null nextCursor on the last page", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: [rawRow({ id: "r1" }), rawRow({ id: "r2" })],
      error: null,
    });
    queueResponse("user_profiles", { data: [], error: null });

    const { rows, nextCursor } = await getAllKudos(
      asClient(supabase),
      undefined,
      5
    );

    expect(rows).toHaveLength(2);
    expect(nextCursor).toBeNull();
  });

  it("passes the cursor through as a lt('created_at', cursor) clause", async () => {
    const { supabase, fromCalls } = createSupabaseMock();
    // No queued response → defaults to empty data, so no profile query fires.
    await getAllKudos(asClient(supabase), "2026-05-10T00:00:00Z", 10);

    const kudosCall = fromCalls.find((c) => c.table === "kudos");
    const ltOp = kudosCall!.ops.find((o) => o.method === "lt");
    expect(ltOp!.args).toEqual(["created_at", "2026-05-10T00:00:00Z"]);
  });

  it("filters rows by the receiver's department_code", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: [
        rawRow({ id: "eng", toUser: "to-eng" }),
        rawRow({ id: "sales", toUser: "to-sales" }),
      ],
      error: null,
    });
    queueResponse("user_profiles", {
      data: [
        {
          user_id: "to-eng",
          full_name_vi: "Eng Person",
          employee_code: "E1",
          title: "Dev",
          avatar_url: null,
          department_code: "ENG",
        },
        {
          user_id: "to-sales",
          full_name_vi: "Sales Person",
          employee_code: "S1",
          title: "Rep",
          avatar_url: null,
          department_code: "SALES",
        },
      ],
      error: null,
    });
    queueResponse("departments", {
      data: [
        { code: "ENG", name_vi: "Engineering", display_order: 1 },
        { code: "SALES", name_vi: "Sales", display_order: 2 },
      ],
      error: null,
    });

    const { rows } = await getAllKudos(asClient(supabase), undefined, 10, {
      department_code: "ENG",
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("eng");
    expect(rows[0].receiver.department_code).toBe("ENG");
  });

  it("returns an empty page when the kudos table is missing", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: { code: "PGRST205" } });

    const result = await getAllKudos(asClient(supabase));
    expect(result).toEqual({ rows: [], nextCursor: null });
  });
});

// ===========================================================================
// getKudosById
// ===========================================================================
describe("getKudosById()", () => {
  it("returns the normalized card on success", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: rawRow({ id: "k-1", weights: [10, 5] }),
      error: null,
    });
    queueResponse("user_profiles", { data: [], error: null });

    const result = await getKudosById(asClient(supabase), "k-1");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("k-1");
    expect(result!.heart_count).toBe(15);
  });

  it("returns null when the row is not found (PGRST116)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: { code: "PGRST116" } });

    const result = await getKudosById(asClient(supabase), "missing");
    expect(result).toBeNull();
  });

  it("returns null when the kudos table is missing (PGRST205)", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", { data: null, error: { code: "PGRST205" } });

    const result = await getKudosById(asClient(supabase), "k-1");
    expect(result).toBeNull();
  });

  it("throws on a generic error", async () => {
    const { supabase, queueResponse } = createSupabaseMock();
    queueResponse("kudos", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(
      getKudosById(asClient(supabase), "k-1")
    ).rejects.toMatchObject({ code: "42501" });
  });
});
