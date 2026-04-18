import { Table, type Column } from "@/components/ui";
import type { Entitlement } from "@/lib/api/schemas";
import { capStatus } from "@/lib/entitlement";

type UsageRow = {
  period: string;
  usage: number;
  cap: number;
  percent: number;
};

export function UsageTable({ entitlement }: { entitlement: Entitlement }) {
  const cap = capStatus(entitlement);
  const rows: UsageRow[] = [
    {
      period: "This month",
      usage: cap.usage,
      cap: cap.cap,
      percent: cap.percent,
    },
  ];

  const columns: Column<UsageRow>[] = [
    { key: "period", header: "Period", cell: (r) => r.period },
    { key: "usage", header: "Checks used", cell: (r) => r.usage.toLocaleString() },
    {
      key: "cap",
      header: "Cap",
      cell: (r) => (r.cap <= 0 ? "Unlimited" : r.cap.toLocaleString()),
    },
    {
      key: "percent",
      header: "% of cap",
      cell: (r) =>
        r.cap <= 0 ? "--" : `${(r.percent * 100).toFixed(1)}%`,
    },
  ];

  return (
    <div className="space-y-3">
      <Table<UsageRow> columns={columns} rows={rows} rowKey={(r) => r.period} />
      {/* TODO(api): wire a historical series endpoint (e.g. GET
          /v1/admin/teams/:id/usage?days=365) so we can render last-12-months
          here. Today the API only exposes the current month via
          /v1/entitlement. */}
      <p className="text-xs text-zinc-500">
        Historical usage (last 12 months) will appear here once the API
        exposes a historical series endpoint.
      </p>
    </div>
  );
}
