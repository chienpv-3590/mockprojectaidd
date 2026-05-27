import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  normalizeRow,
  type RawKudosRow,
} from "@/lib/data/kudos-feed-normalizer";
import { createSupabaseMock } from "../../_helpers/supabase-mock";

function buildRow(overrides: Partial<RawKudosRow> = {}): RawKudosRow {
  return {
    id: "k1",
    message: "Cảm ơn bạn!",
    created_at: "2026-05-26T08:00:00Z",
    from_user: "u-sender",
    to_user: "u-receiver",
    sender: {
      user_id: "u-sender",
      full_name_vi: "Sender Name",
      employee_code: "S01",
      title: "Eng",
      avatar_url: "https://x/y.png",
      department: { code: "ENG", name_vi: "Kỹ thuật" },
    },
    receiver: {
      user_id: "u-receiver",
      full_name_vi: "Receiver Name",
      employee_code: "R01",
      title: "PM",
      avatar_url: null,
      department: { code: "PM", name_vi: "Quản lý" },
    },
    feature_hashtag: { id: "h1", code: "IDOL", label_vi: "IDOL", kind: "feature", display_order: 1 },
    small_hashtags: [
      { hashtag: { id: "s1", code: "T1", label_vi: "T1", kind: "small", display_order: 1 } },
      { hashtag: null },
    ],
    images: [
      { storage_path: "kudos/k1/2.jpg", display_order: 2 },
      { storage_path: "kudos/k1/1.jpg", display_order: 1 },
    ],
    hearts: [
      { weight: 1, user_id: "u-other" },
      { weight: 2, user_id: "u-viewer" },
    ],
    ...overrides,
  };
}

describe("normalizeRow()", () => {
  it("computes heart_count by summing weights", async () => {
    const { supabase } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow(),
      null
    );
    expect(result.heart_count).toBe(3);
  });

  it("liked_by_me=false when no auth user", async () => {
    const { supabase } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow(),
      null
    );
    expect(result.liked_by_me).toBe(false);
    expect(result.can_like).toBe(false);
  });

  it("liked_by_me=true when viewer hearted", async () => {
    const { supabase } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow(),
      "u-viewer"
    );
    expect(result.liked_by_me).toBe(true);
  });

  it("can_like=false when viewer is the sender", async () => {
    const { supabase } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow(),
      "u-sender"
    );
    expect(result.can_like).toBe(false);
  });

  it("can_like=true when viewer is third party", async () => {
    const { supabase } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow(),
      "u-third"
    );
    expect(result.can_like).toBe(true);
  });

  it("sorts images by display_order then signs them", async () => {
    const { supabase, storageCalls } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow(),
      null
    );
    expect(result.images.map((i) => i.storage_path)).toEqual([
      "kudos/k1/1.jpg",
      "kudos/k1/2.jpg",
    ]);
    expect(result.images.every((i) => i.signed_url.startsWith("signed://"))).toBe(true);
    expect(
      storageCalls.some(
        (c) => c.bucket === "kudos-images" && c.method === "createSignedUrls"
      )
    ).toBe(true);
  });

  it("skips signing when no images", async () => {
    const { supabase, storageCalls } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow({ images: [] }),
      null
    );
    expect(result.images).toEqual([]);
    expect(storageCalls.length).toBe(0);
  });

  it("filters out null small_hashtags", async () => {
    const { supabase } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow(),
      null
    );
    expect(result.small_hashtags).toHaveLength(1);
    expect(result.small_hashtags[0].code).toBe("T1");
  });

  it("falls back to from_user/to_user when nested profile missing", async () => {
    const { supabase } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow({ sender: null, receiver: null }),
      null
    );
    expect(result.sender.user_id).toBe("u-sender");
    expect(result.sender.full_name_vi).toBe("");
    expect(result.receiver.user_id).toBe("u-receiver");
  });

  it("propagates department code + name", async () => {
    const { supabase } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow(),
      null
    );
    expect(result.sender.department_code).toBe("ENG");
    expect(result.sender.department_name_vi).toBe("Kỹ thuật");
    expect(result.receiver.department_code).toBe("PM");
  });

  it("falls back to raw department_code when the departments join is absent", async () => {
    const { supabase } = createSupabaseMock();
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow({
        sender: {
          user_id: "u-sender",
          full_name_vi: "Sender Name",
          employee_code: "S01",
          title: "Eng",
          avatar_url: null,
          department: null,
          department_code: "CEVC10",
        },
      }),
      null
    );
    expect(result.sender.department_code).toBe("CEVC10");
  });

  it("handles missing hearts array", async () => {
    const { supabase } = createSupabaseMock();
    // Cast through unknown because RawKudosRow requires hearts; production code defends with ??.
    const result = await normalizeRow(
      supabase as unknown as SupabaseClient,
      buildRow({ hearts: undefined as unknown as RawKudosRow["hearts"] }),
      "u-viewer"
    );
    expect(result.heart_count).toBe(0);
    expect(result.liked_by_me).toBe(false);
  });
});
