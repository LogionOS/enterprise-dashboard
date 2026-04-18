import "server-only";

import { getServerToken } from "@/lib/auth/server";
import type { ApiClientContext } from "./client";

// The canonical `ApiClientContext` for server components and Next.js route
// handlers. Import this anywhere you call an `endpoints/*` function from the
// server side so the Clerk JWT is forwarded with zero inline plumbing.
//
// Example:
//   const ent = await getEntitlement(serverApiCtx());
//
// Extra headers (e.g. `X-Admin-Key`) are appended with `withExtraHeaders`.

export function serverApiCtx(): ApiClientContext {
  return { getToken: () => getServerToken() };
}

export function withExtraHeaders(
  ctx: ApiClientContext,
  headers: Record<string, string>,
): ApiClientContext {
  return { ...ctx, extraHeaders: { ...(ctx.extraHeaders ?? {}), ...headers } };
}

export function withAdminKey(ctx: ApiClientContext): ApiClientContext | null {
  const adminKey = process.env.LOGIONOS_ADMIN_KEY;
  if (!adminKey) return null;
  return withExtraHeaders(ctx, { "X-Admin-Key": adminKey });
}
