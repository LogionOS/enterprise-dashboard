"use client";

import { useCallback } from "react";

// Provides a `getToken()` function that resolves the current Clerk JWT from
// the browser, degrading to null if Clerk isn't installed yet. Client hooks
// pass this into the shared apiFetch so we never read the token inline.

type ClerkClient = {
  session?: {
    getToken: (opts?: { template?: string }) => Promise<string | null>;
  } | null;
};

export function useClientToken(): () => Promise<string | null> {
  return useCallback(async () => {
    if (typeof window === "undefined") return null;
    try {
      const w = window as unknown as { Clerk?: ClerkClient };
      const token = await w.Clerk?.session?.getToken();
      return token ?? null;
    } catch {
      return null;
    }
  }, []);
}
