import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}}>
        hi
      </Modal>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders an a11y-correct dialog when open", () => {
    render(
      <Modal open onClose={() => {}} title="Rotate key">
        hi
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("heading", { name: /rotate key/i })).toBeInTheDocument();
  });

  it("calls onClose on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Hi">
        <button>inner</button>
      </Modal>,
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("auto-focuses the first focusable element in the dialog", async () => {
    render(
      <Modal open onClose={() => {}} title="Focus test">
        <button>inner-button</button>
      </Modal>,
    );
    // Close button is rendered first in DOM; it should receive focus.
    await new Promise((r) => setTimeout(r, 10));
    expect(document.activeElement).not.toBe(document.body);
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="X">
        body
      </Modal>,
    );
    const overlay = screen.getByTestId("modal-overlay");
    const backdrop = overlay.querySelector("div");
    expect(backdrop).not.toBeNull();
    await userEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });
});
