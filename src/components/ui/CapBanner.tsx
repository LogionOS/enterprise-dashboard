import * as React from "react";
import Link from "next/link";
import { AlertTriangle, TrendingUp } from "lucide-react";
import type { Entitlement } from "@/lib/api/schemas";
import { capStatus } from "@/lib/entitlement";

export function CapBanner({ entitlement }: { entitlement: Entitlement }) {
  const cap = capStatus(entitlement);
  if (!cap.reached && !cap.approaching) return null;

  const tone = cap.reached
    ? "border-amber-800 bg-amber-950/40 text-amber-200"
    : "border-zinc-800 bg-zinc-950/60 text-zinc-200";

  const title = cap.reached
    ? "Monthly check cap reached"
    : "Approaching your monthly cap";

  const detail =
    cap.cap <= 0
      ? ""
      : `${cap.usage.toLocaleString()} / ${cap.cap.toLocaleString()} checks used`;

  const Icon = cap.reached ? AlertTriangle : TrendingUp;

  return (
    <div
      role="status"
      className={[
        "flex items-start gap-3 rounded-md border p-3 text-sm",
        tone,
      ].join(" ")}
      data-cap-reached={cap.reached ? "true" : "false"}
      data-cap-approaching={cap.approaching ? "true" : "false"}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden />
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        {detail ? <div className="text-xs opacity-80">{detail}</div> : null}
        <p className="mt-1 text-xs opacity-80">
          Checks continue to run. Upgrading raises your cap and unlocks team
          features.
        </p>
      </div>
      {cap.upgradeUrl ? (
        <Link
          href={cap.upgradeUrl}
          className="text-xs font-semibold underline hover:opacity-80"
        >
          Manage billing
        </Link>
      ) : null}
    </div>
  );
}
