import Link from "next/link";
import type { ReceiptSummary } from "@/lib/api/schemas";
import { Table, type Column, EmptyState } from "@/components/ui";
import { ReceiptStatusPill } from "./ReceiptStatusPill";

type Props = {
  receipts: ReceiptSummary[];
  buildHref: (id: string) => string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ReceiptsTable({ receipts, buildHref }: Props) {
  if (receipts.length === 0) {
    return (
      <EmptyState
        title="No receipts yet"
        description="Receipts appear here after you run a check from the extension or API."
      />
    );
  }
  const columns: Column<ReceiptSummary>[] = [
    {
      key: "created_at",
      header: "Created",
      cell: (r) => (
        <Link
          href={buildHref(r.id)}
          className="text-zinc-200 underline-offset-2 hover:underline"
        >
          {formatDate(r.created_at)}
        </Link>
      ),
    },
    {
      key: "safety_status",
      header: "Result",
      cell: (r) => <ReceiptStatusPill status={r.safety_status} />,
    },
    {
      key: "action_type",
      header: "Action",
      cell: (r) => <span className="text-zinc-300">{r.action_type}</span>,
    },
    {
      key: "target_venues",
      header: "Venues",
      cell: (r) => (
        <span className="text-xs text-zinc-400">
          {r.target_venues.length === 0 ? "--" : r.target_venues.join(", ")}
        </span>
      ),
    },
    {
      key: "flags",
      header: "Flags (J1 / J2 / J3)",
      cell: (r) => {
        const s = r.summary ?? { j1_flags: 0, j2_flags: 0, j3_flags: 0 };
        return (
          <span className="text-xs text-zinc-400">
            {s.j1_flags} / {s.j2_flags} / {s.j3_flags}
          </span>
        );
      },
    },
  ];
  return (
    <Table<ReceiptSummary>
      columns={columns}
      rows={receipts}
      rowKey={(r) => r.id}
    />
  );
}
