import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReceiptsTable } from "./ReceiptsTable";
import type { ReceiptSummary } from "@/lib/api/schemas";

const receipts: ReceiptSummary[] = [
  {
    id: "rec_001",
    created_at: "2026-04-01T10:00:00Z",
    safety_status: "clear",
    action_type: "post",
    target_venues: ["twitter"],
    summary: { j1_flags: 0, j2_flags: 0, j3_flags: 0 },
  },
  {
    id: "rec_002",
    created_at: "2026-04-02T10:00:00Z",
    safety_status: "warn",
    action_type: "video_upload",
    target_venues: ["youtube", "tiktok"],
    summary: { j1_flags: 2, j2_flags: 1, j3_flags: 0 },
  },
  {
    id: "rec_003",
    created_at: "2026-04-03T10:00:00Z",
    safety_status: "block",
    action_type: "post",
    target_venues: [],
    summary: { j1_flags: 3, j2_flags: 0, j3_flags: 1 },
  },
];

describe("ReceiptsTable", () => {
  it("renders one row per receipt with a link to the detail page", () => {
    render(
      <ReceiptsTable
        receipts={receipts}
        buildHref={(id) => `/me/receipts/${id}`}
      />,
    );
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(receipts.length + 1);
    expect(screen.getByText(/Clear/)).toBeInTheDocument();
    expect(screen.getByText(/Warn/)).toBeInTheDocument();
    expect(screen.getByText(/Block/)).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "/me/receipts/rec_001")).toBe(true);
  });

  it("renders an empty state when there are no receipts", () => {
    render(<ReceiptsTable receipts={[]} buildHref={(id) => `/me/receipts/${id}`} />);
    expect(screen.getByText(/No receipts yet/i)).toBeInTheDocument();
  });

  it("renders '--' for receipts with no target venues", () => {
    render(
      <ReceiptsTable
        receipts={[receipts[2]]}
        buildHref={(id) => `/me/receipts/${id}`}
      />,
    );
    expect(screen.getByText("--")).toBeInTheDocument();
  });
});
