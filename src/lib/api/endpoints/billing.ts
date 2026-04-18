import { fetchJson, type ApiClientContext } from "../client";
import {
  BillingPortalResponseSchema,
  type BillingPortalResponse,
} from "../schemas";

export type PortalOpts = {
  returnUrl?: string;
  teamId?: string;
};

export async function createBillingPortalSession(
  opts: PortalOpts = {},
  ctx: ApiClientContext = {},
): Promise<BillingPortalResponse> {
  return fetchJson(
    "/v1/billing/portal",
    BillingPortalResponseSchema,
    {
      method: "POST",
      body: JSON.stringify({
        return_url: opts.returnUrl,
        team_id: opts.teamId,
      }),
    },
    ctx,
  );
}
