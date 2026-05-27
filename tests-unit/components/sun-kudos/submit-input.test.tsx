import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubmitInput } from "@/app/_components/sun-kudos/submit-input";

describe("<SubmitInput />", () => {
  it("renders default Vietnamese placeholder", () => {
    render(<SubmitInput />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent(/Hôm nay, bạn muốn gửi lời cảm ơn/);
  });

  it("uses custom placeholder", () => {
    render(<SubmitInput placeholder="Custom prompt" />);
    expect(screen.getByRole("button")).toHaveAccessibleName("Custom prompt");
  });

  it("calls onOpenDialog when clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<SubmitInput onOpenDialog={onOpen} />);
    await user.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
