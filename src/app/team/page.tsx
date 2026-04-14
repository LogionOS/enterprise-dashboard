"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { Organization, OrgMember } from "@/lib/types";
import {
  Building2,
  Users,
  Plus,
  Mail,
  Shield,
  Trash2,
  ChevronRight,
  Loader2,
  UserPlus,
} from "lucide-react";

const ROLE_BADGES: Record<string, { bg: string; text: string }> = {
  owner: { bg: "bg-amber-500/20", text: "text-amber-400" },
  admin: { bg: "bg-indigo-500/20", text: "text-indigo-400" },
  member: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
  billing: { bg: "bg-purple-500/20", text: "text-purple-400" },
  viewer: { bg: "bg-gray-500/20", text: "text-gray-400" },
};

export default function TeamPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);

  const loadOrgs = useCallback(async () => {
    try {
      const data = await api.organizations();
      setOrgs(data.organizations);
      if (data.organizations.length > 0 && !selectedOrg) {
        setSelectedOrg(data.organizations[0].id);
      }
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  const loadMembers = useCallback(async (orgId: string) => {
    setMembersLoading(true);
    try {
      const data = await api.orgMembers(orgId);
      setMembers(data.members);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  useEffect(() => {
    if (selectedOrg) loadMembers(selectedOrg);
  }, [selectedOrg, loadMembers]);

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      await api.createOrg(newOrgName.trim());
      setNewOrgName("");
      setShowCreateOrg(false);
      await loadOrgs();
    } catch {
      /* empty */
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedOrg) return;
    setInviting(true);
    try {
      await api.inviteMember(selectedOrg, inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      setShowInvite(false);
      await loadMembers(selectedOrg);
    } catch {
      /* empty */
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedOrg) return;
    try {
      await api.removeMember(selectedOrg, memberId);
      await loadMembers(selectedOrg);
    } catch {
      /* empty */
    }
  };

  const currentOrg = orgs.find((o) => o.id === selectedOrg);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Team & Organizations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organization, team members, and roles
          </p>
        </div>
        <button
          onClick={() => setShowCreateOrg(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Organization
        </button>
      </div>

      {/* Org Selector */}
      {orgs.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrg(org.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors shrink-0 ${
                selectedOrg === org.id
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              <Building2 className="w-5 h-5" />
              <div className="text-left">
                <div className="text-sm font-medium">{org.name}</div>
                <div className="text-xs text-gray-500">{org.member_count} members · {org.plan}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          ))}
        </div>
      )}

      {/* Create Org Modal */}
      {showCreateOrg && (
        <div className="rounded-xl border border-white/10 bg-[#0d1117] p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-100">Create Organization</h3>
          <input
            type="text"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Organization name"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCreateOrg}
              disabled={creating || !newOrgName.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm text-white font-medium disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => setShowCreateOrg(false)}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {orgs.length === 0 && !showCreateOrg && (
        <div className="text-center py-16 space-y-4">
          <Building2 className="w-12 h-12 text-gray-600 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-200">No organizations yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create an organization to start collaborating with your team.
            </p>
          </div>
          <button
            onClick={() => setShowCreateOrg(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </button>
        </div>
      )}

      {/* Members Section */}
      {currentOrg && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-100">
                {currentOrg.name} — Members
              </h3>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          </div>

          {/* Invite form */}
          {showInvite && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="team@example.com"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm focus:outline-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="billing">Billing</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm text-white font-medium disabled:opacity-50 transition-colors"
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
                <button
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Member list */}
          {membersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((m) => {
                const badge = ROLE_BADGES[m.role] || ROLE_BADGES.viewer;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#0d1117] border border-[#1e293b]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-200 font-medium">{m.email || "—"}</div>
                        <div className="text-xs text-gray-500">
                          {m.status === "active" ? `Joined ${m.joined_at?.split("T")[0] || ""}` : `Invited`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text} capitalize`}>
                        <Shield className="w-3 h-3 inline mr-1" />
                        {m.role}
                      </span>
                      {m.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {members.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6">No members yet. Invite your team!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
