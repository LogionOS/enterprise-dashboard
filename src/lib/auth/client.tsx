"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClientAuthContext } from "./types";

// Client-side auth hook. Feature components must use `useClientAuth()` from
// here instead of `@clerk/nextjs` directly. Before C1 installs Clerk we
// degrade to an unauthenticated stub so the repo keeps compiling.

type ClerkModule = {
  useAuth: () => {
    isLoaded: boolean;
    isSignedIn: boolean | undefined;
    userId: string | null | undefined;
    getToken: (opts?: { template?: string }) => Promise<string | null>;
    signOut: () => Promise<void>;
  };
  useUser: () => {
    isLoaded: boolean;
    user:
      | {
          id: string;
          primaryEmailAddress?: { emailAddress: string } | null;
          emailAddresses?: Array<{ emailAddress: string }>;
        }
      | null
      | undefined;
  };
};

let cachedModule: ClerkModule | null | undefined;

async function loadClerk(): Promise<ClerkModule | null> {
  if (cachedModule !== undefined) return cachedModule;
  try {
    const modName = "@clerk/nextjs";
    cachedModule = (await import(
      /* @vite-ignore */ /* webpackIgnore: true */ modName
    )) as unknown as ClerkModule;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

export function useClientAuth(): ClientAuthContext {
  const [state, setState] = useState<ClientAuthContext>({
    isLoaded: false,
    isSignedIn: false,
    userId: null,
    email: null,
    getToken: async () => null,
    signOut: async () => {},
  });

  const refresh = useCallback(async () => {
    const mod = await loadClerk();
    if (!mod) {
      setState({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
        email: null,
        getToken: async () => null,
        signOut: async () => {},
      });
      return;
    }
    // Inside React we can't call Clerk's hooks here (rules of hooks), so
    // consumers that need real-time auth should use the dedicated
    // `<ClientAuthBridge />` below. This hook exists primarily for
    // non-reactive contexts (one-shot fetches in effects) and for testing.
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return state;
}

// Reactive bridge: components that need real Clerk state use this. It only
// loads Clerk's hooks when the module is present; otherwise it stays in the
// signed-out stub state.
export function ClientAuthProbe({
  children,
}: {
  children: (ctx: ClientAuthContext) => React.ReactNode;
}) {
  const [mod, setMod] = useState<ClerkModule | null | undefined>(cachedModule);
  useEffect(() => {
    if (mod !== undefined) return;
    void loadClerk().then(setMod);
  }, [mod]);

  if (!mod) {
    return (
      <>
        {children({
          isLoaded: mod === null,
          isSignedIn: false,
          userId: null,
          email: null,
          getToken: async () => null,
          signOut: async () => {},
        })}
      </>
    );
  }
  return <LiveClerkBridge mod={mod}>{children}</LiveClerkBridge>;
}

function LiveClerkBridge({
  mod,
  children,
}: {
  mod: ClerkModule;
  children: (ctx: ClientAuthContext) => React.ReactNode;
}) {
  const { isLoaded, isSignedIn, userId, getToken, signOut } = mod.useAuth();
  const { user } = mod.useUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;
  return (
    <>
      {children({
        isLoaded: !!isLoaded,
        isSignedIn: !!isSignedIn,
        userId: userId ?? null,
        email,
        getToken: async () => getToken(),
        signOut: async () => signOut(),
      })}
    </>
  );
}
