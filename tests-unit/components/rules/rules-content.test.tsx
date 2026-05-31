import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { RulesContent } from "@/app/_components/rules/rules-content";
import { RULES_BADGE_SRC } from "@/app/_components/rules/rules-hero-tiers";
import { RULES_ICON_SRC } from "@/app/_components/rules/rules-secret-icons";
import viDict from "@/lib/i18n/dictionaries/vi.json";
import enDict from "@/lib/i18n/dictionaries/en.json";

/**
 * Contract tests for the Thể lệ drawer body. Doubles as a drift guard:
 * if the dict ever changes shape (e.g. fewer tiers or different icon
 * labels), these tests fail at compile or assertion time.
 */
describe("<RulesContent />", () => {
  it("renders all three section headings from the VI dict", () => {
    render(<RulesContent rules={viDict.rules} />);
    expect(
      screen.getByRole("heading", { level: 3, name: viDict.rules.receivers.heading })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: viDict.rules.senders.heading })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: viDict.rules.national.heading })
    ).toBeInTheDocument();
  });

  it("renders exactly 4 hero-tier rows (drift guard)", () => {
    const { container } = render(<RulesContent rules={viDict.rules} />);
    // The hero tiers list is the first <ul> in the document (icon grid is
    // a sibling <ul> inside a different section).
    const lists = container.querySelectorAll("ul");
    expect(lists.length).toBeGreaterThan(0);
    const heroList = lists[0]!;
    const items = within(heroList).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    // First tier text matches dict.
    expect(items[0]).toHaveTextContent(viDict.rules.receivers.tiers[0].range);
  });

  it("renders exactly 6 secret-box icons (drift guard)", () => {
    const { container } = render(<RulesContent rules={viDict.rules} />);
    const lists = container.querySelectorAll("ul");
    // Second ul is the secret-icon grid.
    const iconList = lists[1]!;
    const items = within(iconList).getAllByRole("listitem");
    expect(items).toHaveLength(6);
  });

  it("badge keys present in dict map to real `RULES_BADGE_SRC` entries", () => {
    for (const tier of viDict.rules.receivers.tiers) {
      expect(
        RULES_BADGE_SRC[tier.badgeKey],
        `Missing badge file for badgeKey="${tier.badgeKey}"`
      ).toMatch(/\/hero-badges\//);
    }
  });

  it("every icon label in dict resolves to a real `RULES_ICON_SRC` entry", () => {
    for (const label of viDict.rules.senders.iconLabels) {
      expect(
        RULES_ICON_SRC[label],
        `Missing icon file for label="${label}"`
      ).toMatch(/\/secret-box-icons\//);
    }
  });

  it("is locale-agnostic — renders EN dict with the same shape (4 tiers + 6 icons)", () => {
    const { container } = render(<RulesContent rules={enDict.rules} />);
    expect(
      screen.getByRole("heading", { level: 3, name: enDict.rules.receivers.heading })
    ).toBeInTheDocument();
    const lists = container.querySelectorAll("ul");
    expect(within(lists[0]!).getAllByRole("listitem")).toHaveLength(4);
    expect(within(lists[1]!).getAllByRole("listitem")).toHaveLength(6);
  });
});
