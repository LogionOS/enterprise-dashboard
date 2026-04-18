import { requireServerAuth } from "@/lib/auth";
import { getEntitlementServer } from "@/lib/entitlement/server";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EmptyState } from "@/components/ui";
import { UsageTable } from "./components/UsageTable";

export default async function TeamUsagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireServerAuth();
  const { id } = await params;
  let entitlement;
  try {
    entitlement = await getEntitlementServer();
  } catch {
    entitlement = null;
  }
  return (
    <DashboardShell
      title="Usage"
      description="Monthly check volume and cap progress."
      breadcrumbs={[
        { label: "Teams", href: "/teams" },
        { label: id, href: `/teams/${id}` },
        { label: "Usage" },
      ]}
    >
      {entitlement ? (
        <UsageTable entitlement={entitlement} />
      ) : (
        <EmptyState title="Unable to load usage" />
      )}
    </DashboardShell>
  );
}
