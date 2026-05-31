import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { StandardsContent } from "@/app/_components/standards/standards-content";
import vi from "@/lib/i18n/dictionaries/vi.json";
import en from "@/lib/i18n/dictionaries/en.json";

/**
 * Tests the General Standards content block against the live dictionary
 * slices. Doubles as a contract test: if the dict shape drifts, these
 * fail at compile or assertion time.
 */
describe("<StandardsContent />", () => {
  it("renders community + security titles, intro, warning, lead, and support from the VI dict", () => {
    const { community, security } = vi.standards;
    render(<StandardsContent community={community} security={security} />);

    expect(
      screen.getByRole("heading", { level: 2, name: community.title })
    ).toBeInTheDocument();
    expect(screen.getByText(community.intro)).toBeInTheDocument();
    expect(screen.getByText(community.warning)).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { level: 2, name: security.title })
    ).toBeInTheDocument();
    expect(screen.getByText(security.lead)).toBeInTheDocument();
    expect(screen.getByText(security.support)).toBeInTheDocument();
  });

  it("renders exactly 10 community-criteria list items (guards against MoMorph drift)", () => {
    const { community, security } = vi.standards;
    render(<StandardsContent community={community} security={security} />);

    // The community block is the only <ol>; query inside it to avoid
    // counting the security <ul>'s items.
    const communityHeading = screen.getByRole("heading", {
      level: 2,
      name: community.title,
    });
    const communityList = communityHeading.parentElement!.querySelector("ol");
    expect(communityList).not.toBeNull();
    const items = within(communityList as HTMLElement).getAllByRole("listitem");
    expect(items).toHaveLength(10);
    expect(items[0]).toHaveTextContent(community.criteria[0]);
    expect(items[9]).toHaveTextContent(community.criteria[9]);
  });

  it("renders the security info/sharing labels followed by their texts", () => {
    const { community, security } = vi.standards;
    render(<StandardsContent community={community} security={security} />);

    // Both labels render inside <li>'s of the security <ul>.
    const infoLabel = screen.getByText(`${security.infoSecurity.label}:`);
    const scopeLabel = screen.getByText(`${security.sharingScope.label}:`);
    expect(infoLabel.tagName.toLowerCase()).toBe("span");
    expect(scopeLabel.tagName.toLowerCase()).toBe("span");
    expect(screen.getByText(new RegExp(security.infoSecurity.text))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(security.sharingScope.text))).toBeInTheDocument();
  });

  it("is locale-agnostic — renders the EN slice the same way", () => {
    const { community, security } = en.standards;
    render(<StandardsContent community={community} security={security} />);

    expect(
      screen.getByRole("heading", { level: 2, name: community.title })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: security.title })
    ).toBeInTheDocument();
    // Same shape contract: still 10 criteria in EN.
    const communityHeading = screen.getByRole("heading", {
      level: 2,
      name: community.title,
    });
    const communityList = communityHeading.parentElement!.querySelector("ol");
    expect(
      within(communityList as HTMLElement).getAllByRole("listitem")
    ).toHaveLength(10);
  });
});
