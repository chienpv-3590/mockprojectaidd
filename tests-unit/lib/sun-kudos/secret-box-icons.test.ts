import { describe, it, expect } from "vitest";
import {
  SECRET_BOX_ICONS,
  REWARDABLE_ICON_IDS,
  SECRET_BOX_REWARD_WEIGHTS,
  getSecretBoxIcon,
  pickRandomRewardIcon,
} from "@/lib/sun-kudos/secret-box-icons";

describe("SECRET_BOX_ICONS catalog", () => {
  it("has 6 entries, all with artwork", () => {
    expect(SECRET_BOX_ICONS).toHaveLength(6);
    for (const icon of SECRET_BOX_ICONS) {
      expect(icon.src).not.toBeNull();
      expect(icon.label.length).toBeGreaterThan(0);
    }
  });

  it("REWARDABLE_ICON_IDS contains all 6 ids", () => {
    expect(REWARDABLE_ICON_IDS.sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("slot 6 is Revival", () => {
    const slot6 = getSecretBoxIcon(6);
    expect(slot6).not.toBeNull();
    expect(slot6?.label).toBe("Revival");
    expect(slot6?.key).toBe("revival");
  });
});

describe("SECRET_BOX_REWARD_WEIGHTS", () => {
  it("sums to exactly 100", () => {
    const total = SECRET_BOX_REWARD_WEIGHTS.reduce((acc, w) => acc + w.percent, 0);
    expect(total).toBe(100);
  });

  it("matches spec C distribution", () => {
    const map = Object.fromEntries(
      SECRET_BOX_REWARD_WEIGHTS.map((w) => [w.id, w.percent])
    );
    expect(map[4]).toBe(30); // Stay Gold
    expect(map[2]).toBe(25); // Flow to Horizon
    expect(map[1]).toBe(20); // Touch of Light
    expect(map[5]).toBe(10); // Beyond the Boundary
    expect(map[6]).toBe(10); // Revival
    expect(map[3]).toBe(5);  // Root Further
  });
});

describe("pickRandomRewardIcon(rng)", () => {
  /**
   * Cumulative ranges per the spec ordering (Stay Gold first):
   *   [0.00 .. 0.30) → 4 Stay Gold
   *   [0.30 .. 0.55) → 2 Flow to Horizon
   *   [0.55 .. 0.75) → 1 Touch of Light
   *   [0.75 .. 0.85) → 5 Beyond the Boundary
   *   [0.85 .. 0.95) → 6 Revival
   *   [0.95 .. 1.00) → 3 Root Further
   */
  const cases: Array<[number, number, string]> = [
    [0.0,   4, "Stay Gold (start)"],
    [0.299, 4, "Stay Gold (end)"],
    [0.3,   2, "Flow to Horizon (start)"],
    [0.549, 2, "Flow to Horizon (end)"],
    [0.55,  1, "Touch of Light (start)"],
    [0.749, 1, "Touch of Light (end)"],
    [0.75,  5, "Beyond the Boundary (start)"],
    [0.849, 5, "Beyond the Boundary (end)"],
    [0.85,  6, "Revival (start)"],
    [0.949, 6, "Revival (end)"],
    [0.95,  3, "Root Further (start)"],
    [0.999, 3, "Root Further (end)"],
  ];

  for (const [rng, expectedId, label] of cases) {
    it(`rng=${rng} → id ${expectedId} (${label})`, () => {
      const id = pickRandomRewardIcon(() => rng);
      expect(id).toBe(expectedId);
    });
  }

  it("never returns an id outside 1..6 over 1000 calls with Math.random", () => {
    for (let i = 0; i < 1000; i++) {
      const id = pickRandomRewardIcon();
      expect(id).toBeGreaterThanOrEqual(1);
      expect(id).toBeLessThanOrEqual(6);
    }
  });

  it("empirical distribution over 10 000 seeded draws is within ±3 percentage points of spec", () => {
    // Seeded LCG so the test is deterministic. Numerical Recipes parameters.
    let s = 0xC0FFEE;
    const lcg = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0x100000000;
    };
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const N = 10_000;
    for (let i = 0; i < N; i++) counts[pickRandomRewardIcon(lcg)]++;

    const observed = {
      4: (counts[4] / N) * 100,
      2: (counts[2] / N) * 100,
      1: (counts[1] / N) * 100,
      5: (counts[5] / N) * 100,
      6: (counts[6] / N) * 100,
      3: (counts[3] / N) * 100,
    };

    expect(observed[4]).toBeGreaterThan(27); expect(observed[4]).toBeLessThan(33);
    expect(observed[2]).toBeGreaterThan(22); expect(observed[2]).toBeLessThan(28);
    expect(observed[1]).toBeGreaterThan(17); expect(observed[1]).toBeLessThan(23);
    expect(observed[5]).toBeGreaterThan(7);  expect(observed[5]).toBeLessThan(13);
    expect(observed[6]).toBeGreaterThan(7);  expect(observed[6]).toBeLessThan(13);
    expect(observed[3]).toBeGreaterThan(2);  expect(observed[3]).toBeLessThan(8);
  });
});
