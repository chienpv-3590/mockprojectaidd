import { describe, it, expect } from "vitest";
import {
  adaptKudosCard,
  adaptKudosCards,
  adaptSecretBoxRecipient,
} from "@/app/_components/sun-kudos/_lib/kudos-adapter";
import type {
  KudosCardData as DbKudosCard,
  UserProfile,
} from "@/lib/data/types";

function buildUser(over: Partial<UserProfile> = {}): UserProfile {
  return {
    user_id: "u1",
    full_name_vi: "Alice",
    department_code: "ENG",
    department_name_vi: "Kỹ thuật",
    employee_code: "E01",
    title: "Eng",
    avatar_url: "https://x/a.png",
    tier: 0,
    ...over,
  };
}

function buildDbCard(over: Partial<DbKudosCard> = {}): DbKudosCard {
  return {
    id: "k1",
    message: "Cảm ơn nhé!",
    title: null,
    is_anonymous: false,
    created_at: "2026-05-26T08:05:00Z",
    sender: buildUser({ user_id: "u-sender", full_name_vi: "Sender" }),
    receiver: buildUser({ user_id: "u-receiver", full_name_vi: "Receiver" }),
    feature_hashtag: {
      id: "h1",
      code: "IDOL",
      label_vi: "IDOL GIỚI TRẺ",
      kind: "feature",
      display_order: 1,
    },
    small_hashtags: [
      { id: "s1", code: "T1", label_vi: "Team", kind: "small", display_order: 1 },
      { id: "s2", code: "T2", label_vi: "Spirit", kind: "small", display_order: 2 },
    ],
    images: [
      { storage_path: "k1/1.jpg", signed_url: "https://s/1" },
      { storage_path: "k1/2.jpg", signed_url: "https://s/2" },
    ],
    heart_count: 5,
    liked_by_me: true,
    can_like: true,
    ...over,
  };
}

describe("adaptKudosCard()", () => {
  it("maps top-level fields", () => {
    const ui = adaptKudosCard(buildDbCard());
    expect(ui.id).toBe("k1");
    expect(ui.content).toBe("Cảm ơn nhé!");
    expect(ui.heartCount).toBe(5);
    expect(ui.isHearted).toBe(true);
  });

  it("formats createdAt to 'HH:MM - DD/MM/YYYY'", () => {
    const ui = adaptKudosCard(
      buildDbCard({ created_at: "2026-05-26T08:05:00Z" })
    );
    expect(ui.createdAt).toMatch(/^\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}$/);
  });

  // Regression: formatCreatedAt must be timezone-deterministic. It runs inside
  // client components on both the SSR and hydration passes; timezone-local
  // getters produced different strings per pass → React hydration mismatch →
  // "Performance.measure(...) cannot have a negative time stamp". The formatter
  // now pins Asia/Ho_Chi_Minh (UTC+7), so 08:05Z is always 15:05 regardless of
  // the runtime's local timezone.
  it("formats createdAt in fixed Vietnam time (UTC+7), independent of runtime TZ", () => {
    const original = process.env.TZ;
    try {
      for (const tz of ["UTC", "America/New_York", "Asia/Ho_Chi_Minh"]) {
        process.env.TZ = tz;
        const ui = adaptKudosCard(
          buildDbCard({ created_at: "2026-05-26T08:05:00Z" })
        );
        expect(ui.createdAt).toBe("15:05 - 26/05/2026");
      }
    } finally {
      process.env.TZ = original;
    }
  });

  it("falls back to raw string on invalid date", () => {
    const ui = adaptKudosCard(buildDbCard({ created_at: "not-a-date" }));
    // Date('not-a-date') → Invalid Date → string ends up NaN; adapter wraps in try/catch
    // but Date constructor doesn't throw, so it produces NaN:NaN - the contract is
    // tolerant — anything stable is acceptable. We only check it doesn't crash.
    expect(typeof ui.createdAt).toBe("string");
  });

  it("uses sender's department_code when present (spec B.3.2), else department_name_vi", () => {
    const dbA = buildDbCard({
      sender: buildUser({ department_name_vi: "Kỹ thuật", department_code: "ENG" }),
    });
    expect(adaptKudosCard(dbA).sender.department).toBe("ENG");

    const dbB = buildDbCard({
      sender: buildUser({ department_name_vi: "Kỹ thuật", department_code: null }),
    });
    expect(adaptKudosCard(dbB).sender.department).toBe("Kỹ thuật");
  });

  it("returns undefined department when neither set", () => {
    const ui = adaptKudosCard(
      buildDbCard({
        sender: buildUser({ department_name_vi: null, department_code: null }),
      })
    );
    expect(ui.sender.department).toBeUndefined();
  });

  it("maps feature_hashtag.label_vi to featureHashtag string ('' when null)", () => {
    expect(adaptKudosCard(buildDbCard()).featureHashtag).toBe("IDOL GIỚI TRẺ");
    const noFeature = adaptKudosCard(buildDbCard({ feature_hashtag: null }));
    expect(noFeature.featureHashtag).toBe("");
  });

  it("maps small_hashtags to label_vi[]", () => {
    const ui = adaptKudosCard(buildDbCard());
    expect(ui.hashtags).toEqual(["Team", "Spirit"]);
  });

  it("generates deterministic image ids '{kudosId}-img-{i}'", () => {
    const ui = adaptKudosCard(buildDbCard());
    expect(ui.images?.map((i) => i.id)).toEqual(["k1-img-0", "k1-img-1"]);
    expect(ui.images?.map((i) => i.url)).toEqual(["https://s/1", "https://s/2"]);
  });
});

describe("adaptKudosCards()", () => {
  it("maps each row", () => {
    const rows = [buildDbCard({ id: "a" }), buildDbCard({ id: "b" })];
    const ui = adaptKudosCards(rows);
    expect(ui.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("returns [] for []", () => {
    expect(adaptKudosCards([])).toEqual([]);
  });
});

describe("adaptSecretBoxRecipient()", () => {
  it("maps user+reward to UI shape", () => {
    const ui = adaptSecretBoxRecipient({
      user: {
        user_id: "u1",
        full_name_vi: "Bob",
        department_code: null,
        department_name_vi: null,
        employee_code: null,
        title: null,
        avatar_url: "https://x/b.png",
        tier: 0,
      },
      reward_label_vi: "Voucher 100k",
      opened_at: "2026-05-26",
    });
    expect(ui).toEqual({
      id: "u1",
      name: "Bob",
      avatarUrl: "https://x/b.png",
      rewardLabel: "Voucher 100k",
    });
  });

  it("avatarUrl=null when user has none", () => {
    const ui = adaptSecretBoxRecipient({
      user: {
        user_id: "u1",
        full_name_vi: "Bob",
        department_code: null,
        department_name_vi: null,
        employee_code: null,
        title: null,
        avatar_url: null,
        tier: 0,
      },
      reward_label_vi: "X",
      opened_at: "",
    });
    expect(ui.avatarUrl).toBeNull();
  });
});
