"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { Button, Pill, Table, type Column, EmptyState } from "@/components/ui";
import type { TeamMember } from "@/lib/api/schemas";
import { InviteMemberDialog } from "./InviteMemberDialog";

type Props = {
  teamId: string;
  members: TeamMember[];
  ownerCanManage: boolean;
};

export function MembersClient({ teamId, members, ownerCanManage }: Props) {
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState(members);
  const [pendingRemove, setPendingRemove] = React.useState<string | null>(null);

  React.useEffect(() => {
    setRows(members);
  }, [members]);

  const columns: Column<TeamMember>[] = React.useMemo(
    () => [
      {
        key: "email",
        header: "Email",
        cell: (m) => m.email,
        sort: (a, b) => a.email.localeCompare(b.email),
      },
      {
        key: "role",
        header: "Role",
        cell: (m) => (
          <Pill variant={m.role === "owner" ? "accent" : "neutral"}>{m.role}</Pill>
        ),
        sort: (a, b) => a.role.localeCompare(b.role),
      },
      {
        key: "status",
        header: "Status",
        cell: (m) => (
          <Pill
            variant={
              m.status === "active"
                ? "success"
                : m.status === "invited"
                  ? "info"
                  : "warning"
            }
          >
            {m.status}
          </Pill>
        ),
        sort: (a, b) => a.status.localeCompare(b.status),
      },
      {
        key: "actions",
        header: "",
        cell: (m) =>
          ownerCanManage && m.role !== "owner" ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={pendingRemove === m.id}
              onClick={async () => {
                setPendingRemove(m.id);
                try {
                  await fetch(
                    `/api/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(m.id)}`,
                    { method: "DELETE" },
                  );
                  setRows((r) => r.filter((x) => x.id !== m.id));
                } finally {
                  setPendingRemove(null);
                }
              }}
            >
              Remove
            </Button>
          ) : null,
      },
    ],
    [ownerCanManage, pendingRemove, teamId],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          {rows.length} teammate{rows.length === 1 ? "" : "s"}
        </div>
        {ownerCanManage ? (
          <Button onClick={() => setOpen(true)}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite teammate
          </Button>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No teammates yet"
          description="Invite your first teammate to share receipts and run checks together."
          action={
            ownerCanManage ? (
              <Button onClick={() => setOpen(true)}>Invite teammate</Button>
            ) : null
          }
        />
      ) : (
        <Table<TeamMember>
          columns={columns}
          rows={rows}
          rowKey={(m) => m.id}
          initialSortKey="email"
        />
      )}
      <InviteMemberDialog
        open={open}
        onClose={() => setOpen(false)}
        teamId={teamId}
        onInvited={() => {
          // Caller should revalidate on the next navigation; for now we just
          // close. A future enhancement fetches the fresh list here.
        }}
      />
    </div>
  );
}
