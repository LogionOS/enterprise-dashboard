"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, ChevronRight, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { RuleSummary, RuleDetail } from "@/lib/types";

const JURISDICTIONS = ["ALL", "US", "EU", "JP", "UK", "SG"];

export default function RulesPage() {
  const [rules, setRules] = useState<RuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [jurisdiction, setJurisdiction] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<RuleDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const j = jurisdiction === "ALL" ? undefined : jurisdiction;
        const res = await api.rules(j);
        setRules(res.rules);
      } catch (e) {
        toast(`Failed to load rules: ${e instanceof Error ? e.message : e}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jurisdiction]);

  const filtered = search
    ? rules.filter(
        (r) =>
          r.id.toLowerCase().includes(search.toLowerCase()) ||
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.regulation.toLowerCase().includes(search.toLowerCase())
      )
    : rules;

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const detail = await api.ruleDetail(id);
      setSelected(detail);
    } catch (e) {
      toast(`Failed to load rule detail: ${e instanceof Error ? e.message : e}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const severityColor = (s: number) => {
    if (s >= 0.8) return "text-red-400";
    if (s >= 0.6) return "text-orange-400";
    if (s >= 0.4) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" /> Regulation Rules
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {rules.length} rules loaded {jurisdiction !== "ALL" && `(${jurisdiction})`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          {JURISDICTIONS.map((j) => (
            <button
              key={j}
              onClick={() => setJurisdiction(j)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                jurisdiction === j
                  ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                  : "bg-[#111827] text-gray-500 border-[#1e293b] hover:text-gray-300"
              }`}
            >
              {j}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rules by ID, title, or regulation..."
            className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none w-full"
          />
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#0d1117] z-10">
                <tr className="text-gray-500 text-xs border-b border-[#1e293b]">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">Title</th>
                  <th className="text-left py-3 px-4 font-medium">Regulation</th>
                  <th className="text-left py-3 px-4 font-medium">Jurisdiction</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-right py-3 px-4 font-medium">Severity</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openDetail(r.id)}
                    className="border-b border-[#1e293b]/30 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-4 text-indigo-400 font-mono text-xs">
                      {r.id}
                    </td>
                    <td className="py-2.5 px-4 text-gray-300 text-xs max-w-[250px] truncate">
                      {r.title}
                    </td>
                    <td className="py-2.5 px-4 text-gray-500 text-xs max-w-[150px] truncate">
                      {r.regulation}
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant="default">{r.jurisdiction}</Badge>
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge
                        variant={
                          r.risk_category.includes("unacceptable") || r.risk_category.includes("block")
                            ? "critical"
                            : r.risk_category.includes("high")
                            ? "high"
                            : r.risk_category.includes("flag")
                            ? "medium"
                            : "low"
                        }
                      >
                        {r.risk_category}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant={r.action.toLowerCase() as "pass" | "flag" | "block" | "warn"}>
                        {r.action}
                      </Badge>
                    </td>
                    <td className={`py-2.5 px-4 text-right font-mono text-xs ${severityColor(r.severity)}`}>
                      {r.severity.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-600 py-16">
            {rules.length === 0 ? "No rules loaded." : "No rules match your search."}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-lg bg-[#111827] border-l border-[#1e293b] h-full overflow-y-auto p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selected ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-indigo-400 font-mono text-sm">{selected.id}</span>
                    <h2 className="text-lg font-semibold text-gray-100 mt-1">{selected.title}</h2>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoBlock label="Jurisdiction" value={selected.jurisdiction} />
                  <InfoBlock label="Regulation" value={selected.regulation} />
                  <InfoBlock label="Article" value={selected.article} />
                  <InfoBlock label="Risk Category" value={selected.risk_category} />
                  <InfoBlock label="Action" value={selected.action} />
                  <InfoBlock label="Severity" value={selected.severity.toFixed(2)} />
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Triggers</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.triggers.map((t) => (
                      <span key={t} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-md border border-indigo-500/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Conditions</h3>
                  <p className="text-sm text-gray-300">{selected.conditions}</p>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Obligation</h3>
                  <p className="text-sm text-gray-300">{selected.obligation}</p>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Full Text</h3>
                  <p className="text-sm text-gray-400 leading-relaxed bg-[#0d1117] rounded-lg p-4 border border-[#1e293b]">
                    {selected.full_text}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm text-gray-300 mt-0.5 font-medium">{value}</div>
    </div>
  );
}
