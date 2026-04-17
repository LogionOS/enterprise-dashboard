"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  Users,
  UserCheck,
  Zap,
  AlertTriangle,
  Globe,
  Briefcase,
  Clock,
  Loader2,
  ArrowRight,
  MessageSquareHeart,
  ArrowUpCircle,
  Star,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { api } from "@/lib/api";
import type { CohortAnalytics } from "@/lib/types";

export default function ProgramDashboardPage() {
  const [data, setData] = useState<CohortAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.programAnalytics();
      setData(res);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading analytics…
      </div>
    );
  }

  const funnel = data.funnel;
  const funnelSteps = [
    { label: "Applied", value: funnel.applied, color: "bg-blue-500" },
    { label: "Accepted", value: funnel.accepted, color: "bg-indigo-500" },
    { label: "Activated", value: funnel.activated, color: "bg-emerald-500" },
    { label: "Active (7d)", value: funnel.active_7d, color: "bg-green-400" },
  ];
  const maxFunnel = Math.max(funnel.applied, 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-indigo-400" />
          Founder Program
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Cohort analytics and program health overview
        </p>
      </div>

      {/* KPI Cards — 30-Day Program Health */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
        <KPICard icon={Users} label="Applications" value={data.total_applicants} color="text-blue-400" />
        <KPICard icon={UserCheck} label="Accepted" value={data.accepted} color="text-indigo-400" />
        <KPICard icon={Zap} label="Activated" value={data.activated} color="text-emerald-400" />
        <KPICard icon={TrendingUp} label="Active (7d)" value={data.active_7d} color="text-green-400" />
        <KPICard icon={Star} label="Design Partners" value={data.design_partners ?? 0} color="text-amber-400" />
        <KPICard icon={MessageSquareHeart} label="Testimonials" value={data.testimonials_submitted} color="text-pink-400" />
        <KPICard icon={ShieldCheck} label="Enterprise-Ready" value={data.enterprise_readiness_signals ?? 0} color="text-violet-400" />
        <KPICard icon={DollarSign} label="Paid Candidates" value={data.paid_conversion_candidates ?? 0} color="text-cyan-400" />
        <KPICard icon={AlertTriangle} label="Dormant (30d+)" value={data.dormant_30d} color="text-yellow-400" />
        <KPICard icon={ArrowUpCircle} label="Legacy Convert" value={data.conversion_candidates} color="text-gray-400" />
      </div>

      {/* Conversion Funnel */}
      <div className="bg-[#161b22] border border-[#1e293b] rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-200 mb-5">Conversion Funnel</h2>
        <div className="space-y-4">
          {funnelSteps.map((step, i) => {
            const pct = maxFunnel > 0 ? (step.value / maxFunnel) * 100 : 0;
            const prevValue = i > 0 ? funnelSteps[i - 1].value : step.value;
            const convRate = prevValue > 0 ? ((step.value / prevValue) * 100).toFixed(0) : "—";
            return (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-28 text-sm text-gray-400 text-right shrink-0">
                  {step.label}
                </div>
                <div className="flex-1 bg-[#0d1117] rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full flex items-center px-3 transition-all duration-500`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  >
                    <span className="text-xs font-bold text-white">{step.value}</span>
                  </div>
                </div>
                <div className="w-16 text-xs text-gray-500 shrink-0">
                  {i > 0 && <span>{convRate}%</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Breakdown + By Country + By Vertical */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Status */}
        <div className="bg-[#161b22] border border-[#1e293b] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" /> By Status
          </h3>
          <div className="space-y-2">
            {Object.entries(data.by_status).map(([s, cnt]) => (
              <div key={s} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 capitalize">{s}</span>
                <span className="text-gray-200 font-medium">{cnt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Country */}
        <div className="bg-[#161b22] border border-[#1e293b] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" /> By Country
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Object.entries(data.by_country).length === 0 ? (
              <p className="text-gray-600 text-sm">No data yet</p>
            ) : (
              Object.entries(data.by_country).map(([c, cnt]) => (
                <div key={c} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{c}</span>
                  <span className="text-gray-200 font-medium">{cnt}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Vertical */}
        <div className="bg-[#161b22] border border-[#1e293b] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" /> By Vertical
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Object.entries(data.by_vertical).length === 0 ? (
              <p className="text-gray-600 text-sm">No data yet</p>
            ) : (
              Object.entries(data.by_vertical).map(([v, cnt]) => (
                <div key={v} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{v}</span>
                  <span className="text-gray-200 font-medium">{cnt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Usage Teams */}
      {data.top_usage.length > 0 && (
        <div className="bg-[#161b22] border border-[#1e293b] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">Top Usage Teams</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left py-2 px-3">#</th>
                  <th className="text-left py-2 px-3">Company</th>
                  <th className="text-left py-2 px-3">Founder</th>
                  <th className="text-right py-2 px-3">API Calls</th>
                  <th className="text-right py-2 px-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {data.top_usage.map((team, i) => (
                  <tr key={team.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-gray-500">{i + 1}</td>
                    <td className="py-3 px-3 text-gray-200 font-medium">{team.company || "—"}</td>
                    <td className="py-3 px-3 text-gray-400">{team.founder_name}</td>
                    <td className="py-3 px-3 text-right text-gray-200 font-mono">{team.usage_total.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-gray-500">{team.last_active_at?.slice(0, 10) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expiring Soon */}
      {data.expiring_soon.length > 0 && (
        <div className="bg-[#161b22] border border-[#1e293b] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Expiring Soon (within 30 days)
          </h2>
          <div className="space-y-2">
            {data.expiring_soon.map((team) => (
              <div key={team.id} className="flex items-center justify-between bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm text-gray-200 font-medium">{team.company || team.founder_name}</p>
                  <p className="text-xs text-gray-500">{team.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-yellow-400">Issued: {team.issued_at?.slice(0, 10)}</p>
                  <a
                    href={`mailto:${team.email}?subject=LogionOS%20Founder%20Program%20Renewal`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 justify-end mt-1"
                  >
                    Contact <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-[#161b22] border border-[#1e293b] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
    </div>
  );
}
