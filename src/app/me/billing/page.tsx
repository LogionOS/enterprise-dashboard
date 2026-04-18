import { requireServerAuth } from "@/lib/auth";
import { getEntitlementServer } from "@/lib/entitlement/server";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Card, CardHeader, Pill } from "@/components/ui";
import { planLabel } from "@/lib/entitlement";
import { OpenBillingPortalButton } from "@/app/teams/[id]/billing/components/OpenBillingPortalButton";

// Self-serve billing for basic-tier users. Team owners use
// /teams/[id]/billing, which scopes the portal session to their team.

export default async function MeBillingPage() {
  await requireServerAuth();
  let entitlement = null;
  try {
    entitlement = await getEntitlementServer();
  } catch {
    entitlement = null;
  }
  return (
    <DashboardShell
      title="Billing"
      description="Plan, payment method, and invoices."
      breadcrumbs={[
        { label: "Account", href: "/me" },
        { label: "Billing" },
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Current plan" />
          {entitlement ? (
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-100">
                  {planLabel(entitlement.plan)}
                </span>
                <Pill variant="neutral">{entitlement.status}</Pill>
              </div>
              <p className="text-xs text-zinc-500">
                Monthly cap:{" "}
                {entitlement.request_cap_monthly <= 0
                  ? "Unlimited"
                  : entitlement.request_cap_monthly.toLocaleString()}{" "}
                checks.
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No subscription data yet.</p>
          )}
        </Card>
        <Card>
          <CardHeader
            title="Stripe Billing Portal"
            description="Opens Stripe's hosted portal in a new tab. Changes sync back via webhook."
          />
          <OpenBillingPortalButton />
        </Card>
      </div>
    </DashboardShell>
  );
}
