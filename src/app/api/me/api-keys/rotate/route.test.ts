import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { __setServerAuthImplForTests } from "@/lib/auth/server";

const setMock = vi.fn();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: setMock,
    get: () => undefined,
    delete: () => {},
  }),
}));

import { POST, PROVISIONED_COOKIE } from "./route";

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  setMock.mockReset();
});
afterAll(() => server.close());

beforeEach(() => {
  process.env.NEXT_PUBLIC_LOGIONOS_API_BASE = "http://api.test";
});

const signedIn = {
  getServerAuth: async () => ({
    userId: "u_1",
    getToken: async () => "jwt-t",
  }),
};

describe("POST /api/me/api-keys/rotate", () => {
  it("returns 401 when signed out", async () => {
    __setServerAuthImplForTests({ getServerAuth: async () => null });
    const res = await POST();
    expect(res.status).toBe(401);
    __setServerAuthImplForTests(null);
  });

  it("forwards the rotated plaintext key and sets the provisioned cookie", async () => {
    __setServerAuthImplForTests(signedIn);
    server.use(
      http.post("http://api.test/v1/me/api-keys/rotate", ({ request }) => {
        expect(request.headers.get("authorization")).toBe("Bearer jwt-t");
        return HttpResponse.json(
          {
            api_key: "sk_live_newkey",
            key_prefix: "sk_live_",
            created_at: "2026-01-01T00:00:00Z",
          },
          { status: 200 },
        );
      }),
    );
    const res = await POST();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { api_key: string };
    expect(body.api_key).toBe("sk_live_newkey");
    expect(setMock).toHaveBeenCalledOnce();
    const [cookieName, cookieValue] = setMock.mock.calls[0] as [string, string];
    expect(cookieName).toBe(PROVISIONED_COOKIE);
    expect(cookieValue).toBe("1");
    __setServerAuthImplForTests(null);
  });

  it("forwards upstream 402 feature-gated response", async () => {
    __setServerAuthImplForTests(signedIn);
    server.use(
      http.post(
        "http://api.test/v1/me/api-keys/rotate",
        () => HttpResponse.json({ detail: "upgrade required" }, { status: 402 }),
      ),
    );
    const res = await POST();
    expect(res.status).toBe(402);
    __setServerAuthImplForTests(null);
  });
});
