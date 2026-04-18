import { requireServerAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Card, CardHeader } from "@/components/ui";
import { ProductBoundaryDisclaimer } from "@/components/legal/ProductBoundaryDisclaimer";
import { RotateApiKeyCard } from "./components/RotateApiKeyCard";

// Install-time onboarding page for the LogionOS browser extension. Users
// land here from the Chrome Web Store listing, rotate their API key, then
// paste it into the extension settings. The Dashboard is the ONLY surface
// that issues API keys -- /v1/me/api-keys/rotate is proxied via
// /api/me/api-keys/rotate so the raw Clerk JWT never reaches the browser.

export default async function MeExtensionPage() {
  await requireServerAuth();
  return (
    <DashboardShell
      title="Browser extension"
      description="Install the extension, paste your API key, and every action you take on supported platforms gets a receipt."
      breadcrumbs={[
        { label: "Account", href: "/me" },
        { label: "Extension" },
      ]}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <RotateApiKeyCard />
        <Card>
          <CardHeader
            title="Install the extension"
            description="Chrome and Chromium-based browsers (Edge, Arc, Brave)."
          />
          <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
            <li>
              Install the LogionOS extension from the Chrome Web Store (link
              is shared privately during Founder Program onboarding).
            </li>
            <li>
              Open the extension popup and paste your API key from the card on
              the left.
            </li>
            <li>
              Pin the extension so the &quot;check before posting&quot;
              surface is always one click away.
            </li>
            <li>
              Every check writes a receipt you can review under{" "}
              <code className="rounded bg-zinc-900 px-1 py-0.5 text-xs">
                /me/receipts
              </code>
              .
            </li>
          </ol>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader
          title="Keeping your key safe"
          description="Treat your API key like a password."
        />
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
          <li>
            Do not paste the key into shared chat channels or git commits.
          </li>
          <li>
            If you suspect the key has leaked, rotate it from the card above.
            The previous key stops working immediately.
          </li>
          <li>
            The key scopes to YOUR account. Team-shared integrations should
            use a team-scoped key (managed on the team billing page).
          </li>
        </ul>
      </Card>
      <div className="mt-4">
        <ProductBoundaryDisclaimer />
      </div>
    </DashboardShell>
  );
}
