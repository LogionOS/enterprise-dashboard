import { requireServerAuth } from "@/lib/auth";
import { getReceipt } from "@/lib/api/endpoints/receipts";
import { getEntitlementServer } from "@/lib/entitlement/server";
import { serverApiCtx } from "@/lib/api/server";
import { hasFeature } from "@/lib/entitlement";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Card, CardHeader, EmptyState, Pill } from "@/components/ui";
import { HashChainBadge } from "@/components/receipts/HashChainBadge";
import { EventTimeline } from "@/components/receipts/EventTimeline";
import { SignalSummary } from "@/components/receipts/SignalSummary";
import { ExportReceiptButton } from "@/components/receipts/ExportReceiptButton";
import { ReceiptStatusPill } from "@/components/receipts/ReceiptStatusPill";
import { ProductBoundaryDisclaimer } from "@/components/legal/ProductBoundaryDisclaimer";

export default async function TeamReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string; receiptId: string }>;
}) {
  await requireServerAuth();
  const { id: teamId, receiptId } = await params;

  const [receipt, entitlement] = await Promise.all([
    safe(() => getReceipt(receiptId, serverApiCtx())),
    safe(() => getEntitlementServer()),
  ]);

  const canJson = !!(entitlement && hasFeature(entitlement, "receipt_export"));
  const canPdf = !!(entitlement && hasFeature(entitlement, "receipt_export_pdf"));

  if (!receipt) {
    return (
      <DashboardShell
        title="Receipt"
        breadcrumbs={[
          { label: "Teams", href: "/teams" },
          { label: teamId, href: `/teams/${teamId}` },
          { label: "Receipts", href: `/teams/${teamId}/receipts` },
          { label: receiptId },
        ]}
      >
        <EmptyState
          title="Receipt not found"
          description="It may have expired under your retention policy or the ID is wrong."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={`Receipt ${receipt.id.slice(0, 8)}...`}
      description={new Date(receipt.created_at).toLocaleString()}
      breadcrumbs={[
        { label: "Teams", href: "/teams" },
        { label: teamId, href: `/teams/${teamId}` },
        { label: "Receipts", href: `/teams/${teamId}/receipts` },
        { label: receipt.id.slice(0, 8) },
      ]}
      actions={
        <div className="flex gap-2">
          <ExportReceiptButton
            receiptId={receipt.id}
            format="json"
            enabled={canJson}
          />
          <ExportReceiptButton
            receiptId={receipt.id}
            format="pdf"
            enabled={canPdf}
          />
        </div>
      }
    >
      <div className="space-y-5">
        <Card>
          <CardHeader
            title="Summary"
            action={
              <div className="flex items-center gap-2">
                <ReceiptStatusPill status={receipt.safety_status} />
                <HashChainBadge
                  verified={receipt.chain_verified}
                  chainHead={receipt.chain_head}
                />
              </div>
            }
          />
          <dl className="mt-2 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <Meta label="Action" value={receipt.action_type} />
            <Meta
              label="Venues"
              value={
                receipt.target_venues.length === 0
                  ? "--"
                  : receipt.target_venues.join(", ")
              }
            />
            <Meta
              label="Jurisdictions"
              value={
                receipt.jurisdictions.length === 0
                  ? "--"
                  : receipt.jurisdictions.join(", ")
              }
            />
          </dl>
          {!canPdf ? (
            <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-400">
              <Pill variant="accent" className="mr-2">
                Upgrade
              </Pill>
              PDF export is available on the Team plan and up.
            </div>
          ) : null}
        </Card>

        <SignalSummary
          j1={{
            label: "Platform",
            flags: receipt.summary.j1_flags,
            details: receipt.summary.j1,
          }}
          j2={{
            label: "Jurisdiction",
            flags: receipt.summary.j2_flags,
            details: receipt.summary.j2,
          }}
          j3={{
            label: "Claim risk",
            flags: receipt.summary.j3_flags,
            details: receipt.summary.j3,
          }}
        />

        <Card>
          <CardHeader title="Event timeline" description="Ordered hash-chained events in this receipt." />
          <EventTimeline events={receipt.events} />
        </Card>

        <ProductBoundaryDisclaimer />
      </div>
    </DashboardShell>
  );
}

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-zinc-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-zinc-200">{value}</dd>
    </div>
  );
}
