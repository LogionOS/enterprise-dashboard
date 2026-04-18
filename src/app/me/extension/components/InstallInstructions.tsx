import Link from "next/link";
import { Card, CardHeader } from "@/components/ui";

// Static install instructions for the Chrome extension. The copy is kept
// provider-neutral and free of banned marketing terms -- if we ever ship
// a Firefox/Edge build we only swap the store link here.

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/logionos-creator/placeholder";

export function InstallInstructions() {
  return (
    <Card>
      <CardHeader
        title="Connect the browser extension"
        description="Three steps -- none of them require a page reload."
      />
      <ol className="list-decimal space-y-3 pl-5 text-sm text-zinc-300">
        <li>
          <Link
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-indigo-300 underline"
          >
            Install the LogionOS Creator extension from the Chrome Web Store
          </Link>
          . If you already have it, skip to step 2.
        </li>
        <li>
          Open the extension icon in Chrome&apos;s toolbar and paste your key
          into the <span className="text-zinc-100">API key</span> field. The
          extension stores it locally in Chrome and never transmits it to any
          third party.
        </li>
        <li>
          Toggle <span className="text-zinc-100">Creator Mode</span> on. The
          extension will now intercept risky actions on supported venues and
          surface safety signals before you post.
        </li>
      </ol>
      <p className="mt-4 text-[11px] text-zinc-500">
        The extension only talks to LogionOS-API -- telemetry never leaves your
        browser for an analytics vendor.
      </p>
    </Card>
  );
}
