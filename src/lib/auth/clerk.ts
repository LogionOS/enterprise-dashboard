import type { AuthContext } from "./types";

// Clerk adapter. This file is the ONLY place in the Dashboard that imports
// from `@clerk/nextjs/server`. If we ever swap auth providers we update this
// file and `client.tsx` and the rest of the app is untouched.
//
// During C0 (before `@clerk/nextjs` is installed), this import resolves to an
// absent module and `server.ts` catches the dynamic-import failure and falls
// back to a signed-out stub. From C1 onwards this is the real implementation.

export async function getServerAuth(): Promise<AuthContext | null> {
  try {
    const modName = "@clerk/nextjs/server";
    const mod = await import(/* @vite-ignore */ /* webpackIgnore: true */ modName);
    const { auth, currentUser } = mod as {
      auth: () => Promise<{
        userId: string | null;
        sessionId?: string | null;
        orgId?: string | null;
        getToken: (opts?: { template?: string }) => Promise<string | null>;
      }>;
      currentUser: () => Promise<{
        id: string;
        emailAddresses?: Array<{ emailAddress: string }>;
      } | null>;
    };

    const a = await auth();
    if (!a?.userId) return null;

    let email: string | null = null;
    try {
      const u = await currentUser();
      email = u?.emailAddresses?.[0]?.emailAddress ?? null;
    } catch {
      email = null;
    }

    return {
      userId: a.userId,
      email,
      sessionId: a.sessionId ?? null,
      orgId: a.orgId ?? null,
      getToken: async () => a.getToken(),
    };
  } catch {
    return null;
  }
}
