import { requireServerAuth } from "@/lib/auth";
import { getEntitlementServer } from "@/lib/entitlement/server";
import { listAdminTeams } from "@/lib/api/endpoints/teams";
import { serverApiCtx, withAdminKey } from "@/lib/api/server";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EmptyState } from "@/components/ui";
import { TeamOverviewCard } from "./components/TeamOverviewCard";

export default async function TeamOverviewPage({
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

  let adminRow = null;
  const adminCtx = withAdminKey(serverApiCtx());
  if (adminCtx) {
    try {
      const rows = await listAdminTeams(adminCtx);
      adminRow = rows.find((r) => r.id === id) ?? null;
    } catch {
      adminRow = null;
    }
  }

  return (
    <DashboardShell
      title="Overview"
      description="At-a-glance picture of this team's plan, usage, and billing."
      breadcrumbs={[
        { label: "Teams", href: "/teams" },
        { label: id, href: `/teams/${id}` },
        { label: "Overview" },
      ]}
    >
      {entitlement ? (
        <TeamOverviewCard entitlement={entitlement} adminRow={adminRow} />
      ) : (
        <EmptyState
          title="Unable to load entitlement"
          description="We couldn't reach the entitlement service. Refresh to try again."
        />
      )}
    </DashboardShell>
  );
}
