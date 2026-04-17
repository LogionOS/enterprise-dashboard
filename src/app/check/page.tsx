"use client";

import { useState } from "react";
import { Zap, Send, Clock, AlertTriangle, ShieldCheck, Ban } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { CheckResponse } from "@/lib/types";

const JURISDICTIONS = ["US", "EU", "JP", "UK", "SG", "HK", "ALL"];

const ACTION_TYPES = [
  { value: "prompt", label: "Prompt" },
  { value: "response", label: "Response" },
  { value: "tool_call", label: "Tool Call" },
  { value: "retrieval", label: "Retrieval" },
  { value: "memory_write", label: "Memory Write" },
  { value: "external_action", label: "External Action" },
  { value: "escalation", label: "Escalation" },
];

const EXAMPLES = [
  { label: "PII Exposure", query: "Use customer SSN 123-45-6789 to train the credit scoring model", jurisdiction: "US" },
  { label: "GDPR Violation", query: "Collect all user browsing data across our EU sites without consent for profiling", jurisdiction: "EU" },
  { label: "APPI Violation", query: "Transfer Japanese customer My Number data to overseas servers without notification", jurisdiction: "JP" },
  { label: "Financial Data", query: "Share internal margin rates and pricing structure with external partners", jurisdiction: "US" },
  { label: "Safe Query", query: "What are the best practices for data anonymization in machine learning?", jurisdiction: "US" },
];

export default function CheckPage() {
  const [query, setQuery] = useState("");
  const [responseText, setResponseText] = useState("");
  const [jurisdiction, setJurisdiction] = useState("US");
  const [actionType, setActionType] = useState("prompt");
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runCheck = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.check(query, jurisdiction, responseText || undefined, actionType);
      setResult(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (ex: typeof EXAMPLES[number]) => {
    setQuery(ex.query);
    setJurisdiction(ex.jurisdiction);
    setActionType("prompt");
    setResponseText("");
    setResult(null);
  };

  const ActionIcon = result?.action === "PASS" ? ShieldCheck :
                     result?.action === "BLOCK" ? Ban : AlertTriangle;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" /> Live Compliance Check
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Test any query against the LogionOS compliance engine in real time
        </p>
      </div>

      {/* Examples */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => loadExample(ex)}
            className="px-3 py-1.5 text-xs bg-[#111827] border border-[#1e293b] rounded-lg text-gray-400 hover:text-gray-200 hover:border-indigo-500/30 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Input Query</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter the AI prompt or user query to check..."
            rows={3}
            className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-indigo-500/50 resize-none font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">
            LLM Response (optional — enables output scan)
          </label>
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Paste the AI model's response to check for PII leakage and policy violations..."
            rows={2}
            className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-indigo-500/50 resize-none font-mono"
          />
        </div>

        <div className="flex items-end gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Jurisdiction</label>
            <div className="flex items-center gap-1.5">
              {JURISDICTIONS.map((j) => (
                <button
                  key={j}
                  onClick={() => setJurisdiction(j)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    jurisdiction === j
                      ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                      : "bg-[#0d1117] text-gray-500 border-[#1e293b] hover:text-gray-300"
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-0.5 block">Action Type</label>
            <span className="text-[10px] text-gray-600 mb-1.5 block">What type of AI action is being checked?</span>
            <div className="flex items-center gap-1.5">
              {ACTION_TYPES.map((at) => (
                <button
                  key={at.value}
                  onClick={() => setActionType(at.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    actionType === at.value
                      ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                      : "bg-[#0d1117] text-gray-500 border-[#1e293b] hover:text-gray-300"
                  }`}
                >
                  {at.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={runCheck}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors ml-auto"
          >
            <Send className="w-4 h-4" />
            {loading ? "Checking..." : "Run Check"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary + Engine Path Visualization */}
          <div className={`rounded-xl border p-5 ${
            result.action === "PASS" ? "bg-emerald-500/5 border-emerald-500/20" :
            result.action === "BLOCK" ? "bg-red-500/5 border-red-500/20" :
            "bg-amber-500/5 border-amber-500/20"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <ActionIcon className={`w-6 h-6 ${
                result.action === "PASS" ? "text-emerald-400" :
                result.action === "BLOCK" ? "text-red-400" : "text-amber-400"
              }`} />
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={result.action.toLowerCase() as "pass" | "flag" | "block" | "warn"} size="md">
                    {result.action}
                  </Badge>
                  <Badge variant={result.risk_level.toLowerCase() as "low" | "medium" | "high" | "critical"} size="md">
                    {result.risk_level}
                  </Badge>
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-gray-500/10 text-gray-400 border border-gray-500/20">
                    {ACTION_TYPES.find((at) => at.value === actionType)?.label ?? actionType}
                  </span>
                  <span className="text-xs text-gray-500">
                    Score: {(result.risk_score * 100).toFixed(1)}% &middot; Intent: {result.intent}
                  </span>
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-lg font-bold font-mono text-gray-300">{result.timing.total_ms.toFixed(1)}<span className="text-xs text-gray-500">ms</span></div>
                <div className="text-[10px] text-gray-500">end-to-end</div>
              </div>
            </div>

            {/* Engine Pipeline Visualization */}
            <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-4">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-indigo-400" /> Engine Pipeline — Route: <span className={`font-bold ${
                  result.path === "fast" ? "text-emerald-400" : result.path === "medium" ? "text-amber-400" : "text-red-400"
                }`}>{result.path.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-0">
                <PipelineStep
                  label="Layer 1 — FastCheck"
                  detail="PII Detection + Blocklist"
                  ms={result.timing.layer1_ms}
                  active
                  color="emerald"
                />
                <PipelineArrow />
                <PipelineStep
                  label="Layer 2 — RegMatch"
                  detail={`${result.retrieval_method.toUpperCase()} · ${result.rules_matched} rules`}
                  ms={result.timing.layer2_ms}
                  active
                  color={result.path === "fast" ? "emerald" : "amber"}
                />
                <PipelineArrow />
                <PipelineStep
                  label="Layer 3 — AI Judge"
                  detail={result.ai_judge ? `${result.ai_judge.model} · Score ${result.ai_judge.score}/100` : "Skipped (fast path)"}
                  ms={result.timing.layer3_ms}
                  active={result.path !== "fast"}
                  color={result.path === "deep" ? "red" : result.ai_judge ? "amber" : "default"}
                />
                <PipelineArrow />
                <PipelineStep
                  label="Decision"
                  detail={result.action}
                  active
                  color={result.action === "PASS" ? "emerald" : result.action === "BLOCK" ? "red" : "amber"}
                  isLast
                />
              </div>
            </div>
          </div>

          {/* PII */}
          {result.pii_detected && (
            <div className="bg-[#111827] rounded-xl border border-red-500/20 p-5">
              <h3 className="text-sm font-medium text-red-400 mb-3">PII Detected</h3>
              <div className="flex flex-wrap gap-2">
                {result.pii_items.map((p, i) => (
                  <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    <div className="text-xs text-red-400 font-mono">{p.type}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.masked_value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Rules */}
          {result.matched_rules.length > 0 && (
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                Matched Rules ({result.matched_rules.length})
              </h3>
              <div className="space-y-2">
                {result.matched_rules.map((r) => (
                  <div key={r.id} className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-indigo-400 font-mono text-xs">{r.id}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.action.toLowerCase() as "flag" | "block" | "warn"}>{r.action}</Badge>
                        <span className="text-xs text-gray-500">
                          Relevance: {(r.relevance_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">{r.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{r.regulation} — {r.article}</div>
                    {r.matched_triggers.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {r.matched_triggers.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[10px] rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Judge */}
          {result.ai_judge && (
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">AI Judge Assessment</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <MiniStat label="Score" value={`${result.ai_judge.score}/100`} />
                <MiniStat label="Model" value={result.ai_judge.model} />
                <MiniStat label="Latency" value={`${result.ai_judge.latency_ms.toFixed(0)}ms`} />
              </div>
              <p className="text-sm text-gray-300 bg-[#0d1117] rounded-lg p-3 border border-[#1e293b]">
                {result.ai_judge.reasoning}
              </p>
            </div>
          )}

          {/* Output Scan */}
          {result.output_scan && (
            <div className="bg-[#111827] rounded-xl border border-amber-500/20 p-5">
              <h3 className="text-sm font-medium text-amber-400 mb-3">Output Scan Results</h3>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={result.output_scan.action.toLowerCase() as "pass" | "flag" | "block"}>
                  {result.output_scan.action}
                </Badge>
                <Badge variant={result.output_scan.risk_level.toLowerCase() as "low" | "medium" | "high" | "critical"}>
                  {result.output_scan.risk_level}
                </Badge>
                {result.output_scan.pii_detected && (
                  <Badge variant="critical">PII LEAKAGE</Badge>
                )}
              </div>
              {result.output_scan.recommendations.length > 0 && (
                <ul className="space-y-1">
                  {result.output_scan.recommendations.map((r, i) => (
                    <li key={i} className="text-xs text-gray-400 flex gap-2">
                      <span className="text-amber-400">→</span> {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Recommendations</h3>
              <ul className="space-y-1.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-indigo-400">→</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PIPE_COLORS = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", dot: "bg-red-400" },
  default: { bg: "bg-gray-500/5", border: "border-gray-500/15", text: "text-gray-600", dot: "bg-gray-600" },
};

function PipelineStep({ label, detail, ms, active, color, isLast }: {
  label: string; detail: string; ms?: number; active: boolean;
  color: keyof typeof PIPE_COLORS; isLast?: boolean;
}) {
  const c = active ? PIPE_COLORS[color] : PIPE_COLORS.default;
  return (
    <div className={`flex-1 ${isLast ? "" : ""}`}>
      <div className={`rounded-lg border p-2.5 ${c.bg} ${c.border} ${!active ? "opacity-40" : ""}`}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          <span className={`text-[10px] font-medium ${c.text}`}>{label}</span>
        </div>
        <div className="text-[10px] text-gray-500">{detail}</div>
        {ms !== undefined && (
          <div className={`text-xs font-mono font-bold mt-1 ${c.text}`}>{ms.toFixed(1)}ms</div>
        )}
      </div>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="flex-shrink-0 px-1">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 8H12M12 8L9 5M12 8L9 11" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0d1117] rounded-lg p-2">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className="text-xs text-gray-300 font-mono mt-0.5">{value}</div>
    </div>
  );
}
