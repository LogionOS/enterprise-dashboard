import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportReceiptButton } from "./ExportReceiptButton";

describe("ExportReceiptButton", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });
  beforeEach(() => {
    const u = globalThis.URL as unknown as {
      createObjectURL?: (b: Blob) => string;
      revokeObjectURL?: (s: string) => void;
    };
    if (!u.createObjectURL) u.createObjectURL = () => "blob:mock";
    if (!u.revokeObjectURL) u.revokeObjectURL = () => {};
  });

  it("is disabled and carries the upgrade tooltip when the feature is gated (PDF)", () => {
    render(<ExportReceiptButton receiptId="rec_1" format="pdf" enabled={false} />);
    const btn = screen.getByRole("button", { name: /Team plan and up/i });
    expect(btn).toBeDisabled();
    expect(btn.getAttribute("data-feature-gated")).toBe("true");
  });

  it("is disabled for JSON when not entitled", () => {
    render(<ExportReceiptButton receiptId="rec_1" format="json" enabled={false} />);
    const btn = screen.getByRole("button", { name: /Basic plan and up/i });
    expect(btn).toBeDisabled();
  });

  it("triggers a fetch + blob download when enabled", async () => {
    const fetchSpy = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(new Blob([new Uint8Array([37, 80, 68, 70])]), {
          status: 200,
          headers: { "content-type": "application/pdf" },
        }),
    ) as unknown as typeof fetch;
    global.fetch = fetchSpy;

    render(<ExportReceiptButton receiptId="rec_abc" format="pdf" enabled />);
    await userEvent.click(
      screen.getByRole("button", { name: /Export receipt as PDF/i }),
    );
    const calls = (fetchSpy as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe("/api/receipts/rec_abc/export?fmt=pdf");
  });

  it("uses fmt=json in the URL for JSON format", async () => {
    const fetchSpy = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(new Blob([new Uint8Array([123, 125])]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    ) as unknown as typeof fetch;
    global.fetch = fetchSpy;
    render(<ExportReceiptButton receiptId="rec_1" format="json" enabled />);
    await userEvent.click(
      screen.getByRole("button", { name: /Export receipt as JSON/i }),
    );
    const calls = (fetchSpy as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    expect(calls[0][0]).toBe("/api/receipts/rec_1/export?fmt=json");
  });
});
