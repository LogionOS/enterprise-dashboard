import { afterEach, describe, expect, it, vi } from "vitest";
import {
  __setServerAuthImplForTests,
  getServerAuth,
  getServerToken,
  requireServerAuth,
} from "./server";
import { AuthError } from "@/lib/api/errors";

afterEach(() => {
  __setServerAuthImplForTests(null);
});

describe("getServerAuth", () => {
  it("returns the authenticated user when Clerk is signed in", async () => {
    __setServerAuthImplForTests({
      getServerAuth: async () => ({
        userId: "user_123",
        email: "jane@example.com",
        sessionId: "sess_1",
        orgId: null,
        getToken: async () => "jwt-xyz",
      }),
    });
    const ctx = await getServerAuth();
    expect(ctx).not.toBeNull();
    expect(ctx?.userId).toBe("user_123");
    expect(await ctx?.getToken()).toBe("jwt-xyz");
  });

  it("returns null when no session is present", async () => {
    __setServerAuthImplForTests({
      getServerAuth: async () => null,
    });
    expect(await getServerAuth()).toBeNull();
    expect(await getServerToken()).toBeNull();
  });
});

describe("requireServerAuth", () => {
  it("throws AuthError when signed out", async () => {
    __setServerAuthImplForTests({
      getServerAuth: async () => null,
    });
    await expect(requireServerAuth()).rejects.toBeInstanceOf(AuthError);
  });

  it("returns the context when signed in", async () => {
    __setServerAuthImplForTests({
      getServerAuth: async () => ({
        userId: "u1",
        getToken: async () => "t",
      }),
    });
    const ctx = await requireServerAuth();
    expect(ctx.userId).toBe("u1");
  });
});

describe("middleware route discipline", () => {
  it("documents the public-route list and matches creator surfaces", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const root = path.resolve(__dirname, "../../..");
    const src = fs.readFileSync(path.join(root, "middleware.ts"), "utf8");
    // Public routes MUST include the documented minimum set.
    expect(src).toContain('"/"');
    expect(src).toContain('"/sign-in(.*)"');
    expect(src).toContain('"/sign-up(.*)"');
    expect(src).toContain('"/api/health(.*)"');
    // Creator routes MUST be protected.
    expect(src).toMatch(/\/me\(\.\*\)/);
    expect(src).toMatch(/\/teams\/:id\(\.\*\)/);
  });
});

describe("Clerk module isolation", () => {
  it("never leaks @clerk/nextjs/server into feature modules", () => {
    // This is a static-discipline test: we only allow the module to be
    // imported from `src/lib/auth/clerk.ts`. If another path imports it,
    // this test fails loudly.
    const fs = require("node:fs") as typeof import("node:fs");
    const path = require("node:path") as typeof import("node:path");
    const root = path.resolve(__dirname, "../../..");
    const offenders: string[] = [];
    const visit = (dir: string) => {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const rel = path.relative(root, full).replace(/\\/g, "/");
        if (name === "node_modules" || name === ".next" || name === "dist") continue;
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          visit(full);
        } else if (/\.(t|j)sx?$/.test(name)) {
          // Allow the Clerk adapter file itself and the Clerk UI pages
          // (sign-in / sign-up / layout) to import Clerk directly.
          const allowed =
            rel === "src/lib/auth/clerk.ts" ||
            rel === "src/lib/auth/client.tsx" ||
            rel === "src/app/layout.tsx" ||
            rel.startsWith("src/app/sign-in") ||
            rel.startsWith("src/app/sign-up") ||
            rel === "middleware.ts";
          if (allowed) continue;
          const content = fs.readFileSync(full, "utf8");
          if (/from\s+["']@clerk\/nextjs(?:\/server)?["']/.test(content)) {
            offenders.push(rel);
          }
        }
      }
    };
    visit(path.resolve(root, "src"));
    expect(offenders).toEqual([]);
  });
});
