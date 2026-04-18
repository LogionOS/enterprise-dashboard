import { requireServerAuth } from "@/lib/auth";
import { Card, CardHeader } from "@/components/ui";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { OpenBillingPortalButton } from "./components/OpenBillingPortalButton";

export default async function TeamBillingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireServerAuth();
  const { id } = await params;
  return (
    <DashboardShell
      title="Billing"
      description="Manage your plan, payment method, and invoices through Stripe."
      breadcrumbs={[
        { label: "Teams", href: "/teams" },
        { label: id, href: `/teams/${id}` },
        { label: "Billing" },
      ]}
    >
      <Card>
        <CardHeader
          title="Stripe Billing Portal"
          description="Opens Stripe's hosted portal in a new tab. Changes sync back to LogionOS via the billing webhook."
        />
        <OpenBillingPortalButton teamId={id} />
      </Card>
    </DashboardShell>
  );
}
