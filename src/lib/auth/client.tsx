"use client";

import * as React from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import type { ClientAuthContext } from "./types";

// Client-side auth hook. Feature components must use `useClientAuth()` from
// here -- they must NOT import `@clerk/nextjs` directly. When we swap auth
// providers this file changes, not every component.

export function useClientAuth(): ClientAuthContext {
  const { isLoaded, isSignedIn, userId, getToken, signOut } = useAuth();
  const { user } = useUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    null;

  return React.useMemo<ClientAuthContext>(
    () => ({
      isLoaded: !!isLoaded,
      isSignedIn: !!isSignedIn,
      userId: userId ?? null,
      email,
      getToken: async () => getToken(),
      signOut: async () => {
        await signOut();
      },
    }),
    [isLoaded, isSignedIn, userId, email, getToken, signOut],
  );
}
