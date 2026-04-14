"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Check,
  X,
  ArrowUpRight,
  Shield,
  Zap,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { UsageInfo } from "@/lib/types";

type UsageResponse = UsageInfo & { expires_at?: string };

const TIER_DISPLAY: Record<string, string> = {
  founder_program: "Founder Program Free Tier",
  enterprise: "Enterprise",
  pay_as_you_go: "Pay As You Go",
  unlimited: "Unlimited",
  unknown: "Unknown Plan",
};

/** Matches engine/quota.py TIER_LIMITS keys (not returned on /v1/usage). */
const KEYS_BY_TIER: Record<string, number> = {
  founder_program: 3,
  enterprise: 20,
  pay_as_you_go: 5,
  unlimited: 0,
};

function tierLabel(tier: string): string {
  return TIER_DISPLAY[tier] ?? tier.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatLimit(n: number | undefined): string {
  if (n === undefined) return "—";
  if (n === 0) return "Unlimited";
  return n.toLocaleString();
}

function periodEndLabel(period: string): string | null {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const end = new Date(Date.UTC(y, mo, 0));
  return end.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function periodTitle(period: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(period);
  if (!m) return period;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  return new Date(Date.UTC(y, mo, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function BillingSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      <div>
        <div className="h-7 bg-[#1e293b] rounded-lg w-56" />
        <div className="h-4 bg-[#1e293b]/80 rounded mt-3 w-80 max-w-full" />
      </div>
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 space-y-4">
        <div className="flex justify-between gap-4">
          <div className="h-6 bg-[#1e293b] rounded w-48" />
          <div className="h-5 bg-[#1e293b] rounded w-16 shrink-0" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="h-14 bg-[#1e293b]/60 rounded-lg" />
          <div className="h-14 bg-[#1e293b]/60 rounded-lg" />
          <div className="h-14 bg-[#1e293b]/60 rounded-lg" />
          <div className="h-14 bg-[#1e293b]/60 rounded-lg" />
        </div>
        <div className="h-16 bg-[#1e293b]/40 rounded-lg" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 space-y-3 h-80">
          <div className="h-5 bg-[#1e293b] rounded w-40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-[#1e293b]/70 rounded w-full" />
          ))}
        </div>
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 space-y-3 h-80">
          <div className="h-5 bg-[#1e293b] rounded w-44" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 bg-[#1e293b]/70 rounded w-full" />
          ))}
        </div>
      </div>
      <div className="h-28 bg-[#1e293b]/50 rounded-xl border border-[#1e293b]" />
    </div>
  );
}

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError("");
        const u = await api.usage();
        if (!cancelled) setUsage(u as UsageResponse);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const keysLimit = usage?.tier
    ? (KEYS_BY_TIER[usage.tier] ?? KEYS_BY_TIER.founder_program)
    : KEYS_BY_TIER.founder_program;

  const planActive =
    usage &&
    (usage.monthly_limit === 0 ||
      usage.monthly_remaining > 0 ||
      usage.monthly_remaining === -1);

  const policiesLimit = usage?.policies_limit ?? 10;
  const webhooksLimit = usage?.webhooks_limit ?? 3;

  const founderFallbackIncluded = [
    "5,000 API calls / month",
    "500 daily API limit",
    "100 LLM Deep Checks / month",
    "10 Custom Policies",
    "3 Webhooks",
    "3 API Keys",
    "90-day audit retention",
    "Community support",
  ];

  const includedFeatures = usage
    ? [
        `${formatLimit(usage.monthly_limit)} API calls / month`,
        `${formatLimit(usage.daily_limit)} daily API limit`,
        `${formatLimit(usage.llm_monthly_limit)} LLM Deep Checks / month`,
        `${formatLimit(policiesLimit)} Custom Policies`,
        `${formatLimit(webhooksLimit)} Webhooks`,
        `${formatLimit(keysLimit)} API Keys`,
        "90-day audit retention",
        "Community support",
      ]
    : founderFallbackIncluded;

  const notIncluded = [
    "Enterprise SLA",
    "Custom deployments",
    "Custom legal packs",
    "White-glove consulting",
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <BillingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-400" />
          Plan &amp; Billing
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Your subscription tier, quotas, and what is included on this workspace.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          {error}
        </div>
      )}

      {/* Current plan */}
      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-100 tracking-tight">
                {usage ? tierLabel(usage.tier) : "—"}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Usage limits apply per API key according to your tier.
              </p>
            </div>
          </div>
          {usage && (
            <Badge variant={planActive ? "pass" : "flag"} size="md">
              {planActive ? "Active" : "At monthly limit"}
            </Badge>
          )}
        </div>

        {usage && (
          <>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#1e293b] bg-[#0f172a]/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                  Monthly quota
                </div>
                <div className="mt-1 text-sm text-gray-100 font-medium tabular-nums">
                  {usage.monthly_limit > 0
                    ? `${usage.monthly_used.toLocaleString()} / ${usage.monthly_limit.toLocaleString()}`
                    : "Unlimited"}
                </div>
                {usage.monthly_limit > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {usage.monthly_remaining.toLocaleString()} remaining
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-[#1e293b] bg-[#0f172a]/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                  Daily quota
                </div>
                <div className="mt-1 text-sm text-gray-100 font-medium tabular-nums">
                  {usage.daily_limit > 0
                    ? `${usage.daily_used.toLocaleString()} / ${usage.daily_limit.toLocaleString()}`
                    : "Unlimited"}
                </div>
                {usage.daily_limit > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {usage.daily_remaining.toLocaleString()} remaining today
                  </div>
                )}
              </div>
              <div className="rounded-lg border border-[#1e293b] bg-[#0f172a]/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                  LLM Deep Checks
                </div>
                <div className="mt-1 text-sm text-gray-100 font-medium tabular-nums">
                  {usage.llm_monthly_limit > 0
                    ? `${usage.llm_monthly_used.toLocaleString()} / ${usage.llm_monthly_limit.toLocaleString()} this month`
                    : "Unlimited"}
                </div>
              </div>
              <div className="rounded-lg border border-[#1e293b] bg-[#0f172a]/80 px-4 py-3">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                  Policies &amp; webhooks
                </div>
                <div className="mt-1 text-sm text-gray-300">
                  {(usage.policies_used ?? 0).toLocaleString()} / {formatLimit(policiesLimit)} policies
                  <span className="text-gray-600 mx-2">·</span>
                  {(usage.webhooks_used ?? 0).toLocaleString()} / {formatLimit(webhooksLimit)} webhooks
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <div className="text-xs font-medium text-emerald-400/90 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 shrink-0" />
                Period &amp; resets
              </div>
              <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                Current billing period:{" "}
                <span className="text-gray-100 font-medium">{periodTitle(usage.period)}</span>
                {periodEndLabel(usage.period) ? (
                  <>
                    . Monthly counters roll over after{" "}
                    <span className="text-gray-100 font-medium">{periodEndLabel(usage.period)}</span>{" "}
                    (UTC). Daily limits reset at the start of each UTC day.
                  </>
                ) : (
                  <>.</>
                )}
              </p>
              {usage.expires_at ? (
                <p className="text-sm text-gray-400 mt-2">
                  Key expiration:{" "}
                  <span className="text-gray-200">
                    {new Date(usage.expires_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "UTC",
                    })}{" "}
                    UTC
                  </span>
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2 mb-4">
            <Check className="w-4 h-4 text-emerald-400" />
            What&apos;s included
          </h3>
          <ul className="space-y-2.5">
            {includedFeatures.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2.5 text-sm text-gray-300 leading-snug"
              >
                <span className="mt-0.5 w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5">
          <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2 mb-4">
            <X className="w-4 h-4 text-gray-500" />
            What&apos;s not included
          </h3>
          <ul className="space-y-2.5">
            {notIncluded.map((line) => (
              <li
                key={line}
                className="flex items-start gap-2.5 text-sm text-gray-400 leading-snug"
              >
                <span className="mt-0.5 w-5 h-5 rounded-md bg-[#1e293b] border border-[#334155] flex items-center justify-center shrink-0">
                  <X className="w-3 h-3 text-gray-500" />
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl border border-[#1e293b] p-5 md:p-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-100">Need more?</h3>
            <p className="text-sm text-gray-400 mt-1.5 max-w-xl leading-relaxed">
              Higher limits, enterprise SLAs, custom deployments, and tailored legal packs are
              available. Contact our team to design a plan that matches your compliance and scale
              requirements.
            </p>
          </div>
          <a
            href="mailto:founders@logionos.com"
            className="inline-flex items-center justify-center gap-2 shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 border border-indigo-500/50 transition-colors shadow-lg shadow-indigo-900/20"
          >
            Contact sales
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
        <p className="relative text-xs text-gray-500 mt-4">
          Email:{" "}
          <a
            href="mailto:founders@logionos.com"
            className="text-indigo-400 hover:text-indigo-300 underline-offset-2 hover:underline"
          >
            founders@logionos.com
          </a>
        </p>
      </div>
    </div>
  );
}
