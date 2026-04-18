"use client";

import * as React from "react";
import { Button, Modal } from "@/components/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  teamId: string;
  onInvited?: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteMemberDialog({ open, onClose, teamId, onInvited }: Props) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"member" | "admin">("member");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("member");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  async function handleSend() {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${encodeURIComponent(teamId)}/invites`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(body.detail || `Invite failed (${res.status})`);
      }
      onInvited?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite a teammate"
      description="We'll email them a Clerk magic-link to sign in."
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSend} isLoading={submitting} disabled={submitting}>
            Send invite
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label
            htmlFor="invite-email"
            className="block text-xs font-medium text-zinc-400"
          >
            Email
          </label>
          <input
            id="invite-email"
            type="text"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
            placeholder="teammate@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="invite-role"
            className="block text-xs font-medium text-zinc-400"
          >
            Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as "member" | "admin")}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error ? (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
