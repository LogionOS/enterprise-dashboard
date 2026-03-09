"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Key, Plus, Trash2, Copy, CheckCircle, AlertTriangle, Clock, ShieldAlert,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { isAdmin } from "@/lib/auth";

interface ApiKeyEntry {
  id: number;
  key_prefix: string;
  role: string;
  label: string;
  is_active: number;
  created_at: string;
  revoked_at: string | null;
}

const ROLES = [
  { value: "developer", label: "Developer", desc: "Check, Rules, Policies" },
  { value: "auditor", label: "Auditor", desc: "Audit, Analytics, Reports" },
  { value: "admin", label: "Admin", desc: "Full access" },
  { value: "viewer", label: "Viewer", desc: "Health only" },
];

export default function ApiKeysPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState("developer");
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);

  const [newKey, setNewKey] = useState("");
  const [copied, setCopied] = useState(false);

  const loadKeys = async () => {
    try {
      setError("");
      const res = await api.listApiKeys();
      setKeys(res.keys);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin()) {
      router.replace("/");
      return;
    }
    setAuthorized(true);
    loadKeys();
  }, [router]);

  const handleCreate = async () => {
    if (!newLabel.trim()) {
      toast("Please enter a label", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await api.createApiKey(newRole, newLabel.trim());
      setNewKey(res.api_key);
      setNewLabel("");
      setNewRole("developer");
      loadKeys();
      toast("API key created", "success");
    } catch (e) {
      toast(String(e), "error");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: number, prefix: string) => {
    if (!confirm(`Revoke key ${prefix}...? This cannot be undone.`)) return;
    try {
      await api.revokeApiKey(id);
      loadKeys();
      toast("Key revoked", "success");
    } catch (e) {
      toast(String(e), "error");
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeKeys = keys.filter((k) => k.is_active);
  const revokedKeys = keys.filter((k) => !k.is_active);

  if (!authorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-gray-400 text-sm">Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <Key className="w-7 h-7 text-indigo-400" />
            API Keys
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage API keys for your team and integrations
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setNewKey(""); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Key
        </button>
      </div>

      {/* Create Key Panel */}
      {showCreate && (
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-200">New API Key</h2>

          {newKey ? (
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Key created — copy it now, it won&apos;t be shown again
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black/30 rounded px-3 py-2 text-sm text-gray-200 font-mono break-all select-all">
                    {newKey}
                  </code>
                  <button
                    onClick={copyKey}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    title="Copy"
                  >
                    {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                onClick={() => { setNewKey(""); setShowCreate(false); }}
                className="text-sm text-gray-400 hover:text-gray-200"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Label</label>
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Acme Corp, staging, CI/CD"
                  className="w-full bg-black/30 border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-black/30 border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-indigo-500 focus:outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  {creating ? "Creating..." : "Generate Key"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Active Keys */}
      {!loading && (
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] overflow-hidden">
          <div className="px-5 py-3 border-b border-[#1e293b]">
            <h2 className="text-sm font-semibold text-gray-200">
              Active Keys
              <span className="ml-2 text-gray-500 font-normal">({activeKeys.length})</span>
            </h2>
          </div>

          {activeKeys.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No active API keys. Create one to get started.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-[#1e293b]">
                  <th className="text-left px-5 py-2.5 font-medium">Key</th>
                  <th className="text-left px-5 py-2.5 font-medium">Label</th>
                  <th className="text-left px-5 py-2.5 font-medium">Role</th>
                  <th className="text-left px-5 py-2.5 font-medium">Created</th>
                  <th className="text-right px-5 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeKeys.map((k) => (
                  <tr key={k.id} className="border-b border-[#1e293b] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <code className="text-gray-300 font-mono text-xs bg-black/20 rounded px-1.5 py-0.5">
                        {k.key_prefix}...
                      </code>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{k.label || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge variant={k.role === "admin" ? "block" : k.role === "developer" ? "pass" : "flag"}>
                        {k.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(k.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleRevoke(k.id, k.key_prefix)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Revoked Keys */}
      {!loading && revokedKeys.length > 0 && (
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] overflow-hidden opacity-60">
          <div className="px-5 py-3 border-b border-[#1e293b]">
            <h2 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Revoked Keys
              <span className="text-gray-600 font-normal">({revokedKeys.length})</span>
            </h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {revokedKeys.map((k) => (
                <tr key={k.id} className="border-b border-[#1e293b]">
                  <td className="px-5 py-2.5">
                    <code className="text-gray-600 font-mono text-xs line-through">
                      {k.key_prefix}...
                    </code>
                  </td>
                  <td className="px-5 py-2.5 text-gray-600">{k.label || "—"}</td>
                  <td className="px-5 py-2.5 text-gray-600">{k.role}</td>
                  <td className="px-5 py-2.5 text-gray-600 text-xs">
                    Revoked {k.revoked_at ? new Date(k.revoked_at).toLocaleDateString() : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
