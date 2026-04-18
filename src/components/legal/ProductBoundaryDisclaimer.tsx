import * as React from "react";

// Single source of truth for the Creator Risk Layer product-boundary text.
// DO NOT hand-write this copy per page. If this string needs to change it
// must be reviewed against the Terms section 9 language and the API-side
// disclaimer returned by /v1/creator-check. Pages render this component at
// the bottom of any surface that displays a risk signal.

export const PRODUCT_BOUNDARY_TEXT =
  "LogionOS surfaces risk signals and disclosure suggestions only. It does " +
  "NOT provide legal advice, does NOT clear rights, and is NOT a substitute " +
  "for review by a qualified attorney. You remain responsible for anything " +
  "you publish.";

export function ProductBoundaryDisclaimer({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={[
        "rounded-md border border-zinc-800 bg-zinc-950/40 text-zinc-400",
        compact ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-xs",
        className,
      ].join(" ")}
      data-testid="product-boundary-disclaimer"
    >
      {PRODUCT_BOUNDARY_TEXT}
    </div>
  );
}
