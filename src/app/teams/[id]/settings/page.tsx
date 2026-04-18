import { requireServerAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Card, CardHeader } from "@/components/ui";
import { SettingsForm } from "./components/SettingsForm";

export default async function TeamSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireServerAuth();
  const { id } = await params;
  return (
    <DashboardShell
      title="Settings"
      description="Team name, default creator-check venues, and timezone."
      breadcrumbs={[
        { label: "Teams", href: "/teams" },
        { label: id, href: `/teams/${id}` },
        { label: "Settings" },
      ]}
    >
      <Card>
        <CardHeader
          title="Team settings"
          description="These defaults apply to new creator-checks run from this team. (Coming soon -- the settings API endpoint is not yet exposed.)"
        />
        <div className="rounded-md border border-amber-900 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
          Settings persistence is disabled until the API exposes
          <code className="mx-1 font-mono">PATCH /v1/admin/teams/:id/settings</code>.
          The form below is a UI-only preview.
        </div>
        <SettingsForm teamId={id} />
      </Card>
    </DashboardShell>
  );
}
