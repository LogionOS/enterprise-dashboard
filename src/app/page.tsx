"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Activity,
  BookOpen,
  Clock,
  Globe,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import StatsCard from "@/components/ui/StatsCard";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { seedDemoData, SEED_COUNT } from "@/lib/seed";
import type { HealthResponse, AnalyticsResponse, AuditEntry, TrendEntry, DriftAlert } from "@/lib/types";

const ACTION_COLORS: Record<string, string> = {
  PASS: "#34d399",
  FLAG: "#fbbf24",
  BLOCK: "#f87171",
  WARN: "#fb923c",
};

const RISK_COLORS: Record<string, string> = {
  LOW: "#34d399",
  MEDIUM: "#fbbf24",
  HIGH: "#fb923c",
  CRITICAL: "#f87171",
};

export default function OverviewPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [recentEvents, setRecentEvents] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);
  const [auditIntegrity, setAuditIntegrity] = useState<{ valid: boolean; total: number; verified: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendEntry[]>([]);
  const [driftAlert, setDriftAlert] = useState<DriftAlert | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, a, ev] = await Promise.all([
        api.health(),
        api.analytics(),
        api.audit(10),
      ]);
      setHealth(h);
      setAnalytics(a);
      setRecentEvents(ev.entries);
      api.auditVerify().then(setAuditIntegrity).catch(() => {});
      api.complianceTrend(30).then((d) => setTrendData(d.trend)).catch(() => {});
      api.complianceDrift().then(setDriftAlert).catch(() => {});
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(`Failed to load dashboard data: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedProgress(0);
    const baseUrl = localStorage.getItem("logionos_api_url") || "https://logionos-api.onrender.com";
    const apiKey = localStorage.getItem("logionos_api_key") || "";
    await seedDemoData(baseUrl, apiKey, (done) => setSeedProgress(done));
    setSeeding(false);
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const eng = health?.engine;
  const dist = analytics?.action_distribution;
  const actionData = dist
    ? [
        { name: "PASS", value: dist.PASS, fill: ACTION_COLORS.PASS },
        { name: "FLAG", value: dist.FLAG, fill: ACTION_COLORS.FLAG },
        { name: "BLOCK", value: dist.BLOCK, fill: ACTION_COLORS.BLOCK },
        { name: "WARN", value: dist.WARN, fill: ACTION_COLORS.WARN },
      ].filter((d) => d.value > 0)
    : [];

  const riskData = analytics
    ? Object.entries(analytics.risk_distribution).map(([name, value]) => ({
        name,
        value,
        fill: RISK_COLORS[name] || "#6b7280",
      }))
    : [];

  const volumeData = analytics?.daily_volume || [];

  const complianceRate =
    dist && analytics && analytics.total_checks > 0
      ? ((dist.PASS / analytics.total_checks) * 100).toFixed(1)
      : "—";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">Compliance Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time monitoring across {eng ? Object.keys(eng.rules_by_jurisdiction).length : 0} jurisdictions
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-400">{error}</span>
          </div>
          <button
            onClick={load}
            className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Rules"
          value={eng?.total_rules.toLocaleString() ?? "—"}
          sub={eng ? `${Object.keys(eng.rules_by_jurisdiction).length} jurisdictions` : undefined}
          icon={BookOpen}
          color="indigo"
        />
        <StatsCard
          label="Compliance Rate"
          value={`${complianceRate}%`}
          sub="Pass rate across all checks"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatsCard
          label="Total Checks"
          value={analytics?.total_checks.toLocaleString() ?? "—"}
          sub="In-memory audit entries"
          icon={Activity}
          color="cyan"
        />
        <StatsCard
          label="Blocks / Flags"
          value={`${dist?.BLOCK ?? 0} / ${dist?.FLAG ?? 0}`}
          sub="Requiring attention"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Seed Banner */}
      {analytics && analytics.total_checks === 0 && !seeding && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-indigo-400">Populate Demo Data</h3>
            <p className="text-xs text-gray-500 mt-1">
              Run {SEED_COUNT} real compliance checks to populate charts, events, and reports.
              This simulates a live production environment for demonstration.
            </p>
          </div>
          <button
            onClick={handleSeed}
            className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors whitespace-nowrap"
          >
            Seed Demo Data
          </button>
        </div>
      )}
      {seeding && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-indigo-400">Seeding compliance checks...</span>
            <span className="text-xs text-gray-400 font-mono">{seedProgress} / {SEED_COUNT}</span>
          </div>
          <div className="w-full bg-[#0d1117] rounded-full h-2">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(seedProgress / SEED_COUNT) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Jurisdiction Breakdown */}
      {eng && (
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Jurisdiction Coverage
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(eng.rules_by_jurisdiction).map(([j, count]) => (
              <div
                key={j}
                className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3 text-center"
              >
                <div className="text-lg font-bold text-indigo-400">{count}</div>
                <div className="text-xs text-gray-500 mt-0.5">{j} Rules</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Action Distribution */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Action Distribution</h2>
          {actionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={actionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {actionData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#e5e7eb",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
              No check data yet
            </div>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {actionData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                <span className="text-[11px] text-gray-500">
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Risk Distribution</h2>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={riskData}>
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
                  {riskData.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
              No risk data yet
            </div>
          )}
        </div>

        {/* Daily Volume */}
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Check Volume</h2>
          {volumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => String(v).slice(5)}
                />
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
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#volumeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
              No volume data yet
            </div>
          )}
        </div>
      </div>

      {/* Compliance Trend + Drift Alert */}
      {trendData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <h2 className="text-sm font-medium text-gray-400 mb-4">Compliance Rate Trend (30 days)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="complianceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => String(v).slice(5)}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#e5e7eb",
                  }}
                  formatter={(value: number) => [`${value}%`, "Compliance Rate"]}
                />
                <Area
                  type="monotone"
                  dataKey="compliance_rate"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#complianceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <h2 className="text-sm font-medium text-gray-400 mb-4">Drift Detection</h2>
            {driftAlert ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  driftAlert.is_drifting
                    ? driftAlert.direction === "degrading"
                      ? "bg-red-500/10 border-red-500/20"
                      : "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-gray-500/10 border-gray-500/20"
                }`}>
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <div className={`text-lg font-bold ${
                    driftAlert.is_drifting
                      ? driftAlert.direction === "degrading" ? "text-red-400" : "text-emerald-400"
                      : "text-gray-400"
                  }`}>
                    {driftAlert.is_drifting
                      ? driftAlert.direction === "degrading" ? "⚠ Drift Detected" : "↑ Improving"
                      : "Stable"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0d1117] rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Baseline</div>
                    <div className="text-lg font-bold text-gray-300">{driftAlert.baseline_compliance_rate}%</div>
                    <div className="text-[10px] text-gray-600">{driftAlert.baseline_checks} checks</div>
                  </div>
                  <div className="bg-[#0d1117] rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500">Recent</div>
                    <div className="text-lg font-bold text-gray-300">{driftAlert.recent_compliance_rate}%</div>
                    <div className="text-[10px] text-gray-600">{driftAlert.recent_checks} checks</div>
                  </div>
                </div>

                {driftAlert.drift_percentage !== 0 && (
                  <div className="text-center">
                    <span className={`text-sm font-medium ${driftAlert.drift_percentage > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {driftAlert.drift_percentage > 0 ? "+" : ""}{driftAlert.drift_percentage}%
                    </span>
                    <span className="text-xs text-gray-600 ml-1">drift</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
                No drift data available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
        <h2 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Events
        </h2>
        {recentEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-[#1e293b]">
                  <th className="text-left py-2 font-medium">Timestamp</th>
                  <th className="text-left py-2 font-medium">Request ID</th>
                  <th className="text-left py-2 font-medium">Jurisdiction</th>
                  <th className="text-left py-2 font-medium">Action</th>
                  <th className="text-left py-2 font-medium">Risk</th>
                  <th className="text-right py-2 font-medium">Rules</th>
                  <th className="text-right py-2 font-medium">Latency</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((ev) => (
                  <tr
                    key={ev.request_id}
                    className="border-b border-[#1e293b]/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-2.5 text-gray-400 font-mono text-xs">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 text-gray-300 font-mono text-xs">
                      {ev.request_id.slice(0, 12)}...
                    </td>
                    <td className="py-2.5">
                      <Badge variant="default" size="sm">{ev.jurisdiction}</Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge variant={ev.action.toLowerCase() as "pass" | "flag" | "block" | "warn"}>
                        {ev.action}
                      </Badge>
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={ev.risk_level.toLowerCase() as "low" | "medium" | "high" | "critical"}
                      >
                        {ev.risk_level}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right text-gray-400">{ev.rules_triggered}</td>
                    <td className="py-2.5 text-right text-gray-500 font-mono text-xs">
                      {ev.latency_ms.toFixed(1)}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-600 py-8">
            No events recorded yet. Run a compliance check to see data here.
          </div>
        )}
      </div>

      {/* Engine Info */}
      {eng && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "PII Patterns", value: eng.pii_patterns },
            { label: "Blocklist Rules", value: eng.blocklist_rules },
            { label: "Custom Policies", value: `${eng.custom_policies_active} / ${eng.custom_policies}` },
            { label: "Retrieval Method", value: eng.retrieval_method.toUpperCase() },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-[#111827] rounded-lg border border-[#1e293b] p-3 text-center"
            >
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="text-sm font-medium text-gray-300 mt-1">{item.value}</div>
            </div>
          ))}
          <div className={`bg-[#111827] rounded-lg border p-3 text-center ${auditIntegrity ? (auditIntegrity.valid ? "border-emerald-500/30" : "border-red-500/30") : "border-[#1e293b]"}`}>
            <div className="text-xs text-gray-500">Audit Integrity</div>
            {auditIntegrity ? (
              <div className={`text-sm font-medium mt-1 ${auditIntegrity.valid ? "text-emerald-400" : "text-red-400"}`}>
                {auditIntegrity.valid ? "✓" : "✗"} {auditIntegrity.verified}/{auditIntegrity.total}
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-500 mt-1">—</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
