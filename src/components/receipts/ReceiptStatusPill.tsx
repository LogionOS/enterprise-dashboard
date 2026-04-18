import { Pill } from "@/components/ui";
import type { SafetyStatus } from "@/lib/api/schemas";

export function ReceiptStatusPill({ status }: { status: SafetyStatus }) {
  const variant =
    status === "clear" ? "success" : status === "warn" ? "warning" : "danger";
  const label =
    status === "clear" ? "Clear" : status === "warn" ? "Warn" : "Block";
  return <Pill variant={variant}>{label}</Pill>;
}
