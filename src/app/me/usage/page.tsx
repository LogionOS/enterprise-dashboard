import { requireServerAuth } from "@/lib/auth";
import { getEntitlementServer } from "@/lib/entitlement/server";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EmptyState } from "@/components/ui";
import { UsageTable } from "@/app/teams/[id]/usage/components/UsageTable";

export default async function MeUsagePage() {
  await requireServerAuth();
  let entitlement = null;
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
        { label: "Account", href: "/me" },
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
