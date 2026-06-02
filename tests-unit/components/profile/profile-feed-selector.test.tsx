import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileFeedSelector } from "@/app/sun-kudos/profile/_components/profile-feed-selector";

describe("<ProfileFeedSelector />", () => {
  const counts = { received: 5, sent: 25 };

  it("shows the active direction with its count on the trigger", () => {
    render(
      <ProfileFeedSelector activeTab="received" counts={counts} onTabChange={() => {}} />
    );
    const trigger = screen.getByTestId("feed-selector");
    expect(trigger).toHaveTextContent("Đã nhận (5)");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("reflects the sent direction and its count", () => {
    render(
      <ProfileFeedSelector activeTab="sent" counts={counts} onTabChange={() => {}} />
    );
    expect(screen.getByTestId("feed-selector")).toHaveTextContent("Đã gửi (25)");
  });

  it("opens the listbox and renders both options with counts", async () => {
    const user = userEvent.setup();
    render(
      <ProfileFeedSelector activeTab="received" counts={counts} onTabChange={() => {}} />
    );

    // Closed initially — no listbox.
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("feed-selector"));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(screen.getByRole("option", { name: "Đã nhận (5)" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("option", { name: "Đã gửi (25)" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("calls onTabChange and closes when an option is picked", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(
      <ProfileFeedSelector activeTab="received" counts={counts} onTabChange={onTabChange} />
    );

    await user.click(screen.getByTestId("feed-selector"));
    await user.click(screen.getByRole("option", { name: "Đã gửi (25)" }));

    expect(onTabChange).toHaveBeenCalledWith("sent");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <ProfileFeedSelector activeTab="received" counts={counts} onTabChange={() => {}} />
    );
    await user.click(screen.getByTestId("feed-selector"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
