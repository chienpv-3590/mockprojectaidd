import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HighlightCarousel } from "@/app/_components/sun-kudos/highlight-carousel";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

// jsdom doesn't implement Element.scrollBy — stub it for carousel scroll calls.
beforeAll(() => {
  if (!("scrollBy" in Element.prototype)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Element.prototype as any).scrollBy = function () {};
  }
});

function buildCard(over: Partial<KudosCardData> = {}): KudosCardData {
  return {
    id: "k1",
    sender: { id: "s", name: "S" },
    receiver: { id: "r", name: "R" },
    featureHashtag: "F",
    hashtags: [],
    content: "msg",
    createdAt: "now",
    heartCount: 0,
    isHearted: false,
    ...over,
  };
}

describe("<HighlightCarousel />", () => {
  it("renders n/total pagination text", () => {
    const cards = [buildCard({ id: "a" }), buildCard({ id: "b" }), buildCard({ id: "c" })];
    render(<HighlightCarousel kudos={cards} />);
    // Default activeIndex = floor(3/2) = 1 → "2/3"
    expect(screen.getByText("2/3")).toBeInTheDocument();
  });

  it("Prev button disabled at index 0", async () => {
    const user = userEvent.setup();
    const cards = [buildCard({ id: "a" }), buildCard({ id: "b" })];
    render(<HighlightCarousel kudos={cards} />);
    // Default activeIndex = floor(2/2) = 1 → click prev to go to 0
    await user.click(screen.getByRole("button", { name: "Slide trước" }));
    expect(screen.getByRole("button", { name: "Slide trước" })).toBeDisabled();
  });

  it("Next button disabled when at last slide", async () => {
    const user = userEvent.setup();
    const cards = [buildCard({ id: "a" }), buildCard({ id: "b" })];
    render(<HighlightCarousel kudos={cards} />);
    // Start at index 1 (floor(2/2)) — already last
    expect(screen.getByRole("button", { name: "Slide tiếp theo" })).toBeDisabled();
  });

  it("opens the Phòng ban dropdown and fires onSelectDepartment on choice", async () => {
    const user = userEvent.setup();
    const onSelectDepartment = vi.fn();
    render(
      <HighlightCarousel
        kudos={[buildCard()]}
        departments={[
          { code: "CEVC1", name_vi: "CEVC1", display_order: 1 },
          { code: "OPD", name_vi: "OPD", display_order: 2 },
        ]}
        onSelectDepartment={onSelectDepartment}
      />
    );
    // Closed initially → option not in the DOM.
    expect(screen.queryByRole("option", { name: "OPD" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Phòng ban/ }));
    await user.click(screen.getByRole("button", { name: "OPD" }));

    expect(onSelectDepartment).toHaveBeenCalledWith("OPD");
  });

  it("opens the Hashtag dropdown and fires onSelectHashtag with the option id", async () => {
    const user = userEvent.setup();
    const onSelectHashtag = vi.fn();
    render(
      <HighlightCarousel
        kudos={[buildCard()]}
        hashtags={[
          { id: "h-1", code: "cong-hien", label_vi: "Cống hiến", kind: "small", display_order: 1 },
        ]}
        onSelectHashtag={onSelectHashtag}
      />
    );
    await user.click(screen.getByRole("button", { name: /Hashtag/ }));
    await user.click(screen.getByRole("button", { name: "#Cống hiến" }));

    expect(onSelectHashtag).toHaveBeenCalledWith("h-1");
  });

  it("clear-filter button is disabled with no active filter, enabled with one", () => {
    const { rerender } = render(<HighlightCarousel kudos={[buildCard()]} />);
    expect(screen.getByRole("button", { name: "Xoá bộ lọc" })).toBeDisabled();

    rerender(
      <HighlightCarousel kudos={[buildCard()]} selectedDepartmentCode="CEVC1" />
    );
    expect(screen.getByRole("button", { name: "Xoá bộ lọc" })).toBeEnabled();
  });

  it("clear-filter button fires onClearFilters", async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    render(
      <HighlightCarousel
        kudos={[buildCard()]}
        selectedHashtagId="h-1"
        onClearFilters={onClearFilters}
      />
    );
    await user.click(screen.getByRole("button", { name: "Xoá bộ lọc" }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("selected hashtag button shows only the value, not 'Hashtag: …'", () => {
    render(
      <HighlightCarousel
        kudos={[buildCard()]}
        hashtags={[
          { id: "h-1", code: "truyen-cam-hung", label_vi: "Truyền cảm hứng", kind: "small", display_order: 1 },
        ]}
        selectedHashtagId="h-1"
      />
    );
    // Visible label collapses to just "#Truyền cảm hứng".
    expect(screen.getByText("#Truyền cảm hứng")).toBeInTheDocument();
    expect(screen.queryByText("Hashtag: #Truyền cảm hứng")).not.toBeInTheDocument();
    // Filter context is preserved for screen readers via aria-label.
    expect(
      screen.getByRole("button", { name: "Hashtag: #Truyền cảm hứng" })
    ).toBeInTheDocument();
  });

  it("renders 'HIGHLIGHT KUDOS' h2", () => {
    render(<HighlightCarousel kudos={[buildCard()]} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "HIGHLIGHT KUDOS" })
    ).toBeInTheDocument();
  });

  it("dot button per card", () => {
    render(
      <HighlightCarousel
        kudos={[buildCard({ id: "1" }), buildCard({ id: "2" }), buildCard({ id: "3" })]}
      />
    );
    expect(screen.getByRole("button", { name: "Slide 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Slide 2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Slide 3" })).toBeInTheDocument();
  });
});
