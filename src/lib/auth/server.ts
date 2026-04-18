import { AuthError } from "@/lib/api/errors";
import type { AuthContext } from "./types";

// Single chokepoint for server-side authentication. Feature pages and route
// handlers MUST import `getServerAuth()` / `requireServerAuth()` from here —
// never `@clerk/nextjs/server` directly. The Clerk-specific implementation
// lives in `clerk.ts` behind a dynamic import so this module stays buildable
// pre-Clerk (tests, smoke builds) and so swapping providers is a one-file
// change instead of a 40-file change.

let implPromise: Promise<{
  getServerAuth: () => Promise<AuthContext | null>;
}> | null = null;

async function loadImpl() {
  if (implPromise) return implPromise;
  implPromise = (async () => {
    try {
      // Dynamic import guards against Clerk not being installed yet (C0 ships
      // before C1 installs @clerk/nextjs). Once Clerk is present this resolves
      // to the real adapter; otherwise we degrade to a stub that treats every
      // request as signed-out.
      const mod = (await import("./clerk")) as typeof import("./clerk");
      return { getServerAuth: mod.getServerAuth };
    } catch {
      return {
        async getServerAuth() {
          return null;
        },
      };
    }
  })();
  return implPromise;
}

export async function getServerAuth(): Promise<AuthContext | null> {
  const impl = await loadImpl();
  return impl.getServerAuth();
}

export async function requireServerAuth(): Promise<AuthContext> {
  const ctx = await getServerAuth();
  if (!ctx) throw new AuthError("Sign-in required");
  return ctx;
}

// For tests / low-level API client calls that need just the token.
export async function getServerToken(): Promise<string | null> {
  const ctx = await getServerAuth();
  if (!ctx) return null;
  return ctx.getToken();
}

// Test-only seam: swap the auth resolver without monkeypatching dynamic imports.
export function __setServerAuthImplForTests(
  impl: { getServerAuth: () => Promise<AuthContext | null> } | null,
): void {
  if (impl == null) {
    implPromise = null;
    return;
  }
  implPromise = Promise.resolve(impl);
}
