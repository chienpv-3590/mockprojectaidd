import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SunnerSearchInput } from "@/app/_components/sun-kudos/sunner-search-input";
import type { UserProfile } from "@/lib/data/types";

function buildUser(over: Partial<UserProfile> = {}): UserProfile {
  return {
    user_id: "u1",
    full_name_vi: "Nguyễn Văn A",
    department_code: "CEVC1",
    department_name_vi: "CEVC1 Team",
    employee_code: "SUN001",
    title: "Engineer",
    avatar_url: null,
    tier: 0,
    ...over,
  };
}

describe("<SunnerSearchInput />", () => {
  const noop = async () => [];

  it("renders default placeholder", () => {
    render(<SunnerSearchInput onSearch={noop} onSelect={() => {}} />);
    expect(screen.getByPlaceholderText("Tìm kiếm sunner")).toBeInTheDocument();
  });

  it("enforces maxLength=100", () => {
    render(<SunnerSearchInput onSearch={noop} onSelect={() => {}} />);
    expect(screen.getByPlaceholderText("Tìm kiếm sunner")).toHaveAttribute("maxLength", "100");
  });

  it("runs a debounced search and shows matching Sunners", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn(async () => [buildUser({ full_name_vi: "Nguyễn Văn A" })]);
    render(<SunnerSearchInput onSearch={onSearch} onSelect={() => {}} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm sunner"), "Nguyen");

    await waitFor(() => expect(onSearch).toHaveBeenCalledWith("Nguyen"));
    expect(await screen.findByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("CEVC1 Team")).toBeInTheDocument();
  });

  it("calls onSelect with the picked Sunner and clears the input", async () => {
    const user = userEvent.setup();
    const picked = buildUser({ user_id: "u-2", full_name_vi: "Trần Thị B" });
    const onSelect = vi.fn();
    render(
      <SunnerSearchInput onSearch={async () => [picked]} onSelect={onSelect} />
    );

    const input = screen.getByPlaceholderText("Tìm kiếm sunner") as HTMLInputElement;
    await user.type(input, "Tran");
    await user.click(await screen.findByText("Trần Thị B"));

    expect(onSelect).toHaveBeenCalledWith(picked);
    expect(input.value).toBe("");
  });

  it("shows an empty-state message when no Sunner matches", async () => {
    const user = userEvent.setup();
    render(<SunnerSearchInput onSearch={async () => []} onSelect={() => {}} />);
    await user.type(screen.getByPlaceholderText("Tìm kiếm sunner"), "zzz");
    expect(await screen.findByText("Không tìm thấy Sunner")).toBeInTheDocument();
  });
});
