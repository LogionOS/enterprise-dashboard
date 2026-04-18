import { FeatureGatedError } from "@/lib/api/errors";
import type { Entitlement, FeatureKey, Plan } from "@/lib/api/schemas";

// Pure, side-effect-free helpers for the entitlement contract. This module
// is safe to import from any component (client or server). Anything that
// actually HITS the API lives in `./server.ts`, which is gated by
// `server-only`. This split keeps the client bundle clean -- importing
// `planLabel` must not drag the whole API client (and Clerk) into the
// browser.

export type CapView = {
  reached: boolean;
  usage: number;
  cap: number;
  percent: number;
  plan: Plan;
  upgradeUrl: string | null;
  approaching: boolean;
};

const CAP_WARN_THRESHOLD = 0.8;

export function hasFeature(
  ent: Pick<Entitlement, "features">,
  feature: FeatureKey | string,
): boolean {
  return ent.features.includes(feature);
}

export function capStatus(ent: Entitlement): CapView {
  const cap = ent.request_cap_monthly ?? -1;
  const usage = ent.usage_this_month ?? 0;
  const reached = ent.cap_status?.reached ?? (cap >= 0 && usage >= cap);
  const percent = cap <= 0 ? 0 : Math.min(1, usage / cap);
  return {
    reached,
    usage,
    cap,
    percent,
    plan: ent.plan,
    upgradeUrl: ent.upgrade_url ?? null,
    approaching: !reached && cap > 0 && percent >= CAP_WARN_THRESHOLD,
  };
}

export type SeatView = {
  used: number;
  total: number;
  available: number;
  atLimit: boolean;
};

export function seatStatus(ent: Entitlement): SeatView {
  const used = ent.seats_used ?? 0;
  const total = ent.seats_total ?? 0;
  const available = Math.max(0, total - used);
  return { used, total, available, atLimit: total > 0 && used >= total };
}

export function planLabel(plan: Plan): string {
  switch (plan) {
    case "trial":
      return "Trial";
    case "basic":
      return "Basic";
    case "team":
      return "Team";
    case "enterprise":
      return "Enterprise";
  }
}

export function requireFeature(
  ent: Entitlement,
  feature: FeatureKey | string,
): void {
  if (!hasFeature(ent, feature)) {
    throw new FeatureGatedError(
      `The "${feature}" feature is not available on the ${planLabel(
        ent.plan,
      )} plan.`,
      {
        feature,
        upgradeUrl: ent.upgrade_url ?? undefined,
      },
    );
  }
}
