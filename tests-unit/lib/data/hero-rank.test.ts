import { describe, it, expect } from "vitest";
import { heroRankFromSenderCount } from "@/lib/data/hero-rank";

describe("heroRankFromSenderCount", () => {
  it("returns null when nobody has sent a kudos", () => {
    expect(heroRankFromSenderCount(0)).toBeNull();
    expect(heroRankFromSenderCount(-3)).toBeNull();
  });

  it("New Hero for 1–4 distinct senders", () => {
    expect(heroRankFromSenderCount(1)).toBe("New Hero");
    expect(heroRankFromSenderCount(4)).toBe("New Hero");
  });

  it("Rising Hero for 5–9 distinct senders", () => {
    expect(heroRankFromSenderCount(5)).toBe("Rising Hero");
    expect(heroRankFromSenderCount(9)).toBe("Rising Hero");
  });

  it("Super Hero for 10–20 distinct senders", () => {
    expect(heroRankFromSenderCount(10)).toBe("Super Hero");
    expect(heroRankFromSenderCount(20)).toBe("Super Hero");
  });

  it("Legend Hero for more than 20 distinct senders", () => {
    expect(heroRankFromSenderCount(21)).toBe("Legend Hero");
    expect(heroRankFromSenderCount(100)).toBe("Legend Hero");
  });
});
