import { requireServerAuth } from "@/lib/auth";
import { listReceipts } from "@/lib/api/endpoints/receipts";
import { serverApiCtx } from "@/lib/api/server";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EmptyState, Pill } from "@/components/ui";
import { ReceiptsTable } from "@/components/receipts/ReceiptsTable";
import { ProductBoundaryDisclaimer } from "@/components/legal/ProductBoundaryDisclaimer";

type SearchParams = Promise<{ status?: string }>;

export default async function MeReceiptsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  await requireServerAuth();
  const sp = (await searchParams) ?? {};
  const status =
    sp.status === "clear" || sp.status === "warn" || sp.status === "block"
      ? sp.status
      : undefined;

  let list;
  try {
    list = await listReceipts(
      { status, limit: 50 },
      serverApiCtx(),
    );
  } catch {
    list = null;
  }

  return (
    <DashboardShell
      title="Receipts"
      description="Your last 50 receipts. Upgrade to the Team plan for the full cross-seat receipt library."
      breadcrumbs={[
        { label: "Account", href: "/me" },
        { label: "Receipts" },
      ]}
      actions={
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Showing:</span>
          <Pill variant="neutral">{status ?? "all"}</Pill>
        </div>
      }
    >
      <div className="space-y-4">
        {list ? (
          <ReceiptsTable
            receipts={list.items}
            buildHref={(id) => `/me/receipts/${id}`}
          />
        ) : (
          <EmptyState title="Unable to load receipts" />
        )}
        <ProductBoundaryDisclaimer />
      </div>
    </DashboardShell>
  );
}
