import type { ReceiptEvent } from "@/lib/api/schemas";

type Props = {
  events: ReceiptEvent[];
};

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// Vertical timeline of receipt events. Each node shows the sequence number,
// kind, timestamp, and truncated hashes so auditors can correlate against
// the exported JSON bundle. Non-JSON event payloads are rendered as compact
// JSON text -- we intentionally do not attempt to pretty-print arbitrary
// shapes here because receipts can carry any opaque payload.

export function EventTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4 text-sm text-zinc-400">
        No events recorded.
      </div>
    );
  }
  return (
    <ol className="space-y-3" aria-label="Receipt event timeline">
      {events.map((e) => (
        <li
          key={`${e.seq}-${e.this_hash}`}
          className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3"
          data-testid="receipt-event"
          data-kind={e.kind}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-mono text-zinc-500">#{e.seq}</span>
              <span className="text-sm font-medium text-zinc-100">{e.kind}</span>
            </div>
            <time className="text-[11px] text-zinc-500">{formatTs(e.ts)}</time>
          </div>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-[11px] text-zinc-500 sm:grid-cols-2">
            <div className="flex gap-2">
              <dt>prev</dt>
              <dd className="font-mono text-zinc-400">
                {e.prev_hash ? e.prev_hash.slice(0, 12) : "--"}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt>this</dt>
              <dd className="font-mono text-zinc-400">
                {e.this_hash.slice(0, 12)}
              </dd>
            </div>
          </dl>
          {e.payload != null ? (
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-zinc-900 p-2 text-[11px] text-zinc-300">
              {safeJson(e.payload)}
            </pre>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
