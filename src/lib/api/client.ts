import { z } from "zod";
import {
  ApiError,
  AuthError,
  FeatureGatedError,
  NotFoundError,
  RateLimitError,
} from "./errors";
import { ApiErrorShapeSchema } from "./schemas";

// The ONE place in the Dashboard that talks HTTP to LogionOS-API. Feature
// pages must import typed functions from `./endpoints/*` ? they must NOT
// call `fetch` directly. Everything else in this file is private.

export type TokenGetter = () => Promise<string | null>;

export type ApiClientContext = {
  baseUrl?: string;
  getToken?: TokenGetter;
  // Extra headers, e.g. `X-Admin-Key` for superuser routes. Never persisted;
  // the caller assembles them per-request on the server side.
  extraHeaders?: Record<string, string>;
  fetchImpl?: typeof fetch;
};

export function getApiBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_LOGIONOS_API_BASE ||
    process.env.LOGIONOS_API_BASE ||
    "https://logionos-api.onrender.com";
  return url.replace(/\/$/, "");
}

// NOTE: there is deliberately no default-token fallback here. Every caller
// (server page, server route, client hook) explicitly passes `getToken` via
// `ctx`. Server code composes it with `serverApiCtx()` from `./server`;
// client code composes it with `useClientToken()`. Keeping this file free of
// any `@/lib/auth/server` import is what keeps `node:async_hooks` out of the
// browser bundle.

function parseRetryAfter(h: string | null): number | undefined {
  if (!h) return undefined;
  const n = Number(h);
  return Number.isFinite(n) ? n : undefined;
}

async function readBodySafe(res: Response): Promise<unknown> {
  try {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) return await res.json();
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  } catch {
    return null;
  }
}

async function raiseForStatus(res: Response, path: string): Promise<never> {
  const body = await readBodySafe(res);
  const parsed = ApiErrorShapeSchema.safeParse(body ?? {});
  const shape = parsed.success ? parsed.data : {};
  const detail =
    typeof shape.detail === "string"
      ? shape.detail
      : shape.message ??
        (res.statusText || `Request failed (${res.status})`);

  switch (res.status) {
    case 401:
      throw new AuthError(detail, { path, detail: body, code: shape.code });
    case 402:
      throw new FeatureGatedError(detail, {
        path,
        detail: body,
        code: shape.code,
        feature: shape.feature,
        upgradeUrl: shape.upgrade_url,
      });
    case 403: {
      // 403 from the API is used both for "feature gated" (when plan lacks
      // the feature) and "forbidden" (RBAC). Discriminate on the upgrade_url
      // field which our API sets only for plan gates.
      if (shape.upgrade_url || shape.feature) {
        throw new FeatureGatedError(detail, {
          status: 403,
          path,
          detail: body,
          code: shape.code,
          feature: shape.feature,
          upgradeUrl: shape.upgrade_url,
        });
      }
      throw new ApiError(detail, {
        status: 403,
        path,
        detail: body,
        code: shape.code,
      });
    }
    case 404:
      throw new NotFoundError(detail, { path, detail: body, code: shape.code });
    case 429:
      throw new RateLimitError(detail, {
        path,
        detail: body,
        code: shape.code,
        retryAfterSec: parseRetryAfter(res.headers.get("retry-after")),
      });
    default:
      throw new ApiError(detail, {
        status: res.status,
        path,
        detail: body,
        code: shape.code,
      });
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  ctx: ApiClientContext = {},
): Promise<Response> {
  const baseUrl = ctx.baseUrl ?? getApiBaseUrl();
  const getToken = ctx.getToken;
  const fetchImpl = ctx.fetchImpl ?? fetch;

  const headers = new Headers(init.headers ?? {});
  if (!headers.has("accept")) headers.set("accept", "application/json");
  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (ctx.extraHeaders) {
    for (const [k, v] of Object.entries(ctx.extraHeaders)) headers.set(k, v);
  }

  let token: string | null = null;
  if (getToken) {
    try {
      token = await getToken();
    } catch {
      token = null;
    }
  }
  if (token) headers.set("authorization", `Bearer ${token}`);

  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const res = await fetchImpl(url, { ...init, headers });
  if (!res.ok) await raiseForStatus(res, path);
  return res;
}

export async function fetchJson<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit = {},
  ctx: ApiClientContext = {},
): Promise<T> {
  const res = await apiFetch(path, init, ctx);
  const body = await readBodySafe(res);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError("API returned an unexpected response shape", {
      status: res.status,
      path,
      detail: parsed.error.format(),
      code: "schema_mismatch",
    });
  }
  return parsed.data;
}

export async function fetchBlob(
  path: string,
  init: RequestInit = {},
  ctx: ApiClientContext = {},
): Promise<Response> {
  return apiFetch(path, init, ctx);
}
