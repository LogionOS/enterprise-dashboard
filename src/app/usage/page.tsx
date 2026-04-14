"use client";

import { useCallback, useEffect, useState, type ElementType } from "react";
import {
  BarChart3,
  Activity,
  Zap,
  Brain,
  Shield,
  Bell,
  CalendarRange,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";
import type { UsageInfo, UsageHistoryEntry } from "@/lib/types";

type QuotaTone = "emerald" | "amber" | "red";

function quotaTone(pct: number): QuotaTone {
  if (pct > 80) return "red";
  if (pct > 60) return "amber";
  return "emerald";
}

const ICON_TONE: Record<QuotaTone, string> = {
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  red: "text-red-400",
};

const BAR_TONE: Record<QuotaTone, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

const LABEL_TONE: Record<QuotaTone, string> = {
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  red: "text-red-400",
};

function QuotaBar({
  label,
  used,
  limit,
  icon: Icon,
}: {
  label: string;
  used: number;
  limit: number;
  icon: ElementType;
}) {
  const unlimited = limit <= 0;
  const pct = !unlimited && limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const tone = quotaTone(pct);
  const remaining = unlimited ? 0 : Math.max(0, limit - used);

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${unlimited ? "text-gray-500" : ICON_TONE[tone]}`} />
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-mono text-gray-400">
          {unlimited ? "Unlimited" : `${used.toLocaleString()} / ${limit.toLocaleString()}`}
        </span>
      </div>
      {!unlimited && (
        <>
          <div className="w-full bg-[#1e293b] rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${BAR_TONE[tone]}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className={`text-[10px] ${LABEL_TONE[tone]}`}>{pct.toFixed(1)}% used</span>
            <span className="text-[10px] text-gray-600">{remaining.toLocaleString()} remaining</span>
          </div>
        </>
      )}
    </div>
  );
}

function ResourceMeter({
  label,
  used,
  limit,
  icon: Icon,
}: {
  label: string;
  used: number;
  limit: number;
  icon: ElementType;
}) {
  const unknownLimit = limit < 0;
  const unlimited = limit === 0;
  const pct = !unlimited && !unknownLimit && limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const tone = unknownLimit || unlimited ? "emerald" : quotaTone(pct);

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${ICON_TONE[tone]}`} />
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-mono text-gray-400">
          {unknownLimit ? `${used.toLocaleString()} (no limit)` : unlimited ? `${used.toLocaleString()} · Unlimited` : `${used.toLocaleString()} / ${limit.toLocaleString()}`}
        </span>
      </div>
      {!unlimited && !unknownLimit && limit > 0 && (
        <>
          <div className="w-full bg-[#1e293b] rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${BAR_TONE[tone]}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className={`text-[10px] ${LABEL_TONE[tone]}`}>{pct.toFixed(0)}% of quota</span>
            <span className="text-[10px] text-gray-600">{Math.max(0, limit - used).toLocaleString()} left</span>
          </div>
        </>
      )}
    </div>
  );
}

function UsageChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; color?: string; dataKey?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const calls = payload.find((p) => p.dataKey === "calls")?.value ?? 0;
  const llm = payload.find((p) => p.dataKey === "llm_calls")?.value ?? 0;
  return (
    <div
      className="rounded-lg border border-[#374151] px-3 py-2 shadow-lg"
      style={{ background: "#1f2937" }}
    >
      <div className="text-[11px] text-gray-400 mb-1.5 font-mono">{label}</div>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-6">
          <span className="text-indigo-300">API calls</span>
          <span className="font-mono text-gray-100">{Number(calls).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-emerald-300">LLM checks</span>
          <span className="font-mono text-gray-100">{Number(llm).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [history, setHistory] = useState<UsageHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, h] = await Promise.all([api.usage(), api.usageHistory(30)]);
      setUsage(u);
      setHistory(h.history ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load usage data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading usage & quota…</span>
        </div>
      </div>
    );
  }

  const chartData = history.map((row) => ({
    ...row,
    shortDate: row.date.length >= 10 ? row.date.slice(5) : row.date,
  }));

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-100 tracking-tight">Usage & Quota</h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitor API consumption, LLM deep checks, and plan limits.</p>
          </div>
        </div>
        {usage && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              {usage.tier || "Standard"}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="text-xs font-medium text-red-200 hover:text-white underline underline-offset-2 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {usage && (
        <>
          {/* Quota progress */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-400">Current quota</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuotaBar label="Monthly API calls" used={usage.monthly_used} limit={usage.monthly_limit} icon={Activity} />
              <QuotaBar label="Daily API calls" used={usage.daily_used} limit={usage.daily_limit} icon={Zap} />
              <QuotaBar label="LLM deep checks" used={usage.llm_monthly_used} limit={usage.llm_monthly_limit} icon={Brain} />
            </div>
          </section>

          {/* Resources */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-400">Resource usage</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResourceMeter
                label="Policies"
                used={usage.policies_used ?? 0}
                limit={usage.policies_limit ?? -1}
                icon={Shield}
              />
              <ResourceMeter
                label="Webhooks"
                used={usage.webhooks_used ?? 0}
                limit={usage.webhooks_limit ?? -1}
                icon={Bell}
              />
            </div>
          </section>

          {/* Billing period */}
          <div className="flex items-center gap-3 rounded-xl border border-[#1e293b] bg-[#111827] px-4 py-3">
            <CalendarRange className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Current billing period</div>
              <div className="text-sm text-gray-200 mt-0.5">{usage.period || "—"}</div>
            </div>
          </div>

          {/* History chart */}
          <section className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-400">Usage history (30 days)</h2>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  API calls
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  LLM checks
                </span>
              </div>
            </div>
            {chartData.length > 0 ? (
              <div className="h-[280px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="usageCallsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="usageLlmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="shortDate"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      minTickGap={24}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip
                      content={(props) => <UsageChartTooltip {...props} />}
                      cursor={{ stroke: "#475569", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      name="API calls"
                      stroke="#818cf8"
                      strokeWidth={2}
                      fill="url(#usageCallsGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#a5b4fc", stroke: "#1e293b", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="llm_calls"
                      name="LLM checks"
                      stroke="#34d399"
                      strokeWidth={2}
                      fill="url(#usageLlmGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#6ee7b7", stroke: "#1e293b", strokeWidth: 1 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-gray-600 text-sm border border-dashed border-[#1e293b] rounded-lg">
                No history for this range yet
              </div>
            )}
          </section>
        </>
      )}

      {!usage && !error && (
        <div className="rounded-xl border border-[#1e293b] bg-[#111827] px-4 py-8 text-center text-sm text-gray-500">
          No usage data returned from the API.
        </div>
      )}
    </div>
  );
}
