"use client";

import * as React from "react";
import { Key, RefreshCw, ShieldAlert } from "lucide-react";
import { Button, Card, CardHeader, CopyButton } from "@/components/ui";

// Shown exactly once when the user (re)rotates their API key. The raw key
// never leaves this component -- we do not persist it to localStorage, we do
// not log it, and we do not send it back to the server on navigation. If
// the user refreshes the page before copying, they must rotate again.

type Rotation = {
  apiKey: string;
  keyPrefix?: string;
  createdAt?: string;
};

export function RotateApiKeyCard() {
  const [loading, setLoading] = React.useState(false);
  const [rotation, setRotation] = React.useState<Rotation | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [confirming, setConfirming] = React.useState(false);

  async function rotate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me/api-keys/rotate", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        api_key?: string;
        key_prefix?: string;
        created_at?: string;
        detail?: string;
      };
      if (!res.ok || !body.api_key) {
        throw new Error(body.detail || `Rotation failed (${res.status})`);
      }
      setRotation({
        apiKey: body.api_key,
        keyPrefix: body.key_prefix,
        createdAt: body.created_at,
      });
      setConfirming(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rotation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Extension API key"
        description="Used by the LogionOS browser extension to call /v1/creator-check on your behalf."
      />
      <div className="space-y-3">
        {rotation ? (
          <div className="space-y-2 rounded-md border border-emerald-800 bg-emerald-950/30 p-3">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <Key className="h-3.5 w-3.5" />
              <span className="font-semibold">New key issued.</span>
              <span>Copy it now -- we will never show it again.</span>
            </div>
            <code
              className="block overflow-x-auto rounded bg-zinc-950 px-2 py-2 font-mono text-xs text-zinc-100"
              data-testid="new-api-key"
            >
              {rotation.apiKey}
            </code>
            <div className="flex items-center gap-2">
              <CopyButton value={rotation.apiKey} label="Copy API key" />
              {rotation.keyPrefix ? (
                <span className="text-[11px] text-zinc-500">
                  prefix: {rotation.keyPrefix}
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-400">
            Click <span className="text-zinc-200">Rotate key</span> to issue a
            new API key. The previous key stops working immediately, so only
            rotate when you are ready to paste the new value into the
            extension.
          </div>
        )}

        {confirming ? (
          <div className="flex flex-col gap-2 rounded-md border border-amber-800 bg-amber-950/30 p-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span className="font-semibold">
                Rotating will invalidate your current API key.
              </span>
            </div>
            <p>
              The browser extension will stop working until you paste the new
              key into its settings. Continue?
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={rotate}
                isLoading={loading}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Yes, rotate now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setConfirming(true)}
            disabled={loading}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {rotation ? "Rotate key again" : "Rotate key"}
          </Button>
        )}

        {error ? (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
