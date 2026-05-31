import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HighlightCarousel } from "@/app/_components/sun-kudos/highlight-carousel";
import type { KudosCardData } from "@/app/_components/sun-kudos/types";

// jsdom doesn't implement Element.scrollBy / scrollTo — stub both so the
// carousel's centering effect doesn't throw during render.
beforeAll(() => {
  if (!("scrollBy" in Element.prototype)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Element.prototype as any).scrollBy = function () {};
  }
  if (typeof (Element.prototype as unknown as { scrollTo?: unknown }).scrollTo !== "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Element.prototype as any).scrollTo = function () {};
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
  it("renders n/total pagination text (current page bold-gold, '/total' light)", () => {
    const cards = [buildCard({ id: "a" }), buildCard({ id: "b" }), buildCard({ id: "c" })];
    render(<HighlightCarousel kudos={cards} />);
    // Default activeIndex = floor(3/2) = 1 → "2" + "/3" (split spans).
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("/3")).toBeInTheDocument();
  });

  it("Prev buttons (B.2.1 edge + B.5.1 pagination) both disable at index 0", async () => {
    const user = userEvent.setup();
    const cards = [buildCard({ id: "a" }), buildCard({ id: "b" })];
    render(<HighlightCarousel kudos={cards} />);
    // Default activeIndex = floor(2/2) = 1 → click any prev to go to 0.
    await user.click(screen.getByRole("button", { name: "Trang trước" }));
    // Both the edge arrow (B.2.1) and pagination arrow (B.5.1) must reflect
    // the boundary state.
    expect(screen.getByRole("button", { name: "Slide trước" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Trang trước" })).toBeDisabled();
  });

  it("Next buttons (B.2.2 edge + B.5.3 pagination) both disable at the last slide", () => {
    const cards = [buildCard({ id: "a" }), buildCard({ id: "b" })];
    render(<HighlightCarousel kudos={cards} />);
    // Start at index 1 (floor(2/2)) — already last.
    expect(screen.getByRole("button", { name: "Slide tiếp theo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Trang sau" })).toBeDisabled();
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

  it("no standalone 'Xoá bộ lọc' chip — clearing happens via re-clicking the active dropdown option", () => {
    render(
      <HighlightCarousel kudos={[buildCard()]} selectedDepartmentCode="CEVC1" />
    );
    expect(screen.queryByRole("button", { name: "Xoá bộ lọc" })).not.toBeInTheDocument();
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

  it("renders both nav surfaces — B.2.1/B.2.2 edge arrows + B.5 pagination row — and no dot indicators", () => {
    render(
      <HighlightCarousel
        kudos={[buildCard({ id: "1" }), buildCard({ id: "2" }), buildCard({ id: "3" })]}
      />
    );
    // B.2.1 + B.2.2 — large edge arrows on the dim side cards.
    expect(screen.getByRole("button", { name: "Slide trước" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Slide tiếp theo" })).toBeInTheDocument();
    // B.5.1 + B.5.3 — small pagination arrows.
    expect(screen.getByRole("button", { name: "Trang trước" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang sau" })).toBeInTheDocument();
    // No per-slide dot buttons.
    expect(screen.queryByRole("button", { name: "Slide 1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Slide 3" })).not.toBeInTheDocument();
  });

  it("hides both nav surfaces when only one card is available (no navigation possible)", () => {
    render(<HighlightCarousel kudos={[buildCard()]} />);
    expect(screen.queryByRole("button", { name: "Slide trước" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trang trước" })).not.toBeInTheDocument();
  });
});
