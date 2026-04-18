import { Pill } from "@/components/ui";

type Props = {
  verified: boolean;
  chainHead?: string;
};

// Renders the "hash chain verified" / "tampered" signal for a receipt.
// Verified receipts are the baseline guarantee of the audit trail -- if this
// ever renders red, every downstream assumption about the receipt is void.

export function HashChainBadge({ verified, chainHead }: Props) {
  return (
    <div
      className="flex items-center gap-2"
      data-chain-verified={verified ? "true" : "false"}
      data-testid="hash-chain-badge"
    >
      {verified ? (
        <Pill variant="success" aria-label="Hash chain verified">
          Chain verified
        </Pill>
      ) : (
        <Pill variant="danger" aria-label="Hash chain tampered">
          Chain TAMPERED
        </Pill>
      )}
      {chainHead ? (
        <code
          className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
          title="chain head hash"
        >
          {chainHead.slice(0, 10)}
          {chainHead.length > 10 ? "..." : ""}
        </code>
      ) : null}
    </div>
  );
}
