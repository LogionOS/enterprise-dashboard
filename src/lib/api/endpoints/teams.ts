import { fetchJson, type ApiClientContext } from "../client";
import { TeamAdminRowSchema, type TeamAdminRow } from "../schemas";
import { z } from "zod";

export async function listAdminTeams(
  ctx: ApiClientContext,
): Promise<TeamAdminRow[]> {
  const schema = z.object({ items: z.array(TeamAdminRowSchema) });
  const res = await fetchJson(
    "/v1/admin/teams",
    schema,
    { method: "GET" },
    ctx,
  );
  return res.items;
}

// Team settings -- the API may not expose this yet in Phase 1. The function
// exists so the settings page has a typed call site; it will 404 gracefully
// via NotFoundError until the API lands E-stream team-settings work.
export type TeamSettingsPayload = {
  name?: string;
  default_target_venues?: string[];
  timezone?: string;
};

export async function updateTeamSettings(
  teamId: string,
  payload: TeamSettingsPayload,
  ctx: ApiClientContext = {},
): Promise<{ ok: boolean }> {
  const schema = z.object({ ok: z.boolean() });
  return fetchJson(
    `/v1/admin/teams/${encodeURIComponent(teamId)}/settings`,
    schema,
    { method: "PATCH", body: JSON.stringify(payload) },
    ctx,
  );
}
