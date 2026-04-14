"use client";

import { useState, useRef } from "react";
import {
  Printer,
  Download,
  Loader2,
  CreditCard,
  Plus,
  CheckCircle,
  AlertCircle,
  Copy,
} from "lucide-react";
import { api } from "@/lib/api";

type GeneratedKey = {
  api_key: string;
  key_prefix: string;
  label: string;
  tier: string;
  expires_at: string;
};

const WELCOME_URL = "https://enterprise-dashboard-sooty.vercel.app/welcome";

function qrSvgUrl(data: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=0d1117&color=a5b4fc&format=svg`;
}

export default function AdminCardsPage() {
  const [count, setCount] = useState(10);
  const [labelPrefix, setLabelPrefix] = useState("Founder Program");
  const [months, setMonths] = useState(6);
  const [generating, setGenerating] = useState(false);
  const [keys, setKeys] = useState<GeneratedKey[]>([]);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    setError("");
    setGenerating(true);
    try {
      const res = await api.createProgramKeys(count, labelPrefix, months);
      setKeys(res.keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate keys");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>LogionOS Founder Cards</title>
<style>
  @page { size: A4 portrait; margin: 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; }
  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
  .card-page { page-break-inside: avoid; width: 105mm; height: 148mm; border: 0.5px dashed #ccc; padding: 6mm; display: flex; flex-direction: column; justify-content: space-between; background: #0d1117; color: #e5e7eb; }
  .card-front .logo-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
  .card-front .logo-row svg { width: 32px; height: 32px; }
  .card-front .logo-row .name { font-size: 18px; font-weight: 700; color: #f9fafb; }
  .card-front .tagline { font-size: 11px; color: #9ca3af; margin-bottom: 20px; }
  .card-front .qr-wrap { text-align: center; margin: 12px 0; }
  .card-front .qr-wrap img { width: 55mm; height: 55mm; border-radius: 8px; }
  .card-front .badge { text-align: center; margin-top: 12px; }
  .card-front .badge span { display: inline-block; font-size: 10px; color: #818cf8; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 20px; padding: 3px 10px; }
  .card-front .stats { text-align: center; font-size: 9px; color: #6b7280; margin-top: 6px; }
  .card-back .section-title { font-size: 10px; font-weight: 600; color: #818cf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .card-back .key-box { background: #080b12; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 9.5px; color: #e5e7eb; word-break: break-all; margin-bottom: 14px; line-height: 1.5; }
  .card-back .steps { list-style: none; padding: 0; margin-bottom: 14px; }
  .card-back .steps li { font-size: 10px; color: #9ca3af; margin-bottom: 5px; padding-left: 16px; position: relative; }
  .card-back .steps li::before { content: attr(data-n); position: absolute; left: 0; color: #818cf8; font-weight: 700; font-size: 10px; }
  .card-back .curl-box { background: #080b12; border: 1px solid #1e293b; border-radius: 6px; padding: 6px 8px; font-family: monospace; font-size: 7.5px; color: #9ca3af; line-height: 1.5; white-space: pre-wrap; word-break: break-all; margin-bottom: 14px; }
  .card-back .footer-links { font-size: 9px; color: #6b7280; display: flex; justify-content: space-between; margin-top: auto; }
  .card-back .footer-links a { color: #818cf8; text-decoration: none; }
</style></head><body>
<div class="card-grid">${el.innerHTML}</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`);
    w.document.close();
  };

  const exportCsv = () => {
    const header = "api_key,key_prefix,label,tier,expires_at,welcome_url\n";
    const rows = keys
      .map(
        (k) =>
          `"${k.api_key}","${k.key_prefix}","${k.label}","${k.tier}","${k.expires_at}","${WELCOME_URL}?key=${k.api_key}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logionos_founder_keys_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyKey = (idx: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Founder Program Cards
            </h1>
            <p className="text-sm text-gray-500">
              Generate API keys and printable A6 activation cards
            </p>
          </div>
        </div>
      </div>

      {/* Generator */}
      <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-100 mb-4">
          Batch Generate Keys
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Number of Keys
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full rounded-lg border border-[#1e293b] bg-[#080b12] px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Label Prefix
            </label>
            <input
              type="text"
              value={labelPrefix}
              onChange={(e) => setLabelPrefix(e.target.value)}
              placeholder="e.g. DemoDay SF"
              className="w-full rounded-lg border border-[#1e293b] bg-[#080b12] px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Valid for (months)
            </label>
            <input
              type="number"
              min={1}
              max={24}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full rounded-lg border border-[#1e293b] bg-[#080b12] px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-400">{error}</span>
          </div>
        )}

        <button
          onClick={generate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Generate {count} Key{count > 1 ? "s" : ""}
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {keys.length > 0 && (
        <>
          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-gray-300 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400 inline mr-1.5" />
              {keys.length} keys generated
            </div>
            <div className="flex-1" />
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-[#1e293b] bg-[#0d1117] hover:bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-medium text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print A6 Cards
            </button>
          </div>

          {/* Keys table */}
          <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1e293b]">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                      API Key
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                      Label
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                      Expires
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#1e293b]/50 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-300">
                        {k.api_key.slice(0, 20)}…
                      </td>
                      <td className="px-4 py-2.5 text-gray-400">{k.label}</td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {k.expires_at.slice(0, 10)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => copyKey(i, k.api_key)}
                          className="text-gray-500 hover:text-indigo-400 transition-colors"
                        >
                          {copiedIdx === i ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card Preview */}
          <div>
            <h2 className="text-base font-semibold text-gray-100 mb-4">
              Card Preview (A6 · 105×148mm)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Showing first card. &quot;Print A6 Cards&quot; above will generate
              all {keys.length} cards for double-sided A4 printing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Front */}
              <div
                className="rounded-xl border border-[#1e293b] bg-[#0d1117] p-6 flex flex-col items-center justify-between"
                style={{ width: 315, minHeight: 444 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 200 200"
                    fill="none"
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
                  <span className="text-lg font-bold text-gray-100">
                    LogionOS
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mb-4">
                  AI Compliance Infrastructure for the Agentic Era
                </p>
                <div className="mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrSvgUrl(
                      `${WELCOME_URL}?key=${keys[0].api_key}`,
                      200
                    )}
                    alt="QR"
                    className="w-[55mm] h-[55mm] rounded-lg"
                    width={208}
                    height={208}
                  />
                </div>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1">
                  Founder Program · Free {months} Months
                </span>
                <p className="text-[9px] text-gray-600 mt-2">
                  4,000+ regulations · 6 jurisdictions
                </p>
              </div>

              {/* Back */}
              <div
                className="rounded-xl border border-[#1e293b] bg-[#0d1117] p-6 flex flex-col"
                style={{ width: 315, minHeight: 444 }}
              >
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                  Your API Key
                </p>
                <div className="bg-[#080b12] border border-[#1e293b] rounded-md px-3 py-2 font-mono text-[9.5px] text-gray-200 break-all leading-relaxed mb-4">
                  {keys[0].api_key}
                </div>

                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                  Quick Start
                </p>
                <ol className="space-y-1.5 mb-4">
                  {[
                    "Scan QR code or visit logionos.com/welcome",
                    "Enter your API key above",
                    "Run your first compliance check",
                  ].map((s, i) => (
                    <li
                      key={i}
                      className="text-[10px] text-gray-400 flex gap-2"
                    >
                      <span className="text-indigo-400 font-bold">
                        {i + 1}.
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>

                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">
                  API Example
                </p>
                <div className="bg-[#080b12] border border-[#1e293b] rounded-md px-3 py-2 font-mono text-[7.5px] text-gray-500 leading-relaxed whitespace-pre-wrap break-all mb-4">
                  {`curl -X POST /v1/check \\
  -H "Authorization: Bearer ${keys[0].key_prefix}..." \\
  -d '{"query":"...","jurisdiction":"US"}'`}
                </div>

                <div className="mt-auto flex justify-between text-[9px] text-gray-600">
                  <span>docs.logionos.com</span>
                  <span>chris.ma@logionos.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hidden print template */}
          <div ref={printRef} className="hidden">
            {keys.map((k, i) => (
              <div key={i}>
                {/* Front side */}
                <div className="card-page card-front">
                  <div>
                    <div className="logo-row">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 200 200"
                        fill="none"
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
                      <span className="name">LogionOS</span>
                    </div>
                    <div className="tagline">
                      AI Compliance Infrastructure for the Agentic Era
                    </div>
                  </div>
                  <div className="qr-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrSvgUrl(`${WELCOME_URL}?key=${k.api_key}`)}
                      alt="QR"
                      width={200}
                      height={200}
                    />
                  </div>
                  <div>
                    <div className="badge">
                      <span>
                        Founder Program · Free {months} Months
                      </span>
                    </div>
                    <div className="stats">
                      4,000+ regulations · 6 jurisdictions · {k.label}
                    </div>
                  </div>
                </div>
                {/* Back side */}
                <div className="card-page card-back">
                  <div>
                    <div className="section-title">Your API Key</div>
                    <div className="key-box">{k.api_key}</div>
                    <div className="section-title">Quick Start</div>
                    <ol className="steps">
                      <li data-n="1.">
                        Scan QR code or visit logionos.com/welcome
                      </li>
                      <li data-n="2.">Enter your API key above</li>
                      <li data-n="3.">Run your first compliance check</li>
                    </ol>
                    <div className="section-title">API Example</div>
                    <div className="curl-box">
                      {`curl -X POST https://logionos-api.onrender.com/v1/check \\
  -H "Authorization: Bearer ${k.key_prefix}..." \\
  -d '{"query":"...", "jurisdiction":"US"}'`}
                    </div>
                  </div>
                  <div className="footer-links">
                    <span>
                      <a href="https://docs.logionos.com">docs.logionos.com</a>
                    </span>
                    <span>chris.ma@logionos.com</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
