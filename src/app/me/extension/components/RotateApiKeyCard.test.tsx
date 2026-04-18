import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RotateApiKeyCard } from "./RotateApiKeyCard";

describe("RotateApiKeyCard", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders the initial 'Rotate key' CTA and does not call the API on mount", () => {
    const fetchSpy = vi.fn(async () => new Response(null, { status: 500 }));
    global.fetch = fetchSpy as unknown as typeof fetch;
    render(<RotateApiKeyCard />);
    expect(screen.getByRole("button", { name: /Rotate key/i })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("requires confirmation before rotating and then renders the new key exactly once", async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ api_key: "sk_live_brandnewkey", key_prefix: "sk_live_" }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    );
    global.fetch = fetchSpy as unknown as typeof fetch;

    render(<RotateApiKeyCard />);
    await userEvent.click(screen.getByRole("button", { name: /^Rotate key$/i }));
    // Confirmation panel appears; fetch has NOT been called yet.
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText(/Rotating will invalidate/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Yes, rotate now/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    const newKey = await screen.findByTestId("new-api-key");
    expect(newKey.textContent).toBe("sk_live_brandnewkey");
    expect(screen.getByText(/prefix: sk_live_/)).toBeInTheDocument();
  });

  it("shows the API error message when the rotation fails", async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response(
          JSON.stringify({ detail: "you are being rate limited, slow down" }),
          { status: 429, headers: { "content-type": "application/json" } },
        ),
    );
    global.fetch = fetchSpy as unknown as typeof fetch;

    render(<RotateApiKeyCard />);
    await userEvent.click(screen.getByRole("button", { name: /^Rotate key$/i }));
    await userEvent.click(screen.getByRole("button", { name: /Yes, rotate now/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/rate limited/i);
    expect(screen.queryByTestId("new-api-key")).toBeNull();
  });

  it("Cancel dismisses the confirmation panel without calling the API", async () => {
    const fetchSpy = vi.fn(async () => new Response(null, { status: 500 }));
    global.fetch = fetchSpy as unknown as typeof fetch;
    render(<RotateApiKeyCard />);
    await userEvent.click(screen.getByRole("button", { name: /^Rotate key$/i }));
    await userEvent.click(screen.getByRole("button", { name: /^Cancel$/i }));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.queryByText(/Rotating will invalidate/i)).toBeNull();
  });
});
