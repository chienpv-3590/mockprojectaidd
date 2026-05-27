import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SubmitKudosDialog } from "@/app/_components/sun-kudos/submit-kudos-dialog";
import type { Department, Hashtag, UserProfile } from "@/lib/data/types";

/* ------------------------------------------------------------------ */
/* Fixtures                                                             */
/* ------------------------------------------------------------------ */

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

const DEPARTMENTS: Department[] = [
  { code: "ENG", name_vi: "Kỹ thuật", display_order: 1 },
];

const FEATURE_HASHTAGS: Hashtag[] = [
  { id: "f1", code: "IDOL", label_vi: "Idol Giới Trẻ", kind: "feature", display_order: 1 },
  { id: "f2", code: "SPIRIT", label_vi: "Team Spirit", kind: "feature", display_order: 2 },
];

const SMALL_HASHTAGS: Hashtag[] = [
  { id: "s1", code: "TAG1", label_vi: "Tag 1", kind: "small", display_order: 1 },
  { id: "s2", code: "TAG2", label_vi: "Tag 2", kind: "small", display_order: 2 },
];

/* ------------------------------------------------------------------ */
/* Default prop factory                                                 */
/* ------------------------------------------------------------------ */

function makeProps(over: Partial<Parameters<typeof SubmitKudosDialog>[0]> = {}) {
  return {
    open: true,
    onClose: vi.fn(),
    departments: DEPARTMENTS,
    featureHashtags: FEATURE_HASHTAGS,
    smallHashtags: SMALL_HASHTAGS,
    sunnerSearch: vi.fn().mockResolvedValue([]),
    onUpload: vi.fn().mockResolvedValue("kudos-images/xyz.jpg"),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    ...over,
  };
}

/** Convenience: submit the form directly, bypassing the disabled button. */
function submitForm() {
  fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
}

/* ------------------------------------------------------------------ */
/* Visibility                                                           */
/* ------------------------------------------------------------------ */

describe("<SubmitKudosDialog /> — visibility", () => {
  it("does not render dialog when open=false", () => {
    render(<SubmitKudosDialog {...makeProps({ open: false })} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog when open=true", () => {
    render(<SubmitKudosDialog {...makeProps()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("dialog has aria-modal=true", () => {
    render(<SubmitKudosDialog {...makeProps()} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("dialog is labelled by dialog-title element", () => {
    render(<SubmitKudosDialog {...makeProps()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
    expect(document.getElementById("dialog-title")).toHaveTextContent("Gửi lời cảm ơn");
  });
});

/* ------------------------------------------------------------------ */
/* Reset on close / re-open                                            */
/* ------------------------------------------------------------------ */

describe("<SubmitKudosDialog /> — reset behavior", () => {
  it("clears errors when closed (open transitions from true→false)", async () => {
    const props = makeProps();
    const { rerender } = render(<SubmitKudosDialog {...props} />);

    // Trigger validation errors via fireEvent.submit (Gửi button is disabled on empty form)
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("Vui lòng chọn người nhận.")).toBeInTheDocument()
    );

    // Close then re-open
    rerender(<SubmitKudosDialog {...props} open={false} />);
    rerender(<SubmitKudosDialog {...props} open={true} />);

    expect(screen.queryByText("Vui lòng chọn người nhận.")).not.toBeInTheDocument();
  });

  it("clears message field when closed then re-opened", async () => {
    const user = userEvent.setup();
    const props = makeProps();
    const { rerender } = render(<SubmitKudosDialog {...props} />);

    await user.type(screen.getByRole("textbox", { name: /Lời cảm ơn/i }), "Some message");
    expect(screen.getByRole("textbox", { name: /Lời cảm ơn/i })).toHaveValue("Some message");

    rerender(<SubmitKudosDialog {...props} open={false} />);
    rerender(<SubmitKudosDialog {...props} open={true} />);

    expect(screen.getByRole("textbox", { name: /Lời cảm ơn/i })).toHaveValue("");
  });
});

/* ------------------------------------------------------------------ */
/* Escape key                                                           */
/* ------------------------------------------------------------------ */

describe("<SubmitKudosDialog /> — keyboard", () => {
  it("Escape key calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SubmitKudosDialog {...makeProps({ onClose })} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("removes keydown listener when unmounted", () => {
    const onClose = vi.fn();
    const { unmount } = render(<SubmitKudosDialog {...makeProps({ onClose })} />);
    unmount();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/* Overlay click                                                        */
/* ------------------------------------------------------------------ */

describe("<SubmitKudosDialog /> — overlay", () => {
  it("clicking the backdrop overlay calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SubmitKudosDialog {...makeProps({ onClose })} />);
    const backdrop = screen.getByRole("presentation");
    await user.pointer({ target: backdrop, keys: "[MouseLeft]" });
    expect(onClose).toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/* Send button disabled state                                          */
/* ------------------------------------------------------------------ */

describe("<SubmitKudosDialog /> — canSubmit guard", () => {
  it("send button is disabled when all fields are empty", () => {
    render(<SubmitKudosDialog {...makeProps()} />);
    expect(screen.getByRole("button", { name: "Gửi" })).toBeDisabled();
  });

  it("send button remains disabled when only recipient + featureHashtag filled (no message)", async () => {
    const user = userEvent.setup();
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);
    render(<SubmitKudosDialog {...makeProps({ sunnerSearch })} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    await user.selectOptions(screen.getByRole("combobox"), "f1");

    // Message is still empty
    expect(screen.getByRole("button", { name: "Gửi" })).toBeDisabled();
  });

  it("send button becomes enabled when recipient + featureHashtag + message all filled", async () => {
    const user = userEvent.setup();
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);
    render(<SubmitKudosDialog {...makeProps({ sunnerSearch })} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    await user.selectOptions(screen.getByRole("combobox"), "f1");
    await user.type(screen.getByRole("textbox", { name: /Lời cảm ơn/i }), "Thanks!");

    expect(screen.getByRole("button", { name: "Gửi" })).not.toBeDisabled();
  });
});

/* ------------------------------------------------------------------ */
/* Validation errors                                                    */
/* ------------------------------------------------------------------ */

describe("<SubmitKudosDialog /> — validation", () => {
  it("shows 'Vui lòng chọn người nhận.' when recipient is empty on submit", async () => {
    render(<SubmitKudosDialog {...makeProps()} />);
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("Vui lòng chọn người nhận.")).toBeInTheDocument()
    );
  });

  it("shows 'Vui lòng chọn hạng mục.' when featureHashtag is empty on submit", async () => {
    const user = userEvent.setup();
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);
    render(<SubmitKudosDialog {...makeProps({ sunnerSearch })} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    submitForm();
    await waitFor(() =>
      expect(screen.getByText("Vui lòng chọn hạng mục.")).toBeInTheDocument()
    );
  });

  it("shows 'Lời cảm ơn không được để trống.' when message is blank on submit", async () => {
    const user = userEvent.setup();
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);
    render(<SubmitKudosDialog {...makeProps({ sunnerSearch })} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    await user.selectOptions(screen.getByRole("combobox"), "f1");

    submitForm();
    await waitFor(() =>
      expect(
        screen.getByText("Lời cảm ơn không được để trống.")
      ).toBeInTheDocument()
    );
  });

  it("shows message-too-long error when message exceeds 2000 chars", async () => {
    const user = userEvent.setup();
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);
    render(<SubmitKudosDialog {...makeProps({ sunnerSearch })} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    await user.selectOptions(screen.getByRole("combobox"), "f1");

    // Bypass the textarea's maxLength via fireEvent.change
    fireEvent.change(screen.getByRole("textbox", { name: /Lời cảm ơn/i }), {
      target: { value: "a".repeat(2001) },
    });

    submitForm();
    await waitFor(() =>
      expect(screen.getByText("Lời cảm ơn tối đa 2000 ký tự.")).toBeInTheDocument()
    );
  });

  it("does not call onSubmit when validation fails", async () => {
    const onSubmit = vi.fn();
    render(<SubmitKudosDialog {...makeProps({ onSubmit })} />);
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("Vui lòng chọn người nhận.")).toBeInTheDocument()
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ */
/* Successful submit                                                    */
/* ------------------------------------------------------------------ */

describe("<SubmitKudosDialog /> — successful submit", () => {
  async function setupAndSubmit() {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);

    render(
      <SubmitKudosDialog {...makeProps({ onSubmit, onClose, sunnerSearch })} />
    );

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    await user.selectOptions(screen.getByRole("combobox"), "f1");

    await user.type(
      screen.getByRole("textbox", { name: /Lời cảm ơn/i }),
      "Great work!"
    );

    await user.click(screen.getByRole("button", { name: "Gửi" }));

    return { onSubmit, onClose };
  }

  it("calls onSubmit with the correct payload shape", async () => {
    const { onSubmit } = await setupAndSubmit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      to_user: "u1",
      message: "Great work!",
      feature_hashtag_id: "f1",
      small_hashtag_ids: [],
      image_paths: [],
    });
  });

  it("calls onClose after successful submit", async () => {
    const { onClose } = await setupAndSubmit();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("includes selected small hashtag ids in payload", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);

    render(<SubmitKudosDialog {...makeProps({ onSubmit, sunnerSearch })} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    await user.selectOptions(screen.getByRole("combobox"), "f1");
    await user.click(screen.getByRole("button", { name: "#Tag 1" }));
    await user.click(screen.getByRole("button", { name: "#Tag 2" }));

    await user.type(
      screen.getByRole("textbox", { name: /Lời cảm ơn/i }),
      "Team rocks!"
    );

    await user.click(screen.getByRole("button", { name: "Gửi" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ small_hashtag_ids: ["s1", "s2"] })
    );
  });

  it("shows error message when onSubmit rejects with an Error instance", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("Server error"));
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);

    render(<SubmitKudosDialog {...makeProps({ onSubmit, sunnerSearch })} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    await user.selectOptions(screen.getByRole("combobox"), "f1");
    await user.type(screen.getByRole("textbox", { name: /Lời cảm ơn/i }), "Hello!");

    await user.click(screen.getByRole("button", { name: "Gửi" }));

    await waitFor(() =>
      expect(screen.getByText("Server error")).toBeInTheDocument()
    );
  });

  it("shows fallback error message when onSubmit rejects with a non-Error value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue("boom");
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);

    render(<SubmitKudosDialog {...makeProps({ onSubmit, sunnerSearch })} />);

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    await user.selectOptions(screen.getByRole("combobox"), "f1");
    await user.type(screen.getByRole("textbox", { name: /Lời cảm ơn/i }), "Hello!");

    await user.click(screen.getByRole("button", { name: "Gửi" }));

    await waitFor(() =>
      expect(screen.getByText("Gửi thất bại, vui lòng thử lại.")).toBeInTheDocument()
    );
  });
});

/* ------------------------------------------------------------------ */
/* Image upload                                                         */
/* ------------------------------------------------------------------ */

describe("<SubmitKudosDialog /> — image upload", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn().mockReturnValue("blob:mock-preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  function triggerFileInput(file: File) {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, "files", { value: [file], configurable: true });
    fireEvent.change(fileInput);
  }

  it("calls onUpload with the selected file", async () => {
    const onUpload = vi.fn().mockResolvedValue("kudos-images/xyz.jpg");
    render(<SubmitKudosDialog {...makeProps({ onUpload })} />);

    const file = new File(["img"], "photo.png", { type: "image/png" });
    triggerFileInput(file);

    await waitFor(() => expect(onUpload).toHaveBeenCalledWith(file));
  });

  it("adds a preview image after successful upload", async () => {
    const onUpload = vi.fn().mockResolvedValue("kudos-images/xyz.jpg");
    render(<SubmitKudosDialog {...makeProps({ onUpload })} />);

    triggerFileInput(new File(["img"], "photo.png", { type: "image/png" }));

    await waitFor(() =>
      expect(screen.getByAltText("Ảnh 1")).toBeInTheDocument()
    );
  });

  it("shows upload error when onUpload rejects", async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error("Upload failed"));
    render(<SubmitKudosDialog {...makeProps({ onUpload })} />);

    triggerFileInput(new File(["img"], "photo.png", { type: "image/png" }));

    await waitFor(() =>
      expect(
        screen.getByText("Tải ảnh thất bại, vui lòng thử lại.")
      ).toBeInTheDocument()
    );
  });

  it("uploaded image path is included in onSubmit payload", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockResolvedValue("kudos-images/xyz.jpg");
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const sunnerSearch = vi.fn().mockResolvedValue([buildUser()]);

    render(<SubmitKudosDialog {...makeProps({ onUpload, onSubmit, sunnerSearch })} />);

    triggerFileInput(new File(["img"], "photo.png", { type: "image/png" }));
    await waitFor(() => expect(screen.getByAltText("Ảnh 1")).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText("Tìm kiếm tên Sunner..."), "Alice");
    await waitFor(() => expect(screen.getByText("Alice Nguyen")).toBeInTheDocument());
    await user.click(screen.getByText("Alice Nguyen"));

    await user.selectOptions(screen.getByRole("combobox"), "f1");
    await user.type(screen.getByRole("textbox", { name: /Lời cảm ơn/i }), "With image!");

    await user.click(screen.getByRole("button", { name: "Gửi" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ image_paths: ["kudos-images/xyz.jpg"] })
    );
  });

  it("clicking remove button removes the preview", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn().mockResolvedValue("kudos-images/xyz.jpg");
    render(<SubmitKudosDialog {...makeProps({ onUpload })} />);

    triggerFileInput(new File(["img"], "photo.png", { type: "image/png" }));
    await waitFor(() => expect(screen.getByAltText("Ảnh 1")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Xóa ảnh 1" }));

    expect(screen.queryByAltText("Ảnh 1")).not.toBeInTheDocument();
  });

  it("add button disappears after 5 images are uploaded", async () => {
    const onUpload = vi.fn().mockResolvedValue("kudos-images/xyz.jpg");
    render(<SubmitKudosDialog {...makeProps({ onUpload })} />);

    for (let i = 0; i < 5; i++) {
      triggerFileInput(new File(["img"], `photo${i}.png`, { type: "image/png" }));
      await waitFor(() =>
        expect(screen.queryAllByAltText(/^Ảnh \d+$/)).toHaveLength(i + 1)
      );
    }

    expect(screen.queryByRole("button", { name: "Thêm ảnh" })).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/* smallHashtags conditional rendering                                  */
/* ------------------------------------------------------------------ */

describe("<SubmitKudosDialog /> — conditional rendering", () => {
  it("hides SmallHashtagPicker when smallHashtags array is empty", () => {
    render(<SubmitKudosDialog {...makeProps({ smallHashtags: [] })} />);
    expect(screen.queryByRole("button", { name: /^#/ })).not.toBeInTheDocument();
  });

  it("shows SmallHashtagPicker chips when smallHashtags are provided", () => {
    render(<SubmitKudosDialog {...makeProps()} />);
    expect(screen.getByRole("button", { name: "#Tag 1" })).toBeInTheDocument();
  });
});
