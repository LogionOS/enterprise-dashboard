import { describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RevealOnceField } from "./RevealOnceField";

describe("RevealOnceField", () => {
  it("starts masked and reveals the plaintext on Show click", async () => {
    render(<RevealOnceField value="sk_live_abc123" />);
    const field = screen.getByTestId("reveal-once-field");
    expect(field.getAttribute("data-revealed")).toBe("false");
    expect(screen.queryByText("sk_live_abc123")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /show key/i }));
    expect(field.getAttribute("data-revealed")).toBe("true");
    expect(screen.getByText("sk_live_abc123")).toBeInTheDocument();
  });

  it("toggles back to masked on Hide click", async () => {
    render(<RevealOnceField value="sk_live_xyz" />);
    await userEvent.click(screen.getByRole("button", { name: /show key/i }));
    await userEvent.click(screen.getByRole("button", { name: /hide key/i }));
    const field = screen.getByTestId("reveal-once-field");
    expect(field.getAttribute("data-revealed")).toBe("false");
    expect(screen.queryByText("sk_live_xyz")).not.toBeInTheDocument();
  });

  it("invokes onClear and stops rendering the plaintext after unmount", () => {
    const onClear = vi.fn();
    render(<RevealOnceField value="sk_live_tobecleared" onClear={onClear} />);
    cleanup();
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.queryByText("sk_live_tobecleared")).not.toBeInTheDocument();
  });
});
