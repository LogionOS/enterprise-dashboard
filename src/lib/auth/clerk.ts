import { auth, currentUser } from "@clerk/nextjs/server";
import type { AuthContext } from "./types";

// Clerk adapter. This is the ONLY place in the Dashboard that imports from
// `@clerk/nextjs/server`. If we ever swap auth providers we update this file
// and `client.tsx` -- the rest of the app is untouched.

export async function getServerAuth(): Promise<AuthContext | null> {
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
}
