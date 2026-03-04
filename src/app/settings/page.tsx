"use client";

import { useEffect, useState } from "react";
import { Settings, Key, Link as LinkIcon, Bell, Trash2, Plus, CheckCircle, XCircle, Zap } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { WebhookResponse, HealthResponse } from "@/lib/types";

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

  useEffect(() => {
    setApiUrl(localStorage.getItem("logionos_api_url") || "https://logionos-api.onrender.com");
    setApiKey(localStorage.getItem("logionos_api_key") || "");
    loadWebhooks();
  }, []);

  const saveConfig = () => {
    localStorage.setItem("logionos_api_url", apiUrl);
    localStorage.setItem("logionos_api_key", apiKey);
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
      console.error("Failed to create webhook:", e);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      await api.deleteWebhook(id);
      await loadWebhooks();
    } catch (e) {
      console.error("Failed to delete webhook:", e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" /> Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">API connection and notification configuration</p>
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
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key (Bearer token)"
            className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-gray-300 font-mono outline-none focus:border-indigo-500/50"
          />
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
                Version: {health.version} &middot; Rules: {health.engine.total_rules} &middot; Status: {health.status}
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
                      <Badge key={e} variant={e.toLowerCase() as "block" | "flag" | "warn"} size="sm">
                        {e}
                      </Badge>
                    ))}
                    <span className={`text-[10px] ${wh.active ? "text-emerald-400" : "text-gray-600"}`}>
                      {wh.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteWebhook(wh.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
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
          <button
            onClick={createWebhook}
            disabled={!newWebhookUrl}
            className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">About</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-gray-500">Dashboard Version</div>
          <div className="text-gray-300">1.0.0</div>
          <div className="text-gray-500">Engine Version</div>
          <div className="text-gray-300">3.0 (Runtime Compliance)</div>
          <div className="text-gray-500">Default API Endpoint</div>
          <div className="text-gray-300 font-mono">logionos-api.onrender.com</div>
          <div className="text-gray-500">Supported Jurisdictions</div>
          <div className="text-gray-300">US, EU, JP, UK, SG</div>
        </div>
      </div>
    </div>
  );
}
