"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";

interface Incident {
  id: string;
  audit_request_id: string;
  status: string;
  assignee: string;
  notes: string;
  override_reason: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  action?: string;
  risk_level?: string;
  user_id?: string;
  department?: string;
  audit_timestamp?: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-500/20 text-red-400 border-red-500/30",
  investigating: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  false_positive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const STATUSES = ["open", "investigating", "resolved", "false_positive", "closed"];

type TabId = "all" | "queue";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [reviewQueue, setReviewQueue] = useState<Incident[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editAssignee, setEditAssignee] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.incidents({
        status: filterStatus || undefined,
        limit: 200,
      });
      setIncidents((data.incidents || []) as unknown as Incident[]);
    } catch {
      setIncidents([]);
    }
    setLoading(false);
  }, [filterStatus]);

  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const data = await api.reviewQueue(100);
      setReviewQueue((data.queue || []) as unknown as Incident[]);
    } catch {
      setReviewQueue([]);
    }
    setQueueLoading(false);
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (activeTab === "queue") loadQueue();
  }, [activeTab, loadQueue]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.approveIncident(id);
      toast("Incident approved", "success");
      loadQueue();
    } catch (err) {
      toast(`Approve failed: ${err instanceof Error ? err.message : err}`);
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason (optional):");
    setActionLoading(id);
    try {
      await api.rejectIncident(id, reason || "");
      toast("Incident rejected (confirmed)", "success");
      loadQueue();
    } catch (err) {
      toast(`Reject failed: ${err instanceof Error ? err.message : err}`);
    }
    setActionLoading(null);
  };

  const handleEscalate = async (id: string) => {
    const reason = prompt("Escalation reason (optional):");
    setActionLoading(id);
    try {
      await api.escalateIncident(id, reason || "");
      toast("Incident escalated to critical", "success");
      loadQueue();
    } catch (err) {
      toast(`Escalate failed: ${err instanceof Error ? err.message : err}`);
    }
    setActionLoading(null);
  };

  const openDetail = (inc: Incident) => {
    setSelectedIncident(inc);
    setEditStatus(inc.status);
    setEditAssignee(inc.assignee || "");
    setEditNotes(inc.notes || "");
  };

  const handleSave = async () => {
    if (!selectedIncident) return;
    setSaving(true);
    try {
      await api.updateIncident(selectedIncident.id, {
        status: editStatus,
        assignee: editAssignee,
        notes: editNotes,
      });
      setSelectedIncident(null);
      loadIncidents();
    } catch (err) {
      toast(`Failed to update incident: ${err instanceof Error ? err.message : err}`);
    }
    setSaving(false);
  };

  const countByStatus = (status: string) =>
    incidents.filter((i) => i.status === status).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Incidents</h1>
          <p className="text-sm text-gray-400 mt-1">
            Compliance violations requiring investigation or resolution
          </p>
        </div>
        <button
          onClick={loadIncidents}
          className="px-4 py-2 bg-[#1e293b] text-gray-300 rounded-lg text-sm hover:bg-[#2d3b4f] transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-[#0d1117] rounded-lg p-1 border border-[#1e293b] w-fit">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === "all"
              ? "bg-indigo-500/15 text-indigo-400 font-medium"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          All Incidents
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-4 py-2 text-sm rounded-md transition-colors ${
            activeTab === "queue"
              ? "bg-amber-500/15 text-amber-400 font-medium"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          Review Queue {reviewQueue.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">{reviewQueue.length}</span>}
        </button>
      </div>

      {activeTab === "all" && (
        <>
          {/* Status summary cards */}
          <div className="grid grid-cols-5 gap-3">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  filterStatus === s
                    ? STATUS_COLORS[s] + " border-opacity-100"
                    : "bg-[#0d1117] border-[#1e293b] text-gray-400 hover:border-gray-600"
                }`}
              >
                <div className="text-xl font-bold">{countByStatus(s)}</div>
                <div className="text-xs capitalize mt-0.5">{s.replace("_", " ")}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Review Queue */}
      {activeTab === "queue" && (
        <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
          {queueLoading ? (
            <div className="p-8 text-center text-gray-500">Loading review queue...</div>
          ) : reviewQueue.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No incidents awaiting review. All clear!
            </div>
          ) : (
            <div className="divide-y divide-[#1e293b]">
              {reviewQueue.map((inc) => (
                <div key={inc.id} className="p-4 hover:bg-[#1e293b]/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-indigo-400">{inc.id}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLORS[inc.status] || "bg-gray-700 text-gray-300"}`}>
                          {inc.status?.replace("_", " ")}
                        </span>
                        <span className={`font-medium text-xs ${inc.action === "BLOCK" ? "text-red-400" : "text-amber-400"}`}>
                          {inc.action || "—"}
                        </span>
                        <span className="text-xs text-gray-500">{inc.risk_level || "—"}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-3">
                        {inc.user_id && <span>User: {inc.user_id}</span>}
                        {inc.department && <span>Dept: {inc.department}</span>}
                        <span>{inc.created_at ? new Date(inc.created_at).toLocaleString() : "—"}</span>
                      </div>
                      {inc.notes && (
                        <div className="text-xs text-gray-600 mt-1 truncate">{inc.notes}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleApprove(inc.id)}
                        disabled={actionLoading === inc.id}
                        className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(inc.id)}
                        disabled={actionLoading === inc.id}
                        className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleEscalate(inc.id)}
                        disabled={actionLoading === inc.id}
                        className="px-3 py-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-lg disabled:opacity-50 transition-colors"
                      >
                        Escalate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Incidents table */}
      {activeTab === "all" && (
        <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading incidents...</div>
          ) : incidents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {filterStatus
                ? `No ${filterStatus.replace("_", " ")} incidents`
                : "No incidents found. Incidents are auto-created when BLOCK or FLAG events occur."}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-[#1e293b]">
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Assignee</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => openDetail(inc)}
                    className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-indigo-400">{inc.id}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLORS[inc.status] || "bg-gray-700 text-gray-300"}`}>
                        {inc.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${inc.action === "BLOCK" ? "text-red-400" : inc.action === "FLAG" ? "text-amber-400" : "text-gray-400"}`}>
                        {inc.action || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{inc.risk_level || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{inc.user_id || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{inc.department || "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{inc.assignee || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {inc.created_at ? new Date(inc.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Detail / Edit modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#1e293b] rounded-2xl w-full max-w-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-100">
                Incident {selectedIncident.id}
              </h2>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-500 hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Audit Request</div>
                <div className="text-gray-300 font-mono text-xs">{selectedIncident.audit_request_id}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Action / Risk</div>
                <div className="text-gray-300">
                  {selectedIncident.action || "—"} / {selectedIncident.risk_level || "—"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">User</div>
                <div className="text-gray-300">{selectedIncident.user_id || "—"}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Department</div>
                <div className="text-gray-300">{selectedIncident.department || "—"}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-200"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Assignee</label>
                <input
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                  placeholder="e.g. john.doe@company.com"
                  className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-200"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Investigation notes..."
                  className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-200 resize-none"
                />
              </div>
            </div>

            {selectedIncident.override_reason && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="text-xs text-purple-400 font-medium mb-1">Override Reason</div>
                <div className="text-sm text-purple-300">{selectedIncident.override_reason}</div>
              </div>
            )}

            {(selectedIncident.status === "open" || selectedIncident.status === "investigating") && (
              <div className="bg-[#0d1117] border border-[#1e293b] rounded-lg p-3 space-y-2">
                <div className="text-xs text-gray-500 font-medium">Manual Override</div>
                <input
                  id="override-reason"
                  type="text"
                  placeholder="Override reason (required)..."
                  className="w-full bg-[#111827] border border-[#1e293b] rounded px-3 py-1.5 text-sm text-gray-200"
                />
                <button
                  onClick={async () => {
                    const reason = (document.getElementById("override-reason") as HTMLInputElement)?.value;
                    if (!reason?.trim()) { toast("Please provide an override reason", "warning"); return; }
                    try {
                      await api.overrideIncident(selectedIncident.id, { reason, status: "false_positive" });
                      setSelectedIncident(null);
                      loadIncidents();
                    } catch { toast("Override failed"); }
                  }}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium"
                >
                  Override as False Positive
                </button>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Incident"}
              </button>
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-[#1e293b] text-gray-300 rounded-lg text-sm hover:bg-[#2d3b4f]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
