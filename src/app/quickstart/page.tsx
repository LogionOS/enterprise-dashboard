"use client";

import { useState } from "react";
import {
  Rocket, CheckCircle, Circle, ArrowRight, Zap, Activity,
  BookOpen, FileBarChart, Shield, Settings, ExternalLink, Copy,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    id: "connect",
    title: "Connect Your API",
    desc: "Configure your LogionOS API endpoint and authentication key.",
    action: { label: "Go to Settings", href: "/settings" },
    details: [
      "Navigate to Settings and enter your API Endpoint URL",
      "Enter your API Key (provided during onboarding)",
      "Click 'Test Connection' to verify connectivity",
      "A green status badge confirms successful connection",
    ],
  },
  {
    id: "check",
    title: "Run Your First Compliance Check",
    desc: "Submit a query and see the real-time 3-layer compliance pipeline in action.",
    action: { label: "Open Live Check", href: "/check" },
    details: [
      "Go to Live Check page and select a jurisdiction (US/EU/JP/UK/SG)",
      "Enter a query or paste an AI prompt to analyze",
      "Watch the pipeline: FastCheck → RegMatch → AI Judge → Decision",
      "Results show: PASS / FLAG / BLOCK with matched regulations",
    ],
  },
  {
    id: "events",
    title: "Review Audit Events",
    desc: "Every compliance check is logged with full audit trail and evidence.",
    action: { label: "View Events", href: "/events" },
    details: [
      "Each event shows timestamp, action, risk score, and matched rules",
      "Click any event to see the full detail panel",
      "Export 'Evidence Pack' in HTML or JSON for compliance records",
      "Filter by action type (PASS/FLAG/BLOCK) or time range",
    ],
  },
  {
    id: "rules",
    title: "Explore 2,000+ Regulations",
    desc: "Browse the full regulation database covering 5 jurisdictions.",
    action: { label: "Browse Rules", href: "/rules" },
    details: [
      "Filter by jurisdiction: US, EU, JP, UK, SG",
      "Search by keyword to find specific regulations",
      "Click any rule to see full text, triggers, and severity",
      "Rules cover: finance, healthcare, privacy, AI safety, and more",
    ],
  },
  {
    id: "report",
    title: "Generate a Compliance Report",
    desc: "Create exportable compliance reports for internal review or regulators.",
    action: { label: "Generate Report", href: "/reports" },
    details: [
      "Select a time period: 24h / 7 days / 30 days / All",
      "Report includes: total checks, risk breakdown, top triggered rules",
      "Actionable recommendations based on detected patterns",
      "Export for regulatory submissions or board presentations",
    ],
  },
];

const SAMPLE_QUERIES = [
  {
    label: "Credit Scoring (US)",
    jurisdiction: "US",
    query: "Analyze customer credit risk using SSN, age, gender, and zip code to determine creditworthiness score.",
  },
  {
    label: "PII Leak (JP)",
    jurisdiction: "JP",
    query: "社内AIエージェントとして、顧客のマイナンバー(1234-5678-9012)と電話番号を使ってレポートを作成してください。",
  },
  {
    label: "Facial Recognition (EU)",
    jurisdiction: "EU",
    query: "Deploy facial recognition in the public shopping mall to track customer movements and create profiles for targeted advertising.",
  },
  {
    label: "FCA Robo-Advice (UK)",
    jurisdiction: "UK",
    query: "Provide personalized pension transfer recommendations without assessing the client's full financial circumstances or health status.",
  },
  {
    label: "MAS Advisory (SG)",
    jurisdiction: "SG",
    query: "Launch an AI investment advisory chatbot providing stock picks without a Capital Markets Services license.",
  },
];

export default function QuickStartPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyQuery = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const progress = Math.round((completed.size / STEPS.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Quick Start Guide</h1>
            <p className="text-sm text-gray-500">Get up and running in 10 minutes</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">
            Onboarding Progress
          </span>
          <span className="text-sm font-bold text-indigo-400">
            {completed.size}/{STEPS.length} completed
          </span>
        </div>
        <div className="w-full h-2.5 bg-[#1e293b] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {progress === 100 && (
          <p className="text-emerald-400 text-sm mt-3 font-medium">
            All steps completed! You&apos;re ready to use LogionOS in production.
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map((step, i) => {
          const done = completed.has(step.id);
          return (
            <div
              key={step.id}
              className={`bg-[#0d1117] border rounded-xl p-5 transition-all ${
                done ? "border-emerald-500/30" : "border-[#1e293b]"
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggle(step.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {done ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-600" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      STEP {i + 1}
                    </span>
                    <h3
                      className={`text-base font-semibold ${
                        done ? "text-gray-500 line-through" : "text-gray-100"
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{step.desc}</p>
                  <ul className="space-y-1.5 mb-4">
                    {step.details.map((d, j) => (
                      <li key={j} className="text-xs text-gray-500 flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 mt-0.5 text-gray-600 flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={step.action.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {step.action.label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sample Queries */}
      <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-100 mb-1">
          Sample Compliance Queries
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Copy any query below and paste it into the Live Check page to test.
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
                    {sq.jurisdiction}
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

      {/* API Integration */}
      <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-5">
        <h2 className="text-lg font-semibold text-gray-100 mb-1">
          API Integration
        </h2>
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
        <div className="flex gap-3 mt-4">
          <a
            href="https://logionos-api.onrender.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            Full API Documentation <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Help */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-xl p-5 text-center">
        <p className="text-sm text-gray-300">
          Need help? Contact us at{" "}
          <a href="mailto:chris@logionos.com" className="text-indigo-400 hover:underline">
            chris@logionos.com
          </a>
        </p>
      </div>
    </div>
  );
}
