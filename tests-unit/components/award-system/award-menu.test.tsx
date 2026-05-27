import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AwardMenu } from "@/app/_components/award-system/award-menu";
import type { Award } from "@/lib/data/types";

// IntersectionObserver is not implemented in jsdom — provide a no-op stub.
beforeEach(() => {
  // @ts-ignore
  global.IntersectionObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(_cb: unknown) {}
  };

  // scrollIntoView is not implemented in jsdom.
  Element.prototype.scrollIntoView = vi.fn();
});

function buildAward(over: Partial<Award> = {}): Award {
  return {
    id: "1",
    code: "top-talent",
    title_vi: "Top Talent",
    description_vi: "",
    thumbnail_path: null,
    display_order: 1,
    long_description_vi: null,
    quantity_text: null,
    unit_text: null,
    value_text: null,
    value_breakdown: null,
    ...over,
  };
}

const AWARDS: Award[] = [
  buildAward({ id: "1", code: "top-talent", title_vi: "Top Talent", display_order: 1 }),
  buildAward({ id: "2", code: "top-project", title_vi: "Top Project", display_order: 2 }),
  buildAward({ id: "3", code: "best-manager", title_vi: "Best Manager", display_order: 3 }),
];

describe("<AwardMenu />", () => {
  it("renders a nav with aria-label 'Danh mục giải thưởng'", () => {
    render(<AwardMenu awards={AWARDS} />);
    expect(screen.getByRole("navigation", { name: "Danh mục giải thưởng" })).toBeInTheDocument();
  });

  it("renders one link per award entry", () => {
    render(<AwardMenu awards={AWARDS} />);
    // Two <ul> elements exist (mobile + desktop), each with one <a> per award.
    // Use getAllByRole to count all links with each title.
    const topTalentLinks = screen.getAllByRole("link", { name: /Top Talent/i });
    expect(topTalentLinks.length).toBeGreaterThanOrEqual(1);
    const topProjectLinks = screen.getAllByRole("link", { name: /Top Project/i });
    expect(topProjectLinks.length).toBeGreaterThanOrEqual(1);
    const bestManagerLinks = screen.getAllByRole("link", { name: /Best Manager/i });
    expect(bestManagerLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("each link href points to the award code anchor", () => {
    render(<AwardMenu awards={AWARDS} />);
    const links = screen.getAllByRole("link", { name: /Top Talent/i });
    links.forEach((link) => expect(link).toHaveAttribute("href", "#top-talent"));
  });

  it("first award is active by default (aria-current='true')", () => {
    render(<AwardMenu awards={AWARDS} />);
    const activeLinks = screen.getAllByRole("link", { name: /Top Talent/i });
    // At least one of the duplicates should carry aria-current
    const withCurrent = activeLinks.filter((l) => l.getAttribute("aria-current") === "true");
    expect(withCurrent.length).toBeGreaterThan(0);
  });

  it("non-first awards do not have aria-current on initial render", () => {
    render(<AwardMenu awards={AWARDS} />);
    const projectLinks = screen.getAllByRole("link", { name: /Top Project/i });
    projectLinks.forEach((l) => expect(l).not.toHaveAttribute("aria-current"));
  });

  it("clicking a menu link sets that award as active (aria-current='true')", async () => {
    const user = userEvent.setup();

    // Create a real DOM element so handleClick can find it via getElementById.
    const target = document.createElement("div");
    target.id = "top-project";
    document.body.appendChild(target);

    render(<AwardMenu awards={AWARDS} />);

    const projectLinks = screen.getAllByRole("link", { name: /Top Project/i });
    // Click the first one (mobile or desktop — both should work).
    await user.click(projectLinks[0]);

    const updatedLinks = screen.getAllByRole("link", { name: /Top Project/i });
    const withCurrent = updatedLinks.filter((l) => l.getAttribute("aria-current") === "true");
    expect(withCurrent.length).toBeGreaterThan(0);

    document.body.removeChild(target);
  });

  it("clicking a link for a missing DOM target is a silent no-op (does not throw)", async () => {
    const user = userEvent.setup();
    // Deliberately do NOT add a #best-manager element to the DOM.
    render(<AwardMenu awards={AWARDS} />);
    const links = screen.getAllByRole("link", { name: /Best Manager/i });
    // Should not throw — TC ID-13 silent no-op behaviour.
    await expect(user.click(links[0])).resolves.not.toThrow();
  });

  it("renders empty list when awards prop is empty array", () => {
    const { container } = render(<AwardMenu awards={[]} />);
    const lists = container.querySelectorAll("ul");
    lists.forEach((ul) => expect(ul.children).toHaveLength(0));
  });

  it("shows all award titles as visible text", () => {
    render(<AwardMenu awards={AWARDS} />);
    expect(screen.getAllByText("Top Talent").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Top Project").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Best Manager").length).toBeGreaterThan(0);
  });
});
