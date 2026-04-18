"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui";

type Props = {
  receiptId: string;
  format: "json" | "pdf";
  enabled: boolean;
  lockedLabel?: string;
};

// Gated export button. When the user's plan does not include the required
// feature we render a disabled button with a tooltip explaining the gate.
// When enabled, clicking triggers a browser download via the Dashboard
// proxy route /api/receipts/[id]/export?fmt=<format>, which streams the
// bytes from the LogionOS-API with the Clerk JWT attached server-side.

export function ExportReceiptButton({
  receiptId,
  format,
  enabled,
  lockedLabel,
}: Props) {
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function download() {
    setError(null);
    setDownloading(true);
    try {
      const href = `/api/receipts/${encodeURIComponent(receiptId)}/export?fmt=${format}`;
      const res = await fetch(href, { method: "GET" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { detail?: string };
        throw new Error(body.detail || `Export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${receiptId}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setDownloading(false);
    }
  }

  const label = format === "pdf" ? "Export PDF" : "Export JSON";
  const tooltip = enabled ? undefined : (lockedLabel ?? gateCopy(format));

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={download}
        disabled={!enabled || downloading}
        isLoading={downloading}
        title={tooltip}
        aria-label={tooltip ?? `Export receipt as ${format.toUpperCase()}`}
        data-feature-gated={enabled ? "false" : "true"}
        data-format={format}
      >
        <Download className="h-3.5 w-3.5" />
        {label}
      </Button>
      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {!enabled ? <p className="text-[11px] text-zinc-500">{tooltip}</p> : null}
    </div>
  );
}

function gateCopy(format: "json" | "pdf"): string {
  return format === "pdf"
    ? "Available on Team plan and up."
    : "Available on Basic plan and up.";
}
