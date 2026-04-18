import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { apiFetch, fetchJson } from "./client";
import {
  ApiError,
  AuthError,
  FeatureGatedError,
  NotFoundError,
  RateLimitError,
} from "./errors";

function makeFetch(
  resInit: { status: number; body?: unknown; headers?: Record<string, string> },
) {
  const body =
    typeof resInit.body === "string"
      ? resInit.body
      : JSON.stringify(resInit.body ?? {});
  const headers = new Headers({
    "content-type": "application/json",
    ...(resInit.headers ?? {}),
  });
  const impl: typeof fetch = async () =>
    new Response(body, { status: resInit.status, headers });
  return vi.fn<typeof fetch>(impl);
}

const baseCtx = {
  baseUrl: "http://api.test",
  getToken: async () => "jwt-abc",
};

describe("apiFetch", () => {
  it("injects the Authorization header and returns Response on 2xx", async () => {
    const fetchImpl = makeFetch({ status: 200, body: { ok: true } });
    const res = await apiFetch("/v1/ping", { method: "GET" }, { ...baseCtx, fetchImpl });
    expect(res.status).toBe(200);
    const call = fetchImpl.mock.calls[0];
    const headers = (call[1] as RequestInit).headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer jwt-abc");
  });

  it("throws AuthError on 401", async () => {
    const fetchImpl = makeFetch({
      status: 401,
      body: { detail: "Unauthorized" },
    });
    await expect(
      apiFetch("/v1/x", {}, { ...baseCtx, fetchImpl }),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("throws FeatureGatedError on 402", async () => {
    const fetchImpl = makeFetch({
      status: 402,
      body: { detail: "Upgrade required", feature: "pdf_export" },
    });
    const err = await apiFetch("/v1/x", {}, { ...baseCtx, fetchImpl }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(FeatureGatedError);
    expect((err as FeatureGatedError).feature).toBe("pdf_export");
  });

  it("throws FeatureGatedError on 403 when upgrade_url is present", async () => {
    const fetchImpl = makeFetch({
      status: 403,
      body: { detail: "Forbidden", upgrade_url: "https://billing.test/upgrade" },
    });
    const err = await apiFetch("/v1/x", {}, { ...baseCtx, fetchImpl }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(FeatureGatedError);
    expect((err as FeatureGatedError).upgradeUrl).toBe(
      "https://billing.test/upgrade",
    );
  });

  it("throws generic ApiError on bare 403", async () => {
    const fetchImpl = makeFetch({ status: 403, body: { detail: "nope" } });
    const err = await apiFetch("/v1/x", {}, { ...baseCtx, fetchImpl }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect(err).not.toBeInstanceOf(FeatureGatedError);
    expect((err as ApiError).status).toBe(403);
  });

  it("throws NotFoundError on 404", async () => {
    const fetchImpl = makeFetch({ status: 404, body: {} });
    await expect(
      apiFetch("/v1/x", {}, { ...baseCtx, fetchImpl }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws RateLimitError on 429 and parses retry-after", async () => {
    const fetchImpl = makeFetch({
      status: 429,
      body: { detail: "slow" },
      headers: { "retry-after": "42" },
    });
    const err = await apiFetch("/v1/x", {}, { ...baseCtx, fetchImpl }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfterSec).toBe(42);
  });

  it("throws ApiError on 500", async () => {
    const fetchImpl = makeFetch({ status: 500, body: { detail: "boom" } });
    const err = await apiFetch("/v1/x", {}, { ...baseCtx, fetchImpl }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
  });

  it("forwards extraHeaders like X-Admin-Key", async () => {
    const fetchImpl = makeFetch({ status: 200, body: { ok: true } });
    await apiFetch(
      "/v1/admin/x",
      {},
      {
        ...baseCtx,
        fetchImpl,
        extraHeaders: { "X-Admin-Key": "abc" },
      },
    );
    const call = fetchImpl.mock.calls[0];
    const headers = (call[1] as RequestInit).headers as Headers;
    expect(headers.get("x-admin-key")).toBe("abc");
  });
});

describe("fetchJson", () => {
  it("validates the response against the zod schema", async () => {
    const schema = z.object({ hello: z.string() });
    const fetchImpl = makeFetch({ status: 200, body: { hello: "world" } });
    const out = await fetchJson("/v1/hi", schema, {}, { ...baseCtx, fetchImpl });
    expect(out.hello).toBe("world");
  });

  it("throws ApiError when the response shape is wrong", async () => {
    const schema = z.object({ hello: z.string() });
    const fetchImpl = makeFetch({ status: 200, body: { hello: 42 } });
    const err = await fetchJson("/v1/hi", schema, {}, { ...baseCtx, fetchImpl }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe("schema_mismatch");
  });
});
