"use client";

import { useEffect, useState } from "react";
import { Shield, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import type { PolicyResponse } from "@/lib/types";

interface PolicyForm {
  name: string;
  description: string;
  category: string;
  triggers: string;
  conditions: string;
  action: string;
  severity: number;
  response_message: string;
  enabled: boolean;
  denied_resource_tags: string;
  allowed_agent_roles: string;
  scope_type: string;
  scope_values: string;
}

const EMPTY_FORM: PolicyForm = {
  name: "",
  description: "",
  category: "general",
  triggers: "",
  conditions: "",
  action: "FLAG",
  severity: 0.5,
  response_message: "",
  enabled: true,
  denied_resource_tags: "",
  allowed_agent_roles: "",
  scope_type: "global",
  scope_values: "",
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PolicyForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.policies();
      setPolicies(res.policies);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Failed to load policies: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p: PolicyResponse) => {
    setForm({
      name: p.name,
      description: p.description,
      category: p.category,
      triggers: p.triggers.join(", "),
      conditions: p.conditions,
      action: p.action,
      severity: p.severity,
      response_message: p.response_message,
      enabled: p.enabled,
      denied_resource_tags: (p.denied_resource_tags || []).join(", "),
      allowed_agent_roles: (p.allowed_agent_roles || []).join(", "),
      scope_type: p.scope_type || "global",
      scope_values: (p.scope_values || []).join(", "),
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const isResourceAccess = form.category === "resource_access";

  const handleSave = async () => {
    setSaving(true);
    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description,
      category: form.category,
      triggers: isResourceAccess ? [] : form.triggers.split(",").map((t) => t.trim()).filter(Boolean),
      conditions: form.conditions,
      action: isResourceAccess ? "BLOCK" : form.action,
      severity: form.severity,
      response_message: form.response_message,
      enabled: form.enabled,
    };
    if (isResourceAccess) {
      payload.denied_resource_tags = form.denied_resource_tags.split(",").map((t) => t.trim()).filter(Boolean);
      payload.allowed_agent_roles = form.allowed_agent_roles.split(",").map((t) => t.trim()).filter(Boolean);
    }
    payload.scope_type = form.scope_type;
    payload.scope_values = form.scope_values.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      if (editingId) {
        await api.updatePolicy(editingId, payload);
      } else {
        await api.createPolicy(payload);
      }
      setShowModal(false);
      await load();
    } catch (e) {
      toast(`Failed to save policy: ${e instanceof Error ? e.message : e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this policy?")) return;
    try {
      await api.deletePolicy(id);
      await load();
    } catch (e) {
      toast(`Failed to delete policy: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /> Custom Policies
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enterprise-specific compliance rules
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Policy
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <span className="text-sm text-red-400">{error}</span>
          <button onClick={load} className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">Retry</button>
        </div>
      )}

      {/* Policies Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : policies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p) => (
            <div
              key={p.id}
              className={`bg-[#111827] rounded-xl border p-5 transition-colors ${
                p.enabled ? "border-[#1e293b]" : "border-[#1e293b] opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-200">{p.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{p.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={p.action.toLowerCase() as "flag" | "block" | "warn"}>{p.action}</Badge>
                <Badge variant="default">{p.category}</Badge>
                <span className={`text-xs ${p.enabled ? "text-emerald-400" : "text-gray-600"}`}>
                  {p.enabled ? "Active" : "Disabled"}
                </span>
              </div>
              {p.category === "resource_access" && p.denied_resource_tags?.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-red-400 font-medium mr-1">Denied:</span>
                    {p.denied_resource_tags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] rounded border border-red-500/20">
                        {t}
                      </span>
                    ))}
                  </div>
                  {p.allowed_agent_roles?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-emerald-400 font-medium mr-1">Exempt:</span>
                      {p.allowed_agent_roles.map((r) => (
                        <span key={r} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded border border-emerald-500/20">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {p.triggers.slice(0, 6).map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-white/5 text-gray-500 text-[10px] rounded">
                      {t}
                    </span>
                  ))}
                  {p.triggers.length > 6 && (
                    <span className="px-1.5 py-0.5 text-gray-600 text-[10px]">+{p.triggers.length - 6} more</span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e293b]">
                <span className="text-[10px] text-gray-600 font-mono">{p.id}</span>
                <span className="text-[10px] text-gray-600">Severity: {p.severity.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-16 text-center">
          <Shield className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No custom policies yet.</p>
          <p className="text-gray-600 text-xs mt-1">
            Create policies to enforce enterprise-specific compliance rules.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-[#111827] border border-[#1e293b] rounded-xl w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-100">
                {editingId ? "Edit Policy" : "Create Policy"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Name" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. No Competitor Discussion"
                  className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-indigo-500/50"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What this policy enforces and why"
                  rows={2}
                  className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-indigo-500/50 resize-none"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                  >
                    {["general", "data", "content", "access", "security", "resource_access", "custom"].map((c) => (
                      <option key={c} value={c}>{c === "resource_access" ? "resource_access (AI Data Control)" : c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Action">
                  <select
                    value={form.action}
                    onChange={(e) => setForm({ ...form, action: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                  >
                    {["FLAG", "BLOCK", "WARN"].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </Field>
              </div>
              {isResourceAccess ? (
                <>
                  <Field label="Denied Resource Tags (comma-separated)" required>
                    <input
                      value={form.denied_resource_tags}
                      onChange={(e) => setForm({ ...form, denied_resource_tags: e.target.value })}
                      placeholder="trading-db, customer-pii, board-minutes"
                      className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-red-500/50"
                    />
                  </Field>
                  <Field label="Allowed Agent Roles (comma-separated)">
                    <input
                      value={form.allowed_agent_roles}
                      onChange={(e) => setForm({ ...form, allowed_agent_roles: e.target.value })}
                      placeholder="internal-analyst, compliance-officer"
                      className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-emerald-500/50"
                    />
                  </Field>
                </>
              ) : (
                <Field label="Triggers (comma-separated)" required>
                  <input
                    value={form.triggers}
                    onChange={(e) => setForm({ ...form, triggers: e.target.value })}
                    placeholder="competitor, rival product, vs our product"
                    className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-indigo-500/50"
                  />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label={`Severity (${form.severity.toFixed(1)})`}>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </Field>
                <Field label="Enabled">
                  <button
                    onClick={() => setForm({ ...form, enabled: !form.enabled })}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                      form.enabled
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-[#0d1117] border-[#1e293b] text-gray-500"
                    }`}
                  >
                    <Check className="w-4 h-4" /> {form.enabled ? "Active" : "Disabled"}
                  </button>
                </Field>
              </div>
              <Field label="Response Message">
                <input
                  value={form.response_message}
                  onChange={(e) => setForm({ ...form, response_message: e.target.value })}
                  placeholder="Custom message shown when triggered"
                  className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-indigo-500/50"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Scope">
                  <select
                    value={form.scope_type}
                    onChange={(e) => setForm({ ...form, scope_type: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-indigo-500/50"
                  >
                    <option value="global">Global (all departments)</option>
                    <option value="department">Department-specific</option>
                    <option value="team">Team-specific</option>
                    <option value="role">Role-specific</option>
                  </select>
                </Field>
                {form.scope_type !== "global" && (
                  <Field label="Scope Values (comma-separated)">
                    <input
                      value={form.scope_values}
                      onChange={(e) => setForm({ ...form, scope_values: e.target.value })}
                      placeholder="e.g. trading, wealth-management"
                      className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-indigo-500/50"
                    />
                  </Field>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-400 border border-[#1e293b] rounded-lg hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || (!isResourceAccess && !form.triggers) || (isResourceAccess && !form.denied_resource_tags)}
                className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}
