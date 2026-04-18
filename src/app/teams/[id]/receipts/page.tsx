import { requireServerAuth } from "@/lib/auth";
import { listReceipts, type ReceiptListQuery } from "@/lib/api/endpoints/receipts";
import { serverApiCtx } from "@/lib/api/server";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EmptyState } from "@/components/ui";
import { ReceiptsTable } from "@/components/receipts/ReceiptsTable";
import { ProductBoundaryDisclaimer } from "@/components/legal/ProductBoundaryDisclaimer";
import { ReceiptsFilterBar } from "./components/ReceiptsFilterBar";

type SearchParams = Promise<
  Partial<{
    status: string;
    from: string;
    to: string;
    action_type: string;
    target_venues: string | string[];
    cursor: string;
  }>
>;

function normalizeStatus(s: string | undefined): ReceiptListQuery["status"] {
  if (s === "clear" || s === "warn" || s === "block") return s;
  return undefined;
}

function normalizeVenues(v: string | string[] | undefined): string[] | undefined {
  if (!v) return undefined;
  const arr = Array.isArray(v) ? v : [v];
  const dedup = [...new Set(arr.flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean))];
  return dedup.length === 0 ? undefined : dedup;
}

export default async function TeamReceiptsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: SearchParams;
}) {
  await requireServerAuth();
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const query: ReceiptListQuery = {
    teamId: id,
    status: normalizeStatus(sp.status),
    from: sp.from || undefined,
    to: sp.to || undefined,
    actionType: sp.action_type || undefined,
    targetVenues: normalizeVenues(sp.target_venues),
    cursor: sp.cursor || undefined,
    limit: 50,
  };

  let list;
  try {
    list = await listReceipts(query, serverApiCtx());
  } catch {
    list = null;
  }

  return (
    <DashboardShell
      title="Receipts"
      description="Cross-seat receipt library. Filters are URL-driven so any view can be bookmarked or shared with teammates."
      breadcrumbs={[
        { label: "Teams", href: "/teams" },
        { label: id, href: `/teams/${id}` },
        { label: "Receipts" },
      ]}
    >
      <div className="space-y-4">
        <ReceiptsFilterBar />
        {list ? (
          <ReceiptsTable
            receipts={list.items}
            buildHref={(rid) => `/teams/${id}/receipts/${rid}`}
          />
        ) : (
          <EmptyState
            title="Unable to load receipts"
            description="The receipts service didn't respond. Refresh to try again."
          />
        )}
        <ProductBoundaryDisclaimer />
      </div>
    </DashboardShell>
  );
}
