import "server-only";

import { getEntitlement } from "@/lib/api/endpoints/entitlement";
import { serverApiCtx } from "@/lib/api/server";
import type { Entitlement } from "@/lib/api/schemas";
import { requireFeature } from "./index";

// Server-only entitlement fetch + enforcement. Server components / route
// handlers call `getEntitlementServer()` instead of reaching into the API
// client directly. Importing this file from a client component will raise
// a build-time error thanks to `server-only`.

export async function getEntitlementServer(): Promise<Entitlement> {
  return getEntitlement(serverApiCtx());
}

export async function requireFeatureServer(
  feature: string,
): Promise<Entitlement> {
  const ent = await getEntitlementServer();
  requireFeature(ent, feature);
  return ent;
}
