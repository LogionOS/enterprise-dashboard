"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { login } from "@/lib/legacy-auth";

export default function LoginPage() {
  const router = useRouter();
  const [apiUrl, setApiUrl] = useState("https://logionos-api.onrender.com");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ version: string; rules: number; role: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    const result = await login(apiUrl, apiKey);
    if (result.ok) {
      setSuccess({ version: result.version || "", rules: result.rules || 0, role: result.role || "viewer" });
      setTimeout(() => router.push("/"), 800);
    } else {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080b12] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <Zap className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">LogionOS</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise Compliance Dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-[#111827] rounded-xl border border-[#1e293b] p-6 space-y-5">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">API Endpoint</label>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-gray-300 font-mono outline-none focus:border-indigo-500/50 transition-colors"
              placeholder="https://logionos-api.onrender.com"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-gray-300 font-mono outline-none focus:border-indigo-500/50 transition-colors"
              placeholder="Enter your API key"
            />
            <p className="text-[10px] text-gray-600 mt-1.5">
              Bearer token authentication — contact your admin for access
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-xs text-emerald-400">
                Connected — v{success.version} · {success.rules.toLocaleString()} rules · {success.role}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting...
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" /> Authenticated
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-[11px] text-gray-600">
            Secure connection via HTTPS · Bearer token authentication · RBAC enforced
          </p>
          <p className="text-[10px] text-gray-700">
            LogionOS v3.0 · Runtime Compliance for AI Systems
          </p>
        </div>
      </div>
    </div>
  );
}
