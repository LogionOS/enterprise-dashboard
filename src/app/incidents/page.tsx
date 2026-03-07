"use client";

import { useEffect, useState, useCallback } from "react";
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
  false_positive: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const STATUSES = ["open", "investigating", "resolved", "false_positive", "closed"];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
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

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

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
      alert(`Failed: ${err}`);
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

      {/* Incidents table */}
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
