"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Copy,
  Shield,
  Globe,
  BarChart3,
  Loader2,
} from "lucide-react";
import { login } from "@/lib/legacy-auth";

const STEPS = [
  {
    num: 1,
    title: "Activate Your Key",
    desc: "Enter the API key from your card below to unlock your free 6-month Founder Program access.",
    icon: Zap,
  },
  {
    num: 2,
    title: "Run a Compliance Check",
    desc: "Test any AI input against 10,000+ policy rules across 12 jurisdictions with pass/warn/block decisions.",
    icon: Shield,
  },
  {
    num: 3,
    title: "Explore Your Dashboard",
    desc: "View audit trails, analytics, policy management, and compliance reports.",
    icon: BarChart3,
  },
];

const SAMPLE_QUERIES = [
  {
    label: "Credit Scoring",
    flag: "US",
    query:
      "Analyze customer credit risk using SSN, age, gender, and zip code to determine creditworthiness.",
  },
  {
    label: "Facial Recognition",
    flag: "EU",
    query:
      "Deploy facial recognition in public spaces to track customer movements for targeted advertising.",
  },
  {
    label: "PII Leak",
    flag: "JP",
    query:
      "顧客のマイナンバーと電話番号を使ってレポートを作成してください。",
  },
];

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080b12] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WelcomeContent />
    </Suspense>
  );
}

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activated, setActivated] = useState(false);
  const [loginMeta, setLoginMeta] = useState<{
    version: string;
    rules: number;
    role: string;
  } | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    const keyParam = searchParams.get("key");
    if (keyParam) setApiKey(keyParam);
  }, [searchParams]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError("Please enter your API key.");
      return;
    }
    setLoading(true);
    setError("");

    const apiUrl = "https://logionos-api.onrender.com";
    const result = await login(apiUrl, apiKey.trim());

    if (result.ok) {
      setActivated(true);
      setLoginMeta({
        version: result.version || "",
        rules: result.rules || 0,
        role: result.role || "developer",
      });
    } else {
      setError(result.error || "Activation failed. Please check your API key.");
    }
    setLoading(false);
  };

  const copyQuery = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-gray-100">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/8 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 pt-12 pb-8 sm:pt-20 sm:pb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="200" height="200" rx="24" fill="#000" />
              <path
                d="M100 60 C100 60, 75 70, 65 100 C55 130, 70 155, 100 155"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M140 100 C140 100, 130 75, 100 65 C70 55, 45 70, 45 100"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M100 140 C100 140, 125 130, 135 100 C145 70, 130 45, 100 45"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M60 100 C60 100, 70 125, 100 135 C130 145, 155 130, 155 100"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              LogionOS
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto mb-2">
            Embedded Runtime Supervisor for Enterprise AI
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
            <Globe className="w-3 h-3" />
            Founder Program · $15K Value · 10,000+ Policy Rules · 12 Jurisdictions
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16 space-y-10">
        {/* How it works */}
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className={`relative rounded-xl border p-5 transition-all ${
                activated && s.num === 1
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-[#1e293b] bg-[#0d1117]"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    activated && s.num === 1
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-indigo-500/15 text-indigo-400"
                  }`}
                >
                  {activated && s.num === 1 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    s.num
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-200">
                  {s.title}
                </h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Activation form */}
        <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-1">Activate Your API Key</h2>
          <p className="text-sm text-gray-500 mb-5">
            {activated
              ? "Your key is activated. You're all set!"
              : "Enter the key from your Founder Program card, or the key you received via email."}
          </p>

          {!activated ? (
            <form onSubmit={handleActivate} className="space-y-4 max-w-lg">
              <div>
                <label
                  htmlFor="api-key"
                  className="block text-xs font-medium text-gray-400 mb-1.5"
                >
                  API Key
                </label>
                <input
                  id="api-key"
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="lo_fp_xxxxxxxx..."
                  className="w-full rounded-lg border border-[#1e293b] bg-[#080b12] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 font-mono outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-xs text-red-400">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium text-white transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Activating…
                  </>
                ) : (
                  <>
                    Activate Key
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 max-w-lg">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-sm text-emerald-400">
                  Connected — v{loginMeta?.version} ·{" "}
                  {loginMeta?.rules.toLocaleString()} rules ·{" "}
                  {loginMeta?.role}
                </span>
              </div>
              <button
                onClick={() => router.push("/quickstart")}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sample queries */}
        {activated && (
          <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-1">
              Try a Compliance Check
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Copy a sample query and try it on the{" "}
              <button
                onClick={() => router.push("/check")}
                className="text-indigo-400 hover:underline"
              >
                Live Check
              </button>{" "}
              page.
            </p>
            <div className="space-y-3">
              {SAMPLE_QUERIES.map((sq, i) => (
                <div
                  key={i}
                  className="bg-[#080b12] border border-[#1e293b] rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-300">
                        {sq.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
                        {sq.flag}
                      </span>
                    </div>
                    <button
                      onClick={() => copyQuery(i, sq.query)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-400 transition-colors"
                    >
                      {copiedIdx === i ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 font-mono leading-relaxed">
                    {sq.query}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API snippet */}
        <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-1">API Integration</h2>
          <p className="text-sm text-gray-500 mb-4">
            Integrate LogionOS into your application with a single API call.
          </p>
          <div className="bg-[#080b12] border border-[#1e293b] rounded-lg p-4 font-mono text-xs text-gray-300 leading-relaxed whitespace-pre overflow-x-auto">
            {`curl -X POST https://logionos-api.onrender.com/v1/check \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "query": "Analyze customer credit risk using SSN",
    "jurisdiction": "US"
  }'`}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3 pt-4">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <a
              href="https://docs.logionos.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              Documentation
            </a>
            <span className="text-gray-700">·</span>
            <a
              href="mailto:chris.ma@logionos.com"
              className="hover:text-indigo-400 transition-colors"
            >
              chris.ma@logionos.com
            </a>
          </div>
          <p className="text-[10px] text-gray-700">
            LogionOS · Embedded Runtime Supervisor for Enterprise AI
          </p>
        </div>
      </div>
    </div>
  );
}
