"use client";

import { useState } from "react";
import { FileBarChart, Download, Play } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { ComplianceReportResponse } from "@/lib/types";

const PERIODS = [
  { value: "last_24h", label: "Last 24 Hours" },
  { value: "last_7d", label: "Last 7 Days" },
  { value: "last_30d", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
];

const ACTION_COLORS: Record<string, string> = {
  PASS: "#34d399",
  FLAG: "#fbbf24",
  BLOCK: "#f87171",
  WARN: "#fb923c",
};

export default function ReportsPage() {
  const [period, setPeriod] = useState("last_24h");
  const [report, setReport] = useState<ComplianceReportResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.generateReport(period);
      setReport(res);
    } catch (e) {
      console.error("Failed to generate report:", e);
    } finally {
      setLoading(false);
    }
  };

  const actionData = report
    ? [
        { name: "PASS", value: report.action_summary.PASS },
        { name: "FLAG", value: report.action_summary.FLAG },
        { name: "BLOCK", value: report.action_summary.BLOCK },
        { name: "WARN", value: report.action_summary.WARN },
      ]
    : [];

  const exportReport = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance_report_${report.report_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <FileBarChart className="w-5 h-5 text-indigo-400" /> Compliance Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate structured compliance summaries for auditors and regulators
        </p>
      </div>

      {/* Controls */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Reporting Period</label>
            <div className="flex items-center gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    period === p.value
                      ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                      : "bg-[#0d1117] text-gray-500 border-[#1e293b] hover:text-gray-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <button
              onClick={generate}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              {loading ? "Generating..." : "Generate Report"}
            </button>
            {report && (
              <button
                onClick={exportReport}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 bg-[#0d1117] border border-[#1e293b] rounded-lg hover:bg-[#1a2332]"
              >
                <Download className="w-4 h-4" /> Export
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {report && !loading && (
        <div className="space-y-4">
          {/* Report Header */}
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-indigo-400 font-mono text-sm">{report.report_id}</span>
                <h2 className="text-lg font-semibold text-gray-100 mt-1">Compliance Report</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {report.period} &middot; Generated {new Date(report.generated_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-400">{report.compliance_score}%</div>
                <div className="text-xs text-gray-500">Compliance Score</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricBlock label="Total Checks" value={report.total_checks} />
              <MetricBlock label="Blocks" value={report.action_summary.BLOCK} color="text-red-400" />
              <MetricBlock label="Flags" value={report.action_summary.FLAG} color="text-amber-400" />
              <MetricBlock label="Pass" value={report.action_summary.PASS} color="text-emerald-400" />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Action Summary</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={actionData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#e5e7eb",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {actionData.map((d) => (
                      <Cell key={d.name} fill={ACTION_COLORS[d.name] || "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Risk Summary</h3>
              <div className="space-y-3">
                {Object.entries(report.risk_summary).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <Badge variant={level.toLowerCase() as "low" | "medium" | "high" | "critical"} size="md">
                      {level}
                    </Badge>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 bg-[#0d1117] rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${report.total_checks > 0 ? (count / report.total_checks) * 100 : 0}%`,
                            background: level === "CRITICAL" ? "#f87171" : level === "HIGH" ? "#fb923c" : level === "MEDIUM" ? "#fbbf24" : "#34d399",
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 font-mono w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-indigo-400 mt-0.5">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Violations */}
          {report.violations.length > 0 && (
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Violations ({report.violations.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs border-b border-[#1e293b]">
                      <th className="text-left py-2 font-medium">Timestamp</th>
                      <th className="text-left py-2 font-medium">Request ID</th>
                      <th className="text-left py-2 font-medium">Action</th>
                      <th className="text-left py-2 font-medium">Risk</th>
                      <th className="text-right py-2 font-medium">Rules</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.violations.map((v, i) => (
                      <tr key={i} className="border-b border-[#1e293b]/30">
                        <td className="py-2 text-gray-400 font-mono text-xs">{String(v.timestamp)}</td>
                        <td className="py-2 text-gray-300 font-mono text-xs">{String(v.request_id).slice(0, 16)}</td>
                        <td className="py-2">
                          <Badge variant={String(v.action).toLowerCase() as "flag" | "block"}>{String(v.action)}</Badge>
                        </td>
                        <td className="py-2">
                          <Badge variant={String(v.risk_level).toLowerCase() as "high" | "critical"}>
                            {String(v.risk_level)}
                          </Badge>
                        </td>
                        <td className="py-2 text-right text-gray-400">{String(v.rules_triggered)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!report && !loading && (
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-16 text-center">
          <FileBarChart className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Select a period and generate a report.</p>
          <p className="text-gray-600 text-xs mt-1">
            Reports include action summaries, risk breakdowns, violations, and recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricBlock({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3 text-center">
      <div className={`text-lg font-bold ${color || "text-gray-200"}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
