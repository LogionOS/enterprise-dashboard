import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Static-analysis test. /me is the basic-tier surface. We assert that the
// pages talk to the API only through src/lib/api/* + src/lib/entitlement/*,
// never via a hand-rolled fetch() call. This protects the architectural
// boundary without relying on runtime rendering of server components.

const BASE = join(process.cwd(), "src/app/me");

const REQUIRED_FILES = [
  "layout.tsx",
  "page.tsx",
  "billing/page.tsx",
  "usage/page.tsx",
  "receipts/page.tsx",
];

describe("/me basic-tier surfaces", () => {
  it("has layout + overview + billing + usage + receipts pages", () => {
    for (const f of REQUIRED_FILES) {
      expect(existsSync(join(BASE, f)), `missing ${f}`).toBe(true);
    }
  });

  it("never fetch()s the LogionOS-API directly from /me pages", () => {
    for (const f of REQUIRED_FILES) {
      const src = readFileSync(join(BASE, f), "utf8");
      // fetch() to /api/* (same-origin Next routes) is OK; /v1/* would mean
      // the page is talking to LogionOS-API directly and bypassing the client.
      expect(src).not.toMatch(/fetch\(['"`]https?:\/\/[^'"`]*\/v1\//);
      expect(src).not.toMatch(/fetch\(['"`]\/v1\//);
    }
  });

  it("wraps itself in requireServerAuth so unauthenticated users are redirected", () => {
    const layout = readFileSync(join(BASE, "layout.tsx"), "utf8");
    expect(layout).toMatch(/requireServerAuth/);
  });

  it("uses the shared DashboardShell for each feature page", () => {
    for (const f of ["page.tsx", "billing/page.tsx", "usage/page.tsx", "receipts/page.tsx"]) {
      const src = readFileSync(join(BASE, f), "utf8");
      expect(src, `${f} must render DashboardShell`).toMatch(/DashboardShell/);
    }
  });
});
