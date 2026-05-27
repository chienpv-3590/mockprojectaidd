import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SunnerSearchInput } from "@/app/_components/sun-kudos/sunner-search-input";

describe("<SunnerSearchInput />", () => {
  it("renders default placeholder", () => {
    render(<SunnerSearchInput />);
    const input = screen.getByPlaceholderText("Tìm kiếm sunner");
    expect(input).toBeInTheDocument();
  });

  it("enforces maxLength=100", () => {
    render(<SunnerSearchInput />);
    const input = screen.getByPlaceholderText("Tìm kiếm sunner");
    expect(input).toHaveAttribute("maxLength", "100");
  });

  it("emits onChange while typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SunnerSearchInput onChange={onChange} />);
    const input = screen.getByPlaceholderText("Tìm kiếm sunner");
    await user.type(input, "abc");
    expect(onChange).toHaveBeenLastCalledWith("abc");
  });

  it("reflects controlled value", () => {
    render(<SunnerSearchInput value="alice" onChange={() => {}} />);
    const input = screen.getByPlaceholderText("Tìm kiếm sunner") as HTMLInputElement;
    expect(input.value).toBe("alice");
  });
});
