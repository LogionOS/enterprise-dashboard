"use client";

import { useEffect, useState } from "react";
import { GitBranch, Clock, ChevronDown, ChevronRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { TraceSummary, TraceEntry } from "@/lib/types";

export default function TracesPage() {
  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);
  const [traceEntries, setTraceEntries] = useState<TraceEntry[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api
      .traces(50)
      .then((data) => setTraces(data.traces))
      .catch(() => setTraces([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleTrace = async (traceId: string) => {
    if (expandedTrace === traceId) {
      setExpandedTrace(null);
      setTraceEntries([]);
      return;
    }
    setExpandedTrace(traceId);
    setDetailLoading(true);
    try {
      const detail = await api.traceDetail(traceId);
      setTraceEntries(detail.entries);
    } catch {
      setTraceEntries([]);
    }
    setDetailLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-400" /> Agent Workflow Traces
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Linked compliance checks across multi-agent AI workflows. Each trace groups related checks by trace_id.
        </p>
      </div>

      {traces.length === 0 ? (
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-16 text-center">
          <GitBranch className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No agent traces yet.</p>
          <p className="text-gray-600 text-xs mt-1">
            Send compliance checks with a <code className="text-indigo-400">trace_id</code> parameter to see linked workflows here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {traces.map((trace) => (
            <div key={trace.trace_id} className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleTrace(trace.trace_id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                {expandedTrace === trace.trace_id ? (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-indigo-400 truncate">{trace.trace_id}</span>
                    <Badge
                      variant={trace.worst_action.toLowerCase() as "pass" | "flag" | "block" | "warn"}
                    >
                      {trace.worst_action}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{trace.span_count} spans</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(trace.started_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {trace.actions.split(",").map((a) => (
                    <span
                      key={a}
                      className={`w-2 h-2 rounded-full ${
                        a === "BLOCK"
                          ? "bg-red-400"
                          : a === "FLAG"
                          ? "bg-amber-400"
                          : a === "WARN"
                          ? "bg-orange-400"
                          : "bg-emerald-400"
                      }`}
                    />
                  ))}
                </div>
              </button>

              {expandedTrace === trace.trace_id && (
                <div className="border-t border-[#1e293b] px-4 pb-4">
                  {detailLoading ? (
                    <div className="py-6 text-center">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : traceEntries.length === 0 ? (
                    <div className="py-4 text-center text-gray-600 text-sm">No spans found</div>
                  ) : (
                    <div className="mt-3 space-y-1">
                      {traceEntries.map((entry, idx) => (
                        <div
                          key={entry.request_id}
                          className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#0d1117] transition-colors"
                        >
                          <div className="w-6 text-center text-xs text-gray-600 font-mono">
                            {idx + 1}
                          </div>
                          <div
                            className={`w-1.5 h-8 rounded-full ${
                              entry.action === "BLOCK"
                                ? "bg-red-500"
                                : entry.action === "FLAG"
                                ? "bg-amber-500"
                                : entry.action === "WARN"
                                ? "bg-orange-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-200 font-medium truncate">
                                {entry.span_name || entry.request_id}
                              </span>
                              <Badge
                                variant={entry.action.toLowerCase() as "pass" | "flag" | "block" | "warn"}
                                size="sm"
                              >
                                {entry.action}
                              </Badge>
                              <Badge
                                variant={entry.risk_level.toLowerCase() as "low" | "medium" | "high" | "critical"}
                                size="sm"
                              >
                                {entry.risk_level}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                              <span className="font-mono">{entry.request_id.slice(0, 12)}</span>
                              <span>{entry.jurisdiction}</span>
                              <span>{entry.latency_ms?.toFixed(1)}ms</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 flex-shrink-0">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
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
