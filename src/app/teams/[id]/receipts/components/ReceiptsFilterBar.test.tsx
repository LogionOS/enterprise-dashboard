import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Hoistable mock state. We drive next/navigation from a fresh URL each test
// so we can assert the filter bar both READS and WRITES query params.
const state = {
  pushes: [] as string[],
  search: new URLSearchParams(),
  pathname: "/teams/team_1/receipts",
};

vi.mock("next/navigation", () => {
  return {
    useRouter: () => ({
      push: (href: string) => {
        state.pushes.push(href);
      },
    }),
    usePathname: () => state.pathname,
    useSearchParams: () => state.search,
  };
});

import { ReceiptsFilterBar } from "./ReceiptsFilterBar";

beforeEach(() => {
  state.pushes = [];
  state.search = new URLSearchParams();
  state.pathname = "/teams/team_1/receipts";
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("ReceiptsFilterBar", () => {
  it("hydrates from URL query params on mount", () => {
    state.search = new URLSearchParams(
      "status=warn&from=2026-01-01&action_type=post&target_venues=youtube&target_venues=tiktok",
    );
    render(<ReceiptsFilterBar />);
    expect(
      (screen.getByLabelText(/Result/i) as HTMLSelectElement).value,
    ).toBe("warn");
    expect((screen.getByLabelText(/^From$/i) as HTMLInputElement).value).toBe(
      "2026-01-01",
    );
    expect(
      (screen.getByLabelText(/Action/i) as HTMLInputElement).value,
    ).toBe("post");
    expect(
      (screen.getByLabelText(/Venues/i) as HTMLInputElement).value,
    ).toBe("youtube,tiktok");
  });

  it("writes filters back into the URL on submit (bookmarkable state)", async () => {
    render(<ReceiptsFilterBar />);
    await userEvent.selectOptions(screen.getByLabelText(/Result/i), "block");
    await userEvent.type(screen.getByLabelText(/Action/i), "post");
    await userEvent.type(
      screen.getByLabelText(/Venues/i),
      "youtube, linkedin",
    );
    await userEvent.click(screen.getByRole("button", { name: /^Apply$/ }));

    expect(state.pushes.length).toBe(1);
    const pushed = state.pushes[0]!;
    expect(pushed.startsWith("/teams/team_1/receipts?")).toBe(true);
    const params = new URLSearchParams(pushed.split("?")[1] ?? "");
    expect(params.get("status")).toBe("block");
    expect(params.get("action_type")).toBe("post");
    expect(params.getAll("target_venues")).toEqual(["youtube", "linkedin"]);
  });

  it("Reset clears filters and navigates to the bare path", async () => {
    state.search = new URLSearchParams("status=warn");
    render(<ReceiptsFilterBar />);
    await userEvent.click(screen.getByRole("button", { name: /Reset/i }));
    expect(state.pushes[0]).toBe("/teams/team_1/receipts");
  });
});
