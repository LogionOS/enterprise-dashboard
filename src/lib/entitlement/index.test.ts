import { describe, expect, it } from "vitest";
import {
  capStatus,
  hasFeature,
  planLabel,
  requireFeature,
  seatStatus,
} from "./index";
import type { Entitlement } from "@/lib/api/schemas";
import { FeatureGatedError } from "@/lib/api/errors";

function mk(partial: Partial<Entitlement> = {}): Entitlement {
  return {
    plan: "basic",
    status: "active",
    request_cap_monthly: 2000,
    usage_this_month: 100,
    seats_total: 1,
    seats_used: 1,
    features: ["creator_mode", "receipt_export"],
    cap_status: { reached: false, plan: "basic", cap: 2000, usage: 100 },
    upgrade_url: "https://billing.test/upgrade",
    retention_days: 30,
    ...partial,
  };
}

describe("hasFeature", () => {
  it("returns true when feature is in the list", () => {
    expect(hasFeature(mk(), "creator_mode")).toBe(true);
  });
  it("returns false when feature is missing", () => {
    expect(hasFeature(mk(), "team_receipt_library")).toBe(false);
  });
});

describe("capStatus", () => {
  it("reports approaching when >= 80% of cap", () => {
    const c = capStatus(mk({ usage_this_month: 1700, cap_status: { reached: false, plan: "basic", cap: 2000, usage: 1700 } }));
    expect(c.approaching).toBe(true);
    expect(c.reached).toBe(false);
  });
  it("reports reached when API says so", () => {
    const c = capStatus(
      mk({ cap_status: { reached: true, plan: "basic", cap: 2000, usage: 2100 }, usage_this_month: 2100 }),
    );
    expect(c.reached).toBe(true);
  });
  it("never reports reached when cap is unlimited (-1)", () => {
    const c = capStatus(
      mk({
        plan: "enterprise",
        request_cap_monthly: -1,
        usage_this_month: 999999,
        cap_status: { reached: false, plan: "enterprise", cap: -1, usage: 999999 },
      }),
    );
    expect(c.reached).toBe(false);
    expect(c.approaching).toBe(false);
  });
});

describe("seatStatus", () => {
  it("computes availability", () => {
    const s = seatStatus(mk({ seats_total: 5, seats_used: 3 }));
    expect(s.available).toBe(2);
    expect(s.atLimit).toBe(false);
  });
});

describe("requireFeature", () => {
  it("throws FeatureGatedError when the feature is missing", () => {
    expect(() => requireFeature(mk(), "team_receipt_library")).toThrow(
      FeatureGatedError,
    );
  });
  it("does not throw when the feature is present", () => {
    expect(() => requireFeature(mk(), "creator_mode")).not.toThrow();
  });
});

describe("planLabel", () => {
  it("returns human labels", () => {
    expect(planLabel("basic")).toBe("Basic");
    expect(planLabel("team")).toBe("Team");
    expect(planLabel("enterprise")).toBe("Enterprise");
    expect(planLabel("trial")).toBe("Trial");
  });
});
