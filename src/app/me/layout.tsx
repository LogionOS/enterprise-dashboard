import Link from "next/link";
import { requireServerAuth } from "@/lib/auth";
import { getEntitlementServer } from "@/lib/entitlement/server";
import { CapBanner, PlanBadge } from "@/components/ui";

const TABS = [
  { href: "/me", label: "Overview" },
  { href: "/me/billing", label: "Billing" },
  { href: "/me/usage", label: "Usage" },
  { href: "/me/receipts", label: "Receipts" },
  { href: "/me/extension", label: "Extension" },
];

export default async function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireServerAuth();

  // Server-side entitlement so every /me page gets the cap banner and plan
  // badge without a round trip per component. Basic-plan users land here;
  // if the fetch fails (e.g. no subscription yet) we still render the frame.
  let entitlement = null;
  try {
    entitlement = await getEntitlementServer();
  } catch {
    entitlement = null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-zinc-100">
            {auth.email ?? "Account"}
          </h1>
          {entitlement ? <PlanBadge plan={entitlement.plan} /> : null}
        </div>
        <nav className="flex flex-wrap gap-1" aria-label="Account sections">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="rounded px-2.5 py-1 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      {entitlement ? <CapBanner entitlement={entitlement} /> : null}
      {children}
    </div>
  );
}
