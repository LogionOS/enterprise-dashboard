import Link from "next/link";
import { notFound } from "next/navigation";
import { requireServerAuth } from "@/lib/auth";
import { getEntitlementServer } from "@/lib/entitlement/server";
import { CapBanner, PlanBadge } from "@/components/ui";

const TABS = [
  { href: "overview", label: "Overview" },
  { href: "members", label: "Members" },
  { href: "billing", label: "Billing" },
  { href: "usage", label: "Usage" },
  { href: "receipts", label: "Receipts" },
  { href: "settings", label: "Settings" },
];

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  await requireServerAuth();
  const { id } = await params;
  if (!id) notFound();

  // Server-side entitlement fetch so every team page gets the cap banner
  // and plan badge without calling the API three times per render.
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
          <h1 className="text-lg font-semibold text-zinc-100">Team {id}</h1>
          {entitlement ? <PlanBadge plan={entitlement.plan} /> : null}
        </div>
        <nav className="flex flex-wrap gap-1" aria-label="Team sections">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={`/teams/${id}/${t.href}`}
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
