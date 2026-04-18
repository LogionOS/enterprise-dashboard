import { fetchJson, type ApiClientContext } from "../client";
import {
  ApiKeyRotateResponseSchema,
  type ApiKeyRotateResponse,
} from "../schemas";

export async function rotateMyApiKey(
  ctx: ApiClientContext = {},
): Promise<ApiKeyRotateResponse> {
  return fetchJson(
    "/v1/me/api-keys/rotate",
    ApiKeyRotateResponseSchema,
    { method: "POST", body: JSON.stringify({}) },
    ctx,
  );
}
