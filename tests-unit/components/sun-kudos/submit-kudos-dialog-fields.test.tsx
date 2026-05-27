import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  FeatureHashtagSelect,
  SmallHashtagPicker,
  MessageArea,
  ImageStrip,
} from "@/app/_components/sun-kudos/submit-kudos-dialog-fields";
import type { Hashtag } from "@/lib/data/types";

/* ------------------------------------------------------------------ */
/* Fixtures                                                             */
/* ------------------------------------------------------------------ */

function buildHashtag(over: Partial<Hashtag> = {}): Hashtag {
  return {
    id: "h1",
    code: "TEAM_SPIRIT",
    label_vi: "Team Spirit",
    kind: "feature",
    display_order: 1,
    ...over,
  };
}

const FEATURE_HASHTAGS: Hashtag[] = [
  buildHashtag({ id: "f1", code: "IDOL", label_vi: "Idol Giới Trẻ", kind: "feature" }),
  buildHashtag({ id: "f2", code: "SPIRIT", label_vi: "Team Spirit", kind: "feature" }),
];

const SMALL_HASHTAGS: Hashtag[] = Array.from({ length: 7 }, (_, i) =>
  buildHashtag({ id: `s${i + 1}`, code: `TAG${i + 1}`, label_vi: `Tag ${i + 1}`, kind: "small", display_order: i + 1 })
);

/* ------------------------------------------------------------------ */
/* FeatureHashtagSelect                                                 */
/* ------------------------------------------------------------------ */

describe("<FeatureHashtagSelect />", () => {
  it("renders a select element with placeholder option", () => {
    render(
      <FeatureHashtagSelect hashtags={FEATURE_HASHTAGS} value="" onChange={() => {}} />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Chọn hạng mục...")).toBeInTheDocument();
  });

  it("renders one option per hashtag", () => {
    render(
      <FeatureHashtagSelect hashtags={FEATURE_HASHTAGS} value="" onChange={() => {}} />
    );
    expect(screen.getByRole("option", { name: "Idol Giới Trẻ" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Team Spirit" })).toBeInTheDocument();
  });

  it("reflects the current value via selected option", () => {
    render(
      <FeatureHashtagSelect hashtags={FEATURE_HASHTAGS} value="f1" onChange={() => {}} />
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("f1");
  });

  it("calls onChange with the selected option id", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FeatureHashtagSelect hashtags={FEATURE_HASHTAGS} value="" onChange={onChange} />
    );
    await user.selectOptions(screen.getByRole("combobox"), "f2");
    expect(onChange).toHaveBeenCalledWith("f2");
  });

  it("shows error message via FieldError when error prop set", () => {
    render(
      <FeatureHashtagSelect
        hashtags={FEATURE_HASHTAGS}
        value=""
        onChange={() => {}}
        error="Vui lòng chọn hạng mục."
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng chọn hạng mục.");
  });

  it("does not render error when error prop is undefined", () => {
    render(
      <FeatureHashtagSelect hashtags={FEATURE_HASHTAGS} value="" onChange={() => {}} />
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/* SmallHashtagPicker                                                   */
/* ------------------------------------------------------------------ */

describe("<SmallHashtagPicker />", () => {
  it("renders a button for each hashtag", () => {
    render(
      <SmallHashtagPicker hashtags={SMALL_HASHTAGS} selected={[]} onChange={() => {}} />
    );
    SMALL_HASHTAGS.forEach((h) => {
      expect(screen.getByRole("button", { name: `#${h.label_vi}` })).toBeInTheDocument();
    });
  });

  it("clicking an unselected chip calls onChange with it added", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SmallHashtagPicker hashtags={SMALL_HASHTAGS} selected={[]} onChange={onChange} />
    );
    await user.click(screen.getByRole("button", { name: "#Tag 1" }));
    expect(onChange).toHaveBeenCalledWith(["s1"]);
  });

  it("clicking a selected chip calls onChange with it removed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SmallHashtagPicker
        hashtags={SMALL_HASHTAGS}
        selected={["s1", "s2"]}
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole("button", { name: "#Tag 1" }));
    expect(onChange).toHaveBeenCalledWith(["s2"]);
  });

  it("caps selection at 5: buttons beyond 5 are disabled when full", () => {
    // selected=5 items → unselected chips must be disabled
    render(
      <SmallHashtagPicker
        hashtags={SMALL_HASHTAGS}
        selected={["s1", "s2", "s3", "s4", "s5"]}
        onChange={() => {}}
      />
    );
    // s6 and s7 are not selected — should be disabled
    expect(screen.getByRole("button", { name: "#Tag 6" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "#Tag 7" })).toBeDisabled();
  });

  it("selected chips remain enabled (can be deselected) even when at max 5", () => {
    render(
      <SmallHashtagPicker
        hashtags={SMALL_HASHTAGS}
        selected={["s1", "s2", "s3", "s4", "s5"]}
        onChange={() => {}}
      />
    );
    // s1 is selected — must NOT be disabled
    expect(screen.getByRole("button", { name: "#Tag 1" })).not.toBeDisabled();
  });

  it("clicking a disabled chip does not call onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SmallHashtagPicker
        hashtags={SMALL_HASHTAGS}
        selected={["s1", "s2", "s3", "s4", "s5"]}
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole("button", { name: "#Tag 6" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not render error when error prop is undefined", () => {
    render(
      <SmallHashtagPicker hashtags={SMALL_HASHTAGS} selected={[]} onChange={() => {}} />
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/* MessageArea                                                          */
/* ------------------------------------------------------------------ */

describe("<MessageArea />", () => {
  it("renders a textarea with placeholder text", () => {
    render(<MessageArea value="" onChange={() => {}} />);
    expect(
      screen.getByPlaceholderText("Viết lời cảm ơn của bạn...")
    ).toBeInTheDocument();
  });

  it("displays current value in textarea", () => {
    render(<MessageArea value="Hello world" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("Hello world");
  });

  it("shows 0/2000 char counter when empty", () => {
    render(<MessageArea value="" onChange={() => {}} />);
    expect(screen.getByText("0/2000")).toBeInTheDocument();
  });

  it("updates char counter to reflect current value length", () => {
    render(<MessageArea value="Hello" onChange={() => {}} />);
    expect(screen.getByText("5/2000")).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MessageArea value="" onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "Hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("shows error message when error prop set", () => {
    render(
      <MessageArea value="" onChange={() => {}} error="Lời cảm ơn không được để trống." />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Lời cảm ơn không được để trống."
    );
  });

  it("does not render alert when error prop is undefined", () => {
    render(<MessageArea value="" onChange={() => {}} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("textarea has maxLength=2000 attribute", () => {
    render(<MessageArea value="" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "2000");
  });
});

/* ------------------------------------------------------------------ */
/* ImageStrip                                                           */
/* ------------------------------------------------------------------ */

describe("<ImageStrip />", () => {
  const noop = () => {};

  it("renders add button when fewer than 5 images and not uploading", () => {
    render(
      <ImageStrip paths={[]} previews={[]} uploading={false} onAdd={noop} onRemove={noop} />
    );
    expect(screen.getByRole("button", { name: "Thêm ảnh" })).toBeInTheDocument();
  });

  it("hides add button when 5 images already added", () => {
    const paths = ["p1", "p2", "p3", "p4", "p5"];
    const previews = ["blob:1", "blob:2", "blob:3", "blob:4", "blob:5"];
    render(
      <ImageStrip
        paths={paths}
        previews={previews}
        uploading={false}
        onAdd={noop}
        onRemove={noop}
      />
    );
    expect(screen.queryByRole("button", { name: "Thêm ảnh" })).not.toBeInTheDocument();
  });

  it("hides add button while uploading", () => {
    render(
      <ImageStrip paths={[]} previews={[]} uploading={true} onAdd={noop} onRemove={noop} />
    );
    expect(screen.queryByRole("button", { name: "Thêm ảnh" })).not.toBeInTheDocument();
  });

  it("shows 'Đang tải...' while uploading", () => {
    render(
      <ImageStrip paths={[]} previews={[]} uploading={true} onAdd={noop} onRemove={noop} />
    );
    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
  });

  it("renders an img element per preview with correct alt text", () => {
    const previews = ["blob:a", "blob:b"];
    render(
      <ImageStrip
        paths={["p1", "p2"]}
        previews={previews}
        uploading={false}
        onAdd={noop}
        onRemove={noop}
      />
    );
    expect(screen.getByAltText("Ảnh 1")).toBeInTheDocument();
    expect(screen.getByAltText("Ảnh 2")).toBeInTheDocument();
  });

  it("renders a remove button per preview", () => {
    const previews = ["blob:a", "blob:b"];
    render(
      <ImageStrip
        paths={["p1", "p2"]}
        previews={previews}
        uploading={false}
        onAdd={noop}
        onRemove={noop}
      />
    );
    expect(screen.getByRole("button", { name: "Xóa ảnh 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa ảnh 2" })).toBeInTheDocument();
  });

  it("calls onRemove with the correct index when remove button clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const previews = ["blob:a", "blob:b", "blob:c"];
    render(
      <ImageStrip
        paths={["p1", "p2", "p3"]}
        previews={previews}
        uploading={false}
        onAdd={noop}
        onRemove={onRemove}
      />
    );
    await user.click(screen.getByRole("button", { name: "Xóa ảnh 2" }));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it("shows error message when error prop set", () => {
    render(
      <ImageStrip
        paths={[]}
        previews={[]}
        uploading={false}
        onAdd={noop}
        onRemove={noop}
        error="Tải ảnh thất bại, vui lòng thử lại."
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tải ảnh thất bại, vui lòng thử lại."
    );
  });

  it("file input triggers onAdd when a file is selected via file-input change", () => {
    const onAdd = vi.fn();
    render(
      <ImageStrip paths={[]} previews={[]} uploading={false} onAdd={onAdd} onRemove={noop} />
    );
    // The hidden file input exists in the DOM
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const file = new File(["img"], "photo.png", { type: "image/png" });
    Object.defineProperty(fileInput, "files", { value: [file], configurable: true });
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));
    expect(onAdd).toHaveBeenCalledWith(file);
  });
});
