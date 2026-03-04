"use client";

import { useEffect, useState } from "react";
import { Activity, Download, RefreshCw } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { AuditEntry } from "@/lib/types";

export default function EventsPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [limit, setLimit] = useState(100);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.audit(limit);
      setEntries(res.entries);
    } catch (e) {
      console.error("Failed to load events:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [limit]);

  const filtered =
    filter === "ALL" ? entries : entries.filter((e) => e.action === filter);

  const handleExport = async (format: "json" | "csv") => {
    const { baseUrl, apiKey } = getConfig();
    const headers: Record<string, string> = {};
    if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
    const res = await fetch(`${baseUrl}/v1/audit/export?format=${format}&limit=500`, { headers });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logionos_audit.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Audit Events
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {entries.length} events in memory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 bg-[#111827] border border-[#1e293b] rounded-lg hover:bg-[#1a2332] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 bg-[#111827] border border-[#1e293b] rounded-lg hover:bg-[#1a2332] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 bg-[#111827] border border-[#1e293b] rounded-lg hover:bg-[#1a2332] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {["ALL", "PASS", "FLAG", "BLOCK", "WARN"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              filter === f
                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                : "bg-[#111827] text-gray-500 border-[#1e293b] hover:text-gray-300"
            }`}
          >
            {f} {f !== "ALL" && `(${entries.filter((e) => e.action === f).length})`}
          </button>
        ))}
        <div className="ml-auto">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-[#111827] border border-[#1e293b] text-gray-400 text-xs rounded-lg px-3 py-1.5 outline-none"
          >
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
            <option value={200}>Last 200</option>
            <option value={500}>Last 500</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-[#1e293b] bg-[#0d1117]">
                  <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium">Request ID</th>
                  <th className="text-left py-3 px-4 font-medium">Jurisdiction</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium">Risk Level</th>
                  <th className="text-right py-3 px-4 font-medium">Rules Triggered</th>
                  <th className="text-left py-3 px-4 font-medium">PII Types</th>
                  <th className="text-right py-3 px-4 font-medium">Latency</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => (
                  <tr
                    key={`${ev.request_id}-${i}`}
                    className="border-b border-[#1e293b]/30 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono text-xs">
                      {ev.request_id.slice(0, 16)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default">{ev.jurisdiction}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={ev.action.toLowerCase() as "pass" | "flag" | "block" | "warn"}>
                        {ev.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={ev.risk_level.toLowerCase() as "low" | "medium" | "high" | "critical"}
                      >
                        {ev.risk_level}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {ev.rules_triggered}
                    </td>
                    <td className="py-3 px-4">
                      {ev.pii_types.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {ev.pii_types.map((t) => (
                            <Badge key={t} variant="critical" size="sm">{t}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-500 font-mono text-xs">
                      {ev.latency_ms.toFixed(1)}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-600 py-16">
            {entries.length === 0
              ? "No audit events recorded yet. Run compliance checks to generate events."
              : "No events match the current filter."}
          </div>
        )}
      </div>
    </div>
  );
}

function getConfig() {
  const baseUrl = localStorage.getItem("logionos_api_url") || "https://logionos-api.onrender.com";
  const apiKey = localStorage.getItem("logionos_api_key") || "";
  return { baseUrl, apiKey };
}
