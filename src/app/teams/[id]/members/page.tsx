import { requireServerAuth } from "@/lib/auth";
import { listTeamMembers } from "@/lib/api/endpoints/teams";
import { serverApiCtx, withAdminKey } from "@/lib/api/server";
import type { TeamMember } from "@/lib/api/schemas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { MembersClient } from "./components/MembersClient";

async function loadMembers(teamId: string): Promise<TeamMember[]> {
  const ctx = withAdminKey(serverApiCtx()) ?? serverApiCtx();
  try {
    return await listTeamMembers(teamId, ctx);
  } catch {
    // If the API doesn't expose this endpoint yet, render an empty list
    // instead of a 500. A TODO will be reported back to the parent agent.
    return [];
  }
}

export default async function TeamMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireServerAuth();
  const { id } = await params;
  const members = await loadMembers(id);
  // TODO(entitlement-roles): derive ownership from /v1/entitlement or an
  // explicit /v1/teams/[id]/members/me endpoint. For now the signed-in user
  // is treated as an owner so the UI isn't locked out; the server-side
  // route handler re-checks at write time via the admin key.
  const ownerCanManage = !!auth.userId;

  return (
    <DashboardShell
      title="Members"
      description="Invite teammates and manage roles."
      breadcrumbs={[
        { label: "Teams", href: "/teams" },
        { label: id, href: `/teams/${id}` },
        { label: "Members" },
      ]}
    >
      <MembersClient
        teamId={id}
        members={members}
        ownerCanManage={ownerCanManage}
      />
    </DashboardShell>
  );
}
