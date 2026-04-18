import Link from "next/link";
import { requireServerAuth } from "@/lib/auth";
import { getEntitlementServer } from "@/lib/entitlement/server";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Card, CardHeader, Pill } from "@/components/ui";
import { capStatus, planLabel, seatStatus } from "@/lib/entitlement";

export default async function MePage() {
  const auth = await requireServerAuth();
  let entitlement = null;
  try {
    entitlement = await getEntitlementServer();
  } catch {
    entitlement = null;
  }

  return (
    <DashboardShell
      title="Your account"
      description="Plan status, usage, receipts, and the browser extension key."
      breadcrumbs={[{ label: "Account" }]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Plan" description="Current subscription" />
          {entitlement ? (
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <span>{planLabel(entitlement.plan)}</span>
                <Pill variant="neutral">{entitlement.status}</Pill>
              </div>
              <p className="text-xs text-zinc-500">
                Signed in as {auth.email ?? auth.userId}.
              </p>
              <div className="pt-2 text-xs">
                <Link href="/me/billing" className="text-zinc-200 underline">
                  Manage billing -&gt;
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-400">
              No subscription data yet.
            </div>
          )}
        </Card>
        <Card>
          <CardHeader
            title="This month"
            description="Check volume against your monthly cap"
          />
          {entitlement ? (
            <UsageSummary entitlement={entitlement} />
          ) : (
            <div className="text-sm text-zinc-400">Usage unavailable.</div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}

function UsageSummary({
  entitlement,
}: {
  entitlement: Awaited<ReturnType<typeof getEntitlementServer>>;
}) {
  const cap = capStatus(entitlement);
  const seats = seatStatus(entitlement);
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <dt className="text-xs text-zinc-500">Checks used</dt>
        <dd className="text-zinc-100">{cap.usage.toLocaleString()}</dd>
      </div>
      <div>
        <dt className="text-xs text-zinc-500">Cap</dt>
        <dd className="text-zinc-100">
          {cap.cap <= 0 ? "Unlimited" : cap.cap.toLocaleString()}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-zinc-500">Seats</dt>
        <dd className="text-zinc-100">
          {seats.used} / {seats.total}
        </dd>
      </div>
      <div>
        <dt className="text-xs text-zinc-500">Retention</dt>
        <dd className="text-zinc-100">{entitlement.retention_days}d</dd>
      </div>
    </dl>
  );
}
