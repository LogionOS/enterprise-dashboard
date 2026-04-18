import { Card, CardHeader, PlanBadge } from "@/components/ui";
import type { Entitlement, TeamAdminRow } from "@/lib/api/schemas";
import { capStatus, seatStatus } from "@/lib/entitlement";

export function TeamOverviewCard({
  entitlement,
  adminRow,
}: {
  entitlement: Entitlement;
  adminRow?: TeamAdminRow | null;
}) {
  const cap = capStatus(entitlement);
  const seats = seatStatus(entitlement);
  const mrr = adminRow?.mrr_usd;

  return (
    <Card>
      <CardHeader
        title="Team overview"
        description="Plan, seats, and this month's activity."
        action={<PlanBadge plan={entitlement.plan} />}
      />
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Metric label="Plan status" value={entitlement.status} />
        <Metric
          label="Monthly usage"
          value={
            cap.cap <= 0
              ? `${cap.usage.toLocaleString()} (unlimited)`
              : `${cap.usage.toLocaleString()} / ${cap.cap.toLocaleString()}`
          }
        />
        <Metric
          label="Seats"
          value={`${seats.used} / ${seats.total}`}
        />
        <Metric
          label="MRR"
          value={
            mrr == null
              ? "N/A"
              : mrr.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })
          }
        />
      </dl>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-zinc-100">{value}</dd>
    </div>
  );
}
