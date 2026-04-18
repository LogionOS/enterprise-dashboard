import * as React from "react";
import { Pill } from "./Pill";
import type { Plan } from "@/lib/api/schemas";
import { planLabel } from "@/lib/entitlement";

const variantByPlan: Record<Plan, React.ComponentProps<typeof Pill>["variant"]> =
  {
    trial: "neutral",
    basic: "info",
    team: "accent",
    enterprise: "success",
  };

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <Pill variant={variantByPlan[plan]} data-plan={plan}>
      {planLabel(plan)}
    </Pill>
  );
}
