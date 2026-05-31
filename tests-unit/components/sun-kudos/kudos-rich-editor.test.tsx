/**
 * kudos-rich-editor.test.tsx
 * Regression coverage for the caret-jump defect: a contenteditable cannot be
 * driven like a normal controlled input. Rewriting innerHTML on every keystroke
 * resets the caret to the start, so typed text comes out reversed/jumbled and
 * the (required) "Nội dung" field is effectively unusable.
 *
 * The fix syncs `value` into the DOM only when it actually differs from what is
 * already rendered. These tests pin that contract.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KudosRichEditor } from "@/app/_components/sun-kudos/kudos-rich-editor";

describe("KudosRichEditor", () => {
  it("does not rewrite innerHTML on re-render when value matches the DOM (caret preservation)", () => {
    const { rerender } = render(<KudosRichEditor value="" onChange={() => {}} />);
    const editor = screen.getByRole("textbox");

    // Simulate the text the user just typed into the contenteditable.
    editor.innerHTML = "Hello";

    // Spy AFTER seeding so we only observe writes triggered by the re-render.
    const setInnerHtml = vi.spyOn(Element.prototype, "innerHTML", "set");

    // The controlled parent pushes the typed value back down. With the old
    // dangerouslySetInnerHTML approach this re-set innerHTML → caret jump.
    rerender(<KudosRichEditor value="Hello" onChange={() => {}} />);

    expect(setInnerHtml).not.toHaveBeenCalled();
    setInnerHtml.mockRestore();
  });

  it("applies the initial value to the editor on mount", () => {
    render(<KudosRichEditor value="<p>Cảm ơn nhé</p>" onChange={() => {}} />);
    expect(screen.getByRole("textbox").textContent).toBe("Cảm ơn nhé");
  });

  it("clears the editor when value resets to empty (form reset)", () => {
    const { rerender } = render(<KudosRichEditor value="Done" onChange={() => {}} />);
    const editor = screen.getByRole("textbox");
    expect(editor.textContent).toBe("Done");

    rerender(<KudosRichEditor value="" onChange={() => {}} />);
    expect(editor.textContent).toBe("");
  });

  it("emits the editor HTML through onChange on input", () => {
    const onChange = vi.fn();
    render(<KudosRichEditor value="" onChange={onChange} />);
    const editor = screen.getByRole("textbox");

    editor.innerHTML = "Thanks";
    fireEvent.input(editor);

    expect(onChange).toHaveBeenCalledWith("Thanks");
  });
});
