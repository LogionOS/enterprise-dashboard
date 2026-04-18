import { cookies } from "next/headers";
import { requireServerAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { ProductBoundaryDisclaimer } from "@/components/legal/ProductBoundaryDisclaimer";
import { ExtensionKeyPanel } from "./components/ExtensionKeyPanel";
import { InstallInstructions } from "./components/InstallInstructions";
import { PROVISIONED_COOKIE } from "@/app/api/me/api-keys/rotate/route";

// Basic-tier surface for provisioning + rotating the Chrome extension API key.
// Source of truth for "did this user already provision a key" is upstream
// LogionOS-API; we use a Dashboard-side cookie as a best-effort signal to
// decide whether to auto-rotate on first visit (so the user sees their key
// once without an extra click) or to require an explicit rotate.

export default async function MeExtensionPage() {
  await requireServerAuth();
  const jar = await cookies();
  const provisioned = jar.get(PROVISIONED_COOKIE)?.value === "1";

  return (
    <DashboardShell
      title="Browser extension"
      description="Get your extension API key and connect the LogionOS extension."
      breadcrumbs={[{ label: "Account", href: "/me" }, { label: "Extension" }]}
    >
      <div className="space-y-5">
        <ExtensionKeyPanel initiallyProvisioned={provisioned} />
        <InstallInstructions />
        <ProductBoundaryDisclaimer />
      </div>
    </DashboardShell>
  );
}
