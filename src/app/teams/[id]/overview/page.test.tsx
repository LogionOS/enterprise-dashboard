import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamOverviewCard } from "./components/TeamOverviewCard";
import type { Entitlement } from "@/lib/api/schemas";
import { CapBanner } from "@/components/ui";

const ent: Entitlement = {
  plan: "team",
  status: "active",
  request_cap_monthly: 8000,
  usage_this_month: 7600,
  seats_total: 3,
  seats_used: 2,
  features: ["creator_mode", "receipt_export", "receipt_export_pdf", "team_receipt_library"],
  cap_status: { reached: false, plan: "team", cap: 8000, usage: 7600 },
  upgrade_url: "https://billing.test/portal",
  retention_days: 90,
};

describe("TeamOverviewCard + CapBanner", () => {
  it("renders the Team plan badge and usage", () => {
    render(<TeamOverviewCard entitlement={ent} />);
    expect(screen.getByText(/Team overview/i)).toBeInTheDocument();
    expect(screen.getByText(/7,600 \/ 8,000/)).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 3/)).toBeInTheDocument();
  });

  it("renders the cap banner in 'approaching' mode at 95% utilization", () => {
    const { container } = render(<CapBanner entitlement={ent} />);
    expect(container.querySelector('[data-cap-approaching="true"]')).not.toBeNull();
  });

  it("renders the cap banner in 'reached' mode when cap_status.reached is true", () => {
    const reached = { ...ent, cap_status: { reached: true, plan: "team", cap: 8000, usage: 8100 } };
    const { container } = render(<CapBanner entitlement={reached} />);
    expect(container.querySelector('[data-cap-reached="true"]')).not.toBeNull();
  });

  it("renders nothing when the team is well below cap", () => {
    const ok = {
      ...ent,
      usage_this_month: 100,
      cap_status: { reached: false, plan: "team", cap: 8000, usage: 100 },
    };
    const { container } = render(<CapBanner entitlement={ok} />);
    expect(container.innerHTML).toBe("");
  });
});
