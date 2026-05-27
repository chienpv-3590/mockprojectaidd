import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastContainer } from "@/app/_components/sun-kudos/_lib/toast-container";

describe("<ToastContainer />", () => {
  it("renders nothing when toasts is empty", () => {
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders each toast with correct message", () => {
    render(
      <ToastContainer
        toasts={[
          { id: "1", message: "Hi", variant: "success" },
          { id: "2", message: "Boom", variant: "error" },
        ]}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  it("limits to last 4 toasts visible", () => {
    const toasts = Array.from({ length: 6 }, (_, i) => ({
      id: `${i}`,
      message: `m-${i}`,
      variant: "success" as const,
    }));
    render(<ToastContainer toasts={toasts} onDismiss={() => {}} />);
    expect(screen.queryByText("m-0")).not.toBeInTheDocument();
    expect(screen.queryByText("m-1")).not.toBeInTheDocument();
    expect(screen.getByText("m-2")).toBeInTheDocument();
    expect(screen.getByText("m-5")).toBeInTheDocument();
  });

  it("close button calls onDismiss with id", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <ToastContainer
        toasts={[{ id: "abc", message: "x", variant: "success" }]}
        onDismiss={onDismiss}
      />
    );
    await user.click(screen.getByRole("button", { name: "Đóng thông báo" }));
    expect(onDismiss).toHaveBeenCalledWith("abc");
  });

  it("uses role='status' for each toast (aria-live polite via container)", () => {
    render(
      <ToastContainer
        toasts={[{ id: "1", message: "hi", variant: "success" }]}
        onDismiss={() => {}}
      />
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
