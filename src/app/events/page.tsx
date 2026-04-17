"use client";

import { useEffect, useState } from "react";
import { Activity, Download, RefreshCw, X, FileText, Clock, Shield } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { AuditEntry } from "@/lib/types";

export default function EventsPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [limit, setLimit] = useState(100);
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.audit(limit);
      setEntries(res.entries);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Failed to load events: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [limit]);

  const filtered = filter === "ALL" ? entries : entries.filter((e) => e.action === filter);

  const handleExport = async (format: "json" | "csv") => {
    try {
      const blob = await api.auditExport(format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logionos_audit.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast(`Export failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  const exportEvidencePack = (ev: AuditEntry) => {
    const evidence = {
      _meta: {
        type: "LogionOS Evidence Pack",
        version: "1.0",
        generated_at: new Date().toISOString(),
        workspace: localStorage.getItem("logionos_api_url")?.replace(/https?:\/\//, "").split("/")[0] || "logionos",
        export_format: "structured_json",
      },
      event: {
        request_id: ev.request_id,
        timestamp: ev.timestamp,
        query_hash: ev.query_hash,
        jurisdiction: ev.jurisdiction,
      },
      decision: {
        action: ev.action,
        risk_level: ev.risk_level,
        rules_triggered: ev.rules_triggered,
        pii_types_detected: ev.pii_types,
        latency_ms: ev.latency_ms,
      },
      audit_trail: {
        immutable_hash: ev.query_hash,
        decision_timestamp: ev.timestamp,
        engine_version: "2.0.0",
        pipeline: "FastCheck → RegulationMatch → AI Judge → AuditLog",
        retention_policy: "Configurable (see DEPLOYMENT.md)",
      },
      compliance_attestation: {
        system: "LogionOS Runtime Compliance Engine v2.0",
        jurisdictions_checked: [ev.jurisdiction],
        total_regulations_loaded: "4004",
        decision_basis: "Automated multi-layer compliance check (TF-IDF + Embedding + AI Judge)",
        human_review_required: ev.action === "BLOCK" || ev.action === "FLAG",
      },
    };

    const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence_pack_${ev.request_id.slice(0, 12)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportEvidenceHTML = (ev: AuditEntry) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><title>Evidence Pack — ${ev.request_id}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;color:#1a1a2e;line-height:1.6;padding:0 20px}
h1{color:#4338ca;border-bottom:2px solid #4338ca;padding-bottom:8px;font-size:20px}
h2{color:#6366f1;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin-top:24px}
table{width:100%;border-collapse:collapse;margin:12px 0}
td{padding:8px 12px;border:1px solid #e5e7eb;font-size:13px}
td:first-child{font-weight:600;width:200px;background:#f9fafb;color:#4b5563}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}
.PASS{background:#d1fae5;color:#065f46}.FLAG{background:#fef3c7;color:#92400e}
.BLOCK{background:#fee2e2;color:#991b1b}.WARN{background:#ffedd5;color:#9a3412}
.LOW{background:#d1fae5;color:#065f46}.MEDIUM{background:#fef3c7;color:#92400e}
.HIGH{background:#ffedd5;color:#9a3412}.CRITICAL{background:#fee2e2;color:#991b1b}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
</style>
</head>
<body>
<h1>LogionOS Evidence Pack</h1>
<p style="color:#6b7280;font-size:13px">Generated: ${new Date().toISOString()}</p>

<h2>Event Details</h2>
<table>
<tr><td>Request ID</td><td><code>${ev.request_id}</code></td></tr>
<tr><td>Timestamp</td><td>${ev.timestamp}</td></tr>
<tr><td>Query Hash (SHA-256)</td><td><code>${ev.query_hash}</code></td></tr>
<tr><td>Jurisdiction</td><td>${ev.jurisdiction}</td></tr>
</table>

<h2>Compliance Decision</h2>
<table>
<tr><td>Action</td><td><span class="badge ${ev.action}">${ev.action}</span></td></tr>
<tr><td>Risk Level</td><td><span class="badge ${ev.risk_level}">${ev.risk_level}</span></td></tr>
<tr><td>Rules Triggered</td><td>${ev.rules_triggered}</td></tr>
<tr><td>PII Types Detected</td><td>${ev.pii_types.length > 0 ? ev.pii_types.join(", ") : "None"}</td></tr>
<tr><td>Processing Latency</td><td>${ev.latency_ms.toFixed(1)} ms</td></tr>
</table>

<h2>Audit Trail</h2>
<table>
<tr><td>Immutable Hash</td><td><code>${ev.query_hash}</code></td></tr>
<tr><td>Engine Version</td><td>LogionOS v2.0</td></tr>
<tr><td>Pipeline</td><td>FastCheck → RegulationMatch → AI Judge → AuditLog</td></tr>
<tr><td>Retention Policy</td><td>Configurable (see DEPLOYMENT.md)</td></tr>
<tr><td>Human Review Required</td><td>${ev.action === "BLOCK" || ev.action === "FLAG" ? "Yes" : "No"}</td></tr>
</table>

<h2>Compliance Attestation</h2>
<table>
<tr><td>System</td><td>LogionOS Runtime Compliance Engine v2.0</td></tr>
<tr><td>Jurisdictions</td><td>${ev.jurisdiction} (4000+ regulations loaded)</td></tr>
<tr><td>Decision Basis</td><td>Multi-layer automated check (PII Detection → Regulation Matching → AI Judge)</td></tr>
</table>

<div class="footer">
This document was automatically generated by LogionOS Enterprise Dashboard.<br>
For audit verification, contact compliance@logionos.com
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `evidence_pack_${ev.request_id.slice(0, 12)}.html`;
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
          <p className="text-sm text-gray-500 mt-1">{entries.length} events in memory</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 bg-[#111827] border border-[#1e293b] rounded-lg hover:bg-[#1a2332] transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={() => handleExport("csv")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 bg-[#111827] border border-[#1e293b] rounded-lg hover:bg-[#1a2332] transition-colors">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={() => handleExport("json")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 bg-[#111827] border border-[#1e293b] rounded-lg hover:bg-[#1a2332] transition-colors">
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <span className="text-sm text-red-400">{error}</span>
          <button onClick={load} className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        {["ALL", "PASS", "FLAG", "BLOCK", "WARN"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              filter === f
                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                : "bg-[#111827] text-gray-500 border-[#1e293b] hover:text-gray-300"
            }`}>
            {f} {f !== "ALL" && `(${entries.filter((e) => e.action === f).length})`}
          </button>
        ))}
        <div className="ml-auto">
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-[#111827] border border-[#1e293b] text-gray-400 text-xs rounded-lg px-3 py-1.5 outline-none">
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
                  <th className="text-right py-3 px-4 font-medium">Rules</th>
                  <th className="text-left py-3 px-4 font-medium">PII Types</th>
                  <th className="text-right py-3 px-4 font-medium">Latency</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev, i) => (
                  <tr key={`${ev.request_id}-${i}`}
                    className="border-b border-[#1e293b]/30 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setSelected(ev)}>
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs whitespace-nowrap">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-mono text-xs">{ev.request_id.slice(0, 16)}</td>
                    <td className="py-3 px-4"><Badge variant="default">{ev.jurisdiction}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={ev.action.toLowerCase() as "pass" | "flag" | "block" | "warn"}>{ev.action}</Badge>
                        {ev.action_type && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-500/10 text-gray-500 border border-gray-500/20">
                            {ev.action_type}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={ev.risk_level.toLowerCase() as "low" | "medium" | "high" | "critical"}>{ev.risk_level}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">{ev.rules_triggered}</td>
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
                    <td className="py-3 px-4 text-right text-gray-500 font-mono text-xs">{ev.latency_ms.toFixed(1)}ms</td>
                    <td className="py-3 px-4">
                      <FileText className="w-4 h-4 text-gray-600 hover:text-indigo-400" />
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

      {/* Evidence Detail Panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg bg-[#111827] border-l border-[#1e293b] h-full overflow-y-auto p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Evidence Pack</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-100">Event Detail</h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Decision */}
              <div className={`rounded-lg border p-4 ${
                selected.action === "PASS" ? "bg-emerald-500/5 border-emerald-500/20" :
                selected.action === "BLOCK" ? "bg-red-500/5 border-red-500/20" :
                "bg-amber-500/5 border-amber-500/20"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={selected.action.toLowerCase() as "pass" | "flag" | "block" | "warn"} size="md">{selected.action}</Badge>
                  <Badge variant={selected.risk_level.toLowerCase() as "low" | "medium" | "high" | "critical"} size="md">{selected.risk_level}</Badge>
                  {selected.action_type && (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-500/10 text-gray-400 border border-gray-500/20">
                      {selected.action_type}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {selected.rules_triggered} rules triggered &middot; {selected.latency_ms.toFixed(1)}ms processing
                </div>
              </div>

              {/* Event Metadata */}
              <Section title="Event Identification">
                <InfoRow label="Request ID" value={selected.request_id} mono />
                <InfoRow label="Timestamp" value={selected.timestamp} />
                <InfoRow label="Query Hash (SHA-256)" value={selected.query_hash} mono />
                <InfoRow label="Jurisdiction" value={selected.jurisdiction} />
              </Section>

              {/* Decision Details */}
              <Section title="Compliance Decision">
                <InfoRow label="Action" value={selected.action} />
                {selected.action_type && <InfoRow label="Action Type" value={selected.action_type} />}
                <InfoRow label="Risk Level" value={selected.risk_level} />
                <InfoRow label="Rules Triggered" value={String(selected.rules_triggered)} />
                <InfoRow label="Processing Latency" value={`${selected.latency_ms.toFixed(1)} ms`} />
                <InfoRow label="Human Review Required" value={selected.action === "BLOCK" || selected.action === "FLAG" ? "Yes" : "No"} />
              </Section>

              {/* PII */}
              {selected.pii_types.length > 0 && (
                <Section title="PII Detection">
                  <div className="flex flex-wrap gap-1.5">
                    {selected.pii_types.map((t) => (
                      <Badge key={t} variant="critical" size="md">{t}</Badge>
                    ))}
                  </div>
                </Section>
              )}

              {/* Audit Trail */}
              <Section title="Audit Trail">
                <InfoRow label="Engine Version" value="LogionOS v2.0" />
                <InfoRow label="Pipeline" value="FastCheck → RegMatch → AI Judge → Audit" />
                <InfoRow label="Retention Policy" value="Configurable (see DEPLOYMENT.md)" />
                <InfoRow label="Immutable Hash" value={selected.query_hash.slice(0, 24) + "..."} mono />
              </Section>

              {/* Export Buttons */}
              <div className="flex gap-2 pt-2">
                <button onClick={() => exportEvidenceHTML(selected)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                  <FileText className="w-4 h-4" /> Export Evidence (HTML)
                </button>
                <button onClick={() => exportEvidencePack(selected)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-400 border border-[#1e293b] rounded-lg hover:bg-white/5 transition-colors">
                  <Download className="w-4 h-4" /> Export (JSON)
                </button>
              </div>

              {/* Feedback */}
              <div className="pt-3 border-t border-[#1e293b]">
                <div className="text-xs font-medium text-gray-400 mb-2">Feedback on this check</div>
                <div className="flex gap-2 flex-wrap">
                  {(["accurate", "false_positive", "too_strict", "too_lenient"] as const).map((fb) => (
                    <button
                      key={fb}
                      onClick={async () => {
                        try {
                          await api.submitFeedback({ request_id: selected.request_id, feedback: fb });
                          toast(`Feedback "${fb}" submitted`, "success");
                        } catch { toast("Failed to submit feedback"); }
                      }}
                      className="px-3 py-1.5 text-xs rounded-md border border-[#1e293b] text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors capitalize"
                    >
                      {fb.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-gray-600 text-center pt-2">
                <Clock className="w-3 h-3 inline mr-1" />
                This evidence pack is generated from immutable audit data.
                All hashes are computed at check time and cannot be modified.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3 space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs text-gray-300 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

