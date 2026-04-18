"use client";

import * as React from "react";
import { RefreshCcw } from "lucide-react";
import { Button, Modal } from "@/components/ui";

type Props = {
  onConfirm: () => Promise<void> | void;
  busy?: boolean;
  label?: string;
};

// Two-step rotate button: the first click opens an explanatory modal, the
// second click (inside the modal) actually triggers the rotate. This matches
// the C5 spec that says "Rotating immediately revokes the old key; you'll
// need to paste the new key into the Chrome extension." -- never surprise
// the user with destructive side effects.

export function RotateKeyButton({ onConfirm, busy, label = "Rotate key" }: Props) {
  const [open, setOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setConfirming(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rotate failed");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <>
      <Button
        variant="danger"
        onClick={() => setOpen(true)}
        disabled={busy}
        aria-label="Rotate API key"
        data-rotate-open={open ? "true" : "false"}
      >
        <RefreshCcw className="h-3.5 w-3.5" />
        {label}
      </Button>
      <Modal
        open={open}
        onClose={() => (confirming ? undefined : setOpen(false))}
        title="Rotate API key?"
        description="The current key will stop working the moment you confirm."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={confirming}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirm}
              isLoading={confirming}
              disabled={confirming}
              data-testid="rotate-confirm"
            >
              Yes, rotate now
            </Button>
          </div>
        }
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
          <li>The old key is revoked immediately.</li>
          <li>Any machine still using the old key will start getting 401s.</li>
          <li>You will need to paste the new key into the Chrome extension.</li>
        </ul>
        {error ? (
          <p className="mt-3 text-xs text-red-400" role="alert">
            {error}
          </p>
        ) : null}
      </Modal>
    </>
  );
}
