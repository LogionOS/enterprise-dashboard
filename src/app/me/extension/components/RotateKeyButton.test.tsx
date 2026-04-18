import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RotateKeyButton } from "./RotateKeyButton";

describe("RotateKeyButton", () => {
  it("does not call onConfirm until the modal's confirm action is clicked", async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<RotateKeyButton onConfirm={onConfirm} />);

    await userEvent.click(screen.getByRole("button", { name: /rotate api key/i }));
    expect(onConfirm).not.toHaveBeenCalled();

    expect(screen.getByRole("dialog", { name: /rotate api key/i })).toBeInTheDocument();
    expect(
      screen.getByText(/old key is revoked immediately/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("rotate-confirm"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("cancelling the modal never calls onConfirm", async () => {
    const onConfirm = vi.fn();
    render(<RotateKeyButton onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: /rotate api key/i }));
    await userEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("surfaces onConfirm errors inside the modal", async () => {
    const onConfirm = vi.fn().mockRejectedValue(new Error("boom"));
    render(<RotateKeyButton onConfirm={onConfirm} />);
    await userEvent.click(screen.getByRole("button", { name: /rotate api key/i }));
    await userEvent.click(screen.getByTestId("rotate-confirm"));
    expect(await screen.findByRole("alert")).toHaveTextContent(/boom/);
  });
});
