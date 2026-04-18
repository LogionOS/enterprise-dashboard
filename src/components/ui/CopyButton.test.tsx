import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "./CopyButton";

describe("CopyButton", () => {
  it("writes the value to the clipboard and shows 'Copied'", async () => {
    const writeText = vi.fn(async () => {});
    Object.assign(navigator, {
      clipboard: { writeText },
    });
    const onCopy = vi.fn();
    render(<CopyButton value="secret-xyz" onCopy={onCopy} />);
    const btn = screen.getByRole("button", { name: /copy/i });
    await userEvent.click(btn);
    expect(writeText).toHaveBeenCalledWith("secret-xyz");
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
    expect(btn.getAttribute("data-copied")).toBe("true");
  });
});
