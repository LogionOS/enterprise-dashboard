import { Card, CardHeader, Pill } from "@/components/ui";

type Bucket = {
  label: string;
  flags: number;
  details?: unknown[];
};

type Props = {
  j1: Bucket;
  j2: Bucket;
  j3: Bucket;
};

// The J1/J2/J3 signal summary shown on the receipt detail page. J1 = platform
// policy, J2 = jurisdiction-specific rules, J3 = claim-risk heuristics. Flag
// counts drive the coloring; details are rendered as a compact bullet list
// when present so auditors can see WHY something flagged without scrolling
// through the full event timeline.

export function SignalSummary({ j1, j2, j3 }: Props) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-3"
      data-testid="signal-summary"
    >
      <Bucket title="J1 - Platform" bucket={j1} />
      <Bucket title="J2 - Jurisdiction" bucket={j2} />
      <Bucket title="J3 - Claim risk" bucket={j3} />
    </div>
  );
}

function Bucket({ title, bucket }: { title: string; bucket: Bucket }) {
  const variant =
    bucket.flags === 0 ? "success" : bucket.flags <= 2 ? "warning" : "danger";
  return (
    <Card>
      <CardHeader
        title={title}
        action={<Pill variant={variant}>{bucket.flags} flags</Pill>}
      />
      {bucket.details && bucket.details.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-300">
          {bucket.details.slice(0, 5).map((d, i) => (
            <li key={i}>{renderDetail(d)}</li>
          ))}
          {bucket.details.length > 5 ? (
            <li className="text-zinc-500">
              +{bucket.details.length - 5} more in the full receipt.
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-zinc-500">No notes from this bucket.</p>
      )}
    </Card>
  );
}

function renderDetail(d: unknown): string {
  if (typeof d === "string") return d;
  if (d && typeof d === "object") {
    const o = d as Record<string, unknown>;
    const label =
      typeof o.summary === "string"
        ? o.summary
        : typeof o.message === "string"
          ? o.message
          : typeof o.code === "string"
            ? o.code
            : null;
    if (label) return label;
  }
  try {
    return JSON.stringify(d);
  } catch {
    return String(d);
  }
}
