"use client";

import { useEffect, useState } from "react";
import {
  Settings, Key, Link as LinkIcon, Bell, Trash2, Plus,
  CheckCircle, XCircle, Zap, ShieldOff, ShieldCheck,
  AlertOctagon, Building2, User, Database,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { seedDemoData, SEED_COUNT } from "@/lib/seed";
import type { WebhookResponse, HealthResponse } from "@/lib/types";

type KillMode = "normal" | "block_all" | "low_risk_only";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState("");
  const [webhooks, setWebhooks] = useState<WebhookResponse[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState("BLOCK,FLAG");
  const [killMode, setKillMode] = useState<KillMode>("normal");
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);
  /** True when the field shows the masked preview loaded from localStorage (not user-typed). */
  const [apiKeyIsMaskedDisplay, setApiKeyIsMaskedDisplay] = useState(false);

  useEffect(() => {
    setApiUrl(localStorage.getItem("logionos_api_url") || "https://logionos-api.onrender.com");
    const storedKey = localStorage.getItem("logionos_api_key") || "";
    if (storedKey) {
      setApiKey(storedKey.slice(0, 8) + "••••••••");
      setApiKeyIsMaskedDisplay(true);
    } else {
      setApiKey("");
      setApiKeyIsMaskedDisplay(false);
    }
    api.health().then(setHealth).catch(() => {});
    api.getKillSwitch().then((r) => setKillMode(r.mode as KillMode)).catch(() => {});
    loadWebhooks();
  }, []);

  const saveConfig = () => {
    localStorage.setItem("logionos_api_url", apiUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestError("");
    setHealth(null);
    try {
      const h = await api.health();
      setHealth(h);
    } catch (e) {
      setTestError(String(e));
    } finally {
      setTesting(false);
    }
  };

  const loadWebhooks = async () => {
    try {
      const res = await api.webhooks();
      setWebhooks(res.webhooks);
    } catch {
      /* ignore on initial load */
    }
  };

  const createWebhook = async () => {
    if (!newWebhookUrl) return;
    try {
      await api.createWebhook({
        url: newWebhookUrl,
        events: newWebhookEvents.split(",").map((e) => e.trim()),
        description: "Created from Dashboard",
      });
      setNewWebhookUrl("");
      await loadWebhooks();
    } catch (e) {
      toast(`Failed to create webhook: ${e instanceof Error ? e.message : e}`);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      await api.deleteWebhook(id);
      await loadWebhooks();
    } catch (e) {
      toast(`Failed to delete webhook: ${e instanceof Error ? e.message : e}`);
    }
  };

  const setKillModeAndSave = async (mode: KillMode) => {
    try {
      await api.setKillSwitch(mode);
      setKillMode(mode);
    } catch {
      toast("Failed to set kill switch — check API connection");
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedProgress(0);
    const keyForSeed =
      typeof window !== "undefined" ? localStorage.getItem("logionos_api_key") || "" : "";
    await seedDemoData(apiUrl, keyForSeed, (done) => setSeedProgress(done));
    setSeeding(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" /> Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configuration, security controls, and integrations</p>
      </div>

      {/* Workspace Info */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
        <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-indigo-400" /> Workspace
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-500">Organization</span>
            </div>
            <div className="text-sm font-medium text-gray-200">LogionOS Workspace</div>
            <div className="text-[10px] text-gray-600 mt-0.5 font-mono">{localStorage.getItem("logionos_api_url")?.replace(/https?:\/\//, "").split("/")[0] || "localhost"}</div>
          </div>
          <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-500">Your Role</span>
            </div>
            <div className="text-sm font-medium text-gray-200 capitalize">{typeof window !== "undefined" ? localStorage.getItem("logionos_role") || "—" : "—"}</div>
            <div className="text-[10px] text-gray-600 mt-0.5">Role-based access control active</div>
          </div>
          <div className="bg-[#0d1117] rounded-lg border border-[#1e293b] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-gray-500">API Keys</span>
            </div>
            <div className="text-sm font-medium text-gray-200">Configured in env</div>
            <div className="text-[10px] text-gray-600 mt-0.5">LOGIONOS_API_KEYS</div>
          </div>
        </div>
      </div>

      {/* Kill Switch */}
      <div className={`rounded-xl border p-5 transition-colors ${
        killMode === "block_all"
          ? "bg-red-500/5 border-red-500/30"
          : killMode === "low_risk_only"
          ? "bg-amber-500/5 border-amber-500/30"
          : "bg-[#111827] border-[#1e293b]"
      }`}>
        <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
          <AlertOctagon className={`w-4 h-4 ${
            killMode === "block_all" ? "text-red-400" :
            killMode === "low_risk_only" ? "text-amber-400" : "text-indigo-400"
          }`} />
          Emergency Controls (Kill Switch)
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Override the compliance engine behavior during incidents. Applies to all API requests from this workspace.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setKillModeAndSave("normal")}
            className={`p-4 rounded-lg border text-left transition-all ${
              killMode === "normal"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-[#0d1117] border-[#1e293b] hover:border-[#2e3b4e]"
            }`}
          >
            <ShieldCheck className={`w-5 h-5 mb-2 ${killMode === "normal" ? "text-emerald-400" : "text-gray-600"}`} />
            <div className={`text-sm font-medium ${killMode === "normal" ? "text-emerald-400" : "text-gray-400"}`}>
              Normal Operation
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Engine runs full pipeline: fast → medium → deep check
            </div>
          </button>

          <button
            onClick={() => setKillModeAndSave("low_risk_only")}
            className={`p-4 rounded-lg border text-left transition-all ${
              killMode === "low_risk_only"
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-[#0d1117] border-[#1e293b] hover:border-[#2e3b4e]"
            }`}
          >
            <AlertOctagon className={`w-5 h-5 mb-2 ${killMode === "low_risk_only" ? "text-amber-400" : "text-gray-600"}`} />
            <div className={`text-sm font-medium ${killMode === "low_risk_only" ? "text-amber-400" : "text-gray-400"}`}>
              Low Risk Only
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Block all medium/high/critical risk requests. Only PASS through low risk.
            </div>
          </button>

          <button
            onClick={() => setKillModeAndSave("block_all")}
            className={`p-4 rounded-lg border text-left transition-all ${
              killMode === "block_all"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-[#0d1117] border-[#1e293b] hover:border-[#2e3b4e]"
            }`}
          >
            <ShieldOff className={`w-5 h-5 mb-2 ${killMode === "block_all" ? "text-red-400" : "text-gray-600"}`} />
            <div className={`text-sm font-medium ${killMode === "block_all" ? "text-red-400" : "text-gray-400"}`}>
              Block All Requests
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Emergency lockdown. All AI requests are blocked until manually resumed.
            </div>
          </button>
        </div>
        {killMode !== "normal" && (
          <div className={`mt-3 p-3 rounded-lg border text-xs flex items-center gap-2 ${
            killMode === "block_all"
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}>
            <AlertOctagon className="w-4 h-4" />
            {killMode === "block_all"
              ? "LOCKDOWN ACTIVE — All AI requests are being blocked. No data flows through the compliance engine."
              : "RESTRICTED MODE — Only low-risk requests are allowed through. Medium/High/Critical requests are blocked."}
          </div>
        )}
      </div>

      {/* API Configuration */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-indigo-400" /> API Connection
        </h2>
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">API Base URL</label>
          <input
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 font-mono outline-none focus:border-indigo-500/50"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
            <Key className="w-3 h-3" /> API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setApiKeyIsMaskedDisplay(false);
            }}
            title={apiKeyIsMaskedDisplay ? "Masked preview of stored API key" : "API key (not saved from this page)"}
            placeholder="Enter new API key to replace current"
            className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 font-mono outline-none focus:border-indigo-500/50"
            readOnly
          />
          <p className="text-[10px] text-gray-600 mt-1">
            To change API key, log out and log in with a new key.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveConfig}
            className="px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            {saved ? "Saved!" : "Save Configuration"}
          </button>
          <button
            onClick={testConnection}
            disabled={testing}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-400 border border-[#1e293b] rounded-lg hover:bg-white/5 transition-colors"
          >
            <Zap className="w-4 h-4" />
            {testing ? "Testing..." : "Test Connection"}
          </button>
        </div>
        {health && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <div className="text-sm text-emerald-400 font-medium">Connected</div>
              <div className="text-xs text-gray-400 mt-1">
                Version: {health.version} &middot; Rules: {health.engine?.total_rules ?? "—"} &middot; Status: {health.status}
              </div>
            </div>
          </div>
        )}
        {testError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <div className="text-sm text-red-400 font-medium">Connection Failed</div>
              <div className="text-xs text-gray-400 mt-1 break-all">{testError}</div>
            </div>
          </div>
        )}
      </div>

      {/* Webhooks */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" /> Webhook Notifications
        </h2>
        {webhooks.length > 0 ? (
          <div className="space-y-2">
            {webhooks.map((wh) => (
              <div key={wh.id} className="flex items-center justify-between bg-[#0d1117] rounded-lg border border-[#1e293b] p-3">
                <div>
                  <div className="text-sm text-gray-300 font-mono">{wh.url}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {wh.events.map((e) => (
                      <Badge key={e} variant={e.toLowerCase() as "block" | "flag" | "warn"} size="sm">{e}</Badge>
                    ))}
                    <span className={`text-[10px] ${wh.active ? "text-emerald-400" : "text-gray-600"}`}>
                      {wh.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <button onClick={() => deleteWebhook(wh.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600">No webhooks registered.</p>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">Webhook URL</label>
            <input
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 font-mono outline-none focus:border-indigo-500/50"
            />
          </div>
          <div className="w-36">
            <label className="text-xs text-gray-500 mb-1 block">Events</label>
            <input
              value={newWebhookEvents}
              onChange={(e) => setNewWebhookEvents(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            />
          </div>
          <button onClick={createWebhook} disabled={!newWebhookUrl} className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo Data */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 space-y-4">
        <h2 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" /> Demo Data
        </h2>
        <p className="text-xs text-gray-500">
          Seed the compliance engine with {SEED_COUNT} real compliance checks to populate charts, events, and reports.
          This is useful for demonstrations and testing.
        </p>
        {seeding ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-indigo-400">Running compliance checks...</span>
              <span className="text-xs text-gray-400 font-mono">{seedProgress} / {SEED_COUNT}</span>
            </div>
            <div className="w-full bg-[#0d1117] rounded-full h-2">
              <div className="h-2 rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${(seedProgress / SEED_COUNT) * 100}%` }} />
            </div>
          </div>
        ) : (
          <button
            onClick={handleSeed}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/20 transition-colors"
          >
            <Database className="w-4 h-4" /> Populate Demo Data ({SEED_COUNT} checks)
          </button>
        )}
      </div>

      {/* About */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">About</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-gray-500">Dashboard Version</div>
          <div className="text-gray-300">1.0.0</div>
          <div className="text-gray-500">Engine Version</div>
          <div className="text-gray-300">{health?.version ?? "—"} (Runtime Compliance)</div>
          <div className="text-gray-500">Default API Endpoint</div>
          <div className="text-gray-300 font-mono">logionos-api.onrender.com</div>
          <div className="text-gray-500">Supported Jurisdictions</div>
          <div className="text-gray-300">US, EU, JP, UK, SG, HK</div>
          <div className="text-gray-500">RBAC Roles</div>
          <div className="text-gray-300">Admin, Developer, Auditor, Viewer</div>
          <div className="text-gray-500">Architecture</div>
          <div className="text-gray-300">FastCheck → DeepCheck → AI Judge → Audit</div>
        </div>
      </div>
    </div>
  );
}
