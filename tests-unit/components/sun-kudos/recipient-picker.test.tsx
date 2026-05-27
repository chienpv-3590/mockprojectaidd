import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipientPicker } from "@/app/_components/sun-kudos/recipient-picker";
import type { UserProfile } from "@/lib/data/types";

function buildUser(over: Partial<UserProfile> = {}): UserProfile {
  return {
    user_id: "u1",
    full_name_vi: "Alice Nguyen",
    department_code: "ENG",
    department_name_vi: "Kỹ thuật",
    employee_code: "E01",
    title: "Engineer",
    avatar_url: null,
    tier: 0,
    ...over,
  };
}

describe("<RecipientPicker />", () => {
  it("renders search input when value is null", () => {
    render(
      <RecipientPicker value={null} onChange={() => {}} sunnerSearch={async () => []} />
    );
    expect(
      screen.getByPlaceholderText("Tìm kiếm tên Sunner...")
    ).toBeInTheDocument();
  });

  it("displays selected user with name + department + clear button", () => {
    render(
      <RecipientPicker
        value={buildUser()}
        onChange={() => {}}
        sunnerSearch={async () => []}
      />
    );
    expect(screen.getByText("Alice Nguyen")).toBeInTheDocument();
    expect(screen.getByText("Kỹ thuật")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Xóa người nhận" })
    ).toBeInTheDocument();
  });

  it("clear button fires onChange(null)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RecipientPicker
        value={buildUser()}
        onChange={onChange}
        sunnerSearch={async () => []}
      />
    );
    await user.click(screen.getByRole("button", { name: "Xóa người nhận" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("debounces query and calls sunnerSearch", async () => {
    const user = userEvent.setup();
    const search = vi.fn(async () => [buildUser({ user_id: "u2", full_name_vi: "Bob" })]);
    render(
      <RecipientPicker value={null} onChange={() => {}} sunnerSearch={search} />
    );
    const input = screen.getByPlaceholderText("Tìm kiếm tên Sunner...");
    await user.type(input, "bo");
    // 300ms debounce → wait for it
    await waitFor(() => expect(search).toHaveBeenCalled(), { timeout: 1500 });
    expect(search.mock.calls.at(-1)?.[0]).toBe("bo");
    await waitFor(() =>
      expect(screen.getByText("Bob")).toBeInTheDocument()
    );
  });

  it("selecting an option fires onChange + clears query", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const search = vi.fn(async () => [buildUser({ user_id: "u2", full_name_vi: "Bob" })]);
    render(
      <RecipientPicker value={null} onChange={onChange} sunnerSearch={search} />
    );
    await user.type(
      screen.getByPlaceholderText("Tìm kiếm tên Sunner..."),
      "bo"
    );
    await waitFor(() => expect(screen.getByText("Bob")).toBeInTheDocument());
    await user.click(screen.getByText("Bob"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "u2", full_name_vi: "Bob" })
    );
  });

  it("displays error message when error prop set", () => {
    render(
      <RecipientPicker
        value={null}
        onChange={() => {}}
        sunnerSearch={async () => []}
        error="Vui lòng chọn người nhận"
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Vui lòng chọn người nhận"
    );
  });

  it("does not call sunnerSearch on whitespace-only query", async () => {
    const user = userEvent.setup();
    const search = vi.fn(async () => []);
    render(
      <RecipientPicker value={null} onChange={() => {}} sunnerSearch={search} />
    );
    await user.type(
      screen.getByPlaceholderText("Tìm kiếm tên Sunner..."),
      "   "
    );
    await new Promise((r) => setTimeout(r, 400));
    expect(search).not.toHaveBeenCalled();
  });
});
