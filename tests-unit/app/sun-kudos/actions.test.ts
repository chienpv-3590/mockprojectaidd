/**
 * Characterization (regression) tests for app/sun-kudos/actions.ts.
 *
 * These tests match the CURRENT behavior of each server action; they do not
 * prescribe future behavior. Mocks are injected at module level so the "use
 * server" directive is transparent to Vitest.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

// ---------------------------------------------------------------------------
// Module-level mocks — must be declared before any import of the modules under
// test because Vitest hoists vi.mock() calls.
// ---------------------------------------------------------------------------

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/data/kudos-feed", () => ({
  getKudosById: vi.fn(),
  getHighlightKudos: vi.fn(),
  getAllKudos: vi.fn(),
  getUserKudos: vi.fn(),
}));

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getKudosById,
  getHighlightKudos,
  getAllKudos,
  getUserKudos,
} from "@/lib/data/kudos-feed";
import {
  submitKudos,
  toggleHeart,
  openSecretBox,
  fetchKudosCard,
  refetchHighlight,
  refetchFeed,
  refetchUserKudos,
  searchSunners,
  getNextUnopenedBox,
} from "@/app/_actions/sun-kudos";
import type { KudosCardData, KudosFilters, SubmitKudosInput } from "@/lib/data/types";
import { SECRET_BOX_ICONS } from "@/lib/sun-kudos/secret-box-icons";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const AUTHED_USER = { id: "user-abc" };
const OTHER_USER = { id: "user-xyz" };

/** Wire a fresh mock supabase into createClient for each test. */
function setupMock(authUser: { id: string } | null = AUTHED_USER) {
  const mock = createSupabaseMock({ authUser });
  vi.mocked(createClient).mockResolvedValue(mock.supabase as never);
  return mock;
}

// ---------------------------------------------------------------------------
// submitKudos
// ---------------------------------------------------------------------------

describe("submitKudos()", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
  });

  const validInput: SubmitKudosInput = {
    to_user: OTHER_USER.id,
    message: "Great work!",
    title: "Well done",
    is_anonymous: false,
    feature_hashtag_id: "ht-1",
    small_hashtag_ids: ["s1", "s2"],
    image_paths: ["img/a.jpg"],
    mention_user_ids: [],
  };

  it("throws 'unauthenticated' when no user session", async () => {
    setupMock(null);
    await expect(submitKudos(validInput)).rejects.toThrow("unauthenticated");
  });

  it("throws 'cannot_send_to_self' when to_user equals current user", async () => {
    setupMock(AUTHED_USER);
    await expect(
      submitKudos({ ...validInput, to_user: AUTHED_USER.id })
    ).rejects.toThrow("cannot_send_to_self");
  });

  it("throws 'invalid_message_length' for empty message", async () => {
    setupMock(AUTHED_USER);
    await expect(
      submitKudos({ ...validInput, message: "" })
    ).rejects.toThrow("invalid_message_length");
  });

  it("throws 'invalid_message_length' for message > 1000 plain-text chars", async () => {
    setupMock(AUTHED_USER);
    await expect(
      submitKudos({ ...validInput, message: "x".repeat(1001) })
    ).rejects.toThrow("invalid_message_length");
  });

  it("throws 'too_many_hashtags' for > 5 small_hashtag_ids", async () => {
    setupMock(AUTHED_USER);
    await expect(
      submitKudos({ ...validInput, small_hashtag_ids: ["a", "b", "c", "d", "e", "f"] })
    ).rejects.toThrow("too_many_hashtags");
  });

  it("throws 'too_many_images' for > 5 image_paths", async () => {
    setupMock(AUTHED_USER);
    await expect(
      submitKudos({
        ...validInput,
        image_paths: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"],
      })
    ).rejects.toThrow("too_many_images");
  });

  it("happy path: calls rpc with correct args, returns { id }, revalidates", async () => {
    const mock = setupMock(AUTHED_USER);
    const newId = "kudos-new-1";
    mock.queueRpcResponse("submit_kudos_atomic", { data: newId, error: null });

    const result = await submitKudos(validInput);

    expect(result).toEqual({ id: newId });

    // RPC was called once with the right function name
    expect(mock.rpcCalls).toHaveLength(1);
    expect(mock.rpcCalls[0].fn).toBe("submit_kudos_atomic");
    expect(mock.rpcCalls[0].args).toMatchObject({
      p_from_user: AUTHED_USER.id,
      p_to_user: validInput.to_user,
      p_hashtag_id: validInput.feature_hashtag_id,
      p_small_tags: validInput.small_hashtag_ids,
      p_image_paths: validInput.image_paths,
      p_title: validInput.title,
      p_is_anonymous: false,
      p_anonymous_nickname: null,
      p_mention_ids: [],
    });

    expect(revalidatePath).toHaveBeenCalledWith("/sun-kudos");
  });

  it("throws the rpc error message when rpc returns an error", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueRpcResponse("submit_kudos_atomic", {
      data: null,
      error: { message: "constraint_violation" },
    });

    await expect(submitKudos(validInput)).rejects.toThrow("constraint_violation");
  });

  it("throws 'submit_failed' when rpc returns null data with no error", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueRpcResponse("submit_kudos_atomic", { data: null, error: null });

    await expect(submitKudos(validInput)).rejects.toThrow("submit_failed");
  });
});

// ---------------------------------------------------------------------------
// toggleHeart
// ---------------------------------------------------------------------------

describe("toggleHeart()", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
  });

  const INPUT = { kudos_id: "kudos-1" };

  it("throws 'unauthenticated' when no user session", async () => {
    setupMock(null);
    await expect(toggleHeart(INPUT)).rejects.toThrow("unauthenticated");
  });

  it("throws 'kudos_not_found' when kudos row is missing", async () => {
    const mock = setupMock(AUTHED_USER);
    // kudos maybeSingle → null
    mock.queueResponse("kudos", { data: null, error: null });

    await expect(toggleHeart(INPUT)).rejects.toThrow("kudos_not_found");
  });

  it("throws 'cannot_like_own_kudos' when sender is the current user", async () => {
    const mock = setupMock(AUTHED_USER);
    // kudos row: from_user === current user
    mock.queueResponse("kudos", {
      data: { id: INPUT.kudos_id, from_user: AUTHED_USER.id },
      error: null,
    });

    await expect(toggleHeart(INPUT)).rejects.toThrow("cannot_like_own_kudos");
  });

  it("un-hearts when heart already exists: deletes, returns liked=false, reuses weight", async () => {
    const mock = setupMock(AUTHED_USER);

    // 1. kudos row (from_user is someone else)
    mock.queueResponse("kudos", {
      data: { id: INPUT.kudos_id, from_user: OTHER_USER.id },
      error: null,
    });
    // 2. existing heart check → found with weight 2
    mock.queueResponse("kudos_hearts", { data: { weight: 2 }, error: null });
    // 3. delete → success
    mock.queueResponse("kudos_hearts", { data: null, error: null });
    // 4. sum query → one remaining heart with weight 1
    mock.queueResponse("kudos_hearts", { data: [{ weight: 1 }], error: null });

    const result = await toggleHeart(INPUT);

    expect(result.liked).toBe(false);
    expect(result.weight_applied).toBe(2);
    expect(result.heart_count).toBe(1);
    expect(revalidatePath).toHaveBeenCalledWith("/sun-kudos");

    // verify delete op was recorded
    const deleteCall = mock.fromCalls.find(
      (c) => c.table === "kudos_hearts" && c.ops.some((o) => o.method === "delete")
    );
    expect(deleteCall).toBeDefined();
  });

  it("hearts when no existing heart: inserts with special-day multiplier, liked=true", async () => {
    const mock = setupMock(AUTHED_USER);

    // 1. kudos row
    mock.queueResponse("kudos", {
      data: { id: INPUT.kudos_id, from_user: OTHER_USER.id },
      error: null,
    });
    // 2. existing heart → not found
    mock.queueResponse("kudos_hearts", { data: null, error: null });
    // 3. special_days multiplier → 2x
    mock.queueResponse("special_days", {
      data: { multiplier: 2 },
      error: null,
    });
    // 4. insert heart → success
    mock.queueResponse("kudos_hearts", { data: null, error: null });
    // 5. sum query → two hearts
    mock.queueResponse("kudos_hearts", {
      data: [{ weight: 2 }, { weight: 1 }],
      error: null,
    });

    const result = await toggleHeart(INPUT);

    expect(result.liked).toBe(true);
    expect(result.weight_applied).toBe(2);
    expect(result.heart_count).toBe(3);

    // verify insert was recorded with the right weight
    const insertCall = mock.fromCalls.find(
      (c) =>
        c.table === "kudos_hearts" &&
        c.ops.some(
          (o) =>
            o.method === "insert" &&
            (o.args[0] as { weight: number }).weight === 2
        )
    );
    expect(insertCall).toBeDefined();
  });

  it("defaults to weight=1 when no special day is active", async () => {
    const mock = setupMock(AUTHED_USER);

    mock.queueResponse("kudos", {
      data: { id: INPUT.kudos_id, from_user: OTHER_USER.id },
      error: null,
    });
    mock.queueResponse("kudos_hearts", { data: null, error: null }); // no existing
    mock.queueResponse("special_days", { data: null, error: null }); // no special day
    mock.queueResponse("kudos_hearts", { data: null, error: null }); // insert ok
    mock.queueResponse("kudos_hearts", { data: [{ weight: 1 }], error: null }); // sum

    const result = await toggleHeart(INPUT);

    expect(result.weight_applied).toBe(1);
    expect(result.liked).toBe(true);
  });

  it("recomputes heart_count by summing weights from kudos_hearts SELECT", async () => {
    const mock = setupMock(AUTHED_USER);

    mock.queueResponse("kudos", {
      data: { id: INPUT.kudos_id, from_user: OTHER_USER.id },
      error: null,
    });
    mock.queueResponse("kudos_hearts", { data: null, error: null }); // no existing
    mock.queueResponse("special_days", { data: null, error: null });
    mock.queueResponse("kudos_hearts", { data: null, error: null }); // insert
    // sum: multiple hearts
    mock.queueResponse("kudos_hearts", {
      data: [{ weight: 1 }, { weight: 2 }, { weight: 1 }],
      error: null,
    });

    const result = await toggleHeart(INPUT);
    expect(result.heart_count).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// openSecretBox
// ---------------------------------------------------------------------------

describe("openSecretBox()", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
  });

  const INPUT = { box_id: "box-1" };

  it("throws 'unauthenticated' when no user session", async () => {
    setupMock(null);
    await expect(openSecretBox(INPUT)).rejects.toThrow("unauthenticated");
  });

  it("throws 'box_not_found' when box row is null", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("secret_boxes", { data: null, error: null });

    await expect(openSecretBox(INPUT)).rejects.toThrow("box_not_found");
  });

  it("throws 'box_not_found' when box owner does not match current user", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("secret_boxes", {
      data: { id: INPUT.box_id, owner: OTHER_USER.id, status: "unopened" },
      error: null,
    });

    await expect(openSecretBox(INPUT)).rejects.toThrow("box_not_found");
  });

  it("throws 'box_already_opened' when status is not 'unopened'", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("secret_boxes", {
      data: { id: INPUT.box_id, owner: AUTHED_USER.id, status: "opened" },
      error: null,
    });

    await expect(openSecretBox(INPUT)).rejects.toThrow("box_already_opened");
  });

  it("happy path: updates box, returns reward_label_vi from REWARDS pool, revalidates", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("secret_boxes", {
      data: { id: INPUT.box_id, owner: AUTHED_USER.id, status: "unopened" },
      error: null,
    });
    // update → returns the affected row (status='unopened' race guard).
    mock.queueResponse("secret_boxes", {
      data: [{ id: INPUT.box_id }],
      error: null,
    });

    // Reward label comes from the awardable SAA collectible icons (those with
    // artwork). Derive from the single source of truth to stay in sync.
    const REWARDS = SECRET_BOX_ICONS.filter((i) => i.src !== null).map((i) => i.label);

    const result = await openSecretBox(INPUT);

    expect(REWARDS).toContain(result.reward_label_vi);
    expect(revalidatePath).toHaveBeenCalledWith("/sun-kudos");

    // verify update was called with correct status + reward
    const updateCall = mock.fromCalls.find(
      (c) =>
        c.table === "secret_boxes" &&
        c.ops.some(
          (o) =>
            o.method === "update" &&
            (o.args[0] as { status: string }).status === "opened" &&
            (o.args[0] as { reward_label_vi: string }).reward_label_vi ===
              result.reward_label_vi
        )
    );
    expect(updateCall).toBeDefined();
  });

  it("throws 'box_already_opened' when the race guard finds no row to update", async () => {
    // Concurrent caller already flipped status to 'opened' between our SELECT
    // and UPDATE — the .eq("status","unopened") filter matches zero rows.
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("secret_boxes", {
      data: { id: INPUT.box_id, owner: AUTHED_USER.id, status: "unopened" },
      error: null,
    });
    mock.queueResponse("secret_boxes", { data: [], error: null });

    await expect(openSecretBox(INPUT)).rejects.toThrow("box_already_opened");
  });
});

// ---------------------------------------------------------------------------
// fetchKudosCard, refetchHighlight, refetchFeed — smoke: delegate to lib/data
// ---------------------------------------------------------------------------

describe("fetchKudosCard()", () => {
  it("delegates to getKudosById and returns its result", async () => {
    const mock = setupMock(AUTHED_USER);
    const fakeCard = { id: "k1" } as KudosCardData;
    vi.mocked(getKudosById).mockResolvedValue(fakeCard);

    const result = await fetchKudosCard("k1");

    expect(getKudosById).toHaveBeenCalledWith(mock.supabase, "k1");
    expect(result).toBe(fakeCard);
  });

  it("returns null when getKudosById returns null", async () => {
    setupMock(AUTHED_USER);
    vi.mocked(getKudosById).mockResolvedValue(null);

    const result = await fetchKudosCard("missing");
    expect(result).toBeNull();
  });
});

describe("refetchHighlight()", () => {
  it("delegates to getHighlightKudos with filters", async () => {
    const mock = setupMock(AUTHED_USER);
    const fakeCards = [{ id: "k1" }] as KudosCardData[];
    vi.mocked(getHighlightKudos).mockResolvedValue(fakeCards);

    const filters: KudosFilters = { hashtag_id: "ht-1" };
    const result = await refetchHighlight(filters);

    expect(getHighlightKudos).toHaveBeenCalledWith(mock.supabase, filters);
    expect(result).toBe(fakeCards);
  });

  it("delegates with undefined filters", async () => {
    const mock = setupMock(AUTHED_USER);
    vi.mocked(getHighlightKudos).mockResolvedValue([]);

    await refetchHighlight(undefined);
    expect(getHighlightKudos).toHaveBeenCalledWith(mock.supabase, undefined);
  });
});

describe("refetchFeed()", () => {
  it("delegates to getAllKudos with cursor + filters, returns its result", async () => {
    const mock = setupMock(AUTHED_USER);
    const fakeResult = { rows: [], nextCursor: null };
    vi.mocked(getAllKudos).mockResolvedValue(fakeResult);

    const cursor = "2026-05-01T00:00:00Z";
    const filters: KudosFilters = { department_code: "ENG" };
    const result = await refetchFeed(cursor, filters);

    expect(getAllKudos).toHaveBeenCalledWith(mock.supabase, cursor, 10, filters);
    expect(result).toBe(fakeResult);
  });

  it("delegates with no cursor or filters", async () => {
    const mock = setupMock(AUTHED_USER);
    vi.mocked(getAllKudos).mockResolvedValue({ rows: [], nextCursor: null });

    await refetchFeed();
    expect(getAllKudos).toHaveBeenCalledWith(mock.supabase, undefined, 10, undefined);
  });
});

// ---------------------------------------------------------------------------
// refetchUserKudos — targetUserId uuid-guard (Phase B1)
// ---------------------------------------------------------------------------

describe("refetchUserKudos()", () => {
  // Canonical v4 uuid for the "other user" feed.
  const VALID_UUID = "11111111-2222-4333-8444-555555555555";

  beforeEach(() => {
    vi.mocked(getUserKudos).mockReset();
    vi.mocked(getUserKudos).mockResolvedValue({ rows: [], nextCursor: null });
  });

  it("returns an empty result and skips getUserKudos when unauthenticated", async () => {
    setupMock(null);
    const res = await refetchUserKudos("received");
    expect(res).toEqual({ rows: [], nextCursor: null });
    expect(getUserKudos).not.toHaveBeenCalled();
  });

  it("uses targetUserId when it is a valid uuid", async () => {
    const mock = setupMock(AUTHED_USER);
    await refetchUserKudos("received", undefined, 2025, VALID_UUID);
    expect(getUserKudos).toHaveBeenCalledWith(mock.supabase, VALID_UUID, "received", {
      cursor: undefined,
      year: 2025,
    });
  });

  it("falls back to the logged-in user.id when targetUserId is undefined", async () => {
    const mock = setupMock(AUTHED_USER);
    await refetchUserKudos("sent", "cursor-1", 2024);
    expect(getUserKudos).toHaveBeenCalledWith(mock.supabase, AUTHED_USER.id, "sent", {
      cursor: "cursor-1",
      year: 2024,
    });
  });

  it("falls back to user.id when targetUserId is not a valid uuid", async () => {
    const mock = setupMock(AUTHED_USER);
    await refetchUserKudos("received", undefined, undefined, "not-a-uuid");
    expect(getUserKudos).toHaveBeenCalledWith(mock.supabase, AUTHED_USER.id, "received", {
      cursor: undefined,
      year: undefined,
    });
  });
});

// ---------------------------------------------------------------------------
// searchSunners
// ---------------------------------------------------------------------------

describe("searchSunners()", () => {
  it("returns [] for empty string without hitting supabase", async () => {
    setupMock(AUTHED_USER);
    const result = await searchSunners("");
    expect(result).toEqual([]);
  });

  it("returns [] for whitespace-only query without hitting supabase", async () => {
    setupMock(AUTHED_USER);
    const result = await searchSunners("   ");
    expect(result).toEqual([]);
  });

  it("maps rows to UserProfile[] with tier=0 and flattened department", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("user_profiles", {
      data: [
        {
          user_id: "u1",
          full_name_vi: "Nguyễn Văn A",
          employee_code: "E001",
          title: "Engineer",
          avatar_url: "https://cdn/avatar.png",
          department_code: "ENG",
          department: { name_vi: "Kỹ thuật" },
        },
        {
          user_id: "u2",
          full_name_vi: null,
          employee_code: null,
          title: null,
          avatar_url: null,
          department_code: null,
          department: null,
        },
      ],
      error: null,
    });

    const result = await searchSunners("nguyen");

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      user_id: "u1",
      full_name_vi: "Nguyễn Văn A",
      department_code: "ENG",
      department_name_vi: "Kỹ thuật",
      employee_code: "E001",
      title: "Engineer",
      avatar_url: "https://cdn/avatar.png",
      tier: 0,
    });
    // null fields fall back to null / ""
    expect(result[1].full_name_vi).toBe("");
    expect(result[1].department_code).toBeNull();
    expect(result[1].department_name_vi).toBeNull();
    expect(result[1].tier).toBe(0);
  });

  it("uses .or() filter with the trimmed search term", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("user_profiles", { data: [], error: null });

    await searchSunners("  chien  ");

    const call = mock.fromCalls.find((c) => c.table === "user_profiles");
    expect(call).toBeDefined();
    const orOp = call!.ops.find((o) => o.method === "or");
    expect(orOp).toBeDefined();
    // term trimmed → "chien"
    expect((orOp!.args[0] as string)).toContain("chien");
  });

  it("returns [] gracefully when supabase returns an error", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("user_profiles", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    const result = await searchSunners("error");
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getNextUnopenedBox
// ---------------------------------------------------------------------------

describe("getNextUnopenedBox()", () => {
  it("returns null when no user session", async () => {
    setupMock(null);
    const result = await getNextUnopenedBox();
    expect(result).toBeNull();
  });

  it("returns { id } of the first unopened box", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("secret_boxes", { data: { id: "box-42" }, error: null });

    const result = await getNextUnopenedBox();
    expect(result).toEqual({ id: "box-42" });

    // verify the query filters
    const call = mock.fromCalls.find((c) => c.table === "secret_boxes");
    expect(call).toBeDefined();
    const ops = call!.ops;

    // eq owner
    const ownerEq = ops.find(
      (o) => o.method === "eq" && o.args[0] === "owner"
    );
    expect(ownerEq?.args[1]).toBe(AUTHED_USER.id);

    // eq status
    const statusEq = ops.find(
      (o) => o.method === "eq" && o.args[0] === "status"
    );
    expect(statusEq?.args[1]).toBe("unopened");

    // order by created_at asc
    const orderOp = ops.find((o) => o.method === "order");
    expect(orderOp?.args[0]).toBe("created_at");
    expect(orderOp?.args[1]).toEqual({ ascending: true });

    // limit 1
    const limitOp = ops.find((o) => o.method === "limit");
    expect(limitOp?.args[0]).toBe(1);
  });

  it("returns null when no unopened boxes exist", async () => {
    const mock = setupMock(AUTHED_USER);
    mock.queueResponse("secret_boxes", { data: null, error: null });

    const result = await getNextUnopenedBox();
    expect(result).toBeNull();
  });
});
