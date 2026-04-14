"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Applicant } from "@/lib/types";

const STATUS_TABS = [
  { key: "", label: "All" },
  { key: "new", label: "New" },
  { key: "reviewing", label: "Reviewing" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "waitlisted", label: "Waitlisted" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400",
  reviewing: "bg-yellow-500/15 text-yellow-400",
  accepted: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-red-500/15 text-red-400",
  waitlisted: "bg-purple-500/15 text-purple-400",
};

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [issuedKey, setIssuedKey] = useState<{ id: number; key: string; expires: string } | null>(null);
  const [editNotes, setEditNotes] = useState<{ id: number; notes: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.applicants(status, search);
      setApplicants(data.applicants);
      setTotal(data.total);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAccept(id: number) {
    setActionLoading(id);
    try {
      const res = await api.acceptApplicant(id);
      setIssuedKey({ id, key: res.api_key, expires: res.expires_at });
      await load();
    } catch {
      /* ignore */
    }
    setActionLoading(null);
  }

  async function handleReject(id: number) {
    setActionLoading(id);
    try {
      await api.rejectApplicant(id);
      await load();
    } catch {
      /* ignore */
    }
    setActionLoading(null);
  }

  async function handleWaitlist(id: number) {
    setActionLoading(id);
    try {
      await api.waitlistApplicant(id);
      await load();
    } catch {
      /* ignore */
    }
    setActionLoading(null);
  }

  async function handleSaveNotes(id: number, notes: string) {
    try {
      await api.updateApplicant(id, { admin_notes: notes });
      setEditNotes(null);
      await load();
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-400" />
            Applicants
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Founder Program application management — {total} total
          </p>
        </div>
      </div>

      {/* Issued key modal */}
      {issuedKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 space-y-3">
          <h3 className="text-emerald-400 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Key Issued Successfully
          </h3>
          <div className="bg-[#0d1117] rounded-lg p-3 font-mono text-sm text-gray-200 break-all flex items-center gap-2">
            <span className="flex-1">{issuedKey.key}</span>
            <button
              onClick={() => navigator.clipboard.writeText(issuedKey.key)}
              className="text-gray-500 hover:text-gray-300 shrink-0"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Expires: {issuedKey.expires} · This key will not be shown again.
          </p>
          <button
            onClick={() => setIssuedKey(null)}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === tab.key
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "bg-[#161b22] text-gray-400 hover:text-gray-200 border border-[#1e293b]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by company, email, or founder name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#161b22] border border-[#1e293b] rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          No applicants found.
        </div>
      ) : (
        <div className="space-y-2">
          {applicants.map((app) => (
            <div key={app.id} className="bg-[#161b22] border border-[#1e293b] rounded-xl overflow-hidden">
              {/* Row */}
              <button
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0 grid grid-cols-[1fr_120px_120px_100px_100px] gap-4 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {app.company || app.founder_name || `#${app.id}`}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{app.email}</p>
                  </div>
                  <p className="text-xs text-gray-400">{app.country || "—"}</p>
                  <p className="text-xs text-gray-400">{app.vertical || "—"}</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] || "bg-gray-500/15 text-gray-400"}`}>
                    {app.status}
                  </span>
                  <p className="text-xs text-gray-500">{app.created_at?.slice(0, 10)}</p>
                </div>
                {expandedId === app.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                )}
              </button>

              {/* Expanded detail */}
              {expandedId === app.id && (
                <div className="border-t border-[#1e293b] px-5 py-5 space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <Field label="Company" value={app.company} />
                    <Field label="Founder" value={app.founder_name} />
                    <Field label="Email" value={app.email} />
                    <Field label="Country" value={app.country} />
                    <Field label="Team Size" value={app.team_size} />
                    <Field label="Funding" value={app.funding} />
                    <Field label="Revenue" value={app.revenue_status} />
                    <Field label="Vertical" value={app.vertical} />
                    <Field label="Target Market" value={app.target_market} />
                    <Field label="AI Core" value={app.ai_is_core ? "Yes" : "No"} />
                    <Field label="Use Case" value={app.use_case_type} />
                    <Field label="Accelerator" value={app.accelerator} />
                  </div>

                  {app.product_description && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Product Description</p>
                      <p className="text-sm text-gray-300 bg-[#0d1117] rounded-lg p-3">{app.product_description}</p>
                    </div>
                  )}

                  {app.website && (
                    <a href={app.website.startsWith("http") ? app.website : `https://${app.website}`}
                       target="_blank" rel="noopener noreferrer"
                       className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" /> {app.website}
                    </a>
                  )}

                  {/* Key info for accepted */}
                  {app.status === "accepted" && app.issued_key_prefix && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 space-y-1">
                      <p className="text-xs text-emerald-400 font-medium">Issued Key</p>
                      <p className="text-sm text-gray-300 font-mono">{app.issued_key_prefix}…</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Issued: {app.issued_at?.slice(0, 10) || "—"}</span>
                        <span>Activated: {app.activated_at?.slice(0, 10) || "Not yet"}</span>
                        <span>Last active: {app.last_active_at?.slice(0, 10) || "—"}</span>
                        <span>Usage: {app.usage_total}</span>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Admin Notes</p>
                    {editNotes?.id === app.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editNotes.notes}
                          onChange={(e) => setEditNotes({ ...editNotes, notes: e.target.value })}
                          className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/50 min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveNotes(app.id, editNotes.notes)}
                            className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditNotes(null)}
                            className="px-3 py-1.5 text-gray-400 text-xs hover:text-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditNotes({ id: app.id, notes: app.admin_notes })}
                        className="text-sm text-gray-400 hover:text-gray-200 bg-[#0d1117] rounded-lg p-3 w-full text-left min-h-[40px]"
                      >
                        {app.admin_notes || "Click to add notes…"}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  {app.status !== "accepted" && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleAccept(app.id)}
                        disabled={actionLoading === app.id}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {actionLoading === app.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Accept & Issue Key
                      </button>
                      {app.status !== "rejected" && (
                        <button
                          onClick={() => handleReject(app.id)}
                          disabled={actionLoading === app.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      )}
                      {app.status !== "waitlisted" && (
                        <button
                          onClick={() => handleWaitlist(app.id)}
                          disabled={actionLoading === app.id}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium hover:bg-purple-500/20 disabled:opacity-50"
                        >
                          <Clock className="w-4 h-4" />
                          Waitlist
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-300">{value || "—"}</p>
    </div>
  );
}
