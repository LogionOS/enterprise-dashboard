"use client";

import * as React from "react";
import { Card, CardHeader, Pill, Button } from "@/components/ui";
import { RevealOnceField } from "./RevealOnceField";
import { RotateKeyButton } from "./RotateKeyButton";

type Props = {
  initiallyProvisioned: boolean;
};

// Client-side orchestrator for the extension key surface. On a first visit
// (initiallyProvisioned=false) we auto-rotate once so the user sees their
// plaintext key without extra clicks. On return visits we show "key is set"
// and require an explicit rotate to view plaintext again -- this matches the
// C5 spec and keeps us from regenerating keys on every navigation.

export function ExtensionKeyPanel({ initiallyProvisioned }: Props) {
  const [provisioned, setProvisioned] = React.useState(initiallyProvisioned);
  const [plaintext, setPlaintext] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = React.useState(
    !initiallyProvisioned,
  );
  const didBootstrap = React.useRef(false);

  const rotate = React.useCallback(async (): Promise<void> => {
    setError(null);
    const res = await fetch("/api/me/api-keys/rotate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { detail?: string };
      throw new Error(body.detail || `Rotate failed (${res.status})`);
    }
    const body = (await res.json()) as { api_key: string };
    setPlaintext(body.api_key);
    setProvisioned(true);
  }, []);

  React.useEffect(() => {
    if (initiallyProvisioned || didBootstrap.current) return;
    didBootstrap.current = true;
    (async () => {
      try {
        await rotate();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Rotate failed");
      } finally {
        setBootstrapping(false);
      }
    })();
  }, [initiallyProvisioned, rotate]);

  return (
    <Card>
      <CardHeader
        title="Your extension API key"
        description="The extension signs LogionOS-API requests with this key on your behalf."
        action={
          provisioned ? (
            <Pill variant="success">Provisioned</Pill>
          ) : (
            <Pill variant="warning">First-time setup</Pill>
          )
        }
      />

      {bootstrapping ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-4 text-sm text-zinc-400">
          Generating your first API key...
        </div>
      ) : null}

      {plaintext ? (
        <div className="space-y-3">
          <RevealOnceField
            value={plaintext}
            onClear={() => setPlaintext(null)}
          />
          <p className="text-xs text-amber-300">
            Copy this key now. Once you leave this page it is gone -- you will
            have to rotate to see a fresh one.
          </p>
        </div>
      ) : provisioned ? (
        <div className="space-y-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-zinc-300">
            Key is set -- rotate to view plaintext again.
          </div>
          <RotateKeyButton onConfirm={rotate} />
        </div>
      ) : !bootstrapping ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300">
            We could not provision a key automatically. Try again below.
          </p>
          <Button variant="primary" onClick={() => void rotate()}>
            Generate key
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </Card>
  );
}
