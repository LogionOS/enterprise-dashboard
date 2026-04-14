"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { SystemStatus } from "@/lib/types";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Server,
  Database,
  Cpu,
  Zap,
  Webhook,
  RefreshCw,
} from "lucide-react";

const COMPONENT_ICONS: Record<string, typeof Server> = {
  engine: Cpu,
  database: Database,
  api: Server,
  ai_judge: Zap,
  webhooks: Webhook,
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  operational: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  degraded: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  limited: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  starting: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  down: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
};

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const load = async () => {
    try {
      const data = await api.systemStatus();
      setStatus(data);
      setLastChecked(new Date());
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const overallColor = status
    ? STATUS_COLORS[status.status] || STATUS_COLORS.down
    : STATUS_COLORS.down;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">System Status</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time operational status of LogionOS services
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-xl border p-6 ${overallColor.bg} border-white/10`}>
        <div className="flex items-center gap-3">
          {status?.status === "operational" ? (
            <CheckCircle className={`w-8 h-8 ${overallColor.text}`} />
          ) : (
            <AlertTriangle className={`w-8 h-8 ${overallColor.text}`} />
          )}
          <div>
            <h2 className={`text-xl font-semibold capitalize ${overallColor.text}`}>
              {status ? (status.status === "operational" ? "All Systems Operational" : `System ${status.status}`) : "Unable to connect"}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {status ? `v${status.version}` : ""} 
              {lastChecked && ` · Last checked ${lastChecked.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Uptime */}
      {status && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-300">
            Uptime: <span className="font-mono text-gray-100">{formatUptime(status.uptime_seconds)}</span>
          </span>
        </div>
      )}

      {/* Component Status */}
      {status && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Components</h3>
          <div className="space-y-2">
            {Object.entries(status.components).map(([name, state]) => {
              const colors = STATUS_COLORS[state] || STATUS_COLORS.down;
              const Icon = COMPONENT_ICONS[name] || Server;
              return (
                <div
                  key={name}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#0d1117] border border-[#1e293b]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-200 capitalize font-medium">
                      {name.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className={`text-xs font-medium capitalize ${colors.text}`}>{state}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* API Info */}
      <div className="rounded-lg bg-[#0d1117] border border-[#1e293b] p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-400">API Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Endpoint</span>
            <p className="text-gray-200 font-mono text-xs mt-0.5">https://logionos-api.onrender.com</p>
          </div>
          <div>
            <span className="text-gray-500">Version</span>
            <p className="text-gray-200 font-mono text-xs mt-0.5">{status?.version || "—"}</p>
          </div>
          <div>
            <span className="text-gray-500">Rate Limit</span>
            <p className="text-gray-200 font-mono text-xs mt-0.5">100 req/min (default)</p>
          </div>
          <div>
            <span className="text-gray-500">Response Format</span>
            <p className="text-gray-200 font-mono text-xs mt-0.5">JSON + RFC 7807 errors</p>
          </div>
        </div>
      </div>
    </div>
  );
}
