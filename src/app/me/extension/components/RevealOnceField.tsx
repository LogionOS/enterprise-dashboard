"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, CopyButton } from "@/components/ui";

type Props = {
  value: string;
  label?: string;
  onClear?: () => void;
};

// Displays an API key one time and wipes it from React state on unmount so the
// plaintext does not linger in memory or in any future React hot-reload patch.
// The key is revealed only on explicit "Show" click -- first render keeps it
// masked to prevent shoulder-surfing / browser screenshots from leaking it.

export function RevealOnceField({ value, label = "API key", onClear }: Props) {
  const [revealed, setRevealed] = React.useState(false);
  const valueRef = React.useRef<string>(value);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  React.useEffect(() => {
    return () => {
      valueRef.current = "";
      onClear?.();
    };
  }, [onClear]);

  const masked = React.useMemo(() => "*".repeat(Math.min(value.length, 40)), [value]);

  return (
    <div
      className="rounded-md border border-zinc-800 bg-zinc-950/70 p-3"
      data-testid="reveal-once-field"
      data-revealed={revealed ? "true" : "false"}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? "Hide key" : "Show key"}
            aria-pressed={revealed}
          >
            {revealed ? (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Hide
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" /> Show
              </>
            )}
          </Button>
          <CopyButton value={value} label="Copy key" />
        </div>
      </div>
      <code
        className="block break-all rounded bg-black/40 px-3 py-2 font-mono text-sm text-zinc-100"
        data-value-hidden={revealed ? "false" : "true"}
      >
        {revealed ? value : masked}
      </code>
      <p className="mt-2 text-[11px] text-zinc-500">
        This key is shown once. If you lose it, rotate to generate a fresh key --
        the old one is revoked immediately on rotation.
      </p>
    </div>
  );
}
