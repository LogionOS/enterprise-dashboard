import { AuthError } from "@/lib/api/errors";
import type { AuthContext } from "./types";
import { getServerAuth as getClerkServerAuth } from "./clerk";

// Single chokepoint for server-side authentication. Feature pages and route
// handlers MUST import `getServerAuth()` / `requireServerAuth()` from here --
// never `@clerk/nextjs/server` directly. The Clerk-specific implementation
// lives in `clerk.ts` so swapping providers is a one-file change instead of
// a 40-file change.

type Impl = {
  getServerAuth: () => Promise<AuthContext | null>;
};

let currentImpl: Impl = {
  getServerAuth: getClerkServerAuth,
};

export async function getServerAuth(): Promise<AuthContext | null> {
  return currentImpl.getServerAuth();
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
export function __setServerAuthImplForTests(impl: Impl | null): void {
  currentImpl = impl ?? { getServerAuth: getClerkServerAuth };
}
