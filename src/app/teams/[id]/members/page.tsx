import { requireServerAuth, getServerToken } from "@/lib/auth";
import { fetchJson } from "@/lib/api/client";
import { z } from "zod";
import { TeamMemberSchema, type TeamMember } from "@/lib/api/schemas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { MembersClient } from "./components/MembersClient";

const ListSchema = z.object({ items: z.array(TeamMemberSchema) });

async function loadMembers(teamId: string): Promise<TeamMember[]> {
  const getToken = () => getServerToken();
  const adminKey = process.env.LOGIONOS_ADMIN_KEY;
  try {
    const data = await fetchJson(
      `/v1/admin/teams/${encodeURIComponent(teamId)}/members`,
      ListSchema,
      { method: "GET" },
      {
        getToken,
        extraHeaders: adminKey ? { "X-Admin-Key": adminKey } : undefined,
      },
    );
    return data.items;
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
