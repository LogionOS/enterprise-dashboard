"use client";

import { useEffect, useState } from "react";
import { Package, Globe, Shield, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { PolicyPack, PolicyPackDetail } from "@/lib/types";

const JURISDICTION_COLORS: Record<string, string> = {
  US: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EU: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  JP: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  UK: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  SG: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  HK: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ALL: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function PacksPage() {
  const [packs, setPacks] = useState<PolicyPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPack, setSelectedPack] = useState<PolicyPackDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api
      .packs()
      .then((data) => setPacks(data.packs))
      .catch(() => setPacks([]))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (packId: string) => {
    setDetailLoading(true);
    try {
      const detail = await api.packDetail(packId);
      setSelectedPack(detail);
    } catch {
      setSelectedPack(null);
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
          <Package className="w-5 h-5 text-indigo-400" /> Policy Packs
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pre-built compliance packages grouping rules by regulatory framework.
          Select a pack to focus enforcement on specific jurisdictions and regulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map((pack) => (
          <button
            key={pack.id}
            onClick={() => openDetail(pack.id)}
            className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 text-left hover:border-indigo-500/40 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span
                  className={`px-2 py-0.5 text-xs rounded-full border ${
                    JURISDICTION_COLORS[pack.jurisdiction] || "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {pack.jurisdiction}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
            </div>

            <h3 className="text-sm font-semibold text-gray-100 mb-1">{pack.name}</h3>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{pack.description}</p>

            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-indigo-400">{pack.rule_count.toLocaleString()}</div>
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">Rules</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {pack.regulations.slice(0, 4).map((r) => (
                <span
                  key={r}
                  className="px-1.5 py-0.5 text-[10px] bg-[#0d1117] text-gray-500 rounded border border-[#1e293b]"
                >
                  {r}
                </span>
              ))}
              {pack.regulations.length > 4 && (
                <span className="text-[10px] text-gray-600">+{pack.regulations.length - 4}</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {(selectedPack || detailLoading) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#161b22] border border-[#1e293b] rounded-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedPack ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-100">{selectedPack.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedPack.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedPack(null)}
                    className="text-gray-500 hover:text-gray-300 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3 text-center">
                    <div className="text-lg font-bold text-indigo-400">
                      {selectedPack.rule_count.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Total Rules</div>
                  </div>
                  <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="text-lg font-bold text-emerald-400">{selectedPack.jurisdiction}</span>
                    </div>
                    <div className="text-xs text-gray-500">Jurisdiction</div>
                  </div>
                  <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3 text-center">
                    <div className="text-lg font-bold text-amber-400">{selectedPack.regulations.length}</div>
                    <div className="text-xs text-gray-500">Regulations</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">
                    Regulations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPack.regulations.map((r) => (
                      <span
                        key={r}
                        className="px-2 py-1 text-xs bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">
                    Industries
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPack.industries.map((ind) => (
                      <span
                        key={ind}
                        className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedPack.rule_ids.length > 0 && (
                  <div>
                    <h3 className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">
                      Rule IDs {selectedPack.rule_ids_truncated && `(showing ${selectedPack.rule_ids.length} of ${selectedPack.total_rule_ids})`}
                    </h3>
                    <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-3 max-h-48 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {selectedPack.rule_ids.map((id) => (
                          <span key={id} className="px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-[#161b22] rounded">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedPack(null)}
                  className="w-full py-2 bg-[#1e293b] text-gray-300 rounded-lg text-sm hover:bg-[#2d3b4f] transition-colors"
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
