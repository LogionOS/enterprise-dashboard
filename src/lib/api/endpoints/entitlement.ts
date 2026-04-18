import { fetchJson, type ApiClientContext } from "../client";
import { EntitlementSchema, type Entitlement } from "../schemas";

export async function getEntitlement(
  ctx: ApiClientContext = {},
): Promise<Entitlement> {
  return fetchJson("/v1/entitlement", EntitlementSchema, { method: "GET" }, ctx);
}
